import { FORMATS, Point, Sprite, Texture } from 'pixi.js'
import PF from 'pathfinding'
import { WorkerManager } from './WorkerManager'
import { useResourceState } from '~/states/modules/resource_state'

const decoder = new TextDecoder('utf-8')

const { resourcesState } = useResourceState()

class Block {
    ownMasks: Array<number>
    offset: number
    jpegOffset: number
    jpegSize: number
    texture: Texture | null
    RGB: Uint8Array
    PNG = false
    requested = false
    decoded = false
    loaded = false

    constructor() {
        this.ownMasks = []
        this.offset = 0
        this.jpegOffset = 0
        this.jpegSize = 0
    }
}

class Mask {
    offset: number
    x: number
    y: number
    z: number
    width: number
    height: number
    size: number
    texture: Texture | null
    requested = false
    loaded = false
    sort_table: Array<number>
    sample_gap = 10

    constructor() {
        this.offset = 0
        this.x = 0
        this.y = 0
        this.width = 0
        this.height = 0
        this.size = 0
        this.sort_table = []
    }

    calc_sort_z(x: number, y: number) {
        if (this.sort_table.length <= 0)
            return false
        if (y > this.y && y < this.z) {
            if (x > this.x - 20 && x < this.x + this.width + 20) {
                const rx = x - this.x
                const ry = y - this.y
                if (rx >= 0 && rx < this.width)
                    return ry > this.sort_table[Math.floor(rx / 10)]

                else if (rx < 0)
                    return ry > this.sort_table[0]

                else
                    return ry > this.sort_table[this.sort_table.length - 1]
            }
        }
        return false
    }
}

export class MapX {
    id: string
    wm: WorkerManager | null
    path: string | null
    handle: FileSystemFileHandle | undefined
    buf: ArrayBuffer
    offset: number

    flag: string
    width: number
    height: number

    block_width = 320
    block_height = 240

    row_num: number
    col_num: number
    block_num: number

    cell_row_num: number
    cell_col_num: number
    cell: Array<Array<number>>
    grid: PF.Grid
    astar = new PF.AStarFinder({
        diagonalMovement: PF.DiagonalMovement.Never
    })

    blocks: Array<Block>
    masks: Array<Mask>
    no_repeat: { [key: string]: any }
    jpeg_head: ArrayBuffer

    constructor(path: string) {
        this.id = Math.random().toString()
        this.wm = WorkerManager.getInstance()
        this.wm.register(this)
        this.path = path
        this.handle = resourcesState.resources.get(this.path)
        this.offset = 0
        this.blocks = []
        this.masks = []
        this.cell = []
        this.no_repeat = {}
    }

    destroy() {
        this.path = null
        this.handle = undefined
        this.offset = 0
        this.blocks = []
        this.masks = []
        if (this.wm)
            this.wm.remove(this)
        this.wm = null
    }

    receive(event: any) {
        if (event.data.id && this.id === event.data.id) {
            if (event.data.method === 'jpeg') {
                this.blocks[event.data.blockIndex].decoded = true
                this.blocks[event.data.blockIndex].RGB = event.data.data
                this.blocks[event.data.blockIndex].texture = Texture.fromBuffer(
                    event.data.data,
                    320,
                    240,
                    { format: FORMATS.RGB }
                )
            }
            else if (event.data.method === 'mask') {
                const mask = this.masks[event.data.maskIndex]
                mask.texture = Texture.fromBuffer(
                    event.data.data,
                    mask.width,
                    mask.height,
                    { format: FORMATS.RGBA }
                )
                const calc_sort_point = (x: number) => {
                    let top = 0
                    let bottom = mask.height - 1
                    let mid = Math.floor((top + bottom) / 2)
                    while (bottom - top > 1) {
                        mid = Math.floor((top + bottom) / 2)
                        const pos = (mask.width * mid + x) * 4 + 3
                        if (event.data.data[pos] === 1)
                            bottom = mid

                        else
                            top = mid
                    }
                    return mid + 1
                }
                for (let x = 0; x <= mask.width; x += mask.sample_gap)
                    mask.sort_table.push(calc_sort_point(x))
            }
        }
    }

    async setup() {
        if (this.handle) {
            const file = await this.handle.getFile()
            this.buf = await file.arrayBuffer()
            // let map_head_buf: ArrayBuffer | null = await this.file.slice(0, 12).arrayBuffer()

            this.flag = this.readBufToStr(0, 4)

            if (this.flag !== 'XPAM' && this.flag !== '0.1M') {
                console.error(`Incorrect Map Format: ${this.path}`)
                return
            }
            this.width = this.readBufToU32(4)
            this.height = this.readBufToU32(8)

            this.row_num = Math.ceil(this.height / this.block_height)
            this.col_num = Math.ceil(this.width / this.block_width)
            this.block_num = this.row_num * this.col_num

            this.cell_row_num = this.height / 20
            this.cell_row_num = this.cell_row_num % 12 === 0 ? this.cell_row_num : this.cell_row_num + 12 - this.cell_row_num % 12
            this.cell_col_num = this.width / 20
            this.cell_col_num = this.cell_col_num % 16 === 0 ? this.cell_col_num : this.cell_col_num + 16 - this.cell_col_num % 16

            for (let i = 0; i < this.cell_row_num; i++) {
                this.cell.push([])
                for (let j = 0; j < this.cell_col_num; j++)
                    this.cell[i].push(0)
            }
            for (let i = 0; i < this.block_num; i++) {
                const block = new Block()
                block.offset = this.readBufToU32(12 + i * 4)
                this.blocks.push(block)
            }

            let offset = 12 + this.block_num * 4 + 4 // 最后加4是  跳过无用的4字节 旧地图为MapSize  新地图为MASK Flag

            if (this.flag === '0.1M') {
                console.log(`Load M1.0 ${this.path}`)
                const mask_num = this.readBufToU32(offset)
                offset += 4
                for (let i = 0; i < mask_num; i++) {
                    const mask = new Mask()
                    mask.offset = this.readBufToU32(offset + i * 4)
                    mask.x = this.readBufToU32(mask.offset + 0)
                    mask.y = this.readBufToU32(mask.offset + 4)
                    mask.width = this.readBufToU32(mask.offset + 8)
                    mask.height = this.readBufToU32(mask.offset + 12)
                    mask.z = mask.y + mask.height
                    mask.size = this.readBufToU32(mask.offset + 16)
                    mask.offset += 20
                    const mask_row_start = Math.max(Math.floor(mask.y / this.block_height), 0)
                    const mask_row_end = Math.min(Math.floor((mask.y + mask.height) / this.block_height), this.row_num - 1)
                    const mask_col_start = Math.max(Math.floor(mask.x / this.block_width), 0)
                    const mask_col_end = Math.min(Math.floor((mask.x + mask.width) / this.block_width), this.col_num - 1)
                    for (let row = mask_row_start; row <= mask_row_end; row++) {
                        for (let col = mask_col_start; col <= mask_col_end; col++) {
                            const index = row * this.col_num + col
                            if (index >= 0 && index < this.block_num)
                                this.blocks[index].ownMasks.push(i)
                        }
                    }
                    this.masks.push(mask)
                }
                offset += mask_num * 4
            }
            else if (this.flag === 'XPAM') {
                console.log(`Load XPAM ${this.path}`)
                const flag = this.readBufToStr(offset, offset + 4)
                const size = this.readBufToU32(offset + 4)
                offset += 8
                if (flag === 'HGPJ')
                    this.jpeg_head = this.buf.slice(offset, offset + size)
            }
        }
        this.travel()
        this.grid = new PF.Grid(this.cell)
    }

    travel() {
        for (let i = 0; i < this.blocks.length; i++) {
            const block = this.blocks[i]
            let offset = block.offset
            const eat_num = this.readBufToU32(offset)
            offset += 4
            if (this.flag === '0.1M')
                offset += eat_num * 4
            let loop = true
            while (loop) {
                const flag = this.readBufToStr(offset, offset + 4)
                const size = this.readBufToU32(offset + 4)
                offset += 8

                if (flag === 'GEPJ' || flag === '2GPJ') {
                    block.jpegOffset = offset
                    block.jpegSize = size
                    offset += size
                }
                else if (flag.substring(0, 3) === 'GNP') {
                    block.jpegOffset = offset
                    block.jpegSize = size
                    offset += size
                    block.PNG = true
                }
                else if (flag === 'KSAM' || flag === '2SAM') {
                    this.read_old_mask(offset, size, i)
                    offset += size
                }
                else if (flag === 'LLEC') {
                    this.read_cell(offset, size, i)
                    offset += size
                }
                else if (flag === 'GIRB' || flag === 'BLOK' || flag === 'KOLB') {
                    offset += size
                }
                else {
                    loop = false
                }
            }
        }
    }

    read_old_mask(offset: number, size: number, blockIndex: number) {
        const mask = new Mask()
        const row = Math.floor(blockIndex / this.col_num)
        const col = Math.floor(blockIndex % this.col_num)

        mask.offset = offset + 16
        mask.x = this.readBufTo32(offset + 0)
        mask.x = (col * 320) + mask.x
        mask.y = this.readBufTo32(offset + 4)
        mask.y = (row * 240) + mask.y

        mask.width = this.readBufToU32(offset + 8)
        mask.height = this.readBufToU32(offset + 12)
        mask.z = mask.y + mask.height
        mask.size = size - 16

        const key = mask.x * 10000 + mask.y
        if (!(key in this.no_repeat)) {
            const id = Object.keys(this.no_repeat).length
            this.no_repeat[key] = id
            this.blocks[blockIndex].ownMasks.push(id)
            this.masks[id] = mask
        }
        else {
            const id = this.no_repeat[key]
            this.blocks[blockIndex].ownMasks.push(id)
        }
    }

    read_cell(offset: number, size: number, blockIndex: number) {
        const row = Math.floor(blockIndex / this.col_num)
        const col = Math.floor(blockIndex % this.col_num)
        const uint8array = new Uint8Array(this.buf.slice(offset, offset + size))
        let i = 0
        let j = 0
        let count = 0
        while (count < size) {
            const ii = row * 12 + i
            const jj = col * 16 + j
            this.cell[ii][jj] = uint8array[count]
            j++
            if (j >= 16) {
                j = 0
                i++
            }
            count++
        }
    }

    path_find(x1: number, y1: number, x2: number, y2: number) {
        const _x2 = Math.floor(x2 / 20)
        const _y2 = Math.floor(y2 / 20)
        const target = this.get_nearest_valid_point(_x2, _y2)
        const path = this.astar.findPath(Math.floor(x1 / 20), Math.floor(y1 / 20), target[0], target[1], this.grid.clone())
        const newPath = this.smoothenPath(this.grid, path)
        const worldPath = newPath.map(item => new Point(Math.floor(item[0] * 20), Math.floor(item[1] * 20)))
        if (worldPath.length > 0) {
            worldPath[0].x = x1
            worldPath[0].y = y1
            if (this.grid.getNodeAt(_x2, _y2).walkable) {
                worldPath[worldPath.length - 1].x = x2
                worldPath[worldPath.length - 1].y = y2
            }
        }
        return worldPath
    }

    get_nearest_valid_point(x: number, y: number) {
        if (!this.grid.isInside(x, y))
            return [x, y]
        if (this.grid.getNodeAt(x, y).walkable)
            return [x, y]
        const _stack = [[x, y]]
        const been: { [key: string]: any } = {}
        const neighbors = [[-1, -1], [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1]]
        // eslint-disable-next-line no-unmodified-loop-condition
        while (_stack) {
            const _point = _stack.shift()
            if (!_point)
                break
            if (this.grid.getNodeAt(_point[0], _point[1]).walkable)
                return _point
            been[`${_point[0].toString()},${_point[1].toString()}`] = 1
            for (let i = 0; i < neighbors.length; i++) {
                const temp = [_point[0] + neighbors[i][0], _point[1] + neighbors[i][1]]
                if (been[`${temp[0].toString()},${temp[1].toString()}`])
                    continue
                if (this.grid.isInside(temp[0], temp[1])) {
                    _stack.push(temp)
                    been[`${temp[0].toString()},${temp[1].toString()}`] = 1
                }
            }
        }
        return [x, y]
    }

    smoothenPath(grid: any, path: any) {
        const len = path.length
        const x0 = path[0][0] // path start x
        const y0 = path[0][1] // path start y
        const x1 = path[len - 1][0] // path end x
        const y1 = path[len - 1][1] // path end y
        let sx, sy, // current start coordinate
            ex, ey, // current end coordinate
            i, j, coord, line, testCoord, blocked

        sx = x0
        sy = y0
        const newPath = [[sx, sy]]

        for (i = 2; i < len; ++i) {
            coord = path[i]
            ex = coord[0]
            ey = coord[1]
            // @ts-expect-error ???
            line = PF.Util.interpolate(sx, sy, ex, ey)

            blocked = false
            for (j = 1; j < line.length; ++j) {
                testCoord = line[j]

                if (!grid.isWalkableAt(testCoord[0], testCoord[1])) {
                    blocked = true
                    break
                }
            }
            if (blocked) {
                const lastValidCoord = path[i - 1]
                newPath.push(lastValidCoord)
                sx = lastValidCoord[0]
                sy = lastValidCoord[1]
            }
        }
        newPath.push([x1, y1])

        return newPath
    }

    getJpeg(i: number) {
        const block = this.blocks[i]
        let jpeg
        jpeg = this.buf.slice(block.jpegOffset, block.jpegOffset + block.jpegSize)
        let ret
        if (this.flag === 'XPAM') {
            const size = this.jpeg_head.byteLength + block.jpegSize
            const uint8Array = new Uint8Array(size)
            uint8Array.set(new Uint8Array(this.jpeg_head))
            uint8Array.set(new Uint8Array(jpeg), this.jpeg_head.byteLength)

            this.wm?.post({
                method: 'getMapx',
                data: uint8Array,
                blockIndex: i,
                id: this.id
            })

            // const inBuffer = Module._malloc(size)
            // Module.HEAP8.set(uint8Array, inBuffer)
            // const outSize = 320 * 240 * 3
            // const outBuffer = Module._malloc(outSize)

            // Module.ccall("read_map_x",
            //   Boolean,
            //   [Number, Number, Number],
            //   [inBuffer, size, outBuffer])

            // ret = Module.HEAPU8.subarray(outBuffer, outBuffer + outSize)

            // Module._free(inBuffer)
            // Module._free(outBuffer)
        }
        else if (this.flag === '0.1M' && !block.PNG) {
            const uint8Array = new Uint8Array(jpeg)

            this.wm?.post({
                method: block.PNG ? 'getPNG' : 'getJpeg',
                data: uint8Array,
                blockIndex: i,
                id: this.id
            })

            // const inBuffer = Module._malloc(uint8Array.length)
            // Module.HEAP8.set(uint8Array, inBuffer)
            // const outSize = 320 * 240 * 3
            // const outBuffer = Module._malloc(outSize)

            // Module.ccall("read_map_1",
            //   Boolean,
            //   [Number, Number, Number],
            //   [inBuffer, uint8Array.length, outBuffer])

            // ret = Module.HEAPU8.subarray(outBuffer, outBuffer + outSize)
            // Module._free(inBuffer)
            // Module._free(outBuffer)
            // const end1 = performance.now()
        }
        jpeg = null
        block.requested = true
        return ret
    }

    getMask(i: number) {
        if (i >= this.masks.length)
            return
        if (this.masks[i].requested)
            return

        const mask = this.masks[i]

        const offset = mask.offset
        const size = mask.size

        const start_col = Math.floor(mask.x / 320)
        const end_col = Math.floor((mask.x + mask.width) / 320) - ((mask.x + mask.width) % 320 === 0 ? 1 : 0)
        const start_row = Math.floor(mask.y / 240)
        const end_row = Math.floor((mask.y + mask.height) / 240) - ((mask.y + mask.height) % 240 === 0 ? 1 : 0)

        const cross_blocks: Array<number> = []
        for (let row = start_row; row <= end_row; row++) {
            for (let col = start_col; col <= end_col; col++) {
                cross_blocks.push(row * this.col_num + col)
                if (!this.blocks[row * this.col_num + col].decoded)
                    return
            }
        }
        const cross_rgb = new Uint8Array(cross_blocks.length * 230400)
        for (let i = 0; i < cross_blocks.length; i++)
            cross_rgb.set(this.blocks[cross_blocks[i]].RGB, i * 230400)

        let uint8Array
        uint8Array = new Uint8Array(this.buf.slice(offset, offset + size))

        this.wm?.post({
            method: 'getMask',

            data: uint8Array,
            rgb: cross_rgb,
            w: mask.width,
            h: mask.height,
            x: mask.x - start_col * 320,
            y: mask.y - start_row * 240,

            maskIndex: i,
            id: this.id
        })

        // const inBuffer = Module._malloc(size)
        // Module.HEAPU8.set(uint8Array, inBuffer)
        // const outSize = this.masks[i].width * this.masks[i].height
        // const outBuffer = Module._malloc(outSize)

        // Module.ccall("read_mask",
        //     null,
        //     [Number, Number, Number, Number],
        //     [inBuffer, outBuffer, this.masks[i].width, this.masks[i].height])

        // const ret = Module.HEAPU8.slice(outBuffer, outBuffer + outSize)

        // Module._free(inBuffer)
        // Module._free(outBuffer)

        // this.masks[i].texture = Texture.fromBuffer(
        //     ret,
        //     this.masks[i].width,
        //     this.masks[i].height,
        //     { format: FORMATS.ALPHA }
        // )

        uint8Array = null
        this.masks[i].requested = true
    }

    readBufToStr(start: number, end: number): string {
        return decoder.decode(this.buf.slice(start, end))
    }

    readBufToU32(offset: number): number {
        return new Uint32Array(this.buf.slice(offset, offset + 4))[0]
    }

    readBufTo32(offset: number): number {
        return new Int32Array(this.buf.slice(offset, offset + 4))[0]
    }

    readBufToU16(offset: number): number {
        return new Uint16Array(this.buf.slice(offset, offset + 2))[0]
    }

    async readText(file: File, start: number, end: number): Promise<string> {
        const res = await file.slice(start, end).text()
        return res
    }

    async readU32(file: File, offset: number): Promise<number> {
        const buf = await file.slice(offset, offset + 4).arrayBuffer()
        const number = new Uint32Array(buf)[0]
        return number
    }

    async readU16(file: File, offset: number): Promise<number> {
        const buf = await file.slice(offset, offset + 2).arrayBuffer()
        const number = new Uint16Array(buf)[0]
        return number
    }
}

export async function getMapX(path: string): Promise<MapX> {
    const map_x = new MapX(path)
    await map_x.setup()
    return map_x
}

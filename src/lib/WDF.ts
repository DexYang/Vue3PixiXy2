import { WorkerManager } from './WorkerManager'
import { WAS } from './WAS'
import { useResourceState } from '~/states/modules/resource_state'
import '~/main'

const { resourcesState } = useResourceState()

const decoder = new TextDecoder('utf-8')

class Item {
    hash: number
    offset: number
    size: number
    spaces: number
}

export class WDF {
    id: string
    wm: WorkerManager | null
    path: string | null
    handle: FileSystemFileHandle | undefined
    file: File

    n: number
    map: Map<number, Item>

    constructor(path: string) {
        this.id = Math.random().toString()
        this.wm = WorkerManager.getInstance()
        this.wm.register(this)
        this.path = path
        this.handle = resourcesState.resources.get(this.path)
    }

    async setup() {
        if (this.handle) {
            this.file = await this.handle.getFile()
            let buf: ArrayBuffer | null = await this.file.slice(0, 12).arrayBuffer()
            const flag = this.readBufToStr(buf, 0, 4)
            if (flag !== 'PFDW') {
                console.log(`Incorrect WDF Format: ${this.path}`)
                return
            }
            this.n = this.readBufToU32(buf, 4)
            const offset = this.readBufToU32(buf, 8)

            const file = this.file.slice(offset, offset + this.n * 16)
            buf = await file.arrayBuffer()
            this.map = new Map<number, Item>()
            for (let i = 0; i < this.n; i++) {
                const item = new Item()
                item.hash = this.readBufToU32(buf, i * 16)
                item.offset = this.readBufToU32(buf, i * 16 + 4)
                item.size = this.readBufToU32(buf, i * 16 + 8)
                item.spaces = this.readBufToU32(buf, i * 16 + 12)
                this.map.set(item.hash, item)
            }
            buf = null
        }
    }

    async get(hash: number) {
        const item = this.map.get(hash)
        if (item === undefined)
            return

        const file = this.file.slice(item.offset, item.offset + item.size)
        const buf: ArrayBuffer | null = await file.arrayBuffer()
        if (this.readBufToStr(buf, 0, 2) === 'SP') { // TCP TCA WAS
            return new WAS(buf)
        }

        return buf
    }

    readBufToStr(buf: ArrayBuffer, start: number, end: number): string {
        return decoder.decode(buf.slice(start, end))
    }

    readBufToU32(buf: ArrayBuffer, offset: number): number {
        return new Uint32Array(buf.slice(offset, offset + 4))[0]
    }
}

export async function getWDF(path: string): Promise<WDF> {
    const wdf = new WDF(path)
    await wdf.setup()
    return wdf
}

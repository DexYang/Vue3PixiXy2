import { Texture, FORMATS, FrameObject } from "pixi.js"


const decoder = new TextDecoder("utf-8")

export class Frame implements FrameObject {
    texture: Texture
    time: number
}


export class WAS {
    buf: ArrayBuffer

    flag: string
    head_size: number
  
    direction_num: number
    frame_num: number

    pic_num: number

    width: number
    height: number

    x: number
    y: number

    pal: ArrayBuffer
    pic_offsets: Array<number>
    frames: Array<Array<Frame>>
    seq: Array<number>

    constructor(buf: ArrayBuffer) {
        this.buf = buf
        this.flag = this.readBufToStr(buf, 0, 2)
        this.head_size = this.readBufToU16(buf, 2)

        this.direction_num = this.readBufToU16(buf, 4)
        this.frame_num = this.readBufToU16(buf, 6)
        this.pic_num = this.direction_num * this.frame_num

        this.width = this.readBufToU16(buf, 8)
        this.height = this.readBufToU16(buf, 10)
        this.x = this.readBufToU16(buf, 12)
        this.y = this.readBufToU16(buf, 14)

        let offset = 16
        if (this.head_size > 12) {
            this.seq = []
            for (let i = 0; i < this.head_size - 12; i++) 
                this.seq.push(this.readBufToU8(buf, offset + i))
        }
      
        offset += this.head_size - 12

        this.pal = buf.slice(offset, offset + 512)
        offset += 512
        this.pal = this.convertPal()

        this.pic_offsets = []
        for (let i = 0; i < this.pic_num; i++) {
            const _offset = this.readBufToU32(buf, offset + i * 4)
            if (_offset)
                this.pic_offsets.push(_offset + 4 + this.head_size)
            else
                this.pic_offsets.push(_offset)
        }
    }

    getPal() {
        return this.pal
    }

    readFrames(duration = 100, pal = this.pal) {
        this.frames = []
        const palBuffer = Module._malloc(256 * 4)
        Module.HEAPU8.set(pal, palBuffer)

        for (let i = 0; i < this.direction_num; i++) {
            this.frames.push([])
            for (let j = 0; j < this.frame_num; j++) {
                const index = i * this.frame_num + j
                const frame_offset = this.pic_offsets[index]
                if (frame_offset === 0) {
                    this.frames[i].push(this.frames[i][this.frames[i].length - 1])
                    continue
                } 
                const frame = new Frame()
                const x = this.readBufTo32(this.buf, frame_offset)
                const y = this.readBufTo32(this.buf, frame_offset + 4)
                const w = this.readBufToU32(this.buf, frame_offset + 8)
                const h = this.readBufToU32(this.buf, frame_offset + 12)

                let frame_size
                if (index < this.pic_num - 1) {
                    frame_size = this.pic_offsets[index + 1] - this.pic_offsets[index]
                } else {
                    frame_size = this.buf.byteLength - this.pic_offsets[index]
                }

                if (frame_size <= 0) {
                    frame_size = this.buf.byteLength - this.pic_offsets[index]
                }
                const frame_buf = this.buf.slice(frame_offset, frame_offset + 16 + frame_size)

                frame.texture = Texture.fromBuffer(
                    this.readFrame(frame_buf, palBuffer, w, h),
                    w,
                    h,
                    { format: FORMATS.RGBA }
                )
                frame.time = this.seq && this.seq.length > 0 ? duration * this.seq[j] : duration
        
                frame.texture.defaultAnchor.set(x / w, y / h)

                this.frames[i].push(frame)
            }
        } 
        Module._free(palBuffer)
        return this.frames
    }

    readFrame(buf: ArrayBuffer, palBuffer: number, w: number, h: number) {
        const uint8Array = new Uint8Array(buf)
        const inBuffer = Module._malloc(buf.byteLength)
        Module.HEAP8.set(uint8Array, inBuffer)
        const outSize = w * h * 4
        const outBuffer = Module._malloc(outSize)

        Module.ccall("read_frame", 
            null,
            [Number, Number, Number],
            [inBuffer, palBuffer, outBuffer])

        const res = Module.HEAPU8.slice(outBuffer, outBuffer + outSize)

        Module._free(inBuffer)
        Module._free(outBuffer)

        return res
    }

    convertPal() {
        const uint8Array = new Uint8Array(this.pal)
        const inBuffer = Module._malloc(uint8Array.length)
        Module.HEAPU8.set(uint8Array, inBuffer)
        const outSize = 256 * 4
        const outBuffer = Module._malloc(outSize)

        Module.ccall("read_color_pal", 
            null,
            [Number, Number],
            [inBuffer, outBuffer])

        const res = Module.HEAPU8.slice(outBuffer, outBuffer + outSize)

        Module._free(inBuffer)
        Module._free(outBuffer)

        return res
    }

    readBufToStr(buf: ArrayBuffer, start: number, end: number): string {
        return decoder.decode(buf.slice(start, end))
    }

    readBufToU32(buf: ArrayBuffer, offset: number): number {
        return new Uint32Array(buf.slice(offset, offset + 4))[0]
    }

    readBufTo32(buf: ArrayBuffer, offset: number): number {
        return new Int32Array(buf.slice(offset, offset + 4))[0]
    }

    readBufToU16(buf: ArrayBuffer, offset: number): number {
        return new Uint16Array(buf.slice(offset, offset + 2))[0]
    }

    readBufToU8(buf: ArrayBuffer, offset: number): number {
        return new Uint8Array(buf.slice(offset, offset + 1))[0]
    }
}
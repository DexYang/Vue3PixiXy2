/* eslint-disable no-undef */
importScripts("wasmxy2.js")

onmessage = function (event) {
    const method = event.data.method
    if (method === "getMapx") {
        const data = decodeJpeg(event.data.data, "read_map_x")
        this.postMessage({ data: data, method: "jpeg", id: event.data.id, blockIndex: event.data.blockIndex})
    } else if (method === "getJpeg") {
        const data = decodeJpeg(event.data.data, "read_map_1")
        this.postMessage({ data: data, method: "jpeg", id: event.data.id, blockIndex: event.data.blockIndex})
    } else if (method === "getMask") {
        const data = decodeMask(event.data)
        this.postMessage({ data: data, method: "mask", id: event.data.id, maskIndex: event.data.maskIndex})
    }
}

function decodeJpeg(data, method) {
    const inBuffer = Module._malloc(data.byteLength)
    Module.HEAPU8.set(data, inBuffer)
    const outSize = 320 * 240 * 3
    const outBuffer = Module._malloc(outSize)

    Module.ccall(method, 
        Boolean,
        [Number, Number, Number],
        [inBuffer, data.length, outBuffer])

    ret = Module.HEAPU8.slice(outBuffer, outBuffer + outSize)

    Module._free(inBuffer)
    Module._free(outBuffer)
    return ret
}

function decodeMask({data, w, h, x, y, rgb}) {
    const rgbBuffer = Module._malloc(rgb.length)
    Module.HEAPU8.set(rgb, rgbBuffer)

    const inBuffer = Module._malloc(data.byteLength)
    Module.HEAPU8.set(data, inBuffer)

    const outSize = Math.floor(w * h * 4)
    const outBuffer = Module._malloc(outSize)
    
    Module.ccall("read_mask", 
        null,
        [Number, Number, Number, Number, Number, Number, Number],
        [inBuffer, outBuffer, rgbBuffer, x, y, w, h])

    ret = Module.HEAPU8.slice(outBuffer, outBuffer + outSize)

    Module._free(inBuffer)
    Module._free(outBuffer)
    Module._free(rgbBuffer)
    return ret
}
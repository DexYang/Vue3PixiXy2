#include <stdio.h>
#include <stdbool.h>
#include <emscripten/emscripten.h>
#include "mapx.cpp"
#include "tcp.cpp"


#ifdef __cplusplus
extern "C" {
#endif
bool EMSCRIPTEN_KEEPALIVE read_map_x(uint8_t* in, uint32_t inSize, uint8_t* out) {
    return decode_map_jpeg(in, inSize, out, true);
}

bool EMSCRIPTEN_KEEPALIVE read_map_1(uint8_t* in, uint32_t inSize, uint8_t* out) {
    uint32_t repairedSize = 0;
    jpeg_repair(in, inSize, out, &repairedSize);
    return decode_map_jpeg(out, repairedSize, out, false);
}

void EMSCRIPTEN_KEEPALIVE read_mask(uint8_t* in, uint8_t* out, uint8_t* rgb, uint32_t x, uint32_t y, uint32_t width, uint32_t height) {
    decode_mask(in, out, rgb, x, y, width, height);
}

void EMSCRIPTEN_KEEPALIVE read_mask_blend(uint8_t* in, uint8_t* out, uint32_t width, uint32_t height) {
    decode_mask_blend(in, out, width, height);
}

void EMSCRIPTEN_KEEPALIVE get_hash(char* p, uint32_t* out) {
    *out = StringId(StringAdjust(p));
}

void EMSCRIPTEN_KEEPALIVE read_color_pal(uint8_t* in, uint8_t* out) {
    readColorPal(in, out);
}

void EMSCRIPTEN_KEEPALIVE read_frame(uint8_t* in, uint8_t* pal, uint8_t* out) {
    readFrame(in, (uint32_t*)pal, out);
}

#ifdef __cplusplus
}
#endif
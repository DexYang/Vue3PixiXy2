#include <memory>
#include <stdio.h>
#include <stdbool.h>
#include <emscripten/emscripten.h>
#include "ujpeg.cpp"

uJPEG m_ujpeg = uJPEG();

bool decode_map_jpeg(uint8_t* in, uint32_t inSize, uint8_t* out, bool mapx) {
    if (!m_ujpeg.decode(in, inSize, mapx))
        return false;
    if (!m_ujpeg.isValid())
        return false;
    m_ujpeg.getImage(out);
	return true;
}

void byte_swap(uint16_t& value) {
	uint16_t tempvalue = value >> 8;
	value = (value << 8) | tempvalue;
}

void jpeg_repair(uint8_t* Buffer, uint32_t inSize, uint8_t* outBuffer, uint32_t* outSize) {
	// JPEG数据处理原理
	// 1、复制D8到D9的数据到缓冲区中
	// 2、删除第3、4个字节 FFA0
	// 3、修改FFDA的长度00 09 为 00 0C
	// 4、在FFDA数据的最后添加00 3F 00
	// 5、替换FFDA到FF D9之间的FF数据为FF 00

	uint32_t TempNum = 0; // 临时变量，表示已读取的长度
	uint16_t TempTimes = 0; // 临时变量，表示循环的次数
	uint32_t Temp = 0;
	bool break_while = false;

	// 当已读取数据的长度小于总长度时继续
	while (!break_while && TempNum < inSize && *Buffer++ == 0xFF) {
		*outBuffer++ = 0xFF;
		TempNum++;
		switch (*Buffer) {
		case 0xD8:
			*outBuffer++ = 0xD8;
			Buffer++;
			TempNum++;
			break;
		case 0xA0:
			Buffer++;
			outBuffer--;
			TempNum++;
			break;
		case 0xC0:
			*outBuffer++ = 0xC0;
			Buffer++;
			TempNum++;

			memcpy(&TempTimes, Buffer, sizeof(uint16_t)); // 读取长度
			byte_swap(TempTimes); // 将长度转换为Intel顺序

			for (int i = 0; i < TempTimes; i++) {
				*outBuffer++ = *Buffer++;
				TempNum++;
			}

			break;
		case 0xC4:
			*outBuffer++ = 0xC4;
			Buffer++;
			TempNum++;
			memcpy(&TempTimes, Buffer, sizeof(uint16_t)); // 读取长度
			byte_swap(TempTimes); // 将长度转换为Intel顺序

			for (int i = 0; i < TempTimes; i++) {
				*outBuffer++ = *Buffer++;
				TempNum++;
			}
			break;
		case 0xDB:
			*outBuffer++ = 0xDB;
			Buffer++;
			TempNum++;

			memcpy(&TempTimes, Buffer, sizeof(uint16_t)); // 读取长度
			byte_swap(TempTimes); // 将长度转换为Intel顺序

			for (int i = 0; i < TempTimes; i++) {
				*outBuffer++ = *Buffer++;
				TempNum++;
			}
			break;
		case 0xDA:
			*outBuffer++ = 0xDA;
			*outBuffer++ = 0x00;
			*outBuffer++ = 0x0C;
			Buffer++;
			TempNum++;

			memcpy(&TempTimes, Buffer, sizeof(uint16_t)); // 读取长度
			byte_swap(TempTimes); // 将长度转换为Intel顺序
			Buffer++;
			TempNum++;
			Buffer++;

			for (int i = 2; i < TempTimes; i++) {
				*outBuffer++ = *Buffer++;
				TempNum++;
			}
			*outBuffer++ = 0x00;
			*outBuffer++ = 0x3F;
			*outBuffer++ = 0x00;
			Temp += 1; // 这里应该是+3的，因为前面的0xFFA0没有-2，所以这里只+1。

			// 循环处理0xFFDA到0xFFD9之间所有的0xFF替换为0xFF00
			for (; TempNum < inSize - 2;) {
				if (*Buffer == 0xFF) {
					*outBuffer++ = 0xFF;
					*outBuffer++ = 0x00;
					Buffer++;
					TempNum++;
					Temp++;
				}
				else {
					*outBuffer++ = *Buffer++;
					TempNum++;
				}
			}
			// 直接在这里写上了0xFFD9结束Jpeg图片.
			Temp--; // 这里多了一个字节，所以减去。
			outBuffer--;
			*outBuffer-- = 0xD9;
			break;
		case 0xD9:
			// 算法问题，这里不会被执行，但结果一样。
			*outBuffer++ = 0xD9;
			TempNum++;
			break;
		case 0xE0:
			break_while = true; // 如果碰到E0,则说明后面的数据不需要修复
			while (TempNum < inSize) {
				*outBuffer++ = *Buffer++;
				TempNum++;
			}
			break;
		default:
			break;
		}
	}
	Temp += inSize;
	*outSize = Temp;
}

size_t decompress_mask(void* in, void* out)
{
	uint8_t* op;
	uint8_t* ip;
	unsigned t;
	uint8_t* m_pos;

	op = (uint8_t*)out;
	ip = (uint8_t*)in;

	if (*ip > 17) {
		t = *ip++ - 17;
		if (t < 4)
			goto match_next;
		do *op++ = *ip++; while (--t > 0);
		goto first_literal_run;
	}

	while (1) {
		t = *ip++;
		if (t >= 16) goto match;
		if (t == 0) {
			while (*ip == 0) {
				t += 255;
				ip++;
			}
			t += 15 + *ip++;
		}

		*(unsigned*)op = *(unsigned*)ip;
		op += 4; ip += 4;
		if (--t > 0)
		{
			if (t >= 4)
			{
				do {
					*(unsigned*)op = *(unsigned*)ip;
					op += 4; ip += 4; t -= 4;
				} while (t >= 4);
				if (t > 0) do *op++ = *ip++; while (--t > 0);
			}
			else do *op++ = *ip++; while (--t > 0);
		}

	first_literal_run:

		t = *ip++;
		if (t >= 16)
			goto match;

		m_pos = op - 0x0801;
		m_pos -= t >> 2;
		m_pos -= *ip++ << 2;

		*op++ = *m_pos++; *op++ = *m_pos++; *op++ = *m_pos;

		goto match_done;

		while (1)
		{
		match:
			if (t >= 64)
			{

				m_pos = op - 1;
				m_pos -= (t >> 2) & 7;
				m_pos -= *ip++ << 3;
				t = (t >> 5) - 1;

				goto copy_match;

			}
			else if (t >= 32)
			{
				t &= 31;
				if (t == 0) {
					while (*ip == 0) {
						t += 255;
						ip++;
					}
					t += 31 + *ip++;
				}

				m_pos = op - 1;
				m_pos -= (*(unsigned short*)ip) >> 2;
				ip += 2;
			}
			else if (t >= 16) {
				m_pos = op;
				m_pos -= (t & 8) << 11;
				t &= 7;
				if (t == 0) {
					while (*ip == 0) {
						t += 255;
						ip++;
					}
					t += 7 + *ip++;
				}
				m_pos -= (*(unsigned short*)ip) >> 2;
				ip += 2;
				if (m_pos == op)
					goto eof_found;
				m_pos -= 0x4000;
			}
			else {
				m_pos = op - 1;
				m_pos -= t >> 2;
				m_pos -= *ip++ << 2;
				*op++ = *m_pos++; *op++ = *m_pos;
				goto match_done;
			}

			if (t >= 6 && (op - m_pos) >= 4) {
				*(unsigned*)op = *(unsigned*)m_pos;
				op += 4; m_pos += 4; t -= 2;
				do {
					*(unsigned*)op = *(unsigned*)m_pos;
					op += 4; m_pos += 4; t -= 4;
				} while (t >= 4);
				if (t > 0) do *op++ = *m_pos++; while (--t > 0);
			}
			else {
			copy_match:
				*op++ = *m_pos++; *op++ = *m_pos++;
				do *op++ = *m_pos++; while (--t > 0);
			}

		match_done:

			t = ip[-2] & 3;
			if (t == 0)	break;

		match_next:
			do *op++ = *ip++; while (--t > 0);
			t = *ip++;
		}
	}

eof_found:
	return (op - (uint8_t*)out);
}


void decode_mask_blend(uint8_t* in, uint8_t* out, uint32_t width, uint32_t height) {
	uint32_t align_width = (width + 3) / 4;	// align 4 bytes
	uint32_t size = align_width * height;
	uint8_t* p = (uint8_t*) malloc(size * 2);
	uint32_t size_temp = decompress_mask((uint8_t*)in, (uint8_t*)p);
	uint32_t compressedMaskPos = 0;
	
	for (uint32_t i = 0; i < height; i++) {
		uint32_t count4 = 0;
		for (uint32_t j = 0; j < width; j++) {

			uint32_t realPos = i * width + j;
			uint8_t byte = (p[compressedMaskPos] >> count4 * 2) & 3;
			out[realPos * 4 + 0] = 0;
			out[realPos * 4 + 1] = 0;
			out[realPos * 4 + 2] = 0;
			out[realPos * 4 + 3] = byte == 3 ? 150 : byte;
			count4++;
			if (count4 >= 4) {
				count4 = 0;
				compressedMaskPos++;
			}
		}
		if (count4 != 0)  compressedMaskPos++;
	}
	free(p);
}


void decode_mask(uint8_t* in, uint8_t* out, uint8_t* rgb, uint32_t x, uint32_t y, uint32_t width, uint32_t height) {
	uint32_t align_width = (width + 3) / 4;	// align 4 bytes
	uint32_t size = align_width * height;
	uint8_t* p = (uint8_t*) malloc(size * 2);
	uint32_t size_temp = decompress_mask((uint8_t*)in, (uint8_t*)p);
	uint32_t compressedMaskPos = 0;
	uint32_t cross_col_num = (x + width) / 320 + ((x + width) % 320 != 0 ? 1 : 0);

	for (uint32_t i = 0; i < height; i++) {
		uint32_t count4 = 0;
		uint32_t block_row = (i + y) / 240;
		uint32_t block_in_y = (i + y) - block_row * 240;
		for (uint32_t j = 0; j < width; j++) {
			uint32_t block_col = (j + x) / 320;
			uint32_t block_in_x = (j + x) - block_col * 320;
			uint32_t block_num = block_row * cross_col_num + block_col;
			uint32_t block_pos = 230400 * block_num + (block_in_y * 320 + block_in_x) * 3;

			uint32_t realPos = i * width + j;
			uint8_t byte = (p[compressedMaskPos] >> count4 * 2) & 3;
			out[realPos * 4 + 0] = rgb[block_pos + 0];
			out[realPos * 4 + 1] = rgb[block_pos + 1];
			out[realPos * 4 + 2] = rgb[block_pos + 2];
			out[realPos * 4 + 3] = byte == 3 ? 150 : byte;
			count4++;
			if (count4 >= 4) {
				count4 = 0;
				compressedMaskPos++;
			}
		}
		if (count4 != 0)  compressedMaskPos++;
	}
	// printf("%d, %d, %d, %d, %d\n", width, height, size, size_temp, compressedMaskPos);
	free(p);
}

struct _PIXEL {
    unsigned char R; // 红色
    unsigned char G; // 绿色
    unsigned char B; // 蓝色
    unsigned char A; // 通道
};

// 帧的文件头
struct FRAME {
    unsigned int Key_X;			// 图片的关键位X
    unsigned int Key_Y;			// 图片的关键位Y
    unsigned int Width;			// 图片的宽度，单位像素
    unsigned int Height;		// 图片的高度，单位像素
};

char* StringAdjust(char* p) {
	int i;
	for (i = 0; p[i]; i++) {
		if (p[i] >= 'A' && p[i] <= 'Z') p[i] += 'a' - 'A';
		else if (p[i] == '/') p[i] = '\\';
	}
	return p;
}

unsigned long StringId(char* str) {
	int i;
	unsigned int v;
	static unsigned m[70];
	strncpy((char*)m, str, 256);
	for (i = 0; i < 256 / 4 && m[i]; i++);
	m[i++] = 0x9BE74448, m[i++] = 0x66F42C48;
	v = 0xF4FA8928;

	unsigned int cf = 0;
	unsigned int esi = 0x37A8470E;
	unsigned int edi = 0x7758B42B;
	unsigned int eax = 0;
	unsigned int ebx = 0;
	unsigned int ecx = 0;
	unsigned int edx = 0;
	unsigned long long temp = 0;
	while (true) {
		// mov ebx, 0x267B0B11
		ebx = 0x267B0B11;
		// rol v, 1
		cf = (v & 0x80000000) > 0 ? 1 : 0;
		v = ((v << 1) & 0xFFFFFFFF) + cf;
		// xor ebx, v
		ebx = ebx ^ v;
		// mov eax, [eax + ecx * 4]
		eax = m[ecx];
		// mov edx, ebx
		edx = ebx;
		// xor esi, eax
		esi = esi ^ eax;
		// xor edi, eax
		edi = edi ^ eax;
		// add edx, edi
		temp = (unsigned long long)edx + (unsigned long long)edi;
		cf = (temp & 0x100000000) > 0 ? 1 : 0;
		edx = temp & 0xFFFFFFFF;
		// or edx, 0x2040801
		edx = edx | 0x2040801;
		// and edx, 0xBFEF7FDF
		edx = edx & 0xBFEF7FDF;
		// mov eax, esi
		eax = esi;
		// mul edx
		temp = (unsigned long long)eax * (unsigned long long)edx;
		eax = temp & 0xffffffff;
		edx = (temp >> 32) & 0xffffffff;
		cf = edx > 0 ? 1 : 0;
		// adc eax, edx
		temp = (unsigned long long)eax + (unsigned long long)edx + (unsigned long long)cf;
		eax = temp & 0xffffffff;
		cf = (temp & 0x100000000) > 0 ? 1 : 0;
		// mov edx, ebx
		edx = ebx;
		// adc eax, 0
		temp = (unsigned long long)eax + (unsigned long long)cf;
		eax = temp & 0xffffffff;
		cf = (temp & 0x100000000) > 0 ? 1 : 0;
		// add edx, esi
		temp = (unsigned long long)edx + (unsigned long long)esi;
		cf = (temp & 0x100000000) > 0 ? 1 : 0;
		edx = temp & 0xFFFFFFFF;
		// or edx, 0x804021
		edx = edx | 0x804021;
		// and edx, 0x7DFEFBFF
		edx = edx & 0x7DFEFBFF;
		// mov esi, eax
		esi = eax;
		// mov eax, edi
		eax = edi;
		// mul edx
		temp = (unsigned long long)eax * (unsigned long long)edx;
		eax = temp & 0xffffffff;
		edx = (temp >> 32) & 0xffffffff;
		cf = edx > 0 ? 1 : 0;
		// add edx, edx
		temp = (unsigned long long)edx + (unsigned long long)edx;
		cf = (temp & 0x100000000) > 0 ? 1 : 0;
		edx = temp & 0xFFFFFFFF;
		// adc eax, edx
		temp = (unsigned long long)eax + (unsigned long long)edx + (unsigned long long)cf;
		eax = temp & 0xffffffff;
		cf = (temp & 0x100000000) > 0 ? 1 : 0;
		// jnc _skip
		if (cf != 0) {
			// add eax, 2
			temp = (unsigned long long)eax + 2;
			cf = (temp & 0x100000000) > 0 ? 1 : 0;
			eax = temp & 0xFFFFFFFF;
		}
		// inc ecx;
		ecx += 1;
		// mov edi, eax
		edi = eax;
		// cmp ecx, i  jnz _loop
		if (ecx - i == 0) break;
	}
	// xor esi, edi
	esi = esi ^ edi;
	// mov v, esi
	v = esi;
	return v;
}

_PIXEL RGB565to888(unsigned short color, unsigned char Alpha) {
	_PIXEL pixel;

	unsigned int r = (color >> 11) & 0x1f;
	unsigned int g = (color >> 5) & 0x3f;
	unsigned int b = (color) & 0x1f;


	pixel.R = (r << 3) | (r >> 2);
	pixel.G = (g << 2) | (g >> 4);
	pixel.B = (b << 3) | (b >> 2);
	pixel.A = Alpha;

	return pixel;
}

void readColorPal(uint8_t* lp, uint8_t* out) {
	unsigned short* short_lp = (unsigned short*)lp;
	_PIXEL* Palette32 = (_PIXEL*) out; // 分配32bit调色板的空间
	for (int k = 0; k < 256; k++) {
		Palette32[k] = RGB565to888(*short_lp++, 0xff); // 16to32调色板转换
	}
}


void readFrame(uint8_t* lp, uint32_t* pal, uint8_t* out) {
	uint8_t* data = (uint8_t*)lp;
	FRAME* frame = (FRAME*)data;

	data += sizeof(FRAME);
	uint32_t* line = (uint32_t*)data; //压缩像素行

	uint32_t linelen, linepos, color, h;
	uint8_t style, alpha, repeat;

	uint32_t PixelCount = frame->Width * frame->Height; // 计算总像素值
	uint32_t* wdata = (uint32_t*) out;
	uint32_t* wdata2 = wdata;
	uint8_t* BP = (uint8_t*)wdata;
	memset(wdata, 0, PixelCount * 4);

	linelen = frame->Width; //行总长度
	linepos = 0;           //记录行长度
	style = 0;
	alpha = 0;  // Alpha
	repeat = 0; // 重复次数
	color = 0;  //重复颜色

	uint8_t* rdata;

	for (h = 0; h < frame->Height; h++) {
		wdata = wdata2 + linepos;
		linepos += linelen;
		rdata = lp + line[h];
		if (!*rdata) {  //法术隔行处理
			if (h > 0 && *(lp + line[h - 1])) {
				memcpy(wdata, wdata - linelen, linelen * 4);
			}
		} else {
			while (*rdata) {  // {00000000} 表示像素行结束，如有剩余像素用透明色代替
				style = (*rdata & 0xC0) >> 6; // 取字节的前两个比特
				switch (style) {
				case 0:   // {00******} 
					if (*rdata & 0x20) {  // {001*****} 表示带有Alpha通道的单个像素
						alpha = ((*rdata++) & 0x1F) << 3; // 0x1f=(11111) 获得Alpha通道的值
						//alpha = (alpha<<3)|(alpha>>2);
						*wdata++ = (pal[*rdata++] & 0xFFFFFF) | (alpha << 24); //合成透明
					} else {  // {000*****} 表示重复n次带有Alpha通道的像素
						repeat = (*rdata++) & 0x1F; // 获得重复的次数
						alpha = (*rdata++) << 3;    // 获得Alpha通道值
						//alpha = (alpha<<3)|(alpha>>2);
						color = (pal[*rdata++] & 0xFFFFFF) | (alpha << 24); //合成透明
						while (repeat)
						{
							*wdata++ = color; //循环固定颜色
							repeat--;
						}
					}
					break;
				case 1:  // {01******} 表示不带Alpha通道不重复的n个像素组成的数据段
					repeat = (*rdata++) & 0x3F; // 获得数据组中的长度
					while (repeat) {
						*wdata++ = pal[*rdata++]; //循环指定颜色
						repeat--;
					}
					break;
				case 2:  // {10******} 表示重复n次像素
					repeat = (*rdata++) & 0x3F; // 获得重复的次数
					color = pal[*rdata++];
					while (repeat) {
						*wdata++ = color;
						repeat--;
					}
					break;
				case 3:  // {11******} 表示跳过n个像素，跳过的像素用透明色代替
					repeat = (*rdata++) & 0x3f; // 获得重复次数
					if (!repeat) { //非常规处理
						//printf("%d,%d,%X,%X\n",*rdata,rdata[1],rdata[2],rdata[3]);//ud->FrameList[id]+line[h]
						if ((wdata[-1] & 0xFFFFFF) == 0 && h > 0) //黑点
							wdata[-1] = wdata[-(int)linelen];
						else
							wdata[-1] = wdata[-1] | 0xFF000000; //边缘
						rdata += 2;
						break;
					}
					wdata += repeat; //跳过
					break;
				}
			}
		}
	}
}


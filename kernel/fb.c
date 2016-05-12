#include "fb.h"


char* fb = (char*) FB_MEMORY_START;


//void fb_write_cell(char c, int i, char fg, char bg) {
void fb_write_cell(unsigned int i, char c, unsigned char fg, unsigned char bg) {


	// TODO: Spit out error.
//	if(i >= FB_WIDTH * FB_HEIGHT) return;

	// Little-endian on x86, so colors first.
	i *= 2;
	fb[i] = ((fg & 0x0F) << 4) | (bg & 0x0F);
	fb[i + 1] = c;
}


void fb_write_cell_xy(char c, char x, char y, char fg, char bg) {
	fb_write_cell(c, y + x * FB_WIDTH, fg, bg);
}


void fb_write_string_xy(char str, char x, char y, char fg, char bg) {
//	int i = 0;
	int start = y + x;
//	fb_write_cell((char) *str, 0, fg, bg);
	fb_write_cell(str, start, fg, bg);

//	while(*str) {
//		fb_write_cell(*str++, start + i, fg, bg);
//		i++;
//	}
}

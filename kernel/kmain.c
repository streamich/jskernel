#include "fb.h"


/* The C function */
int sum_of_three(int arg1, int arg2, int arg3)
{
    return arg1 + arg2 + arg3;
}


void kmain() {
//	char* str = "Hello there";
//	fb_write_cell_xy('O', 0, 0, FB_COLOR_RED, FB_COLOR_WHITE);
//	fb_write_string_xy('G', 0, 0, FB_COLOR_RED, FB_COLOR_WHITE);
//	fb_write_cell('H', 1, FB_COLOR_GREEN, FB_COLOR_WHITE);
//	fb_write_cell('e', 2, FB_COLOR_BLUE, FB_COLOR_WHITE);
//	fb_write_cell('l', 3, FB_COLOR_BLUE, FB_COLOR_WHITE);
//	fb_write_cell('l', 4, FB_COLOR_BLUE, FB_COLOR_WHITE);
//	fb_write_cell(5, 'L', FB_COLOR_BLUE, FB_COLOR_WHITE);

	char* fb = (char*) 0x000B8000;
	fb[8] = 0x12;
	fb[9] = 'F';

}

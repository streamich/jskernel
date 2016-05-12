
#define FB_WIDTH 80
#define FB_HEIGHT 25
#define FB_MEMORY_START 0x000B8000

#define FB_COLOR_BLACK 0
#define FB_COLOR_BLUE 1
#define FB_COLOR_GREEN 2
#define FB_COLOR_CYAN 3
#define FB_COLOR_RED 4
#define FB_COLOR_MAGENTA 5
#define FB_COLOR_BROWN 6
#define FB_COLOR_LIGTH_GREY 7
#define FB_COLOR_DARK_GREY 8
#define FB_COLOR_LIGHT_BLUE 9
#define FB_COLOR_LIGHT_GREEN 10
#define FB_COLOR_LIGHT_CYAN 11
#define FB_COLOR_LIGHT_RED 12
#define FB_COLOR_LIGHT_MAGENTA 13
#define FB_COLOR_LIGHT_BROWN 14
#define FB_COLOR_WHITE 15


//void fb_write_cell(char c, int i, char fg, char bg);
void fb_write_cell(unsigned int i, char c, unsigned char fg, unsigned char bg);
void fb_write_cell_xy(char c, char x, char y, char fg, char bg);
void fb_write_string_xy(char str, char x, char y, char fg, char bg);



export const enum STYLE {
    RESET,

    BOLD,
    DIM,
    ITALIC,
    UNDERLINE,
    BLINK,
    INVERSE,
    HIDDEN,
    STRIKETHROUGH,

    DEFAULT,
    BLACK,
    RED,
    GREEN,
    YELLOW,
    BLUE,
    MAGENTA,
    CYAN,
    WHITE,
    GREY,
    LIGHT_GREY,
    LIGHT_RED,
    LIGHT_GREEN,
    LIGHT_YELLOW,
    LIGHT_BLUE,
    LIGHT_MAGENTA,
    LIGHT_CYAN,

    BG_BLACK,
    BG_RED,
    BG_GREEN,
    BG_YELLOW,
    BG_BLUE,
    BG_MAGENTA,
    BG_CYAN,
    BG_WHITE,
    BG_GREY,
    BG_LIGHT_RED,
    BG_LIGHT_GREEN,
    BG_LIGHT_YELLOW,
    BG_LIGHT_BLUE,
    BG_LIGHT_MAGENTA,
    BG_LIGHT_CYAN,
    BG_LIGHT_GREY,
}

export const CODES = {
    [STYLE.RESET]:          [0, 0],

    [STYLE.BOLD]:           [1, 21],
    [STYLE.DIM]:            [2, 22],
    [STYLE.ITALIC]:         [3, 23],
    [STYLE.UNDERLINE]:      [4, 24],
    [STYLE.BLINK]:          [5, 25],
    [STYLE.INVERSE]:        [7, 27],
    [STYLE.HIDDEN]:         [8, 28],
    [STYLE.STRIKETHROUGH]:  [9, 29],

    [STYLE.DEFAULT]:        [39, 39],
    [STYLE.BLACK]:          [30, 39],
    [STYLE.RED]:            [31, 39],
    [STYLE.GREEN]:          [32, 39],
    [STYLE.YELLOW]:         [33, 39],
    [STYLE.BLUE]:           [34, 39],
    [STYLE.MAGENTA]:        [35, 39],
    [STYLE.CYAN]:           [36, 39],
    [STYLE.WHITE]:          [97, 39],
    [STYLE.GREY]:           [90, 39],
    [STYLE.LIGHT_GREY]:     [37, 39],
    [STYLE.LIGHT_RED]:      [91, 39],
    [STYLE.LIGHT_GREEN]:    [92, 39],
    [STYLE.LIGHT_YELLOW]:   [93, 39],
    [STYLE.LIGHT_BLUE]:     [94, 39],
    [STYLE.LIGHT_MAGENTA]:  [95, 39],
    [STYLE.LIGHT_CYAN]:     [94, 39],

    [STYLE.BG_BLACK]:       [40, 49],
    [STYLE.BG_RED]:         [41, 49],
    [STYLE.BG_GREEN]:       [42, 49],
    [STYLE.BG_YELLOW]:      [43, 49],
    [STYLE.BG_BLUE]:        [44, 49],
    [STYLE.BG_MAGENTA]:     [45, 49],
    [STYLE.BG_CYAN]:        [46, 49],
    [STYLE.BG_WHITE]:       [107, 49],
    [STYLE.BG_GREY]:        [100, 49],
    [STYLE.BG_LIGHT_RED]:       [101, 49],
    [STYLE.BG_LIGHT_GREEN]:     [102, 49],
    [STYLE.BG_LIGHT_YELLOW]:    [103, 49],
    [STYLE.BG_LIGHT_BLUE]:      [104, 49],
    [STYLE.BG_LIGHT_MAGENTA]:   [105, 49],
    [STYLE.BG_LIGHT_CYAN]:      [106, 49],
    [STYLE.BG_LIGHT_GREY]:      [47, 49],
};


export function style(msg: string, style: STYLE) {
    var [start, end] = CODES[style];
    return `\u001B[${start}m${msg}\u001B[${end}m`;
    // return `\u001B[${start}m${msg}\u001B[${end}m`;
}


var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;

export function interval(ms) {
    if (ms >= d) return Math.round(ms / d) + 'd';
    if (ms >= h) return Math.round(ms / h) + 'h';
    if (ms >= m) return Math.round(ms / m) + 'm';
    if (ms >= s) return Math.round(ms / s) + 's';
    return ms + 'ms';
}
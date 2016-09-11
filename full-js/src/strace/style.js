"use strict";
exports.CODES = (_a = {},
    _a[0 /* RESET */] = [0, 0],
    _a[1 /* BOLD */] = [1, 21],
    _a[2 /* DIM */] = [2, 22],
    _a[3 /* ITALIC */] = [3, 23],
    _a[4 /* UNDERLINE */] = [4, 24],
    _a[5 /* BLINK */] = [5, 25],
    _a[6 /* INVERSE */] = [7, 27],
    _a[7 /* HIDDEN */] = [8, 28],
    _a[8 /* STRIKETHROUGH */] = [9, 29],
    _a[9 /* DEFAULT */] = [39, 39],
    _a[10 /* BLACK */] = [30, 39],
    _a[11 /* RED */] = [31, 39],
    _a[12 /* GREEN */] = [32, 39],
    _a[13 /* YELLOW */] = [33, 39],
    _a[14 /* BLUE */] = [34, 39],
    _a[15 /* MAGENTA */] = [35, 39],
    _a[16 /* CYAN */] = [36, 39],
    _a[17 /* WHITE */] = [97, 39],
    _a[18 /* GREY */] = [90, 39],
    _a[19 /* LIGHT_GREY */] = [37, 39],
    _a[20 /* LIGHT_RED */] = [91, 39],
    _a[21 /* LIGHT_GREEN */] = [92, 39],
    _a[22 /* LIGHT_YELLOW */] = [93, 39],
    _a[23 /* LIGHT_BLUE */] = [94, 39],
    _a[24 /* LIGHT_MAGENTA */] = [95, 39],
    _a[25 /* LIGHT_CYAN */] = [94, 39],
    _a[26 /* BG_BLACK */] = [40, 49],
    _a[27 /* BG_RED */] = [41, 49],
    _a[28 /* BG_GREEN */] = [42, 49],
    _a[29 /* BG_YELLOW */] = [43, 49],
    _a[30 /* BG_BLUE */] = [44, 49],
    _a[31 /* BG_MAGENTA */] = [45, 49],
    _a[32 /* BG_CYAN */] = [46, 49],
    _a[33 /* BG_WHITE */] = [107, 49],
    _a[34 /* BG_GREY */] = [100, 49],
    _a[35 /* BG_LIGHT_RED */] = [101, 49],
    _a[36 /* BG_LIGHT_GREEN */] = [102, 49],
    _a[37 /* BG_LIGHT_YELLOW */] = [103, 49],
    _a[38 /* BG_LIGHT_BLUE */] = [104, 49],
    _a[39 /* BG_LIGHT_MAGENTA */] = [105, 49],
    _a[40 /* BG_LIGHT_CYAN */] = [106, 49],
    _a[41 /* BG_LIGHT_GREY */] = [47, 49],
    _a
);
function style(msg, style) {
    var _a = exports.CODES[style], start = _a[0], end = _a[1];
    return "\u001B[" + start + "m" + msg + "\u001B[" + end + "m";
    // return `\u001B[${start}m${msg}\u001B[${end}m`;
}
exports.style = style;
var s = 1000;
var m = s * 60;
var h = m * 60;
var d = h * 24;
function interval(ms) {
    if (ms >= d)
        return Math.round(ms / d) + 'd';
    if (ms >= h)
        return Math.round(ms / h) + 'h';
    if (ms >= m)
        return Math.round(ms / m) + 'm';
    if (ms >= s)
        return Math.round(ms / s) + 's';
    return ms + 'ms';
}
exports.interval = interval;
var _a;

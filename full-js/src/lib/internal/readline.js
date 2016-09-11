'use strict';
var metaKeyCodeReAnywhere = /(?:\x1b)([a-zA-Z0-9])/;
var functionKeyCodeReAnywhere = new RegExp('(?:\x1b+)(O|N|\\[|\\[\\[)(?:' + [
    '(\\d+)(?:;(\\d+))?([~^$])',
    '(?:M([@ #!a`])(.)(.))',
    '(?:1;)?(\\d+)?([a-zA-Z])'
].join('|') + ')');
module.exports = {
    emitKeys: emitKeys,
    getStringWidth: getStringWidth,
    isFullWidthCodePoint: isFullWidthCodePoint,
    stripVTControlCharacters: stripVTControlCharacters
};
function getStringWidth(str) {
    var width = 0;
    str = stripVTControlCharacters(str);
    for (var i = 0; i < str.length; i++) {
        var code = str.codePointAt(i);
        if (code >= 0x10000) {
            i++;
        }
        if (isFullWidthCodePoint(code)) {
            width += 2;
        }
        else {
            width++;
        }
    }
    return width;
}
function isFullWidthCodePoint(code) {
    if (isNaN(code)) {
        return false;
    }
    if (code >= 0x1100 && (code <= 0x115f ||
        0x2329 === code ||
        0x232a === code ||
        (0x2e80 <= code && code <= 0x3247 && code !== 0x303f) ||
        0x3250 <= code && code <= 0x4dbf ||
        0x4e00 <= code && code <= 0xa4c6 ||
        0xa960 <= code && code <= 0xa97c ||
        0xac00 <= code && code <= 0xd7a3 ||
        0xf900 <= code && code <= 0xfaff ||
        0xfe10 <= code && code <= 0xfe19 ||
        0xfe30 <= code && code <= 0xfe6b ||
        0xff01 <= code && code <= 0xff60 ||
        0xffe0 <= code && code <= 0xffe6 ||
        0x1b000 <= code && code <= 0x1b001 ||
        0x1f200 <= code && code <= 0x1f251 ||
        0x20000 <= code && code <= 0x3fffd)) {
        return true;
    }
    return false;
}
function stripVTControlCharacters(str) {
    str = str.replace(new RegExp(functionKeyCodeReAnywhere.source, 'g'), '');
    return str.replace(new RegExp(metaKeyCodeReAnywhere.source, 'g'), '');
}
function emitKeys(stream) {
    while (true) {
        var ch = yield;
        var s = ch;
        var escaped = false;
        var key = {
            sequence: null,
            name: undefined,
            ctrl: false,
            meta: false,
            shift: false
        };
        if (ch === '\x1b') {
            escaped = true;
            s += (ch = yield);
            if (ch === '\x1b') {
                s += (ch = yield);
            }
        }
        if (escaped && (ch === 'O' || ch === '[')) {
            var code = ch;
            var modifier = 0;
            if (ch === 'O') {
                s += (ch = yield);
                if (ch >= '0' && ch <= '9') {
                    modifier = (ch >> 0) - 1;
                    s += (ch = yield);
                }
                code += ch;
            }
            else if (ch === '[') {
                s += (ch = yield);
                if (ch === '[') {
                    code += ch;
                    s += (ch = yield);
                }
                var cmdStart = s.length - 1;
                if (ch >= '0' && ch <= '9') {
                    s += (ch = yield);
                    if (ch >= '0' && ch <= '9') {
                        s += (ch = yield);
                    }
                }
                if (ch === ';') {
                    s += (ch = yield);
                    if (ch >= '0' && ch <= '9') {
                        s += (ch = yield);
                    }
                }
                var cmd = s.slice(cmdStart);
                var match;
                if ((match = cmd.match(/^(\d\d?)(;(\d))?([~^$])$/))) {
                    code += match[1] + match[4];
                    modifier = (match[3] || 1) - 1;
                }
                else if ((match = cmd.match(/^((\d;)?(\d))?([A-Za-z])$/))) {
                    code += match[4];
                    modifier = (match[3] || 1) - 1;
                }
                else {
                    code += cmd;
                }
            }
            key.ctrl = !!(modifier & 4);
            key.meta = !!(modifier & 10);
            key.shift = !!(modifier & 1);
            key.code = code;
            switch (code) {
                case 'OP':
                    key.name = 'f1';
                    break;
                case 'OQ':
                    key.name = 'f2';
                    break;
                case 'OR':
                    key.name = 'f3';
                    break;
                case 'OS':
                    key.name = 'f4';
                    break;
                case '[11~':
                    key.name = 'f1';
                    break;
                case '[12~':
                    key.name = 'f2';
                    break;
                case '[13~':
                    key.name = 'f3';
                    break;
                case '[14~':
                    key.name = 'f4';
                    break;
                case '[[A':
                    key.name = 'f1';
                    break;
                case '[[B':
                    key.name = 'f2';
                    break;
                case '[[C':
                    key.name = 'f3';
                    break;
                case '[[D':
                    key.name = 'f4';
                    break;
                case '[[E':
                    key.name = 'f5';
                    break;
                case '[15~':
                    key.name = 'f5';
                    break;
                case '[17~':
                    key.name = 'f6';
                    break;
                case '[18~':
                    key.name = 'f7';
                    break;
                case '[19~':
                    key.name = 'f8';
                    break;
                case '[20~':
                    key.name = 'f9';
                    break;
                case '[21~':
                    key.name = 'f10';
                    break;
                case '[23~':
                    key.name = 'f11';
                    break;
                case '[24~':
                    key.name = 'f12';
                    break;
                case '[A':
                    key.name = 'up';
                    break;
                case '[B':
                    key.name = 'down';
                    break;
                case '[C':
                    key.name = 'right';
                    break;
                case '[D':
                    key.name = 'left';
                    break;
                case '[E':
                    key.name = 'clear';
                    break;
                case '[F':
                    key.name = 'end';
                    break;
                case '[H':
                    key.name = 'home';
                    break;
                case 'OA':
                    key.name = 'up';
                    break;
                case 'OB':
                    key.name = 'down';
                    break;
                case 'OC':
                    key.name = 'right';
                    break;
                case 'OD':
                    key.name = 'left';
                    break;
                case 'OE':
                    key.name = 'clear';
                    break;
                case 'OF':
                    key.name = 'end';
                    break;
                case 'OH':
                    key.name = 'home';
                    break;
                case '[1~':
                    key.name = 'home';
                    break;
                case '[2~':
                    key.name = 'insert';
                    break;
                case '[3~':
                    key.name = 'delete';
                    break;
                case '[4~':
                    key.name = 'end';
                    break;
                case '[5~':
                    key.name = 'pageup';
                    break;
                case '[6~':
                    key.name = 'pagedown';
                    break;
                case '[[5~':
                    key.name = 'pageup';
                    break;
                case '[[6~':
                    key.name = 'pagedown';
                    break;
                case '[7~':
                    key.name = 'home';
                    break;
                case '[8~':
                    key.name = 'end';
                    break;
                case '[a':
                    key.name = 'up';
                    key.shift = true;
                    break;
                case '[b':
                    key.name = 'down';
                    key.shift = true;
                    break;
                case '[c':
                    key.name = 'right';
                    key.shift = true;
                    break;
                case '[d':
                    key.name = 'left';
                    key.shift = true;
                    break;
                case '[e':
                    key.name = 'clear';
                    key.shift = true;
                    break;
                case '[2$':
                    key.name = 'insert';
                    key.shift = true;
                    break;
                case '[3$':
                    key.name = 'delete';
                    key.shift = true;
                    break;
                case '[5$':
                    key.name = 'pageup';
                    key.shift = true;
                    break;
                case '[6$':
                    key.name = 'pagedown';
                    key.shift = true;
                    break;
                case '[7$':
                    key.name = 'home';
                    key.shift = true;
                    break;
                case '[8$':
                    key.name = 'end';
                    key.shift = true;
                    break;
                case 'Oa':
                    key.name = 'up';
                    key.ctrl = true;
                    break;
                case 'Ob':
                    key.name = 'down';
                    key.ctrl = true;
                    break;
                case 'Oc':
                    key.name = 'right';
                    key.ctrl = true;
                    break;
                case 'Od':
                    key.name = 'left';
                    key.ctrl = true;
                    break;
                case 'Oe':
                    key.name = 'clear';
                    key.ctrl = true;
                    break;
                case '[2^':
                    key.name = 'insert';
                    key.ctrl = true;
                    break;
                case '[3^':
                    key.name = 'delete';
                    key.ctrl = true;
                    break;
                case '[5^':
                    key.name = 'pageup';
                    key.ctrl = true;
                    break;
                case '[6^':
                    key.name = 'pagedown';
                    key.ctrl = true;
                    break;
                case '[7^':
                    key.name = 'home';
                    key.ctrl = true;
                    break;
                case '[8^':
                    key.name = 'end';
                    key.ctrl = true;
                    break;
                case '[Z':
                    key.name = 'tab';
                    key.shift = true;
                    break;
                default:
                    key.name = 'undefined';
                    break;
            }
        }
        else if (ch === '\r') {
            key.name = 'return';
        }
        else if (ch === '\n') {
            key.name = 'enter';
        }
        else if (ch === '\t') {
            key.name = 'tab';
        }
        else if (ch === '\b' || ch === '\x7f') {
            key.name = 'backspace';
            key.meta = escaped;
        }
        else if (ch === '\x1b') {
            key.name = 'escape';
            key.meta = escaped;
        }
        else if (ch === ' ') {
            key.name = 'space';
            key.meta = escaped;
        }
        else if (!escaped && ch <= '\x1a') {
            key.name = String.fromCharCode(ch.charCodeAt(0) + 'a'.charCodeAt(0) - 1);
            key.ctrl = true;
        }
        else if (/^[0-9A-Za-z]$/.test(ch)) {
            key.name = ch.toLowerCase();
            key.shift = /^[A-Z]$/.test(ch);
            key.meta = escaped;
        }
        key.sequence = s;
        if (key.name !== undefined) {
            stream.emit('keypress', escaped ? undefined : s, key);
        }
        else if (s.length === 1) {
            stream.emit('keypress', s, key);
        }
    }
}

"use strict";
var util_1 = require('../util');
var t = require('../x86/table');
var table_1 = require('../x86/table');
exports.defaults = util_1.extend({}, t.defaults, { s: table_1.S.DOUBLE });
exports.table = {
    mov: [
        { mn: 'mov' },
        { o: 0x8B, mn: 'movq', ops: [table_1.rm64, table_1.rm64], dbit: true },
        { o: 0xC7, ops: [table_1.r64, table_1.imm32] },
    ],
    inc: [
        { o: 0xFF, or: 0, lock: true },
        { ops: [table_1.rm32] },
        { ops: [table_1.rm64] },
    ],
    dec: [
        { o: 0xFF, or: 1, lock: true },
        { ops: [table_1.rm32] },
        { ops: [table_1.rm64] },
    ],
    syscall: [{ o: 0x0F05 }],
    sysenter: [{ o: 0x0F34 }],
    sysexit: [{ o: 0x0F35 }],
    int: [{ o: 0xCD, ops: [table_1.imm8] }],
};

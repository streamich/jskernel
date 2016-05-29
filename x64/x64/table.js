"use strict";
var util_1 = require('../util');
var t = require('../x86/table');
var table_1 = require('../x86/table');
exports.defaults = util_1.extend({}, t.defaults, { s: table_1.S.DOUBLE, rex: false });
exports.table = {
    // Arithmetic.
    add: [{},
        { o: 0x83, or: 0, ops: [table_1.rm64, table_1.imm8], s: table_1.S.QUAD },
    ],
    mov: [{ mn: 'mov' },
        { o: 0x8B, mn: 'movq', ops: [table_1.rm64, table_1.rm64], dbit: true, s: table_1.S.QUAD },
        { o: 0xC7, or: 0, ops: [table_1.r64, table_1.imm32], s: table_1.S.QUAD },
    ],
    inc: [{ o: 0xFF, or: 0, ops: [table_1.rm64], lock: true, s: table_1.S.QUAD }],
    dec: [{ o: 0xFF, or: 1, ops: [table_1.rm64], lock: true, s: table_1.S.QUAD }],
    syscall: [{ o: 0x0F05 }],
    sysenter: [{ o: 0x0F34 }],
    sysexit: [{ o: 0x0F35 }],
    int: [{ o: 0xCD, ops: [table_1.imm8] }],
    ret: [{},
        { o: 0xC3 },
        { o: 0xC2, ops: [table_1.imm16] }
    ],
};

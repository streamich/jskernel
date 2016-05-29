"use strict";
var o = require('./operand');
exports.S = o.SIZE;
exports.M = o.MODE;
exports.r8 = [o.Register8];
exports.r32 = [o.Register32];
exports.r64 = [o.Register64];
exports.m = [o.Memory];
exports.m8 = [o.Memory8];
exports.m32 = [o.Memory32];
exports.m64 = [o.Memory64];
exports.rm8 = [o.Register8, o.Memory8];
exports.rm32 = [o.Register32, o.Memory32];
exports.rm64 = [o.Register64, o.Memory64];
exports.imm = [o.Immediate];
exports.imm8 = [o.Immediate8];
exports.imm16 = [o.Immediate16];
exports.imm32 = [o.Immediate32];
// Global defaults
exports.defaults = { s: exports.S.DOUBLE, lock: false, ops: null, or: -1, r: false, dbit: false, rex: false };
// Instruction are divided in groups, each group consists of list
// of possible instructions. The first object is NOT an instruction
// but defaults for the group.
exports.table = {
    mov: [
        { mn: 'mov' },
        { o: 0x8B, mn: 'movq', ops: [exports.r64, exports.r64] },
        { o: 0xC7, ops: [exports.r64, exports.imm32] },
    ],
    inc: [
        { o: 0xFF, or: 0, lock: true },
        { o: 0xFE, ops: [exports.rm8] },
        { ops: [exports.rm32] },
        { ops: [exports.rm64] },
    ]
};

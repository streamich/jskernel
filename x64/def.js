"use strict";
var opcode_1 = require('./opcode');
var Definition = (function () {
    function Definition(op, rex, reg_in_op, opreg, imm, reg_is_dst, word_size) {
        if (rex === void 0) { rex = false; }
        if (reg_in_op === void 0) { reg_in_op = false; }
        if (opreg === void 0) { opreg = -1; }
        if (imm === void 0) { imm = false; }
        if (reg_is_dst === void 0) { reg_is_dst = true; }
        if (word_size === void 0) { word_size = true; }
        this.op = op;
        this.opreg = opreg;
        this.regInOp = reg_in_op;
        this.regIsDest = reg_is_dst;
        this.isSizeWord = word_size;
        this.mandatoryRex = rex;
        this.hasImmediate = imm;
    }
    return Definition;
}());
exports.Definition = Definition;
//                                      Op-code    REX     reg in op   opreg       immediate    reg is dst  word_size
// _____________________________________|__________|_______|___________|___________|____________|___________|___________________
exports.PUSH = new Definition(opcode_1.OP.PUSH, false, true, -1, false, true, true);
exports.POP = new Definition(opcode_1.OP.POP, false, true);
exports.MOVQ = new Definition(opcode_1.OP.MOV, true);
exports.MOVimm = new Definition(opcode_1.OP.MOVimm, false);
exports.INC = new Definition(opcode_1.OP.INC, false, false, opcode_1.OPREG.INC);
exports.DEC = new Definition(opcode_1.OP.DEC, false, false, opcode_1.OPREG.DEC);
exports.INT = new Definition(opcode_1.OP.INT, false, false, -1, true, true, false);
exports.SYSCALL = new Definition(opcode_1.OP.SYSCALL);

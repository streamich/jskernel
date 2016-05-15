"use strict";
var Definition = (function () {
    function Definition(op, rex, reg_in_op, opreg, reg_is_dst, word_size, imm) {
        if (rex === void 0) { rex = false; }
        if (reg_in_op === void 0) { reg_in_op = false; }
        if (opreg === void 0) { opreg = -1; }
        if (reg_is_dst === void 0) { reg_is_dst = true; }
        if (word_size === void 0) { word_size = true; }
        if (imm === void 0) { imm = false; }
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
//                                   Op-code    REX     reg in op   opreg   reg is dst  word_size   has immediate
// __________________________________|__________|_______|___________|_______|___________|___________|___________________
exports.PUSH = new Definition(80 /* PUSH */, false, true, -1, true, true, false);
exports.POP = new Definition(88 /* POP */, false, true);
exports.MOVQ = new Definition(137 /* MOV */, true);

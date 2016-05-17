"use strict";
var util_1 = require('./util');
exports.definitionDefaults = {
    opreg: -1,
    regInOp: false,
    operands: 0,
    hasImmediate: false,
    immediateSizes: [],
    size: 64,
};
var Definition = (function () {
    // constructor(op: number, rex = false, reg_in_op = false, opreg = -1, imm = false, reg_is_dst = true, word_size = true) {
    //     this.op = op;
    //     this.opreg = opreg;
    //     this.regInOp = reg_in_op;
    //     this.regIsDest = reg_is_dst;
    //     this.isSizeWord = word_size;
    //     this.mandatoryRex = rex;
    //     this.hasImmediate = imm;
    // }
    function Definition(defs) {
        util_1.extend(this, exports.definitionDefaults, defs);
    }
    return Definition;
}());
exports.Definition = Definition;
//                                       Op-code    REX     reg in op   opreg       immediate   reg is dst  word_size
// ______________________________________|__________|_______|___________|___________|___________|___________|___________________
// export const PUSH       = new Definition(OP.PUSH,   false,  true,       -1,         false,      true,       true);
// export const POP        = new Definition(OP.POP,    false,  true);
// export const MOVQ       = new Definition(OP.MOV,    true);
// export const MOVimm     = new Definition(OP.MOVimm, false);
// export const INC        = new Definition(OP.INC,    false,  false,      OPREG.INC);
// export const DEC        = new Definition(OP.DEC,    false,  false,      OPREG.DEC);
// export const INT        = new Definition(OP.INT,    false,  false,      -1,         true,       true,       false);
// export const SYSCALL    = new Definition(OP.SYSCALL);

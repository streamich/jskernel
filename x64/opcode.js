// Op-code of instructions, op-code byte:
//
//     |76543210|
//     |......ds|
//     |.......s
//     |......d
//     |XXXXXX00 <--- Op-code = OP
"use strict";
(function (OP) {
    OP[OP["MOV"] = 139] = "MOV";
    OP[OP["MOVimm"] = 199] = "MOVimm";
    OP[OP["MOVABS"] = 184] = "MOVABS";
    OP[OP["INC"] = 255] = "INC";
    OP[OP["DEC"] = 255] = "DEC";
    OP[OP["PUSH"] = 80] = "PUSH";
    OP[OP["POP"] = 88] = "POP";
    OP[OP["INT"] = 205] = "INT";
    OP[OP["SYSCALL"] = 3845] = "SYSCALL";
    OP[OP["SYSENTER"] = 3892] = "SYSENTER";
    OP[OP["SYSEXIT"] = 3893] = "SYSEXIT";
})(exports.OP || (exports.OP = {}));
var OP = exports.OP;
// Op-code extension into `REG` field of Mod-R/M byte, Mod-R/M byte:
//
//     |76543210|
//      .....XXX <--- R/M field
//      ..XXX <------ REG field = OPREG
//      XX <--------- MOD field
(function (OPREG) {
    OPREG[OPREG["INC"] = 0] = "INC";
    OPREG[OPREG["DEC"] = 1] = "DEC";
    OPREG[OPREG["MOVimm"] = 0] = "MOVimm";
})(exports.OPREG || (exports.OPREG = {}));
var OPREG = exports.OPREG;

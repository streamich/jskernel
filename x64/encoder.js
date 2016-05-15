"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var o = require('./operand');
var i = require('./instruction');
(function (MODE) {
    MODE[MODE["REAL"] = 0] = "REAL";
    MODE[MODE["COMPAT"] = 1] = "COMPAT";
    MODE[MODE["LONG"] = 2] = "LONG";
})(exports.MODE || (exports.MODE = {}));
var MODE = exports.MODE;
var Encoder = (function () {
    function Encoder() {
    }
    Encoder.prototype.createInstruction = function (def, op) {
        var ins = new i.Instruction(def, op);
        var dstreg = null;
        var dstmem = null;
        var srcreg = null;
        var srcmem = null;
        // Destination
        if (op.dst instanceof o.Register)
            dstreg = op.dst;
        else if (op.dst instanceof o.Memory)
            dstmem = op.dst;
        else
            throw TypeError("Destination operand should be Register or Memory; given: " + ins.op.dst.toString());
        // Source
        if (op.src) {
            if (op.src instanceof o.Register)
                srcreg = op.src;
            else if (op.src instanceof o.Memory)
                srcmem = op.src;
            else if (!(op.src instanceof o.Constant))
                throw TypeError("Source operand should be Register, Memory or Constant");
        }
        // Prefixes
        // REX prefix
        if (def.mandatoryRex || dstreg.isExtended) {
            var W = 0, R = 0, X = 0, B = 0;
            if (def.mandatoryRex)
                W = 1;
            if (dstreg && dstreg.isExtended)
                R = 1;
            if (srcreg && srcreg.isExtended)
                B = 1;
            if (dstmem) {
                if (dstmem.base && dstmem.base.isExtended)
                    B = 1;
                if (dstmem.index && dstmem.index.isExtended)
                    X = 1;
            }
            if (srcmem) {
                if (srcmem.base && srcmem.base.isExtended)
                    B = 1;
                if (srcmem.index && srcmem.index.isExtended)
                    X = 1;
            }
            ins.parts.push(new i.PrefixRex(W, R, X, B));
        }
        // Op-code
        var opcode = new i.Opcode;
        opcode.op = def.op;
        if (def.regInOp) {
            // We have register encoded in op-code here.
            if (!dstreg)
                throw TypeError("Operation needs destination register.");
            opcode.op = (opcode.op & i.Opcode.MASK_OP) | dstreg.id;
        }
        else {
            // Direction bit `d`
            opcode.op = (opcode.op & i.Opcode.MASK_DIRECTION) |
                (dstreg ? i.Opcode.DIRECTION.REG_IS_DST : i.Opcode.DIRECTION.REG_IS_SRC);
            // Size bit `s`
            opcode.op = (opcode.op & i.Opcode.MASK_SIZE) | (i.Opcode.SIZE.WORD);
        }
        opcode.regIsDest = def.regIsDest;
        opcode.isSizeWord = def.isSizeWord;
        opcode.regInOp = def.regInOp;
        ins.parts.push(opcode);
        // Mod-RM
        if (srcreg) {
            var mod = 0, reg = 0, rm = 0;
            if (srcreg && dstreg) {
                mod = i.Modrm.MOD.REG_TO_REG;
                reg = dstreg.id;
                rm = srcreg.id;
            }
            else {
                var mem = srcmem || dstmem;
                if (mem) {
                    if (mem.disp) {
                    }
                    else {
                        mod = i.Modrm.MOD.INDIRECT;
                    }
                }
            }
            ins.parts.push(new i.Modrm(mod, reg, rm));
        }
        // SIB
        // Immediate
        return ins;
    };
    return Encoder;
}());
exports.Encoder = Encoder;
var RandomizingEncoder = (function (_super) {
    __extends(RandomizingEncoder, _super);
    function RandomizingEncoder() {
        _super.apply(this, arguments);
    }
    return RandomizingEncoder;
}(Encoder));
exports.RandomizingEncoder = RandomizingEncoder;

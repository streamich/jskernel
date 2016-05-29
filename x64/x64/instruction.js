"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var o = require('../x86/operand');
var i = require('../x86/instruction');
var p = require('../x86/parts');
var Instruction = (function (_super) {
    __extends(Instruction, _super);
    function Instruction() {
        _super.apply(this, arguments);
        this.prefixRex = null;
        this.operandSize = o.SIZE.DOUBLE;
    }
    Instruction.prototype.getOperandSize = function () {
        return this.operandSize;
    };
    Instruction.prototype.writePrefixes = function (arr) {
        _super.prototype.writePrefixes.call(this, arr);
        if (this.prefixRex)
            this.prefixRex.write(arr);
    };
    Instruction.prototype.needs32To64OperandSizeChange = function () {
        // Default operand size in x64 mode is 32 bits.
        return this.def.operandSize === o.SIZE.QUAD;
    };
    Instruction.prototype.createPrefixes = function () {
        _super.prototype.createPrefixes.call(this);
        if (this.def.mandatoryRex ||
            (this.op.hasRegisterOrMemory() && (this.needs32To64OperandSizeChange() || this.hasExtendedRegister())))
            this.createRex();
    };
    Instruction.prototype.createRex = function () {
        var W = 0, R = 0, X = 0, B = 0;
        if (this.needs32To64OperandSizeChange())
            W = 1;
        var _a = this.op, dst = _a.dst, src = _a.src;
        if ((dst instanceof o.Register) && (src instanceof o.Register)) {
            if (dst.isExtended())
                R = 1;
            if (src.isExtended())
                B = 1;
        }
        else {
            var r = this.op.getRegisterOperand();
            var mem = this.op.getMemoryOperand();
            if (r) {
                if (r.isExtended())
                    if (mem)
                        R = 1;
                    else
                        B = 1;
            }
            if (mem) {
                if (mem.base && mem.base.isExtended())
                    B = 1;
                if (mem.index && mem.index.isExtended())
                    X = 1;
            }
        }
        this.prefixRex = new p.PrefixRex(W, R, X, B);
    };
    // Adding RIP-relative addressing in long mode.
    //
    // > In the 64-bit mode, any instruction that uses ModRM addressing can use RIP-relative addressing.
    //
    // > Without RIP-relative addressing, ModRM instructions address memory relative to zero. With RIP-relative
    // > addressing, ModRM instructions can address memory relative to the 64-bit RIP using a signed
    // > 32-bit displacement.
    Instruction.prototype.createModrm = function () {
        var mem = this.op.getMemoryOperand();
        if (mem && mem.base && (mem.base instanceof o.RegisterRip)) {
            if (mem.index || mem.scale)
                throw TypeError('RIP-relative addressing does not support index and scale addressing.');
            var disp = mem.displacement;
            if (!disp)
                throw TypeError('RIP-relative addressing requires 4-byte displacement.');
            if (disp.size < o.SIZE.DOUBLE)
                disp.zeroExtend(o.SIZE.DOUBLE);
            // Encode `Modrm.reg` field.
            var reg = 0;
            if (this.def.opreg > -1) {
                reg = this.def.opreg;
            }
            else {
                var r = this.op.getRegisterOperand();
                if (r)
                    reg = r.get3bitId();
            }
            this.modrm = new p.Modrm(p.Modrm.MOD.INDIRECT, reg, p.Modrm.RM.INDIRECT_DISP);
        }
        else
            _super.prototype.createModrm.call(this);
    };
    return Instruction;
}(i.Instruction));
exports.Instruction = Instruction;

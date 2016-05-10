"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var reg = require('./regfile');
// Transpiler returns a machine code of every instruction.
// It does not have any logic and does not do any optimizations or type
// checking, it just returns the machine code for every ASM instruction.
var Encoder = (function () {
    function Encoder() {
    }
    // See Intel manual: 2-8 Vol. 2A
    // See: http://wiki.osdev.org/X86-64_Instruction_Encoding#REX_prefix
    // `W`, `R`, `X`, `B` are numbers `0` or `1`.
    Encoder.prototype.rex = function (W, R, X, B) {
        return 64 | (W << 3) + (R << 2) + (X << 1) + B;
    };
    Encoder.prototype.rexW = function (R, X, B) {
        if (R === void 0) { R = 0; }
        if (X === void 0) { X = 0; }
        if (B === void 0) { B = 0; }
        return this.rex(1, R, X, B);
    };
    Encoder.prototype.rexOneOperand = function (r) {
        var W = 0, B = 0;
        if (r.size == 64)
            W = 1;
        if (r.isExtended)
            B = 1;
        return W || B ? this.rex(W, 0, 0, B) : null;
    };
    Encoder.prototype.rexRegToReg = function (src, dst) {
        var W = 0, R = 0, X = 0, B = 0;
        // Determine if we operate on 64-bit registers.
        if (src.size == 64)
            W = 1;
        else if (dst.size == 64)
            W = 1;
        // Extend bits in `Mod-R/M` byte.
        if (src.isExtended)
            B = 1;
        if (dst.isExtended)
            R = 1;
        return W || R || X || B ? this.rex(W, R, X, B) : null;
    };
    Encoder.prototype.rexMemToReg = function (src, dst) {
        var W = 0, R = 0, X = 0, B = 0;
        if (src.base.size == 64)
            W = 1;
        else if (dst.size == 64)
            W = 1;
        if (src.base && src.base.isExtended)
            B = 1;
        if (src.index && src.index.isExtended)
            X = 1;
        if (dst.isExtended)
            R = 1;
        return W || R || X || B ? this.rex(W, R, X, B) : null;
    };
    Encoder.prototype.rexFromOperands = function (src, dst) {
    };
    Encoder.prototype.getDisplacementSize = function (disp) {
        if ((disp <= 0x7f) && (disp >= -0x80))
            return 0 /* BYTE */;
        if ((disp <= 0x7fffffff) && (disp >= -0x80000000))
            return 1 /* LONG */;
        throw Error("Displacement " + disp + " too big.");
    };
    // Creates a Mod-REG-R/M byte, `mod` is mode, `register` is ID of the first register,
    // `rm` is ID of the 2nd register or memory value.
    Encoder.prototype.modrm = function (mod, register, rm) {
        // return ((mod & 0b11) << 6) | ((register & 0b111) << 3) | (rm & 0b111);
        // return (mod << 6) + (register << 3) + rm;
        return (mod << 6) | (register << 3) | rm;
    };
    Encoder.prototype.modrmOneOperand = function (dst, opreg) {
        if (opreg === void 0) { opreg = 0; }
        return this.modrm(3 /* REG_TO_REG */, opreg, dst.id);
    };
    Encoder.prototype.modrmRegToReg = function (src, dst) {
        return this.modrm(3 /* REG_TO_REG */, src.id, dst.id);
    };
    Encoder.prototype.modrmMemToReg = function (src, dst, mod) {
        if (mod === void 0) { mod = 0 /* INDIRECT */; }
        var rm = src.base.id;
        // There will be a `SIB` byte, we have to set `R/M` to `0b100`.
        var have_sib = !!src.index;
        if (have_sib) {
            rm = 4;
        }
        return this.modrm(mod, dst.id, rm);
    };
    Encoder.prototype.modrmFromOperands = function (src, dst) {
        if (src instanceof reg.Register) {
            if (dst instanceof reg.Register) {
                return this.modrm(3 /* REG_TO_REG */, src.id, dst.id);
            }
        }
        throw Error('Unsupported Mod-R/M operands.');
    };
    Encoder.prototype.needsSib = function (ref) {
        return !!ref.index;
    };
    Encoder.prototype.sib = function (scale, index, base) {
        return (scale << 6) | (index << 3) | base;
    };
    Encoder.prototype.sibFromRef = function (ref) {
        return this.sib(ref.scale, ref.index.id, ref.base.id);
    };
    Encoder.prototype.insOneOperand = function (r, op, opreg, hasRex, reg_in_op, imm) {
        if (opreg === void 0) { opreg = 0; }
        if (hasRex === void 0) { hasRex = true; }
        if (reg_in_op === void 0) { reg_in_op = false; }
        if (imm === void 0) { imm = []; }
        var ins = [];
        // REX.W | REX.B prefix.
        if (hasRex) {
            var rex = this.rexOneOperand(r);
            if (rex)
                ins.push(rex);
        }
        // 3 lower bits in Op-code are used to encode register.
        if (reg_in_op) {
            op |= r.id;
            ins.push(op);
        }
        else {
            ins.push(op);
            ins.push(this.modrmOneOperand(r, opreg));
        }
        if (imm.length)
            for (var _i = 0, imm_1 = imm; _i < imm_1.length; _i++) {
                var long = imm_1[_i];
                this.pushConstant(ins, long);
            }
        return ins;
    };
    Encoder.prototype.insRegToReg = function (src, dst, op, hasRex) {
        if (hasRex === void 0) { hasRex = true; }
        var ins = [];
        // REX.W | REX.B prefix.
        if (hasRex) {
            var rex = this.rexRegToReg(src, dst);
            if (rex)
                ins.push(rex);
        }
        ins.push(op);
        ins.push(this.modrmRegToReg(src, dst));
        return ins;
    };
    Encoder.prototype.insMemToReg = function (src, dst, op, hasRex, op_size) {
        if (hasRex === void 0) { hasRex = true; }
        if (op_size === void 0) { op_size = 0 /* BYTE */; }
        var ins = [];
        if (hasRex) {
            var rex = this.rexMemToReg(src, dst);
            if (rex)
                ins.push(rex);
        }
        // Set op-code's direction and size bits.
        op |= 2 /* REG_IS_DST */;
        op |= op_size;
        ins.push(op);
        if (src.displacement) {
            var disp_size = this.getDisplacementSize(src.displacement);
            if (disp_size == 0 /* BYTE */) {
                ins.push(this.modrmMemToReg(src, dst, 1 /* DISP8 */));
                if (src.index)
                    ins.push(this.sibFromRef(src));
                ins.push(src.displacement);
            }
            else {
                ins.push(this.modrmMemToReg(src, dst, 2 /* DISP32 */));
                if (src.index)
                    ins.push(this.sibFromRef(src));
                // Write octets in reverse order.
                ins.push(src.displacement & 0xff);
                ins.push((src.displacement >> 8) & 0xff);
                ins.push((src.displacement >> 16) & 0xff);
                ins.push((src.displacement >> 24) & 0xff);
            }
        }
        else {
            ins.push(this.modrmMemToReg(src, dst));
            if (src.index)
                ins.push(this.sibFromRef(src));
        }
        return ins;
    };
    Encoder.prototype.insRegToMem = function (src, dst, op, hasRex) {
        if (hasRex === void 0) { hasRex = true; }
        var ins = [];
        if (hasRex) {
            var rex = this.rexRegToMem(src, dst);
            if (rex)
                ins.push(rex);
        }
    };
    Encoder.prototype.pushConstant = function (arr, constant) {
        arr.push(constant & 0xff);
        arr.push((constant >> 8) & 0xff);
        arr.push((constant >> 16) & 0xff);
        arr.push((constant >> 24) & 0xff);
        return arr;
    };
    Encoder.prototype.inc = function (register) {
        return this.insOneOperand(register, 255 /* INC */, 0 /* INC */);
    };
    Encoder.prototype.dec = function (register) {
        return this.insOneOperand(register, 255 /* DEC */, 1 /* DEC */);
    };
    // mov_r_r(src: reg.Register, dst: reg.Register) {
    //     return this.insRegToReg(src, dst, OP.MOV);
    // }
    Encoder.prototype.movq_r_r = function (src, dst) {
        if (!(src instanceof reg.Register64) || !(dst instanceof reg.Register64))
            throw Error('`movq` is defined only on 64-bit registers.');
        return this.insRegToReg(src, dst, 137 /* MOV */);
    };
    Encoder.prototype.movq_m_r = function (src, dst) {
        return this.insMemToReg(src, dst, 137 /* MOV */);
    };
    Encoder.prototype.movq_imm_r = function (imm, dst) {
        return this.insOneOperand(dst, 199 /* MOVQ */, 0, true, false, [imm]);
    };
    Encoder.prototype.movq_r_m = function (src, dst) {
        this.insRegToMem(src, dst, 137 /* MOV */);
    };
    Encoder.prototype.movabs = function (imm, dst) {
        if (!(dst instanceof reg.Register64))
            throw Error('`movabs` operates only on 64-bit registers.');
        return this.insOneOperand(dst, 184 /* MOVABS */, 0, true, true, imm);
    };
    Encoder.prototype.movq = function (src, dst) {
    };
    Encoder.prototype.mov = function (src, dst) {
        if (src instanceof reg.Register64) {
            if (dst instanceof reg.Register64)
                return this.movq_r_r(src, dst);
            else if (dst instanceof reg.MemoryReference)
                return this.movq_r_m(src, dst);
            else
                throw Error("Destination operand [" + dst.toString() + "] invalid.");
        }
        else if (src instanceof reg.Register32) {
        }
    };
    Encoder.prototype.movl_imm_r32 = function (imm, dst) {
        return this.insOneOperand(dst, 184 /* MOVL */, 0, true, true, [imm]);
    };
    Encoder.prototype.movl_r_r = function (src, dst) {
        return this.insRegToReg(src, dst, 137 /* MOV */, false);
    };
    Encoder.prototype.movb_r_r = function (src, dst) {
        return this.insRegToReg(src, dst, 137 /* MOV */, false);
    };
    Encoder.prototype.nop = function (size) {
        if (size === void 0) { size = 1; }
    };
    Encoder.prototype.nopw = function () {
        return this.nop(2);
    };
    Encoder.prototype.nopl = function () {
        return this.nop(4);
    };
    return Encoder;
}());
exports.Encoder = Encoder;
// Generates logically equivalent code to `Encoder` but the actual
// bytes of the machine code will likely differ, because `FuzzyEncoder`
// picks at random one of the possible instructions when multiple instructions
// can perform the same operation. Here are some examples:
//
//  - Bits in `REX` prefix are ignored if they don't have an effect on the instruction.
//  - Register-to-register `MOV` instruction can be encoded in two different ways.
//  - Up to four prefixes may be added to instruction, if they are not used, they are ignored.
//  - There can be many different *no-op* instruction that are used to fill in padding for byte alignment, for example:
//
//     mov %rax, %rax
//     add $0, %rax
//     ...
var FuzzyEncoder = (function (_super) {
    __extends(FuzzyEncoder, _super);
    function FuzzyEncoder() {
        _super.apply(this, arguments);
    }
    FuzzyEncoder.prototype.oneOrZero = function () {
        return Math.random() > 0.5 ? 1 : 0;
    };
    FuzzyEncoder.prototype.rexRegToReg = function (src, dst) {
        var rex = _super.prototype.rexRegToReg.call(this, src, dst);
        if (rex) {
            // `REX.X` bit is not used in *register-to-register* instructions.
            rex = (rex & 1) | (this.oneOrZero() << 1);
        }
        return rex;
    };
    return FuzzyEncoder;
}(Encoder));
exports.FuzzyEncoder = FuzzyEncoder;

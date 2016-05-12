"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var reg = require('./regfile');
exports.RM_NEEDS_SIB = 4;
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
        if (src.base && src.base.size == 64)
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
    Encoder.prototype.rexRegToMem = function (src, dst) {
        var W = 0, R = 0, X = 0, B = 0;
        if (dst.base && dst.base.size == 64)
            W = 1;
        else if (src.size == 64)
            W = 1;
        if (src.isExtended)
            R = 1;
        if (dst.base && dst.base.isExtended)
            B = 1;
        if (dst.index && dst.index.isExtended)
            X = 1;
        return W || R || X || B ? this.rex(W, R, X, B) : null;
    };
    Encoder.prototype.rexMem = function (r, ref) {
        var W = 0, R = 0, X = 0, B = 0;
        if (ref.base && ref.base.size == 64)
            W = 1;
        else if (r.size == 64)
            W = 1;
        if (r.isExtended)
            R = 1;
        if (ref.base && ref.base.isExtended)
            B = 1;
        if (ref.index && ref.index.isExtended)
            X = 1;
        return W || R || X || B ? this.rex(W, R, X, B) : null;
    };
    Encoder.prototype.getDisplacementSize = function (disp) {
        if ((disp <= 0x7f) && (disp >= -0x80))
            return 0 /* BYTE */;
        if ((disp <= 0x7fffffff) && (disp >= -0x80000000))
            return 2 /* LONG */;
        throw Error("Displacement " + disp + " too big.");
    };
    // Creates a Mod-REG-R/M byte, `mod` is mode, `register` is ID of the first register,
    // `rm` is ID of the 2nd register or memory value.
    Encoder.prototype.modrm = function (mod, register, rm) {
        // return ((mod & 0b11) << 6) | ((register & 0b111) << 3) | (rm & 0b111);
        // return (mod << 6) + (register << 3) + rm;
        return (mod << 6) | (register << 3) | rm;
    };
    Encoder.prototype.modrmPack = function (modrm) {
        return this.modrm(modrm.mod, modrm.reg, modrm.rm);
    };
    Encoder.prototype.modrmOneOperand = function (dst, opreg) {
        if (opreg === void 0) { opreg = 0; }
        return {
            mod: 3 /* REG_TO_REG */,
            reg: opreg,
            rm: dst.id
        };
    };
    Encoder.prototype.modrmRegToReg = function (src, dst) {
        return {
            mod: 3 /* REG_TO_REG */,
            reg: src.id,
            rm: dst.id
        };
    };
    Encoder.prototype.modrmMemToReg = function (src, dst, mod) {
        if (mod === void 0) { mod = 0 /* INDIRECT */; }
        var rm = src.base.id;
        // There will be a `SIB` byte, we have to set `R/M` to `0b100` = `RM_NEEDS_SIB`.
        var need_sib = !!src.index;
        if (need_sib)
            rm = exports.RM_NEEDS_SIB;
        return {
            mod: mod,
            reg: dst.id,
            rm: rm
        };
    };
    Encoder.prototype.modrmRegToMem = function (src, dst, mod) {
        if (mod === void 0) { mod = 0 /* INDIRECT */; }
        var rm = dst.base.id;
        // There will be a `SIB` byte, we have to set `R/M` to `0b100`.
        var need_sib = !!dst.index;
        if (need_sib)
            rm = exports.RM_NEEDS_SIB;
        return {
            mod: mod,
            reg: src.id,
            rm: rm
        };
    };
    Encoder.prototype.modrmMem = function (r, ref, mod) {
        if (mod === void 0) { mod = 0 /* INDIRECT */; }
        var rm = ref.base ? ref.base.id : 0;
        // There will be a `SIB` byte, we have to set `R/M` to `0b100`.
        var need_sib = !!ref.index;
        if (need_sib)
            rm = exports.RM_NEEDS_SIB;
        return {
            mod: mod,
            reg: r.id,
            rm: rm
        };
    };
    Encoder.prototype.isSibNeeded = function (modrm, ref) {
        return !!ref.index || (modrm.rm == exports.RM_NEEDS_SIB) ? true : false;
    };
    Encoder.prototype.sib = function (scale, index, base) {
        return (scale << 6) | (index << 3) | base;
    };
    Encoder.prototype.sibPack = function (sib) {
        return this.sib(sib.scale, sib.index, sib.base);
    };
    Encoder.prototype.sibFromRef = function (ref) {
        return {
            scale: ref.scale,
            index: ref.index ? ref.index.id : 0,
            base: ref.base ? ref.base.id : 0
        };
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
        // Op-code
        if (reg_in_op) {
            op |= r.id;
            ins.push(op);
        }
        else {
            ins.push(op);
            // Mod-R/M
            var modrm = this.modrmOneOperand(r, opreg);
            ins.push(this.modrmPack(modrm));
        }
        // Immediate
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
        // Op-code
        op = (op & 253) | 0 /* REG_IS_SRC */;
        ins.push(op);
        // Mod-R/M
        var modrm = this.modrmRegToReg(src, dst);
        ins.push(this.modrmPack(modrm));
        return ins;
    };
    Encoder.prototype.insMemToReg = function (src, dst, op, hasRex, op_size) {
        if (hasRex === void 0) { hasRex = true; }
        if (op_size === void 0) { op_size = 1 /* WORD */; }
        var ins = [];
        if (hasRex) {
            var rex = this.rexMemToReg(src, dst);
            if (rex)
                ins.push(rex);
        }
        // Set op-code's direction and size bits.
        // op |= OP_DIRECTION.REG_IS_DST;
        op = (op & 253) | 2 /* REG_IS_DST */;
        op = (op & 254) | op_size;
        ins.push(op);
        var mod = 0 /* INDIRECT */;
        if (src.displacement) {
            var disp_size = this.getDisplacementSize(src.displacement);
            if (disp_size == 0 /* BYTE */)
                mod = 1 /* DISP8 */;
            else
                mod = 2 /* DISP32 */;
        }
        // Mod-R/M
        var modrm = this.modrmMemToReg(src, dst, mod);
        ins.push(this.modrmPack(modrm));
        // SIB
        if (this.isSibNeeded(modrm, src)) {
            var sib = this.sibFromRef(src);
            ins.push(this.sibPack(sib));
        }
        // Displacement
        if (src.displacement) {
            if (mod == 1 /* DISP8 */)
                ins.push(src.displacement); // Only one byte.
            else
                this.pushConstant(ins, src.displacement);
        }
        return ins;
    };
    Encoder.prototype.insRegToMem = function (src, dst, op, hasRex, op_size) {
        if (hasRex === void 0) { hasRex = true; }
        if (op_size === void 0) { op_size = 1 /* WORD */; }
        var ins = [];
        if (hasRex) {
            var rex = this.rexRegToMem(src, dst);
            if (rex)
                ins.push(rex);
        }
        op = (op & 253) | 0 /* REG_IS_SRC */;
        op = (op & 254) | op_size;
        ins.push(op);
        var mod = 0 /* INDIRECT */;
        if (dst.displacement) {
            var disp_size = this.getDisplacementSize(dst.displacement);
            if (disp_size == 0 /* BYTE */)
                mod = 1 /* DISP8 */;
            else
                mod = 2 /* DISP32 */;
        }
        // Mod-R/M
        var modrm = this.modrmRegToMem(src, dst, mod);
        ins.push(this.modrmPack(modrm));
        // SIB
        if (this.isSibNeeded(modrm, dst)) {
            var sib = this.sibFromRef(dst);
            ins.push(this.sibPack(sib));
        }
        // Displacement
        if (dst.displacement) {
            if (mod == 1 /* DISP8 */)
                ins.push(dst.displacement); // Only one byte.
            else
                this.pushConstant(ins, dst.displacement);
        }
        return ins;
    };
    // Operation where one operand is a memory reference.
    Encoder.prototype.insMem = function (src, dst, op, hasRex, op_size) {
        if (hasRex === void 0) { hasRex = true; }
        if (op_size === void 0) { op_size = 1 /* WORD */; }
        var ins = [];
        var r, ref;
        if (src instanceof reg.Register) {
            r = src;
            ref = dst;
        }
        else {
            r = dst;
            ref = src;
        }
        // REX prefix
        if (hasRex) {
            var rex = this.rexMem(r, ref);
            if (rex)
                ins.push(rex);
        }
        // Set direction of the reg-to-mem or mem-to-reg.
        op = (op & 253) | (r === src ? 0 /* REG_IS_SRC */ : 2 /* REG_IS_DST */);
        // TODO: Size of the operands, make this actually useful.
        op = (op & 254) | op_size;
        // Op-code
        ins.push(op);
        var mod = 0 /* INDIRECT */;
        if (ref.displacement) {
            var disp_size = this.getDisplacementSize(ref.displacement);
            if (disp_size == 0 /* BYTE */)
                mod = 1 /* DISP8 */;
            else
                mod = 2 /* DISP32 */;
        }
        // Mod-R/M
        var modrm = this.modrmMem(r, ref, mod);
        ins.push(this.modrmPack(modrm));
        // SIB
        if (this.isSibNeeded(modrm, ref)) {
            var sib = this.sibFromRef(ref);
            ins.push(this.sibPack(sib));
        }
        // Displacement
        if (ref.displacement) {
            if (mod == 1 /* DISP8 */)
                ins.push(ref.displacement); // Only one byte.
            else
                this.pushConstant(ins, ref.displacement); // Push bytes in reverse order.
        }
        return ins;
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
    Encoder.prototype.mov_r_r = function (src, dst) {
        return this.insRegToReg(src, dst, 137 /* MOV */);
    };
    Encoder.prototype.movq_m_r = function (src, dst) {
        return this.insMem(src, dst, 137 /* MOV */);
        // return this.insMemToReg(src, dst, OP.MOV);
    };
    Encoder.prototype.movq_imm_r = function (imm, dst) {
        return this.insOneOperand(dst, 199 /* MOVQ */, 0, true, false, [imm]);
    };
    Encoder.prototype.movq_r_m = function (src, dst) {
        return this.insMem(src, dst, 137 /* MOV */);
        // return this.insRegToMem(src, dst, OP.MOV);
    };
    Encoder.prototype.movq_rm = function (src, dst) {
        return this.insRegToReg(src, dst, 137 /* MOV */);
    };
    Encoder.prototype.mov_rm = function (src, dst) {
        return this.insRegToReg(src, dst, 137 /* MOV */);
    };
    Encoder.prototype.movabs = function (imm, dst) {
        if (!(dst instanceof reg.Register64))
            throw Error('`movabs` operates only on 64-bit registers.');
        return this.insOneOperand(dst, 184 /* MOVABS */, 0, true, true, imm);
    };
    Encoder.prototype.movq = function (src, dst) {
        if (src instanceof reg.MemoryReference) {
            if (dst instanceof reg.MemoryReference)
                throw Error("Cannot do memory-to-memory operation: movq " + src.toString() + ", " + dst.toString());
            else if (dst instanceof reg.Register)
                return this.insMem(src, dst, 137 /* MOV */);
            else
                throw Error("Invalid operand type: movq " + src.toString() + ", " + dst);
        }
        else if (src instanceof reg.Register) {
            if (dst instanceof reg.MemoryReference)
                return this.insMem(src, dst, 137 /* MOV */);
            else if (dst instanceof reg.Register)
                return this.insRegToReg(src, dst, 137 /* MOV */);
            else
                throw Error("Invalid operand type: movq " + src.toString() + ", " + dst);
        }
        else if (typeof src == 'number') {
            var imm = src;
            if (dst instanceof reg.Register) {
                this.insOneOperand(dst, 199 /* MOVQ */, 0, true, true, [imm]);
            }
            else
                throw Error("Invalid operand type: movq $" + src + ", " + dst);
        }
        else if ((src instanceof Array) && (src.length == 2)) {
            var imm64 = src;
            if (dst instanceof reg.Register)
                return this.movabs(imm64, dst);
            else
                throw Error("Invalid operand type: movq $, " + dst);
        }
        throw Error('Invalid operand types: movq');
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

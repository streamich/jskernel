"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var operand_1 = require('./operand');
// # x86_64 Instruction
//
// Each CPU instruction is encoded in the following form, where only
// *Op-code* byte is required:
//
//     |-------------------------------------------------|--------------------------------------------|
//     |                  Instruction                    |               Next instruction             |
//     |-------------------------------------------------|--------------------------------------------|
//     |byte 1   |byte 2   |byte 3   |byte 4   |byte 5   |
//     |---------|---------|---------|---------|---------|                     ...
//     |REX      |Op-code  |Mod-R/M  |SIB      |Immediat |                     ...
//     |---------|---------|---------|---------|---------|                     ...
//     |optional |required |optional |optional |optional |
//     |-------------------------------------------------|
var InstructionPart = (function () {
    function InstructionPart() {
    }
    return InstructionPart;
}());
exports.InstructionPart = InstructionPart;
var Prefix = (function (_super) {
    __extends(Prefix, _super);
    function Prefix() {
        _super.apply(this, arguments);
    }
    return Prefix;
}(InstructionPart));
exports.Prefix = Prefix;
// ## REX
//
// REX is an optional prefix used for two reasons:
//
//  1. For 64-bit instructions that require this prefix to be used.
//  2. When using extended registers: r8, r9, r10, etc..; r8d, r9d, r10d, etc...
//
// REX byte layout:
//
//     76543210
//     .1..WRXB
//     .......B <--- R/M field in Mod-R/M byte, or BASE field in SIB byte addresses one of the extended registers.
//     ......X <---- INDEX field in SIB byte addresses one of the extended registers.
//     .....R <----- REG field in Mod-R/M byte addresses one of the extended registers.
//     ....W <------ Used instruction needs REX prefix.
//     .1 <--------- 0x40 identifies the REX prefix.
var PrefixRex = (function (_super) {
    __extends(PrefixRex, _super);
    function PrefixRex(W, R, X, B) {
        _super.call(this);
        this.W = W;
        this.R = R;
        this.X = X;
        this.B = B;
    }
    PrefixRex.prototype.write = function (arr) {
        if (this.W || this.R || this.X || this.B)
            arr.push(64 | (this.W << 3) | (this.R << 2) | (this.X << 1) | this.B);
        return arr;
    };
    return PrefixRex;
}(Prefix));
exports.PrefixRex = PrefixRex;
// ## Op-code
//
// Primary op-code of the instruction. Often the lower 2 or 3 bits of the
// instruction op-code may be set independently.
//
// `d` and `s` bits, specify: d - direction of the instruction, and s - size of the instruction.
//  - **s**
//      - 1 -- word size
//      - 0 -- byte size
//  - **d**
//      - 1 -- register is destination
//      - 0 -- register is source
//
//     76543210
//     ......ds
//
// Lower 3 bits may also be used to encode register for some instructions. We set
// `.regInOp = true` if that is the case.
//
//     76543210
//     .....000 = RAX
var Opcode = (function (_super) {
    __extends(Opcode, _super);
    function Opcode() {
        _super.apply(this, arguments);
        // Main op-code value.
        this.op = 0;
        // Whether lower 3 bits of op-code should hold register address.
        this.regInOp = false;
        // Whether register is destination of this instruction, on false register is
        // the source, basically this specifies the `d` bit in op-code.
        this.regIsDest = true;
        // `s` bit encoding in op-code, which tells whether instruction operates on "words" or "bytes".
        this.isSizeWord = true;
    }
    Opcode.prototype.write = function (arr) {
        arr.push(this.op);
        return arr;
    };
    Opcode.MASK_SIZE = 254; // `s` bit
    Opcode.MASK_DIRECTION = 253; // `d` bit
    Opcode.MASK_OP = 248; // When register is encoded into op-code.
    Opcode.SIZE = {
        BYTE: 0,
        WORD: 1
    };
    Opcode.DIRECTION = {
        REG_IS_SRC: 0,
        REG_IS_DST: 2
    };
    return Opcode;
}(InstructionPart));
exports.Opcode = Opcode;
// ## Mod-R/M
//
// Mod-R/M is an optional byte after the op-code that specifies the direction
// of operation or extends the op-code.
//
//     76543210
//     .....XXX <--- R/M field: Register or Memory
//     ..XXX <------ REG field: Register or op-code extension
//     XX <--------- MOD field: mode of operation
var Modrm = (function (_super) {
    __extends(Modrm, _super);
    function Modrm(mod, reg, rm) {
        _super.call(this);
        this.mod = 0;
        this.reg = 0;
        this.rm = 0;
        this.mod = mod;
        this.reg = reg;
        this.rm = rm;
    }
    Modrm.prototype.write = function (arr) {
        if (arr === void 0) { arr = []; }
        arr.push((this.mod << 6) | (this.reg << 3) | this.rm);
        return arr;
    };
    // Two bits of `MOD` field in `Mod-R/M` byte.
    Modrm.MOD = {
        INDIRECT: 0,
        DISP8: 1,
        DISP32: 2,
        REG_TO_REG: 3
    };
    // When this value is encoded in R/M field, SIB byte has to follow Mod-R/M byte.
    Modrm.RM_NEEDS_SIB = 4;
    return Modrm;
}(InstructionPart));
exports.Modrm = Modrm;
// ## SIB
//
// SIB (scale-index-base) is optional byte used when dereferencing memory
// with complex offset, like when you do:
//
//     mov rax, [rbp + rdx * 8]
//
// The above operation in SIB byte is encoded as follows:
//
//     rbp + rdx * 8 = BASE + INDEX * USERSCALE
//
// Where `USERSCALE` can only be 1, 2, 4 or 8; and is encoded as follows:
//
//     USERSCALE (decimal) | SCALE (binary)
//     ------------------- | --------------
//     1                   | 00
//     2                   | 01
//     4                   | 10
//     8                   | 11
//
// The layout of SIB byte:
//
//     76543210
//     .....XXX <--- BASE field: base register address
//     ..XXX <------ INDEX field: address of register used as scale
//     XX <--------- SCALE field: specifies multiple of INDEX: USERSCALE * INDEX
var Sib = (function (_super) {
    __extends(Sib, _super);
    function Sib(userscale, I, B) {
        _super.call(this);
        this.S = 0;
        this.I = 0;
        this.B = 0;
        this.setScale(userscale);
        this.I = I;
        this.B = B;
    }
    Sib.prototype.setScale = function (userscale) {
        switch (userscale) {
            case 1:
                this.S = 0;
                break;
            case 2:
                this.S = 1;
                break;
            case 4:
                this.S = 2;
                break;
            case 8:
                this.S = 3;
                break;
            default: throw TypeError("User scale must be on of [1, 2, 4, 8], given: " + userscale + ".");
        }
    };
    Sib.prototype.write = function (arr) {
        if (arr === void 0) { arr = []; }
        arr.push((this.S << 6) | (this.I << 3) | this.B);
        return arr;
    };
    return Sib;
}(InstructionPart));
exports.Sib = Sib;
// ## Immediate
//
// Immediate constant value that follows other instructio bytes.
var Immediate = (function (_super) {
    __extends(Immediate, _super);
    function Immediate() {
        _super.apply(this, arguments);
    }
    Immediate.prototype.write = function (arr) {
        if (arr === void 0) { arr = []; }
        arr.push(0);
        return arr;
    };
    return Immediate;
}(InstructionPart));
exports.Immediate = Immediate;
// Collection of operands an instruction might have. It might
// have *destination* and *source* operands and a possible *immediate* constant.
var Operands = (function () {
    function Operands(dst, src, imm) {
        if (dst === void 0) { dst = null; }
        if (src === void 0) { src = null; }
        if (imm === void 0) { imm = null; }
        this.dst = null; // Destination
        this.src = null; // Source
        this.imm = null; // Immediate
        this.dst = dst;
        this.src = src;
        this.imm = imm;
    }
    return Operands;
}());
exports.Operands = Operands;
// ## x86_64 `Instruction`
//
// `Instruction` object is created using instruction `Definition` and `Operands` provided by the user,
// out of those `Instruction` generates `InstructionPart`s, which then can be packaged into machine
// code using `.write()` method.
var Instruction = (function () {
    function Instruction(def, op) {
        this.def = null;
        this.op = null;
        // Instruction parts.
        this.prefixes = [];
        this.opcode = new Opcode; // required
        this.modrm = null;
        this.sib = null;
        this.immediate = null;
        // Direction for register-to-register `MOV` operations, whether REG field of Mod-R/M byte is destination.
        this.regToRegDirectionRegIsDst = true;
        // Index where instruction was inserted in `Code`s buffer.
        this.index = 0;
        // Byte offset of the instruction in compiled machine code.
        this.offset = 0;
        this.def = def;
        this.op = op;
        this.create();
    }
    Instruction.prototype.write = function (arr) {
        for (var _i = 0, _a = this.prefixes; _i < _a.length; _i++) {
            var pfx = _a[_i];
            pfx.write(arr);
        }
        this.opcode.write(arr);
        if (this.modrm)
            this.modrm.write(arr);
        if (this.sib)
            this.sib.write(arr);
        if (this.immediate)
            this.immediate.write(arr);
        return arr;
    };
    Instruction.prototype.create = function () {
        var op = this.op;
        var dstreg = null;
        var dstmem = null;
        var srcreg = null;
        var srcmem = null;
        // Destination
        if (op.dst instanceof operand_1.Register)
            dstreg = op.dst;
        else if (op.dst instanceof operand_1.Memory)
            dstmem = op.dst;
        else
            throw TypeError("Destination operand should be Register or Memory; given: " + op.dst.toString());
        // Source
        if (op.src) {
            if (op.src instanceof operand_1.Register)
                srcreg = op.src;
            else if (op.src instanceof operand_1.Memory)
                srcmem = op.src;
            else if (!(op.src instanceof operand_1.Constant))
                throw TypeError("Source operand should be Register, Memory or Constant");
        }
        // Create instruction parts.
        this.createPrefixes(dstreg, dstmem, srcreg, srcmem);
        this.createOpcode(dstreg, dstmem, srcreg, srcmem);
        this.createModrm(dstreg, dstmem, srcreg, srcmem);
        this.createSib(dstreg, dstmem, srcreg, srcmem);
        this.createImmediate(dstreg, dstmem, srcreg, srcmem);
    };
    Instruction.prototype.createPrefixes = function (dstreg, dstmem, srcreg, srcmem) {
        if (this.def.mandatoryRex || dstreg.isExtended)
            this.prefixes.push(this.createRex(dstreg, dstmem, srcreg, srcmem));
    };
    Instruction.prototype.createRex = function (dstreg, dstmem, srcreg, srcmem) {
        var W = 0, R = 0, X = 0, B = 0;
        if (this.def.mandatoryRex)
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
        return new PrefixRex(W, R, X, B);
    };
    Instruction.prototype.createOpcode = function (dstreg, dstmem, srcreg, srcmem) {
        var def = this.def;
        var opcode = this.opcode;
        opcode.op = def.op;
        if (def.regInOp) {
            // We have register encoded in op-code here.
            if (!dstreg)
                throw TypeError("Operation needs destination register.");
            opcode.op = (opcode.op & Opcode.MASK_OP) | dstreg.id;
        }
        else {
            // Direction bit `d`
            var direction = Opcode.DIRECTION.REG_IS_SRC;
            if (dstreg) {
                direction = Opcode.DIRECTION.REG_IS_DST;
                // *reg-to-reg* `MOV` operation
                if (srcreg && (opcode.op == 137 /* MOV */)) {
                    if (this.regToRegDirectionRegIsDst)
                        direction = Opcode.DIRECTION.REG_IS_DST;
                    else
                        direction = Opcode.DIRECTION.REG_IS_SRC;
                }
            }
            opcode.op = (opcode.op & Opcode.MASK_DIRECTION) | direction;
            // Size bit `s`
            opcode.op = (opcode.op & Opcode.MASK_SIZE) | (Opcode.SIZE.WORD);
        }
        opcode.regIsDest = def.regIsDest;
        opcode.isSizeWord = def.isSizeWord;
        opcode.regInOp = def.regInOp;
    };
    Instruction.prototype.createModrm = function (dstreg, dstmem, srcreg, srcmem) {
        if (srcreg || srcmem || dstmem) {
            var mod = 0, reg = 0, rm = 0;
            if (srcreg && dstreg) {
                mod = Modrm.MOD.REG_TO_REG;
                // Remove `d` and `s` bits.
                var is_mov = (137 /* MOV */ >> 2) === (this.opcode.op >> 2);
                if (!is_mov) {
                    reg = dstreg.id;
                    rm = srcreg.id;
                }
                else {
                    // *reg-to-reg* `MOV` operation
                    if (this.regToRegDirectionRegIsDst) {
                        reg = dstreg.id;
                        rm = srcreg.id;
                    }
                    else {
                        reg = srcreg.id;
                        rm = dstreg.id;
                    }
                }
            }
            else {
                var r = srcreg || dstreg;
                var mem = srcmem || dstmem;
                reg = r.id;
                rm = mem.base ? mem.base.id : Modrm.RM_NEEDS_SIB;
                if (mem.disp) {
                    if (mem.disp.size === operand_1.Displacement.SIZE.DISP8)
                        mod = Modrm.MOD.DISP8;
                    else
                        mod = Modrm.MOD.DISP32;
                }
                else
                    mod = Modrm.MOD.INDIRECT;
            }
            this.modrm = new Modrm(mod, reg, rm);
        }
    };
    Instruction.prototype.createSib = function (dstreg, dstmem, srcreg, srcmem) {
        if (!this.modrm || (this.modrm.rm != Modrm.RM_NEEDS_SIB))
            return;
        var mem = srcmem || dstmem;
        var userscale = 0, I = 0, B = 0;
        if (mem.scale)
            userscale = mem.scale.value; // TODO: what about 0?
        if (mem.index)
            I = mem.index.id;
        if (mem.base)
            B = mem.base.id;
        this.sib = new Sib(userscale, I, B);
    };
    Instruction.prototype.createImmediate = function (dstreg, dstmem, srcreg, srcmem) {
    };
    return Instruction;
}());
exports.Instruction = Instruction;
// Generates logically equivalent code to `Instruction` but the actual
// bytes of the machine code will likely differ, because `FuzzyInstruction`
// picks at random one of the possible instructions when multiple instructions
// can perform the same operation. Here are some examples:
//
//  - Bits in `REX` prefix are ignored if they don't have an effect on the instruction.
//  - Register-to-register `MOV` instruction can be encoded in two different ways.
//  - Up to four prefixes may be added to instruction, if they are not used, they are ignored.
//  - There can be many different *no-op* instruction that are used to fill in padding, for example:
//
//     mov %rax, %rax
//     add $0, %rax
var FuzzyInstruction = (function (_super) {
    __extends(FuzzyInstruction, _super);
    function FuzzyInstruction() {
        _super.apply(this, arguments);
        this.regToRegDirectionRegIsDst = !(Math.random() > 0.5);
    }
    FuzzyInstruction.prototype.oneOrZero = function () {
        return Math.random() > 0.5 ? 1 : 0;
    };
    // Randomize unused bits in REX byte.
    FuzzyInstruction.prototype.createRex = function (dstreg, dstmem, srcreg, srcmem) {
        var rex = _super.prototype.createRex.call(this, dstreg, dstmem, srcreg, srcmem);
        if (!dstmem && !srcmem) {
            rex.X = this.oneOrZero();
            if (!srcreg)
                rex.B = this.oneOrZero();
        }
        return rex;
    };
    return FuzzyInstruction;
}(Instruction));
exports.FuzzyInstruction = FuzzyInstruction;

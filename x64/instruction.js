"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
            arr.push(64 | (this.W << 3) + (this.R << 2) + (this.X << 1) + this.B);
        return arr;
    };
    return PrefixRex;
}(Prefix));
exports.PrefixRex = PrefixRex;
exports.OP_DIRECTION_MASK = 253;
var Opcode = (function (_super) {
    __extends(Opcode, _super);
    function Opcode() {
        _super.apply(this, arguments);
        // Primary op-code of the instructions. Often the lower 2 or 3 bits of the
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
        this.op = 0;
        // Wheter lower 3 bits of op-code should hold register address.
        this.regInOp = false;
        // Wheter register is destination of this instruction, on false register is
        // the source, basically this specifies the `d` bit in op-code.
        this.regIsDest = true;
        // `s` bit encoding in op-code, which tells whether instruction operates on "words" or "bytes".
        this.isSizeWord = true;
    }
    Opcode.prototype.write = function (arr) {
        arr.push(this.op);
        return arr;
    };
    return Opcode;
}(InstructionPart));
exports.Opcode = Opcode;
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
    return Modrm;
}(InstructionPart));
exports.Modrm = Modrm;
// ## SIB
//
// SIB is optional byte used when dereferencing memory.
var Sib = (function (_super) {
    __extends(Sib, _super);
    function Sib(scale, index, base) {
        _super.call(this);
        this.scale = 0;
        this.index = 0;
        this.base = 0;
        this.scale = scale;
        this.index = index;
        this.base = base;
    }
    Sib.prototype.write = function (arr) {
        if (arr === void 0) { arr = []; }
        arr.push((this.scale << 6) | (this.index << 3) | this.base);
        return arr;
    };
    return Sib;
}(InstructionPart));
exports.Sib = Sib;
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
var Instruction = (function () {
    function Instruction(def, op) {
        this.def = null;
        this.op = null;
        this.parts = [];
        // Index where instruction was inserted in `Compiler`s buffer.
        this.index = 0;
        // Byte offset of the instruction in compiled machine code.
        this.offset = 0;
        this.def = def;
        this.op = op;
    }
    Instruction.prototype.write = function (arr) {
        for (var _i = 0, _a = this.parts; _i < _a.length; _i++) {
            var part = _a[_i];
            part.write(arr);
        }
        return arr;
    };
    return Instruction;
}());
exports.Instruction = Instruction;

"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var regfile_1 = require('./regfile');
var util_1 = require('../util');
(function (SIZE) {
    SIZE[SIZE["BYTE"] = 8] = "BYTE";
    SIZE[SIZE["WORD"] = 16] = "WORD";
    SIZE[SIZE["DOUBLE"] = 32] = "DOUBLE";
    SIZE[SIZE["QUAD"] = 64] = "QUAD";
})(exports.SIZE || (exports.SIZE = {}));
var SIZE = exports.SIZE;
(function (MODE) {
    MODE[MODE["REAL"] = 0] = "REAL";
    MODE[MODE["COMPAT"] = 1] = "COMPAT";
    MODE[MODE["X64"] = 2] = "X64";
})(exports.MODE || (exports.MODE = {}));
var MODE = exports.MODE;
// General operand used in our assembly "language".
var Operand = (function () {
    function Operand() {
    }
    // Convenience method to get `Register` associated with `Register` or `Memory`.
    Operand.prototype.reg = function () {
        return null;
    };
    Operand.prototype.isRegister = function () {
        return this instanceof Register;
    };
    Operand.prototype.isMemory = function () {
        return this instanceof Memory;
    };
    Operand.prototype.toString = function () {
        return '[operand]';
    };
    return Operand;
}());
exports.Operand = Operand;
var Constant = (function (_super) {
    __extends(Constant, _super);
    function Constant(value, signed) {
        if (value === void 0) { value = 0; }
        if (signed === void 0) { signed = true; }
        _super.call(this);
        // Size in bits.
        this.size = 0;
        this.value = 0;
        // Each byte as a `number` in reverse order.
        this.octets = [];
        this.signed = true;
        this.signed = signed;
        this.setValue(value);
    }
    Constant.sizeClass = function (value) {
        if ((value <= 0x7f) && (value >= -0x80))
            return SIZE.BYTE;
        if ((value <= 0x7fff) && (value >= -0x8000))
            return SIZE.WORD;
        if ((value <= 0x7fffffff) && (value >= -0x80000000))
            return SIZE.DOUBLE;
        return SIZE.QUAD;
    };
    Constant.sizeClassUnsigned = function (value) {
        if (value <= 0xff)
            return SIZE.BYTE;
        if (value <= 0xffff)
            return SIZE.WORD;
        if (value <= 0xffffffff)
            return SIZE.DOUBLE;
        return SIZE.QUAD;
    };
    Constant.prototype.setValue = function (value) {
        if (value instanceof Array) {
            if (value.length !== 2)
                throw TypeError('number64 must be a 2-tuple, given: ' + value);
            this.setValue64(value);
        }
        else if (typeof value === 'number') {
            var clazz = this.signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
            /* JS integers are 53-bit, so split here `number`s over 32 bits into [number, number]. */
            if (clazz === SIZE.QUAD)
                this.setValue64([util_1.UInt64.lo(value), util_1.UInt64.hi(value)]);
            else
                this.setValue32(value);
        }
        else
            throw TypeError('Constant value must be of type number|number64.');
    };
    Constant.prototype.setValue32 = function (value) {
        var size = this.signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
        this.size = size;
        this.value = value;
        this.octets = [value & 0xFF];
        if (size > SIZE.BYTE)
            this.octets[1] = (value >> 8) & 0xFF;
        if (size > SIZE.WORD) {
            this.octets[2] = (value >> 16) & 0xFF;
            this.octets[3] = (value >> 24) & 0xFF;
        }
    };
    Constant.prototype.setValue64 = function (value) {
        this.size = 64;
        this.value = value;
        this.octets = [];
        var lo = value[0], hi = value[1];
        this.octets[0] = (lo) & 0xFF;
        this.octets[1] = (lo >> 8) & 0xFF;
        this.octets[2] = (lo >> 16) & 0xFF;
        this.octets[3] = (lo >> 24) & 0xFF;
        this.octets[4] = (hi) & 0xFF;
        this.octets[5] = (hi >> 8) & 0xFF;
        this.octets[6] = (hi >> 16) & 0xFF;
        this.octets[7] = (hi >> 24) & 0xFF;
    };
    Constant.prototype.zeroExtend = function (size) {
        if (this.size === size)
            return;
        if (this.size > size)
            throw Error("Already larger than " + size + " bits, cannot zero-extend.");
        var missing_bytes = (size - this.size) / 8;
        this.size = size;
        for (var i = 0; i < missing_bytes; i++)
            this.octets.push(0);
    };
    Constant.prototype.signExtend = function (size) {
        if (this.size === size)
            return;
        if (this.size > size)
            throw Error("Already larger than " + size + " bits, cannot zero-extend.");
        // We know it is not number64, because we don't deal with number larger than 64-bit,
        // and if it was 64-bit already there would be nothing to extend.
        var value = this.value;
        if (size === SIZE.QUAD) {
            this.setValue64([util_1.UInt64.lo(value), util_1.UInt64.hi(value)]);
            return;
        }
        this.size = size;
        this.octets = [value & 0xFF];
        if (size > SIZE.BYTE)
            this.octets[1] = (value >> 8) & 0xFF;
        if (size > SIZE.WORD) {
            this.octets[2] = (value >> 16) & 0xFF;
            this.octets[3] = (value >> 24) & 0xFF;
        }
    };
    Constant.prototype.extend = function (size) {
        if (this.signed)
            this.signExtend(size);
        else
            this.zeroExtend(size);
    };
    Constant.prototype.toString = function () {
        var str = '';
        for (var i = this.octets.length - 1; i >= 0; i--) {
            var oct = this.octets[i];
            str += oct > 0xF ? oct.toString(16).toUpperCase() : '0' + oct.toString(16).toUpperCase();
        }
        return '0x' + str;
    };
    return Constant;
}(Operand));
exports.Constant = Constant;
var Immediate = (function (_super) {
    __extends(Immediate, _super);
    function Immediate() {
        _super.apply(this, arguments);
    }
    Immediate.factory = function (size, value, signed) {
        if (value === void 0) { value = 0; }
        if (signed === void 0) { signed = true; }
        switch (size) {
            case SIZE.BYTE: return new Immediate8(value, signed);
            case SIZE.WORD: return new Immediate16(value, signed);
            case SIZE.DOUBLE: return new Immediate32(value, signed);
            case SIZE.QUAD: return new Immediate64(value, signed);
            default: return new Immediate(value, signed);
        }
    };
    Immediate.throwIfLarger = function (value, size, signed) {
        var val_size = signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
        if (val_size > size)
            throw TypeError("Value " + value + " too big for imm8.");
    };
    return Immediate;
}(Constant));
exports.Immediate = Immediate;
var Immediate8 = (function (_super) {
    __extends(Immediate8, _super);
    function Immediate8() {
        _super.apply(this, arguments);
    }
    Immediate8.prototype.setValue = function (value) {
        Immediate.throwIfLarger(value, SIZE.BYTE, this.signed);
        _super.prototype.setValue.call(this, value);
        this.extend(SIZE.BYTE);
    };
    return Immediate8;
}(Immediate));
exports.Immediate8 = Immediate8;
var Immediate16 = (function (_super) {
    __extends(Immediate16, _super);
    function Immediate16() {
        _super.apply(this, arguments);
    }
    Immediate16.prototype.setValue = function (value) {
        Immediate.throwIfLarger(value, SIZE.WORD, this.signed);
        _super.prototype.setValue.call(this, value);
        this.extend(SIZE.WORD);
    };
    return Immediate16;
}(Immediate));
exports.Immediate16 = Immediate16;
var Immediate32 = (function (_super) {
    __extends(Immediate32, _super);
    function Immediate32() {
        _super.apply(this, arguments);
    }
    Immediate32.prototype.setValue = function (value) {
        Immediate.throwIfLarger(value, SIZE.DOUBLE, this.signed);
        _super.prototype.setValue.call(this, value);
        this.extend(SIZE.DOUBLE);
    };
    return Immediate32;
}(Immediate));
exports.Immediate32 = Immediate32;
var Immediate64 = (function (_super) {
    __extends(Immediate64, _super);
    function Immediate64() {
        _super.apply(this, arguments);
    }
    Immediate64.prototype.setValue = function (value) {
        Immediate.throwIfLarger(value, SIZE.QUAD, this.signed);
        _super.prototype.setValue.call(this, value);
        this.extend(SIZE.QUAD);
    };
    return Immediate64;
}(Immediate));
exports.Immediate64 = Immediate64;
var DisplacementValue = (function (_super) {
    __extends(DisplacementValue, _super);
    function DisplacementValue(value) {
        _super.call(this, value, true);
    }
    DisplacementValue.prototype.setValue32 = function (value) {
        _super.prototype.setValue32.call(this, value);
        /* Make sure `Displacement` is 1 or 4 bytes, not 2. */
        // if(this.size > DisplacementValue.SIZE.DISP8) this.zeroExtend(DisplacementValue.SIZE.DISP32);
    };
    DisplacementValue.SIZE = {
        DISP8: SIZE.BYTE,
        DISP32: SIZE.DOUBLE,
    };
    return DisplacementValue;
}(Constant));
exports.DisplacementValue = DisplacementValue;
// ## Registers
//
// `Register` represents one of `%rax`, `%rbx`, etc. registers.
var Register = (function (_super) {
    __extends(Register, _super);
    function Register(id, size) {
        _super.call(this);
        this.id = 0; // Number value of register.
        this.size = SIZE.QUAD; // Size in bits
        this.id = id;
        this.size = size;
    }
    Register.prototype.reg = function () {
        return this;
    };
    Register.prototype.ref = function () {
        return Memory.factory(this.size).ref(this);
    };
    Register.prototype.ind = function (scale_factor) {
        return Memory.factory(this.size).ind(this, scale_factor);
    };
    Register.prototype.disp = function (value) {
        return Memory.factory(this.size).ref(this).disp(value);
    };
    // Whether the register is one of `%r8`, `%r9`, etc. extended registers.
    Register.prototype.isExtended = function () {
        return this.id > 7;
    };
    Register.prototype.get3bitId = function () {
        return this.id & 7;
    };
    Register.prototype.getName = function () {
        switch (this.size) {
            case SIZE.QUAD: return regfile_1.R64[this.id];
            case SIZE.DOUBLE: return regfile_1.R32[this.id];
            case SIZE.BYTE: return regfile_1.R8[this.id];
            default: return 'REG';
        }
    };
    Register.prototype.toString = function () {
        return this.getName().toLowerCase();
    };
    return Register;
}(Operand));
exports.Register = Register;
var Register8 = (function (_super) {
    __extends(Register8, _super);
    function Register8(id) {
        _super.call(this, id, SIZE.BYTE);
    }
    return Register8;
}(Register));
exports.Register8 = Register8;
var Register16 = (function (_super) {
    __extends(Register16, _super);
    function Register16(id) {
        _super.call(this, id, SIZE.WORD);
    }
    return Register16;
}(Register));
exports.Register16 = Register16;
var Register32 = (function (_super) {
    __extends(Register32, _super);
    function Register32(id) {
        _super.call(this, id, SIZE.DOUBLE);
    }
    return Register32;
}(Register));
exports.Register32 = Register32;
var Register64 = (function (_super) {
    __extends(Register64, _super);
    function Register64(id) {
        _super.call(this, id, SIZE.QUAD);
    }
    return Register64;
}(Register));
exports.Register64 = Register64;
var RegisterRip = (function (_super) {
    __extends(RegisterRip, _super);
    function RegisterRip() {
        _super.call(this, 0);
    }
    RegisterRip.prototype.getName = function () {
        return 'rip';
    };
    return RegisterRip;
}(Register64));
exports.RegisterRip = RegisterRip;
exports.rax = new Register64(regfile_1.R64.RAX);
exports.rbx = new Register64(regfile_1.R64.RBX);
exports.rcx = new Register64(regfile_1.R64.RCX);
exports.rdx = new Register64(regfile_1.R64.RDX);
exports.rsi = new Register64(regfile_1.R64.RSI);
exports.rdi = new Register64(regfile_1.R64.RDI);
exports.rbp = new Register64(regfile_1.R64.RBP);
exports.rsp = new Register64(regfile_1.R64.RSP);
exports.r8 = new Register64(regfile_1.R64.R8);
exports.r9 = new Register64(regfile_1.R64.R9);
exports.r10 = new Register64(regfile_1.R64.R10);
exports.r11 = new Register64(regfile_1.R64.R11);
exports.r12 = new Register64(regfile_1.R64.R12);
exports.r13 = new Register64(regfile_1.R64.R13);
exports.r14 = new Register64(regfile_1.R64.R14);
exports.r15 = new Register64(regfile_1.R64.R15);
exports.rip = new RegisterRip;
exports.eax = new Register32(regfile_1.R32.EAX);
exports.ebx = new Register32(regfile_1.R32.EBX);
exports.ecx = new Register32(regfile_1.R32.ECX);
exports.edx = new Register32(regfile_1.R32.EDX);
exports.esi = new Register32(regfile_1.R32.ESI);
exports.edi = new Register32(regfile_1.R32.EDI);
exports.ebp = new Register32(regfile_1.R32.EBP);
exports.esp = new Register32(regfile_1.R32.ESP);
exports.r8d = new Register32(regfile_1.R32.R8D);
exports.r9d = new Register32(regfile_1.R32.R9D);
exports.r10d = new Register32(regfile_1.R32.R10D);
exports.r11d = new Register32(regfile_1.R32.R11D);
exports.r12d = new Register32(regfile_1.R32.R12D);
exports.r13d = new Register32(regfile_1.R32.R13D);
exports.r14d = new Register32(regfile_1.R32.R14D);
exports.r15d = new Register32(regfile_1.R32.R15D);
exports.ax = new Register16(regfile_1.R16.AX);
exports.bx = new Register16(regfile_1.R16.BX);
exports.cx = new Register16(regfile_1.R16.CX);
exports.dx = new Register16(regfile_1.R16.DX);
exports.si = new Register16(regfile_1.R16.SI);
exports.di = new Register16(regfile_1.R16.DI);
exports.bp = new Register16(regfile_1.R16.BP);
exports.sp = new Register16(regfile_1.R16.SP);
exports.r8w = new Register16(regfile_1.R16.R8W);
exports.r9w = new Register16(regfile_1.R16.R9W);
exports.r10w = new Register16(regfile_1.R16.R10W);
exports.r11w = new Register16(regfile_1.R16.R11W);
exports.r12w = new Register16(regfile_1.R16.R12W);
exports.r13w = new Register16(regfile_1.R16.R13W);
exports.r14w = new Register16(regfile_1.R16.R14W);
exports.r15w = new Register16(regfile_1.R16.R15W);
exports.al = new Register8(regfile_1.R8.AL);
exports.bl = new Register8(regfile_1.R8.BL);
exports.cl = new Register8(regfile_1.R8.CL);
exports.dl = new Register8(regfile_1.R8.DL);
exports.sil = new Register8(regfile_1.R8.SIL);
exports.dil = new Register8(regfile_1.R8.DIL);
exports.bpl = new Register8(regfile_1.R8.BPL);
exports.spl = new Register8(regfile_1.R8.SPL);
exports.r8b = new Register8(regfile_1.R8.R8B);
exports.r9b = new Register8(regfile_1.R8.R9B);
exports.r10b = new Register8(regfile_1.R8.R10B);
exports.r11b = new Register8(regfile_1.R8.R11B);
exports.r12b = new Register8(regfile_1.R8.R12B);
exports.r13b = new Register8(regfile_1.R8.R13B);
exports.r14b = new Register8(regfile_1.R8.R14B);
exports.r15b = new Register8(regfile_1.R8.R15B);
// # Scale
//
// `Scale` used in SIB byte in two bit `SCALE` field.
var Scale = (function (_super) {
    __extends(Scale, _super);
    function Scale(scale) {
        if (scale === void 0) { scale = 1; }
        _super.call(this);
        if (Scale.VALUES.indexOf(scale) < 0)
            throw TypeError("Scale must be one of [1, 2, 4, 8].");
        this.value = scale;
    }
    Scale.prototype.toString = function () {
        return '' + this.value;
    };
    Scale.VALUES = [1, 2, 4, 8];
    return Scale;
}(Operand));
exports.Scale = Scale;
// ## Memory
//
// `Memory` is RAM addresses which `Register`s can *dereference*.
var Memory = (function (_super) {
    __extends(Memory, _super);
    function Memory() {
        _super.apply(this, arguments);
        this.size = 0;
        this.base = null;
        this.index = null;
        this.scale = null;
        this.displacement = null;
    }
    Memory.factory = function (size) {
        switch (size) {
            case SIZE.BYTE: return new Memory8;
            case SIZE.WORD: return new Memory16;
            case SIZE.DOUBLE: return new Memory32;
            case SIZE.QUAD: return new Memory64;
            default: return new Memory;
        }
    };
    Memory.prototype.reg = function () {
        if (this.base)
            return this.base;
        if (this.index)
            return this.index;
        // throw Error('No backing register.');
        return null;
    };
    Memory.prototype.needsSib = function () {
        return !!this.index || !!this.scale;
    };
    Memory.prototype.ref = function (base) {
        // RBP, EBP etc.. always need displacement for ModRM and SIB bytes.
        var is_ebp = (regfile_1.R64.RBP & 7) === base.get3bitId();
        if (is_ebp && !this.displacement)
            this.displacement = new DisplacementValue(0);
        this.base = base;
        return this;
    };
    Memory.prototype.ind = function (index, scale_factor) {
        if (scale_factor === void 0) { scale_factor = 1; }
        if (!(index instanceof Register))
            throw TypeError('Index must by of type Register.');
        var esp = (regfile_1.R64.RSP & 7);
        if (index.get3bitId() === esp)
            throw TypeError('%esp, %rsp or other 0b100 registers cannot be used as addressing index.');
        this.index = index;
        this.scale = new Scale(scale_factor);
        return this;
    };
    Memory.prototype.disp = function (value) {
        this.displacement = new DisplacementValue(value);
        return this;
    };
    Memory.prototype.toString = function () {
        var parts = [];
        if (this.base)
            parts.push(this.base.toString());
        if (this.index)
            parts.push(this.index.toString() + ' * ' + this.scale.toString());
        if (this.displacement)
            parts.push(this.displacement.toString());
        return "[" + parts.join(' + ') + "]";
    };
    return Memory;
}(Operand));
exports.Memory = Memory;
var Memory8 = (function (_super) {
    __extends(Memory8, _super);
    function Memory8() {
        _super.apply(this, arguments);
        this.size = SIZE.BYTE;
    }
    return Memory8;
}(Memory));
exports.Memory8 = Memory8;
var Memory16 = (function (_super) {
    __extends(Memory16, _super);
    function Memory16() {
        _super.apply(this, arguments);
        this.size = SIZE.WORD;
    }
    return Memory16;
}(Memory));
exports.Memory16 = Memory16;
var Memory32 = (function (_super) {
    __extends(Memory32, _super);
    function Memory32() {
        _super.apply(this, arguments);
        this.size = SIZE.DOUBLE;
    }
    return Memory32;
}(Memory));
exports.Memory32 = Memory32;
var Memory64 = (function (_super) {
    __extends(Memory64, _super);
    function Memory64() {
        _super.apply(this, arguments);
        this.size = SIZE.QUAD;
    }
    return Memory64;
}(Memory));
exports.Memory64 = Memory64;
// Collection of operands an instruction might have.
var Operands = (function () {
    // constructor(dst: TInstructionOperand = null, src: TInstructionOperand = null, op3: TInstructionOperand = null, op4: TInstructionOperand = null) {
    function Operands(list) {
        if (list === void 0) { list = []; }
        this.list = list;
        this.dst = list[0], this.src = list[1], this.op3 = list[2], this.op4 = list[3];
    }
    Operands.uiOpsToInsnOps = function (ops) {
        var iops = [];
        for (var _i = 0, ops_1 = ops; _i < ops_1.length; _i++) {
            var op = ops_1[_i];
            if ((op instanceof Memory) || (op instanceof Register) || (op instanceof Immediate)) {
                iops.push(op);
            }
            else if (typeof op === 'number') {
                iops.push(new Immediate(op));
            }
            else if ((op instanceof Array) && (op.length === 2) && (typeof op[0] === 'number') && (typeof op[1] === 'number')) {
                iops.push(new Immediate(op));
            }
            else
                throw TypeError('Invalid operand expected Register, Memory, number or number64.');
        }
        return iops;
    };
    Operands.fromUiOps = function (ops) {
        return new Operands(Operands.uiOpsToInsnOps(ops));
    };
    Operands.prototype.getFirstOfClass = function (Clazz) {
        for (var _i = 0, _a = this.list; _i < _a.length; _i++) {
            var op = _a[_i];
            if (op instanceof Clazz)
                return op;
        }
        return null;
    };
    Operands.prototype.getRegisterOperand = function (dst_first) {
        if (dst_first === void 0) { dst_first = true; }
        var first, second;
        if (dst_first) {
            first = this.dst;
            second = this.src;
        }
        else {
            first = this.src;
            second = this.dst;
        }
        if (first instanceof Register)
            return first;
        if (second instanceof Register)
            return second;
        return null;
    };
    Operands.prototype.getMemoryOperand = function () {
        if (this.dst instanceof Memory)
            return this.dst;
        if (this.src instanceof Memory)
            return this.src;
        return null;
    };
    Operands.prototype.getImmediate = function () {
        return this.getFirstOfClass(Immediate);
    };
    Operands.prototype.hasRegister = function () {
        return !!this.getRegisterOperand();
    };
    Operands.prototype.hasMemory = function () {
        return !!this.getMemoryOperand();
    };
    Operands.prototype.hasRegisterOrMemory = function () {
        return this.hasRegister() || this.hasMemory();
    };
    Operands.prototype.toString = function () {
        var parts = [];
        if (this.dst)
            parts.push(this.dst.toString());
        if (this.src)
            parts.push(this.src.toString());
        if (this.op3)
            parts.push(this.op3.toString());
        if (this.op4)
            parts.push(this.op4.toString());
        return parts.join(', ');
    };
    return Operands;
}());
exports.Operands = Operands;

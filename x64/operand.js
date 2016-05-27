"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var regfile_1 = require('./regfile');
var util_1 = require('./util');
(function (SIZE) {
    SIZE[SIZE["BYTE"] = 8] = "BYTE";
    SIZE[SIZE["WORD"] = 16] = "WORD";
    SIZE[SIZE["DOUBLE"] = 32] = "DOUBLE";
    SIZE[SIZE["QUAD"] = 64] = "QUAD";
})(exports.SIZE || (exports.SIZE = {}));
var SIZE = exports.SIZE;
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
        if (signed === void 0) { signed = true; }
        _super.call(this);
        // Size in bits.
        this.size = 0;
        this.value = 0;
        // Each byte as a `number` in reverse order.
        this.octets = [];
        this.signed = true;
        this.signed = signed;
        this.Value = value;
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
    Object.defineProperty(Constant.prototype, "Value", {
        set: function (value) {
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
        },
        enumerable: true,
        configurable: true
    });
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
    Constant.prototype.toString = function () {
        var str = '';
        for (var i = this.octets.length - 1; i >= 0; i--) {
            str += this.octets[i].toString(16);
        }
        return '0x' + str;
    };
    return Constant;
}(Operand));
exports.Constant = Constant;
var ImmediateValue = (function (_super) {
    __extends(ImmediateValue, _super);
    function ImmediateValue() {
        _super.apply(this, arguments);
    }
    return ImmediateValue;
}(Constant));
exports.ImmediateValue = ImmediateValue;
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
        return (new Memory).ref(this);
    };
    Register.prototype.ind = function (scale_factor) {
        return (new Memory).ind(this, scale_factor);
    };
    Register.prototype.disp = function (value) {
        return (new Memory).ref(this).disp(value);
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
var Register64 = (function (_super) {
    __extends(Register64, _super);
    function Register64(id) {
        _super.call(this, id, SIZE.QUAD);
    }
    return Register64;
}(Register));
exports.Register64 = Register64;
var Register32 = (function (_super) {
    __extends(Register32, _super);
    function Register32(id) {
        _super.call(this, id, SIZE.DOUBLE);
    }
    return Register32;
}(Register));
exports.Register32 = Register32;
var Register16 = (function (_super) {
    __extends(Register16, _super);
    function Register16(id) {
        _super.call(this, id, SIZE.WORD);
    }
    return Register16;
}(Register));
exports.Register16 = Register16;
var Register8 = (function (_super) {
    __extends(Register8, _super);
    function Register8(id) {
        _super.call(this, id, SIZE.BYTE);
    }
    return Register8;
}(Register));
exports.Register8 = Register8;
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
        this.base = null;
        this.index = null;
        this.scale = null;
        this.displacement = null;
    }
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

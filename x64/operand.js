"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util_1 = require('./util');
// # General operand used in our assembly "language".
var Operand = (function () {
    function Operand() {
    }
    Operand.prototype.toString = function () {
        return '[operand]';
    };
    return Operand;
}());
exports.Operand = Operand;
var Constant = (function (_super) {
    __extends(Constant, _super);
    function Constant(value) {
        _super.call(this);
        // Size in bits.
        this.size = 32;
        this.value = 0;
        // Each byte as a `number` in reverse order.
        this.octets = [];
        this.Value = value;
    }
    Constant.sizeClass = function (value) {
        if ((value <= 0x7f) && (value >= -0x80))
            return 8 /* BYTE */;
        if ((value <= 0x7fff) && (value >= -0x8000))
            return 16 /* WORD */;
        if ((value <= 0x7fffffff) && (value >= -0x80000000))
            return 32 /* DOUBLE */;
        return 64 /* QUAD */;
    };
    Object.defineProperty(Constant.prototype, "Value", {
        set: function (value) {
            if (value instanceof Array) {
                if (value.length !== 2)
                    throw TypeError('number64 must be a 2-tuple, given: ' + value);
                this.setValue64(value);
            }
            else if (typeof value === 'number') {
                /* JS integers are 53-bit, so split here `number`s over 32 bits into [number, number]. */
                if (Constant.sizeClass(value) === 64 /* QUAD */)
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
        var size = Constant.sizeClass(value);
        this.size = size;
        this.value = value;
        this.octets = [];
        this.octets[0] = value & 0xFF;
        if (size > 8 /* BYTE */)
            this.octets[1] = (value >> 8) & 0xFF;
        if (size > 16 /* WORD */) {
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
        if (this.size > size)
            throw Error("Already larger than " + size + " bits, cannot zero-extend.");
        var missing_bytes = (size - this.size) / 8;
        this.size = size;
        for (var i = 0; i < missing_bytes; i++)
            this.octets.push(0);
    };
    Constant.prototype.toString = function () {
        return "const[" + this.size + "]: " + this.value;
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
        _super.call(this, value);
        this.size = DisplacementValue.SIZE.DISP8;
    }
    DisplacementValue.prototype.setValue32 = function (value) {
        _super.prototype.setValue32.call(this, value);
        /* Make sure `Displacement` is 1 or 4 bytes, not 2. */
        if (this.size > DisplacementValue.SIZE.DISP8)
            this.zeroExtend(DisplacementValue.SIZE.DISP32);
    };
    DisplacementValue.prototype.setValue64 = function () {
        throw TypeError("Displacement can be only of these sizes: " + DisplacementValue.SIZE.DISP8 + " and " + DisplacementValue.SIZE.DISP32 + ".");
    };
    DisplacementValue.SIZE = {
        DISP8: 8 /* BYTE */,
        DISP32: 32 /* DOUBLE */,
    };
    return DisplacementValue;
}(Constant));
exports.DisplacementValue = DisplacementValue;
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
// ## Registers
//
// `Register` represents one of `%rax`, `%rbx`, etc. registers.
var Register = (function (_super) {
    __extends(Register, _super);
    function Register(name, id, size, extended) {
        _super.call(this);
        this.name = 'rax'; // String 'name' of the register.
        this.id = 0; // Number value of register.
        this.size = 64 /* QUAD */; // Size in bits
        this.isExtended = false; // Whether the register is one of `%r8`, `%r9`, etc. extended registers.
        this.name = name;
        this.id = id;
        this.size = size;
        this.isExtended = extended;
    }
    Register.prototype.ref = function () {
        return (new Memory).ref(this);
    };
    Register.prototype.disp = function (value) {
        return (new Memory).ref(this).disp(value);
    };
    Register.prototype.toString = function () {
        return '%' + this.name;
    };
    return Register;
}(Operand));
exports.Register = Register;
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
    Memory.prototype.needsSib = function () {
        return !!this.index || !!this.scale;
    };
    Memory.prototype.ref = function (base) {
        this.base = base;
        return this;
    };
    Memory.prototype.disp = function (value) {
        this.displacement = new DisplacementValue(value);
        return this;
    };
    Memory.prototype.toString = function () {
        var base = this.base ? this.base.toString() : '';
        var index = this.index ? this.index.toString() : '';
        var scale = this.scale ? this.scale.toString() : '';
        var disp = this.disp ? this.disp.toString() : '';
        return "[%" + base + " + %{index} * " + scale + " + " + disp + "]";
    };
    return Memory;
}(Operand));
exports.Memory = Memory;

"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
// ## Constant
//
// Constants are everything where we directly type in a `number` value.
var Constant = (function (_super) {
    __extends(Constant, _super);
    function Constant() {
        _super.apply(this, arguments);
        // Size in bits.
        this.size = 32;
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
    Constant.prototype.toString = function () {
        return "const[" + this.size + "]: " + this.value;
    };
    return Constant;
}(Operand));
exports.Constant = Constant;
var Displacement = (function (_super) {
    __extends(Displacement, _super);
    function Displacement(value) {
        _super.call(this);
        this.size = Displacement.SIZE.DISP8;
    }
    Displacement.SIZE = {
        DISP8: 8 /* BYTE */,
        DISP32: 32 /* DOUBLE */
    };
    return Displacement;
}(Constant));
exports.Displacement = Displacement;
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
    };
    Register.prototype.disp = function () {
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
        this.disp = null;
    }
    Memory.prototype.needsSib = function () {
        return !!this.index || !!this.scale;
    };
    Memory.prototype.ref = function () {
        return this;
    };
    Memory.prototype.disp = function (value) {
        this.disp = new Displacement(value);
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

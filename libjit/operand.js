"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var struct_1 = require('../libmem/struct');
var Operand = (function () {
    function Operand() {
        this.id = Operand.counter++;
        this.value = 0;
    }
    Operand.prototype.applyInstruction = function (ins) {
        this.instructionLastModified = ins;
        if (!this.instructionCreated)
            this.instructionCreated = ins;
    };
    Operand.counter = 0;
    return Operand;
}());
exports.Operand = Operand;
// Integer value.
var OperandValue = (function (_super) {
    __extends(OperandValue, _super);
    function OperandValue() {
        _super.apply(this, arguments);
    }
    OperandValue.create = function (value) {
        var op = new OperandValue;
        op.value = value;
        return op;
    };
    return OperandValue;
}(Operand));
exports.OperandValue = OperandValue;
var OperandInt = (function (_super) {
    __extends(OperandInt, _super);
    function OperandInt() {
        _super.apply(this, arguments);
    }
    return OperandInt;
}(OperandValue));
exports.OperandInt = OperandInt;
var OperandInt8 = (function (_super) {
    __extends(OperandInt8, _super);
    function OperandInt8() {
        _super.apply(this, arguments);
        this.type = struct_1.t_i8;
    }
    return OperandInt8;
}(OperandInt));
exports.OperandInt8 = OperandInt8;
var OperandInt32 = (function (_super) {
    __extends(OperandInt32, _super);
    function OperandInt32() {
        _super.apply(this, arguments);
        this.type = struct_1.t_i32;
    }
    return OperandInt32;
}(OperandInt));
exports.OperandInt32 = OperandInt32;
// Label created by `instruction.InsLabel`.
var OperandLabel = (function (_super) {
    __extends(OperandLabel, _super);
    function OperandLabel() {
        _super.apply(this, arguments);
    }
    return OperandLabel;
}(Operand));
exports.OperandLabel = OperandLabel;
// Operand that allows to modify memory.
var OperandMemory = (function (_super) {
    __extends(OperandMemory, _super);
    function OperandMemory() {
        _super.apply(this, arguments);
        this.address = 0;
    }
    return OperandMemory;
}(Operand));
exports.OperandMemory = OperandMemory;
// export const enum REG {
//     R1,
//     R2,
//     SP,
// }
//
//
// export class OpReg extends Operand {
//     id: REG;
//
//     static create(id: REG) {
//         var reg = new OpReg;
//         reg.id = id;
//         return reg;
//     }
// }
//
//
// export class OpMem extends Operand {
//     address = 0;
// }
//

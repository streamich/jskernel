"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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

"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Instruction = (function () {
    function Instruction(op1, op2, op3) {
        if (op2 === void 0) { op2 = null; }
        if (op3 === void 0) { op3 = null; }
        this.op1 = op1;
        this.op2 = op2;
        this.op3 = op3;
        // All arithmetic operations defined as:
        // op1 = op2 + op3
        // So we "generate" op1 by this instruction:
        if (this.op1)
            this.op1.applyInstruction(this);
    }
    return Instruction;
}());
exports.Instruction = Instruction;
// Used as starting point of a function, this instruction `creates` function arguments.
var InsStartFunction = (function (_super) {
    __extends(InsStartFunction, _super);
    function InsStartFunction() {
        _super.apply(this, arguments);
    }
    InsStartFunction.create = function (f) {
        var ins = new InsStartFunction(null);
        ins.func = f;
        return ins;
    };
    return InsStartFunction;
}(Instruction));
exports.InsStartFunction = InsStartFunction;
// Defines a new operand.
var InsDefine = (function (_super) {
    __extends(InsDefine, _super);
    function InsDefine() {
        _super.apply(this, arguments);
    }
    return InsDefine;
}(Instruction));
exports.InsDefine = InsDefine;
// Creates a new operand that will be used as a label.
var InsLabel = (function (_super) {
    __extends(InsLabel, _super);
    function InsLabel(label) {
        _super.call(this, label);
    }
    return InsLabel;
}(Instruction));
exports.InsLabel = InsLabel;
// Call another function.
var InsCall = (function (_super) {
    __extends(InsCall, _super);
    function InsCall() {
        _super.apply(this, arguments);
    }
    return InsCall;
}(Instruction));
exports.InsCall = InsCall;
// Addition operation.
var InsAdd = (function (_super) {
    __extends(InsAdd, _super);
    function InsAdd() {
        _super.apply(this, arguments);
    }
    return InsAdd;
}(Instruction));
exports.InsAdd = InsAdd;
// Multiplication.
var InsMultiply = (function (_super) {
    __extends(InsMultiply, _super);
    function InsMultiply() {
        _super.apply(this, arguments);
    }
    return InsMultiply;
}(Instruction));
exports.InsMultiply = InsMultiply;
// Branch if `true` to an operand used as label.
var InsBranchIf = (function (_super) {
    __extends(InsBranchIf, _super);
    function InsBranchIf() {
        _super.apply(this, arguments);
    }
    return InsBranchIf;
}(Instruction));
exports.InsBranchIf = InsBranchIf;
// ## Hardware Instructions
// Call CPU interrupt.
var InsInterrupt = (function (_super) {
    __extends(InsInterrupt, _super);
    function InsInterrupt() {
        _super.apply(this, arguments);
    }
    return InsInterrupt;
}(Instruction));
exports.InsInterrupt = InsInterrupt;
var InsMov = (function (_super) {
    __extends(InsMov, _super);
    function InsMov() {
        _super.apply(this, arguments);
    }
    return InsMov;
}(Instruction));
exports.InsMov = InsMov;
var InsNeg = (function (_super) {
    __extends(InsNeg, _super);
    function InsNeg() {
        _super.apply(this, arguments);
    }
    return InsNeg;
}(Instruction));
exports.InsNeg = InsNeg;
var InsStore = (function (_super) {
    __extends(InsStore, _super);
    function InsStore() {
        _super.apply(this, arguments);
    }
    return InsStore;
}(Instruction));
exports.InsStore = InsStore;
var InsGoto = (function (_super) {
    __extends(InsGoto, _super);
    function InsGoto() {
        _super.apply(this, arguments);
    }
    return InsGoto;
}(Instruction));
exports.InsGoto = InsGoto;
var InsJumpIfPositive = (function (_super) {
    __extends(InsJumpIfPositive, _super);
    function InsJumpIfPositive() {
        _super.apply(this, arguments);
    }
    InsJumpIfPositive.create = function (op, instruction) {
        var ins = new InsJumpIfPositive(op);
        ins.jumpTo = instruction;
        return ins;
    };
    return InsJumpIfPositive;
}(Instruction));
exports.InsJumpIfPositive = InsJumpIfPositive;

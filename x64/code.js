"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var i = require('./instruction');
var o = require('./operand');
var d = require('./def');
(function (MODE) {
    MODE[MODE["REAL"] = 16] = "REAL";
    MODE[MODE["COMPAT"] = 17] = "COMPAT";
    MODE[MODE["LONG"] = 18] = "LONG";
})(exports.MODE || (exports.MODE = {}));
var MODE = exports.MODE;
var Code = (function () {
    function Code() {
        this.mode = MODE.LONG;
        this.ins = [];
        this.ClassInstruction = i.Instruction;
    }
    Code.prototype.insert = function (def, o1, o2, o3) {
        var ins = new this.ClassInstruction(def, this.createOperands(o1, o2, o3));
        ins.index = this.ins.length;
        this.ins.push(ins);
        return ins;
    };
    Code.prototype.createOperand = function (operand) {
        if (operand instanceof o.Operand)
            return operand;
        if (typeof operand === 'number') {
            var imm = new o.Constant(operand);
            if (imm.size < 32 /* DOUBLE */)
                imm.zeroExtend(32 /* DOUBLE */);
            return imm;
        }
        if (operand instanceof Array)
            return new o.Constant(operand);
        throw TypeError("Not a valid TOperand type: " + operand);
    };
    Code.prototype.createOperands = function (o1, o2, o3) {
        if (!o1)
            return new i.Operands();
        else {
            var first, second, third;
            first = this.createOperand(o1);
            if (first instanceof o.Constant)
                return new i.Operands(null, null, first);
            else {
                if (!o2)
                    return new i.Operands(first);
                else {
                    second = this.createOperand(o2);
                    if (second instanceof o.Constant)
                        return new i.Operands(first, null, second);
                    else {
                        if (!o3)
                            return new i.Operands(first, second);
                        else {
                            third = this.createOperand(o3);
                            if (third instanceof o.Constant)
                                new i.Operands(first, second, third);
                            else
                                throw TypeError('Third operand must be immediate.');
                        }
                    }
                }
            }
        }
    };
    Code.prototype.compile = function () {
        var code = [];
        for (var _i = 0, _a = this.ins; _i < _a.length; _i++) {
            var ins = _a[_i];
            ins.write(code);
        }
        return code;
    };
    Code.prototype.push = function (what) {
        return this.insert(d.PUSH, what);
    };
    Code.prototype.pop = function (what) {
        return this.insert(d.POP, what);
    };
    Code.prototype.movq = function (o1, o2) {
        return this.insert(d.MOVQ, o1, o2);
    };
    Code.prototype.mov = function (o1, o2) {
        return this.movq(o1, o2);
    };
    Code.prototype.syscall = function () {
        return this.insert(d.SYSCALL, new i.Operands());
    };
    Code.prototype.nop = function (size) {
        if (size === void 0) { size = 1; }
    };
    Code.prototype.nopw = function () {
        return this.nop(2);
    };
    Code.prototype.nopl = function () {
        return this.nop(4);
    };
    return Code;
}());
exports.Code = Code;
var FuzzyCode = (function (_super) {
    __extends(FuzzyCode, _super);
    function FuzzyCode() {
        _super.apply(this, arguments);
        this.ClassInstruction = i.FuzzyInstruction;
    }
    FuzzyCode.prototype.nop = function (size) {
        if (size === void 0) { size = 1; }
    };
    return FuzzyCode;
}(Code));
exports.FuzzyCode = FuzzyCode;

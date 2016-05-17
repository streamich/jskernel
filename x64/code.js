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
    Code.prototype.insert = function (def, operands) {
        // protected insert(def: d.Definition, o1?: o.Operand, o2?: o.Operand, o3?: o.Operand) {
        // var ins = new this.ClassInstruction(this, def, this.createOperands(o1, o2, o3));
        var ins = new this.ClassInstruction(def, operands, this.mode);
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
    Code.prototype.add = function (o1, o2) {
        var ops = this.createOperands(o1, o2);
        if (!(ops.dst instanceof o.Register))
            throw TypeError("Destination operand must be a register.");
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
var Code64 = (function (_super) {
    __extends(Code64, _super);
    function Code64() {
        _super.apply(this, arguments);
        this.mode = MODE.LONG;
    }
    Code64.prototype.incq = function (operand) {
        return this.insert(new d.Definition({ op: 0xFF, opreg: 0 }), this.createOperands(operand));
    };
    Code64.prototype.decq = function (operand) {
        return this.insert(new d.Definition({ op: 0xFF, opreg: 1 }), this.createOperands(operand));
    };
    return Code64;
}(Code));
exports.Code64 = Code64;
var FuzzyCode64 = (function (_super) {
    __extends(FuzzyCode64, _super);
    function FuzzyCode64() {
        _super.apply(this, arguments);
        this.ClassInstruction = i.FuzzyInstruction;
    }
    FuzzyCode64.prototype.nop = function (size) {
        if (size === void 0) { size = 1; }
    };
    return FuzzyCode64;
}(Code64));
exports.FuzzyCode64 = FuzzyCode64;

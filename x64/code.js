"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var i = require('./instruction');
var d = require('./def');
(function (MODE) {
    MODE[MODE["REAL"] = 0] = "REAL";
    MODE[MODE["COMPAT"] = 1] = "COMPAT";
    MODE[MODE["LONG"] = 2] = "LONG";
})(exports.MODE || (exports.MODE = {}));
var MODE = exports.MODE;
var Code = (function () {
    function Code() {
        this.mode = MODE.LONG;
        this.ins = [];
        this.ClassInstruction = i.Instruction;
    }
    Code.prototype.insert = function (def, op) {
        var ins = new this.ClassInstruction(def, op);
        ins.index = this.ins.length;
        this.ins.push(ins);
        return ins;
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
        return this.insert(d.PUSH, new i.Operands(what));
    };
    Code.prototype.pop = function (what) {
        return this.insert(d.POP, new i.Operands(what));
    };
    Code.prototype.movq = function (dst, src) {
        return this.insert(d.MOVQ, new i.Operands(dst, src));
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

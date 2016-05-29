"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var code = require('../x86/code');
var o = require('../x86/operand');
var d = require('../x86/def');
var instruction_1 = require('./instruction');
var t = require('./table');
exports.table = new d.DefTable(t.table, t.defaults);
var Code = (function (_super) {
    __extends(Code, _super);
    function Code() {
        _super.apply(this, arguments);
        this.ClassInstruction = instruction_1.Instruction;
        this.addressSize = o.SIZE.QUAD;
        this.table = exports.table;
    }
    Code.prototype.insTable = function (group, ops) {
        if (ops === void 0) { ops = []; }
        return _super.prototype.insTable.call(this, group, ops);
    };
    Code.prototype.incq = function (dst) {
        return this.insTable('inc', [dst]);
    };
    Code.prototype.decq = function (dst) {
        return this.insTable('dec', [dst]);
    };
    Code.prototype.movq = function (dst, src) {
        return this.insTable('mov', [dst, src]);
    };
    Code.prototype.int = function (num) {
        if (typeof num !== 'number')
            throw TypeError('INT argument must be of type number.');
        return this.insTable('int', [new o.Immediate8(num, false)]);
    };
    Code.prototype.syscall = function () {
        return this.insTable('syscall');
    };
    Code.prototype.sysenter = function () {
        return this.insTable('sysenter');
    };
    Code.prototype.sysexit = function () {
        return this.insTable('sysexit');
    };
    return Code;
}(code.Code));
exports.Code = Code;

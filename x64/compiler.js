"use strict";
var encoder_1 = require('./encoder');
var i = require('./instruction');
var d = require('./def');
var Compiler = (function () {
    function Compiler() {
        this.encoder = new encoder_1.Encoder;
        // code: number[] = [];
        this.ins = [];
    }
    Compiler.prototype.insert = function (def, op) {
        var ins = this.encoder.createInstruction(def, op);
        ins.index = this.ins.length;
        this.ins.push(ins);
        return ins;
    };
    Compiler.prototype.compile = function () {
        var code = [];
        for (var _i = 0, _a = this.ins; _i < _a.length; _i++) {
            var ins = _a[_i];
            ins.write(code);
        }
        return code;
    };
    // write(writer) {
    //     var pos = this.code.length;
    //     writer.write(this.code);
    //     return pos;
    // }
    Compiler.prototype.push = function (what) {
        return this.insert(d.PUSH, new i.Operands(what));
    };
    Compiler.prototype.pop = function (what) {
        return this.insert(d.POP, new i.Operands(what));
    };
    Compiler.prototype.movq = function (dst, src) {
        return this.insert(d.MOVQ, new i.Operands(dst, src));
    };
    return Compiler;
}());
exports.Compiler = Compiler;

"use strict";
var i = require('./instruction');
var o = require('./operand');
(function (MODE) {
    MODE[MODE["REAL"] = 16] = "REAL";
    MODE[MODE["COMPAT"] = 17] = "COMPAT";
    MODE[MODE["LONG"] = 18] = "LONG";
})(exports.MODE || (exports.MODE = {}));
var MODE = exports.MODE;
var Code = (function () {
    function Code() {
        this.mode = MODE.LONG;
        this.instructions = [];
        this.ClassInstruction = i.Instruction;
    }
    Code.prototype.ins = function (def, operands) {
        var ins = new this.ClassInstruction(def, operands);
        ins.create();
        ins.index = this.ins.length;
        this.instructions.push(ins);
        return ins;
    };
    Code.prototype.toRegOrMem = function (operand) {
        if (operand instanceof o.Register)
            return operand;
        if (operand instanceof o.Memory)
            return operand;
        // Displacement is up to 4 bytes in size, and 8 bytes for some specific MOV instructions, AMD64 Vol.2 p.24:
        //
        // > The size of a displacement is 1, 2, or 4 bytes.
        //
        // > Also, in 64-bit mode, support is provided for some 64-bit displacement
        // > and immediate forms of the MOV instruction. See “Immediate Operand Size” in Volume 1 for more
        // > information on this.
        if (typeof operand === 'number')
            return (new o.Memory).disp(operand);
        else if ((operand instanceof Array) && (operand.length == 2))
            return (new o.Memory).disp(operand);
        else
            throw TypeError('Displacement value must be of type number or number64.');
    };
    Code.prototype.insZeroOperands = function (def) {
        return this.ins(def, this.createOperands());
    };
    Code.prototype.insImmediate = function (def, num, signed) {
        if (signed === void 0) { signed = true; }
        var imm = new o.ImmediateValue(num, signed);
        return this.ins(def, this.createOperands(null, null, imm));
    };
    Code.prototype.insOneOperand = function (def, dst, num) {
        if (num === void 0) { num = null; }
        var disp = num === null ? null : new o.DisplacementValue(num);
        return this.ins(def, this.createOperands(dst, null, disp));
    };
    Code.prototype.insTwoOperands = function (def, dst, src, num) {
        if (num === void 0) { num = null; }
        var imm = num === null ? null : new o.ImmediateValue(num);
        return this.ins(def, this.createOperands(dst, src, imm));
    };
    // protected createOperand(operand: TOperand): o.Operand {
    //     if(operand instanceof o.Operand) return operand;
    //     if(typeof operand === 'number') {
    //         var imm = new o.Constant(operand as number);
    //         if(imm.size < o.SIZE.DOUBLE) imm.zeroExtend(o.SIZE.DOUBLE);
    //         return imm;
    //     }
    //     if(operand instanceof Array) return new o.Constant(operand as o.number64);
    //     throw TypeError(`Not a valid TOperand type: ${operand}`);
    // }
    Code.prototype.createOperands = function (dst, src, imm) {
        if (dst === void 0) { dst = null; }
        if (src === void 0) { src = null; }
        if (imm === void 0) { imm = null; }
        var xdst = null;
        var xsrc = null;
        if (dst) {
            xdst = this.toRegOrMem(dst);
            if (!(xdst instanceof o.Register) && !(xdst instanceof o.Memory))
                throw TypeError('Destination operand must be of type Register or Memory.');
        }
        if (src) {
            xsrc = this.toRegOrMem(src);
            if (!(xsrc instanceof o.Register) && !(xsrc instanceof o.Memory))
                throw TypeError('Source operand must be of type Register or Memory.');
        }
        if (imm && !(imm instanceof o.Constant))
            throw TypeError('Immediate operand must be of type Constant.');
        return new i.Operands(xdst, xsrc, imm);
    };
    Code.prototype.label = function (name) {
        if ((typeof name !== 'string') || !name)
            throw TypeError('Label name must be a non-empty string.');
        var label = new i.Label(name);
        this.instructions.push(label);
        return label;
    };
    Code.prototype.compile = function () {
        var code = [];
        for (var _i = 0, _a = this.instructions; _i < _a.length; _i++) {
            var ins = _a[_i];
            if (ins instanceof i.Instruction)
                ins.write(code);
        }
        return code;
    };
    Code.prototype.toString = function () {
        return this.instructions.map(function (ins) { return ins.toString(); }).join('\n');
    };
    return Code;
}());
exports.Code = Code;

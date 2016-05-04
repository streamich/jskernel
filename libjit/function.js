"use strict";
var instruction = require('./instruction');
var operand = require('./operand');
var Function = (function () {
    function Function() {
        // instructions: instruction.Instruction[] = [];
        // First instruction.
        this.start = instruction.InsStartFunction.create(this);
        // Last instruction.
        this.end = this.start;
        // Arguments provided to function when its called.
        this.args = [];
    }
    /**
     * Get argument supplied to this function.
     * @param pos
     * @returns {Operand}
     */
    Function.prototype.getArgument = function (pos) {
        var op = this.args[pos];
        if (!op) {
            op = new operand.OperandValue;
            op.applyInstruction(this.start);
            this.args[pos] = op;
        }
        return op;
    };
    /**
     * Set return operand of this function.
     * @param op {Operand}
     */
    Function.prototype.setReturn = function (op) {
        this.returnOperand = op;
    };
    /**
     * Append instruction to this function.
     * @param ins {Instruction}
     * @returns {Function}
     */
    Function.prototype.insert = function (ins) {
        // if(!ins.result) {
        //     ins.result = new operand.Operand;
        //     ins.result.generator = ins;
        // }
        // ins.pos = this.instructions.length;
        ins.func = this;
        ins.previous = this.end;
        this.end.next = ins;
        this.end = ins;
        // this.instructions.push(ins);
        return this;
    };
    return Function;
}());
exports.Function = Function;
// Convenience methods for function building.
var Composer = (function () {
    function Composer(func) {
        this.func = func;
    }
    // Print the definition of the function.
    Composer.prototype.print = function () {
        var args = [];
        for (var _i = 0, _a = this.func.args; _i < _a.length; _i++) {
            var op = _a[_i];
            args.push("[" + op.id + "]: " + op.value);
        }
        console.log(args.join(', '));
        var ins = this.func.start;
        while (ins) {
            var constr = ins.constructor;
            console.log(constr.name +
                (ins.op1 ? ", [" + ins.op1.id + "]:" + ins.op1.value : '') +
                (ins.op2 ? ", [" + ins.op2.id + "]:" + ins.op2.value : '') +
                (ins.op3 ? ", [" + ins.op3.id + "]:" + ins.op3.value : ''));
            ins = ins.next;
        }
    };
    Composer.prototype.arg = function (pos) {
        return this.func.getArgument(pos);
    };
    Composer.prototype.define = function (value) {
        var op = operand.OperandValue.create(value);
        this.func.insert(new instruction.InsDefine(op));
        return op;
    };
    Composer.prototype.label = function () {
        var label = new operand.OperandLabel;
        var ins = new instruction.InsLabel(label);
        this.func.insert(ins);
        return label;
    };
    Composer.prototype.returns = function (op) {
        this.func.setReturn(op);
        return this;
    };
    Composer.prototype.jif = function (condition, label) {
        this.func.insert(new instruction.InsBranchIf(condition, label));
        return this;
    };
    // Call another function.
    Composer.prototype.call = function () { };
    Composer.prototype.add = function (op1, op2, op3) {
        if (typeof op2 == 'number')
            op2 = operand.OperandValue.create(op2);
        if (!op3)
            op3 = op1;
        var ins = new instruction.InsAdd(op1, op2, op3);
        this.func.insert(ins);
        return this;
    };
    Composer.prototype.mul = function (op1, op2, op3) {
        if (typeof op2 == 'number')
            op2 = operand.OperandValue.create(op2);
        if (!op3)
            op3 = op1;
        this.func.insert(new instruction.InsMultiply(op1, op2, op3));
        return this;
    };
    Composer.prototype.neg = function (op1, op2) {
        if (op2 === void 0) { op2 = op1; }
        this.func.insert(new instruction.InsNeg(op1, op2));
        return this;
    };
    return Composer;
}());
exports.Composer = Composer;

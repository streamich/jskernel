"use strict";
var jit = require('../libjit');
var Interpreter = (function () {
    function Interpreter() {
    }
    // Interpret instruction and return the next instruction to execute.
    Interpreter.prototype.interpretInstruction = function (ins) {
        if (ins instanceof jit.InsStartFunction) {
        }
        else if (ins instanceof jit.InsDefine) {
        }
        else if (ins instanceof jit.InsLabel) {
        }
        else if (ins instanceof jit.InsAdd) {
            ins.op1.value = ins.op2.value + ins.op3.value;
        }
        else if (ins instanceof jit.InsMultiply) {
            ins.op1.value = ins.op2.value * ins.op3.value;
        }
        else if (ins instanceof jit.InsNeg) {
            ins.op1.value = -ins.op2.value;
        }
        else if (ins instanceof jit.InsJumpIfPositive) {
            return ins.op1.value > 0 ? ins.jumpTo : ins.next;
        }
        else if (ins instanceof jit.InsBranchIf) {
            var value = ins.op1.value;
            if (value) {
                var label = ins.op2;
                return label.instructionCreated;
            }
            else {
                return ins.next;
            }
        }
        else {
            var constructor = ins.constructor;
            throw Error("Cannot interpret instruction: " + constructor.name);
        }
        return ins.next;
    };
    Interpreter.prototype.run = function (func, args) {
        // Initialize args.
        for (var i = 0; i < args.length; i++) {
            var op = func.args[i];
            if (op) {
                op.value = args[i];
            }
            else {
            }
        }
        // Run through function's body.
        var ins = func.start;
        while (ins = this.interpretInstruction(ins))
            ;
        return func.returnOperand.value;
    };
    return Interpreter;
}());
exports.Interpreter = Interpreter;

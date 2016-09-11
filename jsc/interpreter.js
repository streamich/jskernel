"use strict";
var tac = require('./tac');
var TacInterpreter = (function () {
    function TacInterpreter() {
    }
    TacInterpreter.prototype.evalInstruction = function (ins) {
        if (ins instanceof tac.AdditionInstruction) {
            if ((ins.op2 instanceof tac.OperandConst) && ins.op3) {
                var op2 = ins.op2;
                var type = op2.type;
                return new tac.OperandConst(type, op2.value + ins.op3.value);
            }
            else
                throw Error("Cannot interpret instruction " + ins.toString());
        }
        else
            throw Error("Cannot interpret instruction " + ins.constructor.name + ".");
    };
    return TacInterpreter;
}());
exports.TacInterpreter = TacInterpreter;

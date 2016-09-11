"use strict";
var dom = require('./c/dom');
var tac = require('./tac');
var t = tac.t;
var TranslatorDomToTacFunction = (function () {
    function TranslatorDomToTacFunction(unit) {
        this.unit = unit;
    }
    TranslatorDomToTacFunction.prototype.createTemporaryOperand = function () {
        return new tac.OperandVariable(t.i64);
    };
    TranslatorDomToTacFunction.prototype.onSimpleAssignmentExpression = function (expr) {
        var op1 = this.translateExpression(expr.operand1);
        var op2 = this.translateExpression(expr.operand2);
        this.func.pushInstruction(new tac.AssignmentInstruction(op1, op2));
        return op1;
    };
    TranslatorDomToTacFunction.prototype.onPrimaryExpressionConstant = function (expr) {
        return new tac.OperandConst(t.i64, expr.operand);
    };
    TranslatorDomToTacFunction.prototype.translateExpression = function (expr) {
        if (expr instanceof dom.PrimaryExpressionVariable) {
            var name = expr.operand.identifier.getName();
            var op = this.func.vars.get(name);
            if (!op)
                throw Error("Variable " + name + " not defined.");
            return op;
        }
        else if (expr instanceof dom.PrimaryExpressionConstant) {
            return this.onPrimaryExpressionConstant(expr);
        }
        else if (expr instanceof dom.SimpleAssignmentExpression) {
            return this.onSimpleAssignmentExpression(expr);
        }
        else if (expr instanceof dom.AdditionExpression) {
            var op1 = this.translateExpression(expr.operand1);
            var op2 = this.translateExpression(expr.operand2);
            var tmp = this.createTemporaryOperand();
            this.func.pushInstruction(new tac.AdditionInstruction(tmp, op1, op2));
            return tmp;
        }
        else
            throw Error("Do not know how to translate Expression of type " + expr.constructor.name + ".");
    };
    TranslatorDomToTacFunction.prototype.translateDeclaration = function (decl) {
        var tacAssign = new tac.AssignmentInstruction(new tac.OperandVariable(t.i64, decl.variable.identifier.getName()), new tac.OperandConst(t.i64, decl.variable.object.value));
        this.func.pushInstruction(tacAssign);
    };
    TranslatorDomToTacFunction.prototype.onIfStatement = function (st) {
        var boolOperand = this.translateExpression(st.expression);
        var cmpResult = this.createTemporaryOperand();
        var ins = new tac.CompareInstruction(cmpResult, tac.CONDITION.NE, boolOperand, new tac.OperandConst(t.i64, 0));
        this.func.pushInstruction(ins);
        var labelIfEqual = new tac.OperandLabel;
        var labelIfUnequal = new tac.OperandLabel;
        var labelContinue = new tac.OperandLabel;
        this.func.pushInstruction(new tac.BranchInstruction(cmpResult, labelIfEqual, labelIfUnequal));
        this.func.pushInstruction(new tac.LabelInstruction(labelIfEqual));
        this.translateBlock(st.trueBlock);
        this.func.pushInstruction(new tac.JumpInstruction(labelContinue));
        this.func.pushInstruction(new tac.LabelInstruction(labelIfUnequal));
        this.translateBlock(st.elseBlock);
        this.func.pushInstruction(new tac.LabelInstruction(labelContinue));
    };
    TranslatorDomToTacFunction.prototype.onReturnStatement = function (st) {
        var operand = this.translateExpression(st.expression);
        var retIns = new tac.ReturnInstruction(operand);
        this.func.pushInstruction(retIns);
    };
    TranslatorDomToTacFunction.prototype.translateStatement = function (st) {
        if (st instanceof dom.ExpressionStatement) {
            this.translateExpression(st.expression);
        }
        else if (st instanceof dom.ReturnStatement) {
            this.onReturnStatement(st);
        }
        else if (st instanceof dom.IfStatement) {
            return this.onIfStatement(st);
        }
        else
            throw Error("Do not know how to translate Statement of type " + st.constructor.name + ".");
    };
    TranslatorDomToTacFunction.prototype.translateBlock = function (block) {
        for (var _i = 0, _a = block.items; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item instanceof dom.Declaration) {
                this.translateDeclaration(item);
            }
            else if (item instanceof dom.Statement) {
                this.translateStatement(item);
            }
            else
                throw Error('Do not know how to translate Instruction or Declaration.');
        }
    };
    TranslatorDomToTacFunction.prototype.translate = function (funcdef) {
        this.func = new tac.Function(t.void, [], funcdef.identifier.getName());
        this.translateBlock(funcdef.body);
        return this.func;
    };
    return TranslatorDomToTacFunction;
}());
exports.TranslatorDomToTacFunction = TranslatorDomToTacFunction;
var TranslatorDomToTacUnit = (function () {
    function TranslatorDomToTacUnit() {
        this.tac = new tac.Unit;
    }
    TranslatorDomToTacUnit.prototype.translate = function (cunit) {
        this.cunit = cunit;
        var _a = this, cunit = _a.cunit, tac = _a.tac;
        for (var _i = 0, _b = cunit.externalDeclarations; _i < _b.length; _i++) {
            var item = _b[_i];
            if (item instanceof dom.FunctionDefinition) {
                var funcTranslator = new TranslatorDomToTacFunction(this);
                var f = funcTranslator.translate(item);
                this.tac.pushFunction(f);
            }
            else
                throw Error('Do not know how to translate external declaration of type ' + item.constructor.name);
        }
        return this.tac;
    };
    return TranslatorDomToTacUnit;
}());
exports.TranslatorDomToTacUnit = TranslatorDomToTacUnit;

"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var walk_1 = require('./walk');
var ui_1 = require('../ir/ui');
var dom = require('./dom');
var irop = require('../ir/operand');
var ins_1 = require('../ir/ins');
var AssignTypesPass = (function (_super) {
    __extends(AssignTypesPass, _super);
    function AssignTypesPass() {
        _super.apply(this, arguments);
        this.unit = null;
    }
    AssignTypesPass.prototype.onUnit = function (unit) {
        this.unit = unit;
        _super.prototype.onUnit.call(this, unit);
    };
    AssignTypesPass.prototype.onFunctionDefinition = function (def) {
        var fp = new AssignTypesFunctionDefinitionPass(this.unit);
        (new walk_1.FunctionDefinitionPassManager(fp))
            .onFunctionDefinition(def);
    };
    return AssignTypesPass;
}(walk_1.TranslationUnitPass));
exports.AssignTypesPass = AssignTypesPass;
var AssignTypesFunctionDefinitionPass = (function (_super) {
    __extends(AssignTypesFunctionDefinitionPass, _super);
    function AssignTypesFunctionDefinitionPass(unit) {
        _super.call(this);
        this.unit = unit;
    }
    AssignTypesFunctionDefinitionPass.prototype.onExpressionStatement = function (st) {
        this.manager.onExpression(st.expression);
    };
    AssignTypesFunctionDefinitionPass.prototype.onIfStatement = function (st) {
        this.manager.onExpression(st.expression);
    };
    AssignTypesFunctionDefinitionPass.prototype.onPrimaryExpressionVariable = function (expr) {
        expr.type = expr.operand.type;
    };
    AssignTypesFunctionDefinitionPass.prototype.onPrimaryExpressionConstant = function (expr) {
        expr.type = this.unit.t.int;
    };
    AssignTypesFunctionDefinitionPass.prototype.onBinaryExpression = function (expr) {
        var operand1 = expr.operand1, operand2 = expr.operand2;
        if (!operand1.type)
            throw Error("Expression does not have type \"" + operand1.toString() + "\".");
        if (!operand2.type)
            throw Error("Expression does not have type \"" + operand2.toString() + "\".");
        if (operand1.type !== operand2.type)
            throw Error("Binary expression types don't match \"" + operand1.type.toString() + "\" vs \"" + operand2.type.toString() + "\" in \"" + expr.toString() + "\".");
        expr.type = expr.operand1.type;
    };
    return AssignTypesFunctionDefinitionPass;
}(walk_1.FunctionDefinitionPass));
exports.AssignTypesFunctionDefinitionPass = AssignTypesFunctionDefinitionPass;
var CreateIrPass = (function (_super) {
    __extends(CreateIrPass, _super);
    function CreateIrPass() {
        _super.apply(this, arguments);
        this._ = ui_1.create();
        this.unit = null;
    }
    CreateIrPass.prototype.toIrType = function (type) {
        if (type instanceof dom.VoidType) {
            return this._.t.void;
        }
        else if (type instanceof dom.PrimitiveType) {
            return this._.t.i(type.size * 8);
        }
        else
            throw TypeError('Could not convert C type to IR type.');
    };
    CreateIrPass.prototype.onUnit = function (unit) {
        console.log('tut');
        this.unit = unit;
        this.assignTypeSizes();
    };
    CreateIrPass.prototype.onFunctionDefinition = function (def) {
        var _this = this;
        var returnType = this.toIrType(def.type.returnType);
        var args = [];
        for (var _i = 0, _a = def.arguments; _i < _a.length; _i++) {
            var arg = _a[_i];
            var opvar = new irop.OperandVariable(this.toIrType(arg.type), arg.identifier.getName());
            args.push(opvar);
        }
        this._.func(returnType, args, def.getName(), function (_) {
            var fdPass = new CreateIrFunctionDefinitionPass(_this, _);
            var fdPassMng = new walk_1.FunctionDefinitionPassManager(fdPass);
            fdPassMng.onFunctionDefinition(def);
        });
    };
    CreateIrPass.prototype.assignTypeSizes = function () {
        for (var typename in this.unit.t) {
            var type = this.unit.t[typename];
            if (type instanceof dom.PrimitiveType) {
                switch (type.baseType) {
                    case 'char':
                        type.size = 1;
                        break;
                    case 'short':
                        type.size = 2;
                        break;
                    case 'int':
                        type.size = 4;
                        break;
                    case 'long':
                        type.size = 8;
                        break;
                    case 'long long':
                        type.size = 8;
                        break;
                    case 'float':
                        type.size = 4;
                        break;
                    case 'double':
                        type.size = 8;
                        break;
                }
            }
        }
    };
    return CreateIrPass;
}(walk_1.TranslationUnitPass));
exports.CreateIrPass = CreateIrPass;
var CreateIrFunctionDefinitionPass = (function (_super) {
    __extends(CreateIrFunctionDefinitionPass, _super);
    function CreateIrFunctionDefinitionPass(unitPass, ctx) {
        _super.call(this);
        this.unitPass = unitPass;
        this._ = ctx;
    }
    CreateIrFunctionDefinitionPass.prototype.toIrType = function (type) {
        if (type instanceof dom.BoolType) {
            return this._.t.i1;
        }
        else if (type instanceof dom.PrimitiveType) {
            return this._.t.i(type.size * 8);
        }
        else
            throw Error('Cannot convert C type to IR type.');
    };
    CreateIrFunctionDefinitionPass.prototype.getRValue = function (expr) {
        if (!expr.rvalue)
            this.manager.onExpression(expr);
        return expr.rvalue;
    };
    CreateIrFunctionDefinitionPass.prototype.getBooleanRValue = function (expr) {
        var cmpResult = this._.var(this._.t.i1);
        this._.cmp(cmpResult, this.getRValue(expr), 0, ins_1.CONDITION.NE);
        return cmpResult;
    };
    CreateIrFunctionDefinitionPass.prototype.onDeclaration = function (decl) { };
    CreateIrFunctionDefinitionPass.prototype.onExpressionStatement = function (st) {
        this.manager.onExpression(st.expression);
    };
    CreateIrFunctionDefinitionPass.prototype.onIfStatement = function (st) {
        var lblTrue = this._.lbl();
        var lblFalse = this._.lbl();
        var lblEnd = this._.lbl();
        this._.br(this.getBooleanRValue(st.expression), lblTrue, lblFalse);
        this._.label(lblTrue);
        this.manager.onBlock(st.trueBlock);
        this._.jmp(lblEnd);
        this._.label(lblFalse);
        this.manager.onBlock(st.falseBlock);
        this._.label(lblEnd);
    };
    CreateIrFunctionDefinitionPass.prototype.onWhileStatement = function (st) {
        var lblLoop = this._.lbl();
        st.labelContinue = this._.lbl();
        st.labelBreak = this._.lbl();
        this._.label(st.labelContinue);
        this._.br(this.getBooleanRValue(st.controlExpr), lblLoop, st.labelBreak);
        this._.label(lblLoop);
        this.manager.onBlock(st.body);
        this._.jmp(st.labelContinue);
        this._.label(st.labelBreak);
    };
    CreateIrFunctionDefinitionPass.prototype.onDoStatement = function (st) {
        var lblLoop = this._.lbl();
        st.labelContinue = this._.lbl();
        st.labelBreak = this._.lbl();
        this._.label(lblLoop);
        this.manager.onBlock(st.body);
        this._.label(st.labelContinue);
        this._.br(this.getBooleanRValue(st.controlExpr), lblLoop, st.labelBreak);
        this._.label(st.labelBreak);
    };
    CreateIrFunctionDefinitionPass.prototype.onForStatement = function (st) {
        var lblLoop = this._.lbl();
        st.labelContinue = this._.lbl();
        st.labelBreak = this._.lbl();
        this.manager.onExpression(st.expr1);
        this._.label(st.labelContinue);
        this._.br(this.getBooleanRValue(st.controlExpr), lblLoop, st.labelBreak);
        this._.label(lblLoop);
        this.manager.onBlock(st.body);
        this.manager.onExpression(st.expr3);
        this._.jmp(st.labelContinue);
        this._.label(st.labelBreak);
    };
    CreateIrFunctionDefinitionPass.prototype.onContinueStatement = function (st) {
        var loopStatement = st.parent.parent;
        if (loopStatement instanceof dom.IterationStatement)
            this._.jmp(loopStatement.labelContinue);
        else
            throw Error('`continue` statement allowed only inside a loop.');
    };
    CreateIrFunctionDefinitionPass.prototype.onBreakStatement = function (st) {
        var loopStatement = st.parent.parent;
        if (loopStatement instanceof dom.IterationStatement)
            this._.jmp(loopStatement.labelBreak);
        else
            throw Error('`break` statement allowed only inside a loop.');
    };
    CreateIrFunctionDefinitionPass.prototype.onLabelStatement = function (st) {
        this._.label(st.label.getName());
    };
    CreateIrFunctionDefinitionPass.prototype.onGotoStatement = function (st) {
        this._.jmp(st.label.getName());
    };
    CreateIrFunctionDefinitionPass.prototype.onReturnStatement = function (st) {
        this._.ret(this.getRValue(st.expression));
    };
    CreateIrFunctionDefinitionPass.prototype.onPrimaryExpressionVariable = function (expr) {
        var v = expr.operand;
        expr.rvalue = this._.var(this.toIrType(v.type), v.getName());
    };
    CreateIrFunctionDefinitionPass.prototype.onPrimaryExpressionConstant = function (expr) {
        expr.rvalue = this._.op(expr.operand, this._.t.i32);
    };
    CreateIrFunctionDefinitionPass.prototype.onPostfixExpression = function (expr) { };
    CreateIrFunctionDefinitionPass.prototype.onIncrementPostfixExpression = function (expr) {
        expr.rvalue = expr.operand.rvalue;
        this._.add(expr.rvalue, expr.rvalue, this._.op(1, expr.rvalue.type));
    };
    CreateIrFunctionDefinitionPass.prototype.onDecrementPostfixExpression = function (expr) {
        expr.rvalue = expr.operand.rvalue;
        this._.sub(expr.rvalue, expr.rvalue, this._.op(1, expr.rvalue.type));
    };
    CreateIrFunctionDefinitionPass.prototype.onUnaryExpression = function (expr) { };
    CreateIrFunctionDefinitionPass.prototype.onIncrementUnaryExpression = function (expr) {
        expr.rvalue = expr.operand.rvalue;
        this._.add(expr.rvalue, expr.rvalue, 1);
    };
    CreateIrFunctionDefinitionPass.prototype.onDecrementUnaryExpression = function (expr) { };
    CreateIrFunctionDefinitionPass.prototype.onAndUnaryExpression = function (expr) { };
    CreateIrFunctionDefinitionPass.prototype.onStarUnaryExpression = function (expr) { };
    CreateIrFunctionDefinitionPass.prototype.onPlusUnaryExpression = function (expr) { };
    CreateIrFunctionDefinitionPass.prototype.onMinusUnaryExpression = function (expr) { };
    CreateIrFunctionDefinitionPass.prototype.onTildeUnaryExpression = function (expr) { };
    CreateIrFunctionDefinitionPass.prototype.onNotUnaryExpression = function (expr) { };
    CreateIrFunctionDefinitionPass.prototype.onBinaryExpression = function (expr) { };
    CreateIrFunctionDefinitionPass.prototype.onMultiplicationBinaryExpression = function (expr) {
        expr.rvalue = this._.var(this.toIrType(expr.type));
        this._.mul(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onDivisionBinaryExpression = function (expr) {
        var op1 = expr.operand1, op2 = expr.operand2;
        expr.rvalue = this._.var(this.toIrType(expr.type));
        if (expr.type.isUnsigned) {
            this._.udiv(expr.rvalue, op1.rvalue, op2.rvalue);
        }
        else {
            this._.sdiv(expr.rvalue, op1.rvalue, op2.rvalue);
        }
    };
    CreateIrFunctionDefinitionPass.prototype.onReminderBinaryExpression = function (expr) {
        var op1 = expr.operand1, op2 = expr.operand2;
        expr.rvalue = this._.var(this.toIrType(expr.type));
        if (expr.type.isUnsigned) {
            this._.urem(expr.rvalue, op1.rvalue, op2.rvalue);
        }
        else {
            this._.srem(expr.rvalue, op1.rvalue, op2.rvalue);
        }
    };
    CreateIrFunctionDefinitionPass.prototype.onAdditionBinaryExpression = function (expr) {
        expr.rvalue = this._.var(expr.operand1.rvalue.type);
        this._.add(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onSubtractionBinaryExpression = function (expr) {
        expr.rvalue = this._.var(expr.operand1.rvalue.type);
        this._.sub(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onShiftLeftBinaryExpression = function (expr) {
        expr.rvalue = this._.var(this.toIrType(expr.type));
        this._.shl(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onShiftRightBinaryExpression = function (expr) {
        expr.rvalue = this._.var(this.toIrType(expr.type));
        this._.ashr(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onLessThanBinaryExpression = function (expr) {
        expr.rvalue = this._.var(this._.t.i1);
        if (expr.operand1.type.isUnsigned) {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, ins_1.CONDITION.ULT);
        }
        else {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, ins_1.CONDITION.SLT);
        }
    };
    CreateIrFunctionDefinitionPass.prototype.onMoreThanBinaryExpression = function (expr) {
        expr.rvalue = this._.var(this._.t.i1);
        if (expr.operand1.type.isUnsigned) {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, ins_1.CONDITION.UGT);
        }
        else {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, ins_1.CONDITION.SGT);
        }
    };
    CreateIrFunctionDefinitionPass.prototype.onLessThanOrEqualBinaryExpression = function (expr) {
        expr.rvalue = this._.var(this._.t.i1);
        if (expr.operand1.type.isUnsigned) {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, ins_1.CONDITION.ULE);
        }
        else {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, ins_1.CONDITION.SLE);
        }
    };
    CreateIrFunctionDefinitionPass.prototype.onMoreThanOrEqualBinaryExpression = function (expr) {
        expr.rvalue = this._.var(this._.t.i1);
        if (expr.operand1.type.isUnsigned) {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, ins_1.CONDITION.UGE);
        }
        else {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, ins_1.CONDITION.SGE);
        }
    };
    CreateIrFunctionDefinitionPass.prototype.onEqualBinaryExpression = function (expr) {
        expr.rvalue = this._.var(this._.t.i1);
        this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, ins_1.CONDITION.EQ);
    };
    CreateIrFunctionDefinitionPass.prototype.onNotEqualBinaryExpression = function (expr) {
        expr.rvalue = this._.var(this._.t.i1);
        this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, ins_1.CONDITION.NE);
    };
    CreateIrFunctionDefinitionPass.prototype.onArithmeticAndBinaryExpression = function (expr) {
        expr.rvalue = this._.var(this.toIrType(expr.type));
        this._.and(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onArithmeticXorBinaryExpression = function (expr) {
        expr.rvalue = this._.var(this.toIrType(expr.type));
        this._.xor(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onArithmeticOrBinaryExpression = function (expr) {
        expr.rvalue = this._.var(this.toIrType(expr.type));
        this._.or(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onLogicalAndBinaryExpression = function (expr) {
        var lblOneTrue = this._.lbl();
        var lblContinue = this._.lbl();
        expr.rvalue = this._.var(this._.t.i1);
        this._.cmp(expr.rvalue, expr.operand1.rvalue, this._.op(0), ins_1.CONDITION.NE);
        this._.br(expr.rvalue, lblOneTrue, lblContinue);
        this._.label(lblOneTrue);
        this._.cmp(expr.rvalue, expr.operand2.rvalue, this._.op(0), ins_1.CONDITION.NE);
        this._.label(lblContinue);
    };
    CreateIrFunctionDefinitionPass.prototype.onLogicalOrBinaryExpression = function (expr) {
        var lblOneFalse = this._.lbl();
        var lblContinue = this._.lbl();
        expr.rvalue = this._.var(this._.t.i1);
        this._.cmp(expr.rvalue, expr.operand1.rvalue, this._.op(0), ins_1.CONDITION.NE);
        this._.br(expr.rvalue, lblContinue, lblOneFalse);
        this._.label(lblOneFalse);
        this._.cmp(expr.rvalue, expr.operand2.rvalue, this._.op(0), ins_1.CONDITION.NE);
        this._.label(lblContinue);
    };
    CreateIrFunctionDefinitionPass.prototype.onSimpleAssignmentExpression = function (expr) {
        expr.rvalue = expr.operand1.rvalue;
        this._.assign(expr.operand1.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onMultiplicationAssignmentExpression = function (expr) {
        expr.rvalue = expr.operand1.rvalue;
        this._.mul(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onDivisionAssignmentExpression = function (expr) {
        expr.rvalue = expr.operand1.rvalue;
        if (expr.type.isUnsigned) {
            this._.udiv(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
        }
        else {
            this._.sdiv(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
        }
    };
    CreateIrFunctionDefinitionPass.prototype.onRemainderAssignmentExpression = function (expr) {
        expr.rvalue = expr.operand1.rvalue;
        if (expr.type.isUnsigned) {
            this._.urem(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
        }
        else {
            this._.srem(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
        }
    };
    CreateIrFunctionDefinitionPass.prototype.onAdditionAssignmentExpression = function (expr) {
        expr.rvalue = expr.operand1.rvalue;
        this._.add(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onSubtractionAssignmentExpression = function (expr) {
        expr.rvalue = expr.operand1.rvalue;
        this._.sub(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onShiftLeftAssignmentExpression = function (expr) {
        expr.rvalue = expr.operand1.rvalue;
        this._.shl(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onShiftRightAssignmentExpression = function (expr) {
        expr.rvalue = expr.operand1.rvalue;
        this._.ashr(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onAndAssignmentExpression = function (expr) {
        expr.rvalue = expr.operand1.rvalue;
        this._.and(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onXorAssignmentExpression = function (expr) {
        expr.rvalue = expr.operand1.rvalue;
        this._.xor(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    };
    CreateIrFunctionDefinitionPass.prototype.onOrAssignmentExpression = function (expr) {
        expr.rvalue = expr.operand1.rvalue;
        this._.or(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    };
    return CreateIrFunctionDefinitionPass;
}(walk_1.FunctionDefinitionPass));
exports.CreateIrFunctionDefinitionPass = CreateIrFunctionDefinitionPass;

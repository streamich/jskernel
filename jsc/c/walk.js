"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dom = require('./dom');
var PassManager = (function () {
    function PassManager() {
    }
    return PassManager;
}());
exports.PassManager = PassManager;
var TranslationUnitPassManager = (function () {
    function TranslationUnitPassManager(pass) {
        this.pass = pass;
    }
    TranslationUnitPassManager.prototype.onUnit = function (unit) {
        this.pass.onUnit(unit);
        for (var _i = 0, _a = unit.externalDeclarations; _i < _a.length; _i++) {
            var decl = _a[_i];
            if (decl instanceof dom.FunctionDefinition)
                this.onFunctionDefinition(decl);
            else
                throw Error("Unknown external declaration.");
        }
    };
    TranslationUnitPassManager.prototype.onFunctionDefinition = function (def) {
        this.pass.onFunctionDefinition(def);
    };
    return TranslationUnitPassManager;
}());
exports.TranslationUnitPassManager = TranslationUnitPassManager;
var FunctionDefinitionPassManager = (function (_super) {
    __extends(FunctionDefinitionPassManager, _super);
    function FunctionDefinitionPassManager(pass) {
        _super.call(this);
        this.pass = null;
        this.pass = pass;
        pass.manager = this;
    }
    FunctionDefinitionPassManager.prototype.onFunctionDefinition = function (def) {
        this.pass.onFunctionDefinition(def);
        this.onBlock(def.body);
    };
    FunctionDefinitionPassManager.prototype.onBlock = function (block) {
        for (var _i = 0, _a = block.items; _i < _a.length; _i++) {
            var item = _a[_i];
            if (item instanceof dom.Declaration)
                this.pass.onDeclaration(item);
            else if (item instanceof dom.Statement)
                this.onStatement(item);
            else
                throw Error("Unexpected iteration block.");
        }
    };
    FunctionDefinitionPassManager.prototype.onStatement = function (st) {
        this.pass.onStatement(st);
        if (st instanceof dom.ExpressionStatement)
            this.pass.onExpressionStatement(st);
        else if (st instanceof dom.IfStatement)
            this.pass.onIfStatement(st);
        else if (st instanceof dom.ReturnStatement)
            this.pass.onReturnStatement(st);
    };
    FunctionDefinitionPassManager.prototype.onExpression = function (expr) {
        if (expr instanceof dom.PrimaryExpressionVariable)
            this.pass.onPrimaryExpressionVariable(expr);
        else if (expr instanceof dom.PrimaryExpressionConstant)
            this.pass.onPrimaryExpressionConstant(expr);
        else if (expr instanceof dom.BinaryExpression)
            this.onBinaryExpression(expr);
    };
    FunctionDefinitionPassManager.prototype.onBinaryExpression = function (expr) {
        this.onExpression(expr.operand1);
        this.onExpression(expr.operand2);
        this.pass.onBinaryExpression(expr);
        switch (expr.operator) {
            case '*':
                this.pass.onMultiplicationBinaryExpression(expr);
                break;
            case '/':
                this.pass.onDivisionBinaryExpression(expr);
                break;
            case '%':
                this.pass.onReminderBinaryExpression(expr);
                break;
            case '+':
                this.pass.onAdditionBinaryExpression(expr);
                break;
            case '-':
                this.pass.onSubtractionBinaryExpression(expr);
                break;
            case '<<':
                this.pass.onShiftLeftBinaryExpression(expr);
                break;
            case '>>':
                this.pass.onShiftRightBinaryExpression(expr);
                break;
            case '<':
                this.pass.onLessThanBinaryExpression(expr);
                break;
            case '>':
                this.pass.onMoreThanBinaryExpression(expr);
                break;
            case '<=':
                this.pass.onLessThanOrEqualBinaryExpression(expr);
                break;
            case '>=':
                this.pass.onMoreThanOrEqualBinaryExpression(expr);
                break;
            case '==':
                this.pass.onEqualBinaryExpression(expr);
                break;
            case '!=':
                this.pass.onNotEqualBinaryExpression(expr);
                break;
            case '&':
                this.pass.onArithmeticAndBinaryExpression(expr);
                break;
            case '^':
                this.pass.onArithmeticXorBinaryExpression(expr);
                break;
            case '|':
                this.pass.onArithmeticOrBinaryExpression(expr);
                break;
            case '&&':
                this.pass.onLogicalAndBinaryExpression(expr);
                break;
            case '||':
                this.pass.onLogicalOrBinaryExpression(expr);
                break;
            case '=':
                this.pass.onSimpleAssignmentExpression(expr);
                break;
            case '*=':
                this.pass.onMultiplicationAssignmentExpression(expr);
                break;
            case '/=':
                this.pass.onDivisionAssignmentExpression(expr);
                break;
            case '%=':
                this.pass.onRemainderAssignmentExpression(expr);
                break;
            case '+=':
                this.pass.onAdditionAssignmentExpression(expr);
                break;
            case '-=':
                this.pass.onSubtractionAssignmentExpression(expr);
                break;
            case '<<=':
                this.pass.onShiftLeftAssignmentExpression(expr);
                break;
            case '>>=':
                this.pass.onShiftRightAssignmentExpression(expr);
                break;
            case '&=':
                this.pass.onAndAssignmentExpression(expr);
                break;
            case '^=':
                this.pass.onXorAssignmentExpression(expr);
                break;
            case '|=':
                this.pass.onOrAssignmentExpression(expr);
                break;
        }
    };
    return FunctionDefinitionPassManager;
}(PassManager));
exports.FunctionDefinitionPassManager = FunctionDefinitionPassManager;
var Pass = (function () {
    function Pass() {
        this.manager = null;
    }
    return Pass;
}());
exports.Pass = Pass;
var TranslationUnitPass = (function (_super) {
    __extends(TranslationUnitPass, _super);
    function TranslationUnitPass() {
        _super.apply(this, arguments);
    }
    TranslationUnitPass.prototype.onUnit = function (unit) { };
    TranslationUnitPass.prototype.onFunctionDefinition = function (def) { };
    return TranslationUnitPass;
}(Pass));
exports.TranslationUnitPass = TranslationUnitPass;
var FunctionDefinitionPass = (function (_super) {
    __extends(FunctionDefinitionPass, _super);
    function FunctionDefinitionPass() {
        _super.apply(this, arguments);
    }
    FunctionDefinitionPass.prototype.onFunctionDefinition = function (def) { };
    FunctionDefinitionPass.prototype.onDeclaration = function (decl) { };
    FunctionDefinitionPass.prototype.onStatement = function (st) { };
    FunctionDefinitionPass.prototype.onExpressionStatement = function (st) { };
    FunctionDefinitionPass.prototype.onIfStatement = function (st) { };
    FunctionDefinitionPass.prototype.onReturnStatement = function (st) { };
    FunctionDefinitionPass.prototype.onPrimaryExpressionVariable = function (expr) { };
    FunctionDefinitionPass.prototype.onPrimaryExpressionConstant = function (expr) { };
    FunctionDefinitionPass.prototype.onBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onMultiplicationBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onDivisionBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onReminderBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onAdditionBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onSubtractionBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onShiftLeftBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onShiftRightBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onLessThanBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onMoreThanBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onLessThanOrEqualBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onMoreThanOrEqualBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onEqualBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onNotEqualBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onArithmeticAndBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onArithmeticXorBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onArithmeticOrBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onLogicalAndBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onLogicalOrBinaryExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onSimpleAssignmentExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onMultiplicationAssignmentExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onDivisionAssignmentExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onRemainderAssignmentExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onAdditionAssignmentExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onSubtractionAssignmentExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onShiftLeftAssignmentExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onShiftRightAssignmentExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onAndAssignmentExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onXorAssignmentExpression = function (expr) { };
    FunctionDefinitionPass.prototype.onOrAssignmentExpression = function (expr) { };
    return FunctionDefinitionPass;
}(Pass));
exports.FunctionDefinitionPass = FunctionDefinitionPass;

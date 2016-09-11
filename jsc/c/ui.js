"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dom = require('./dom');
function toExpression(e) {
    if (typeof e === 'number') {
        return new dom.PrimaryExpressionConstant(e);
    }
    else if (e instanceof dom.Variable) {
        return new dom.PrimaryExpressionVariable(e);
    }
    else if (e instanceof dom.Expression) {
        return e;
    }
    else if (e instanceof CUiExpressionContext) {
        return e.toExpression();
    }
    else if (!e)
        return null;
    else
        throw TypeError('Expected TUiExpression.');
}
var CUiContext = (function () {
    function CUiContext() {
    }
    CUiContext.prototype.int = function (typeStr) {
        var t = this.t;
        switch (typeStr) {
            case 'void': return t.void;
            case '_Bool': return t.bool;
            case 'char':
            case 'signed char':
                return t.char;
            case 'unsigned char':
                return t.uchar;
            case 'short':
            case 'short int':
            case 'signed short':
            case 'signed short int':
                return t.short;
            case 'unsigned short':
            case 'unsigned short int':
                return t.ushort;
            case 'int':
            case 'signed':
            case 'signed int':
                return t.uint;
            case 'unsigned':
            case 'unsigned int':
                return t.uint;
            case 'long':
            case 'long int':
            case 'signed long':
            case 'signed long int':
                return t.long;
            case 'unsigned long':
            case 'unsigned long int':
                return t.ulong;
            case 'long long':
            case 'long long int':
            case 'signed long long':
            case 'signed long long int':
                return t.long2;
            case 'unsigned long long':
            case 'unsigned long long int':
                return t.ulong2;
            case 'float':
                return t.float;
            case 'double':
                return t.double;
            case 'long double':
                return t.double2;
            default:
                throw Error("Type \"" + typeStr + "\" not recognized.");
        }
    };
    return CUiContext;
}());
exports.CUiContext = CUiContext;
var CUiUnitContext = (function (_super) {
    __extends(CUiUnitContext, _super);
    function CUiUnitContext() {
        _super.call(this);
        this.unit = new dom.TranslationUnit;
        this.t = this.unit.t;
    }
    CUiUnitContext.prototype.func = function (type, name, params, a, b) {
        var body;
        var paramNames = [];
        if (a instanceof Array) {
            paramNames = a;
            body = b;
        }
        else {
            body = a;
        }
        var funcType = new dom.FunctionType(type, params);
        var ctx = CUiFunctionContext.create(this, name, funcType, paramNames);
        body.apply(null, [ctx].concat(ctx.arguments));
        this.unit.externalDeclarations.push(ctx.func);
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var funcExpr = new CUiExpressionContext(new dom.PrimaryExpressionIdentifier(ctx.func.identifier));
            return funcExpr['()'].apply(funcExpr, args);
        };
    };
    CUiUnitContext.prototype.main = function (body) {
        var type = new dom.FunctionType(this.t.int);
        var ctx = CUiFunctionContext.create(this, 'main', type);
        body(ctx);
        this.unit.externalDeclarations.push(ctx.func);
        return ctx.func;
    };
    CUiUnitContext.prototype.toString = function () {
        return this.unit.toString();
    };
    return CUiUnitContext;
}(CUiContext));
exports.CUiUnitContext = CUiUnitContext;
var CUiScopeContext = (function (_super) {
    __extends(CUiScopeContext, _super);
    function CUiScopeContext() {
        _super.apply(this, arguments);
    }
    CUiScopeContext.prototype.createBlockContext = function (block) {
        var ctx = new CUiBlockContext(block);
        ctx.t = this.t;
        ctx.ctxFunc = this.ctxFunc;
        ctx.ctxParent = this;
        return ctx;
    };
    CUiScopeContext.prototype.addStatement = function (st) {
        this.getBlock().push(st);
    };
    CUiScopeContext.prototype['var'] = function (type, name, value) {
        var variable = new dom.Variable(type, name);
        var decl = new dom.Declaration(variable);
        this.addStatement(decl);
        var ctx = new CUiVariableContext(variable);
        return ctx;
    };
    CUiScopeContext.prototype.lbl = function (label) {
        if (typeof label === 'string') {
            return this.ctxFunc.func.labels.get(label);
        }
        else if (label instanceof dom.Label) {
            return label;
        }
        else if (label instanceof dom.LabelStatement) {
            return label.label;
        }
        else
            throw TypeError('Expected TUiLabel.');
    };
    CUiScopeContext.prototype.label = function (label) {
        var labelStatement = new dom.LabelStatement(this.lbl(label));
        this.addStatement(labelStatement);
        return labelStatement;
    };
    CUiScopeContext.prototype.goto = function (label) {
        var gotoStatement = new dom.GotoStatement(this.lbl(label));
        this.addStatement(gotoStatement);
        return gotoStatement;
    };
    CUiScopeContext.prototype._ = function (expr) {
        var st = new dom.ExpressionStatement(toExpression(expr));
        this.addStatement(st);
        return st;
    };
    CUiScopeContext.prototype.wrap = function (expr) {
        return new CUiExpressionContext(expr);
    };
    CUiScopeContext.prototype.sizeof = function (expr) {
        return this.wrap(new dom.UnarySizeofExpression(toExpression(expr)));
    };
    CUiScopeContext.prototype['if'] = function (expr, onTrue, onFalse) {
        var ifStatement = new dom.IfStatement(toExpression(expr));
        var ctxTrue = this.createBlockContext(ifStatement.trueBlock);
        onTrue(ctxTrue);
        if (onFalse) {
            var ctxFalse = this.createBlockContext(ifStatement.falseBlock);
            onFalse(ctxFalse);
        }
        ifStatement.trueBlock = ctxTrue.getBlock();
        this.addStatement(ifStatement);
        return ifStatement;
    };
    CUiScopeContext.prototype['while'] = function (expr, onWhile) {
        var whileStatement = new dom.WhileStatement(toExpression(expr));
        var ctx = this.createBlockContext(whileStatement.body);
        onWhile(ctx);
        this.addStatement(whileStatement);
        return whileStatement;
    };
    CUiScopeContext.prototype['do'] = function (onDo, expr) {
        var doStatement = new dom.DoStatement(toExpression(expr));
        var ctx = this.createBlockContext(doStatement.body);
        onDo(ctx);
        this.addStatement(doStatement);
        return doStatement;
    };
    CUiScopeContext.prototype['for'] = function (e1, e2, e3, onFor) {
        var forStatement = new dom.ForStatement(toExpression(e1), toExpression(e2), toExpression(e3));
        var ctx = this.createBlockContext(forStatement.body);
        onFor(ctx);
        this.addStatement(forStatement);
        return forStatement;
    };
    CUiScopeContext.prototype['return'] = function (expr) {
        var returnStatement = new dom.ReturnStatement(typeof expr !== 'undefined' ? toExpression(expr) : null);
        this.addStatement(returnStatement);
        return returnStatement;
    };
    CUiScopeContext.prototype['continue'] = function () {
        var continueStatement = new dom.ContinueStatement;
        this.addStatement(continueStatement);
        return continueStatement;
    };
    CUiScopeContext.prototype['break'] = function () {
        var breakStatement = new dom.BreakStatement;
        this.addStatement(breakStatement);
        return breakStatement;
    };
    return CUiScopeContext;
}(CUiContext));
exports.CUiScopeContext = CUiScopeContext;
var _loop_1 = function(uop) {
    CUiScopeContext.prototype[uop] = function (expr) {
        return this.wrap(new dom.UnaryExpression(uop, toExpression(expr)));
    };
};
for (var _i = 0, _a = dom.UNARY_OPERATORS; _i < _a.length; _i++) {
    var uop = _a[_i];
    _loop_1(uop);
}
var CUiBlockContext = (function (_super) {
    __extends(CUiBlockContext, _super);
    function CUiBlockContext(block) {
        if (block === void 0) { block = new dom.Block; }
        _super.call(this);
        this.block = block;
    }
    CUiBlockContext.prototype.getBlock = function () {
        return this.block;
    };
    return CUiBlockContext;
}(CUiScopeContext));
exports.CUiBlockContext = CUiBlockContext;
var CUiFunctionContext = (function (_super) {
    __extends(CUiFunctionContext, _super);
    function CUiFunctionContext(identifier, type, paramNames) {
        if (paramNames === void 0) { paramNames = null; }
        _super.call(this);
        this.arguments = null;
        this.func = new dom.FunctionDefinition(identifier, type, null, paramNames);
        this.args();
    }
    CUiFunctionContext.create = function (ctxUnit, identifier, type, paramNames) {
        var ctx = new CUiFunctionContext(identifier, type, paramNames);
        ctx.t = ctxUnit.t;
        ctx.ctxParent = ctxUnit;
        ctx.ctxFunc = ctx;
        return ctx;
    };
    CUiFunctionContext.prototype.args = function () {
        if (!this.arguments) {
            this.arguments = [];
            for (var _i = 0, _a = this.func.arguments; _i < _a.length; _i++) {
                var arg = _a[_i];
                this.arguments.push(new CUiVariableContext(arg));
            }
        }
        return this.arguments;
    };
    CUiFunctionContext.prototype.getBlock = function () {
        return this.func.body;
    };
    CUiFunctionContext.prototype.decl = function () {
    };
    CUiFunctionContext.prototype['='] = function (lvalue, value) {
        var assignmentExpression = _super.prototype['='].call(this, lvalue, value);
        this.func.body.push(assignmentExpression);
        return assignmentExpression;
    };
    CUiFunctionContext.prototype.call = function (func, args) {
        var functionCallExpression = new dom.PostfixFunctionCallExpression(func, args);
        var expressionStatement = new dom.ExpressionStatement(functionCallExpression);
        this.addStatement(expressionStatement);
        return functionCallExpression;
    };
    return CUiFunctionContext;
}(CUiScopeContext));
exports.CUiFunctionContext = CUiFunctionContext;
var CUiExpressionContext = (function () {
    function CUiExpressionContext(expression) {
        if (expression === void 0) { expression = null; }
        this.expression = expression;
    }
    CUiExpressionContext.prototype.toExpression = function () {
        return this.expression;
    };
    CUiExpressionContext.prototype.wrap = function (expr) {
        return new CUiExpressionContext(expr);
    };
    CUiExpressionContext.prototype['++'] = function () {
        return this.wrap(new dom.PostfixIncrementExpression(this.toExpression()));
    };
    CUiExpressionContext.prototype['--'] = function () {
        return this.wrap(new dom.PostfixDecrementExpression(this.toExpression()));
    };
    CUiExpressionContext.prototype['[]'] = function () {
        var subscripts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            subscripts[_i - 0] = arguments[_i];
        }
        if (subscripts.length === 1) {
            return this.wrap(new dom.PostfixArraySubscriptExpression(this.toExpression(), toExpression(subscripts[0])));
        }
        else {
            var tmp = this;
            for (var _a = 0, subscripts_1 = subscripts; _a < subscripts_1.length; _a++) {
                var expr = subscripts_1[_a];
                tmp = tmp['[]'](expr);
            }
            return tmp;
        }
    };
    CUiExpressionContext.prototype['()'] = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        for (var i = 0; i < args.length; i++) {
            args[i] = toExpression(args[i]);
        }
        var funcCallExpression = new dom.PostfixFunctionCallExpression(this.toExpression(), args);
        return this.wrap(funcCallExpression);
    };
    CUiExpressionContext.prototype.cast = function (type) {
        return this.wrap(new dom.CastExpression(type, this.toExpression()));
    };
    return CUiExpressionContext;
}());
exports.CUiExpressionContext = CUiExpressionContext;
var _loop_2 = function(bop) {
    CUiExpressionContext.prototype[bop] = function (expr) {
        return this.wrap(new dom.BinaryExpression(bop, this.toExpression(), toExpression(expr)));
    };
};
for (var _b = 0, _c = dom.BINARY_OPERATORS; _b < _c.length; _b++) {
    var bop = _c[_b];
    _loop_2(bop);
}
var _loop_3 = function(sop) {
    CUiExpressionContext.prototype[sop] = function (expr) {
        return this.wrap(new dom.AssignmentExpression(sop, this.toExpression(), toExpression(expr)));
    };
};
for (var _d = 0, _e = dom.ASSIGNMENT_OPERATORS; _d < _e.length; _d++) {
    var sop = _e[_d];
    _loop_3(sop);
}
var CUiVariableContext = (function (_super) {
    __extends(CUiVariableContext, _super);
    function CUiVariableContext(variable) {
        _super.call(this);
        this.variable = variable;
        this.expression = new dom.PrimaryExpressionVariable(variable);
    }
    return CUiVariableContext;
}(CUiExpressionContext));
exports.CUiVariableContext = CUiVariableContext;
function create() {
    var unitContext = new CUiUnitContext;
    return unitContext;
}
exports.create = create;

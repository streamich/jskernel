"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (TYPE_QUALIFIER) {
    TYPE_QUALIFIER[TYPE_QUALIFIER["none"] = 0] = "none";
    TYPE_QUALIFIER[TYPE_QUALIFIER['const'] = 1] = 'const';
    TYPE_QUALIFIER[TYPE_QUALIFIER["restrict"] = 2] = "restrict";
    TYPE_QUALIFIER[TYPE_QUALIFIER["volatile"] = 3] = "volatile";
})(exports.TYPE_QUALIFIER || (exports.TYPE_QUALIFIER = {}));
var TYPE_QUALIFIER = exports.TYPE_QUALIFIER;
(function (STORAGE_CLASS) {
    STORAGE_CLASS[STORAGE_CLASS["none"] = 0] = "none";
    STORAGE_CLASS[STORAGE_CLASS['extern'] = 1] = 'extern';
    STORAGE_CLASS[STORAGE_CLASS['static'] = 2] = 'static';
    STORAGE_CLASS[STORAGE_CLASS["auto"] = 3] = "auto";
    STORAGE_CLASS[STORAGE_CLASS["register"] = 4] = "register";
})(exports.STORAGE_CLASS || (exports.STORAGE_CLASS = {}));
var STORAGE_CLASS = exports.STORAGE_CLASS;
var Type = (function () {
    function Type() {
        this.typeQualifier = TYPE_QUALIFIER.none;
        this.storageClass = STORAGE_CLASS.none;
        this.size = 0;
    }
    Type.prototype.toStringSpecifiers = function () {
        var list = [];
        if (this.typeQualifier !== TYPE_QUALIFIER.none)
            list.push(TYPE_QUALIFIER[this.typeQualifier]);
        if (this.storageClass !== STORAGE_CLASS.none)
            list.push(STORAGE_CLASS[this.storageClass]);
        return list.join(' ');
    };
    Type.prototype.toStringDeclaration = function (name) {
        return this.toString() + ' ' + name;
    };
    Type.prototype.toString = function () {
        var specifiers = this.toStringSpecifiers();
        return (specifiers ? specifiers + ' ' : '') + '[type]';
    };
    return Type;
}());
exports.Type = Type;
var VoidType = (function (_super) {
    __extends(VoidType, _super);
    function VoidType() {
        _super.apply(this, arguments);
    }
    VoidType.prototype.toString = function () {
        return 'void';
    };
    return VoidType;
}(Type));
exports.VoidType = VoidType;
var ObjectType = (function (_super) {
    __extends(ObjectType, _super);
    function ObjectType() {
        _super.apply(this, arguments);
        this.alignment = 0;
    }
    ObjectType.prototype.getSize = function () {
        return this.size;
    };
    return ObjectType;
}(Type));
exports.ObjectType = ObjectType;
var PrimitiveType = (function (_super) {
    __extends(PrimitiveType, _super);
    function PrimitiveType(baseType, isUnsigned) {
        if (isUnsigned === void 0) { isUnsigned = false; }
        _super.call(this);
        this.baseType = baseType;
        this.isUnsigned = isUnsigned;
    }
    PrimitiveType.prototype.toString = function () {
        var specifiers = this.toStringSpecifiers();
        return (specifiers ? specifiers + ' ' : '') +
            (this.isUnsigned ? 'unsigned ' : '') +
            this.baseType;
    };
    return PrimitiveType;
}(ObjectType));
exports.PrimitiveType = PrimitiveType;
var BoolType = (function (_super) {
    __extends(BoolType, _super);
    function BoolType() {
        _super.call(this, '_Bool');
    }
    return BoolType;
}(PrimitiveType));
exports.BoolType = BoolType;
exports.t_void = new VoidType;
function createTypes() {
    var t = {
        'void': exports.t_void,
        bool: new BoolType,
        char: new PrimitiveType('char'),
        uchar: new PrimitiveType('char', true),
        short: new PrimitiveType('short'),
        ushort: new PrimitiveType('short', true),
        int: new PrimitiveType('int'),
        uint: new PrimitiveType('int', true),
        long: new PrimitiveType('long'),
        ulong: new PrimitiveType('long', true),
        long2: new PrimitiveType('long long'),
        ulong2: new PrimitiveType('long long', true),
        float: new PrimitiveType('float'),
        double: new PrimitiveType('double'),
        double2: new PrimitiveType('long double'),
        ptr: function (baseType) { return new PointerType(baseType); },
        arr: function (baseType, length) { return new ArrayType(baseType, length); },
        func: function (returnType, params, isVariadic) {
            if (returnType === void 0) { returnType = exports.t_void; }
            if (params === void 0) { params = []; }
            if (isVariadic === void 0) { isVariadic = false; }
            return new FunctionType(returnType, params, isVariadic);
        },
    };
    return t;
}
exports.createTypes = createTypes;
var PointerType = (function (_super) {
    __extends(PointerType, _super);
    function PointerType(base) {
        _super.call(this);
        this.base = base;
    }
    PointerType.prototype.toStringDeclaration = function (name) {
        return this.base.toStringDeclaration('*' + name);
    };
    PointerType.prototype.toString = function () {
        return this.base.toString() + '*';
    };
    return PointerType;
}(ObjectType));
exports.PointerType = PointerType;
var ArrayType = (function (_super) {
    __extends(ArrayType, _super);
    function ArrayType(baseType, lengths) {
        _super.call(this, baseType);
        this.lengths = typeof lengths === 'number' ? [lengths] : lengths;
    }
    ArrayType.prototype.getSize = function () {
        var size = this.base.getSize();
        for (var _i = 0, _a = this.lengths; _i < _a.length; _i++) {
            var length = _a[_i];
            size *= length;
        }
        return size;
    };
    ArrayType.prototype.toStringDeclaration = function (name) {
        return this.base.toStringDeclaration(name + this.toStringDimension());
    };
    ArrayType.prototype.toStringDimension = function () {
        return '[' + this.lengths.join('][') + ']';
    };
    ArrayType.prototype.toString = function () {
        return this.base.toString() + this.toStringDimension();
    };
    return ArrayType;
}(PointerType));
exports.ArrayType = ArrayType;
var StructType = (function (_super) {
    __extends(StructType, _super);
    function StructType(members, identifier) {
        if (members === void 0) { members = []; }
        if (identifier === void 0) { identifier = new Identifier; }
        _super.call(this);
        this.identifier = identifier;
        this.members = members;
    }
    StructType.prototype.getSize = function () {
        var total = 0;
        for (var _i = 0, _a = this.members; _i < _a.length; _i++) {
            var member = _a[_i];
            total += member[0].getSize();
        }
        return total;
    };
    StructType.prototype.toString = function (tabs) {
        if (tabs === void 0) { tabs = ''; }
        var list = [];
        for (var _i = 0, _a = this.members; _i < _a.length; _i++) {
            var _b = _a[_i], type = _b[0], name = _b[1];
            list.push(type.toString() + ' ' + name + ';');
        }
        return tabs + 'struct ' + this.identifier.toString() + ' {\n' +
            tabs + '    ' + list.join('\n' + tabs + '    ') +
            tabs + '};';
    };
    return StructType;
}(ObjectType));
exports.StructType = StructType;
var FunctionType = (function (_super) {
    __extends(FunctionType, _super);
    function FunctionType(type, params, isVariadic) {
        if (type === void 0) { type = exports.t_void; }
        if (params === void 0) { params = []; }
        if (isVariadic === void 0) { isVariadic = false; }
        _super.call(this);
        this.returnType = type;
        this.paramTypes = params;
        this.isVariadic = isVariadic;
    }
    return FunctionType;
}(Type));
exports.FunctionType = FunctionType;
var MemoryLocation = (function () {
    function MemoryLocation() {
    }
    return MemoryLocation;
}());
exports.MemoryLocation = MemoryLocation;
var Identifier = (function () {
    function Identifier(name, ref) {
        if (name === void 0) { name = null; }
        if (ref === void 0) { ref = null; }
        this.ref = null;
        this.name = name;
        if (ref)
            this.bind(ref);
    }
    Identifier.prototype.getName = function () {
        if (!this.name) {
            this.name = '__identifier' + (Identifier.cnt++);
        }
        return this.name;
    };
    Identifier.prototype.bind = function (ref) {
        this.ref = ref;
    };
    Identifier.prototype.toString = function () {
        return this.getName();
    };
    Identifier.cnt = 0;
    return Identifier;
}());
exports.Identifier = Identifier;
var IdentifierScope = (function () {
    function IdentifierScope(parent) {
        if (parent === void 0) { parent = null; }
        this.map = {};
        this.parent = parent;
    }
    IdentifierScope.prototype.get = function (name) {
        return this.map[name];
    };
    IdentifierScope.prototype.put = function (id) {
        this.map[id.getName()] = id;
    };
    return IdentifierScope;
}());
exports.IdentifierScope = IdentifierScope;
var Variable = (function () {
    function Variable(type, identifier) {
        if (identifier === void 0) { identifier = new Identifier; }
        this.type = type;
        if (typeof identifier === 'string') {
            this.identifier = new Identifier(identifier);
        }
        else {
            this.identifier = identifier;
        }
        this.identifier.bind(this);
    }
    Variable.prototype.getName = function () {
        return this.identifier.getName();
    };
    Variable.prototype.toString = function () {
        return this.type.toStringDeclaration(this.identifier.toString());
    };
    return Variable;
}());
exports.Variable = Variable;
var Label = (function () {
    function Label(name) {
        this.statement = null;
        this.name = name;
    }
    Label.prototype.getName = function () {
        if (!this.name) {
            this.name = '__label' + (Label.cnt++);
        }
        return this.name;
    };
    Label.prototype.bind = function (st) {
        if (this.statement)
            throw Error("Label already bound \"" + this.getName() + "\".");
        this.statement = st;
    };
    Label.prototype.toString = function () {
        return this.getName();
    };
    Label.cnt = 0;
    return Label;
}());
exports.Label = Label;
var LabelMap = (function () {
    function LabelMap() {
        this.map = {};
    }
    LabelMap.prototype.get = function (name) {
        if (!this.map[name]) {
            this.map[name] = new Label(name);
        }
        return this.map[name];
    };
    return LabelMap;
}());
exports.LabelMap = LabelMap;
function toStringExpression(expr) {
    if (expr instanceof PrimaryExpression) {
        return expr.toString();
    }
    else if (expr instanceof PostfixArraySubscriptExpression) {
        return expr.toString();
    }
    else {
        return '(' + expr.toString() + ')';
    }
}
var Expression = (function () {
    function Expression() {
        this.type = null;
        this.parent = null;
        this.rvalue = null;
    }
    Expression.prototype.onWalk = function (iterator) {
        iterator.onExpression(this);
    };
    return Expression;
}());
exports.Expression = Expression;
var PrimaryExpression = (function (_super) {
    __extends(PrimaryExpression, _super);
    function PrimaryExpression(operand) {
        _super.call(this);
        this.operand = operand;
    }
    PrimaryExpression.create = function (value) {
        if (value instanceof Variable) {
            return new PrimaryExpressionVariable(value);
        }
        else
            throw TypeError('Cannot create PrimaryExpression from supplied argument.');
    };
    PrimaryExpression.prototype.onWalk = function (iterator) {
        iterator.onPrimaryExpression(this);
    };
    return PrimaryExpression;
}(Expression));
exports.PrimaryExpression = PrimaryExpression;
var PrimaryExpressionVariable = (function (_super) {
    __extends(PrimaryExpressionVariable, _super);
    function PrimaryExpressionVariable() {
        _super.apply(this, arguments);
    }
    PrimaryExpressionVariable.prototype.toString = function () {
        return this.operand.identifier.toString();
    };
    PrimaryExpressionVariable.prototype.onWalk = function (iterator) {
        iterator.onPrimaryExpressionVariable(this);
    };
    return PrimaryExpressionVariable;
}(PrimaryExpression));
exports.PrimaryExpressionVariable = PrimaryExpressionVariable;
var PrimaryExpressionIdentifier = (function (_super) {
    __extends(PrimaryExpressionIdentifier, _super);
    function PrimaryExpressionIdentifier() {
        _super.apply(this, arguments);
    }
    PrimaryExpressionIdentifier.prototype.toString = function () {
        return this.operand.toString();
    };
    return PrimaryExpressionIdentifier;
}(PrimaryExpression));
exports.PrimaryExpressionIdentifier = PrimaryExpressionIdentifier;
var PrimaryExpressionConstant = (function (_super) {
    __extends(PrimaryExpressionConstant, _super);
    function PrimaryExpressionConstant() {
        _super.apply(this, arguments);
    }
    PrimaryExpressionConstant.prototype.toString = function () {
        return String(this.operand);
    };
    return PrimaryExpressionConstant;
}(PrimaryExpression));
exports.PrimaryExpressionConstant = PrimaryExpressionConstant;
var PostfixExpression = (function (_super) {
    __extends(PostfixExpression, _super);
    function PostfixExpression(operand) {
        _super.call(this);
        operand.parent = this;
        this.operand = operand;
    }
    return PostfixExpression;
}(Expression));
exports.PostfixExpression = PostfixExpression;
var PostfixIncrementExpression = (function (_super) {
    __extends(PostfixIncrementExpression, _super);
    function PostfixIncrementExpression() {
        _super.apply(this, arguments);
    }
    PostfixIncrementExpression.prototype.toString = function () {
        return toStringExpression(this.operand) + '++';
    };
    return PostfixIncrementExpression;
}(PostfixExpression));
exports.PostfixIncrementExpression = PostfixIncrementExpression;
var PostfixDecrementExpression = (function (_super) {
    __extends(PostfixDecrementExpression, _super);
    function PostfixDecrementExpression() {
        _super.apply(this, arguments);
    }
    PostfixDecrementExpression.prototype.toString = function () {
        return toStringExpression(this.operand) + '--';
    };
    return PostfixDecrementExpression;
}(PostfixExpression));
exports.PostfixDecrementExpression = PostfixDecrementExpression;
var PostfixArraySubscriptExpression = (function (_super) {
    __extends(PostfixArraySubscriptExpression, _super);
    function PostfixArraySubscriptExpression(operand, subscriptExpression) {
        _super.call(this, operand);
        subscriptExpression.parent = this;
        this.subscriptExpression = subscriptExpression;
    }
    PostfixArraySubscriptExpression.prototype.toString = function () {
        return this.operand.toString() + '[' + this.subscriptExpression.toString() + ']';
    };
    return PostfixArraySubscriptExpression;
}(PostfixExpression));
exports.PostfixArraySubscriptExpression = PostfixArraySubscriptExpression;
var PostfixFunctionCallExpression = (function (_super) {
    __extends(PostfixFunctionCallExpression, _super);
    function PostfixFunctionCallExpression(operand, args) {
        if (args === void 0) { args = []; }
        _super.call(this, operand);
        for (var _i = 0, args_1 = args; _i < args_1.length; _i++) {
            var arg = args_1[_i];
            arg.parent = this;
        }
        this.args = args;
    }
    PostfixFunctionCallExpression.prototype.toString = function () {
        var list = [];
        for (var _i = 0, _a = this.args; _i < _a.length; _i++) {
            var arg = _a[_i];
            list.push(arg.toString());
        }
        return this.operand.toString() + '(' + list.join(', ') + ')';
    };
    return PostfixFunctionCallExpression;
}(PostfixExpression));
exports.PostfixFunctionCallExpression = PostfixFunctionCallExpression;
exports.UNARY_OPERATORS = ['++', '--', '&', '*', '+', '-', '~', '!'];
var UnaryExpression = (function (_super) {
    __extends(UnaryExpression, _super);
    function UnaryExpression(operator, operand) {
        _super.call(this);
        this.operator = operator;
        if (operand instanceof Expression)
            operand.parent = this;
        this.operand = operand;
    }
    UnaryExpression.prototype.toString = function () {
        return this.operator + toStringExpression(this.operand);
    };
    return UnaryExpression;
}(Expression));
exports.UnaryExpression = UnaryExpression;
var UnaryIncrementExpression = (function (_super) {
    __extends(UnaryIncrementExpression, _super);
    function UnaryIncrementExpression(operand) {
        _super.call(this, '++', operand);
    }
    return UnaryIncrementExpression;
}(UnaryExpression));
exports.UnaryIncrementExpression = UnaryIncrementExpression;
var UnaryDecrementExpression = (function (_super) {
    __extends(UnaryDecrementExpression, _super);
    function UnaryDecrementExpression(operand) {
        _super.call(this, '--', operand);
    }
    return UnaryDecrementExpression;
}(UnaryExpression));
exports.UnaryDecrementExpression = UnaryDecrementExpression;
var UnarySizeofExpression = (function (_super) {
    __extends(UnarySizeofExpression, _super);
    function UnarySizeofExpression(operand) {
        _super.call(this, 'sizeof', operand);
    }
    UnarySizeofExpression.prototype.toString = function () {
        return this.operator + '(' + this.operand.toString() + ')';
    };
    return UnarySizeofExpression;
}(UnaryExpression));
exports.UnarySizeofExpression = UnarySizeofExpression;
var CastExpression = (function (_super) {
    __extends(CastExpression, _super);
    function CastExpression(type, operand) {
        _super.call(this);
        this.type = type;
        operand.parent = this;
        this.operand = operand;
    }
    CastExpression.prototype.toString = function () {
        return '(' + this.type.toString() + ') ' + toStringExpression(this.operand);
    };
    return CastExpression;
}(Expression));
exports.CastExpression = CastExpression;
exports.BINARY_OPERATORS = ['*', '/', '%', '+', '-', '<<', '>>',
    '<', '>', '<=', '>=', '==', '!=', '&', '^', '|', '&&', '||'];
exports.ASSIGNMENT_OPERATORS = ['=', '*=', '/=', '%=', '+=',
    '-=', '<<=', '>>=', '&=', '^=', '|='];
var BinaryExpression = (function (_super) {
    __extends(BinaryExpression, _super);
    function BinaryExpression(operator, op1, op2) {
        _super.call(this);
        this.operator = operator;
        op1.parent = this;
        this.operand1 = op1;
        op2.parent = this;
        this.operand2 = op2;
    }
    BinaryExpression.prototype.toString = function () {
        return toStringExpression(this.operand1) + ' ' + this.operator +
            ' ' + toStringExpression(this.operand2);
    };
    return BinaryExpression;
}(Expression));
exports.BinaryExpression = BinaryExpression;
var AssignmentExpression = (function (_super) {
    __extends(AssignmentExpression, _super);
    function AssignmentExpression(operator, op1, op2) {
        _super.call(this, operator, op1, op2);
    }
    return AssignmentExpression;
}(BinaryExpression));
exports.AssignmentExpression = AssignmentExpression;
var TernaryExpression = (function (_super) {
    __extends(TernaryExpression, _super);
    function TernaryExpression(op1, op2, op3) {
        _super.call(this);
        op1.parent = this;
        this.operand1 = op1;
        op2.parent = this;
        this.operand2 = op2;
        op3.parent = this;
        this.operand3 = op3;
    }
    return TernaryExpression;
}(Expression));
exports.TernaryExpression = TernaryExpression;
var ConditionalExpression = (function (_super) {
    __extends(ConditionalExpression, _super);
    function ConditionalExpression() {
        _super.apply(this, arguments);
    }
    ConditionalExpression.prototype.toString = function () {
        return toStringExpression(this.operand1) + ' ? ' + toStringExpression(this.operand2) +
            ' : ' + toStringExpression(this.operand3);
    };
    return ConditionalExpression;
}(TernaryExpression));
exports.ConditionalExpression = ConditionalExpression;
var BlockItem = (function () {
    function BlockItem() {
        this.parent = null;
    }
    return BlockItem;
}());
exports.BlockItem = BlockItem;
var Declaration = (function (_super) {
    __extends(Declaration, _super);
    function Declaration(variable) {
        _super.call(this);
        this.variable = variable;
    }
    Declaration.prototype.toString = function (tabs) {
        if (tabs === void 0) { tabs = ''; }
        return tabs + this.variable.toString() + ';';
    };
    return Declaration;
}(BlockItem));
exports.Declaration = Declaration;
var Statement = (function (_super) {
    __extends(Statement, _super);
    function Statement() {
        _super.apply(this, arguments);
    }
    Statement.prototype.toString = function (tabs) {
        if (tabs === void 0) { tabs = ''; }
        return tabs + '/* abstract statement */;';
    };
    return Statement;
}(BlockItem));
exports.Statement = Statement;
var ExpressionStatement = (function (_super) {
    __extends(ExpressionStatement, _super);
    function ExpressionStatement(expression) {
        if (expression === void 0) { expression = null; }
        _super.call(this);
        this.expression = expression;
    }
    ExpressionStatement.prototype.toString = function (tabs) {
        if (tabs === void 0) { tabs = ''; }
        return tabs + (this.expression ? this.expression.toString() : '') + ';';
    };
    return ExpressionStatement;
}(Statement));
exports.ExpressionStatement = ExpressionStatement;
var IfStatement = (function (_super) {
    __extends(IfStatement, _super);
    function IfStatement(expression) {
        if (expression === void 0) { expression = null; }
        _super.call(this);
        this.trueBlock = new Block;
        this.falseBlock = new Block;
        this.expression = expression;
    }
    IfStatement.prototype.toString = function (tabs) {
        if (tabs === void 0) { tabs = ''; }
        return tabs + ("if (" + this.expression.toString() + ") " + this.trueBlock.toString(tabs)) +
            (this.falseBlock && this.falseBlock.items.length ? ' else ' + this.falseBlock.toString(tabs) : '');
    };
    return IfStatement;
}(Statement));
exports.IfStatement = IfStatement;
var IterationStatement = (function (_super) {
    __extends(IterationStatement, _super);
    function IterationStatement(expression) {
        if (expression === void 0) { expression = null; }
        _super.call(this);
        this.body = new Block(this);
        this.labelBreak = null;
        this.labelContinue = null;
        this.controlExpr = expression;
    }
    return IterationStatement;
}(Statement));
exports.IterationStatement = IterationStatement;
var WhileStatement = (function (_super) {
    __extends(WhileStatement, _super);
    function WhileStatement() {
        _super.apply(this, arguments);
    }
    WhileStatement.prototype.toString = function (tabs) {
        if (tabs === void 0) { tabs = ''; }
        return tabs + ("while (" + this.controlExpr.toString() + ") " + this.body.toString(tabs));
    };
    return WhileStatement;
}(IterationStatement));
exports.WhileStatement = WhileStatement;
var DoStatement = (function (_super) {
    __extends(DoStatement, _super);
    function DoStatement() {
        _super.apply(this, arguments);
    }
    DoStatement.prototype.toString = function (tabs) {
        if (tabs === void 0) { tabs = ''; }
        return tabs + ("do " + this.body.toString(tabs) + " while (" + this.controlExpr.toString() + ");");
    };
    return DoStatement;
}(IterationStatement));
exports.DoStatement = DoStatement;
var ForStatement = (function (_super) {
    __extends(ForStatement, _super);
    function ForStatement(expr1, expr2, expr3) {
        if (expr1 === void 0) { expr1 = null; }
        if (expr2 === void 0) { expr2 = null; }
        if (expr3 === void 0) { expr3 = null; }
        _super.call(this, expr2);
        this.expr1 = expr1;
        this.expr3 = expr3;
    }
    ForStatement.prototype.toString = function (tabs) {
        if (tabs === void 0) { tabs = ''; }
        return tabs + ("for (" + this.expr1.toString() + "; " + this.controlExpr.toString() + "; " + this.expr3.toString() + ")") +
            this.body.toString(tabs);
    };
    return ForStatement;
}(IterationStatement));
exports.ForStatement = ForStatement;
var ReturnStatement = (function (_super) {
    __extends(ReturnStatement, _super);
    function ReturnStatement(expression) {
        if (expression === void 0) { expression = null; }
        _super.call(this);
        if (expression)
            this.expression = expression;
    }
    ReturnStatement.prototype.toString = function (tabs) {
        if (tabs === void 0) { tabs = ''; }
        return tabs + 'return' + (this.expression ? ' ' + this.expression.toString() : '') + ';';
    };
    return ReturnStatement;
}(Statement));
exports.ReturnStatement = ReturnStatement;
var ContinueStatement = (function (_super) {
    __extends(ContinueStatement, _super);
    function ContinueStatement() {
        _super.apply(this, arguments);
    }
    ContinueStatement.prototype.toString = function (tabs) {
        if (tabs === void 0) { tabs = ''; }
        return tabs + 'continue;';
    };
    return ContinueStatement;
}(Statement));
exports.ContinueStatement = ContinueStatement;
var BreakStatement = (function (_super) {
    __extends(BreakStatement, _super);
    function BreakStatement() {
        _super.apply(this, arguments);
    }
    BreakStatement.prototype.toString = function (tabs) {
        if (tabs === void 0) { tabs = ''; }
        return tabs + 'break;';
    };
    return BreakStatement;
}(Statement));
exports.BreakStatement = BreakStatement;
var LabelStatement = (function (_super) {
    __extends(LabelStatement, _super);
    function LabelStatement(label) {
        _super.call(this);
        this.label = label;
        label.bind(this);
    }
    LabelStatement.prototype.toString = function (tabs) {
        if (tabs === void 0) { tabs = ''; }
        return this.label.toString() + ':';
    };
    return LabelStatement;
}(Statement));
exports.LabelStatement = LabelStatement;
var GotoStatement = (function (_super) {
    __extends(GotoStatement, _super);
    function GotoStatement(label) {
        _super.call(this);
        this.label = label;
    }
    GotoStatement.prototype.toString = function (tabs) {
        if (tabs === void 0) { tabs = ''; }
        return tabs + 'goto ' + this.label.toString() + ';';
    };
    return GotoStatement;
}(Statement));
exports.GotoStatement = GotoStatement;
var Block = (function () {
    function Block(parent) {
        if (parent === void 0) { parent = null; }
        this.parent = null;
        this.items = [];
        this.ids = new IdentifierScope;
        this.parent = parent;
    }
    Block.prototype.push = function (item) {
        item.parent = this;
        this.items.push(item);
    };
    Block.prototype.toString = function (spaces) {
        if (spaces === void 0) { spaces = ''; }
        var list = [];
        var innerSpaces = spaces + '    ';
        for (var _i = 0, _a = this.items; _i < _a.length; _i++) {
            var item = _a[_i];
            list.push(item.toString(innerSpaces));
        }
        return '{\n' + list.join('\n') + '\n' + spaces + '}';
    };
    return Block;
}());
exports.Block = Block;
var FunctionDefinition = (function () {
    function FunctionDefinition(identifier, type, body, paramNames) {
        if (identifier === void 0) { identifier = null; }
        if (type === void 0) { type = new FunctionType; }
        if (body === void 0) { body = null; }
        if (paramNames === void 0) { paramNames = null; }
        this.body = null;
        this.labels = new LabelMap;
        this.arguments = [];
        if (typeof identifier === 'string') {
            this.identifier = new Identifier(identifier);
        }
        else
            this.identifier = identifier;
        this.identifier.bind(this);
        this.type = type;
        this.body = body ? body : new Block;
        for (var i = 0; i < type.paramTypes.length; i++) {
            var paramType = type.paramTypes[i];
            var paramName = (paramNames && paramNames[i] ? paramNames[i] : null);
            var arg = new Variable(paramType, new Identifier(paramName));
            this.body.ids.put(arg.identifier);
            this.arguments.push(arg);
        }
    }
    FunctionDefinition.prototype.getIdentifier = function () {
        if (!this.identifier) {
            this.identifier = new Identifier;
        }
        return this.identifier;
    };
    FunctionDefinition.prototype.getName = function () {
        return this.identifier.getName();
    };
    FunctionDefinition.prototype.toString = function (spaces) {
        if (spaces === void 0) { spaces = ''; }
        var args = [];
        for (var _i = 0, _a = this.arguments; _i < _a.length; _i++) {
            var arg = _a[_i];
            args.push(arg.toString());
        }
        return spaces + this.type.returnType.toString() + ' ' + this.identifier.getName() + '(' + args.join(', ') + ') ' + this.body.toString(spaces);
    };
    return FunctionDefinition;
}());
exports.FunctionDefinition = FunctionDefinition;
var TranslationUnit = (function () {
    function TranslationUnit() {
        this.externalDeclarations = [];
        this.ids = new IdentifierScope;
        this.t = createTypes();
    }
    TranslationUnit.prototype.add = function (decl) {
        this.externalDeclarations.push(decl);
    };
    TranslationUnit.prototype.addFunction = function (func) {
        this.ids.put(func.identifier);
        this.add(func);
    };
    TranslationUnit.prototype.toString = function () {
        var list = [];
        for (var _i = 0, _a = this.externalDeclarations; _i < _a.length; _i++) {
            var decl = _a[_i];
            list.push(decl.toString());
        }
        return list.join('\n\n');
    };
    return TranslationUnit;
}());
exports.TranslationUnit = TranslationUnit;

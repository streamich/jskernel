import * as dom from './dom';


// export const t = dom.createTypes();

export type TUiExpression = number|dom.Variable|dom.Expression|CUiExpressionContext;
export type TUiLabel = string|dom.Label|dom.LabelStatement;


function toExpression(e: TUiExpression): dom.Expression {
    if(typeof e === 'number') {
        return new dom.PrimaryExpressionConstant(e);
    } else if(e instanceof dom.Variable) {
        return new dom.PrimaryExpressionVariable(e);
    } else if(e instanceof dom.Expression) {
        return e;
    } else if(e instanceof CUiExpressionContext) {
        return e.toExpression();
    } else if(!e)
        return null;
    else
        throw TypeError('Expected TUiExpression.');
}


export type TFunctionCallback = (ctx: CUiFunctionContext, ...args: CUiVariableContext[]) => void;

export abstract class CUiContext {
    t;

    int(typeStr) {
        var t = this.t;
        switch(typeStr) {
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
                throw Error(`Type "${typeStr}" not recognized.`);
        }
    }
}


export class CUiUnitContext extends CUiContext {
    unit: dom.TranslationUnit = new dom.TranslationUnit;

    constructor() {
        super();
        this.t = this.unit.t;
    }

    // func(type: dom.ObjectType|dom.VoidType, name: string, params: dom.ObjectType[], paramNames: string[], body: TFunctionCallback);
    // func(type: dom.ObjectType|dom.VoidType, name: string, params: dom.ObjectType[], body: TFunctionCallback);
    func(type: dom.ObjectType|dom.VoidType, name: string, params: dom.ObjectType[], a: string[]|TFunctionCallback, b?: TFunctionCallback) {
        var body: (ctx: CUiFunctionContext) => void;
        var paramNames: string[] = [];

        if(a instanceof Array) {
            paramNames = a as string[];
            body = b;
        } else {
            body = a as TFunctionCallback;
        }

        var funcType = new dom.FunctionType(type, params);
        var ctx = CUiFunctionContext.create(this, name, funcType, paramNames);
        body.apply(null, [ctx, ...ctx.arguments]);

        this.unit.externalDeclarations.push(ctx.func);
        return (...args: TUiExpression[]) => {
            var funcExpr = new CUiExpressionContext(new dom.PrimaryExpressionIdentifier(ctx.func.identifier));
            return funcExpr['()'].apply(funcExpr, args);
        };
    }

    main(body: (ctx: CUiFunctionContext) => void) {
        var type = new dom.FunctionType(this.t.int);
        var ctx = CUiFunctionContext.create(this, 'main', type);
        body(ctx);


        this.unit.externalDeclarations.push(ctx.func);
        return ctx.func;
    }

    toString() {
        return this.unit.toString();
    }
}


// Context that is available in blocks/statments such as `if() { ... }` statement etc.
export abstract class CUiScopeContext extends CUiContext {
    // body: dom.Block = new dom.Block;
    ctxFunc: CUiFunctionContext;
    ctxParent: CUiContext;

    abstract getBlock(): dom.Block;

    protected createBlockContext(block?: dom.Block) {
        var ctx = new CUiBlockContext(block);
        ctx.t = this.t;
        ctx.ctxFunc = this.ctxFunc;
        ctx.ctxParent = this;
        return ctx;
    }

    addStatement(st: dom.Statement|dom.Declaration) {
        this.getBlock().push(st);
    }

    'var'(type: dom.ObjectType, name?: string, value?: number): CUiVariableContext {
        var variable = new dom.Variable(type, name);
        var decl = new dom.Declaration(variable);
        this.addStatement(decl);
        var ctx = new CUiVariableContext(variable);
        return ctx;
    }

    lbl(label: TUiLabel): dom.Label {
        if(typeof label === 'string') {
            return this.ctxFunc.func.labels.get(label);
        } else if(label instanceof dom.Label) {
            return label;
        } else if(label instanceof dom.LabelStatement) {
            return (label as dom.LabelStatement).label;
        } else
            throw TypeError('Expected TUiLabel.');
    }

    label(label: TUiLabel): dom.LabelStatement {
        var labelStatement = new dom.LabelStatement(this.lbl(label));
        this.addStatement(labelStatement);
        return labelStatement;
    }

    goto(label: TUiLabel): dom.GotoStatement {
        var gotoStatement = new dom.GotoStatement(this.lbl(label));
        this.addStatement(gotoStatement);
        return gotoStatement;
    }

    _(expr: TUiExpression): dom.ExpressionStatement {
        var st = new dom.ExpressionStatement(toExpression(expr));
        this.addStatement(st);
        return st;
    }

    protected wrap(expr: dom.Expression) {
        return new CUiExpressionContext(expr);
    }

    sizeof(expr: TUiExpression) {
        return this.wrap(new dom.UnarySizeofExpression(toExpression(expr)));
    }

    'if'(expr: TUiExpression,
            onTrue: (ctx: CUiBlockContext) => void,
            onFalse?: (ctx: CUiBlockContext) => void): dom.IfStatement
    {
        var ifStatement = new dom.IfStatement(toExpression(expr));

        var ctxTrue = this.createBlockContext(ifStatement.trueBlock);
        onTrue(ctxTrue);

        if(onFalse) {
            var ctxFalse = this.createBlockContext(ifStatement.falseBlock);
            onFalse(ctxFalse);
        }

        ifStatement.trueBlock = ctxTrue.getBlock();

        this.addStatement(ifStatement);
        return ifStatement;
    }

    'while'(expr: TUiExpression, onWhile: (ctx: CUiBlockContext) => void): dom.WhileStatement {
        var whileStatement = new dom.WhileStatement(toExpression(expr));
        var ctx = this.createBlockContext(whileStatement.body);
        onWhile(ctx);
        this.addStatement(whileStatement);
        return whileStatement;
    }

    'do'(onDo: (ctx: CUiBlockContext) => void, expr: TUiExpression): dom.DoStatement {
        var doStatement = new dom.DoStatement(toExpression(expr));
        var ctx = this.createBlockContext(doStatement.body);
        onDo(ctx);
        this.addStatement(doStatement);
        return doStatement;
    }

    'for'(e1: TUiExpression, e2: TUiExpression, e3: TUiExpression, onFor: (ctx: CUiBlockContext) => void): dom.ForStatement {
        var forStatement = new dom.ForStatement(toExpression(e1), toExpression(e2), toExpression(e3));
        var ctx = this.createBlockContext(forStatement.body);
        onFor(ctx);
        this.addStatement(forStatement);
        return forStatement;
    }

    'return'(expr?: TUiExpression): dom.ReturnStatement {
        var returnStatement = new dom.ReturnStatement(
            typeof expr !== 'undefined' ? toExpression(expr) : null);
        this.addStatement(returnStatement);
        return returnStatement;
    }

    'continue'() {
        var continueStatement = new dom.ContinueStatement;
        this.addStatement(continueStatement);
        return continueStatement;
    }

    'break'() {
        var breakStatement = new dom.BreakStatement;
        this.addStatement(breakStatement);
        return breakStatement;
    }
}

for(let uop of dom.UNARY_OPERATORS) {
    CUiScopeContext.prototype[uop] = function(expr: TUiExpression) {
        return this.wrap(new dom.UnaryExpression(uop, toExpression(expr)));
    };
}


export class CUiBlockContext extends CUiScopeContext {
    block: dom.Block;

    constructor(block: dom.Block = new dom.Block) {
        super();
        this.block = block;
    }

    getBlock() {
        return this.block;
    }
}


// Context that is available in function.
export class CUiFunctionContext extends CUiScopeContext {

    static create(ctxUnit: CUiUnitContext, identifier: string|dom.Identifier, type: dom.FunctionType, paramNames?: string[]) {
        var ctx = new CUiFunctionContext(identifier, type, paramNames);
        ctx.t = ctxUnit.t;
        ctx.ctxParent = ctxUnit;
        ctx.ctxFunc = ctx;
        return ctx;
    }

    func: dom.FunctionDefinition;

    arguments: CUiVariableContext[] = null;

    constructor(identifier: string|dom.Identifier, type: dom.FunctionType, paramNames: string[] = null) {
        super();
        this.func = new dom.FunctionDefinition(identifier, type, null, paramNames);

        this.args();
    }

    args() {
        if(!this.arguments) {
            this.arguments = [];
            for(var arg of this.func.arguments) this.arguments.push(new CUiVariableContext(arg));
        }
        return this.arguments;
    }

    getBlock(): dom.Block {
        return this.func.body;
    }

    decl() {

    }

    '='(lvalue: dom.Expression, value: number|dom.Expression): dom.AssignmentExpression {
        var assignmentExpression = super['='](lvalue, value);
        this.func.body.push(assignmentExpression);
        return assignmentExpression;
    }

    call(func: dom.FunctionDefinition, args: dom.Expression[]) {
        var functionCallExpression = new dom.PostfixFunctionCallExpression(func, args);
        var expressionStatement = new dom.ExpressionStatement(functionCallExpression);
        this.addStatement(expressionStatement);
        return functionCallExpression;
    }
}


export class CUiExpressionContext {
    // scope: CUiScopeContext;
    expression: dom.Expression;

    // constructor(scope: CUiScopeContext, expression: dom.Expression = null) {
    constructor(expression: dom.Expression = null) {
        // this.scope = scope;
        this.expression = expression;
    }

    toExpression() {
        return this.expression;
    }

    protected wrap(expr: dom.Expression): CUiExpressionContext {
        return new CUiExpressionContext(expr);
    }

    '++'(): CUiExpressionContext {
        return this.wrap(new dom.PostfixIncrementExpression(this.toExpression()));
    }

    '--'(): CUiExpressionContext {
        return this.wrap(new dom.PostfixDecrementExpression(this.toExpression()));
    }

    '[]'(...subscripts: TUiExpression[]): CUiExpressionContext {
        if(subscripts.length === 1) {
            return this.wrap(new dom.PostfixArraySubscriptExpression(this.toExpression(),
                toExpression(subscripts[0])));
        } else {
            var tmp: CUiExpressionContext = this;
            for(var expr of subscripts) tmp = tmp['[]'](expr);
            return tmp;
        }
    }

    '()'(...args: TUiExpression[]): CUiExpressionContext {
        for(var i = 0; i < args.length; i++) {
            args[i] = toExpression(args[i]);
        }
        var funcCallExpression = new dom.PostfixFunctionCallExpression(this.toExpression(), args);
        return this.wrap(funcCallExpression);
    }

    cast(type: dom.Type) {
        return this.wrap(new dom.CastExpression(type, this.toExpression()));
    }
}

for(let bop of dom.BINARY_OPERATORS) {
    CUiExpressionContext.prototype[bop] = function(expr: TUiExpression) {
        return this.wrap(new dom.BinaryExpression(bop, this.toExpression(), toExpression(expr)));
    };
}

for(let sop of dom.ASSIGNMENT_OPERATORS) {
    CUiExpressionContext.prototype[sop] = function(expr: TUiExpression) {
        return this.wrap(new dom.AssignmentExpression(sop, this.toExpression(), toExpression(expr)));
    };
}



export class CUiVariableContext extends CUiExpressionContext {
    variable: dom.Variable;

    // constructor(scope: CUiScopeContext, variable: dom.Variable) {
    constructor(variable: dom.Variable) {
        // super(scope);
        super();
        this.variable = variable;
        this.expression = new dom.PrimaryExpressionVariable(variable);
    }
}


export function create() {
    var unitContext = new CUiUnitContext;
    return unitContext;
}

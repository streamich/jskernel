import {TypeVoid} from "../ir/type";


export enum TYPE_QUALIFIER {
    none,
    'const',
    restrict,
    volatile,
}

export enum STORAGE_CLASS {
    none,
    'extern',
    'static',
    auto,
    register,
}

export const enum FUNCTION_SPECIFIER {
    NONE,
    INLINE,
}


export const enum STRUCT_OR_UNION {
    STRUCT,
    UNION,
}

export const enum SCOPE {
    BLOCK,
    FILE,
    ROOT = SCOPE.FILE,
    FUNCTION,
    FUNCTION_PROTOTYPE,
}

/*export const enum OPERATOR {
    ASSIGN_EQUAL, // a = b
    ASSIGN_STAR, // a *= b
    ASSIGN_SLASH, // a /= b
    ASSIGN_PERCENT, // a %= b
    ASSIGN_PLUS, // a += b
    ASSIGN_MINUS, // a -= b
    ASSIGN_SHIFT_LEFT, // a <<= b
    ASSIGN_SHIFT_RIGHT, // a >>= b
    ASSIGN_AND, // a &= b
    ASSIGN_XOR, // a ^= b
    ASSIGN_OR, // a |= b

    INCREMENT_INFIX, // ++a
    INCREMENT_POSTFIX, // a++
    DECREMENT_INFIX, // --a
    DECREMENT_POSTFIX, // a--

    ARITHMETIC_NEGATE, // -a
    ARITHMETIC_PLUS, // a + b
    ARITHMETIC_MINUS, // a - b
    ARITHMETIC_STAR, // a * b
    ARITHMETIC_SLASH, // a / b
    ARITHMETIC_PERCENT, // a % b
    ARITHMETIC_TILDE, // ~a
    ARITHMETIC_AND, // a & b
    ARITHMETIC_OR, // a | b
    ARITHMETIC_XOR, // a ^ b
    ARITHMETIC_SHIFT_LEFT, // a << b
    ARITHMETIC_SHIFT_RIGHT, // a >> b

    LOGICAL_NOT, // !a
    LOGICAL_AND, // a && b
    LOGICAL_OR, // a || b

    COMPARISON_EQUAL, // a == b
    COMPARISON_NOT, // a != b
    COMPARISON_LESS, // a < b
    COMPARISON_GREATER, // a > b
    COMPARISON_LESS_OR_EQUAL, // a <= b
    COMPARISON_GREATER_OR_EQUAL, // a >= b

    ACCESS_ARRAY, // a[b]
    ACCESS_POINTER, // *a
    ACCESS_ADDRESS, // &a
    ACCESS_MEMBER_POINTER, // a->b
    ACCESS_MEMBER, // a.b

    FUNCTION_CALL, // f(...)
    COMMA, // ,
    TYPE_CAST, // (type) a
    CONDITIONAL, // a ? b : c
    SIZEOF, // sizeof a
    ALIGNOF, // _Alignof(type)
}*/





/*export type TStandardTypeName = 'void'
    | 'char'
    | 'signed char'
    | 'unsigned char'
    | 'short' | 'short int' | 'signed short' | 'signed short int'
    | 'unsigned short' | 'unsigned short int'
    | 'int' | 'signed' | 'signed int'
    | 'unsigned' | 'unsigned int'
    | 'long' | 'long int' | 'signed long' | 'signed long int'
    | 'unsigned long' | 'unsigned long int'
    | 'long long' | 'long long int' | 'signed long long' | 'signed long long int'
    | 'unsigned long long' | 'unsigned long long int'
    | 'float'
    | 'double'
    | 'long double'
    | '_Bool';*/


export type TBaseType = 'void' | 'char' | 'short' | 'int' | 'long' | 'long long' |
    'float' | 'double' | 'long double' | '_Bool';


export abstract class Type {
    typeQualifier: TYPE_QUALIFIER = TYPE_QUALIFIER.none;
    storageClass: STORAGE_CLASS = STORAGE_CLASS.none;
    size: number = 0;

    toStringSpecifiers() {
        var list = [];
        if(this.typeQualifier !== TYPE_QUALIFIER.none)
            list.push(TYPE_QUALIFIER[this.typeQualifier]);
        if(this.storageClass !== STORAGE_CLASS.none)
            list.push(STORAGE_CLASS[this.storageClass]);

        return list.join(' ');
    }

    toStringDeclaration(name: string) {
        return this.toString() + ' ' + name;
    }

    toString() {
        var specifiers = this.toStringSpecifiers();
        return (specifiers ? specifiers + ' ' : '') + '[type]';
    }
}


export class VoidType extends Type {
    toString() {
        return 'void';
    }
}


// All types that are not function types.
export class ObjectType extends Type {
    baseType: TBaseType;
    alignment: number = 0; // alignmentRequirement

    getSize() {
        return this.size;
    }
}


export class PrimitiveType extends ObjectType {
    isUnsigned: boolean;

    constructor(baseType: TBaseType, isUnsigned: boolean = false) {
        super();
        this.baseType = baseType;
        this.isUnsigned = isUnsigned;
    }

    toString() {
        var specifiers = this.toStringSpecifiers();
        return (specifiers ? specifiers + ' ' : '') +
            (this.isUnsigned ? 'unsigned ' : '') +
            this.baseType;
    }
}


export class BoolType extends PrimitiveType {
    constructor() {
        super('_Bool');
    }
}


export const t_void = new VoidType;


export interface ITypes {
    'void': TypeVoid,
    bool: BoolType,

    char: PrimitiveType,
    uchar: PrimitiveType,
    short: PrimitiveType,
    ushort: PrimitiveType,
    int: PrimitiveType,
    uint: PrimitiveType,
    long: PrimitiveType,
    ulong: PrimitiveType,
    long2: PrimitiveType,
    ulong2: PrimitiveType,
    float: PrimitiveType,
    double: PrimitiveType,
    double2: PrimitiveType,

    ptr(baseType: Type): PointerType,
    arr(baseType: ObjectType, length: number): ArrayType,
    func(returnType?: ObjectType|VoidType, params?: ObjectType[], isVariadic?: boolean): FunctionType;
}


export function createTypes(): ITypes {
    var t: ITypes = {
        'void':     t_void,
        bool:       new BoolType,

        char:       new PrimitiveType('char'),
        uchar:      new PrimitiveType('char', true),
        short:      new PrimitiveType('short'),
        ushort:     new PrimitiveType('short', true),
        int:        new PrimitiveType('int'),
        uint:       new PrimitiveType('int', true),
        long:       new PrimitiveType('long'),
        ulong:      new PrimitiveType('long', true),
        long2:      new PrimitiveType('long long'),
        ulong2:     new PrimitiveType('long long', true),
        float:      new PrimitiveType('float'),
        double:     new PrimitiveType('double'),
        double2:    new PrimitiveType('long double'),

        ptr:        baseType => new PointerType(baseType),
        arr:        (baseType, length) => new ArrayType(baseType, length),

        func: (returnType = t_void, params = [], isVariadic = false) => {
            return new FunctionType(returnType, params, isVariadic);
        },
    };

    return t;
}


export class PointerType extends ObjectType {
    base: Type;

    constructor(base: Type) {
        super();
        this.base = base;
    }

    toStringDeclaration(name: string) {
        return this.base.toStringDeclaration('*' + name);
    }

    toString() {
        return this.base.toString() + '*';
    }
}


export class ArrayType extends PointerType {
    base: ObjectType;
    lengths: number[];

    constructor(baseType: ObjectType, lengths: number[]|number) {
        super(baseType);
        this.lengths = typeof lengths === 'number' ? [lengths] : (lengths as number[]);
    }

    getSize() {
        var size = this.base.getSize();
        for(var length of this.lengths)
            size *= length;
        return size;
    }

    toStringDeclaration(name: string) {
        return this.base.toStringDeclaration(name + this.toStringDimension());
    }

    toStringDimension() {
        return '[' + this.lengths.join('][') + ']';
    }

    toString() {
        return this.base.toString() + this.toStringDimension();
    }
}


export type TStructMember = [ObjectType, string];
export class StructType extends ObjectType {
    identifier: Identifier;
    members: TStructMember[];

    constructor(members: TStructMember[] = [], identifier: Identifier = new Identifier) {
        super();
        this.identifier = identifier;
        this.members = members;
    }

    getSize() {
        var total = 0;
        for(var member of this.members) total += member[0].getSize();
        return total;
    }

    toString(tabs = '') {
        var list = [];
        for(var [type, name] of this.members) {
            list.push(type.toString() + ' ' + name + ';');
        }
        return tabs + 'struct ' + this.identifier.toString() + ' {\n' +
            tabs + '    ' + list.join('\n' + tabs + '    ') +
            tabs + '};';
    }
}


export class FunctionType extends Type {
    returnType: ObjectType|VoidType;
    paramTypes: ObjectType[];
    isVariadic: boolean;

    constructor(type: ObjectType|VoidType = t_void, params: ObjectType[] = [], isVariadic: boolean = false) {
        super();
        this.returnType = type;
        this.paramTypes = params;
        this.isVariadic = isVariadic;
    }
}


export abstract class MemoryLocation {

}


// export class MemoryLocationStack extends MemoryLocation {
    // Offset from base pointer, beginning of stack.
    // offset: number;
// }


// Absolute address somewhere.
// export class MemoryLocationAbsolute extends MemoryLocation {
//
// }

/*
export class Object {

    size: number = 0; // In bytes

    effectiveType: ObjectType = null;

    location: MemoryLocation = null;

    value: number = null;

    // Optional
    identifier: Identifier = null;

    constructor(type: ObjectType = null, value: number = null) {
        this.effectiveType = type;
        this.value = value;
    }

    setMemoryLocation(location: MemoryLocation) {
        this.location = location;
    }

    sizeof() {
        return this.size;
    }

    alignof() {

    }

    create() {

    }

    destroy() {

    }

    access() {

    }

    toString() {
        return String(this.value);
    }
}*/


// export class PointerObject {
//     reference: Object | Function = null;
// }


export class Identifier {
    static cnt = 0;

    name: string;

    // Reference to object this `Identifier` identifies.
    ref: any = null;

    constructor(name = null, ref: any = null) {
        this.name = name;
        if(ref) this.bind(ref);
    }

    getName() {
        if(!this.name) {
            this.name = '__identifier' + (Identifier.cnt++);
        }
        return this.name;
    }

    bind(ref: any) {
        this.ref = ref;
    }

    // evaluate(): Value {
    //     return this.value;
    // }

    toString() {
        return this.getName();
    }
}

export class IdentifierScope {
    map: {[s: string]: Identifier} = {};
    parent: IdentifierScope;

    constructor(parent: IdentifierScope = null) {
        this.parent = parent;
    }

    get(name: string) {
        return this.map[name];
    }

    put(id: Identifier) {
        this.map[id.getName()] = id;
    }
}


export class Variable {
    type: ObjectType;
    identifier: Identifier;
    // object: Object;

    constructor(type: ObjectType, identifier: string|Identifier = new Identifier) {
        this.type = type;
        if(typeof identifier === 'string') {
            this.identifier = new Identifier(identifier as string);
        } else {
            this.identifier = identifier as Identifier;
        }
        this.identifier.bind(this);
    }

    getName() {
        return this.identifier.getName();
    }

    toString() {
        return this.type.toStringDeclaration(this.identifier.toString());
    }
}


export class Label {
    static cnt = 0;

    name: string;

    statement: LabelStatement = null;

    constructor(name?: string) {
        this.name = name;
    }

    getName() {
        if(!this.name) {
            this.name = '__label' + (Label.cnt++);
        }
        return this.name;
    }

    bind(st: LabelStatement) {
        if(this.statement)
            throw Error(`Label already bound "${this.getName()}".`);
        this.statement = st;
    }

    toString() {
        return this.getName();
    }
}

export class LabelMap {
    map: {[s: string]: Label} = {};

    get(name?: string) {
        if(!this.map[name]) {
            this.map[name] = new Label(name);
        }
        return this.map[name];
    }
}


function toStringExpression(expr: any) {
    if(expr instanceof PrimaryExpression) {
        return expr.toString();
    } else if(expr instanceof PostfixArraySubscriptExpression) {
        return expr.toString();
    } else {
        return '(' + expr.toString() + ')';
    }
}


export abstract class Expression {
    type: Type = null;
    parent: Expression = null;

    // Used for code generators to store temporary "value" associated with this
    // expression while walking the expressions.
    rvalue: any = null;

    onWalk(iterator) {
        iterator.onExpression(this);
    }
}


// aka PrimaryExpression
export class PrimaryExpression <T> extends Expression {

    static create(value: Variable): PrimaryExpression <any> {
        if(value instanceof Variable) {
            return new PrimaryExpressionVariable(value);
        } else
            throw TypeError('Cannot create PrimaryExpression from supplied argument.');
    }

    operand: T;

    constructor(operand: T) {
        super();
        this.operand = operand;
    }

    onWalk(iterator) {
        iterator.onPrimaryExpression(this);
    }
}

export class PrimaryExpressionVariable extends PrimaryExpression <Variable> {
    toString() {
        return this.operand.identifier.toString();
    }

    onWalk(iterator) {
        iterator.onPrimaryExpressionVariable(this);
    }
}

export class PrimaryExpressionIdentifier extends PrimaryExpression <Identifier> {
    toString() {
        return this.operand.toString();
    }
}

export class PrimaryExpressionConstant extends PrimaryExpression <number> {
    toString() {
        return String(this.operand);
    }
}


// postfix-expression:
//     primary-expression
//     postfix-expression [ expression ]
//     postfix-expression ( argument-expression-list opt )
//     postfix-expression . identifier
//     postfix-expression -> identifier
//     postfix-expression ++
//     postfix-expression --
//     ( type-name ) { initializer-list }
//     ( type-name ) { initializer-list , }
// argument-expression-list:
//     assignment-expression
//     argument-expression-list , assignment-expressi
export class PostfixExpression extends Expression {
    operand: Expression;

    constructor(operand: Expression) {
        super();

        operand.parent = this;
        this.operand = operand;
    }
}

export class PostfixIncrementExpression extends PostfixExpression {
    toString() {
        return toStringExpression(this.operand) + '++';
    }
}

export class PostfixDecrementExpression extends PostfixExpression {
    toString() {
        return toStringExpression(this.operand) + '--';
    }
}

export class PostfixArraySubscriptExpression extends PostfixExpression {
    subscriptExpression: Expression;

    constructor(operand: Expression, subscriptExpression: Expression) {
        super(operand);

        subscriptExpression.parent = this;
        this.subscriptExpression = subscriptExpression;
    }

    toString() {
        return this.operand.toString() + '[' + this.subscriptExpression.toString() + ']';
    }
}

export class PostfixFunctionCallExpression extends PostfixExpression {
    args: Expression[];

    constructor(operand: Expression, args: Expression[] = []) {
        super(operand);

        for(var arg of args) arg.parent = this;
        this.args = args;
    }

    toString() {
        var list = [];
        for(var arg of this.args) list.push(arg.toString());
        return this.operand.toString() + '(' + list.join(', ') + ')';
    }
}


// unary-expression:
//     postfix-expression
//     ++ unary-expression
//     -- unary-expression
//     unary-operator cast-expression
//     sizeof unary-expression
//     sizeof ( type-name )
// unary-operator: one of
//     & * + - ~ !


export type UNARY_OPERATOR = '++' | '--' | '&' | '*' | '+' | '-' | '~' | '!' | 'sizeof';
export const UNARY_OPERATORS: UNARY_OPERATOR[] = ['++', '--', '&', '*', '+', '-', '~', '!'];

export class UnaryExpression extends Expression {
    operator: UNARY_OPERATOR;
    operand: Expression|Type;

    constructor(operator: UNARY_OPERATOR, operand: Expression|Type) {
        super();

        this.operator = operator;
        if(operand instanceof Expression)
            operand.parent = this;
        this.operand = operand;
    }

    toString() {
        return this.operator + toStringExpression(this.operand);
    }
}

export class UnaryIncrementExpression extends UnaryExpression {
    constructor(operand: Expression) {
        super('++', operand);
    }
}

export class UnaryDecrementExpression extends UnaryExpression {
    constructor(operand: Expression) {
        super('--', operand);
    }
}

export class UnarySizeofExpression extends UnaryExpression {
    constructor(operand: Expression) {
        super('sizeof', operand);
    }

    toString() {
        return this.operator + '(' + this.operand.toString() + ')';
    }
}

export class CastExpression extends Expression {
    type: Type;
    operand: Expression;

    constructor(type: Type, operand: Expression) {
        super();

        this.type = type;
        operand.parent = this;
        this.operand = operand;
    }

    toString() {
        return '(' + this.type.toString() + ') ' + toStringExpression(this.operand);
    }
}


export type BINARY_OPERATOR = '*' | '/' | '%' | '+' | '-' | '<<' | '>>' |
    '<' | '>' | '<=' | '>=' | '==' | '!=' | '&' | '^' | '|' | '&&' | '||';

export const BINARY_OPERATORS: BINARY_OPERATOR[] = ['*', '/', '%', '+', '-', '<<', '>>',
    '<', '>', '<=', '>=', '==', '!=', '&', '^', '|', '&&', '||'];

export type ASSIGNMENT_OPERATOR = '=' | '*=' | '/=' | '%=' | '+=' | '-=' |
    '<<=' | '>>=' | '&=' | '^=' | '|=';

export const ASSIGNMENT_OPERATORS: ASSIGNMENT_OPERATOR[] = ['=', '*=', '/=', '%=', '+=',
    '-=', '<<=', '>>=', '&=', '^=', '|='];

export class BinaryExpression extends Expression {
    operator: BINARY_OPERATOR | ASSIGNMENT_OPERATOR;
    operand1: Expression;
    operand2: Expression;

    constructor(operator: BINARY_OPERATOR | ASSIGNMENT_OPERATOR, op1: Expression, op2: Expression) {
        super();

        this.operator = operator;
        op1.parent = this;
        this.operand1 = op1;
        op2.parent = this;
        this.operand2 = op2;
    }

    toString() {
        return toStringExpression(this.operand1) + ' ' + this.operator +
            ' ' + toStringExpression(this.operand2);
    }
}

export class AssignmentExpression extends BinaryExpression {
    constructor(operator: ASSIGNMENT_OPERATOR, op1: Expression, op2: Expression) {
        super(operator, op1, op2);
    }
}


export class TernaryExpression extends Expression {
    operand1: Expression;
    operand2: Expression;
    operand3: Expression;

    constructor(op1: Expression, op2: Expression, op3: Expression) {
        super();

        op1.parent = this;
        this.operand1 = op1;
        op2.parent = this;
        this.operand2 = op2;
        op3.parent = this;
        this.operand3 = op3;
    }
}

export class ConditionalExpression extends TernaryExpression {
    toString() {
        return toStringExpression(this.operand1) + ' ? ' + toStringExpression(this.operand2) +
                ' : ' + toStringExpression(this.operand3);
    }
}


export abstract class BlockItem {
    parent: Block = null;

    abstract toString(tabs?: string): string;
}


export class Declaration extends BlockItem {
    variable: Variable;

    constructor(variable: Variable) {
        super();
        this.variable = variable;
    }

    toString(tabs = '') {
        return tabs + this.variable.toString() + ';';
    }
}


export abstract class Statement extends BlockItem {
    toString(tabs = '') {
        return tabs + '/* abstract statement */;';
    }
}

export class ExpressionStatement extends Statement {
    expression: Expression;

    constructor(expression = null) {
        super();
        this.expression = expression;
    }

    toString(tabs = '') {
        return tabs + (this.expression ? this.expression.toString() : '') + ';';
    }
}

export class IfStatement extends Statement {
    expression: Expression;
    trueBlock: Block = new Block;
    falseBlock: Block = new Block;

    constructor(expression: Expression = null) {
        super();
        this.expression = expression;
    }

    toString(tabs = '') {
        return tabs + `if (${this.expression.toString()}) ${this.trueBlock.toString(tabs)}` +
            (this.falseBlock && this.falseBlock.items.length ? ' else ' + this.falseBlock.toString(tabs) : '');
    }
}

export class IterationStatement extends Statement {
    body: Block = new Block(this);
    controlExpr: Expression;

    // Object that represents a "label" where `break;` statement jumps.
    labelBreak: any = null;

    // Object that represents a "label" where `continue;` statement jumps.
    labelContinue: any = null;

    constructor(expression: Expression = null) {
        super();
        this.controlExpr = expression;
    }
}

export class WhileStatement extends IterationStatement {
    toString(tabs = '') {
        return tabs + `while (${this.controlExpr.toString()}) ${this.body.toString(tabs)}`;
    }
}

export class DoStatement extends IterationStatement {
    toString(tabs = '') {
        return tabs + `do ${this.body.toString(tabs)} while (${this.controlExpr.toString()});`;
    }
}

export class ForStatement extends IterationStatement {
    expr1: Expression;
    expr3: Expression;

    constructor(expr1: Expression = null, expr2: Expression = null, expr3: Expression = null) {
        super(expr2);
        this.expr1 = expr1;
        this.expr3 = expr3;
    }

    toString(tabs = '') {
        return tabs + `for (${this.expr1.toString()}; ${this.controlExpr.toString()}; ${this.expr3.toString()})` +
            this.body.toString(tabs);
    }
}

export class ReturnStatement extends Statement {
    expression: Expression;

    constructor(expression: Expression = null) {
        super();
        if(expression)
            this.expression = expression;
    }

    toString(tabs = '') {
        return tabs + 'return' + (this.expression ? ' ' + this.expression.toString() : '') + ';';
    }
}

export class ContinueStatement extends Statement {
    toString(tabs = '') {
        return tabs + 'continue;';
    }
}

export class BreakStatement extends Statement {
    toString(tabs = '') {
        return tabs + 'break;';
    }
}

export class LabelStatement extends Statement {
    label: Label;

    constructor(label: Label) {
        super();
        this.label = label;
        label.bind(this);
    }

    toString(tabs = '') {
        return this.label.toString() + ':';
    }
}

export class GotoStatement extends Statement {
    label: Label;

    constructor(label: Label) {
        super();
        this.label = label;
    }

    toString(tabs = '') {
        return tabs + 'goto ' + this.label.toString() + ';';
    }
}


export class Block {
    // `Statement` that contains the block (for-loop, while-loop, do-loop).
    parent: Statement = null;

    items: BlockItem[] = [];

    ids: IdentifierScope = new IdentifierScope;

    constructor(parent: Statement = null) {
        this.parent = parent;
    }

    push(item: BlockItem) {
        item.parent = this;
        this.items.push(item);
    }

    toString(spaces = '') {
        var list = [];
        var innerSpaces = spaces + '    ';
        for(var item of this.items) {
            list.push(item.toString(innerSpaces));
        }
        return '{\n' + list.join('\n') + '\n' + spaces + '}';
    }
}



// export class ParameterDeclaration {
//     declarationSpecifiers: DeclarationSpecifiers;
//     declarator: Declarator = null;
//
//     constructor(specifiers: DeclarationSpecifiers) {
//         this.declarationSpecifiers = specifiers;
//     }
// }


// export class ParameterList {
//     parameterDeclarations: ParameterDeclaration[];
//
//     constructor(params: ParameterDeclaration[]) {
//         this.parameterDeclarations = params;
//     }
// }


// export class ParameterTypeList extends ParameterList {
//     isVariadic = false;
// }


// export abstract class Declarator {
//     directDeclarator: Identifier | Declarator = null;
// }


// export class FunctionDeclarator extends Declarator {
//     parameterTypeList: ParameterTypeList;
//
//     constructor(params: ParameterTypeList) {
//         super();
//         this.parameterTypeList = params;
//     }
// }




// ### 6.9.1 Function definitions
//
// Syntax
//
//     function-definition:
//         declaration-specifiers declarator declaration-list.opt compound-statement
export class FunctionDefinition {

    type: FunctionType;
    body: Block = null;
    identifier: Identifier; // Identifier used when declaring this function.
    labels: LabelMap = new LabelMap;
    arguments: Variable[] = [];

    constructor(identifier: string|Identifier = null, type: FunctionType = new FunctionType, body: Block = null, paramNames: string[] = null) {
        if(typeof identifier === 'string') {
            this.identifier = new Identifier(identifier as string);
        } else
            this.identifier = identifier;

        this.identifier.bind(this);

        this.type = type;
        this.body = body ? body : new Block;

        for(var i = 0; i < type.paramTypes.length; i++) {
            var paramType = type.paramTypes[i];
            var paramName = (paramNames && paramNames[i] ? paramNames[i] : null);

            var arg = new Variable(paramType, new Identifier(paramName));
            this.body.ids.put(arg.identifier);
            this.arguments.push(arg);
        }
    }

    getIdentifier(): Identifier {
        if(!this.identifier) {
            this.identifier = new Identifier;
        }
        return this.identifier;
    }

    getName() {
        return this.identifier.getName();
    }

    toString(spaces = '') {
        var args = [];
        for(var arg of this.arguments) {
            args.push(arg.toString());
        }
        return spaces + this.type.returnType.toString() + ' ' + this.identifier.getName() + '(' + args.join(', ') + ') ' + this.body.toString(spaces);
    }
}


// ## 6.9 External definitions
//
// Syntax
//
//     translation-unit:
//         external-declaration
//         translation-unit external-declaration
//     external-declaration:
//         function-definition
//         declaration
export type TExternalDeclaration = FunctionDefinition | Declaration;

export class TranslationUnit {
    externalDeclarations: TExternalDeclaration[] = [];
    ids: IdentifierScope = new IdentifierScope;
    t = createTypes();

    add(decl: TExternalDeclaration) {
        this.externalDeclarations.push(decl);
    }

    addFunction(func: FunctionDefinition) {
        this.ids.put(func.identifier);
        this.add(func);
    }

    toString() {
        var list = [];
        for(var decl of this.externalDeclarations) {
            list.push(decl.toString());
        }
        return list.join('\n\n');
    }
}

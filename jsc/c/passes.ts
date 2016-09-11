import {TranslationUnitPassManager, FunctionDefinitionPassManager, TranslationUnitPass,
    FunctionDefinitionPass} from './walk';
import {create as createIRContext, IrUiUnitContext, IrUiFunctionContext} from '../ir/ui';
import * as dom from './dom';
import * as irop from '../ir/operand';
import * as irtype from '../ir/type';
import {CONDITION as COND} from '../ir/ins';


// export class ValidateSemanticsPass extends Pass {
//
// }


export class AssignTypesPass extends TranslationUnitPass {
    unit: dom.TranslationUnit = null;

    onUnit(unit) {
        this.unit = unit;
        super.onUnit(unit);
    }

    onFunctionDefinition(def: dom.FunctionDefinition) {
        var fp = new AssignTypesFunctionDefinitionPass(this.unit);
        (new FunctionDefinitionPassManager <AssignTypesFunctionDefinitionPass>(fp))
            .onFunctionDefinition(def);
    }
}

export class AssignTypesFunctionDefinitionPass extends FunctionDefinitionPass {
    unit: dom.TranslationUnit;

    constructor(unit: dom.TranslationUnit) {
        super();
        this.unit = unit;
    }

    // Statements
    onExpressionStatement(st: dom.ExpressionStatement) {
        this.manager.onExpression(st.expression);
    }

    onIfStatement(st: dom.IfStatement) {
        this.manager.onExpression(st.expression);
    }


    // Expressions
    onPrimaryExpressionVariable(expr: dom.PrimaryExpressionVariable) {
        expr.type = expr.operand.type;
    }

    onPrimaryExpressionConstant(expr: dom.PrimaryExpressionConstant) {
        // TODO: determine type of constatns according to C spec.
        expr.type = this.unit.t.int;
    }

    onBinaryExpression(expr: dom.BinaryExpression) {
        var {operand1, operand2} = expr;

        if(!operand1.type)
            throw Error(`Expression does not have type "${operand1.toString()}".`);

        if(!operand2.type)
            throw Error(`Expression does not have type "${operand2.toString()}".`);

        if(operand1.type !== operand2.type)
            throw Error(`Binary expression types don't match "${operand1.type.toString()}" vs "${operand2.type.toString()}" in "${expr.toString()}".`);

        expr.type = expr.operand1.type;
    }
}



/*
export abstract class FunctionDefinitionWalker {
    unit: TranslationUnitWalker;
    func: dom.FunctionDefinition;

    constructor(unit: TranslationUnitWalker, func: dom.FunctionDefinition) {
        this.unit = unit;
        this.func = func;
    }

    onBlock(body: dom.Block) {
        for(var item of body.items) {
            if(item instanceof dom.Declaration) this.onDeclaration(item);
            else if(item instanceof dom.Statement) this.onStatement(item);
            else console.log('Unknown body item', item);
        }
    }

    onDeclaration(decl: dom.Declaration) {

    }

    onStatement(st: dom.Statement) {
        if(st instanceof dom.ExpressionStatement) this.onExpressionStatement(st);
        else if(st instanceof dom.IfStatement) this.onIfStatement(st);
        else if(st instanceof dom.ReturnStatement) this.onReturnStatement(st);
        else console.log('Unknown statement', st);
    }

    onExpressionStatement(st: dom.ExpressionStatement) {
        this.onExpression(st.expression);
    }

    onExpression(expr: dom.Expression): any {
        if(expr instanceof dom.PrimaryExpressionConstant) return this.onPrimaryExpressionConstant(expr);
        else if(expr instanceof dom.PrimaryExpressionVariable) return this.onPrimaryExpressionVariable(expr);
        else if(expr instanceof dom.AssignmentExpression) return this.onAssignmentExpression(expr);
        else if(expr instanceof dom.BinaryExpression) return this.onBinaryExpression(expr);
        else console.log('Unknown Expression', expr);
    }

    onAssignmentExpression(expr: dom.AssignmentExpression): any {
        switch(expr.operator) {
            case '=': return this.onSimpleAssignmentExpression(expr);
            default:
                console.log('Unknown AssignmentExpression', expr);
        }
    }
    // export type BINARY_OPERATOR = '*' | '/' | '%' | '+' | '-' | '<<' | '>>' |
    // '<' | '>' | '<=' | '>=' | '==' | '!=' | '&' | '^' | '|' | '&&' | '||';
    onBinaryExpression(expr: dom.BinaryExpression): any {
        switch(expr.operator) {
            case '*': return this.onMultiplicationBinaryExpression(expr);
            case '/': return this.onDivisionBinaryExpression(expr);
            case '%': return this.onRemainderBinaryExpression(expr);
            case '-': return this.onSubtractionBinaryExpression(expr);
            case '+': return this.onAdditionBinaryExpression(expr);
            case '<<': return this.onShiftLeftBinaryExpression(expr);
            case '>>': return this.onShiftRightBinaryExpression(expr);
            case '>': return this.onGreaterThanBinaryExpression(expr);
            case '<': return this.onLessThanBinaryExpression(expr);
            case '<=': return this.onLessThanOrEqualBinaryExpression(expr);
            case '>=': return this.onGreaterThanOrEqualBinaryExpression(expr);
            case '==': return this.onEqualBinaryExpression(expr);
            case '!=': return this.onNotEqualBinaryExpression(expr);
            case '&': return this.onArithmeticAndBinaryExpression(expr);
            case '^': return this.onArithmeticXorBinaryExpression(expr);
            case '|': return this.onArithmeticOrBinaryExpression(expr);
            case '&&': return this.onLogicalAndBinaryExpression(expr);
            case '||': return this.onLogicalOrBinaryExpression(expr);
            default:
                console.log('Unknown BinaryExpression', expr);
        }
    }

    abstract onIfStatement(st: dom.IfStatement): any;
    abstract onReturnStatement(st: dom.ReturnStatement): any;

    abstract onPrimaryExpressionConstant(expr: dom.PrimaryExpressionConstant): any;
    abstract onPrimaryExpressionVariable(expr: dom.PrimaryExpressionVariable): any;
    abstract onSimpleAssignmentExpression(expr: dom.AssignmentExpression): any;

    abstract onMultiplicationBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onDivisionBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onRemainderBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onAdditionBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onSubtractionBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onShiftLeftBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onShiftRightBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onLessThanBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onGreaterThanBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onLessThanOrEqualBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onGreaterThanOrEqualBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onEqualBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onNotEqualBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onArithmeticAndBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onArithmeticXorBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onArithmeticOrBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onLogicalAndBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onLogicalOrBinaryExpression(expr: dom.BinaryExpression): any;


    walk() {
        this.onBlock(this.func.body);
    }
}


export abstract class TranslationUnitWalker {
    FunctionDefinitionWalker: typeof FunctionDefinitionWalker = FunctionDefinitionWalker;

    unit: dom.TranslationUnit;

    constructor(unit: dom.TranslationUnit) {
        this.unit = unit;
    }

    abstract onFunctionDefinition(func: dom.FunctionDefinition): any;

    walk() {
        for(var a of this.unit.externalDeclarations) {
            if(a instanceof dom.FunctionDefinition) this.onFunctionDefinition(a);
            else console.log('Unknown object', a);
        }
    }
}


export class CToIrFunctionTranslator extends FunctionDefinitionWalker {
    _: IrUiFunctionContext;

    constructor(unitWalker, func: dom.FunctionDefinition, ctx: IrUiFunctionContext) {
        super(unitWalker, func);
        this._ = ctx;
    }

    protected toIrType(type: dom.Type): irtype.Type {
        if(type instanceof dom.BoolType) {
            return this._.t.i1;
        } else if(type instanceof dom.PrimitiveType) {
            return this._.t.i(type.size * 8);
        } else
            throw Error('Cannot convert C type to IR type.');
    }

    protected binaryExpressionToIrOperands(expr: dom.BinaryExpression): [irop.Operand, irop.Operand] {
        var op1 = this.onExpression(expr.operand1);
        var op2 = this.onExpression(expr.operand2);

        if(op1.type !== op2.type)
            throw Error(`Operand types don't match "${expr.toString()}".`);

        return [op1, op2];
    }

    protected binaryExpressionToIrOperandsAndTemporary(expr: dom.BinaryExpression): [irop.Operand, irop.Operand, irop.Operand] {
        var [op1, op2] = this.binaryExpressionToIrOperands(expr);
        var temporary = this._.var(op1.type);
        return [temporary, op1, op2];
    }

    onIfStatement(st: dom.IfStatement) {

        var lblTrue = this._.lbl();
        var lblFalse = this._.lbl();
        var lblContinue = this._.lbl();

        var cmpOperand = this.onExpression(st.expression);

        if(cmpOperand.type === this._.t.i1) {
            this._.br(cmpOperand, lblTrue, lblFalse);
        } else {
            var cmpResultOperand = this._.var(this._.t.i1);
            this._.cmp(cmpResultOperand, cmpOperand, 0, COND.NE);
            this._.br(cmpResultOperand, lblTrue, lblFalse);
        }

        this._.label(lblTrue);
        this.onBlock(st.trueBlock);
        this._.jmp(lblContinue);

        this._.label(lblFalse);
        this.onBlock(st.falseBlock);

        this._.label(lblContinue);
    }

    onReturnStatement(st: dom.ReturnStatement) {
        this._.ret(this.onExpression(st.expression));
    }

    onExpression(expr): irop.Operand {
        return super.onExpression(expr);
    }

    onPrimaryExpressionConstant(expr: dom.PrimaryExpressionConstant): irop.Operand {
        // TODO: Assign type according to C rules:
        // http://stackoverflow.com/questions/11310456/is-the-integer-constants-default-type-signed-or-unsigned
        return this._.op(expr.operand, this._.t.i32);
    }

    onPrimaryExpressionVariable(expr: dom.PrimaryExpressionVariable): irop.OperandVariable {
        var variable = expr.operand;
        var name = variable.getName();
        var op = this._.func.vars.get(name);
        if(op) return op;
        else {
            return this._.var(this.toIrType(variable.type), name);
        }
    }

    onSimpleAssignmentExpression(expr: dom.AssignmentExpression): irop.Operand {
        return this._.assign(this.onExpression(expr.operand1), this.onExpression(expr.operand2)).op1;
    }

    onMultiplicationBinaryExpression(expr: dom.BinaryExpression): irop.Operand {
        var [tmp, op1, op2] = this.binaryExpressionToIrOperandsAndTemporary(expr);
        this._.mul(tmp, op1, op2);
        return tmp;
    }

    abstract onDivisionBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onRemainderBinaryExpression(expr: dom.BinaryExpression): any;

    onAdditionBinaryExpression(expr: dom.BinaryExpression): irop.Operand {
        return this._.add.apply(this._, this.binaryExpressionToIrOperandsAndTemporary(expr)).op1;
    }

    abstract onSubtractionBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onShiftLeftBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onShiftRightBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onLessThanBinaryExpression(expr: dom.BinaryExpression): any;

    onLessThanBinaryExpression(expr: dom.BinaryExpression): irop.Operand {
        var op1 = this.onExpression(expr.operand1);
        var op2 = this.onExpression(expr.operand2);

        if(op1.type !== op2.type)
            throw Error(`Operand types don't match "${expr.toString()}".`);

        var condition: irins.CONDITION;


        var cmpResult = this._.var(this._.t.i1);
        this._.cmp(cmpResult, op1, op2, COND.SLT);
        return cmpResult;
    }

    onGreaterThanBinaryExpression(expr: dom.BinaryExpression): irop.Operand {
        var [op1, op2] = this.binaryExpressionToIrOperands(expr);
        var cmpResult = this._.var(this._.t.i1);
        this._.cmp(cmpResult, op1, op2, COND.SGT);
        return cmpResult;
    }

    abstract onLessThanOrEqualBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onGreaterThanOrEqualBinaryExpression(expr: dom.BinaryExpression): any;

    onEqualBinaryExpression(expr: dom.BinaryExpression): irop.Operand {
        var [op1, op2] = this.binaryExpressionToIrOperands(expr);
        var cmpResult = this._.var(this._.t.i1);
        this._.cmp(cmpResult, op1, op2, COND.EQ);
        return cmpResult;
    }

    onNotEqualBinaryExpression(expr: dom.BinaryExpression): irop.Operand {
        var [op1, op2] = this.binaryExpressionToIrOperands(expr);
        var cmpResult = this._.var(this._.t.i1);
        this._.cmp(cmpResult, op1, op2, COND.NE);
        return cmpResult;
    }

    abstract onArithmeticAndBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onArithmeticXorBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onArithmeticOrBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onLogicalAndBinaryExpression(expr: dom.BinaryExpression): any;
    abstract onLogicalOrBinaryExpression(expr: dom.BinaryExpression): any;
}*/

export class CreateIrPass extends TranslationUnitPass {

    _: IrUiUnitContext = createIRContext();
    unit: dom.TranslationUnit = null;

    toIrType(type: dom.Type): irtype.Type {
        if(type instanceof dom.VoidType) {
            return this._.t.void;
        } else if(type instanceof dom.PrimitiveType) {
            return this._.t.i(type.size * 8);
        } else
            throw TypeError('Could not convert C type to IR type.');
    }

    // toIrTypes(types: dom.Type[]): irtype.Type[] {
    //     var res = [];
    //     for(var type of types) res.push(this.toIrType(type));
    //     return res;
    // }

    onUnit(unit: dom.TranslationUnit) {
        console.log('tut');
        this.unit = unit;
        this.assignTypeSizes();
    }

    onFunctionDefinition(def: dom.FunctionDefinition) {
        var returnType = this.toIrType(def.type.returnType);

        var args: irop.OperandVariable[] = [];
        for(var arg of def.arguments) {
            var opvar = new irop.OperandVariable(this.toIrType(arg.type), arg.identifier.getName());
            args.push(opvar);
        }

        this._.func(returnType, args, def.getName(), _ => {
            var fdPass = new CreateIrFunctionDefinitionPass(this, _);
            var fdPassMng = new FunctionDefinitionPassManager <CreateIrFunctionDefinitionPass> (fdPass);
            fdPassMng.onFunctionDefinition(def);
            // var it = new BlockIterator;
            //
            // it.addPass(new AssignTypesBlockPass(this));
            // it.addPass(new TranslateToIrBlockPass(this, _));
            // it.onBlock(func.body);

            // var functionDefinition = new CToIrFunctionTranslator(this, func, _);
            // functionDefinition.walk();
        });
    }

    assignTypeSizes() {
        for(var typename in this.unit.t) {
            var type = this.unit.t[typename];
            if(type instanceof dom.PrimitiveType) {
                switch(type.baseType) {
                    // case 'bool':
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
    }
}


export class CreateIrFunctionDefinitionPass extends FunctionDefinitionPass {
    unitPass: CreateIrPass;
    _: IrUiFunctionContext;

    constructor(unitPass: CreateIrPass, ctx: IrUiFunctionContext) {
        super();
        this.unitPass = unitPass;
        this._ = ctx;
    }

    protected toIrType(type: dom.Type): irtype.Type {
        if(type instanceof dom.BoolType) {
            return this._.t.i1;
        } else if(type instanceof dom.PrimitiveType) {
            return this._.t.i(type.size * 8);
        } else
            throw Error('Cannot convert C type to IR type.');
    }

    protected getRValue(expr: dom.Expression): irop.Operand {
        if(!expr.rvalue) this.manager.onExpression(expr);
        return expr.rvalue;
    }

    protected getBooleanRValue(expr: dom.Expression): irop.Operand {
        var cmpResult = this._.var(this._.t.i1);
        this._.cmp(cmpResult, this.getRValue(expr), 0, COND.NE);
        return cmpResult;
    }


    // Declarations
    onDeclaration(decl: dom.Declaration) { }


    // Statements
    onExpressionStatement(st: dom.ExpressionStatement) {
        this.manager.onExpression(st.expression);
    }

    onIfStatement(st: dom.IfStatement) {
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
    }

    onWhileStatement(st: dom.WhileStatement) {
        var lblLoop = this._.lbl();
        st.labelContinue = this._.lbl();
        st.labelBreak = this._.lbl();

        this._.label(st.labelContinue);
        this._.br(this.getBooleanRValue(st.controlExpr), lblLoop, st.labelBreak);

        this._.label(lblLoop);
        this.manager.onBlock(st.body);

        this._.jmp(st.labelContinue);
        this._.label(st.labelBreak);
    }

    onDoStatement(st: dom.DoStatement) {
        var lblLoop = this._.lbl();
        st.labelContinue = this._.lbl();
        st.labelBreak = this._.lbl();

        this._.label(lblLoop);
        this.manager.onBlock(st.body);

        this._.label(st.labelContinue);
        this._.br(this.getBooleanRValue(st.controlExpr), lblLoop, st.labelBreak);
        this._.label(st.labelBreak);
    }

    onForStatement(st: dom.ForStatement) {
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
    }

    onContinueStatement(st: dom.ContinueStatement) {
        var loopStatement = st.parent.parent;
        if(loopStatement instanceof dom.IterationStatement)
            this._.jmp(loopStatement.labelContinue);
        else
            throw Error('`continue` statement allowed only inside a loop.');
    }

    onBreakStatement(st: dom.ContinueStatement) {
        var loopStatement = st.parent.parent;
        if(loopStatement instanceof dom.IterationStatement)
            this._.jmp(loopStatement.labelBreak);
        else
            throw Error('`break` statement allowed only inside a loop.');
    }

    onLabelStatement(st: dom.LabelStatement) {
        this._.label(st.label.getName());
    }

    onGotoStatement(st: dom.GotoStatement) {
        this._.jmp(st.label.getName());
    }

    onReturnStatement(st: dom.ReturnStatement) {
        this._.ret(this.getRValue(st.expression));
    }


    // Primary Expressions
    onPrimaryExpressionVariable(expr: dom.PrimaryExpressionVariable) {
        var v = expr.operand;
        expr.rvalue = this._.var(this.toIrType(v.type), v.getName());
    }

    onPrimaryExpressionConstant(expr: dom.PrimaryExpressionConstant) {
        expr.rvalue = this._.op(expr.operand, this._.t.i32);
    }


    // Postfix Expressions
    onPostfixExpression(expr: dom.PostfixExpression) {}

    onIncrementPostfixExpression(expr: dom.PostfixIncrementExpression) {
        expr.rvalue = expr.operand.rvalue;
        this._.add(expr.rvalue, expr.rvalue, this._.op(1, expr.rvalue.type));
    }

    onDecrementPostfixExpression(expr: dom.PostfixDecrementExpression) {
        expr.rvalue = expr.operand.rvalue;
        this._.sub(expr.rvalue, expr.rvalue, this._.op(1, expr.rvalue.type));
    }

    // Unary Expressions
    // export const UNARY_OPERATORS: UNARY_OPERATOR[] = ['++', '--', '&', '*', '+', '-', '~', '!'];
    onUnaryExpression(expr: dom.UnaryExpression) {}

    onIncrementUnaryExpression(expr: dom.UnaryExpression) {
        expr.rvalue = (expr.operand as dom.Expression).rvalue;
        this._.add(expr.rvalue, expr.rvalue, 1);
    }

    onDecrementUnaryExpression(expr: dom.UnaryExpression) {}
    onAndUnaryExpression(expr: dom.UnaryExpression) {}
    onStarUnaryExpression(expr: dom.UnaryExpression) {}
    onPlusUnaryExpression(expr: dom.UnaryExpression) {}
    onMinusUnaryExpression(expr: dom.UnaryExpression) {}
    onTildeUnaryExpression(expr: dom.UnaryExpression) {}
    onNotUnaryExpression(expr: dom.UnaryExpression) {}


    // Binary Expressions
    onBinaryExpression(expr: dom.BinaryExpression) {}

    onMultiplicationBinaryExpression(expr: dom.BinaryExpression) {
        expr.rvalue = this._.var(this.toIrType(expr.type));
        this._.mul(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    }

    onDivisionBinaryExpression(expr: dom.BinaryExpression) {
        var {operand1: op1, operand2: op2} = expr;
        expr.rvalue = this._.var(this.toIrType(expr.type));
        if((expr.type as dom.PrimitiveType).isUnsigned) {
            this._.udiv(expr.rvalue, op1.rvalue, op2.rvalue);
        } else {
            this._.sdiv(expr.rvalue, op1.rvalue, op2.rvalue);
        }
    }

    onReminderBinaryExpression(expr: dom.BinaryExpression) {
        var {operand1: op1, operand2: op2} = expr;
        expr.rvalue = this._.var(this.toIrType(expr.type));
        if((expr.type as dom.PrimitiveType).isUnsigned) {
            this._.urem(expr.rvalue, op1.rvalue, op2.rvalue);
        } else {
            this._.srem(expr.rvalue, op1.rvalue, op2.rvalue);
        }
    }

    onAdditionBinaryExpression(expr: dom.BinaryExpression) {
        expr.rvalue = this._.var(expr.operand1.rvalue.type);
        this._.add(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    }

    onSubtractionBinaryExpression(expr: dom.BinaryExpression) {
        expr.rvalue = this._.var(expr.operand1.rvalue.type);
        this._.sub(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    }

    onShiftLeftBinaryExpression(expr: dom.BinaryExpression) {
        expr.rvalue = this._.var(this.toIrType(expr.type));
        this._.shl(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    }

    onShiftRightBinaryExpression(expr: dom.BinaryExpression) {
        expr.rvalue = this._.var(this.toIrType(expr.type));
        this._.ashr(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    }

    onLessThanBinaryExpression(expr: dom.BinaryExpression) {
        expr.rvalue = this._.var(this._.t.i1);
        if((expr.operand1.type as dom.PrimitiveType).isUnsigned) {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, COND.ULT);
        } else {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, COND.SLT);
        }
    }

    onMoreThanBinaryExpression(expr: dom.BinaryExpression) {
        expr.rvalue = this._.var(this._.t.i1);
        if((expr.operand1.type as dom.PrimitiveType).isUnsigned) {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, COND.UGT);
        } else {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, COND.SGT);
        }
    }

    onLessThanOrEqualBinaryExpression(expr: dom.BinaryExpression) {
        expr.rvalue = this._.var(this._.t.i1);
        if((expr.operand1.type as dom.PrimitiveType).isUnsigned) {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, COND.ULE);
        } else {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, COND.SLE);
        }
    }

    onMoreThanOrEqualBinaryExpression(expr: dom.BinaryExpression) {
        expr.rvalue = this._.var(this._.t.i1);
        if((expr.operand1.type as dom.PrimitiveType).isUnsigned) {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, COND.UGE);
        } else {
            this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, COND.SGE);
        }
    }

    onEqualBinaryExpression(expr: dom.BinaryExpression) {
        expr.rvalue = this._.var(this._.t.i1);
        this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, COND.EQ);
    }

    onNotEqualBinaryExpression(expr: dom.BinaryExpression) {
        expr.rvalue = this._.var(this._.t.i1);
        this._.cmp(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue, COND.NE);
    }

    onArithmeticAndBinaryExpression(expr: dom.BinaryExpression) {
        expr.rvalue = this._.var(this.toIrType(expr.type));
        this._.and(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    }

    onArithmeticXorBinaryExpression(expr: dom.BinaryExpression) {
        expr.rvalue = this._.var(this.toIrType(expr.type));
        this._.xor(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    }

    onArithmeticOrBinaryExpression(expr: dom.BinaryExpression) {
        expr.rvalue = this._.var(this.toIrType(expr.type));
        this._.or(expr.rvalue, expr.operand1.rvalue, expr.operand2.rvalue);
    }

    onLogicalAndBinaryExpression(expr: dom.BinaryExpression) {
        var lblOneTrue = this._.lbl();
        var lblContinue = this._.lbl();

        expr.rvalue = this._.var(this._.t.i1);

        this._.cmp(expr.rvalue, expr.operand1.rvalue, this._.op(0), COND.NE);
        this._.br(expr.rvalue, lblOneTrue, lblContinue);

        this._.label(lblOneTrue);
        this._.cmp(expr.rvalue, expr.operand2.rvalue, this._.op(0), COND.NE);

        this._.label(lblContinue);
    }

    onLogicalOrBinaryExpression(expr: dom.BinaryExpression) {
        var lblOneFalse = this._.lbl();
        var lblContinue = this._.lbl();

        expr.rvalue = this._.var(this._.t.i1);

        this._.cmp(expr.rvalue, expr.operand1.rvalue, this._.op(0), COND.NE);
        this._.br(expr.rvalue, lblContinue, lblOneFalse);

        this._.label(lblOneFalse);
        this._.cmp(expr.rvalue, expr.operand2.rvalue, this._.op(0), COND.NE);

        this._.label(lblContinue);
    }

    onSimpleAssignmentExpression(expr: dom.BinaryExpression) {
        expr.rvalue = expr.operand1.rvalue;
        this._.assign(expr.operand1.rvalue, expr.operand2.rvalue);
    }

    onMultiplicationAssignmentExpression(expr: dom.BinaryExpression) {
        expr.rvalue = expr.operand1.rvalue;
        this._.mul(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    }

    onDivisionAssignmentExpression(expr: dom.BinaryExpression) {
        expr.rvalue = expr.operand1.rvalue;
        if((expr.type as dom.PrimitiveType).isUnsigned) {
            this._.udiv(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
        } else {
            this._.sdiv(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
        }
    }

    onRemainderAssignmentExpression(expr: dom.BinaryExpression) {
        expr.rvalue = expr.operand1.rvalue;
        if((expr.type as dom.PrimitiveType).isUnsigned) {
            this._.urem(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
        } else {
            this._.srem(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
        }
    }

    onAdditionAssignmentExpression(expr: dom.BinaryExpression) {
        expr.rvalue = expr.operand1.rvalue;
        this._.add(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    }

    onSubtractionAssignmentExpression(expr: dom.BinaryExpression) {
        expr.rvalue = expr.operand1.rvalue;
        this._.sub(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    }

    onShiftLeftAssignmentExpression(expr: dom.BinaryExpression) {
        expr.rvalue = expr.operand1.rvalue;
        this._.shl(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    }

    onShiftRightAssignmentExpression(expr: dom.BinaryExpression) {
        expr.rvalue = expr.operand1.rvalue;
        this._.ashr(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    }

    onAndAssignmentExpression(expr: dom.BinaryExpression) {
        expr.rvalue = expr.operand1.rvalue;
        this._.and(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    }

    onXorAssignmentExpression(expr: dom.BinaryExpression) {
        expr.rvalue = expr.operand1.rvalue;
        this._.xor(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    }

    onOrAssignmentExpression(expr: dom.BinaryExpression) {
        expr.rvalue = expr.operand1.rvalue;
        this._.or(expr.rvalue, expr.rvalue, expr.operand2.rvalue);
    }
}








/*


 export class TranslatorDomToTacFunction {
 unit: TranslatorDomToTacUnit;
 func: tac.Function;

 constructor(unit: TranslatorDomToTacUnit) {
 this.unit = unit;
 }

 protected createTemporaryOperand() {
 return new tac.OperandVariable(t.i64);
 }

 onSimpleAssignmentExpression(expr: dom.SimpleAssignmentExpression): tac.Operand {
 // if(!(expr.operand1 instanceof dom.PrimaryExpressionVariable))
 //     throw Error('SimpleAssignmentExpression destination must be lvalue.');

 var op1 = this.translateExpression(expr.operand1);
 var op2 = this.translateExpression(expr.operand2);
 this.func.pushInstruction(new tac.AssignmentInstruction(op1, op2));
 return op1;
 }

 onPrimaryExpressionConstant(expr: dom.PrimaryExpressionConstant): tac.Operand {
 return new tac.OperandConst(t.i64, expr.operand);
 }

 translateExpression(expr: dom.Expression): tac.Operand {
 if(expr instanceof dom.PrimaryExpressionVariable) {
 var name = expr.operand.identifier.getName();
 var op = this.func.vars.get(name);
 if(!op) throw Error(`Variable ${name} not defined.`);
 return op;
 } else if(expr instanceof dom.PrimaryExpressionConstant) {
 return this.onPrimaryExpressionConstant(expr);
 } else if(expr instanceof dom.SimpleAssignmentExpression) {
 return this.onSimpleAssignmentExpression(expr);
 } else if(expr instanceof dom.AdditionExpression) {
 var op1 = this.translateExpression(expr.operand1);
 var op2 = this.translateExpression(expr.operand2);
 var tmp = this.createTemporaryOperand();
 this.func.pushInstruction(new tac.AdditionInstruction(tmp, op1, op2));
 return tmp;
 } else
 throw Error(`Do not know how to translate Expression of type ${(expr.constructor as any).name}.`);
 }

 translateDeclaration(decl: dom.Declaration) {
 var tacAssign = new tac.AssignmentInstruction(
 new tac.OperandVariable(t.i64, decl.variable.identifier.getName()),
 new tac.OperandConst(t.i64, decl.variable.object.value));
 this.func.pushInstruction(tacAssign);
 }

 onIfStatement(st: dom.IfStatement) {
 var boolOperand = this.translateExpression(st.expression);
 var cmpResult = this.createTemporaryOperand();
 var ins = new tac.CompareInstruction(cmpResult, tac.CONDITION.NE, boolOperand, new tac.OperandConst(t.i64, 0));
 this.func.pushInstruction(ins);

 var labelIfEqual = new tac.OperandLabel;
 var labelIfUnequal = new tac.OperandLabel;
 var labelContinue = new tac.OperandLabel;

 this.func.pushInstruction(new tac.BranchInstruction(cmpResult, labelIfEqual, labelIfUnequal));

 // If true
 this.func.pushInstruction(new tac.LabelInstruction(labelIfEqual));
 this.translateBlock(st.trueBlock);
 this.func.pushInstruction(new tac.JumpInstruction(labelContinue));

 // else
 this.func.pushInstruction(new tac.LabelInstruction(labelIfUnequal));
 this.translateBlock(st.elseBlock);

 this.func.pushInstruction(new tac.LabelInstruction(labelContinue));
 }

 onReturnStatement(st: dom.ReturnStatement) {
 var operand = this.translateExpression(st.expression);
 var retIns = new tac.ReturnInstruction(operand);
 this.func.pushInstruction(retIns);
 }

 translateStatement(st: dom.Statement) {
 if(st instanceof dom.ExpressionStatement) {
 this.translateExpression(st.expression);
 } else if(st instanceof dom.ReturnStatement) {
 this.onReturnStatement(st);
 } else if(st instanceof dom.IfStatement) {
 return this.onIfStatement(st);
 } else
 throw Error(`Do not know how to translate Statement of type ${(st.constructor as any).name}.`);
 }

 translateBlock(body: dom.Block) {
 for(var item of body.items) {
 if(item instanceof dom.Declaration) {
 this.translateDeclaration(item);
 } else if(item instanceof dom.Statement) {
 this.translateStatement(item);
 } else
 throw Error('Do not know how to translate Instruction or Declaration.');
 }
 }

 translate(funcdef: dom.FunctionDefinition): tac.Function {
 this.func = new tac.Function(t.void, [], funcdef.identifier.getName());
 this.translateBlock(funcdef.body);
 return this.func;
 }
 }


 export class TranslatorDomToTacUnit {

 cunit: dom.TranslationUnit;
 tac: tac.Unit = new tac.Unit;

 translate(cunit: dom.TranslationUnit) {
 this.cunit = cunit;
 var {cunit, tac} = this;

 for(var item of cunit.externalDeclarations) {
 if(item instanceof dom.FunctionDefinition) {
 var funcTranslator = new TranslatorDomToTacFunction(this);
 var f = funcTranslator.translate(item);
 this.tac.pushFunction(f);
 } else
 throw Error('Do not know how to translate external declaration of type ' + (item.constructor as any).name);
 }
 return this.tac;
 }
 }
 */

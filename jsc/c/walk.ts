import * as dom from './dom';


export class PassManager <T extends Pass> {
    pass: T;
}


export class TranslationUnitPassManager <T extends TranslationUnitPass> extends PassManager <T> {
    pass: T;

    constructor(pass: T) {
        super();
        this.pass = pass;
    }

    onUnit(unit: dom.TranslationUnit) {
        this.pass.onUnit(unit);
        for(var decl of unit.externalDeclarations) {
            if(decl instanceof dom.FunctionDefinition) this.onFunctionDefinition(decl);
            else throw Error(`Unknown external declaration.`);
        }
    }

    onFunctionDefinition(def: dom.FunctionDefinition) {
        this.pass.onFunctionDefinition(def);
    }
}


export class FunctionDefinitionPassManager <T extends FunctionDefinitionPass> extends PassManager <T> {
    pass: T;

    constructor(pass: T) {
        super();
        this.pass = pass;
        pass.manager = this;
    }

    onFunctionDefinition(def: dom.FunctionDefinition) {
        this.pass.onFunctionDefinition(def);
        this.onBlock(def.body);
    }

    onBlock(block: dom.Block) {
        for(var item of block.items) {
            if(item instanceof dom.Declaration) this.pass.onDeclaration(item);
            else if(item instanceof dom.Statement) this.onStatement(item);
            else throw Error(`Unexpected iteration block.`);
        }
    }

    onStatement(st: dom.Statement) {
        this.pass.onStatement(st);
        if(st instanceof dom.ExpressionStatement) this.pass.onExpressionStatement(st);
        else if(st instanceof dom.IfStatement) this.pass.onIfStatement(st);
        else if(st instanceof dom.WhileStatement) this.pass.onWhileStatement(st);
        else if(st instanceof dom.DoStatement) this.pass.onDoStatement(st);
        else if(st instanceof dom.ForStatement) this.pass.onForStatement(st);
        else if(st instanceof dom.ContinueStatement) this.pass.onContinueStatement(st);
        else if(st instanceof dom.BreakStatement) this.pass.onBreakStatement(st);
        else if(st instanceof dom.LabelStatement) this.pass.onLabelStatement(st);
        else if(st instanceof dom.GotoStatement) this.pass.onGotoStatement(st);
        else if(st instanceof dom.ReturnStatement) this.pass.onReturnStatement(st);
    }

    onExpression(expr: dom.Expression) {
        if(expr instanceof dom.PrimaryExpressionVariable) this.pass.onPrimaryExpressionVariable(expr);
        else if(expr instanceof dom.PrimaryExpressionConstant) this.pass.onPrimaryExpressionConstant(expr);
        else if(expr instanceof dom.PostfixExpression) this.onPostfixExpression(expr);
        else if(expr instanceof dom.UnaryExpression) this.onUnaryExpression(expr);
        else if(expr instanceof dom.BinaryExpression) this.onBinaryExpression(expr);
    }

    onPostfixExpression(expr: dom.PostfixExpression) {
        this.onExpression(expr.operand);

        this.pass.onPostfixExpression(expr);

        if(expr instanceof dom.PostfixIncrementExpression) this.pass.onIncrementPostfixExpression(expr);
        else if(expr instanceof dom.PostfixDecrementExpression) this.pass.onDecrementPostfixExpression(expr);
    }

    onUnaryExpression(expr: dom.UnaryExpression) {
        if(expr instanceof dom.UnarySizeofExpression) {
            this.pass.onSizeofUnaryExpression(expr);
        } else {
            this.onExpression(expr.operand as dom.Expression);

            this.pass.onUnaryExpression(expr);

            switch(expr.operator) {
                case '++': this.pass.onIncrementUnaryExpression(expr); break;
                case '--': this.pass.onDecrementUnaryExpression(expr); break;
                case '&': this.pass.onAndUnaryExpression(expr); break;
                case '*': this.pass.onStarUnaryExpression(expr); break;
                case '+': this.pass.onPlusUnaryExpression(expr); break;
                case '-': this.pass.onMinusUnaryExpression(expr); break;
                case '~': this.pass.onTildeUnaryExpression(expr); break;
                case '!': this.pass.onNotUnaryExpression(expr); break;
            }
        }
    }

    onBinaryExpression(expr: dom.BinaryExpression) {

        this.onExpression(expr.operand1);
        this.onExpression(expr.operand2);

        this.pass.onBinaryExpression(expr);

        switch(expr.operator) {
            case '*': this.pass.onMultiplicationBinaryExpression(expr); break;
            case '/': this.pass.onDivisionBinaryExpression(expr); break;
            case '%': this.pass.onReminderBinaryExpression(expr); break;
            case '+': this.pass.onAdditionBinaryExpression(expr); break;
            case '-': this.pass.onSubtractionBinaryExpression(expr); break;
            case '<<': this.pass.onShiftLeftBinaryExpression(expr); break;
            case '>>': this.pass.onShiftRightBinaryExpression(expr); break;
            case '<': this.pass.onLessThanBinaryExpression(expr); break;
            case '>': this.pass.onMoreThanBinaryExpression(expr); break;
            case '<=': this.pass.onLessThanOrEqualBinaryExpression(expr); break;
            case '>=': this.pass.onMoreThanOrEqualBinaryExpression(expr); break;
            case '==': this.pass.onEqualBinaryExpression(expr); break;
            case '!=': this.pass.onNotEqualBinaryExpression(expr); break;
            case '&': this.pass.onArithmeticAndBinaryExpression(expr); break;
            case '^': this.pass.onArithmeticXorBinaryExpression(expr); break;
            case '|': this.pass.onArithmeticOrBinaryExpression(expr); break;
            case '&&': this.pass.onLogicalAndBinaryExpression(expr); break;
            case '||': this.pass.onLogicalOrBinaryExpression(expr); break;
            case '=': this.pass.onSimpleAssignmentExpression(expr); break;
            case '*=': this.pass.onMultiplicationAssignmentExpression(expr); break;
            case '/=': this.pass.onDivisionAssignmentExpression(expr); break;
            case '%=': this.pass.onRemainderAssignmentExpression(expr); break;
            case '+=': this.pass.onAdditionAssignmentExpression(expr); break;
            case '-=': this.pass.onSubtractionAssignmentExpression(expr); break;
            case '<<=': this.pass.onShiftLeftAssignmentExpression(expr); break;
            case '>>=': this.pass.onShiftRightAssignmentExpression(expr); break;
            case '&=': this.pass.onAndAssignmentExpression(expr); break;
            case '^=': this.pass.onXorAssignmentExpression(expr); break;
            case '|=': this.pass.onOrAssignmentExpression(expr); break;
        }
    }
}


export abstract class Pass {
    manager: PassManager <Pass> = null;
}


export abstract class TranslationUnitPass extends Pass {
    manager: TranslationUnitPassManager <this>;

    onUnit(unit: dom.TranslationUnit) {}

    onFunctionDefinition(def: dom.FunctionDefinition) {}
}


export abstract class FunctionDefinitionPass extends Pass {
    manager: FunctionDefinitionPassManager <this>;

    onFunctionDefinition(def: dom.FunctionDefinition) {}

    // Declarations
    onDeclaration(decl: dom.Declaration) {}

    // Statements
    onStatement(st: dom.Statement) {}
    onExpressionStatement(st: dom.ExpressionStatement) {}
    onIfStatement(st: dom.IfStatement) {}
    onWhileStatement(st: dom.WhileStatement) {}
    onDoStatement(st: dom.DoStatement) {}
    onForStatement(st: dom.ForStatement) {}
    onContinueStatement(st: dom.ContinueStatement) {}
    onBreakStatement(st: dom.BreakStatement) {}
    onLabelStatement(st: dom.LabelStatement) {}
    onGotoStatement(st: dom.GotoStatement) {}
    onReturnStatement(st: dom.ReturnStatement) {}

    // Primary Expressions
    onPrimaryExpressionVariable(expr: dom.PrimaryExpressionVariable) { }
    onPrimaryExpressionConstant(expr: dom.PrimaryExpressionConstant) { }

    // Postfix Expressions
    onPostfixExpression(expr: dom.PostfixExpression) {}
    onIncrementPostfixExpression(expr: dom.PostfixIncrementExpression) {}
    onDecrementPostfixExpression(expr: dom.PostfixDecrementExpression) {}

    // Unary Expressions
    // export const UNARY_OPERATORS: UNARY_OPERATOR[] = ['++', '--', '&', '*', '+', '-', '~', '!'];
    onUnaryExpression(expr: dom.UnaryExpression) {}
    onIncrementUnaryExpression(expr: dom.UnaryExpression) {}
    onDecrementUnaryExpression(expr: dom.UnaryExpression) {}
    onAndUnaryExpression(expr: dom.UnaryExpression) {}
    onStarUnaryExpression(expr: dom.UnaryExpression) {}
    onPlusUnaryExpression(expr: dom.UnaryExpression) {}
    onMinusUnaryExpression(expr: dom.UnaryExpression) {}
    onTildeUnaryExpression(expr: dom.UnaryExpression) {}
    onNotUnaryExpression(expr: dom.UnaryExpression) {}
    onSizeofUnaryExpression(expr: dom.UnarySizeofExpression) {}

    // Binary Expressions
    onBinaryExpression(expr: dom.BinaryExpression) {}
    onMultiplicationBinaryExpression(expr: dom.BinaryExpression) {}
    onDivisionBinaryExpression(expr: dom.BinaryExpression) {}
    onReminderBinaryExpression(expr: dom.BinaryExpression) {}
    onAdditionBinaryExpression(expr: dom.BinaryExpression) {}
    onSubtractionBinaryExpression(expr: dom.BinaryExpression) {}
    onShiftLeftBinaryExpression(expr: dom.BinaryExpression) {}
    onShiftRightBinaryExpression(expr: dom.BinaryExpression) {}
    onLessThanBinaryExpression(expr: dom.BinaryExpression) {}
    onMoreThanBinaryExpression(expr: dom.BinaryExpression) {}
    onLessThanOrEqualBinaryExpression(expr: dom.BinaryExpression) {}
    onMoreThanOrEqualBinaryExpression(expr: dom.BinaryExpression) {}
    onEqualBinaryExpression(expr: dom.BinaryExpression) {}
    onNotEqualBinaryExpression(expr: dom.BinaryExpression) {}
    onArithmeticAndBinaryExpression(expr: dom.BinaryExpression) {}
    onArithmeticXorBinaryExpression(expr: dom.BinaryExpression) {}
    onArithmeticOrBinaryExpression(expr: dom.BinaryExpression) {}
    onLogicalAndBinaryExpression(expr: dom.BinaryExpression) {}
    onLogicalOrBinaryExpression(expr: dom.BinaryExpression) {}
    onSimpleAssignmentExpression(expr: dom.BinaryExpression) {}
    onMultiplicationAssignmentExpression(expr: dom.BinaryExpression) {}
    onDivisionAssignmentExpression(expr: dom.BinaryExpression) {}
    onRemainderAssignmentExpression(expr: dom.BinaryExpression) {}
    onAdditionAssignmentExpression(expr: dom.BinaryExpression) {}
    onSubtractionAssignmentExpression(expr: dom.BinaryExpression) {}
    onShiftLeftAssignmentExpression(expr: dom.BinaryExpression) {}
    onShiftRightAssignmentExpression(expr: dom.BinaryExpression) {}
    onAndAssignmentExpression(expr: dom.BinaryExpression) {}
    onXorAssignmentExpression(expr: dom.BinaryExpression) {}
    onOrAssignmentExpression(expr: dom.BinaryExpression) {}
}

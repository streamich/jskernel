import {
    TranslationUnit, FunctionDefinition, Declaration, Statement, MemoryLocation, Object,
    ExpressionStatement, Expression, AdditionExpression, PrimaryExpression, ReturnStatement, PrimaryExpressionObject
} from './c/dom';
import {Code} from '../ass-js/x86/x64/code';
import {rax, rbx, rdx, rcx, rbp, rsp, rdi, rsi, r8, r9, r10, r11, r12, r13, r14, r15, Register} from '../ass-js/x86/operand';
import {Label} from '../ass-js/instruction';


const INT_SIZE = 8;


export class MemoryLocationStack extends MemoryLocation {
    slot: StackSlot;

    constructor(slot: StackSlot) {
        super();
        this.slot = slot;
    }
}


export class StackSlot {
    offset: number;

    constructor(offset: number) {
        this.offset = offset;
    }
}


export class StackFrame {
    // Size in architecture native size, say size of `1` is 8 bytes on 64-bit machines.
    // Not counting stack frame hearder.
    size: number = 0;

    code: Code;

    constructor(code: Code) {
        this.code = code;
    }

    allocateSlot(): StackSlot {
        this.size++;
        var slot = new StackSlot(this.size * INT_SIZE);
        return slot;
    }

    allocate(object: Object) {
        var slot = this.allocateSlot();
        object.setMemoryLocation(new MemoryLocationStack(slot));
        this.code._('addStatement', object.value);
    }

    emitEpilogue() {
        this.code._('addStatement', rbp);
        this.code._('mov', [rbp, rsp]);
    }

    emitPrologue() {
        this.code._('mov', [rsp, rbp]);
        this.code._('pop', rbp);
    }
}


export const enum STORE {
    REGISTER,
    VIRTUAL_REGISTER,
    STACK,
    MEMORY,
    CONSTANT,
}


export class RValue {

    static fromObject(object: Object): RValue {
        if(object.location instanceof MemoryLocationStack) {
            var rvalue = new RValue;
            rvalue.store = STORE.STACK;
            rvalue.slot = (object.location as MemoryLocationStack).slot;
            return rvalue;
        } else
            throw Error('Cannot create RValue from Object.');
    }

    static fromRegister(register: Register) {
        var rvalue = new RValue;
        rvalue.store = STORE.REGISTER;
        rvalue.register = register;
        return rvalue;
    }

    static fromVirtualRegister(register: VirtualRegister) {
        var rvalue = new RValue;
        rvalue.store = STORE.VIRTUAL_REGISTER;
        rvalue.vregister = register;
        return rvalue;
    }

    store: STORE;
    register: Register = null;
    vregister: VirtualRegister = null;
    slot: StackSlot = null;
    address: number = 0;
    value: number = 0;
}


export class LValue extends RValue {

}


export class VirtualRegister {
    register: Register;
    stackSlot: StackSlot;
    isAvailable = false;

    constructor(register: Register, slot: StackSlot = null) {
        this.register = register;
        this.stackSlot = slot;
    }
}


export class VirtualRegisterFile {
    stack: StackFrame;

    registers: VirtualRegister[] = [];

    scratchRegisters = [rcx, rdi, rsi, r8, r9, r10, r11];

    constructor(stack: StackFrame) {
        this.stack = stack;
    }

    allocate(): VirtualRegister {
        for(var reg of this.registers) {
            if(reg.isAvailable) {
                reg.isAvailable = false;
                return reg;
            }
        }

        if(this.registers.length < this.scratchRegisters.length) {
            var reg = new VirtualRegister(this.scratchRegisters[this.registers.length]);
            this.registers.push(reg);
            return reg;
        } else {
            var reg = new VirtualRegister(null, this.stack.allocateSlot());
            this.registers.push(reg);
            return reg;
        }
    }

    free(reg: VirtualRegister) {
        reg.isAvailable = true;
    }
}


export class FunctionGenerator {
    codegen: Codegen;
    code: Code;
    func: FunctionDefinition;
    lable: Label = null;
    stack: StackFrame;

    constructor(codegen: Codegen, func: FunctionDefinition) {
        this.codegen = codegen;
        this.code = codegen.code;
        this.func = func;
        this.stack = new StackFrame(this.code);
    }

    protected emitFunctionPrologue() {
        this.stack.emitEpilogue();
    }

    protected emitFunctionEpilogue() {
        this.stack.emitPrologue();
        this.code._('ret');
    }

    protected emitDeclaration(decl: Declaration) {
        this.stack.allocate(decl.object);
    }

    protected load(rvalue: RValue, register: Register) {
        switch(rvalue.store) {
            case STORE.STACK:
                this.code._('mov', [rbp.disp(-rvalue.slot.offset), register]);
                break;
            case STORE.REGISTER:
                if(rvalue.register !== register) {
                    this.code._('mov', [register, rvalue.register]);
                }
                break;
            case STORE.VIRTUAL_REGISTER:
                var vreg = rvalue.vregister;
                if(vreg.register) {
                    if(vreg.register !== register) {
                        this.code._('mov', [register, rvalue.register]);
                    } else {
                        this.code._('mov', [register, rbp.disp(-vreg.stackSlot.offset)]);
                    }
                }
                break;
            default:
                throw Error('Do not know how to load RValue.');
        }
    }

    protected emitExpression(expression: Expression): RValue {
        if(expression instanceof AdditionExpression) {
            var expr = expression as AdditionExpression;
            var rvalue1 = this.emitExpression(expr.operand1);
            var rvalue2 = this.emitExpression(expr.operand2);
            this.load(rvalue1, rax);
            this.load(rvalue2, rdx);
            this.code._('add', [rax, rdx]);
            return RValue.fromRegister(rax);
        } else if(expression instanceof PrimaryExpression) {
            if(expression instanceof PrimaryExpressionObject) {
                return RValue.fromObject(expression.operand);
            } else
                throw Error('Do not know how to emit expression of this kind.');
        } else
            throw Error('Do not know how to emit expression of this kind.');
    }

    protected emitStatement(statement: Statement) {
        if(statement instanceof ExpressionStatement) {
            this.emitExpression((statement as ExpressionStatement).expression);
        } else if(statement instanceof ReturnStatement) {
            var rvalue = this.emitExpression(statement.expression);

            // TODO: put result in register.
            this.emitFunctionEpilogue();
        } else {
            // console.log(statement);
            throw Error('Do not know how to emit statement of this kind.');
        }
    }

    emit() {

        // Function symbol.
        this.codegen.code.label(this.func.getIdentifier().getName());

        // Function prologue.
        this.emitFunctionPrologue();

        var bodyItems = this.func.body.items;

        // Function body.
        for(var item of bodyItems) {
            if(item instanceof Declaration) {
                this.emitDeclaration(item as Declaration);
            } else if(item instanceof Statement) {
                this.emitStatement(item as Statement);
            }
        }

        // Function epologue.
        var isLastStatementReturnStatement = bodyItems[bodyItems.length - 1] instanceof ReturnStatement;
        if(!isLastStatementReturnStatement)
            this.emitFunctionEpilogue();
    }
}


export class Codegen {

    code: Code = new Code;

    translate(unit: TranslationUnit) {
        var _ = this.code;

        for(var decl of unit.externalDeclarations) {
            if(decl instanceof FunctionDefinition) {
                var funcgen = new FunctionGenerator(this, decl);
                funcgen.emit();
            } else
                throw Error('Do not know how to translate external definition.');
        }
        console.log(_.toString());
        var bin = _.compile();
        console.log(_.toString());
        return bin;
    }
}

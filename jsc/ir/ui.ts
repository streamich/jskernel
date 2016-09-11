import * as type from './type';
import * as tac from './ir';
import * as op from './operand';
import * as ins from './ins';


export const COND = ins.CONDITION;
export const t = type.t;


export type TFunctionContinuation = (func: IrUiFunctionContext) => void;


export class IrUiUnitContext {
    unit: tac.Unit = new tac.Unit;
    t = type.t;

    func(cont: TFunctionContinuation);
    func(props: IFunctionProperties, cont: TFunctionContinuation);
    func(name: string, cont: TFunctionContinuation);
    func(type: type.Type, args: op.OperandVariable[], name: string, cont: TFunctionContinuation);
    func(a: any, b?: any, c?: any, d?: any) {
        var p: IFunctionProperties = {} as IFunctionProperties;
        var continuation: TFunctionContinuation;

        var typeofA = typeof a;
        if(typeofA === 'function') {
            continuation = a as TFunctionContinuation;
        } else if(typeofA === 'object') {
            if(a instanceof type.Type) {
                p.type = a as type.Type;
                p.args = b as op.OperandVariable[];
                p.name = c as string;
                continuation = d as TFunctionContinuation;
            } else {
                p = a as IFunctionProperties;
                continuation = b as TFunctionContinuation;
            }
        } else if(typeofA === 'string') {
            p.name = a as string;
            continuation = b as TFunctionContinuation;
        }

        var func = new IrUiFunctionContext(p);
        this.unit.pushFunction(func.func);
        continuation(func);
    }

    toString() {
        return this.unit.toString();
    }
}


export interface IFunctionProperties {
    name?: string,
    type?: type.Type,
    args?: op.OperandVariable[],
    attr?: tac.IFunctionAttributes,
}

export type TUiOperand = op.Operand|number|string;
export type TUiLOperand = op.OperandVariable;
export type TUiLabel = op.OperandLabel|string;

export class IrUiFunctionContext {
    func: tac.Function = new tac.Function;
    t = type.t;
    defaultType = this.t.i64;

    constructor(props: IFunctionProperties) {
        this.func = new tac.Function(props.type, props.args, props.name, props.attr);
    }

    // To `irop.Operand`.
    op(value: TUiOperand = null, t: type.Type = this.defaultType): op.Operand {
        if(typeof value === 'number') {
            return new op.OperandConst(t, value);
        } else if(!value) {
            return this.func.createVariable(t);
        } else if(value instanceof op.Operand) {
            return value as op.Operand;
        } else if(typeof value === 'string') {
            var operand = this.func.vars.get(value);
            if(operand) return operand;
            else throw Error(`Variable not found "${value}".`);
        } else
            throw Error(`Do not know how to create operand out of type ${typeof value}.`);
    }

    // L-value
    lop(lvalue: TUiLOperand): op.OperandVariable {
        if(lvalue instanceof op.OperandVariable) {
            return lvalue;
        } else
            throw Error('L-value expected as destination operand.');
    }

    'var'(t: type.Type = this.defaultType, name?: string) {
        return this.func.vars.getOrCreate(t, name);
    }

    lbl(lblOperand?: TUiLabel): op.OperandLabel {
        if(!lblOperand) {
            return this.func.labels.create();
        } else if(typeof lblOperand === 'string') {
            return this.func.labels.getOrCreate(lblOperand);
        } else if(lblOperand instanceof op.OperandLabel) {
            return lblOperand;
        } else
            throw TypeError('Expected TUiLabel.');
    }

    label(lbl: TUiLabel): ins.Label {
        var lblOperand = this.lbl(lbl);
        var instruction = new ins.Label(lblOperand);
        return this.func.pushInstruction(instruction);
    }

    assign(op1: TUiOperand|string, op2: TUiOperand, t?: type.Type): ins.Assign {
        var operand1: op.Operand;
        var operand2: op.Operand;

        var operand2 = this.op(op2, t);
        operand1 = this.op(op1);

        var instruction = new ins.Assign(operand1, operand2);
        this.func.pushInstruction(instruction);
        return instruction;
    }

    is(op1: TUiOperand|string, op2: TUiOperand, t?: type.Type): ins.Assign {
        return this.assign(op1, op2, t);
    }

    add(op1: TUiOperand, op2: TUiOperand, op3: TUiOperand): ins.Add {
        return this.func.pushInstruction(new ins.Add(this.op(op1), this.op(op2), this.op(op3)));
    }

    sub(op1: TUiOperand, op2: TUiOperand, op3: TUiOperand): ins.Sub {
        return this.func.pushInstruction(new ins.Sub(this.op(op1), this.op(op2), this.op(op3)));
    }

    mul(op1: TUiOperand, op2: TUiOperand, op3: TUiOperand): ins.Sub {
        return this.func.pushInstruction(new ins.Mul(this.op(op1), this.op(op2), this.op(op3)));
    }

    sdiv(op1: TUiOperand, op2: TUiOperand, op3: TUiOperand): ins.Sub {
        return this.func.pushInstruction(new ins.SDiv(this.op(op1), this.op(op2), this.op(op3)));
    }

    udiv(op1: TUiOperand, op2: TUiOperand, op3: TUiOperand): ins.Sub {
        return this.func.pushInstruction(new ins.UDiv(this.op(op1), this.op(op2), this.op(op3)));
    }

    urem(op1: TUiOperand, op2: TUiOperand, op3: TUiOperand): ins.Sub {
        return this.func.pushInstruction(new ins.URem(this.op(op1), this.op(op2), this.op(op3)));
    }

    srem(op1: TUiOperand, op2: TUiOperand, op3: TUiOperand): ins.Sub {
        return this.func.pushInstruction(new ins.SRem(this.op(op1), this.op(op2), this.op(op3)));
    }

    shl(op1: TUiOperand, op2: TUiOperand, op3: TUiOperand): ins.Sub {
        return this.func.pushInstruction(new ins.Shl(this.op(op1), this.op(op2), this.op(op3)));
    }

    lshr(op1: TUiOperand, op2: TUiOperand, op3: TUiOperand): ins.Sub {
        return this.func.pushInstruction(new ins.LShr(this.op(op1), this.op(op2), this.op(op3)));
    }

    ashr(op1: TUiOperand, op2: TUiOperand, op3: TUiOperand): ins.Sub {
        return this.func.pushInstruction(new ins.AShr(this.op(op1), this.op(op2), this.op(op3)));
    }

    and(op1: TUiOperand, op2: TUiOperand, op3: TUiOperand): ins.Sub {
        return this.func.pushInstruction(new ins.And(this.op(op1), this.op(op2), this.op(op3)));
    }

    or(op1: TUiOperand, op2: TUiOperand, op3: TUiOperand): ins.Sub {
        return this.func.pushInstruction(new ins.Or(this.op(op1), this.op(op2), this.op(op3)));
    }

    xor(op1: TUiOperand, op2: TUiOperand, op3: TUiOperand): ins.Sub {
        return this.func.pushInstruction(new ins.Xor(this.op(op1), this.op(op2), this.op(op3)));
    }

    trunc(op1: TUiLOperand, op2: TUiOperand, toType: type.Type) {
        return this.func.pushInstruction(new ins.Trunc(this.op(op1), this.op(op2), toType));
    }

    zext(op1: TUiLOperand, op2: TUiOperand, toType: type.Type) {
        return this.func.pushInstruction(new ins.ZExt(this.op(op1), this.op(op2), toType));
    }

    sext(op1: TUiLOperand, op2: TUiOperand, toType: type.Type) {
        return this.func.pushInstruction(new ins.SExt(this.op(op1), this.op(op2), toType));
    }

    ptrtoint(op1: TUiLOperand, op2: TUiOperand, toType: type.Type) {
        return this.func.pushInstruction(new ins.PtrToInt(this.op(op1), this.op(op2), toType));
    }

    inttoptr(op1: TUiLOperand, op2: TUiOperand, toType: type.Type) {
        return this.func.pushInstruction(new ins.IntToPtr(this.op(op1), this.op(op2), toType));
    }

    bitcast(op1: TUiLOperand, op2: TUiOperand, toType: type.Type) {
        return this.func.pushInstruction(new ins.Bitcast(this.op(op1), this.op(op2), toType));
    }

    cmp(op1: TUiLOperand, op2: TUiOperand, op3: TUiOperand, condition: ins.CONDITION) {
        return this.func.pushInstruction(new ins.Cmp(this.lop(op1), this.op(op2), this.op(op3), condition));
    }

    br(op1: TUiOperand, lbl1: TUiLabel, lbl2: TUiLabel) {
        return this.func.pushInstruction(new ins.Br(this.op(op1) as op.OperandVariable, this.lbl(lbl1), this.lbl(lbl2)));
    }

    jmp(lbl: TUiLabel) {
        return this.func.pushInstruction(new ins.Jmp(this.lbl(lbl)));
    }

    ret(operand?: TUiOperand) {
        if(typeof operand === 'undefined') {
            return this.func.pushInstruction(new ins.Ret());
        } else {
            return this.func.pushInstruction(new ins.Ret(this.op(operand)));
        }
    }

    alloc(ptr: op.OperandVariable, ptrType: type.Type) {
        return this.func.pushInstruction(new ins.Alloc(ptr, ptrType));
    }

    store(ptr: TUiLOperand, value: TUiOperand) {
        return this.func.pushInstruction(new ins.Store(this.lop(ptr), this.op(value)));
    }

    load(val: TUiOperand, ptr: TUiLOperand, valueType: type.Type) {
        return this.func.pushInstruction(new ins.Load(this.op(val), this.lop(ptr), valueType));
    }

    asm(tpl) {
        return this.func.pushInstruction(new ins.Asm(tpl));
    }
}


export function create() {
    var ui = new IrUiUnitContext;
    return ui;
}

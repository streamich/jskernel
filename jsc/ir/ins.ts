import * as op from './operand';
import {Type} from "./type";


export enum OPERATOR {
    Undefined = -1,

    Ret = 0,
    Br = 1,
    Jmp = 2,
    Cmp = 3,
    Call = 4,
    Label = 5,
    Assign = 6,

    Add = 20,
    Sub = 21,
    Mul = 22,
    UDiv = 23,
    SDiv = 24,
    URem = 25,
    SRem = 26,

    Shl = 40,
    LShr = 41,
    AShr = 42,
    And = 43,
    Or = 44,
    Xor = 45,

    Alloc = 60,
    Load = 61,
    Store = 62,

    Trunc = 80,
    ZExt = 81,
    SExt = 82,
    PtrToInt = 83,
    IntToPtr = 84,
    Bitcast = 85,
}


export interface DoublyLinkedList <T> {
    next: T,
    prev: T,
}


export class Instruction implements DoublyLinkedList <Instruction> {

    static fromJson() {

    }

    operator: OPERATOR = OPERATOR.Undefined;
    op1: op.Operand;
    op2: op.Operand;
    op3: op.Operand;

    next: Instruction = null;
    prev: Instruction = null;

    constructor(op1: op.Operand = null, op2: op.Operand = null, op3: op.Operand = null) {
        this.op1 = op1;
        this.op2 = op2;
        this.op3 = op3;
    }

    operands(): op.Operand[] {
        var ops = [];
        if(this.op1) {
            ops.push(this.op1);
            if(this.op2) {
                ops.push(this.op2);
                if(this.op3) {
                    ops.push(this.op3);
                }
            }
        }
        return ops;
    }

    toJson() {
        var ops = [];

    }

    toBinary() {

    }

    toString() {
        if(!this.op2)
            return OPERATOR[this.operator] + (this.op1 ? ' ' + this.op1.toString() : '');

        return OPERATOR[this.operator] +
            (this.op1 ? ' ' + this.op1.toString() : '') +
            (this.op2 ? ', ' + this.op2.toString() : '') +
            (this.op3 ? ', ' + this.op3.toString() : '');

        // return (this.op1 ? this.op1.toString() + ' = ' : '') + OPERATOR[this.operator] +
        //     (this.op2 ? ' ' + this.op2.toString() : '') + (this.op3 ? ', ' + this.op3.toString() : '');
    }
}


export class Assign extends Instruction {
    operator = OPERATOR.Assign;

    toString() {
        return this.op1.toString() + ' = ' + this.op2.toString();
    }
}


// Terminator instructions generate Control Flow Graph.
export class Terminator extends Instruction {}


export class Br extends Terminator {
    operator = OPERATOR.Br;

    constructor(test: op.OperandVariable, ifTrueLbl: op.OperandLabel, ifFalseLbl: op.OperandLabel) {
        super(test, ifTrueLbl, ifFalseLbl);
    }
}


export class Jmp extends Terminator {
    operator = OPERATOR.Jmp;
    op1: op.OperandLabel;
}

export class Ret extends Terminator {
    operator = OPERATOR.Ret;
}



export abstract class Binary extends Instruction {
    toString() {
        return (this.op1 ? this.op1.toString() + ' = ' : '') + OPERATOR[this.operator] +
            (this.op2 ? ' ' + this.op2.toString() : '') + (this.op3 ? ', ' + this.op3.toString() : '');
    }
}


function toStringBinArithmetic(ins: Binary, operator: string) {
    return ins.op1.toString() + ' = ' + ins.op2.toString() + ' ' + operator + ' ' + ins.op3.toString();
}

export class Add extends Binary {
    operator = OPERATOR.Add;

    toString() {
        return toStringBinArithmetic(this, '+');
    }
}

export class Sub extends Binary {
    operator = OPERATOR.Sub;

    toString() {
        return toStringBinArithmetic(this, '-');
    }
}

export class Mul extends Binary {
    operator = OPERATOR.Mul;

    toString() {
        return toStringBinArithmetic(this, '*');
    }
}

export class UDiv extends Binary {
    operator = OPERATOR.UDiv;

    toString() {
        return toStringBinArithmetic(this, 'u/');
    }
}

export class SDiv extends Binary {
    operator = OPERATOR.SDiv;

    toString() {
        return toStringBinArithmetic(this, 's/');
    }
}

export class URem extends Binary {
    operator = OPERATOR.URem;

    toString() {
        return toStringBinArithmetic(this, 'u%');
    }
}

export class SRem extends Binary {
    operator = OPERATOR.SRem;

    toString() {
        return toStringBinArithmetic(this, 's%');
    }
}



export class Shl extends Binary {
    operator = OPERATOR.Shl;

    toString() {
        return toStringBinArithmetic(this, '<<');
    }
}

export class LShr extends Binary {
    operator = OPERATOR.LShr;

    toString() {
        return toStringBinArithmetic(this, 'l>>');
    }
}

export class AShr extends Binary {
    operator = OPERATOR.AShr;


    toString() {
        return toStringBinArithmetic(this, 'a>>');
    }
}

export class And extends Binary {
    operator = OPERATOR.And;

    toString() {
        return toStringBinArithmetic(this, '&');
    }
}

export class Or extends Binary {
    operator = OPERATOR.Or;

    toString() {
        return toStringBinArithmetic(this, '|');
    }
}

export class Xor extends Binary {
    operator = OPERATOR.Xor;

    toString() {
        return toStringBinArithmetic(this, '^');
    }
}



export class Alloc extends Instruction {
    operator = OPERATOR.Alloc;
    type: Type;

    constructor(ptr: op.Operand, ptrType: Type) {
        super(ptr);
        this.type = ptrType;
    }

    toString() {
        return this.op1.toString() + ' = ' + OPERATOR[this.operator] + ' ' + this.type.toString();
    }
}

export class Load extends Instruction {
    operator = OPERATOR.Load;
    type: Type;

    constructor(val: op.Operand, ptr: op.Operand, valueType: Type) {
        super(val, ptr);
        this.type = valueType;
    }

    toString() {
        return this.op1.toString() + ' = ' +
            OPERATOR[this.operator] + ' ' + this.type.toString() + ' ' + this.op2.toString();
    }
}

export class Store extends Instruction {
    operator = OPERATOR.Store;
}


export abstract class Cast extends Instruction {
    toType: Type;

    constructor(op1: op.Operand, op2: op.Operand, toType: Type) {
        super(op1, op2);
        this.toType = toType;
    }

    toString() {
        return (this.op1 ? this.op1.toString() + ' = ' : '') + OPERATOR[this.operator] +
            (this.op2 ? ' ' + this.op2.toString() : '') + (this.op3 ? ', ' + this.op3.toString() : '');
    }
}

export class Trunc extends Cast {
    operator = OPERATOR.Trunc;
}

export class ZExt extends Cast {
    operator = OPERATOR.ZExt;
}

export class SExt extends Cast {
    operator = OPERATOR.SExt;
}

export class PtrToInt extends Cast {
    operator = OPERATOR.PtrToInt;
}

export class IntToPtr extends Cast {
    operator = OPERATOR.IntToPtr;
}

export class Bitcast extends Cast {
    operator = OPERATOR.Bitcast;
}


export enum CONDITION {
    EQ,     // equal, JE
    NE,     // not equal, JNE

    UGT,    // unsigned greater than, JA
    UGE,    // unsigned greater or equal, JAE
    ULT,    // unsigned less than, JB
    ULE,    // unsigned less or equal, JBE

    SGT,    // signed greater than, JG
    SGE,    // signed greater or equal, JGE
    SLT,    // signed less than, JL
    SLE,    // signed less or equal, JLE
}

export class Cmp extends Instruction {
    operator = OPERATOR.Cmp;
    condition: CONDITION;

    constructor(resBool: op.OperandVariable, op2: op.Operand, op3: op.Operand, condition: CONDITION) {
        super(resBool, op2, op3);
        this.condition = condition;
    }

    toString() {
        return `${this.op1.toString()} = Cmp.${CONDITION[this.condition]} ${this.op2.toString()}, ${this.op3.toString()}`;
    }
}

export class Call extends Instruction {
    operator = OPERATOR.Call;

    // constructor() {
    //
    // }
}


// Inline assembly.
export class Asm extends Instruction {
    tpl;

    constructor(tpl) {
        super();
        this.tpl = tpl;
    }

    toString() {
        var list = [];

        var probe: any = (mnemonic, operands) => {
            var opList = [];
            if(operands) {
                for (var op of operands) opList.push(op.toString());
            }
            list.push(mnemonic + (opList.length ? ' ' + opList.join(', ') : ''));
        };

        probe.r = (rname, index) => {
            return {
                toString: () => rname,
            };
        };

        this.tpl(probe);
        return list.join('\n');
    }
}


export class Label extends Instruction {
    operator = OPERATOR.Label;

    toString() {
        return this.op1.toString() + ':';
    }
}

import * as func from './function';
import * as operand from './operand';


export abstract class Instruction {

    // Function this instruction belongs to.
    func: func.Function;
    // pos: number; // Instruction's position inside the function.

    // Resulting operand that this instruction generated or updated.
    op1: operand.Operand;

    // Optional two operands.
    op2: operand.Operand;
    op3: operand.Operand;

    // Next and previous instructions in the function.
    next: Instruction;
    previous: Instruction;

    constructor(op1: operand.Operand, op2: operand.Operand = null, op3: operand.Operand = null) {
        this.op1 = op1;
        this.op2 = op2;
        this.op3 = op3;

        // All arithmetic operations defined as:
        // op1 = op2 + op3
        // So we "generate" op1 by this instruction:
        if(this.op1) this.op1.applyInstruction(this);
    }
}

// Used as starting point of a function, this instruction `creates` function arguments.
export class InsStartFunction extends Instruction {
    static create(f: func.Function) {
        var ins = new InsStartFunction(null);
        ins.func = f;
        return ins;
    }
}

// Defines a new operand.
export class InsDefine extends Instruction {}

// Creates a new operand that will be used as a label.
export class InsLabel extends Instruction {
    op1: operand.OperandLabel;

    constructor(label: operand.OperandLabel) {
        super(label);
    }
}

// Call another function.
export class InsCall extends Instruction {}

// Addition operation.
export class InsAdd extends Instruction {}

// Multiplication.
export class InsMultiply extends Instruction {}

// Branch if `true` to an operand used as label.
export class InsBranchIf extends Instruction {}


// ## Hardware Instructions

// Call CPU interrupt.
export class InsInterrupt extends Instruction {}





export class InsMov extends Instruction {

}



export class InsNeg extends Instruction {

}


export class InsStore extends Instruction {

}


export class InsGoto extends Instruction {

}


export class InsJumpIfPositive extends Instruction {

    static create(op: operand.Operand, instruction: Instruction) {
        var ins = new InsJumpIfPositive(op);
        ins.jumpTo = instruction;
        return ins;
    }

    jumpTo: Instruction;
}










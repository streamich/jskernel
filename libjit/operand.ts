import * as func from './function';
import * as instruction from './instruction';


export abstract class Operand {

    static counter = 0;
    
    id = Operand.counter++;

    // Instruction that created this operand.
    // Should not be empty, function argument operands point to `instruction.InsStartFunction`.
    instructionCreated: instruction.Instruction;

    // Instruction where this operand was last modified.
    instructionLastModified: instruction.Instruction;

    value: any = 0;

    applyInstruction(ins: instruction.Instruction) {
        this.instructionLastModified = ins;
        if(!this.instructionCreated) this.instructionCreated = ins;
    }
}

// Integer value.
export class OperandValue extends Operand {
    static create(value: number) {
        var op = new OperandValue;
        op.value = value;
        return op;
    }
}

// Label created by `instruction.InsLabel`.
export class OperandLabel extends Operand {}

// Operand that allows to modify memory.
export class OperandMemory extends Operand {
    address = 0;
}






// export const enum REG {
//     R1,
//     R2,
//     SP,
// }
//
//
// export class OpReg extends Operand {
//     id: REG;
//
//     static create(id: REG) {
//         var reg = new OpReg;
//         reg.id = id;
//         return reg;
//     }
// }
//
//
// export class OpMem extends Operand {
//     address = 0;
// }
//

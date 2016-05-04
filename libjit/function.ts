import * as instruction from './instruction';
import * as operand from './operand';


export class Function {

    // instructions: instruction.Instruction[] = [];

    // First instruction.
    start: instruction.Instruction = instruction.InsStartFunction.create(this);

    // Last instruction.
    end: instruction.Instruction = this.start;

    // Arguments provided to function when its called.
    args: operand.Operand[] = [];

    // Operand that this function will return.
    returnOperand: operand.Operand;

    /**
     * Get argument supplied to this function.
     * @param pos
     * @returns {Operand}
     */
    getArgument(pos: number): operand.Operand {
        var op = this.args[pos];
        if(!op) { // Check, so we can get the same argument multiple times.
            op = new operand.OperandValue;
            op.applyInstruction(this.start);
            this.args[pos] = op;
        }
        return op;
    }

    /**
     * Set return operand of this function.
     * @param op {Operand}
     */
    setReturn(op: operand.Operand) {
        this.returnOperand = op;
    }

    /**
     * Append instruction to this function.
     * @param ins {Instruction}
     * @returns {Function}
     */
    insert(ins: instruction.Instruction): this {
        // if(!ins.result) {
        //     ins.result = new operand.Operand;
        //     ins.result.generator = ins;
        // }

        // ins.pos = this.instructions.length;
        ins.func = this;

        ins.previous = this.end;
        this.end.next = ins;
        this.end = ins;
        // this.instructions.push(ins);
        return this;
    }
}


// Convenience methods for function building.
export class Composer {

    func: Function;

    constructor(func: Function) {
        this.func = func;
    }

    // Print the definition of the function.
    print() {
        var args = [];
        for(var op of this.func.args) {
            args.push(`[${op.id}]: ${op.value}`);
        }
        console.log(args.join(', '));

        var ins = this.func.start;
        while(ins) {
            var constr = ins.constructor as any;
            console.log(constr.name +
                (ins.op1 ? `, [${ins.op1.id}]:${ins.op1.value}` : '') +
                (ins.op2 ? `, [${ins.op2.id}]:${ins.op2.value}` : '') +
                (ins.op3 ? `, [${ins.op3.id}]:${ins.op3.value}` : '')
            );
            ins = ins.next;
        }
    }

    arg(pos: number): operand.Operand {
        return this.func.getArgument(pos);
    }

    define(value: number): operand.OperandValue {
        var op = operand.OperandValue.create(value);
        this.func.insert(new instruction.InsDefine(op));
        return op;
    }

    label(): operand.OperandLabel {
        var label = new operand.OperandLabel;
        var ins = new instruction.InsLabel(label);
        this.func.insert(ins);
        return label;
    }

    returns(op: operand.Operand): this {
        this.func.setReturn(op);
        return this;
    }

    jif(condition: operand.Operand, label: operand.OperandLabel): this {
        this.func.insert(new instruction.InsBranchIf(condition, label));
        return this;
    }

    // Call another function.
    call() {}

    add(op1: operand.Operand, op2: operand.Operand|number, op3?: operand.Operand): this {
        if(typeof op2 == 'number') op2 = operand.OperandValue.create(op2 as number);
        if(!op3) op3 = op1;

        var ins = new instruction.InsAdd(op1, op2 as operand.Operand, op3);
        this.func.insert(ins);
        return this;
    }

    mul(op1: operand.Operand, op2: operand.Operand|number, op3?: operand.Operand): this {
        if(typeof op2 == 'number') op2 = operand.OperandValue.create(op2 as number);
        if(!op3) op3 = op1;

        this.func.insert(new instruction.InsMultiply(op1, op2 as operand.Operand, op3));
        return this;
    }

    neg(op1: operand.Operand, op2: operand.Operand = op1): this {
        this.func.insert(new instruction.InsNeg(op1, op2));
        return this;
    }

}

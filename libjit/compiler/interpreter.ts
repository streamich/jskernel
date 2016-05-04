import * as jit from '../libjit';


export class Interpreter {

    // Interpret instruction and return the next instruction to execute.
    interpretInstruction(ins: jit.Instruction): jit.Instruction {
        if(ins instanceof jit.InsStartFunction) {
            // no-op
        } else if(ins instanceof jit.InsDefine) {
            // no-op
        } else if(ins instanceof jit.InsLabel) {
            // no-op
        } else if(ins instanceof jit.InsAdd) {
            ins.op1.value = ins.op2.value + ins.op3.value;
        } else if(ins instanceof jit.InsMultiply) {
            ins.op1.value = ins.op2.value * ins.op3.value;
        } else if(ins instanceof jit.InsNeg) {
            ins.op1.value = -ins.op2.value;
        } else if(ins instanceof jit.InsJumpIfPositive) {
            return ins.op1.value > 0 ? ins.jumpTo : ins.next;
        } else if(ins instanceof jit.InsBranchIf) {
            var value = ins.op1.value;
            if(value) {
                var label = ins.op2;
                return label.instructionCreated;
            } else {
                return ins.next;
            }
        } else {
            var constructor = ins.constructor as any;
            throw Error(`Cannot interpret instruction: ${constructor.name}`);
        }

        return ins.next;
    }

    run(func: jit.Function, args: number[]): any {
        // Initialize args.
        for(var i = 0; i < args.length; i++) {
            var op = func.args[i];
            if(op) {
                op.value = args[i];
            } else {
                // The argument is not used in function.
            }
        }

        // Run through function's body.
        var ins = func.start;
        while(ins = this.interpretInstruction(ins));

        return func.returnOperand.value;
    }

}


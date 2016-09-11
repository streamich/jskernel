import * as tac from './tac';


export class TacInterpreter {

    evalInstruction(ins: tac.Instruction) {
        if(ins instanceof tac.AdditionInstruction) {
            if((ins.op2 instanceof tac.OperandConst) && (ins.op3 as tac.OperandConst)) {
                var op2 = ins.op2 as tac.OperandConst;
                var type = op2.type;
                return new tac.OperandConst(type, op2.value + (ins.op3 as tac.OperandConst).value);
            } else
                throw Error(`Cannot interpret instruction ${ins.toString()}`);
        } else
            throw Error(`Cannot interpret instruction ${(ins.constructor as any).name}.`);
    }

}
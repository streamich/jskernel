import * as i from './instruction';
import * as o from './operand';
import * as d from './def';


export enum MODE {
    REAL = 0,
    COMPAT,
    LONG,
}

export class Code {
    
    mode: MODE = MODE.LONG;

    protected ins: i.Instruction[] = [];

    protected ClassInstruction = i.Instruction;

    protected insert(def: d.Definition, op: i.Operands) {
        var ins = new this.ClassInstruction(def, op);
        ins.index = this.ins.length;
        this.ins.push(ins);
        return ins;
    }

    compile() {
        var code: number[] = [];
        for(var ins of this.ins) {
            ins.write(code);
        }
        return code;
    }

    push(what: o.Operand) {
        return this.insert(d.PUSH, new i.Operands(what));
    }


    pop(what: o.Operand) {
        return this.insert(d.POP, new i.Operands(what));
    }
    
    movq(dst: o.Operand, src: o.Operand) {
        return this.insert(d.MOVQ, new i.Operands(dst, src));
    }

    nop(size = 1) {

    }

    nopw() {
        return this.nop(2);
    }

    nopl() {
        return this.nop(4);
    }
}


export class FuzzyCode extends Code {
    protected ClassInstruction = i.FuzzyInstruction;

    nop(size = 1) {

    }
}

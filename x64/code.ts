import * as i from './instruction';
import * as o from './operand';
import * as d from './def';
import {Immediate} from "./instruction";


export enum MODE {
    REAL = 16,
    COMPAT,
    LONG,
}

export type TOperand = o.Operand|number|o.number64;

export class Code {
    
    mode: MODE = MODE.LONG;

    protected ins: i.Instruction[] = [];

    protected ClassInstruction = i.Instruction;

    protected insert(def: d.Definition, operands: i.Operands) {
    // protected insert(def: d.Definition, o1?: o.Operand, o2?: o.Operand, o3?: o.Operand) {
        // var ins = new this.ClassInstruction(this, def, this.createOperands(o1, o2, o3));
        var ins = new this.ClassInstruction(def, operands, this.mode);
        ins.index = this.ins.length;
        this.ins.push(ins);
        return ins;
    }

    protected createOperand(operand: TOperand): o.Operand {
        if(operand instanceof o.Operand) return operand;
        if(typeof operand === 'number') {
            var imm = new o.Constant(operand as number);
            if(imm.size < o.SIZE.DOUBLE) imm.zeroExtend(o.SIZE.DOUBLE);
            return imm;
        }
        if(operand instanceof Array) return new o.Constant(operand as o.number64);
        throw TypeError(`Not a valid TOperand type: ${operand}`);
    }

    protected createOperands(o1?: TOperand, o2?: TOperand, o3?: TOperand): i.Operands {
        if(!o1) return new i.Operands();
        else {
            var first: o.Operand, second: o.Operand, third: o.Operand;
            first = this.createOperand(o1);
            if(first instanceof o.Constant) return new i.Operands(null, null, first);
            else {
                if(!o2) return new i.Operands(first);
                else {
                    second = this.createOperand(o2);
                    if(second instanceof o.Constant) return new i.Operands(first, null, second);
                    else {
                        if(!o3) return new i.Operands(first, second);
                        else {
                            third = this.createOperand(o3);
                            if(third instanceof o.Constant) new i.Operands(first, second, third);
                            else throw TypeError('Third operand must be immediate.');
                        }
                    }
                }
            }
        }
    }

    compile() {
        var code: number[] = [];
        for(var ins of this.ins) {
            ins.write(code);
        }
        return code;
    }

    push(what: o.Operand) {
        return this.insert(d.PUSH, what);
    }


    pop(what: o.Operand) {
        return this.insert(d.POP, what);
    }
    
    movq(o1: o.Operand, o2: o.Operand) {
        return this.insert(d.MOVQ, o1, o2);
    }

    mov(o1: o.Operand, o2: o.Operand) {
        return this.movq(o1, o2);
    }

    syscall() {
        return this.insert(d.SYSCALL, new i.Operands());
    }

    add(o1: o.Operand, o2: o.Operand) {
        var ops = this.createOperands(o1, o2);
        if(!(ops.dst instanceof o.Register))
            throw TypeError(`Destination operand must be a register.`);
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


export class Code64 extends Code {
    mode = MODE.LONG;
    
    incq(operand: o.Register|o.Memory) {
        return this.insert(new d.Definition({op: 0xFF, opreg: 0b000}), this.createOperands(operand));
    }

    decq(operand: o.Register|o.Memory) {
        return this.insert(new d.Definition({op: 0xFF, opreg: 0b001}), this.createOperands(operand));
    }
}


export class FuzzyCode64 extends Code64 {
    protected ClassInstruction = i.FuzzyInstruction;

    nop(size = 1) {

    }
}

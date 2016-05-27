import * as i from './instruction';
import * as o from './operand';
import * as d from './def';
import {number64} from './operand';


export enum MODE {
    REAL = 16,
    COMPAT,
    LONG,
}


export abstract class Code {
    
    mode: MODE = MODE.LONG;

    protected instructions: (i.CodeElement)[] = [];

    protected ClassInstruction = i.Instruction;

    protected ins(def: d.Definition, operands: i.Operands): i.Instruction {
        var ins = new this.ClassInstruction(def, operands);
        ins.create();
        ins.index = this.ins.length;
        this.instructions.push(ins);
        return ins;
    }

    protected toRegOrMem(operand: o.Register|o.Memory|number|number64): o.Register|o.Memory {
        if(operand instanceof o.Register) return operand;
        if(operand instanceof o.Memory) return operand;

        // Displacement is up to 4 bytes in size, and 8 bytes for some specific MOV instructions, AMD64 Vol.2 p.24:
        //
        // > The size of a displacement is 1, 2, or 4 bytes.
        //
        // > Also, in 64-bit mode, support is provided for some 64-bit displacement
        // > and immediate forms of the MOV instruction. See “Immediate Operand Size” in Volume 1 for more
        // > information on this.
        if(typeof operand === 'number')
            return (new o.Memory).disp(operand as number);
        else if((operand instanceof Array) && (operand.length == 2))
            return (new o.Memory).disp(operand as number64);
        else
            throw TypeError('Displacement value must be of type number or number64.');
    }

    protected insZeroOperands(def: d.Definition): i.Instruction {
        return this.ins(def, this.createOperands());
    }

    protected insImmediate(def: d.Definition, num: number|number64, signed = true): i.Instruction {
        var imm = new o.ImmediateValue(num, signed);
        return this.ins(def, this.createOperands(null, null, imm));
    }

    protected insOneOperand(def: d.Definition, dst: o.Register|o.Memory|number|number64, num: number|number64 = null): i.Instruction {
        var disp = num === null ? null : new o.DisplacementValue(num);
        return this.ins(def, this.createOperands(dst, null, disp));
    }

    protected insTwoOperands(def: d.Definition, dst: o.Register|o.Memory|number, src: o.Register|o.Memory|number, num: number|number64 = null): i.Instruction {
        var imm = num === null ? null : new o.ImmediateValue(num);
        return this.ins(def, this.createOperands(dst, src, imm));
    }

    // protected createOperand(operand: TOperand): o.Operand {
    //     if(operand instanceof o.Operand) return operand;
    //     if(typeof operand === 'number') {
    //         var imm = new o.Constant(operand as number);
    //         if(imm.size < o.SIZE.DOUBLE) imm.zeroExtend(o.SIZE.DOUBLE);
    //         return imm;
    //     }
    //     if(operand instanceof Array) return new o.Constant(operand as o.number64);
    //     throw TypeError(`Not a valid TOperand type: ${operand}`);
    // }

    protected createOperands(dst: o.Register|o.Memory|number|number64 = null, src: o.Register|o.Memory|number = null, imm: o.Constant = null): i.Operands {
        var xdst: o.Register|o.Memory = null;
        var xsrc: o.Register|o.Memory = null;
        if(dst) {
            xdst = this.toRegOrMem(dst);
            if(!(xdst instanceof o.Register) && !(xdst instanceof o.Memory))
                throw TypeError('Destination operand must be of type Register or Memory.');
        }
        if(src) {
            xsrc = this.toRegOrMem(src);
            if(!(xsrc instanceof o.Register) && !(xsrc instanceof o.Memory))
                throw TypeError('Source operand must be of type Register or Memory.');
        }
        if(imm && !(imm instanceof o.Constant))
            throw TypeError('Immediate operand must be of type Constant.');
        return new i.Operands(xdst, xsrc, imm);
    }

    label(name: string): i.Label {
        if((typeof name !== 'string') || !name)
            throw TypeError('Label name must be a non-empty string.');
        var label = new i.Label(name);

        this.instructions.push(label);
        return label;
    }

    compile() {
        var code: number[] = [];
        for(var ins of this.instructions)
            if(ins instanceof i.Instruction)
                (ins as i.Instruction).write(code);
        return code;
    }

    toString() {
        return this.instructions.map((ins) => { return ins.toString(); }).join('\n');
    }
}

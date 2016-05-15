import {Encoder} from './encoder';
import * as i from './instruction';
import * as o from './operand';
import * as d from './def';


export class Compiler {

    encoder = new Encoder;

    // code: number[] = [];

    ins: i.Instruction[] = [];

    protected insert(def: d.Definition, op: i.Operands) {
        var ins = this.encoder.createInstruction(def, op);
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

    // write(writer) {
    //     var pos = this.code.length;
    //     writer.write(this.code);
    //     return pos;
    // }

    push(what: o.Operand) {
        return this.insert(d.PUSH, new i.Operands(what));
    }


    pop(what: o.Operand) {
        return this.insert(d.POP, new i.Operands(what));
    }
    
    movq(dst: o.Operand, src: o.Operand) {
        return this.insert(d.MOVQ, new i.Operands(dst, src));
    }

}

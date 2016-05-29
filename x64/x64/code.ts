import * as code from '../x86/code';
import * as o from '../x86/operand';
import * as d from '../x86/def';
import {Instruction} from './instruction';
import * as t from './table';


const table = new d.DefTable(t.table, t.defaults);
export type Operand = o.TUserInterfaceOperand;


export class Code extends code.Code {
    protected ClassInstruction = Instruction;

    protected insTable(group: string, ops: o.TUserInterfaceOperand[] = [], size: o.SIZE = this.operandSize): Instruction {
        return super.insTable(group, ops, size) as Instruction;
    }

    operandSize = o.SIZE.DOUBLE;
    addressSize = o.SIZE.QUAD;

    table: d.DefTable = table;

    addq(dst: Operand, src: Operand) {
        return this.insTable('add', [dst, src], o.SIZE.QUAD);
    }

    inc(dst: Operand): Instruction {
        return this.insTable('inc', [dst]);
    }

    incq(dst: Operand): Instruction {
        return this.insTable('inc', [dst], o.SIZE.QUAD);
    }

    decq(dst: Operand): Instruction {
        return this.insTable('dec', [dst], o.SIZE.QUAD);
    }

    movq(dst: Operand, src: Operand): Instruction {
        return this.insTable('mov', [dst, src], o.SIZE.QUAD);
    }

    int(num: number): Instruction {
        if(typeof num !== 'number')
            throw TypeError('INT argument must be of type number.');

        return this.insTable('int', [new o.Immediate8(num, false)]);
    }

    syscall(): Instruction {
        return this.insTable('syscall');
    }

    sysenter(): Instruction {
        return this.insTable('sysenter');
    }

    sysexit(): Instruction {
        return this.insTable('sysexit');
    }

    ret(bytes?: number): Instruction {
        return this.insTable('ret', bytes ? [new o.Immediate16(bytes)] : [])
    }

    retq(bytes?: number) {
        this.ret(bytes);
    }

}

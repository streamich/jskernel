import * as code from '../x86/code';
import * as o from '../x86/operand';
import * as d from '../x86/def';
import {Instruction} from './instruction';
import * as t from './table';


export var table = new d.DefTable(t.table, t.defaults);
export type Operand = o.TUserInterfaceOperand;


export class Code extends code.Code {
    protected ClassInstruction = Instruction;

    protected insTable(group: string, ops: o.TUserInterfaceOperand[] = []): Instruction {
        return super.insTable(group, ops) as Instruction;
    }

    addressSize = o.SIZE.QUAD;

    table: d.DefTable = table;

    incq(dst: Operand): Instruction {
        return this.insTable('inc', [dst]);
    }

    decq(dst: Operand): Instruction {
        return this.insTable('dec', [dst]);
    }

    movq(dst: Operand, src: Operand): Instruction {
        return this.insTable('mov', [dst, src]);
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
}

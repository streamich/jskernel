import * as t from './table';
import * as o from './operand';
import {extend} from '../util';


const Immediates = [o.Immediate, o.Immediate8, o.Immediate16, o.Immediate32, o.Immediate64];


export class Def {
    opcode: number;
    opreg: number;
    mnemonic: string;
    operands: any[];
    operandSize: number;
    lock: boolean;
    regInOp: boolean;
    opcodeDirectionBit: boolean;
    mandatoryRex: boolean;

    constructor(def: t.Definition) {
        this.opcode             = def.o;
        this.opreg              = def.or;
        this.mnemonic           = def.mn;
        this.operandSize        = def.s;
        this.lock               = def.lock;
        this.regInOp            = def.r;
        this.opcodeDirectionBit = def.dbit;
        this.mandatoryRex       = def.rex;

        this.operands = [];
        if(def.ops && def.ops.length) {
            for(var operand of def.ops) {
                if(!(operand instanceof Array)) operand = [operand];
                this.operands.push(operand);
            }
        }
    }

    protected validateOperandDefinitions(definitions: any[], target: o.Operand) {
        for(var def of definitions) {
            if(typeof def === 'object') { // Object: rax, rbx, r8, etc...
                if(def === target) return true;
            } else if(typeof def === 'function') { // Class: o.Register, o.Memory, etc...
                if(Immediates.indexOf(def) > -1) {
                    if(target instanceof o.Immediate) return true;
                } else {
                    if(target instanceof def) return true;
                }
            }
        }
        return false;
    }

    validateOperands(operands: o.Operands) {
        if(this.operands.length !== operands.list.length)
            return false;

        for(var i = 0; i < operands.list.length; i++) {
            var is_valid = this.validateOperandDefinitions(this.operands[i], operands.list[i]);
            if(!is_valid) return false;
        }
        return true;
    }

    getImmediateClass(): typeof o.Immediate {
        for(var operand of this.operands) {
            for(var type of operand) {
                if(Immediates.indexOf(type) > -1) return type;
            }
        }
        return null;
    }
}


export class DefGroup {

    name: string = '';

    defs: Def[] = [];

    constructor(name: string, defs: t.Definition[], defaults: t.Definition) {
        this.name = name;
        var [group_defaults, ...definitions] = defs;

        // If only one object provided, we treat it as instruction definition rather then
        // as group defaults.
        if(!definitions.length) definitions = [group_defaults];

        // Mnemonic.
        if(!group_defaults.mn) group_defaults.mn = name;

        for(var definition of definitions)
            this.defs.push(new Def(extend<any>({}, defaults, group_defaults, definition)));
    }

    find(operands: o.Operands, size: o.SIZE = 0): Def {
        for(var def of this.defs) {
            if(def.validateOperands(operands)) {
                if(!size) return def;
                else if(size === def.operandSize) return def;
            }
        }
        return null;
    }
}


export class DefTable {

    groups: {[s: string]: DefGroup;}|any = {};
    
    constructor(table: t.TableDefinition, defaults: t.Definition) {
        for(var name in table) {
            var group = new DefGroup(name, table[name], defaults);
            this.groups[name] = group;
        }
    }

    find(name: string, operands: o.Operands, size: o.SIZE = 0): Def {
        var group: DefGroup = this.groups[name] as DefGroup;
        return group.find(operands);
    }
}

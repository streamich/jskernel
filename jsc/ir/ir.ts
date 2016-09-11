import {Type, t} from "./type";
import * as op from './operand';
import * as ins from './ins';



export class LocationActivationRecord extends op.Location {
    id: number = 0;

    constructor(id: number) {
        super();
        this.id = id;
    }

    toString() {
        return 'arg' + this.id;
    }
}


export class VirtualRegister extends op.Location {
    id: number;

    constructor(id: number) {
        super();
        this.id = id;
    }

    toString() {
        return 'v' + this.id;
    }
}


export class VirtualRegisterFile {

    length = 0;

    map: {[s: string]: VirtualRegister} = {};

    alloc(): VirtualRegister {
        var vreg = new VirtualRegister(this.length);
        this.length++;
        return vreg;
    }
}


// Block of `Instruction`s.
export class Block {

    // First instruction.
    start: ins.Instruction = null;

    // Last instruction.
    end: ins.Instruction = null;

    push(instruction: ins.Instruction) {
        if (!this.start) {
            this.start = instruction;
            this.end = instruction;
        } else {
            instruction.prev = this.end;
            this.end = this.end.next = instruction;
        }
    }

    toString() {
        var list = [];
        var curr = this.start;
        while (curr) {
            list.push(curr.toString());
            curr = curr.next;
        }
        return list.join('\n');
    }
}


export class VariableFile {
    map: {[s: string]: op.OperandVariable} = {};

    length = 0;

    getOrCreate(type: Type, name?: string) {
        if(!name) return this.create(type, name);

        var operand = this.get(name);
        if(operand) return operand;
        else return this.create(type, name);
    }

    create(type: Type, name?: string): op.OperandVariable {
        var operand = new op.OperandVariable(type, name);
        this.set(operand);
        return operand;
    }

    set(variable: op.OperandVariable) {
        var name = variable.getName();
        if(!this.map[name]) this.length++;
        this.map[name] = variable;
    }

    get(name: string) {
        return this.map[name];
    }

    del(name: string) {
        if(this.map[name]) {
            delete this.map[name];
            this.length--;
        }
    }
}

export class LabelMap {
    map: {[s: string]: op.OperandLabel} = {};

    length = 0;

    getOrCreate(name: string) {
        var lbl = this.get(name);
        if(lbl) return lbl;
        else return this.create(name);
    }

    create(name?: string): op.OperandLabel {
        var lbl = new op.OperandLabel(name);
        this.set(lbl);
        return lbl;
    }

    set(lbl: op.OperandLabel) {
        var name = lbl.getName();
        if(!this.map[name]) this.length++;
        this.map[name] = lbl;
    }

    get(name: string) {
        return this.map[name];
    }

    del(name: string) {
        if(this.map[name]) {
            delete this.map[name];
            this.length--;
        }
    }
}


export interface IFunctionAttributes {
    // Stack alignment, power of 2.
    alignStack?: number,

    // Do not inline.
    noinline?: boolean,

    // Try to inline.
    inline?: boolean,

    // Always try to inline even if function larger than global inline size parameters.
    alwaysInline?: boolean,

    // Whether function has variable number of args.
    isVariadic?: boolean,
}

export class Function {

    static nameId = 0;

    protected name: string = null;

    type: Type; // Return type.
    args: op.OperandVariable[];
    vars: VariableFile = new VariableFile;
    vregs: VirtualRegisterFile = new VirtualRegisterFile;
    block: Block = new Block;
    attr: IFunctionAttributes;
    labels: LabelMap = new LabelMap;

    constructor(type: Type = t.void, args: op.OperandVariable[] = [], name: string = null, attr: IFunctionAttributes = {}) {
        this.type = type;
        this.args = args;
        this.name = name;
        this.attr = attr;

        for(var arg of this.args) {
            this.vars.set(arg);
        }
    }

    createVariable(type: Type, name?: string): op.OperandVariable {
        var operand = this.vars.create(type, name);
        // var location = this.vregs.alloc();
        // operand.setLocation(location);
        return operand;
    }

    assignVirtualRegisters() {
        // for(var arg of this.args) {
        //     arg.setLocation(new LocationActivationRecord(0));
        // }
        for (var varname in this.vars.map) {
            var varop = this.vars.map[varname];
            if(!varop.location)
                varop.setLocation(this.vregs.alloc());
        }
    }

    pushInstruction(instruction: ins.Instruction): ins.Instruction {
        // if (instruction instanceof ins.) {
        //     this.vars.set(instruction.op1 as irop.OperandVariable);
        // }
        this.block.push(instruction);
        return instruction;
    }

    getName() {
        if (!this.name) {
            this.name = '@' + (Function.nameId++);
        }
        return this.name;
    }

    toString() {
        var block = this.block.toString();
        block = '    ' + block.replace(/\n/g, '\n    ');
        var args = [];
        for(var arg of this.args) args.push(arg.toString());
        return `${this.type.toString()} ${this.getName()}(${args.join(', ')}) {\n${block}\n}`;
    }
}


export class Unit {
    functions: Function [] = [];

    pushFunction(func: Function) {
        this.functions.push(func);
    }

    toString() {
        var list = [];
        for (var f of this.functions) {
            list.push(f.toString());
        }
        return list.join('\n\n');
    }
}

import {Type, t} from './type';


// Location where Operand is stored.
export abstract class Location {
    toString() {
        return '[unallocated]';
    }
}


export class Operand {
    static cid = 0;

    cid = Operand.cid++;

    type: Type;

    constructor(type: Type) {
        this.type = type;
    }

    isConst() {
        return this instanceof OperandConst;
    }

    toString() {
        return this.type.toString() + ' [operand]';
    }
}


export class OperandConst extends Operand {
    value: number;

    constructor(type: Type, value: number) {
        super(type);
        this.value = value;
    }

    toString() {
        return this.type.toString() + ' ' + String(this.value);
    }
}


export class OperandLabel extends Operand {
    static nameId = 0;

    // Native label object when generating code.
    native: any;

    name: string;

    constructor(name?: string) {
        super(t.label);
        this.name = name;
    }

    getName() {
        if (!this.name) {
            this.name = String(OperandLabel.nameId++);
        }
        return this.name;
    }

    toString() {
        return this.type.toString() + ' @' + this.getName();
    }
}


export class OperandVariable extends Operand {

    static nameId = 0;

    name: string;

    location: Location = null;

    isLocal = true;

    constructor(type: Type, name?: string) {
        super(type);
        if (name) this.name = name;
    }

    setLocation(location: Location) {
        this.location = location;
    }

    getName() {
        if (!this.name) {
            this.name = String(OperandVariable.nameId++);
        }
        return this.name;
    }

    toString() {
        // var locationStr = this.location ? '(' + this.location.toString() + ')' : '';
        var locationStr = this.location ? this.location.toString() : '';
        if(locationStr) return this.type.toString() + ' ' + locationStr;
        else return this.type.toString() + ' ' + (this.isLocal ? '%' : '@') + this.getName();
        // else return this.type.toString() + ' ' + (this.isLocal ? '%' : '@') + this.getName() + locationStr;
    }
}

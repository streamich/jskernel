import {} from './instruction';


export const enum SIZE {
    BYTE = 8,
    WORD = 16,
    DOUBLE = 32,
    QUAD = 64,
}


// # General operand used in our assembly "language".

export abstract class Operand {
    toString(): string {
        return '[operand]';
    }
}


// ## Constant
//
// Constants are everything where we directly type in a `number` value.
export class Constant extends Operand {

    static sizeClass(value) {
        if((value <= 0x7f) && (value >= -0x80))             return SIZE.BYTE;
        if((value <= 0x7fff) && (value >= -0x8000))         return SIZE.WORD;
        if((value <= 0x7fffffff) && (value >= -0x80000000)) return SIZE.DOUBLE;
        return SIZE.QUAD;
    }

    // Size in bits.
    size: number = 32;

    // Each byte as a `number`.
    value: number[];

    toString() {
        return `const[${this.size}]: ${this.value}`;
    }
}

export class Displacement extends Constant {
    static SIZE = {
        DISP8:  SIZE.BYTE,
        DISP32: SIZE.DOUBLE,
    };

    size = Displacement.SIZE.DISP8;

    constructor(value: number) {
        super();
    }
}


// # Scale
//
// `Scale` used in SIB byte in two bit `SCALE` field.
export class Scale extends Operand {
    static VALUES = [1, 2, 4, 8];

    value: number;

    constructor(scale: number = 1) {
        super();
        if(Scale.VALUES.indexOf(scale) < 0)
            throw TypeError(`Scale must be one of [1, 2, 4, 8].`);
        this.value = scale;
    }

    toString() {
        return '' + this.value;
    }
}


// ## Registers
//
// `Register` represents one of `%rax`, `%rbx`, etc. registers.
export class Register extends Operand {
    name: string = 'rax';           // String 'name' of the register.
    id: number = 0;                 // Number value of register.
    size: SIZE = SIZE.QUAD;       // Size in bits
    isExtended: boolean = false;    // Whether the register is one of `%r8`, `%r9`, etc. extended registers.

    constructor(name: string, id: number, size: SIZE, extended: boolean) {
        super();
        this.name = name;
        this.id = id;
        this.size = size;
        this.isExtended = extended;
    }

    ref(): Memory {

    }

    disp(): Memory {

    }

    toString() {
        return '%' + this.name;
    }
}


// ## Memory
//
// `Memory` is RAM addresses which `Register`s can *dereference*.
export class Memory extends Operand {
    base: Register = null;
    index: Register = null;
    scale: Scale = null;
    disp: Displacement = null;

    needsSib() {
        return !!this.index || !!this.scale;
    }

    ref(): this {

        return this;
    }

    disp(value: number): this {
        this.disp = new Displacement(value);
        return this;
    }

    toString() {
        var base = this.base ? this.base.toString() : '';
        var index = this.index ? this.index.toString() : '';
        var scale = this.scale ? this.scale.toString() : '';
        var disp = this.disp ? this.disp.toString() : '';
        return `[%${base} + %{index} * ${scale} + ${disp}]`;
    }
}

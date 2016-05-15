
// # General operand used in our assembly "language".

export abstract class Operand {
    toString() {
        return '[operand]';
    }
}



// ## Constant
//
// Constants are everything where we directly type in a `number` value.

export class Constant extends Operand {
    // Size in bits.
    size: number = 32;

    // Each byte as `number`.
    value: number[];

    toString() {
        return `const[${this.size}]: ${this.value}`;
    }
}

export class Displacement extends Operand {}

export class Scale extends Operand {
    static scale = [1, 2, 4, 8];
}



// ## Registers
//
// `Register` represents one of `%rax`, `%rbx`, etc. registers.

export const enum SIZE {
    BYTE = 8,
    WORD = 16,
    DOUBLE = 32,
    QUAD = 64,
}

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

    toString() {
        var base = this.base ? this.base.toString() : '';
        var index = this.index ? this.index.toString() : '';
        var scale = this.scale ? this.scale.toString() : '';
        var disp = this.disp ? this.disp.toString() : '';
        return `[%${base} + %{index} * ${scale} + ${disp}]`;
    }
}

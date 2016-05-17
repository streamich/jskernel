import {UInt64} from './util';


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

export type number64 = [number, number];

export class Constant extends Operand {

    static sizeClass(value) {
        if((value <= 0x7f) && (value >= -0x80))             return SIZE.BYTE;
        if((value <= 0x7fff) && (value >= -0x8000))         return SIZE.WORD;
        if((value <= 0x7fffffff) && (value >= -0x80000000)) return SIZE.DOUBLE;
        return SIZE.QUAD;
    }

    // Size in bits.
    size: number = 32;

    value: number|number64 = 0;

    // Each byte as a `number` in reverse order.
    octets: number[] = [];

    constructor(value: number|number64) {
        super();
        this.Value = value;
    }

    set Value(value: number|number64) {
        if(value instanceof Array) {
            if(value.length !== 2) throw TypeError('number64 must be a 2-tuple, given: ' + value);
            this.setValue64(value as number64);
        } else if(typeof value === 'number') {
            /* JS integers are 53-bit, so split here `number`s over 32 bits into [number, number]. */
            if(Constant.sizeClass(value) === SIZE.QUAD) this.setValue64([UInt64.lo(value), UInt64.hi(value)]);
            else                                        this.setValue32(value);
        } else
            throw TypeError('Constant value must be of type number|number64.');
    }

    protected setValue32(value: number) {
        var size = Constant.sizeClass(value);
        this.size = size;
        this.value = value;
        this.octets = [];
        this.octets[0] = value & 0xFF;
        if(size > SIZE.BYTE) this.octets[1] = (value >> 8) & 0xFF;
        if(size > SIZE.WORD) {
            this.octets[2] = (value >> 16) & 0xFF;
            this.octets[3] = (value >> 24) & 0xFF;
        }
    }

    protected setValue64(value: number64) {
        this.size = 64;
        this.value = value;
        this.octets = [];
        var [lo, hi] = value;
        this.octets[0] = (lo) & 0xFF;
        this.octets[1] = (lo >> 8) & 0xFF;
        this.octets[2] = (lo >> 16) & 0xFF;
        this.octets[3] = (lo >> 24) & 0xFF;
        this.octets[4] = (hi) & 0xFF;
        this.octets[5] = (hi >> 8) & 0xFF;
        this.octets[6] = (hi >> 16) & 0xFF;
        this.octets[7] = (hi >> 24) & 0xFF;
    }

    zeroExtend(size) {
        if(this.size > size) throw Error(`Already larger than ${size} bits, cannot zero-extend.`);
        var missing_bytes = (size - this.size) / 8;
        this.size = size;
        for(var i = 0; i < missing_bytes; i++) this.octets.push(0);
    }

    toString() {
        return `const[${this.size}]: ${this.value}`;
    }
}

export class ImmediateValue extends Constant {}

export class DisplacementValue extends Constant {
    static SIZE = {
        DISP8:  SIZE.BYTE,
        DISP32: SIZE.DOUBLE,
    };

    size = DisplacementValue.SIZE.DISP8;

    constructor(value: number) {
        super(value);
    }

    protected setValue32(value: number) {
        super.setValue32(value);
        /* Make sure `Displacement` is 1 or 4 bytes, not 2. */
        if(this.size > DisplacementValue.SIZE.DISP8) this.zeroExtend(DisplacementValue.SIZE.DISP32);
    }

    protected setValue64() {
        throw TypeError(`Displacement can be only of these sizes: ${DisplacementValue.SIZE.DISP8} and ${DisplacementValue.SIZE.DISP32}.`);
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
        return (new Memory).ref(this);
    }

    disp(value: number): Memory {
        return (new Memory).ref(this).disp(value);
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
    displacement: DisplacementValue = null;

    needsSib() {
        return !!this.index || !!this.scale;
    }

    ref(base: Register): this {
        this.base = base;
        return this;
    }

    disp(value: number): this {
        this.displacement = new DisplacementValue(value);
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

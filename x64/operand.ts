import {R64, R32, R8} from './regfile';
import {UInt64} from './util';
import * as p from './parts';


export enum SIZE {
    BYTE = 8,
    WORD = 16,
    DOUBLE = 32,
    QUAD = 64,
}


// General operand used in our assembly "language".
export abstract class Operand {

    // Convenience method to get `Register` associated with `Register` or `Memory`.
    reg(): Register {
        return null;
    }

    isRegister(): boolean {
        return this instanceof Register;
    }

    isMemory(): boolean {
        return this instanceof Memory;
    }

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

    static sizeClassUnsigned(value) {
        if(value <= 0xff)           return SIZE.BYTE;
        if(value <= 0xffff)         return SIZE.WORD;
        if(value <= 0xffffffff)     return SIZE.DOUBLE;
        return SIZE.QUAD;
    }

    // Size in bits.
    size: number = 0;

    value: number|number64 = 0;

    // Each byte as a `number` in reverse order.
    octets: number[] = [];

    signed: boolean = true;

    constructor(value: number|number64, signed = true) {
        super();
        this.signed = signed;
        this.Value = value;
    }

    set Value(value: number|number64) {
        if(value instanceof Array) {
            if(value.length !== 2) throw TypeError('number64 must be a 2-tuple, given: ' + value);
            this.setValue64(value as number64);
        } else if(typeof value === 'number') {
            var clazz = this.signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
            /* JS integers are 53-bit, so split here `number`s over 32 bits into [number, number]. */
            if(clazz === SIZE.QUAD) this.setValue64([UInt64.lo(value), UInt64.hi(value)]);
            else                    this.setValue32(value);
        } else
            throw TypeError('Constant value must be of type number|number64.');
    }

    protected setValue32(value: number) {
        var size = this.signed ? Constant.sizeClass(value) : Constant.sizeClassUnsigned(value);
        this.size = size;
        this.value = value;
        this.octets = [value & 0xFF];
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
        if(this.size === size) return;
        if(this.size > size) throw Error(`Already larger than ${size} bits, cannot zero-extend.`);
        var missing_bytes = (size - this.size) / 8;
        this.size = size;
        for(var i = 0; i < missing_bytes; i++) this.octets.push(0);
    }

    signExtend(size) {
        if(this.size === size) return;
        if(this.size > size) throw Error(`Already larger than ${size} bits, cannot zero-extend.`);

        // We know it is not number64, because we don't deal with number larger than 64-bit,
        // and if it was 64-bit already there would be nothing to extend.
        var value = this.value as number;

        if(size === SIZE.QUAD) {
            this.setValue64([UInt64.lo(value), UInt64.hi(value)]);
            return;
        }

        this.size = size;
        this.octets = [value & 0xFF];
        if(size > SIZE.BYTE) this.octets[1] = (value >> 8) & 0xFF;
        if(size > SIZE.WORD) {
            this.octets[2] = (value >> 16) & 0xFF;
            this.octets[3] = (value >> 24) & 0xFF;
        }
    }

    toString() {
        var str = '';
        for(var i = this.octets.length - 1; i >= 0; i--) {
            str += this.octets[i].toString(16);
        }
        return '0x' + str;
    }
}

export class ImmediateValue extends Constant {}

export class DisplacementValue extends Constant {
    static SIZE = {
        DISP8:  SIZE.BYTE,
        DISP32: SIZE.DOUBLE,
    };

    constructor(value: number|number64) {
        super(value, true);
    }

    protected setValue32(value: number) {
        super.setValue32(value);
        /* Make sure `Displacement` is 1 or 4 bytes, not 2. */
        // if(this.size > DisplacementValue.SIZE.DISP8) this.zeroExtend(DisplacementValue.SIZE.DISP32);
    }

    // protected setValue64() {
    //     throw TypeError(`Displacement can be only of these sizes: ${DisplacementValue.SIZE.DISP8} and ${DisplacementValue.SIZE.DISP32}.`);
    // }
}


// ## Registers
//
// `Register` represents one of `%rax`, `%rbx`, etc. registers.
export class Register extends Operand {
    id: number = 0;                 // Number value of register.
    size: SIZE = SIZE.QUAD;         // Size in bits

    constructor(id: number, size: SIZE) {
        super();
        this.id = id;
        this.size = size;
    }

    reg(): Register {
        return this;
    }

    ref(): Memory {
        return (new Memory).ref(this);
    }

    ind(scale_factor: number) {
        return (new Memory).ind(this, scale_factor);
    }

    disp(value: number): Memory {
        return (new Memory).ref(this).disp(value);
    }

    // Whether the register is one of `%r8`, `%r9`, etc. extended registers.
    isExtended() {
        return this.id > 0b111;
    }

    get3bitId() {
        return this.id & 0b111;
    }

    getName() {
        switch(this.size) {
            case SIZE.QUAD:     return R64[this.id];
            case SIZE.DOUBLE:   return R32[this.id];
            case SIZE.BYTE:     return R8[this.id];
            default:            return 'REG';
        }
    }

    toString() {
        return this.getName().toLowerCase();
    }
}

export class Register64 extends Register {
    constructor(id: number) {
        super(id, SIZE.QUAD);
    }
}

export class Register32 extends Register {
    constructor(id: number) {
        super(id, SIZE.DOUBLE);
    }
}

export class Register16 extends Register {
    constructor(id: number) {
        super(id, SIZE.WORD);
    }
}

export class Register8 extends Register {
    constructor(id: number) {
        super(id, SIZE.BYTE);
    }
}

export class RegisterRip extends Register64 {
    constructor() {
        super(0);
    }

    getName() {
        return 'rip';
    }
}


export var rax  = new Register64(R64.RAX);
export var rbx  = new Register64(R64.RBX);
export var rcx  = new Register64(R64.RCX);
export var rdx  = new Register64(R64.RDX);
export var rsi  = new Register64(R64.RSI);
export var rdi  = new Register64(R64.RDI);
export var rbp  = new Register64(R64.RBP);
export var rsp  = new Register64(R64.RSP);
export var r8   = new Register64(R64.R8);
export var r9   = new Register64(R64.R9);
export var r10  = new Register64(R64.R10);
export var r11  = new Register64(R64.R11);
export var r12  = new Register64(R64.R12);
export var r13  = new Register64(R64.R13);
export var r14  = new Register64(R64.R14);
export var r15  = new Register64(R64.R15);

export var rip  = new RegisterRip;


export var eax  = new Register32(R32.EAX);
export var ebx  = new Register32(R32.EBX);
export var ecx  = new Register32(R32.ECX);
export var edx  = new Register32(R32.EDX);
export var esi  = new Register32(R32.ESI);
export var edi  = new Register32(R32.EDI);
export var ebp  = new Register32(R32.EBP);
export var esp  = new Register32(R32.ESP);
export var r8d  = new Register32(R32.R8D);
export var r9d  = new Register32(R32.R9D);
export var r10d = new Register32(R32.R10D);
export var r11d = new Register32(R32.R11D);
export var r12d = new Register32(R32.R12D);
export var r13d = new Register32(R32.R13D);
export var r14d = new Register32(R32.R14D);
export var r15d = new Register32(R32.R15D);


export var al   = new Register8(R8.AL);
export var bl   = new Register8(R8.BL);
export var cl   = new Register8(R8.CL);
export var dl   = new Register8(R8.DL);
export var sil  = new Register8(R8.SIL);
export var dil  = new Register8(R8.DIL);
export var bpl  = new Register8(R8.BPL);
export var spl  = new Register8(R8.SPL);
export var r8b  = new Register8(R8.R8B);
export var r9b  = new Register8(R8.R9B);
export var r10b = new Register8(R8.R10B);
export var r11b = new Register8(R8.R11B);
export var r12b = new Register8(R8.R12B);
export var r13b = new Register8(R8.R13B);
export var r14b = new Register8(R8.R14B);
export var r15b = new Register8(R8.R15B);


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


// ## Memory
//
// `Memory` is RAM addresses which `Register`s can *dereference*.
export class Memory extends Operand {
    base: Register = null;
    index: Register = null;
    scale: Scale = null;
    displacement: DisplacementValue = null;

    reg(): Register {
        if(this.base) return this.base;
        if(this.index) return this.index;
        // throw Error('No backing register.');
        return null;
    }

    needsSib() {
        return !!this.index || !!this.scale;
    }

    ref(base: Register): this {
        // RBP, EBP etc.. always need displacement for ModRM and SIB bytes.
        var is_ebp = (R64.RBP & 0b111) === base.get3bitId();
        if(is_ebp && !this.displacement)
            this.displacement = new DisplacementValue(0);

        this.base = base;
        return this;
    }

    ind(index: Register, scale_factor: number = 1): this {
        if(!(index instanceof Register))
            throw TypeError('Index must by of type Register.');

        var esp = (R64.RSP & 0b111);
        if(index.get3bitId() === esp)
            throw TypeError('%esp, %rsp or other 0b100 registers cannot be used as addressing index.');

        this.index = index;
        this.scale = new Scale(scale_factor);
        return this;
    }

    disp(value: number|number64): this {
        this.displacement = new DisplacementValue(value);
        return this;
    }

    toString() {
        var parts = [];
        if(this.base) parts.push(this.base.toString());
        if(this.index) parts.push(this.index.toString() + ' * ' + this.scale.toString());
        if(this.displacement) parts.push(this.displacement.toString());

        return `[${parts.join(' + ')}]`;
    }
}

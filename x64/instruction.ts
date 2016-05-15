import {extend} from './util';
import {Operand, Constant, Register, Memory} from './operand';
import {Definition} from './def';


export abstract class InstructionPart {
    ins: Instruction;
    abstract write(arr: number[]): number[];
}

export abstract class Prefix extends InstructionPart {}

export class PrefixRex extends Prefix {
    W: number; // 0 or 1
    R: number; // 0 or 1
    X: number; // 0 or 1
    B: number; // 0 or 1

    constructor(W, R, X, B) {
        super();
        this.W = W;
        this.R = R;
        this.X = X;
        this.B = B;
    }

    write(arr: number[]): number[] {
        if(this.W || this.R || this.X || this.B)
            arr.push(0b01000000 | (this.W << 3) + (this.R << 2) + (this.X << 1) + this.B);
        return arr;
    }
}

export const OP_DIRECTION_MASK = 0b11111101;
export const enum OP_DIRECTION {
    REG_IS_SRC = 0b00,
    REG_IS_DST = 0b10,
}

export class Opcode extends InstructionPart {

    // Primary op-code of the instructions. Often the lower 2 or 3 bits of the
    // instruction op-code may be set independently.
    //
    // `d` and `s` bits, specify: d - direction of the instruction, and s - size of the instruction.
    //  - **s**
    //      - 1 -- word size
    //      - 0 -- byte size
    //  - **d**
    //      - 1 -- register is destination
    //      - 0 -- register is source
    //
    //     76543210
    //     ......ds
    //
    // Lower 3 bits may also be used to encode register for some instructions. We set
    // `.regInOp = true` if that is the case.
    //
    //     76543210
    //     .....000 = RAX
    op: number = 0;

    // Wheter lower 3 bits of op-code should hold register address.
    regInOp: boolean = false;

    // Wheter register is destination of this instruction, on false register is
    // the source, basically this specifies the `d` bit in op-code.
    regIsDest: boolean = true;

    // `s` bit encoding in op-code, which tells whether instruction operates on "words" or "bytes".
    isSizeWord: boolean = true;

    write(arr: number[]): number[] {
        arr.push(this.op);
        return arr;
    }
}


// ## Mod-R/M
//
// Mod-R/M is an optional byte after the op-code that specifies the direction
// of operation or extends the op-code.
//
//     76543210
//     .....XXX <--- R/M field: Register or Memory
//     ..XXX <------ REG field: Register or op-code extension
//     XX <--------- MOD field: mode of operation
//

// Two bits of `MOD` field in `Mod-R/M` byte.
export const enum MOD {
    INDIRECT    = 0b00,
    DISP8       = 0b01,
    DISP32      = 0b10,
    REG_TO_REG  = 0b11,
}

export class Modrm extends InstructionPart {
    mod: number     = 0;
    reg: number     = 0;
    rm: number      = 0;

    constructor(mod, reg, rm) {
        super();
        this.mod = mod;
        this.reg = reg;
        this.rm = rm;
    }

    write(arr: number[] = []): number[] {
        arr.push((this.mod << 6) | (this.reg << 3) | this.rm);
        return arr;
    }
}



// ## SIB
//
// SIB is optional byte used when dereferencing memory.

export class Sib extends InstructionPart {
    scale: number   = 0;
    index: number   = 0;
    base: number    = 0;

    constructor(scale, index, base) {
        super();
        this.scale = scale;
        this.index = index;
        this.base = base;
    }

    write(arr: number[] = []): number[] {
        arr.push((this.scale << 6) | (this.index << 3) | this.base);
        return arr;
    }
}


export class Operands {
    dst: Operand = null;    // Destination
    src: Operand = null;    // Source
    imm: Constant = null;   // Immediate

    constructor(dst = null, src = null, imm = null) {
        this.dst = dst;
        this.src = src;
        this.imm = imm;
    }
}

export class Instruction {
    def: Definition = null;
    op: Operands = null;
    parts: InstructionPart[] = [];

    // Index where instruction was inserted in `Compiler`s buffer.
    index: number = 0;

    // Byte offset of the instruction in compiled machine code.
    offset: number = 0;

    constructor(def: Definition, op: Operands) {
        this.def = def;
        this.op = op;
    }

    write(arr: number[]): number[] {
        for(var part of this.parts) part.write(arr);
        return arr;
    }
}


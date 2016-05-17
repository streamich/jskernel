import {OP, OPREG} from './opcode';
import {extend} from './util';


export interface IDefinition {
    op?: number;
    opreg?: number;
    regInOp?: boolean;
    operands?: number;
    hasImmediate?: boolean;
    immediateSizes?: number[];
    size?: number;
}

export var definitionDefaults = {
    opreg: -1,  // -1 means "does not required"
    regInOp: false,
    operands: 0,
    hasImmediate: false,
    immediateSizes: [],
    size: 64,
};

export class Definition implements IDefinition {

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
    op: number;

    // Part of the op-code that goes into the 3-bit REG field
    // of Mod-R/M byte, which is used as an extension of op-code for
    // instruction that dont use the 3 bits of REG field. Normally this
    // field is zero for most instructions.
    opreg: number; // -1 means no `opreg`

    // Wheter lower 3 bits of op-code should hold register address.
    regInOp: boolean;

    // Wheter register is destination of this instruction, on false register is
    // the source, basically this specifies the `d` bit in op-code.
    regIsDest: boolean;

    // `s` bit encoding in op-code, which tells whether instruction operates on "words" or "bytes".
    isSizeWord: boolean;

    // Whether `REX` prefix is mandatory for this instruction.
    mandatoryRex: boolean;

    // Whether this instruction supports *immediate* value.
    hasImmediate: boolean;

    immediateSizes: number[];

    operands: number;

    size: number;

    // constructor(op: number, rex = false, reg_in_op = false, opreg = -1, imm = false, reg_is_dst = true, word_size = true) {
    //     this.op = op;
    //     this.opreg = opreg;
    //     this.regInOp = reg_in_op;
    //     this.regIsDest = reg_is_dst;
    //     this.isSizeWord = word_size;
    //     this.mandatoryRex = rex;
    //     this.hasImmediate = imm;
    // }

    constructor(defs: IDefinition) {
        extend<any>(this, definitionDefaults, defs);
    }
}

//                                       Op-code    REX     reg in op   opreg       immediate   reg is dst  word_size
// ______________________________________|__________|_______|___________|___________|___________|___________|___________________
// export const PUSH       = new Definition(OP.PUSH,   false,  true,       -1,         false,      true,       true);
// export const POP        = new Definition(OP.POP,    false,  true);
// export const MOVQ       = new Definition(OP.MOV,    true);
// export const MOVimm     = new Definition(OP.MOVimm, false);
// export const INC        = new Definition(OP.INC,    false,  false,      OPREG.INC);
// export const DEC        = new Definition(OP.DEC,    false,  false,      OPREG.DEC);
// export const INT        = new Definition(OP.INT,    false,  false,      -1,         true,       true,       false);
// export const SYSCALL    = new Definition(OP.SYSCALL);

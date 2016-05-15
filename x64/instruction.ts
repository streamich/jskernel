import {extend} from './util';
import {Operand, Constant, Displacement, Register, Memory} from './operand';
import {Definition} from './def';
import {OP} from './opcode';


// # x86_64 Instruction
//
// Each CPU instruction is encoded in the following form, where only
// *Op-code* byte is required:
//
//     |-------------------------------------------------|--------------------------------------------|
//     |                  Instruction                    |               Next instruction             |
//     |-------------------------------------------------|--------------------------------------------|
//     |byte 1   |byte 2   |byte 3   |byte 4   |byte 5   |
//     |---------|---------|---------|---------|---------|                     ...
//     |REX      |Op-code  |Mod-R/M  |SIB      |Immediat |                     ...
//     |---------|---------|---------|---------|---------|                     ...
//     |optional |required |optional |optional |optional |
//     |-------------------------------------------------|

export abstract class InstructionPart {
    // ins: Instruction;
    abstract write(arr: number[]): number[];
}


export abstract class Prefix extends InstructionPart {}


// ## REX
//
// REX is an optional prefix used for two reasons:
//
//  1. For 64-bit instructions that require this prefix to be used.
//  2. When using extended registers: r8, r9, r10, etc..; r8d, r9d, r10d, etc...
//
// REX byte layout:
//
//     76543210
//     .1..WRXB
//     .......B <--- R/M field in Mod-R/M byte, or BASE field in SIB byte addresses one of the extended registers.
//     ......X <---- INDEX field in SIB byte addresses one of the extended registers.
//     .....R <----- REG field in Mod-R/M byte addresses one of the extended registers.
//     ....W <------ Used instruction needs REX prefix.
//     .1 <--------- 0x40 identifies the REX prefix.

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
            arr.push(0b01000000 | (this.W << 3) | (this.R << 2) | (this.X << 1) | this.B);
        return arr;
    }
}


// ## Op-code
//
// Primary op-code of the instruction. Often the lower 2 or 3 bits of the
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

export class Opcode extends InstructionPart {

    static MASK_SIZE        = 0b11111110;   // `s` bit
    static MASK_DIRECTION   = 0b11111101;   // `d` bit
    static MASK_OP          = 0b11111000;   // When register is encoded into op-code.
    static SIZE = { // `s` bit
        BYTE: 0b0,
        WORD: 0b1,
    };
    static DIRECTION = { // `d` bit
        REG_IS_SRC: 0b00,
        REG_IS_DST: 0b10,
    };

    // Main op-code value.
    op: number = 0;

    // Whether lower 3 bits of op-code should hold register address.
    regInOp: boolean = false;

    // Whether register is destination of this instruction, on false register is
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

export class Modrm extends InstructionPart {

    // Two bits of `MOD` field in `Mod-R/M` byte.
    static MOD = {
        INDIRECT:   0b00,
        DISP8:      0b01,
        DISP32:     0b10,
        REG_TO_REG: 0b11,
    };

    // When this value is encoded in R/M field, SIB byte has to follow Mod-R/M byte.
    static RM_NEEDS_SIB = 0b100;

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
// SIB (scale-index-base) is optional byte used when dereferencing memory
// with complex offset, like when you do:
//
//     mov rax, [rbp + rdx * 8]
//
// The above operation in SIB byte is encoded as follows:
//
//     rbp + rdx * 8 = BASE + INDEX * USERSCALE
//
// Where `USERSCALE` can only be 1, 2, 4 or 8; and is encoded as follows:
//
//     USERSCALE (decimal) | SCALE (binary)
//     ------------------- | --------------
//     1                   | 00
//     2                   | 01
//     4                   | 10
//     8                   | 11
//
// The layout of SIB byte:
//
//     76543210
//     .....XXX <--- BASE field: base register address
//     ..XXX <------ INDEX field: address of register used as scale
//     XX <--------- SCALE field: specifies multiple of INDEX: USERSCALE * INDEX

export class Sib extends InstructionPart {
    S: number = 0;
    I: number = 0;
    B: number = 0;

    constructor(userscale, I, B) {
        super();
        this.setScale(userscale);
        this.I = I;
        this.B = B;
    }

    setScale(userscale) {
        switch(userscale) {
            case 1: this.S = 0b00; break;
            case 2: this.S = 0b01; break;
            case 4: this.S = 0b10; break;
            case 8: this.S = 0b11; break;
            default: throw TypeError(`User scale must be on of [1, 2, 4, 8], given: ${userscale}.`);
        }
    }

    write(arr: number[] = []): number[] {
        arr.push((this.S << 6) | (this.I << 3) | this.B);
        return arr;
    }
}


// ## Immediate
//
// Immediate constant value that follows other instructio bytes.

export class Immediate extends InstructionPart {
    value: Constant;

    write(arr: number[] = []): number[] {
        arr.push(0);
        return arr;
    }
}


// Collection of operands an instruction might have. It might
// have *destination* and *source* operands and a possible *immediate* constant.
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


// ## x86_64 `Instruction`
//
// `Instruction` object is created using instruction `Definition` and `Operands` provided by the user,
// out of those `Instruction` generates `InstructionPart`s, which then can be packaged into machine
// code using `.write()` method.
export class Instruction {
    def: Definition = null;
    op: Operands = null;

    // Instruction parts.
    prefixes: Prefix[] = [];
    opcode: Opcode = new Opcode; // required
    modrm: Modrm = null;
    sib: Sib = null;
    immediate: Immediate = null;

    // Direction for register-to-register `MOV` operations, whether REG field of Mod-R/M byte is destination.
    protected regToRegDirectionRegIsDst: boolean = true;

    // Index where instruction was inserted in `Code`s buffer.
    index: number = 0;

    // Byte offset of the instruction in compiled machine code.
    offset: number = 0;

    constructor(def: Definition, op: Operands) {
        this.def = def;
        this.op = op;
        this.create();
    }

    write(arr: number[]): number[] {
        for(var pfx of this.prefixes) pfx.write(arr);
        this.opcode.write(arr);
        if(this.modrm)      this.modrm.write(arr);
        if(this.sib)        this.sib.write(arr);
        if(this.immediate)  this.immediate.write(arr);
        return arr;
    }

    protected create() {
        var op = this.op;
        var dstreg: Register = null;
        var dstmem: Memory = null;
        var srcreg: Register = null;
        var srcmem: Memory = null;

        // Destination
        if(op.dst instanceof Register)    dstreg = op.dst as Register;
        else if(op.dst instanceof Memory) dstmem = op.dst as Memory;
        else throw TypeError(`Destination operand should be Register or Memory; given: ${op.dst.toString()}`);

        // Source
        if(op.src) {
            if (op.src instanceof Register)     srcreg = op.src as Register;
            else if (op.src instanceof Memory)  srcmem = op.src as Memory;
            else if (!(op.src instanceof Constant))
                throw TypeError(`Source operand should be Register, Memory or Constant`);
        }

        // Create instruction parts.
        this.createPrefixes (dstreg, dstmem, srcreg, srcmem);
        this.createOpcode   (dstreg, dstmem, srcreg, srcmem);
        this.createModrm    (dstreg, dstmem, srcreg, srcmem);
        this.createSib      (dstreg, dstmem, srcreg, srcmem);
        this.createImmediate(dstreg, dstmem, srcreg, srcmem);
    }

    protected createPrefixes(dstreg: Register, dstmem: Memory, srcreg: Register, srcmem: Memory) {
        if(this.def.mandatoryRex || dstreg.isExtended)
            this.prefixes.push(this.createRex(dstreg, dstmem, srcreg, srcmem));
    }

    protected createRex(dstreg: Register, dstmem: Memory, srcreg: Register, srcmem: Memory): PrefixRex {
        var W = 0, R = 0, X = 0, B = 0;
        if(this.def.mandatoryRex) W = 1;

        if(dstreg && dstreg.isExtended) R = 1;
        if(srcreg && srcreg.isExtended) B = 1;

        if(dstmem) {
            if(dstmem.base && dstmem.base.isExtended) B = 1;
            if(dstmem.index && dstmem.index.isExtended) X = 1;
        }
        if(srcmem) {
            if(srcmem.base && srcmem.base.isExtended) B = 1;
            if(srcmem.index && srcmem.index.isExtended) X = 1;
        }

        return new PrefixRex(W, R, X, B);
    }

    protected createOpcode(dstreg: Register, dstmem: Memory, srcreg: Register, srcmem: Memory) {
        var def = this.def;
        var opcode = this.opcode;
        opcode.op = def.op;

        if(def.regInOp) {
            // We have register encoded in op-code here.
            if(!dstreg) throw TypeError(`Operation needs destination register.`);
            opcode.op = (opcode.op & Opcode.MASK_OP) | dstreg.id;
        } else {
            // Direction bit `d`
            var direction = Opcode.DIRECTION.REG_IS_SRC;
            if(dstreg) {
                direction = Opcode.DIRECTION.REG_IS_DST;

                // *reg-to-reg* `MOV` operation
                if(srcreg && (opcode.op == OP.MOV)) {
                    if(this.regToRegDirectionRegIsDst)  direction = Opcode.DIRECTION.REG_IS_DST;
                    else                                direction = Opcode.DIRECTION.REG_IS_SRC;
                }
            }
            opcode.op = (opcode.op & Opcode.MASK_DIRECTION) | direction;

            // Size bit `s`
            opcode.op = (opcode.op & Opcode.MASK_SIZE) | (Opcode.SIZE.WORD);
        }

        opcode.regIsDest = def.regIsDest;
        opcode.isSizeWord = def.isSizeWord;
        opcode.regInOp = def.regInOp;
    }

    protected createModrm(dstreg: Register, dstmem: Memory, srcreg: Register, srcmem: Memory) {
        if(srcreg || srcmem || dstmem) {
            var mod = 0, reg = 0, rm = 0;
            if(srcreg && dstreg) {
                mod = Modrm.MOD.REG_TO_REG;

                // Remove `d` and `s` bits.
                var is_mov = (OP.MOV >> 2) === (this.opcode.op >> 2);

                if(!is_mov) {
                    reg = dstreg.id;
                    rm  = srcreg.id;
                } else {
                    // *reg-to-reg* `MOV` operation
                    if(this.regToRegDirectionRegIsDst) {
                        reg = dstreg.id;
                        rm  = srcreg.id;
                    } else {
                        reg = srcreg.id;
                        rm  = dstreg.id;
                    }
                }
            } else {
                var r: Register = srcreg || dstreg;
                var mem: Memory = srcmem || dstmem;

                reg = r.id;
                rm = mem.base ? mem.base.id : Modrm.RM_NEEDS_SIB;

                if(mem.disp) {
                    if(mem.disp.size === Displacement.SIZE.DISP8)   mod = Modrm.MOD.DISP8;
                    else                                            mod = Modrm.MOD.DISP32;
                } else                                              mod = Modrm.MOD.INDIRECT;
            }
            this.modrm = new Modrm(mod, reg, rm);
        }
    }

    protected createSib(dstreg: Register, dstmem: Memory, srcreg: Register, srcmem: Memory) {
        if(!this.modrm || (this.modrm.rm != Modrm.RM_NEEDS_SIB)) return;

        var mem: Memory = srcmem || dstmem;
        var userscale = 0, I = 0, B = 0;

        if(mem.scale) userscale = mem.scale.value; // TODO: what about 0?
        if(mem.index) I = mem.index.id;
        if(mem.base)  B = mem.base.id;

        this.sib = new Sib(userscale, I, B);
    }

    protected createImmediate(dstreg: Register, dstmem: Memory, srcreg: Register, srcmem: Memory) {

    }
}


// Generates logically equivalent code to `Instruction` but the actual
// bytes of the machine code will likely differ, because `FuzzyInstruction`
// picks at random one of the possible instructions when multiple instructions
// can perform the same operation. Here are some examples:
//
//  - Bits in `REX` prefix are ignored if they don't have an effect on the instruction.
//  - Register-to-register `MOV` instruction can be encoded in two different ways.
//  - Up to four prefixes may be added to instruction, if they are not used, they are ignored.
//  - There can be many different *no-op* instruction that are used to fill in padding, for example:
//
//     mov %rax, %rax
//     add $0, %rax

export class FuzzyInstruction extends Instruction {

    protected regToRegDirectionRegIsDst = !(Math.random() > 0.5);

    protected oneOrZero(): number {
        return Math.random() > 0.5 ? 1 : 0;
    }

    // Randomize unused bits in REX byte.
    protected createRex(dstreg: Register, dstmem: Memory, srcreg: Register, srcmem: Memory) {
        var rex: PrefixRex = super.createRex(dstreg, dstmem, srcreg, srcmem);

        if(!dstmem && !srcmem) {
            rex.X = this.oneOrZero();
            if(!srcreg) rex.B = this.oneOrZero();
        }

        return rex;
    }
}

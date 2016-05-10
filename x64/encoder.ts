import * as reg from './regfile';


// Op-code of instructions.
//
//     |76543210|
//     |......ds|
//     |.......s <--- Operation size: 1 = word, 0 = byte.
//     |......d <--- Operation direction: 1 = register is destination, 0 = register is source.
//     |765432 <--- Op-code
export const enum OP {
    MOV = 0x89,
    MOVL = 0xB8,
    MOVQ = 0xC7,
    MOVABS = 0xB8, // Lower 3 bits encode destination register.
    INC = 0xff,
    DEC = 0xff,
}

export const enum OP_SIZE {
    BYTE = 0b0,
    WORD = 0b1,
}

export const enum OP_DIRECTION {
    REG_IS_SRC = 0b00,
    REG_IS_DST = 0b10,
}

// Two bits of `MOD` field in `Mod-R/M` byte.
export const enum MOD {
    INDIRECT = 0b00,
    DISP8 = 0b01,
    DISP32 = 0b10,
    REG_TO_REG = 0b11,
}

// Op-code extension into `REG` field of `Mod-R/M` byte.
export const enum OPREG {
    INC = 0,
    DEC = 1,
}

// Displacement.
export const enum DISP {
    BYTE,
    LONG,
}

export type number64 = [number, number];


// Transpiler returns a machine code of every instruction.
// It does not have any logic and does not do any optimizations or type
// checking, it just returns the machine code for every ASM instruction.
export class Encoder {

    // See Intel manual: 2-8 Vol. 2A
    // See: http://wiki.osdev.org/X86-64_Instruction_Encoding#REX_prefix
    // `W`, `R`, `X`, `B` are numbers `0` or `1`.
    protected rex(W: number, R: number, X: number, B: number) {
        return 0b01000000 | (W << 3) + (R << 2) + (X << 1) + B;
    }

    protected rexW(R: number = 0, X: number = 0, B: number = 0) {
        return this.rex(1, R, X, B);
    }

    protected rexOneOperand(r: reg.Register) {
        var W = 0, B = 0;
        if(r.size == 64) W = 1;
        if(r.isExtended) B = 1;
        return W || B ? this.rex(W, 0, 0, B) : null;
    }

    protected rexRegToReg(src: reg.Register, dst: reg.Register) {
        var W = 0, R = 0, X = 0, B = 0;

        // Determine if we operate on 64-bit registers.
        if(src.size == 64) W = 1;
        else if(dst.size == 64) W = 1;

        // Extend bits in `Mod-R/M` byte.
        if(src.isExtended) B = 1;
        if(dst.isExtended) R = 1;

        return W || R || X || B ? this.rex(W, R, X, B) : null;
    }

    protected rexMemToReg(src: reg.MemoryReference, dst: reg.Register) {
        var W = 0, R = 0, X = 0, B = 0;
        
        if(src.base.size == 64) W = 1;
        else if(dst.size == 64) W = 1;
        
        if(src.base && src.base.isExtended) B = 1;
        if(src.index && src.index.isExtended) X = 1;
        if(dst.isExtended) R = 1;

        return W || R || X || B ? this.rex(W, R, X, B) : null;
    }

    protected rexFromOperands(src: reg.Operand|number, dst: reg.Operand) {

    }

    protected getDisplacementSize(disp) {
        if((disp <= 0x7f) && (disp >= -0x80)) return DISP.BYTE;
        if((disp <= 0x7fffffff) && (disp >= -0x80000000)) return DISP.LONG;
        throw Error(`Displacement ${disp} too big.`);
    }

    // Creates a Mod-REG-R/M byte, `mod` is mode, `register` is ID of the first register,
    // `rm` is ID of the 2nd register or memory value.
    protected modrm(mod, register, rm) {
        // return ((mod & 0b11) << 6) | ((register & 0b111) << 3) | (rm & 0b111);
        // return (mod << 6) + (register << 3) + rm;
        return (mod << 6) | (register << 3) | rm;
    }

    protected modrmOneOperand(dst: reg.Register, opreg: OPREG = 0) {
        return this.modrm(MOD.REG_TO_REG, opreg, dst.id);
    }

    protected modrmRegToReg(src: reg.Register, dst: reg.Register) {
        return this.modrm(MOD.REG_TO_REG, src.id, dst.id);
    }

    protected modrmMemToReg(src: reg.MemoryReference, dst: reg.Register, mod = MOD.INDIRECT) {
        var rm = src.base.id;

        // There will be a `SIB` byte, we have to set `R/M` to `0b100`.
        var have_sib = !!src.index;
        if(have_sib) {
            rm = 0b100;
        }

        return this.modrm(mod, dst.id, rm);
    }

    protected modrmFromOperands(src: reg.Operand, dst: reg.Operand) {
        if(src instanceof reg.Register) {
            if(dst instanceof reg.Register) {
                return this.modrm(MOD.REG_TO_REG, (src as reg.Register).id, (dst as reg.Register).id);
            }
        }
        throw Error('Unsupported Mod-R/M operands.');
    }

    protected needsSib(ref: reg.MemoryReference) {
        return !!ref.index;
    }

    protected sib(scale, index, base) {
        return (scale << 6) | (index << 3) | base;
    }

    protected sibFromRef(ref: reg.MemoryReference) {
        return this.sib(ref.scale, ref.index.id, ref.base.id);
    }

    protected insOneOperand(r: reg.Register, op: OP, opreg: OPREG = 0, hasRex = true, reg_in_op = false, imm: number[] = []) {
        var ins = [];

        // REX.W | REX.B prefix.
        if(hasRex) {
            var rex = this.rexOneOperand(r);
            if(rex) ins.push(rex);
        }

        // 3 lower bits in Op-code are used to encode register.
        if(reg_in_op) {
            op |= r.id;
            ins.push(op);
        } else {
            ins.push(op);
            ins.push(this.modrmOneOperand(r, opreg));
        }

        if(imm.length) for(var long of imm) this.pushConstant(ins, long);

        return ins;
    }

    protected insRegToReg(src: reg.Register, dst: reg.Register, op: OP, hasRex = true) {
        var ins = [];

        // REX.W | REX.B prefix.
        if(hasRex) {
            var rex = this.rexRegToReg(src, dst);
            if(rex) ins.push(rex);
        }

        ins.push(op);
        ins.push(this.modrmRegToReg(src, dst));
        return ins;
    }

    protected insMemToReg(src: reg.MemoryReference, dst: reg.Register, op: OP, hasRex = true, op_size: OP_SIZE = OP_SIZE.BYTE) {
        var ins = [];

        if(hasRex) {
            var rex = this.rexMemToReg(src, dst);
            if(rex) ins.push(rex);
        }

        // Set op-code's direction and size bits.
        op |= OP_DIRECTION.REG_IS_DST;
        op |= op_size;
        ins.push(op);

        if(src.displacement) {
            var disp_size = this.getDisplacementSize(src.displacement);

            if(disp_size == DISP.BYTE) {
                ins.push(this.modrmMemToReg(src, dst, MOD.DISP8));
                if(src.index) ins.push(this.sibFromRef(src));
                ins.push(src.displacement);
            } else { // DISP.LONG
                ins.push(this.modrmMemToReg(src, dst, MOD.DISP32));
                if(src.index) ins.push(this.sibFromRef(src));
                // Write octets in reverse order.
                ins.push(src.displacement & 0xff);
                ins.push((src.displacement >> 8) & 0xff);
                ins.push((src.displacement >> 16) & 0xff);
                ins.push((src.displacement >> 24) & 0xff);
            }
        } else {
            ins.push(this.modrmMemToReg(src, dst));
            if(src.index) ins.push(this.sibFromRef(src));
        }

        return ins;
    }

    protected insRegToMem(src: reg.Register, dst: reg.MemoryReference, op: OP, hasRex = true) {
        var ins = [];

        if(hasRex) {
            var rex = this.rexRegToMem(src, dst);
            if(rex) ins.push(rex);
        }
    }

    protected pushConstant(arr: number[], constant: number) {
        arr.push(constant & 0xff);
        arr.push((constant >> 8) & 0xff);
        arr.push((constant >> 16) & 0xff);
        arr.push((constant >> 24) & 0xff);
        return arr;
    }

    inc(register: reg.Register) {
        return this.insOneOperand(register, OP.INC, OPREG.INC);
    }

    dec(register: reg.Register) {
        return this.insOneOperand(register, OP.DEC, OPREG.DEC);
    }

    // mov_r_r(src: reg.Register, dst: reg.Register) {
    //     return this.insRegToReg(src, dst, OP.MOV);
    // }

    movq_r_r(src: reg.Register64, dst: reg.Register64) {
        if(!(src instanceof reg.Register64) || !(dst instanceof reg.Register64))
            throw Error('`movq` is defined only on 64-bit registers.');
        return this.insRegToReg(src, dst, OP.MOV);
    }

    movq_m_r(src: reg.MemoryReference, dst: reg.Register64) {
        return this.insMemToReg(src, dst, OP.MOV);
    }

    movq_imm_r(imm: number, dst: reg.Register64) {
        return this.insOneOperand(dst, OP.MOVQ, 0, true, false, [imm]);
    }

    movq_r_m(src: reg.Register64, dst: reg.MemoryReference) {
        this.insRegToMem(src, dst, OP.MOV);
    }


    movabs(imm: [number, number], dst: reg.Register) {
        if(!(dst instanceof reg.Register64))
            throw Error('`movabs` operates only on 64-bit registers.');

        return this.insOneOperand(dst, OP.MOVABS, 0, true, true, imm);
    }

    movq(src: reg.MemoryReference|reg.Register64|number|number64, dst: reg.MemoryReference|reg.Register64) {

    }

    mov(src: reg.MemoryReference|reg.Register|number|number64, dst: reg.MemoryReference|reg.Register) {
        if(src instanceof reg.Register64) {
            if(dst instanceof reg.Register64) return this.movq_r_r(src, dst);
            else if(dst instanceof reg.MemoryReference) return this.movq_r_m(src, dst);
            else throw Error(`Destination operand [${dst.toString()}] invalid.`);
        } else if(src instanceof reg.Register32) {

        }
    }



    movl_imm_r32(imm: number, dst: reg.Register32) {
        return this.insOneOperand(dst, OP.MOVL, 0, true, true, [imm]);
    }



    movl_r_r(src: reg.Register, dst: reg.Register) {
        return this.insRegToReg(src, dst, OP.MOV, false);
    }

    movb_r_r(src: reg.Register, dst: reg.Register) {
        return this.insRegToReg(src, dst, OP.MOV, false);
    }

    nop(size = 1) {

    }

    nopw() {
        return this.nop(2);
    }

    nopl() {
        return this.nop(4);
    }

}


// Generates logically equivalent code to `Encoder` but the actual
// bytes of the machine code will likely differ, because `FuzzyEncoder`
// picks at random one of the possible instructions when multiple instructions
// can perform the same operation. Here are some examples:
//
//  - Bits in `REX` prefix are ignored if they don't have an effect on the instruction.
//  - Register-to-register `MOV` instruction can be encoded in two different ways.
//  - Up to four prefixes may be added to instruction, if they are not used, they are ignored.
//  - There can be many different *no-op* instruction that are used to fill in padding for byte alignment, for example:
//
//     mov %rax, %rax
//     add $0, %rax
//     ...
export class FuzzyEncoder extends Encoder {
    oneOrZero(): number {
        return Math.random() > 0.5 ? 1 : 0;
    }

    protected rexRegToReg(src: reg.Register, dst: reg.Register) {
        var rex = super.rexRegToReg(src, dst);
        if(rex) {
            // `REX.X` bit is not used in *register-to-register* instructions.
            rex = (rex & 0b01) | (this.oneOrZero() << 1);
        }
        return rex;
    }
}

import * as o from './operand';
import * as p from './parts';
import {Definition} from './def';
import {OP, OPREG} from './opcode';


// Collection of operands an instruction might have. It might
// have *destination* and *source* operands and a possible *immediate* constant.
//
// Each x86 instruction can have up to up to 5 operands: 3 registers, displacement and immediate.
// 3 registers means: 1 register, and 2 registers that specify the base and index for memory
// dereferencing, however all operands necessary for memory dereferencing are held in `o.Memory`
// class so we need only these three operands.
export class Operands {
    dst: o.Register|o.Memory = null;            // Destination
    src: o.Register|o.Memory = null;            // Source
    imm: o.Constant = null;                     // Immediate

    constructor(dst: o.Register|o.Memory = null, src: o.Register|o.Memory = null, imm: o.Constant = null) {
        this.dst = dst;
        this.src = src;
        this.imm = imm;
    }

    hasOperands() {
        return !!this.dst || !!this.src || !!this.imm;
    }

    getRegisterOperand(dst_first = true): o.Register {
        var first, second;
        if(dst_first) {
            first = this.dst;
            second = this.src;
        } else {
            first = this.src;
            second = this.dst;
        }
        if(first instanceof o.Register) return first as o.Register;
        if(second instanceof o.Register) return second as o.Register;
        return null;
    }

    getMemoryOperand(): o.Memory {
        if(this.dst instanceof o.Memory) return this.dst as o.Memory;
        if(this.src instanceof o.Memory) return this.src as o.Memory;
        return null;
    }

    toString() {
        var parts = [];
        if(this.dst) parts.push(this.dst.toString());
        if(this.src) parts.push(this.src.toString());
        if(this.imm) parts.push(this.imm.toString());
        return parts.join(', ');
    }
}


export abstract class Expression {
    // Index where instruction was inserted in `Code`s buffer.
    index: number = 0;

    // Byte offset of the instruction in compiled machine code.
    offset: number = -1;

    abstract write(arr: number[]): number[];
    abstract toString(): string;
}


export class Label extends Expression {

    name: string;

    constructor(name: string) {
        super();
        this.name = name;
    }

    write(arr: number[]): number[] {
        return arr;
    }

    toString() {
        return this.name + ':';
    }
}


export class Data extends Expression {
    octets: number[] = [];

    write(arr: number[]): number[] {
        this.offset = arr.length;

        arr = arr.concat(this.octets);
        return arr;
    }

    toString(margin = '    ') {
        return margin + 'db';
    }
}


export class DataUninitialized extends Expression {
    length: number;

    constructor(length: number) {
        super();
        this.length = length;
    }

    write(arr: number[]): number[] {
        this.offset = arr.length;

        arr = arr.concat(new Array(this.length));
        return arr;
    }

    toString(margin = '    ') {
        return margin + 'resb ' + this.length;
    }
}


export interface InstructionUserInterface {
    /* Adds `LOCK` prefix to instructoins, throws `TypeError` on error. */
    lock(): this;
    cs(): this;
    ss(): this;
    ds(): this;
    es(): this;
    fs(): this;
    gs(): this;
}


// ## x86_64 `Instruction`
//
// `Instruction` object is created using instruction `Definition` and `Operands` provided by the user,
// out of those `Instruction` generates `InstructionPart`s, which then can be packaged into machine
// code using `.write()` method.
export class Instruction extends Expression implements InstructionUserInterface{
    def: Definition = null;
    op: Operands = null;

    // Instruction parts.
    prefixLock: p.PrefixLock = null;
    prefixSegment: p.PrefixStatic = null;
    opcode: p.Opcode = new p.Opcode; // required
    modrm: p.Modrm = null;
    sib: p.Sib = null;
    displacement: p.Displacement = null;
    immediate: p.Immediate = null;

    // Direction for register-to-register `MOV` operations, whether REG field of Mod-R/M byte is destination.
    // We set this to `false` to be compatible with GAS assembly, which we use for testing.
    protected regToRegDirectionRegIsDst: boolean = false;

    // constructor(code: Code, def: Definition, op: Operands) {
    constructor(def: Definition, op: Operands) {
        super();
        this.def = def;
        this.op = op;
    }

    protected writePrefixes(arr: number[]) {
        if(this.prefixLock)     this.prefixLock.write(arr);
        if(this.prefixSegment)  this.prefixSegment.write(arr);
    }

    write(arr: number[]): number[] {
        this.offset = arr.length;

        this.writePrefixes(arr);
        this.opcode.write(arr);
        if(this.modrm)          this.modrm.write(arr);
        if(this.sib)            this.sib.write(arr);
        if(this.displacement)   this.displacement.write(arr);
        if(this.immediate)      this.immediate.write(arr);
        return arr;
    }

    lock(): this {
        this.prefixLock = new p.PrefixLock;
        // TODO: check LOCK is allowed for this instruction.
        return this;
    }

    cs(): this {
        this.prefixSegment = new p.PrefixStatic(p.PREFIX.CS);
        return this;
    }

    ss(): this {
        this.prefixSegment = new p.PrefixStatic(p.PREFIX.SS);
        return this;
    }

    ds(): this {
        this.prefixSegment = new p.PrefixStatic(p.PREFIX.DS);
        return this;
    }

    es(): this {
        this.prefixSegment = new p.PrefixStatic(p.PREFIX.ES);
        return this;
    }

    fs(): this {
        this.prefixSegment = new p.PrefixStatic(p.PREFIX.FS);
        return this;
    }

    gs(): this {
        this.prefixSegment = new p.PrefixStatic(p.PREFIX.GS);
        return this;
    }

    // http://wiki.osdev.org/X86-64_Instruction_Encoding#Operand-size_and_address-size_override_prefix
    getOperandSize() {

    }

    getAddressSize() {

    }

    create() {
        var op = this.op;
        var dstreg: o.Register = null;
        var dstmem: o.Memory = null;
        var srcreg: o.Register = null;
        var srcmem: o.Memory = null;

        // Destination
        if(op.dst instanceof o.Register)    dstreg = op.dst as o.Register;
        else if(op.dst instanceof o.Memory) dstmem = op.dst as o.Memory;
        else if(op.dst) throw TypeError(`Destination operand should be Register or Memory; given: ${op.dst.toString()}`);

        // Source
        if(op.src) {
            if (op.src instanceof o.Register)     srcreg = op.src as o.Register;
            else if (op.src instanceof o.Memory)  srcmem = op.src as o.Memory;
            else if (!(op.src instanceof o.Constant))
                throw TypeError(`Source operand should be Register, Memory or Constant`);
        }

        // Create instruction parts.
        this.createPrefixes();
        this.createOpcode();
        this.createModrm();
        this.createSib();
        this.createDisplacement();
        this.createImmediate();
    }

    toString(margin = '    ') {
        var parts = [];
        if(this.prefixLock) parts.push(this.prefixLock.toString());
        if(this.prefixSegment) parts.push(this.prefixSegment.toString());

        var mnemonic = this.def.name ? this.def.name : '';
        if(this.def.opreg > -1)
            mnemonic = OPREG[this.def.opreg].toLowerCase();
        else
            mnemonic = this.opcode.toString();
        parts.push(mnemonic);

        if((parts.join(' ')).length < 8) parts.push((new Array(7 - (parts.join(' ')).length)).join(' '));
        if(this.op.hasOperands()) parts.push(this.op.toString());

        return margin + parts.join(' ');
    }

    protected hasExtendedRegister(): boolean {
        var {dst, src} = this.op;
        if(dst && dst.reg() && (dst.reg() as o.Register).isExtended()) return true;
        if(src && src.reg() && (src.reg() as o.Register).isExtended()) return true;
        return false;
    }

    protected hasRegisterOfSize(size: o.SIZE): boolean {
        var {dst, src} = this.op;
        if(dst && dst.reg() && ((dst.reg() as o.Register).size === size)) return true;
        if(src && src.reg() && ((src.reg() as o.Register).size === size)) return true;
        return false;
    }

    protected createPrefixes() {}

    protected createOpcode() {
        var def = this.def;
        var opcode = this.opcode;
        opcode.op = def.op;

        var {dst, src} = this.op;

        if(def.regInOp) {
            // We have register encoded in op-code here.
            if(!dst || !dst.isRegister())
                throw TypeError(`Operation needs destination register.`);
            opcode.op = (opcode.op & p.Opcode.MASK_OP) | (dst as o.Register).get3bitId();
        } else {
            // Direction bit `d`
            if(this.def.opDirectionBit) {
                var direction = p.Opcode.DIRECTION.REG_IS_DST;

                if(src instanceof o.Register) {
                    direction = p.Opcode.DIRECTION.REG_IS_SRC;
                }

                // *reg-to-reg* operation
                if((dst instanceof o.Register) && (src instanceof o.Register)) {
                    if(this.regToRegDirectionRegIsDst)  direction = p.Opcode.DIRECTION.REG_IS_DST;
                    else                                direction = p.Opcode.DIRECTION.REG_IS_SRC;
                }

                opcode.op = (opcode.op & p.Opcode.MASK_DIRECTION) | direction;
            }

            // Size bit `s`
            // opcode.op = (opcode.op & p.Opcode.MASK_SIZE) | (p.Opcode.SIZE.WORD);
        }

        opcode.regIsDest = def.regIsDest;
        opcode.isSizeWord = def.isSizeWord;
        opcode.regInOp = def.regInOp;
    }

    protected createModrm() {
        var {dst, src} = this.op;
        var has_opreg = (this.def.opreg > -1);
        var dst_in_modrm = !this.def.regInOp && !!dst; // Destination operand is NOT encoded in main op-code byte.
        if(has_opreg || dst_in_modrm) {
            var mod = 0, reg = 0, rm = 0;

            if(has_opreg) {
                // If we have `opreg`, then instruction has up to one operand.
                reg = this.def.opreg;
                var r: o.Register = this.op.getRegisterOperand();
                if (r) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                    rm = r.get3bitId();
                    this.modrm = new p.Modrm(mod, reg, rm);
                    return;
                }
            } else {
                var r: o.Register = this.op.getRegisterOperand(this.regToRegDirectionRegIsDst);
                if (r) reg = r.get3bitId();
            }

            if(!dst) { // No destination operand, just opreg.
                this.modrm = new p.Modrm(mod, reg, rm);
                return;
            }

            // Reg-to-reg instruction;
            if((dst instanceof o.Register) && (src instanceof o.Register)) {
                mod = p.Modrm.MOD.REG_TO_REG;
                var rmreg: o.Register = (this.regToRegDirectionRegIsDst ? src : dst) as o.Register;
                rm = rmreg.get3bitId();
                this.modrm = new p.Modrm(mod, reg, rm);
                return;
            }

            // `o.Memory` class makes sure that ESP cannot be a SIB index register and
            // that EBP always has displacement value even if 0x00.
            var m: o.Memory = this.op.getMemoryOperand();
            if(!m)
                throw Error('No Memory reference for Modrm byte.');
            if(!m.base && !m.index && !m.displacement)
                throw TypeError('Invalid Memory reference.');
            if(m.index && !m.scale)
                throw TypeError('Memory Index reference needs Scale factor.');

            // dispX
            // We use `disp32` with SIB byte version because the version without SIB byte
            // will be used for RIP-relative addressing.
            if(!m.base && !m.index && m.displacement) {
                m.displacement.signExtend(o.DisplacementValue.SIZE.DISP32);
                mod = p.Modrm.MOD.INDIRECT;
                rm = p.Modrm.RM.NEEDS_SIB; // SIB byte follows
                this.modrm = new p.Modrm(mod, reg, rm);
                return;
            }

            // [BASE]
            // [BASE] + dispX
            // `o.Memory` class makes sure that EBP always has displacement value even if 0x00,
            // so EBP will not appear here.
            if(m.base && !m.index) {
                mod = p.Modrm.getModDispSize(m);
                if(mod === p.Modrm.MOD.DISP32)
                    m.displacement.signExtend(o.DisplacementValue.SIZE.DISP32);
                // SIB byte follows in `[RSP]` case, and `[RBP]` is impossible as RBP
                // always has a displacement, [RBP] case is used for RIP-relative addressing.
                rm = m.base.get3bitId();
                this.modrm = new p.Modrm(mod, reg, rm);
                return;
            }

            // [BASE + INDEX x SCALE]
            if((m.base || m.index) && !m.displacement) {
                mod = p.Modrm.MOD.INDIRECT;
                rm = p.Modrm.RM.NEEDS_SIB; // SIB byte follows
                this.modrm = new p.Modrm(mod, reg, rm);
                return;
            }

            // [BASE + INDEX * SCALE] + dispX
            if(m.base && m.index && m.displacement) {
                mod = p.Modrm.getModDispSize(m);
                if(mod === p.Modrm.MOD.DISP32)
                    m.displacement.signExtend(o.DisplacementValue.SIZE.DISP32);
                rm = p.Modrm.RM.NEEDS_SIB;
                this.modrm = new p.Modrm(mod, reg, rm);
                return;
            }

            throw Error('Fatal error, unreachable code.');
        }
    }

    protected createSib() {
        if(!this.modrm || (this.modrm.rm !== p.Modrm.RM.NEEDS_SIB)) return;

        var m: o.Memory = this.op.getMemoryOperand();
        if(!m) throw Error('No Memory operand to encode SIB.');

        var scalefactor = 0, I = 0, B = 0;

        if(m.scale) scalefactor = m.scale.value;

        if(m.index) {
            I = m.index.get3bitId();

            // RSP register cannot be used as index, `o.Memory` class already ensures it
            // if used in normal way.
            if(I === p.Sib.INDEX_NONE)
                throw Error(`Register ${m.index.toString()} cannot be used as SIB index.`);

        } else {
            I = p.Sib.INDEX_NONE;
        }

        if(m.base) {
            B = m.base.get3bitId();
        } else
            B = p.Sib.BASE_NONE;

        this.sib = new p.Sib(scalefactor, I, B);
    }

    protected createDisplacement() {
        var m: o.Memory = this.op.getMemoryOperand();
        if(!m) return;

        if(m.displacement) {
            this.displacement = new p.Displacement(m.displacement);
        }
    }

    protected createImmediate() {
        if(this.op.imm) {
            if (this.displacement && (this.displacement.value.size === o.SIZE.QUAD))
                throw TypeError(`Cannot have Immediate with ${o.SIZE.QUAD} bit Displacement.`);
            this.immediate = new p.Immediate(this.op.imm);
        }
    }
}


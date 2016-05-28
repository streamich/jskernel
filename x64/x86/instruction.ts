import * as o from './operand';
import * as p from './parts';
import * as d from './def';


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
    def: d.Def = null;
    op: o.Operands = null;

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
    constructor(def: d.Def, op: o.Operands) {
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
        if(!this.def.lock)
            throw Error(`Instruction "${this.def.mnemonic}" does not support LOCK.`);

        this.prefixLock = new p.PrefixLock;
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

    // Create instruction parts.
    create() {
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
        parts.push(this.def.mnemonic);
        if((parts.join(' ')).length < 8) parts.push((new Array(7 - (parts.join(' ')).length)).join(' '));
        if(this.op.list.length) parts.push(this.op.toString());

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
        opcode.op = def.opcode;

        var {dst, src} = this.op;

        if(def.regInOp) {
            // We have register encoded in op-code here.
            if(!dst || !dst.isRegister())
                throw TypeError(`Operation needs destination register.`);
            opcode.op = (opcode.op & p.Opcode.MASK_OP) | (dst as o.Register).get3bitId();
        } else {
            // Direction bit `d`
            if(this.def.opcodeDirectionBit) {
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
    }

    protected createModrm() {
        if(!this.op.hasRegisterOrMemory()) return;

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
                if (r) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                    reg = r.get3bitId();
                }
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
            if(!m) {
                // throw Error('No Memory reference for Modrm byte.');
                this.modrm = new p.Modrm(mod, reg, rm);
                return;
            }

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

            // [BASE + INDEX x SCALE] + dispX
            if(m.base || m.index) {
                mod = p.Modrm.getModDispSize(m);
                if(m.displacement)
                    if((mod === p.Modrm.MOD.DISP32) || (mod === p.Modrm.MOD.INDIRECT))
                        m.displacement.signExtend(o.DisplacementValue.SIZE.DISP32);
                rm = p.Modrm.RM.NEEDS_SIB; // SIB byte follows
                this.modrm = new p.Modrm(mod, reg, rm);
                return;
            }

            throw Error('Fatal error, unreachable code.');
        }
    }

    protected createSib() {
        if(!this.modrm) return;
        if(this.modrm.mod === p.Modrm.MOD.REG_TO_REG) return;
        if((this.modrm.rm !== p.Modrm.RM.NEEDS_SIB)) return;

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
        if(m && m.displacement) {
            this.displacement = new p.Displacement(m.displacement);
        } else if(this.modrm && this.sib && (this.sib.B === p.Sib.BASE_NONE)) {
            // Some SIB byte encodings require displacement, if we don't have displacement yet
            // add zero displacement.
            var disp: o.DisplacementValue = null;
            switch(this.modrm.mod) {
                case p.Modrm.MOD.INDIRECT:
                    disp = new o.DisplacementValue(0);
                    disp.signExtend(o.DisplacementValue.SIZE.DISP32);
                    break;
                case p.Modrm.MOD.DISP8:
                    disp = new o.DisplacementValue(0);
                    disp.signExtend(o.DisplacementValue.SIZE.DISP8);
                    break;
                case p.Modrm.MOD.DISP32:
                    disp = new o.DisplacementValue(0);
                    disp.signExtend(o.DisplacementValue.SIZE.DISP32);
                    break;
            }
            if(disp) this.displacement = new p.Displacement(disp);
        }
    }

    protected createImmediate() {
        var imm = this.op.getImmediate();
        if(imm) {
            // if (this.displacement && (this.displacement.value.size === o.SIZE.QUAD))
            //     throw TypeError(`Cannot have Immediate with ${o.SIZE.QUAD} bit Displacement.`);
            this.immediate = new p.Immediate(imm);
        }
    }
}


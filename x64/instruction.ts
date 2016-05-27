import * as o from './operand';
import * as p from './parts';
import {Definition} from './def';
import {OP} from './opcode';


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
}


export interface InstructionUserInterface {
    /* Adds `LOCK` prefix to instructoins, throws `TypeError` on error. */
    lock(): this;
}


// ## x86_64 `Instruction`
//
// `Instruction` object is created using instruction `Definition` and `Operands` provided by the user,
// out of those `Instruction` generates `InstructionPart`s, which then can be packaged into machine
// code using `.write()` method.
export class Instruction implements InstructionUserInterface{
    def: Definition = null;
    op: Operands = null;

    // Instruction parts.
    prefixLock: p.PrefixLock = null;
    opcode: p.Opcode = new p.Opcode; // required
    modrm: p.Modrm = null;
    sib: p.Sib = null;
    displacement: p.Displacement = null;
    immediate: p.Immediate = null;

    // Direction for register-to-register `MOV` operations, whether REG field of Mod-R/M byte is destination.
    protected regToRegDirectionRegIsDst: boolean = true;

    // Index where instruction was inserted in `Code`s buffer.
    index: number = 0;

    // Byte offset of the instruction in compiled machine code.
    offset: number = 0;

    // constructor(code: Code, def: Definition, op: Operands) {
    constructor(def: Definition, op: Operands) {
        this.def = def;
        this.op = op;
    }

    getMemoryOperand(): o.Memory {
        if(this.op.dst instanceof o.Memory) return this.op.dst as o.Memory;
        if(this.op.src instanceof o.Memory) return this.op.src as o.Memory;
        return null;
    }

    protected writePrefixes(arr: number[]) {
        if(this.prefixLock) this.prefixLock.write(arr);
        // for(var pfx of this.prefixes) pfx.write(arr);
    }

    write(arr: number[]): number[] {
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
        this.createSib(dstmem, srcmem);
        this.createDisplacement(dstmem, srcmem);
        this.createImmediate();
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

    protected createPrefixes() {

    }

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
            // var direction = p.Opcode.DIRECTION.REG_IS_SRC;
            // if(dstreg) {
            //     direction = p.Opcode.DIRECTION.REG_IS_DST;
            //
            //     *reg-to-reg* `MOV` operation
                // if(srcreg && (opcode.op == OP.MOV)) {
                //     if(this.regToRegDirectionRegIsDst)  direction = p.Opcode.DIRECTION.REG_IS_DST;
                //     else                                direction = p.Opcode.DIRECTION.REG_IS_SRC;
                // }
            // }
            // opcode.op = (opcode.op & p.Opcode.MASK_DIRECTION) | direction;

            // Size bit `s`
            // opcode.op = (opcode.op & p.Opcode.MASK_SIZE) | (p.Opcode.SIZE.WORD);
        }

        opcode.regIsDest = def.regIsDest;
        opcode.isSizeWord = def.isSizeWord;
        opcode.regInOp = def.regInOp;
    }

    protected getModrmMod(mem: o.Memory) {
        if(!mem.displacement)                                               return p.Modrm.MOD.INDIRECT;
        else if(mem.displacement.size === o.DisplacementValue.SIZE.DISP8)   return p.Modrm.MOD.DISP8;
        else                                                                return p.Modrm.MOD.DISP32;
    }

    // B -> modrm.mod = 00; modrm.rm = B;
    // B + disp8 -> modrm.mod = 01; modrm.rm = B; disp8
    // B + disp32 -> modrm.mod = 10; modrm.rm = B; disp32
    // B + I*S -> modrm.mod = 00; modrm.rm = 100; sib.scale = I; sib.index = S; sib.base = B;
    // B + I*S + disp8 -> modrm.mod = 01; modrm.rm = 100; sib.scale = S; sib.index = I; sib.base = B; disp8
    // B + I*S + disp32 -> modrm.mod = 01; modrm.rm = 100; sib.scale = S; sib.index = I;
    // RBP
    // RSP
    protected createModrm() {
        // TODO: 2.2.1.6 RIP-Relative Addressing
        var {dst, src} = this.op;

        var has_opreg = (this.def.opreg > -1);
        var dst_in_modrm = !this.def.regInOp && dst;

        if(has_opreg || src || dst_in_modrm) {
            var mod = 0, reg = 0, rm = 0;

            // opreg reg
            // opreg mem

            if(has_opreg) {
                reg = this.def.opreg;
                if(dst.isRegister()) { // opreg reg
                    mod = p.Modrm.MOD.REG_TO_REG;
                    rm = (dst as o.Register).get3bitId();
                } else if(dst.isMemory()) { // opreg mem
                    var mem = dst as o.Memory;
                    
                    mod = p.Modrm.getMod(mem);
                    rm = p.Modrm.getRm(mem);
                } else {
                    throw TypeError('Destination must be Register or Memory.');
                }
            }

            else if(!dst) throw TypeError('No destination operand.');

            // reg
            // mem
            // reg reg
            // reg mem
            // mem reg

            else if(dst.isRegister()) {
                reg = (dst as o.Register).get3bitId();
                if(!src) { // reg
                    mod = p.Modrm.MOD.REG_TO_REG;
                } else if(src) {
                    if(src.isRegister()) { // reg reg
                        mod = p.Modrm.MOD.REG_TO_REG;
                        rm = (src as o.Register).get3bitId();
                    } else if(src.isMemory()) { // reg mem
                        var mem = src as o.Memory;
                        mod = p.Modrm.getMod(mem);
                        rm = p.Modrm.getRm(mem);
                    } else
                        throw TypeError('Source must be Register or Memory.');
                }
            } else if(dst.isMemory()) {
                var mem = dst as o.Memory;
                mod = p.Modrm.getMod(mem);
                rm = p.Modrm.getRm(mem);
                if(!src) { // mem
                    reg = 0; // TODO: ?!?!
                } else if(src.isRegister()) { // mem reg
                    reg = (src as o.Register).get3bitId();
                } else if(src.isMemory()) // mem mem
                    throw TypeError('Cannot do Memory to Memory operation.');
                else {
                    // TODO: other operand = o.Constant
                    throw TypeError('Not supported yet.');
                }
            }

            this.modrm = new p.Modrm(mod, reg, rm);
        }
    }

    protected sibNeeded() {
        if(!this.modrm) return false;
        if(this.modrm.rm !== p.Modrm.RM_NEEDS_SIB) return true;
        if((this.modrm.mod === p.Modrm.MOD.INDIRECT) && (this.modrm.rm === p.Modrm.RM_INDIRECT_SIB)) return true;
        return false;
    }

    protected createSib() {
        if(!this.sibNeeded()) return;

        var mem = this.getMemoryOperand();
        if(!mem) throw Error('No Memory operand to encode SIB.');

        var userscale = 0, I = 0, B = 0;

        if(mem.scale)
            userscale = mem.scale.value;

        if(mem.index) {
            I = mem.index.get3bitId();
            if(I === p.Sib.INDEX_NONE)
                throw Error(`Register ${mem.index.toString()} cannot be used as SIB index.`);
        } else {
            I = p.Sib.INDEX_NONE;
        }

        if(mem.base) {
            B = mem.base.get3bitId();
        } else
            B = p.Sib.BASE_NONE;

        this.sib = new p.Sib(userscale, I, B);
    }

    protected createDisplacement() {
        var mem: o.Memory = this.getMemoryOperand();
        if(!mem) return;

        if(mem.displacement) {
            this.displacement = new p.Displacement(mem.displacement);

        } else if(mem.base && (mem.base.get3bitId() === p.Sib.BASE_DISP)) {
            // RBP always has displacement, because RBP without displacement is used
            // to encode disp32 without SIB.base.
            if(!mem.displacement) this.displacement = new p.Displacement(new o.DisplacementValue(0));
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


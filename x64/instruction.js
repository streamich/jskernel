"use strict";
var o = require('./operand');
var p = require('./parts');
// Collection of operands an instruction might have. It might
// have *destination* and *source* operands and a possible *immediate* constant.
//
// Each x86 instruction can have up to up to 5 operands: 3 registers, displacement and immediate.
// 3 registers means: 1 register, and 2 registers that specify the base and index for memory
// dereferencing, however all operands necessary for memory dereferencing are held in `o.Memory`
// class so we need only these three operands.
var Operands = (function () {
    function Operands(dst, src, imm) {
        if (dst === void 0) { dst = null; }
        if (src === void 0) { src = null; }
        if (imm === void 0) { imm = null; }
        this.dst = null; // Destination
        this.src = null; // Source
        this.imm = null; // Immediate
        this.dst = dst;
        this.src = src;
        this.imm = imm;
    }
    return Operands;
}());
exports.Operands = Operands;
// ## x86_64 `Instruction`
//
// `Instruction` object is created using instruction `Definition` and `Operands` provided by the user,
// out of those `Instruction` generates `InstructionPart`s, which then can be packaged into machine
// code using `.write()` method.
var Instruction = (function () {
    // constructor(code: Code, def: Definition, op: Operands) {
    function Instruction(def, op) {
        this.def = null;
        this.op = null;
        // Instruction parts.
        this.prefixLock = null;
        this.opcode = new p.Opcode; // required
        this.modrm = null;
        this.sib = null;
        this.displacement = null;
        this.immediate = null;
        // Direction for register-to-register `MOV` operations, whether REG field of Mod-R/M byte is destination.
        this.regToRegDirectionRegIsDst = true;
        // Index where instruction was inserted in `Code`s buffer.
        this.index = 0;
        // Byte offset of the instruction in compiled machine code.
        this.offset = 0;
        this.def = def;
        this.op = op;
    }
    Instruction.prototype.getMemoryOperand = function () {
        if (this.op.dst instanceof o.Memory)
            return this.op.dst;
        if (this.op.src instanceof o.Memory)
            return this.op.src;
        return null;
    };
    Instruction.prototype.writePrefixes = function (arr) {
        if (this.prefixLock)
            this.prefixLock.write(arr);
        // for(var pfx of this.prefixes) pfx.write(arr);
    };
    Instruction.prototype.write = function (arr) {
        this.writePrefixes(arr);
        this.opcode.write(arr);
        if (this.modrm)
            this.modrm.write(arr);
        if (this.sib)
            this.sib.write(arr);
        if (this.displacement)
            this.displacement.write(arr);
        if (this.immediate)
            this.immediate.write(arr);
        return arr;
    };
    Instruction.prototype.lock = function () {
        this.prefixLock = new p.PrefixLock;
        // TODO: check LOCK is allowed for this instruction.
        return this;
    };
    // http://wiki.osdev.org/X86-64_Instruction_Encoding#Operand-size_and_address-size_override_prefix
    Instruction.prototype.getOperandSize = function () {
    };
    Instruction.prototype.getAddressSize = function () {
    };
    Instruction.prototype.create = function () {
        var op = this.op;
        var dstreg = null;
        var dstmem = null;
        var srcreg = null;
        var srcmem = null;
        // Destination
        if (op.dst instanceof o.Register)
            dstreg = op.dst;
        else if (op.dst instanceof o.Memory)
            dstmem = op.dst;
        else if (op.dst)
            throw TypeError("Destination operand should be Register or Memory; given: " + op.dst.toString());
        // Source
        if (op.src) {
            if (op.src instanceof o.Register)
                srcreg = op.src;
            else if (op.src instanceof o.Memory)
                srcmem = op.src;
            else if (!(op.src instanceof o.Constant))
                throw TypeError("Source operand should be Register, Memory or Constant");
        }
        // Create instruction parts.
        this.createPrefixes();
        this.createOpcode();
        this.createModrm();
        this.createSib(dstmem, srcmem);
        this.createDisplacement(dstmem, srcmem);
        this.createImmediate();
    };
    Instruction.prototype.hasExtendedRegister = function () {
        var _a = this.op, dst = _a.dst, src = _a.src;
        if (dst && dst.reg() && dst.reg().isExtended())
            return true;
        if (src && src.reg() && src.reg().isExtended())
            return true;
        return false;
    };
    Instruction.prototype.hasRegisterOfSize = function (size) {
        var _a = this.op, dst = _a.dst, src = _a.src;
        if (dst && dst.reg() && (dst.reg().size === size))
            return true;
        if (src && src.reg() && (src.reg().size === size))
            return true;
        return false;
    };
    Instruction.prototype.createPrefixes = function () {
    };
    Instruction.prototype.createOpcode = function () {
        var def = this.def;
        var opcode = this.opcode;
        opcode.op = def.op;
        var _a = this.op, dst = _a.dst, src = _a.src;
        if (def.regInOp) {
            // We have register encoded in op-code here.
            if (!dst || !dst.isRegister())
                throw TypeError("Operation needs destination register.");
            opcode.op = (opcode.op & p.Opcode.MASK_OP) | dst.get3bitId();
        }
        else {
        }
        opcode.regIsDest = def.regIsDest;
        opcode.isSizeWord = def.isSizeWord;
        opcode.regInOp = def.regInOp;
    };
    Instruction.prototype.getModrmMod = function (mem) {
        if (!mem.displacement)
            return p.Modrm.MOD.INDIRECT;
        else if (mem.displacement.size === o.DisplacementValue.SIZE.DISP8)
            return p.Modrm.MOD.DISP8;
        else
            return p.Modrm.MOD.DISP32;
    };
    Instruction.prototype.createModrm = function () {
        // TODO: 2.2.1.6 RIP-Relative Addressing
        var _a = this.op, dst = _a.dst, src = _a.src;
        var has_opreg = (this.def.opreg > -1);
        var dst_in_modrm = !this.def.regInOp && dst;
        if (has_opreg || src || dst_in_modrm) {
            var mod = 0, reg = 0, rm = 0;
            // opreg reg
            // opreg mem
            if (has_opreg) {
                reg = this.def.opreg;
                if (dst.isRegister()) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                    rm = dst.get3bitId();
                }
                else if (dst.isMemory()) {
                    var mem = dst;
                    mod = p.Modrm.getMod(mem);
                    rm = p.Modrm.getRm(mem);
                }
                else {
                    throw TypeError('Destination must be Register or Memory.');
                }
            }
            else if (!dst)
                throw TypeError('No destination operand.');
            else if (dst.isRegister()) {
                reg = dst.get3bitId();
                if (!src) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                }
                else if (src) {
                    if (src.isRegister()) {
                        mod = p.Modrm.MOD.REG_TO_REG;
                        rm = src.get3bitId();
                    }
                    else if (src.isMemory()) {
                        var mem = src;
                        mod = p.Modrm.getMod(mem);
                        rm = p.Modrm.getRm(mem);
                    }
                    else
                        throw TypeError('Source must be Register or Memory.');
                }
            }
            else if (dst.isMemory()) {
                var mem = dst;
                mod = p.Modrm.getMod(mem);
                rm = p.Modrm.getRm(mem);
                if (!src) {
                    reg = 0; // TODO: ?!?!
                }
                else if (src.isRegister()) {
                    reg = src.get3bitId();
                }
                else if (src.isMemory())
                    throw TypeError('Cannot do Memory to Memory operation.');
                else {
                    // TODO: other operand = o.Constant
                    throw TypeError('Not supported yet.');
                }
            }
            this.modrm = new p.Modrm(mod, reg, rm);
        }
    };
    Instruction.prototype.sibNeeded = function () {
        if (!this.modrm)
            return false;
        if (this.modrm.rm !== p.Modrm.RM_NEEDS_SIB)
            return true;
        if ((this.modrm.mod === p.Modrm.MOD.INDIRECT) && (this.modrm.rm === p.Modrm.RM_INDIRECT_SIB))
            return true;
        return false;
    };
    Instruction.prototype.createSib = function () {
        if (!this.sibNeeded())
            return;
        var mem = this.getMemoryOperand();
        if (!mem)
            throw Error('No Memory operand to encode SIB.');
        var userscale = 0, I = 0, B = 0;
        if (mem.scale)
            userscale = mem.scale.value;
        if (mem.index) {
            I = mem.index.get3bitId();
            if (I === p.Sib.INDEX_NONE)
                throw Error("Register " + mem.index.toString() + " cannot be used as SIB index.");
        }
        else {
            I = p.Sib.INDEX_NONE;
        }
        if (mem.base) {
            B = mem.base.get3bitId();
        }
        else
            B = p.Sib.BASE_NONE;
        this.sib = new p.Sib(userscale, I, B);
    };
    Instruction.prototype.createDisplacement = function () {
        var mem = this.getMemoryOperand();
        if (!mem)
            return;
        if (mem.displacement) {
            this.displacement = new p.Displacement(mem.displacement);
        }
        else if (mem.base && (mem.base.get3bitId() === p.Sib.BASE_DISP)) {
            // RBP always has displacement, because RBP without displacement is used
            // to encode disp32 without SIB.base.
            if (!mem.displacement)
                this.displacement = new p.Displacement(new o.DisplacementValue(0));
        }
    };
    Instruction.prototype.createImmediate = function () {
        if (this.op.imm) {
            if (this.displacement && (this.displacement.value.size === 64 /* QUAD */))
                throw TypeError("Cannot have Immediate with " + 64 /* QUAD */ + " bit Displacement.");
            this.immediate = new p.Immediate(this.op.imm);
        }
    };
    return Instruction;
}());
exports.Instruction = Instruction;

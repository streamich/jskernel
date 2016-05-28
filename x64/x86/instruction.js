"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var o = require('./operand');
var p = require('./parts');
var Expression = (function () {
    function Expression() {
        // Index where instruction was inserted in `Code`s buffer.
        this.index = 0;
        // Byte offset of the instruction in compiled machine code.
        this.offset = -1;
    }
    return Expression;
}());
exports.Expression = Expression;
var Label = (function (_super) {
    __extends(Label, _super);
    function Label(name) {
        _super.call(this);
        this.name = name;
    }
    Label.prototype.write = function (arr) {
        return arr;
    };
    Label.prototype.toString = function () {
        return this.name + ':';
    };
    return Label;
}(Expression));
exports.Label = Label;
var Data = (function (_super) {
    __extends(Data, _super);
    function Data() {
        _super.apply(this, arguments);
        this.octets = [];
    }
    Data.prototype.write = function (arr) {
        this.offset = arr.length;
        arr = arr.concat(this.octets);
        return arr;
    };
    Data.prototype.toString = function (margin) {
        if (margin === void 0) { margin = '    '; }
        return margin + 'db';
    };
    return Data;
}(Expression));
exports.Data = Data;
var DataUninitialized = (function (_super) {
    __extends(DataUninitialized, _super);
    function DataUninitialized(length) {
        _super.call(this);
        this.length = length;
    }
    DataUninitialized.prototype.write = function (arr) {
        this.offset = arr.length;
        arr = arr.concat(new Array(this.length));
        return arr;
    };
    DataUninitialized.prototype.toString = function (margin) {
        if (margin === void 0) { margin = '    '; }
        return margin + 'resb ' + this.length;
    };
    return DataUninitialized;
}(Expression));
exports.DataUninitialized = DataUninitialized;
// ## x86_64 `Instruction`
//
// `Instruction` object is created using instruction `Definition` and `Operands` provided by the user,
// out of those `Instruction` generates `InstructionPart`s, which then can be packaged into machine
// code using `.write()` method.
var Instruction = (function (_super) {
    __extends(Instruction, _super);
    // constructor(code: Code, def: Definition, op: Operands) {
    function Instruction(def, op) {
        _super.call(this);
        this.def = null;
        this.op = null;
        // Instruction parts.
        this.prefixLock = null;
        this.prefixSegment = null;
        this.opcode = new p.Opcode; // required
        this.modrm = null;
        this.sib = null;
        this.displacement = null;
        this.immediate = null;
        // Direction for register-to-register `MOV` operations, whether REG field of Mod-R/M byte is destination.
        // We set this to `false` to be compatible with GAS assembly, which we use for testing.
        this.regToRegDirectionRegIsDst = false;
        this.def = def;
        this.op = op;
    }
    Instruction.prototype.writePrefixes = function (arr) {
        if (this.prefixLock)
            this.prefixLock.write(arr);
        if (this.prefixSegment)
            this.prefixSegment.write(arr);
    };
    Instruction.prototype.write = function (arr) {
        this.offset = arr.length;
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
        if (!this.def.lock)
            throw Error("Instruction \"" + this.def.mnemonic + "\" does not support LOCK.");
        this.prefixLock = new p.PrefixLock;
        return this;
    };
    Instruction.prototype.cs = function () {
        this.prefixSegment = new p.PrefixStatic(p.PREFIX.CS);
        return this;
    };
    Instruction.prototype.ss = function () {
        this.prefixSegment = new p.PrefixStatic(p.PREFIX.SS);
        return this;
    };
    Instruction.prototype.ds = function () {
        this.prefixSegment = new p.PrefixStatic(p.PREFIX.DS);
        return this;
    };
    Instruction.prototype.es = function () {
        this.prefixSegment = new p.PrefixStatic(p.PREFIX.ES);
        return this;
    };
    Instruction.prototype.fs = function () {
        this.prefixSegment = new p.PrefixStatic(p.PREFIX.FS);
        return this;
    };
    Instruction.prototype.gs = function () {
        this.prefixSegment = new p.PrefixStatic(p.PREFIX.GS);
        return this;
    };
    // http://wiki.osdev.org/X86-64_Instruction_Encoding#Operand-size_and_address-size_override_prefix
    Instruction.prototype.getOperandSize = function () {
    };
    Instruction.prototype.getAddressSize = function () {
    };
    // Create instruction parts.
    Instruction.prototype.create = function () {
        this.createPrefixes();
        this.createOpcode();
        this.createModrm();
        this.createSib();
        this.createDisplacement();
        this.createImmediate();
    };
    Instruction.prototype.toString = function (margin) {
        if (margin === void 0) { margin = '    '; }
        var parts = [];
        if (this.prefixLock)
            parts.push(this.prefixLock.toString());
        if (this.prefixSegment)
            parts.push(this.prefixSegment.toString());
        parts.push(this.def.mnemonic);
        if ((parts.join(' ')).length < 8)
            parts.push((new Array(7 - (parts.join(' ')).length)).join(' '));
        if (this.op.list.length)
            parts.push(this.op.toString());
        return margin + parts.join(' ');
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
    Instruction.prototype.createPrefixes = function () { };
    Instruction.prototype.createOpcode = function () {
        var def = this.def;
        var opcode = this.opcode;
        opcode.op = def.opcode;
        var _a = this.op, dst = _a.dst, src = _a.src;
        if (def.regInOp) {
            // We have register encoded in op-code here.
            if (!dst || !dst.isRegister())
                throw TypeError("Operation needs destination register.");
            opcode.op = (opcode.op & p.Opcode.MASK_OP) | dst.get3bitId();
        }
        else {
            // Direction bit `d`
            if (this.def.opcodeDirectionBit) {
                var direction = p.Opcode.DIRECTION.REG_IS_DST;
                if (src instanceof o.Register) {
                    direction = p.Opcode.DIRECTION.REG_IS_SRC;
                }
                // *reg-to-reg* operation
                if ((dst instanceof o.Register) && (src instanceof o.Register)) {
                    if (this.regToRegDirectionRegIsDst)
                        direction = p.Opcode.DIRECTION.REG_IS_DST;
                    else
                        direction = p.Opcode.DIRECTION.REG_IS_SRC;
                }
                opcode.op = (opcode.op & p.Opcode.MASK_DIRECTION) | direction;
            }
        }
    };
    Instruction.prototype.createModrm = function () {
        if (!this.op.hasRegisterOrMemory())
            return;
        var _a = this.op, dst = _a.dst, src = _a.src;
        var has_opreg = (this.def.opreg > -1);
        var dst_in_modrm = !this.def.regInOp && !!dst; // Destination operand is NOT encoded in main op-code byte.
        if (has_opreg || dst_in_modrm) {
            var mod = 0, reg = 0, rm = 0;
            if (has_opreg) {
                // If we have `opreg`, then instruction has up to one operand.
                reg = this.def.opreg;
                var r = this.op.getRegisterOperand();
                if (r) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                    rm = r.get3bitId();
                    this.modrm = new p.Modrm(mod, reg, rm);
                    return;
                }
            }
            else {
                var r = this.op.getRegisterOperand(this.regToRegDirectionRegIsDst);
                if (r) {
                    mod = p.Modrm.MOD.REG_TO_REG;
                    reg = r.get3bitId();
                }
            }
            if (!dst) {
                this.modrm = new p.Modrm(mod, reg, rm);
                return;
            }
            // Reg-to-reg instruction;
            if ((dst instanceof o.Register) && (src instanceof o.Register)) {
                mod = p.Modrm.MOD.REG_TO_REG;
                var rmreg = (this.regToRegDirectionRegIsDst ? src : dst);
                rm = rmreg.get3bitId();
                this.modrm = new p.Modrm(mod, reg, rm);
                return;
            }
            // `o.Memory` class makes sure that ESP cannot be a SIB index register and
            // that EBP always has displacement value even if 0x00.
            var m = this.op.getMemoryOperand();
            if (!m) {
                // throw Error('No Memory reference for Modrm byte.');
                this.modrm = new p.Modrm(mod, reg, rm);
                return;
            }
            if (!m.base && !m.index && !m.displacement)
                throw TypeError('Invalid Memory reference.');
            if (m.index && !m.scale)
                throw TypeError('Memory Index reference needs Scale factor.');
            // dispX
            // We use `disp32` with SIB byte version because the version without SIB byte
            // will be used for RIP-relative addressing.
            if (!m.base && !m.index && m.displacement) {
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
            if (m.base && !m.index) {
                mod = p.Modrm.getModDispSize(m);
                if (mod === p.Modrm.MOD.DISP32)
                    m.displacement.signExtend(o.DisplacementValue.SIZE.DISP32);
                // SIB byte follows in `[RSP]` case, and `[RBP]` is impossible as RBP
                // always has a displacement, [RBP] case is used for RIP-relative addressing.
                rm = m.base.get3bitId();
                this.modrm = new p.Modrm(mod, reg, rm);
                return;
            }
            // [BASE + INDEX x SCALE] + dispX
            if (m.base || m.index) {
                mod = p.Modrm.getModDispSize(m);
                if (m.displacement)
                    if ((mod === p.Modrm.MOD.DISP32) || (mod === p.Modrm.MOD.INDIRECT))
                        m.displacement.signExtend(o.DisplacementValue.SIZE.DISP32);
                rm = p.Modrm.RM.NEEDS_SIB; // SIB byte follows
                this.modrm = new p.Modrm(mod, reg, rm);
                return;
            }
            throw Error('Fatal error, unreachable code.');
        }
    };
    Instruction.prototype.createSib = function () {
        if (!this.modrm)
            return;
        if (this.modrm.mod === p.Modrm.MOD.REG_TO_REG)
            return;
        if ((this.modrm.rm !== p.Modrm.RM.NEEDS_SIB))
            return;
        var m = this.op.getMemoryOperand();
        if (!m)
            throw Error('No Memory operand to encode SIB.');
        var scalefactor = 0, I = 0, B = 0;
        if (m.scale)
            scalefactor = m.scale.value;
        if (m.index) {
            I = m.index.get3bitId();
            // RSP register cannot be used as index, `o.Memory` class already ensures it
            // if used in normal way.
            if (I === p.Sib.INDEX_NONE)
                throw Error("Register " + m.index.toString() + " cannot be used as SIB index.");
        }
        else {
            I = p.Sib.INDEX_NONE;
        }
        if (m.base) {
            B = m.base.get3bitId();
        }
        else
            B = p.Sib.BASE_NONE;
        this.sib = new p.Sib(scalefactor, I, B);
    };
    Instruction.prototype.createDisplacement = function () {
        var m = this.op.getMemoryOperand();
        if (m && m.displacement) {
            this.displacement = new p.Displacement(m.displacement);
        }
        else if (this.modrm && this.sib && (this.sib.B === p.Sib.BASE_NONE)) {
            // Some SIB byte encodings require displacement, if we don't have displacement yet
            // add zero displacement.
            var disp = null;
            switch (this.modrm.mod) {
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
            if (disp)
                this.displacement = new p.Displacement(disp);
        }
    };
    Instruction.prototype.createImmediate = function () {
        var imm = this.op.getImmediate();
        if (imm) {
            // if (this.displacement && (this.displacement.value.size === o.SIZE.QUAD))
            //     throw TypeError(`Cannot have Immediate with ${o.SIZE.QUAD} bit Displacement.`);
            this.immediate = new p.Immediate(imm);
        }
    };
    return Instruction;
}(Expression));
exports.Instruction = Instruction;

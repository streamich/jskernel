"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var code = require('./code');
var o = require('./operand');
var def_1 = require('./def');
var i = require('./instruction');
var p = require('./parts');
var util_1 = require('./util');
var opcode_1 = require('./opcode');
var x64;
(function (x64) {
    var defDefaults = {
        size: 32,
        addrSize: 64,
    };
    function insdef(defs) {
        return new def_1.Definition(util_1.extend({}, defDefaults, defs));
    }
    var INC = insdef({ op: opcode_1.OP.INC, opreg: opcode_1.OPREG.INC });
    var DEC = insdef({ op: opcode_1.OP.DEC, opreg: opcode_1.OPREG.DEC });
    var INT = insdef({ op: opcode_1.OP.INT, hasImmediate: true });
    var SYSCALL = insdef({ op: opcode_1.OP.SYSCALL });
    var SYSENTER = insdef({ op: opcode_1.OP.SYSENTER });
    var SYSEXIT = insdef({ op: opcode_1.OP.SYSEXIT });
    var Instruction = (function (_super) {
        __extends(Instruction, _super);
        function Instruction() {
            _super.apply(this, arguments);
            this.prefixRex = null;
        }
        Instruction.prototype.writePrefixes = function (arr) {
            _super.prototype.writePrefixes.call(this, arr);
            if (this.prefixRex)
                this.prefixRex.write(arr);
        };
        Instruction.prototype.needsOperandSizeChange = function () {
            return (this.def.size == 32 /* DOUBLE */) && this.hasRegisterOfSize(64 /* QUAD */);
        };
        Instruction.prototype.createPrefixes = function () {
            _super.prototype.createPrefixes.call(this);
            if (this.def.mandatoryRex || this.needsOperandSizeChange() || this.hasExtendedRegister())
                this.prefixRex = this.createRex();
        };
        Instruction.prototype.createRex = function () {
            var W = 0, R = 0, X = 0, B = 0;
            if (this.needsOperandSizeChange())
                W = 1;
            var _a = this.op, dst = _a.dst, src = _a.src;
            if (dst && dst.reg() && dst.reg().isExtended())
                R = 1;
            if (src && src.reg() && src.reg().isExtended())
                B = 1;
            var mem = this.getMemoryOperand();
            if (mem) {
                if (mem.base && mem.base.isExtended())
                    B = 1;
                if (mem.index && mem.index.isExtended())
                    X = 1;
            }
            // if(!this.regToRegDirectionRegIsDst) [R, B] = [B, R];
            return new p.PrefixRex(W, R, X, B);
        };
        // Adding RIP-relative addressing in long mode.
        //
        // > In the 64-bit mode, any instruction that uses ModRM addressing can use RIP-relative addressing.
        //
        // > Without RIP-relative addressing, ModRM instructions address memory relative to zero. With RIP-relative
        // > addressing, ModRM instructions can address memory relative to the 64-bit RIP using a signed
        // > 32-bit displacement.
        Instruction.prototype.createModrm = function () {
            var mem = this.getMemoryOperand();
            if (mem && mem.base && (mem.base instanceof o.RegisterRip)) {
                var disp = mem.displacement;
                if (!disp)
                    throw TypeError('RIP-relative addressing requires 4-byte displacement.');
                if (mem.index || mem.scale)
                    throw TypeError('RIP-relative addressing does not support index and scale addressing.');
                if (disp.size < 32 /* DOUBLE */)
                    disp.zeroExtend(32 /* DOUBLE */);
            }
            else
                _super.prototype.createModrm.call(this);
        };
        // Adding RIP-relative addressing in long mode.
        Instruction.prototype.sibNeeded = function () {
            // RIP-relative addressing overwrites this case, uses it without SIB byte to specify RIP + disp32.
            if ((this.modrm.mod === p.Modrm.MOD.INDIRECT) && (this.modrm.rm === p.Modrm.RM_INDIRECT_SIB))
                return false;
            return _super.prototype.sibNeeded.call(this);
        };
        return Instruction;
    }(i.Instruction));
    x64.Instruction = Instruction;
    var Code = (function (_super) {
        __extends(Code, _super);
        function Code() {
            _super.apply(this, arguments);
            this.ClassInstruction = Instruction;
        }
        Code.prototype.incq = function (dst) {
            return this.insOneOperand(INC, dst);
        };
        Code.prototype.decq = function (dst) {
            return this.insOneOperand(DEC, dst);
        };
        Code.prototype.int = function (num) {
            if (typeof num !== 'number')
                throw TypeError('INT argument must be of type number.');
            return this.insImmediate(INT, num, false);
        };
        Code.prototype.syscall = function () {
            return this.insZeroOperands(SYSCALL);
        };
        Code.prototype.sysenter = function () {
            return this.insZeroOperands(SYSENTER);
        };
        Code.prototype.sysexit = function () {
            return this.insZeroOperands(SYSEXIT);
        };
        return Code;
    }(code.Code));
    x64.Code = Code;
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
    var FuzzyInstruction = (function (_super) {
        __extends(FuzzyInstruction, _super);
        function FuzzyInstruction() {
            _super.apply(this, arguments);
            this.regToRegDirectionRegIsDst = !(Math.random() > 0.5);
        }
        FuzzyInstruction.prototype.oneOrZero = function () {
            return Math.random() > 0.5 ? 1 : 0;
        };
        // Randomize unused bits in REX byte.
        FuzzyInstruction.prototype.createRex = function () {
            var rex = _super.prototype.createRex.call(this);
            var _a = this.op, dst = _a.dst, src = _a.src;
            if (!dst && !src) {
                rex.X = this.oneOrZero();
                if (!src)
                    rex.B = this.oneOrZero();
            }
            return rex;
        };
        return FuzzyInstruction;
    }(Instruction));
    x64.FuzzyInstruction = FuzzyInstruction;
    var FuzzyCode = (function (_super) {
        __extends(FuzzyCode, _super);
        function FuzzyCode() {
            _super.apply(this, arguments);
            this.ClassInstruction = FuzzyInstruction;
        }
        FuzzyCode.prototype.nop = function (size) {
            if (size === void 0) { size = 1; }
        };
        return FuzzyCode;
    }(Code));
    x64.FuzzyCode = FuzzyCode;
})(x64 = exports.x64 || (exports.x64 = {}));

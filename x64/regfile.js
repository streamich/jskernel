"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Operand = (function () {
    function Operand() {
        this.isRegister = false;
        this.isMemory = false;
    }
    Operand.prototype.toString = function () {
        return '[operand]';
    };
    return Operand;
}());
exports.Operand = Operand;
var Register = (function (_super) {
    __extends(Register, _super);
    function Register(id, name, size, type) {
        if (type === void 0) { type = 0 /* GENERAL_PURPOSE */; }
        _super.call(this);
        this.isExtended = false; // Is one of the standard 8 registers: RAX, RBX,...
        this.isRegister = true;
        this.id = id;
        this.type = type;
        this.name = name;
        this.size = size;
    }
    Register.prototype.disp = function (disp) {
        return (new MemoryReference).ref(this).disp(disp);
    };
    Register.prototype.ref = function (index, scale) {
        if (index === void 0) { index = null; }
        if (scale === void 0) { scale = 0; }
        return (new MemoryReference).ref(this).ind(index, scale);
    };
    Register.prototype.ind = function (scale) {
        if (scale === void 0) { scale = 1; }
        return (new MemoryReference).ind(this, scale);
    };
    Register.prototype.toString = function () {
        return this.name;
    };
    return Register;
}(Operand));
exports.Register = Register;
var Register64 = (function (_super) {
    __extends(Register64, _super);
    function Register64(id, name, type) {
        if (type === void 0) { type = 0 /* GENERAL_PURPOSE */; }
        _super.call(this, id, name, 64, type);
    }
    return Register64;
}(Register));
exports.Register64 = Register64;
var Register64E = (function (_super) {
    __extends(Register64E, _super);
    function Register64E() {
        _super.apply(this, arguments);
        this.isExtended = true; // Extended register.
    }
    return Register64E;
}(Register64));
exports.Register64E = Register64E;
var Register32 = (function (_super) {
    __extends(Register32, _super);
    function Register32(parent, id, name, type) {
        if (type === void 0) { type = 0 /* GENERAL_PURPOSE */; }
        _super.call(this, id, name, 32, type);
        this.offset = 32;
        this.size = 32;
        this.parent = parent;
    }
    return Register32;
}(Register));
exports.Register32 = Register32;
var Register32E = (function (_super) {
    __extends(Register32E, _super);
    function Register32E() {
        _super.apply(this, arguments);
        this.isExtended = true; // Extended register.
    }
    return Register32E;
}(Register32));
exports.Register32E = Register32E;
var Register8 = (function (_super) {
    __extends(Register8, _super);
    function Register8(parent, id, name, type) {
        if (type === void 0) { type = 0 /* GENERAL_PURPOSE */; }
        _super.call(this, id, name, 8, type);
        this.offset = 56;
        this.size = 8;
        this.parent = parent;
    }
    return Register8;
}(Register));
exports.Register8 = Register8;
var Register8E = (function (_super) {
    __extends(Register8E, _super);
    function Register8E() {
        _super.apply(this, arguments);
        this.isExtended = true; // Extended register.
    }
    return Register8E;
}(Register8));
exports.Register8E = Register8E;
var MemoryReference = (function (_super) {
    __extends(MemoryReference, _super);
    function MemoryReference() {
        _super.apply(this, arguments);
        this.isMemory = true;
        this.base = null;
        this.displacement = 0;
        this.scale = 0;
        this.index = null;
    }
    MemoryReference.prototype.disp = function (disp) {
        this.displacement = disp;
        return this;
    };
    MemoryReference.prototype.ind = function (index, scale) {
        if (index === void 0) { index = null; }
        if (scale === void 0) { scale = 1; }
        var scale_values = [1, 2, 4, 8];
        // Validate inputs.
        if (index && !(index instanceof Register))
            throw Error("Reference index must be a register.");
        if (index && ((typeof scale != 'number') || scale_values.indexOf(scale) < 0))
            throw Error("Scale value must be one of " + scale_values + ".");
        this.index = index;
        switch (scale) {
            case 1:
                this.scale = 0;
                break;
            case 2:
                this.scale = 1;
                break;
            case 4:
                this.scale = 2;
                break;
            case 8:
                this.scale = 3;
                break;
        }
        return this;
    };
    MemoryReference.prototype.ref = function (base) {
        this.base = base;
        return this;
    };
    MemoryReference.prototype.toString = function () {
        return "[" + this.base.toString() + " + " + this.index + " * " + (Math.pow(2, this.scale)) + "]";
    };
    return MemoryReference;
}(Operand));
exports.MemoryReference = MemoryReference;
exports.rax = new Register64(0 /* RAX */, 'rax', 1 /* GENERAL_PURPOSE_SPECIAL */);
exports.rbx = new Register64(3 /* RBX */, 'rbx');
exports.rcx = new Register64(1 /* RCX */, 'rcx', 1 /* GENERAL_PURPOSE_SPECIAL */);
exports.rdx = new Register64(2 /* RDX */, 'rdx', 1 /* GENERAL_PURPOSE_SPECIAL */);
exports.rsi = new Register64(6 /* RSI */, 'rsi');
exports.rdi = new Register64(7 /* RDI */, 'rdi');
exports.rbp = new Register64(5 /* RBP */, 'rbp', 3 /* BASE_POINTER */);
exports.rsp = new Register64(4 /* RSP */, 'rsp', 2 /* STACK_POINTER */);
exports.r8 = new Register64E(0 /* R8 */, 'r8');
exports.r9 = new Register64E(1 /* R9 */, 'r9');
exports.r10 = new Register64E(2 /* R10 */, 'r10');
exports.r11 = new Register64E(3 /* R11 */, 'r11');
exports.r12 = new Register64E(4 /* R12 */, 'r12');
exports.r13 = new Register64E(5 /* R13 */, 'r13');
exports.r14 = new Register64E(6 /* R14 */, 'r14');
exports.r15 = new Register64E(7 /* R15 */, 'r15');
exports.eax = new Register32(exports.rax, 0 /* EAX */, 'eax', exports.rax.type);
exports.ebx = new Register32(exports.rbx, 3 /* EBX */, 'ebx', exports.rbx.type);
exports.ecx = new Register32(exports.rcx, 1 /* ECX */, 'ecx', exports.rcx.type);
exports.edx = new Register32(exports.rdx, 2 /* EDX */, 'edx', exports.rdx.type);
exports.esi = new Register32(exports.rsi, 6 /* ESI */, 'esi', exports.rsi.type);
exports.edi = new Register32(exports.rdi, 7 /* EDI */, 'edi', exports.rdi.type);
exports.ebp = new Register32(exports.rbp, 5 /* EBP */, 'ebp', exports.rbp.type);
exports.esp = new Register32(exports.rsp, 4 /* ESP */, 'esp', exports.rsp.type);
exports.r8d = new Register32E(exports.r8, 0 /* R8D */, 'r8d', exports.r8.type);
exports.r9d = new Register32E(exports.r9, 1 /* R9D */, 'r9d', exports.r9.type);
exports.r10d = new Register32E(exports.r10, 2 /* R10D */, 'r10d', exports.r10.type);
exports.r11d = new Register32E(exports.r11, 3 /* R11D */, 'r11d', exports.r11.type);
exports.r12d = new Register32E(exports.r12, 4 /* R12D */, 'r12d', exports.r12.type);
exports.r13d = new Register32E(exports.r13, 5 /* R13D */, 'r13d', exports.r13.type);
exports.r14d = new Register32E(exports.r14, 6 /* R14D */, 'r14d', exports.r14.type);
exports.r15d = new Register32E(exports.r15, 7 /* R15D */, 'r15d', exports.r15.type);
exports.al = new Register8(exports.rax, 0 /* AL */, 'al', exports.rax.type);
exports.bl = new Register8(exports.rbx, 3 /* BL */, 'bl', exports.rbx.type);
exports.cl = new Register8(exports.rcx, 1 /* CL */, 'cl', exports.rcx.type);
exports.dl = new Register8(exports.rdx, 2 /* DL */, 'dl', exports.rdx.type);
exports.sil = new Register8(exports.rsi, 6 /* SIL */, 'sil', exports.rsi.type);
exports.dil = new Register8(exports.rdi, 7 /* DIL */, 'dil', exports.rdi.type);
exports.bpl = new Register8(exports.rbp, 5 /* BPL */, 'bpl', exports.rbp.type);
exports.spl = new Register8(exports.rsp, 4 /* SPL */, 'spl', exports.rsp.type);
exports.r8b = new Register8E(exports.r8, 0 /* R8B */, 'r8b', exports.r8.type);
exports.r9b = new Register8E(exports.r9, 1 /* R9B */, 'r9b', exports.r9.type);
exports.r10b = new Register8E(exports.r10, 2 /* R10B */, 'r10b', exports.r10.type);
exports.r11b = new Register8E(exports.r11, 3 /* R11B */, 'r11b', exports.r11.type);
exports.r12b = new Register8E(exports.r12, 4 /* R12B */, 'r12b', exports.r12.type);
exports.r13b = new Register8E(exports.r13, 5 /* R13B */, 'r13b', exports.r13.type);
exports.r14b = new Register8E(exports.r14, 6 /* R14B */, 'r14b', exports.r14.type);
exports.r15b = new Register8E(exports.r15, 7 /* R15B */, 'r15b', exports.r15.type);

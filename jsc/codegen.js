"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var dom_1 = require('./c/dom');
var code_1 = require('../ass-js/x86/x64/code');
var operand_1 = require('../ass-js/x86/operand');
var INT_SIZE = 8;
var MemoryLocationStack = (function (_super) {
    __extends(MemoryLocationStack, _super);
    function MemoryLocationStack(slot) {
        _super.call(this);
        this.slot = slot;
    }
    return MemoryLocationStack;
}(dom_1.MemoryLocation));
exports.MemoryLocationStack = MemoryLocationStack;
var StackSlot = (function () {
    function StackSlot(offset) {
        this.offset = offset;
    }
    return StackSlot;
}());
exports.StackSlot = StackSlot;
var StackFrame = (function () {
    function StackFrame(code) {
        this.size = 0;
        this.code = code;
    }
    StackFrame.prototype.allocateSlot = function () {
        this.size++;
        var slot = new StackSlot(this.size * INT_SIZE);
        return slot;
    };
    StackFrame.prototype.allocate = function (object) {
        var slot = this.allocateSlot();
        object.setMemoryLocation(new MemoryLocationStack(slot));
        this.code._('addStatement', object.value);
    };
    StackFrame.prototype.emitEpilogue = function () {
        this.code._('addStatement', operand_1.rbp);
        this.code._('mov', [operand_1.rbp, operand_1.rsp]);
    };
    StackFrame.prototype.emitPrologue = function () {
        this.code._('mov', [operand_1.rsp, operand_1.rbp]);
        this.code._('pop', operand_1.rbp);
    };
    return StackFrame;
}());
exports.StackFrame = StackFrame;
var RValue = (function () {
    function RValue() {
        this.register = null;
        this.vregister = null;
        this.slot = null;
        this.address = 0;
        this.value = 0;
    }
    RValue.fromObject = function (object) {
        if (object.location instanceof MemoryLocationStack) {
            var rvalue = new RValue;
            rvalue.store = 2;
            rvalue.slot = object.location.slot;
            return rvalue;
        }
        else
            throw Error('Cannot create RValue from Object.');
    };
    RValue.fromRegister = function (register) {
        var rvalue = new RValue;
        rvalue.store = 0;
        rvalue.register = register;
        return rvalue;
    };
    RValue.fromVirtualRegister = function (register) {
        var rvalue = new RValue;
        rvalue.store = 1;
        rvalue.vregister = register;
        return rvalue;
    };
    return RValue;
}());
exports.RValue = RValue;
var LValue = (function (_super) {
    __extends(LValue, _super);
    function LValue() {
        _super.apply(this, arguments);
    }
    return LValue;
}(RValue));
exports.LValue = LValue;
var VirtualRegister = (function () {
    function VirtualRegister(register, slot) {
        if (slot === void 0) { slot = null; }
        this.isAvailable = false;
        this.register = register;
        this.stackSlot = slot;
    }
    return VirtualRegister;
}());
exports.VirtualRegister = VirtualRegister;
var VirtualRegisterFile = (function () {
    function VirtualRegisterFile(stack) {
        this.registers = [];
        this.scratchRegisters = [operand_1.rcx, operand_1.rdi, operand_1.rsi, operand_1.r8, operand_1.r9, operand_1.r10, operand_1.r11];
        this.stack = stack;
    }
    VirtualRegisterFile.prototype.allocate = function () {
        for (var _i = 0, _a = this.registers; _i < _a.length; _i++) {
            var reg = _a[_i];
            if (reg.isAvailable) {
                reg.isAvailable = false;
                return reg;
            }
        }
        if (this.registers.length < this.scratchRegisters.length) {
            var reg = new VirtualRegister(this.scratchRegisters[this.registers.length]);
            this.registers.push(reg);
            return reg;
        }
        else {
            var reg = new VirtualRegister(null, this.stack.allocateSlot());
            this.registers.push(reg);
            return reg;
        }
    };
    VirtualRegisterFile.prototype.free = function (reg) {
        reg.isAvailable = true;
    };
    return VirtualRegisterFile;
}());
exports.VirtualRegisterFile = VirtualRegisterFile;
var FunctionGenerator = (function () {
    function FunctionGenerator(codegen, func) {
        this.lable = null;
        this.codegen = codegen;
        this.code = codegen.code;
        this.func = func;
        this.stack = new StackFrame(this.code);
    }
    FunctionGenerator.prototype.emitFunctionPrologue = function () {
        this.stack.emitEpilogue();
    };
    FunctionGenerator.prototype.emitFunctionEpilogue = function () {
        this.stack.emitPrologue();
        this.code._('ret');
    };
    FunctionGenerator.prototype.emitDeclaration = function (decl) {
        this.stack.allocate(decl.object);
    };
    FunctionGenerator.prototype.load = function (rvalue, register) {
        switch (rvalue.store) {
            case 2:
                this.code._('mov', [operand_1.rbp.disp(-rvalue.slot.offset), register]);
                break;
            case 0:
                if (rvalue.register !== register) {
                    this.code._('mov', [register, rvalue.register]);
                }
                break;
            case 1:
                var vreg = rvalue.vregister;
                if (vreg.register) {
                    if (vreg.register !== register) {
                        this.code._('mov', [register, rvalue.register]);
                    }
                    else {
                        this.code._('mov', [register, operand_1.rbp.disp(-vreg.stackSlot.offset)]);
                    }
                }
                break;
            default:
                throw Error('Do not know how to load RValue.');
        }
    };
    FunctionGenerator.prototype.emitExpression = function (expression) {
        if (expression instanceof dom_1.AdditionExpression) {
            var expr = expression;
            var rvalue1 = this.emitExpression(expr.operand1);
            var rvalue2 = this.emitExpression(expr.operand2);
            this.load(rvalue1, operand_1.rax);
            this.load(rvalue2, operand_1.rdx);
            this.code._('add', [operand_1.rax, operand_1.rdx]);
            return RValue.fromRegister(operand_1.rax);
        }
        else if (expression instanceof dom_1.PrimaryExpression) {
            if (expression instanceof dom_1.PrimaryExpressionObject) {
                return RValue.fromObject(expression.operand);
            }
            else
                throw Error('Do not know how to emit expression of this kind.');
        }
        else
            throw Error('Do not know how to emit expression of this kind.');
    };
    FunctionGenerator.prototype.emitStatement = function (statement) {
        if (statement instanceof dom_1.ExpressionStatement) {
            this.emitExpression(statement.expression);
        }
        else if (statement instanceof dom_1.ReturnStatement) {
            var rvalue = this.emitExpression(statement.expression);
            this.emitFunctionEpilogue();
        }
        else {
            throw Error('Do not know how to emit statement of this kind.');
        }
    };
    FunctionGenerator.prototype.emit = function () {
        this.codegen.code.label(this.func.getIdentifier().getName());
        this.emitFunctionPrologue();
        var bodyItems = this.func.body.items;
        for (var _i = 0, bodyItems_1 = bodyItems; _i < bodyItems_1.length; _i++) {
            var item = bodyItems_1[_i];
            if (item instanceof dom_1.Declaration) {
                this.emitDeclaration(item);
            }
            else if (item instanceof dom_1.Statement) {
                this.emitStatement(item);
            }
        }
        var isLastStatementReturnStatement = bodyItems[bodyItems.length - 1] instanceof dom_1.ReturnStatement;
        if (!isLastStatementReturnStatement)
            this.emitFunctionEpilogue();
    };
    return FunctionGenerator;
}());
exports.FunctionGenerator = FunctionGenerator;
var Codegen = (function () {
    function Codegen() {
        this.code = new code_1.Code;
    }
    Codegen.prototype.translate = function (unit) {
        var _ = this.code;
        for (var _i = 0, _a = unit.externalDeclarations; _i < _a.length; _i++) {
            var decl = _a[_i];
            if (decl instanceof dom_1.FunctionDefinition) {
                var funcgen = new FunctionGenerator(this, decl);
                funcgen.emit();
            }
            else
                throw Error('Do not know how to translate external definition.');
        }
        console.log(_.toString());
        var bin = _.compile();
        console.log(_.toString());
        return bin;
    };
    return Codegen;
}());
exports.Codegen = Codegen;

"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var operand_1 = require('../../ass-js/x86/operand');
var operand_2 = require("../ir/operand");
exports.WORDSIZE = 8;
var RegisterInfo = (function () {
    function RegisterInfo() {
    }
    return RegisterInfo;
}());
exports.RegisterInfo = RegisterInfo;
var VirtualRegisterToRegister = (function () {
    function VirtualRegisterToRegister() {
    }
    return VirtualRegisterToRegister;
}());
exports.VirtualRegisterToRegister = VirtualRegisterToRegister;
var LocationPhysical = (function (_super) {
    __extends(LocationPhysical, _super);
    function LocationPhysical() {
        _super.apply(this, arguments);
    }
    return LocationPhysical;
}(operand_2.Location));
exports.LocationPhysical = LocationPhysical;
var LocationRegister = (function (_super) {
    __extends(LocationRegister, _super);
    function LocationRegister(register) {
        _super.call(this);
        this.register = register;
    }
    LocationRegister.prototype.toString = function () {
        return this.register.toString();
    };
    return LocationRegister;
}(LocationPhysical));
exports.LocationRegister = LocationRegister;
var LocationStack = (function (_super) {
    __extends(LocationStack, _super);
    function LocationStack(offset) {
        _super.call(this);
        this.offset = offset;
    }
    LocationStack.prototype.toString = function () {
        return '[rbp' + this.offset + ']';
    };
    return LocationStack;
}(LocationPhysical));
exports.LocationStack = LocationStack;
var RegisterFile = (function () {
    function RegisterFile() {
    }
    RegisterFile.prototype.registerize = function () {
    };
    return RegisterFile;
}());
exports.RegisterFile = RegisterFile;
var Stack = (function () {
    function Stack() {
        this.length = 0;
        this.slotLength = 0;
        this.argLength = 0;
    }
    Stack.prototype.allocate = function (variable) {
        this.length++;
        var slots = Math.ceil((variable.type.size / 8) / exports.WORDSIZE);
        this.slotLength += slots;
        var location = new LocationStack(-this.slotLength * exports.WORDSIZE);
        return location;
    };
    Stack.prototype.allocateArgument = function (index, type) {
        if (type === void 0) { type = null; }
        this.argLength++;
        return new LocationStack((this.argLength + 1) * exports.WORDSIZE);
    };
    return Stack;
}());
exports.Stack = Stack;
var CallingConvention = (function () {
    function CallingConvention() {
        this.stackAlignment = 0;
        this.returnRegister = operand_1.rax;
    }
    return CallingConvention;
}());
exports.CallingConvention = CallingConvention;
var CallingConventionC = (function (_super) {
    __extends(CallingConventionC, _super);
    function CallingConventionC() {
        _super.apply(this, arguments);
        this.scratchRegisters = [];
        this.argumentRegisters = [operand_1.rdi, operand_1.rsi, operand_1.rdx, operand_1.rcx, operand_1.r8, operand_1.r9];
        this.callerRegisters = [operand_1.rbx, operand_1.r12, operand_1.r13, operand_1.r14, operand_1.r15];
        this.calleeRegisters = [operand_1.rax, operand_1.rcx, operand_1.rdx, operand_1.rdi, operand_1.rsi, operand_1.r8, operand_1.r9, operand_1.r10, operand_1.r11];
        this.stackPointer = operand_1.rsp;
        this.basePointer = operand_1.rbp;
        this.returnRegister = operand_1.rax;
    }
    return CallingConventionC;
}(CallingConvention));
exports.CallingConventionC = CallingConventionC;
var ActivationRecord = (function () {
    function ActivationRecord() {
        this.regs = new RegisterFile;
        this.stack = new Stack;
    }
    ActivationRecord.prototype.storeArgument = function (index, operand) {
    };
    return ActivationRecord;
}());
exports.ActivationRecord = ActivationRecord;
var ActivationRecordC = (function (_super) {
    __extends(ActivationRecordC, _super);
    function ActivationRecordC() {
        _super.apply(this, arguments);
        this.cc = new CallingConventionC;
        this.regs = new RegisterFile;
        this.stack = new Stack;
        this.availableRegisters = [];
        this.argLength = 0;
        this.argBytes = 0;
        this.varLength = 0;
        this.varBytes = 0;
    }
    ActivationRecordC.prototype.emitEpilogue = function (_) {
        _._('push', operand_1.rbp);
        _._('mov', [operand_1.rbp, operand_1.rsp]);
    };
    ActivationRecordC.prototype.emitPrologue = function (_) {
        _._('mov', [operand_1.rsp, operand_1.rbp]);
        _._('pop', operand_1.rbp);
        _._('ret');
    };
    ActivationRecordC.prototype.storeArgument = function (index, operand) {
    };
    ActivationRecordC.prototype.allocateLocalVar = function (variable) {
        var varRegisters = this.availableRegisters;
        var location;
        if (this.varLength >= varRegisters.length) {
            location = this.stack.allocate(variable);
        }
        else {
            location = new LocationRegister(varRegisters[this.varLength]);
        }
        this.varLength++;
        return location;
    };
    ActivationRecordC.prototype.allocateArgument = function (arg) {
        var argRegisters = this.cc.argumentRegisters;
        var location;
        if (this.argLength >= argRegisters.length) {
            location = this.stack.allocateArgument(this.argLength - argRegisters.length);
        }
        else {
            location = new LocationRegister(argRegisters[this.argLength]);
        }
        this.argLength++;
        this.argBytes += exports.WORDSIZE;
        return location;
    };
    return ActivationRecordC;
}(ActivationRecord));
exports.ActivationRecordC = ActivationRecordC;
var LiveSet = (function () {
    function LiveSet() {
        this.ops = [];
    }
    return LiveSet;
}());
exports.LiveSet = LiveSet;
var Liveliness = (function () {
    function Liveliness() {
    }
    return Liveliness;
}());
exports.Liveliness = Liveliness;
var RegisterInterferenceGraph = (function () {
    function RegisterInterferenceGraph() {
    }
    return RegisterInterferenceGraph;
}());
exports.RegisterInterferenceGraph = RegisterInterferenceGraph;

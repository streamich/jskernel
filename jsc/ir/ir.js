"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var type_1 = require("./type");
var op = require('./operand');
var LocationActivationRecord = (function (_super) {
    __extends(LocationActivationRecord, _super);
    function LocationActivationRecord(id) {
        _super.call(this);
        this.id = 0;
        this.id = id;
    }
    LocationActivationRecord.prototype.toString = function () {
        return 'arg' + this.id;
    };
    return LocationActivationRecord;
}(op.Location));
exports.LocationActivationRecord = LocationActivationRecord;
var VirtualRegister = (function (_super) {
    __extends(VirtualRegister, _super);
    function VirtualRegister(id) {
        _super.call(this);
        this.id = id;
    }
    VirtualRegister.prototype.toString = function () {
        return 'v' + this.id;
    };
    return VirtualRegister;
}(op.Location));
exports.VirtualRegister = VirtualRegister;
var VirtualRegisterFile = (function () {
    function VirtualRegisterFile() {
        this.length = 0;
        this.map = {};
    }
    VirtualRegisterFile.prototype.alloc = function () {
        var vreg = new VirtualRegister(this.length);
        this.length++;
        return vreg;
    };
    return VirtualRegisterFile;
}());
exports.VirtualRegisterFile = VirtualRegisterFile;
var Block = (function () {
    function Block() {
        this.start = null;
        this.end = null;
    }
    Block.prototype.push = function (instruction) {
        if (!this.start) {
            this.start = instruction;
            this.end = instruction;
        }
        else {
            instruction.prev = this.end;
            this.end = this.end.next = instruction;
        }
    };
    Block.prototype.toString = function () {
        var list = [];
        var curr = this.start;
        while (curr) {
            list.push(curr.toString());
            curr = curr.next;
        }
        return list.join('\n');
    };
    return Block;
}());
exports.Block = Block;
var VariableFile = (function () {
    function VariableFile() {
        this.map = {};
        this.length = 0;
    }
    VariableFile.prototype.getOrCreate = function (type, name) {
        if (!name)
            return this.create(type, name);
        var operand = this.get(name);
        if (operand)
            return operand;
        else
            return this.create(type, name);
    };
    VariableFile.prototype.create = function (type, name) {
        var operand = new op.OperandVariable(type, name);
        this.set(operand);
        return operand;
    };
    VariableFile.prototype.set = function (variable) {
        var name = variable.getName();
        if (!this.map[name])
            this.length++;
        this.map[name] = variable;
    };
    VariableFile.prototype.get = function (name) {
        return this.map[name];
    };
    VariableFile.prototype.del = function (name) {
        if (this.map[name]) {
            delete this.map[name];
            this.length--;
        }
    };
    return VariableFile;
}());
exports.VariableFile = VariableFile;
var LabelMap = (function () {
    function LabelMap() {
        this.map = {};
        this.length = 0;
    }
    LabelMap.prototype.getOrCreate = function (name) {
        var lbl = this.get(name);
        if (lbl)
            return lbl;
        else
            return this.create(name);
    };
    LabelMap.prototype.create = function (name) {
        var lbl = new op.OperandLabel(name);
        this.set(lbl);
        return lbl;
    };
    LabelMap.prototype.set = function (lbl) {
        var name = lbl.getName();
        if (!this.map[name])
            this.length++;
        this.map[name] = lbl;
    };
    LabelMap.prototype.get = function (name) {
        return this.map[name];
    };
    LabelMap.prototype.del = function (name) {
        if (this.map[name]) {
            delete this.map[name];
            this.length--;
        }
    };
    return LabelMap;
}());
exports.LabelMap = LabelMap;
var Function = (function () {
    function Function(type, args, name, attr) {
        if (type === void 0) { type = type_1.t.void; }
        if (args === void 0) { args = []; }
        if (name === void 0) { name = null; }
        if (attr === void 0) { attr = {}; }
        this.name = null;
        this.vars = new VariableFile;
        this.vregs = new VirtualRegisterFile;
        this.block = new Block;
        this.labels = new LabelMap;
        this.type = type;
        this.args = args;
        this.name = name;
        this.attr = attr;
        for (var _i = 0, _a = this.args; _i < _a.length; _i++) {
            var arg = _a[_i];
            this.vars.set(arg);
        }
    }
    Function.prototype.createVariable = function (type, name) {
        var operand = this.vars.create(type, name);
        return operand;
    };
    Function.prototype.assignVirtualRegisters = function () {
        for (var varname in this.vars.map) {
            var varop = this.vars.map[varname];
            if (!varop.location)
                varop.setLocation(this.vregs.alloc());
        }
    };
    Function.prototype.pushInstruction = function (instruction) {
        this.block.push(instruction);
        return instruction;
    };
    Function.prototype.getName = function () {
        if (!this.name) {
            this.name = '@' + (Function.nameId++);
        }
        return this.name;
    };
    Function.prototype.toString = function () {
        var block = this.block.toString();
        block = '    ' + block.replace(/\n/g, '\n    ');
        var args = [];
        for (var _i = 0, _a = this.args; _i < _a.length; _i++) {
            var arg = _a[_i];
            args.push(arg.toString());
        }
        return this.type.toString() + " " + this.getName() + "(" + args.join(', ') + ") {\n" + block + "\n}";
    };
    Function.nameId = 0;
    return Function;
}());
exports.Function = Function;
var Unit = (function () {
    function Unit() {
        this.functions = [];
    }
    Unit.prototype.pushFunction = function (func) {
        this.functions.push(func);
    };
    Unit.prototype.toString = function () {
        var list = [];
        for (var _i = 0, _a = this.functions; _i < _a.length; _i++) {
            var f = _a[_i];
            list.push(f.toString());
        }
        return list.join('\n\n');
    };
    return Unit;
}());
exports.Unit = Unit;

"use strict";
var type_1 = require("./type");
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
    }
    VariableFile.prototype.set = function (variable) {
        this.map[variable.getName()] = variable;
    };
    VariableFile.prototype.get = function (name) {
        return this.map[name];
    };
    return VariableFile;
}());
exports.VariableFile = VariableFile;
var Function = (function () {
    function Function(type, params, name, attr) {
        if (type === void 0) { type = type_1.t.void; }
        if (params === void 0) { params = []; }
        if (name === void 0) { name = null; }
        if (attr === void 0) { attr = {}; }
        this.name = null;
        this.vars = new VariableFile;
        this.block = new Block;
        this.type = type;
        this.params = params;
        this.name = name;
        this.attr = attr;
    }
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
        return this.type.toString() + " " + this.getName() + "() {\n" + block + "\n}";
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

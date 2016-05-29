"use strict";
var o = require('./operand');
var util_1 = require('../util');
var Immediates = [o.Immediate, o.Immediate8, o.Immediate16, o.Immediate32, o.Immediate64];
var Def = (function () {
    function Def(def) {
        this.opcode = def.o;
        this.opreg = def.or;
        this.mnemonic = def.mn;
        this.operandSize = def.s;
        this.lock = def.lock;
        this.regInOp = def.r;
        this.opcodeDirectionBit = def.dbit;
        this.mandatoryRex = def.rex;
        this.operands = [];
        if (def.ops && def.ops.length) {
            for (var _i = 0, _a = def.ops; _i < _a.length; _i++) {
                var operand = _a[_i];
                if (!(operand instanceof Array))
                    operand = [operand];
                this.operands.push(operand);
            }
        }
    }
    Def.prototype.validateOperandDefinitions = function (definitions, target) {
        for (var _i = 0, definitions_1 = definitions; _i < definitions_1.length; _i++) {
            var def = definitions_1[_i];
            if (typeof def === 'object') {
                if (def === target)
                    return true;
            }
            else if (typeof def === 'function') {
                if (Immediates.indexOf(def) > -1) {
                    if (target instanceof o.Immediate)
                        return true;
                }
                else {
                    if (target instanceof def)
                        return true;
                }
            }
        }
        return false;
    };
    Def.prototype.validateOperands = function (operands) {
        if (this.operands.length !== operands.list.length)
            return false;
        for (var i = 0; i < operands.list.length; i++) {
            var is_valid = this.validateOperandDefinitions(this.operands[i], operands.list[i]);
            if (!is_valid)
                return false;
        }
        return true;
    };
    Def.prototype.getImmediateClass = function () {
        for (var _i = 0, _a = this.operands; _i < _a.length; _i++) {
            var operand = _a[_i];
            for (var _b = 0, operand_1 = operand; _b < operand_1.length; _b++) {
                var type = operand_1[_b];
                if (Immediates.indexOf(type) > -1)
                    return type;
            }
        }
        return null;
    };
    return Def;
}());
exports.Def = Def;
var DefGroup = (function () {
    function DefGroup(name, defs, defaults) {
        this.name = '';
        this.defs = [];
        this.name = name;
        var group_defaults = defs[0], definitions = defs.slice(1);
        // If only one object provided, we treat it as instruction definition rather then
        // as group defaults.
        if (!definitions.length)
            definitions = [group_defaults];
        // Mnemonic.
        if (!group_defaults.mn)
            group_defaults.mn = name;
        for (var _i = 0, definitions_2 = definitions; _i < definitions_2.length; _i++) {
            var definition = definitions_2[_i];
            this.defs.push(new Def(util_1.extend({}, defaults, group_defaults, definition)));
        }
    }
    DefGroup.prototype.find = function (operands, size) {
        if (size === void 0) { size = 0; }
        for (var _i = 0, _a = this.defs; _i < _a.length; _i++) {
            var def = _a[_i];
            if (def.validateOperands(operands)) {
                if (!size)
                    return def;
                else if (size === def.operandSize)
                    return def;
            }
        }
        return null;
    };
    return DefGroup;
}());
exports.DefGroup = DefGroup;
var DefTable = (function () {
    function DefTable(table, defaults) {
        this.groups = {};
        for (var name in table) {
            var group = new DefGroup(name, table[name], defaults);
            this.groups[name] = group;
        }
    }
    DefTable.prototype.find = function (name, operands, size) {
        if (size === void 0) { size = 0; }
        var group = this.groups[name];
        return group.find(operands);
    };
    return DefTable;
}());
exports.DefTable = DefTable;

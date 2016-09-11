"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var type_1 = require('./type');
var Location = (function () {
    function Location() {
    }
    Location.prototype.toString = function () {
        return '[unallocated]';
    };
    return Location;
}());
exports.Location = Location;
var Operand = (function () {
    function Operand(type) {
        this.cid = Operand.cid++;
        this.type = type;
    }
    Operand.prototype.isConst = function () {
        return this instanceof OperandConst;
    };
    Operand.prototype.toString = function () {
        return this.type.toString() + ' [operand]';
    };
    Operand.cid = 0;
    return Operand;
}());
exports.Operand = Operand;
var OperandConst = (function (_super) {
    __extends(OperandConst, _super);
    function OperandConst(type, value) {
        _super.call(this, type);
        this.value = value;
    }
    OperandConst.prototype.toString = function () {
        return this.type.toString() + ' ' + String(this.value);
    };
    return OperandConst;
}(Operand));
exports.OperandConst = OperandConst;
var OperandLabel = (function (_super) {
    __extends(OperandLabel, _super);
    function OperandLabel(name) {
        _super.call(this, type_1.t.label);
        this.name = name;
    }
    OperandLabel.prototype.getName = function () {
        if (!this.name) {
            this.name = String(OperandLabel.nameId++);
        }
        return this.name;
    };
    OperandLabel.prototype.toString = function () {
        return this.type.toString() + ' @' + this.getName();
    };
    OperandLabel.nameId = 0;
    return OperandLabel;
}(Operand));
exports.OperandLabel = OperandLabel;
var OperandVariable = (function (_super) {
    __extends(OperandVariable, _super);
    function OperandVariable(type, name) {
        _super.call(this, type);
        this.location = null;
        this.isLocal = true;
        if (name)
            this.name = name;
    }
    OperandVariable.prototype.setLocation = function (location) {
        this.location = location;
    };
    OperandVariable.prototype.getName = function () {
        if (!this.name) {
            this.name = String(OperandVariable.nameId++);
        }
        return this.name;
    };
    OperandVariable.prototype.toString = function () {
        var locationStr = this.location ? this.location.toString() : '';
        if (locationStr)
            return this.type.toString() + ' ' + locationStr;
        else
            return this.type.toString() + ' ' + (this.isLocal ? '%' : '@') + this.getName();
    };
    OperandVariable.nameId = 0;
    return OperandVariable;
}(Operand));
exports.OperandVariable = OperandVariable;

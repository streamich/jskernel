"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Type = (function () {
    function Type() {
        this.size = 0;
    }
    Type.int = function (size) {
        if (size === void 0) { size = 64; }
        var type = new TypeInteger(size);
        return type;
    };
    Type.prototype.toString = function () {
        return '<untyped>';
    };
    return Type;
}());
exports.Type = Type;
var TypeInteger = (function (_super) {
    __extends(TypeInteger, _super);
    function TypeInteger(size) {
        _super.call(this);
        this.size = size;
    }
    TypeInteger.prototype.toString = function () {
        return 'i' + this.size;
    };
    return TypeInteger;
}(Type));
exports.TypeInteger = TypeInteger;
var TypeVoid = (function (_super) {
    __extends(TypeVoid, _super);
    function TypeVoid() {
        _super.apply(this, arguments);
    }
    TypeVoid.prototype.toString = function () {
        return 'void';
    };
    return TypeVoid;
}(Type));
exports.TypeVoid = TypeVoid;
var TypePointer = (function (_super) {
    __extends(TypePointer, _super);
    function TypePointer(baseType) {
        _super.call(this);
        this.base = baseType;
    }
    TypePointer.prototype.toString = function () {
        return '[' + this.base.toString() + ']';
    };
    return TypePointer;
}(Type));
exports.TypePointer = TypePointer;
var TypeLabel = (function (_super) {
    __extends(TypeLabel, _super);
    function TypeLabel() {
        _super.apply(this, arguments);
    }
    TypeLabel.prototype.toString = function () {
        return 'label';
    };
    return TypeLabel;
}(Type));
exports.TypeLabel = TypeLabel;
var TypeAggregate = (function (_super) {
    __extends(TypeAggregate, _super);
    function TypeAggregate() {
        _super.apply(this, arguments);
    }
    return TypeAggregate;
}(Type));
exports.TypeAggregate = TypeAggregate;
var TypeArray = (function (_super) {
    __extends(TypeArray, _super);
    function TypeArray() {
        _super.apply(this, arguments);
    }
    return TypeArray;
}(TypeAggregate));
exports.TypeArray = TypeArray;
exports.t = {
    'void': new TypeVoid,
    label: new TypeLabel,
    i1: Type.int(1),
    i8: Type.int(8),
    i32: Type.int(32),
    i64: Type.int(64),
    i: function (size) {
        var prop = 'i' + size;
        if (!exports.t[prop]) {
            exports.t[prop] = Type.int(size);
        }
        return exports.t[prop];
    },
    ptr: function () {
    }
};

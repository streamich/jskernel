"use strict";
var Pointer = (function () {
    function Pointer(buf, offset) {
        if (offset === void 0) { offset = 0; }
        this.buf = buf;
        this.off = offset;
    }
    Pointer.prototype.clone = function () {
        return this.offset();
    };
    Pointer.prototype.offset = function (off) {
        if (off === void 0) { off = 0; }
        return new Pointer(this.buf, this.off + off);
    };
    return Pointer;
}());
exports.Pointer = Pointer;
var Primitive = (function () {
    function Primitive() {
        this.size = 0;
    }
    Primitive.define = function (size, onPack, onUnpack, name) {
        if (size === void 0) { size = 1; }
        if (onPack === void 0) { onPack = (function () { }); }
        if (onUnpack === void 0) { onUnpack = (function () { }); }
        if (name === void 0) { name = ''; }
        var field = new Primitive;
        field.size = size;
        field.name = name;
        field.onPack = onPack;
        field.onUnpack = onUnpack;
        return field;
    };
    Primitive.prototype.pack = function (p, value) {
        this.onPack.call(p.buf, value, p.off);
    };
    Primitive.prototype.unpack = function (p) {
        return this.onUnpack.call(p.buf, p.off);
    };
    return Primitive;
}());
exports.Primitive = Primitive;
var List = (function () {
    function List() {
        this.size = 0;
        this.length = 0;
    }
    List.define = function (type, length) {
        if (length === void 0) { length = 0; }
        var list = new List;
        list.type = type;
        list.length = length;
        list.size = length * type.size;
        return list;
    };
    List.prototype.pack = function (p, values, length) {
        if (length === void 0) { length = this.length; }
        var valp = p.clone();
        if (!(values instanceof Array))
            values = [values];
        if (!length)
            length = values.length;
        length = Math.min(length, values.length);
        for (var i = 0; i < length; i++) {
            this.type.pack(valp, values[i]);
            valp.off += this.type.size;
        }
    };
    List.prototype.unpack = function (p, length) {
        if (length === void 0) { length = this.length; }
        var values = [];
        var valp = p.clone();
        for (var i = 0; i < length; i++) {
            values.push(this.type.unpack(valp));
            valp.off += this.type.size;
        }
        return values;
    };
    return List;
}());
exports.List = List;
var IStructField = (function () {
    function IStructField() {
    }
    return IStructField;
}());
exports.IStructField = IStructField;
var Struct = (function () {
    function Struct(fields, name) {
        this.size = 0;
        this.fields = [];
        this.map = {};
        this.addFields(fields);
        this.name = name;
    }
    Struct.define = function (fields, name) {
        if (name === void 0) { name = ''; }
        return new Struct(fields, name);
    };
    Struct.prototype.addFields = function (fields) {
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var field = fields_1[_i];
            if (field instanceof Struct) {
                var parent = field;
                var parentfields = parent.fields.map(function (field) {
                    return [field.type, field.name];
                });
                this.addFields(parentfields);
                continue;
            }
            var fielddef = field;
            var struct = fielddef[0], name = fielddef[1];
            var entry = {
                type: struct,
                offset: this.size,
                name: name,
            };
            this.fields.push(entry);
            this.map[name] = entry;
            this.size += struct.size;
        }
    };
    Struct.prototype.pack = function (p, data) {
        var fp = p.clone();
        for (var _i = 0, _a = this.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            field.type.pack(fp, data[field.name]);
            fp.off += field.type.size;
        }
    };
    Struct.prototype.unpack = function (p) {
        var data = {};
        var fp = p.clone();
        for (var _i = 0, _a = this.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            data[field.name] = field.type.unpack(fp);
            fp.off += field.type.size;
        }
        return data;
    };
    return Struct;
}());
exports.Struct = Struct;
var Variable = (function () {
    function Variable(type, pointer) {
        this.type = type;
        this.pointer = pointer;
    }
    Variable.prototype.pack = function (data) {
        this.type.pack(this.pointer, data);
    };
    Variable.prototype.unpack = function (length) {
        return this.type.unpack(this.pointer, length);
    };
    Variable.prototype.cast = function (newtype) {
        this.type = newtype;
    };
    Variable.prototype['get'] = function (name) {
        if (!(this.type instanceof Struct))
            throw Error('Variable is not a `Struct`.');
        var struct = this.type;
        var field = struct.map[name];
        var p = this.pointer.clone();
        p.off += field.offset;
        return new Variable(field.type, p);
    };
    return Variable;
}());
exports.Variable = Variable;
var bp = Buffer.prototype;
exports.i8 = Primitive.define(1, bp.writeInt8, bp.readInt8);
exports.ui8 = Primitive.define(1, bp.writeUInt8, bp.readUInt8);
exports.i16 = Primitive.define(2, bp.writeInt16LE, bp.readInt16LE);
exports.ui16 = Primitive.define(2, bp.writeUInt16LE, bp.readUInt16LE);
exports.i32 = Primitive.define(4, bp.writeInt32LE, bp.readInt32LE);
exports.ui32 = Primitive.define(4, bp.writeUInt32LE, bp.readUInt32LE);
exports.i64 = List.define(exports.i32, 2);
exports.ui64 = List.define(exports.ui32, 2);
exports.bi16 = Primitive.define(2, bp.writeInt16BE, bp.readInt16BE);
exports.bui16 = Primitive.define(2, bp.writeUInt16BE, bp.readUInt16BE);
exports.bi32 = Primitive.define(4, bp.writeInt32BE, bp.readInt32BE);
exports.bui32 = Primitive.define(4, bp.writeUInt32BE, bp.readUInt32BE);
exports.bi64 = List.define(exports.bi32, 2);
exports.bui64 = List.define(exports.bui32, 2);
exports.t_void = Primitive.define(0);

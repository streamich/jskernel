// # Structs and Pointers
"use strict";
// We can find out a physical memory pointer of a `Buffer` or `ArrayBuffer` objects. But we don't want to create a new
// buffer for every slice of memory we reference to, so we define a pointer as a tuple where `Buffer` or `ArrayBuffer` objects
// server as a starting point and offset is a number representing an offset within the buffer in bytes.
var Pointer = (function () {
    function Pointer(buf, offset) {
        if (offset === void 0) { offset = 0; }
        this.buf = buf;
        this.off = offset;
    }
    // Return a copy of itself.
    Pointer.prototype.clone = function () {
        return new Pointer(this.buf, this.off);
    };
    return Pointer;
}());
exports.Pointer = Pointer;
// Primitive are the smallest, most basic data types like integers, chars and pointers on which CPU operates directly.
var Primitive = (function () {
    function Primitive() {
        this.size = 0;
    }
    // We do not define `offset` at construction because the offset property is set by a parent Struct.
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
// Array type, named `List` because `Array` is reserved word in JavaScript.
var List = (function () {
    function List() {
        this.size = 0;
        // If 0, means we don't know the exact size of our array, think char[]* for example to represent string.
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
        if (!length)
            length = values.length;
        for (var i = 0; i < length; i++) {
            if (i >= values.length)
                break;
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
// Each `IType` inside a `Struct` get decorated with the `IStructField` object.
var IStructField = (function () {
    function IStructField() {
    }
    return IStructField;
}());
exports.IStructField = IStructField;
// Represents a structured memory record definition similar to that of `struct` in *C*.
var Struct = (function () {
    function Struct() {
        this.size = 0;
        this.fields = [];
        this.map = {};
    }
    Struct.define = function (fields, name) {
        if (name === void 0) { name = ''; }
        var newstruct = new Struct;
        var offset = 0;
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var field = fields_1[_i];
            var name = field[0], struct = field[1];
            var entry = {
                type: struct,
                offset: offset,
                name: name
            };
            newstruct.fields.push(entry);
            newstruct.map[name] = entry;
            offset += struct.size;
        }
        newstruct.size = offset;
        newstruct.name = name;
        return newstruct;
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
// Represents a variable that has a `Struct` type association with a `Pointer` to a memory location.
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
    Variable.prototype.getField = function (name) {
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
// Define basic types.
exports.t_i8 = Primitive.define(1, Buffer.prototype.writeInt8, Buffer.prototype.readInt8);
exports.t_ui8 = Primitive.define(1, Buffer.prototype.writeUInt8, Buffer.prototype.readUInt8);
exports.t_i16 = Primitive.define(2, Buffer.prototype.writeInt16LE, Buffer.prototype.readInt16LE);
exports.t_ui16 = Primitive.define(2, Buffer.prototype.writeUInt16LE, Buffer.prototype.readUInt16LE);
exports.t_i32 = Primitive.define(2, Buffer.prototype.writeInt32LE, Buffer.prototype.readInt32LE);
exports.t_ui32 = Primitive.define(2, Buffer.prototype.writeUInt32LE, Buffer.prototype.readUInt32LE);
exports.t_i64 = List.define(exports.t_i32, 2);
exports.t_ui64 = List.define(exports.t_ui32, 2);
exports.t_char = exports.t_i8;
exports.t_pointer = exports.t_i64;
exports.t_void = Primitive.define(0); // `0` means variable length.

// # Typebase
//
// [typebase](http://www.npmjs.com/package/typebase) provides C-like Types, Structs and Pointers for JavaScript.
//
// Let's jump straight into example. Consider the following `C/C++` *stuct*:
//
// ```c
// typedef struct address {
//     int port,
//     unsigned char ip[4],
// }
// ```
//
// You can represent it using `typebase` like so:
//
// ```js
// var t = require('typebase');
// var address = t.Struct.define([
//     ['port', t.i32],
//     ['ip', t.List.define(t.ui8, 4)]
// ]);
// ```
//
// You can use your `address` *struct* to pack binary data into `Buffer`. But, first
// we create a *pointer* to memory where data will be located. `Pointer` is defined as
// a tuple of `Buffer` and a `number` offset in the buffer:
//
// ```js
// var p = new t.Pointer(new Buffer(100), 0);
// ```
//
// Finally, you can pack your data into the `Buffer` specified by the pointer `p`:
//
// ```js
// var host = {
//     port: 8080,
//     ip: [127, 0, 0, 1]
// };
// address.pack(p, host);
// ```
//
// And unpack it back:
//
// ```js
// var unpacked = address.unpack(p);
// ```
//
// Or use `Variable` object to do the same thing:
//
// ```js
// var v = new t.Variable(address, p);
// v.pack(host);
// var unpacked = v.unpack();
// ```
//
// Now let's say you want to *"extend"* your C struct with a `protocol` field:
//
// ```c
// typedef struct address_and_protocol {
//     int port,
//     unsigned char ip[4],
//     int protocol,
// }
// ```
//
// In *C11* you can actually do it like this:
//
// ```c
// typedef struct address_and_protocol {
//     struct address,
//     int protocol,
// }
// ```
//
// `typebase` also allows you to "extend" `Struct`s:
//
// ```js
// var address_and_protocol = t.Struct.define([
//     address,
//     ['protocol', t.i32]
// ]);
// ```
//
// Now you can *"cast"* your `Variable` to the new type and write data to it:
//
// ```js
// v.cast(address_and_protocol);
// v.pack({
//     port: 8080,
//     ip: [127, 0, 0, 1],
//     protocol: 4
// });
// ```
//
// When you pack and unpack `Variable`s, you don't need to do it for the whole `Variable` at once, instead
// you can just pick the field you need:
//
// ```js
// v.get('ip').pack([192, 168, 1, 100]);
// console.log(v.get('ip').unpack());
// ```
//
// One useful property all `typebase` types have is `size`, which is size of the type in bytes:
//
// ```js
// console.log(address.size);
// ```
//
// ## TL;DR
//
// `typbase` defines five basic building blocks: `Pointer`, `Primitive`, `List`, `Struct`, `Variable`.
//
// `Pointer` represents a location of data in memory, similar to `C/C++` pointers.
//
// `Primitive` is a basic data type that knows how to pack and unpack itself into `Buffer`. `Struct` is a structure
// of data, similar to `struct` in C. `List` is an array of `Primitive`s, `Struct`s or other `List`s.
//
// And, finally, `Variable` is an object that has an **address in memory** represented by `Pointer` and a
// **type** represented by one of `Primitive`, `List` or `Struct`.
"use strict";
// ## Pointer
//
// We can find out a physical memory pointer of a `Buffer` or `ArrayBuffer` objects using [libsys](http://www.npmjs.com/package/libsys).
// But we don't want to create a new buffer for every slice of memory we reference to, so we define a pointer as a tuple
// where `Buffer` or `ArrayBuffer` objects server as a starting point and offset is a number representing an offset
// within the buffer in bytes.
var Pointer = (function () {
    function Pointer(buf, offset) {
        if (offset === void 0) { offset = 0; }
        this.buf = buf;
        this.off = offset;
    }
    /* Return a copy of itself. */
    Pointer.prototype.clone = function () {
        return new Pointer(this.buf, this.off);
    };
    return Pointer;
}());
exports.Pointer = Pointer;
// ### Primitive
// `Primitive`s are the smallest, most basic data types like integers, chars and pointers on which CPU operates directly
// and which know how to pack and unpack themselves into `Buffer`s.
var Primitive = (function () {
    function Primitive() {
        this.size = 0;
    }
    /* We do not define `offset` at construction because the
       offset property is set by a parent Struct. */
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
// ### List
// Array type, named `List` because `Array` is a reserved word in JavaScript.
var List = (function () {
    function List() {
        this.size = 0;
        /* If 0, means we don't know the exact size of our array,
           think char[]* for example to represent string. */
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
// ### Struct
// Each `IType` inside a `Struct` gets decorated with the `IStructField` object.
var IStructField = (function () {
    function IStructField() {
    }
    return IStructField;
}());
exports.IStructField = IStructField;
// Represents a structured memory record definition similar to that of `struct` in `C`.
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
            /* Inherit properties from another struct */
            if (field instanceof Struct) {
                var parent = field;
                var parentfields = parent.fields.map(function (field) {
                    return [field.name, field.type];
                });
                this.addFields(parentfields);
                continue;
            }
            var fielddef = field;
            var name = fielddef[0], struct = fielddef[1];
            var entry = {
                type: struct,
                offset: this.size,
                name: name
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
// ## Variable
//
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
// ## Basic Types
//
// Define basic types and export as part of the library.
var bp = Buffer.prototype;
exports.i8 = Primitive.define(1, bp.writeInt8, bp.readInt8);
exports.ui8 = Primitive.define(1, bp.writeUInt8, bp.readUInt8);
exports.i16 = Primitive.define(2, bp.writeInt16LE, bp.readInt16LE);
exports.ui16 = Primitive.define(2, bp.writeUInt16LE, bp.readUInt16LE);
exports.i32 = Primitive.define(4, bp.writeInt32LE, bp.readInt32LE);
exports.ui32 = Primitive.define(4, bp.writeUInt32LE, bp.readUInt32LE);
exports.i64 = List.define(exports.i32, 2);
exports.ui64 = List.define(exports.ui32, 2);
exports.t_void = Primitive.define(0); // `0` means variable length, like `void*`.

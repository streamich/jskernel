// # Typebase
//
// [typebase](http://www.npmjs.com/package/typebase) provides C-like Types, Structs and Pointers for JavaScript.
//
// Let's jump straight into example. Consider the following `C/C++` *stuct*:
//
// ```c
// struct address {
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
// var p = new t.Pointer(new Buffer(address.size), 0);
// ```
//
// Finally, you can pack your data into the `Buffer`:
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
// console.log(unpacked);
// ```
//
// `typbase` defines five basic building blocks: `Pointer`, `Primitive`, `List`, `Struct`, `Variable`.
//
// `Pointer` represents a location of data in memory, similar `C/C++` pointers. `Primitive` is a basic data type
// that knows how to pack and unpack itself into `Buffer`. `Struct` is a structure of data, similar to `struct` in C.
// `List` is an array of `Primitive`s, `Struct`s or other `List`s. And, finally, `Variable` is an object that has
// an address in memory represented by `Pointer` and a type represented by one of `Primitive`, `List` or `Struct`.

// ## Pointer
//
// We can find out a physical memory pointer of a `Buffer` or `ArrayBuffer` objects using [libsys](http://www.npmjs.com/package/libsys).
// But we don't want to create a new buffer for every slice of memory we reference to, so we define a pointer as a tuple
// where `Buffer` or `ArrayBuffer` objects server as a starting point and offset is a number representing an offset
// within the buffer in bytes.
export class Pointer {
    buf: Buffer;
    off: number; /* offset */

    constructor(buf: Buffer, offset: number = 0) {
        this.buf = buf;
        this.off = offset;
    }

    /* Return a copy of itself. */
    clone() {
        return new Pointer(this.buf, this.off);
    }
}

// ## Types

// Basic properties that all types should have.
export interface IType {
    size: number;
    name: string; // Optional.
    pack(p: Pointer, data: any);
    unpack(p: Pointer, length?: number): any;
}

// ### Primitive

// `Primitive`s are the smallest, most basic data types like integers, chars and pointers on which CPU operates directly
// and which know how to pack and unpack themselves into `Buffer`s.
export class Primitive implements IType {

    /* We do not define `offset` at construction because the
       offset property is set by a parent Struct. */
    static define(size = 1, onPack = (() => {}) as any,
                  onUnpack = (() => {}) as any, name: string = '') {
        var field = new Primitive;
        field.size = size;
        field.name = name;
        field.onPack = onPack;
        field.onUnpack = onUnpack;
        return field;
    }

    size = 0;
    name: string;

    onPack: (value, offset) => void;
    onUnpack: (offset: number) => any;

    pack(p: Pointer, value: any) {
        this.onPack.call(p.buf, value, p.off);
    }

    unpack(p: Pointer): any {
        return this.onUnpack.call(p.buf, p.off);
    }
}

// ### List

// Array type, named `List` because `Array` is a reserved word in JavaScript.
export class List implements IType {

    static define(type: IType, length: number = 0) {
        var list = new List;
        list.type = type;
        list.length = length;
        list.size = length * type.size;
        return list;
    }

    size = 0;
    name: string;

    type: IType;

    /* If 0, means we don't know the exact size of our array,
       think char[]* for example to represent string. */
    length = 0;

    pack(p: Pointer, values: any[], length = this.length) {
        var valp = p.clone();
        if(!length) length = values.length;
        length = Math.min(length, values.length);
        for(var i = 0; i < length; i++) {
            this.type.pack(valp, values[i]);
            valp.off += this.type.size;
        }
    }

    unpack(p: Pointer, length = this.length): any {
        var values = [];
        var valp = p.clone();
        for(var i = 0; i < length; i++) {
            values.push(this.type.unpack(valp));
            valp.off += this.type.size;
        }
        return values;
    }
}

// ### Struct

// Each `IType` inside a `Struct` gets decorated with the `IStructField` object.
export class IStructField {
    type: IType;
    offset: number;
    name: string;
}

// Represents a structured memory record definition similar to that of `struct` in `C`.
export class Struct implements IType {

    static define(fields: [string, IType][], name: string = '') {
        var newstruct = new Struct;
        var offset = 0;
        for(var field of fields) {
            var [name, struct] = field;
            var entry: IStructField = {
                type: struct,
                offset: offset,
                name: name,
            };
            newstruct.fields.push(entry);
            newstruct.map[name] = entry;
            offset += struct.size;
        }
        newstruct.size = offset;
        newstruct.name = name;
        return newstruct;
    }

    size = 0;
    name: string;

    fields: IStructField[] = [];

    map: {[s: string]: IStructField} = {};

    pack(p: Pointer, data: any) {
        var fp = p.clone();
        for(var field of this.fields) {
            field.type.pack(fp, data[field.name]);
            fp.off += field.type.size;
        }
    }

    unpack(p: Pointer): any {
        var data: any = {};
        var fp = p.clone();
        for(var field of this.fields) {
            data[field.name] = field.type.unpack(fp);
            fp.off += field.type.size;
        }
        return data;
    }
}


// ## Variable
//
// Represents a variable that has a `Struct` type association with a `Pointer` to a memory location.
export class Variable {
    type: IType;
    pointer: Pointer;

    constructor(type: IType, pointer: Pointer) {
        this.type = type;
        this.pointer = pointer;
    }

    pack(data: any) {
        this.type.pack(this.pointer, data);
    }

    unpack(length?): any {
        return this.type.unpack(this.pointer, length);
    }

    getField(name: string) {
        if(!(this.type instanceof Struct)) throw Error('Variable is not a `Struct`.');
        var struct = this.type as Struct;
        var field = struct.map[name] as IStructField;
        var p = this.pointer.clone();
        p.off += field.offset;
        return new Variable(field.type, p);
    }
}

// Define basic types and export as part of the library.
var bp = Buffer.prototype;
export var i8   = Primitive.define(1, bp.writeInt8,     bp.readInt8);
export var ui8  = Primitive.define(1, bp.writeUInt8,    bp.readUInt8);
export var i16  = Primitive.define(2, bp.writeInt16LE,  bp.readInt16LE);
export var ui16 = Primitive.define(2, bp.writeUInt16LE, bp.readUInt16LE);
export var i32  = Primitive.define(4, bp.writeInt32LE,  bp.readInt32LE);
export var ui32 = Primitive.define(4, bp.writeUInt32LE, bp.readUInt32LE);
export var i64  = List.define(i32, 2);
export var ui64 = List.define(ui32, 2);
export var t_void = Primitive.define(0); // `0` means variable length, like `void*`.

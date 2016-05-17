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

export type IFieldDefinition = [string, IType] | Struct;

// Represents a structured memory record definition similar to that of `struct` in `C`.
export class Struct implements IType {

    static define(fields: IFieldDefinition[], name: string = ''): Struct {
        return new Struct(fields, name);
    }

    size = 0;
    name: string;

    fields: IStructField[] = [];

    map: {[s: string]: IStructField} = {};

    constructor(fields: IFieldDefinition[], name: string) {
        this.addFields(fields);
        this.name = name;
    }

    protected addFields(fields: IFieldDefinition[]) {
        for(var field of fields) {
            /* Inherit properties from another struct */
            if(field instanceof Struct) {
                var parent = field as Struct;
                var parentfields = parent.fields.map(function(field: IStructField) {
                    return [field.name, field.type];
                });
                this.addFields(parentfields as [string, IType][]);
                continue;
            }

            var fielddef = field as [string, IType];
            var [name, struct] = fielddef;
            var entry: IStructField = {
                type: struct,
                offset: this.size,
                name: name,
            };
            this.fields.push(entry);
            this.map[name] = entry;
            this.size += struct.size;
        }
    }

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

    cast(newtype: IType) {
        this.type = newtype;
    }

    'get'(name: string) {
        if(!(this.type instanceof Struct)) throw Error('Variable is not a `Struct`.');
        var struct = this.type as Struct;
        var field = struct.map[name] as IStructField;
        var p = this.pointer.clone();
        p.off += field.offset;
        return new Variable(field.type, p);
    }
}

// ## Basic Types
//
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

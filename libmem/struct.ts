
// # Structs and Pointers

// We can find out a physical memory pointer of a `Buffer` or `ArrayBuffer` objects. But we don't want to create a new
// buffer for every slice of memory we reference to, so we define a pointer as a tuple where `Buffer` or `ArrayBuffer` objects
// server as a starting point and offset is a number representing an offset within the buffer in bytes.
export class Pointer {
    buf: Buffer;
    off: number; // offset

    constructor(buf: Buffer, offset: number = 0) {
        this.buf = buf;
        this.off = offset;
    }

    // Return a copy of itself.
    clone() {
        return new Pointer(this.buf, this.off);
    }
}

// Basic properties that all types should have.
export interface IType {
    size: number;
    name: string; // Optional.
    pack(p: Pointer, data: any);
    unpack(p: Pointer, length?: number): any;
}

// Primitive are the smallest, most basic data types like integers, chars and pointers on which CPU operates directly.
export class Primitive implements IType {

    // We do not define `offset` at construction because the offset property is set by a parent Struct.
    static define(size = 1, onPack = (() => {}) as any, onUnpack = (() => {}) as any, name: string = '') {
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

// Array type, named `List` because `Array` is reserved word in JavaScript.
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

    // If 0, means we don't know the exact size of our array, think char[]* for example to represent string.
    length = 0;

    pack(p: Pointer, values: any[], length = this.length) {
        var valp = p.clone();
        if(!length) length = values.length;
        for(var i = 0; i < length; i++) {
            if(i >= values.length) break;
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

// Each `IType` inside a `Struct` get decorated with the `IStructField` object.
export class IStructField {
    type: IType;
    offset: number;
    name: string;
}

// Represents a structured memory record definition similar to that of `struct` in *C*.
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

// Define basic types.
export var t_i8     = Primitive.define(1, Buffer.prototype.writeInt8, Buffer.prototype.readInt8);
export var t_ui8    = Primitive.define(1, Buffer.prototype.writeUInt8, Buffer.prototype.readUInt8);
export var t_i16    = Primitive.define(2, Buffer.prototype.writeInt16LE, Buffer.prototype.readInt16LE);
export var t_ui16   = Primitive.define(2, Buffer.prototype.writeUInt16LE, Buffer.prototype.readUInt16LE);
export var t_i32    = Primitive.define(2, Buffer.prototype.writeInt32LE, Buffer.prototype.readInt32LE);
export var t_ui32   = Primitive.define(2, Buffer.prototype.writeUInt32LE, Buffer.prototype.readUInt32LE);
export var t_i64    = List.define(t_i32, 2);
export var t_ui64   = List.define(t_ui32, 2);

export var t_char = t_i8;
export var t_pointer = t_i64;
export var t_void = Primitive.define(0); // `0` means variable length.

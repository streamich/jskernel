

export class Buffer {

    static from(array: number[]) {
        var buf = new Buffer(array.length);
        for(var i = 0; i < array.length; i++) buf.writeUInt8(array[i], i);
        return buf;
    }

    protected _ab: ArrayBuffer = null;
    protected _view: Uint8Array = null;

    constructor(size: number) {
        this._ab = new ArrayBuffer(size);
        this._view = new Uint8Array(this._ab);
        this.__proto__ = this._view;
        return this._view;
    }

    protected _throwOrReturnOnOutOfRange(offset: number, noAssert?: boolean, size = 1) {
        if(this._view.length < offset + 1)
            if(noAssert) return true;
            else throw RangeError('index out of range');
        return false;
    }

    protected _octet(offset: number): number {
        return this._view[offset];
    }

    protected _setOctet(offset: number, value: number) {
        this._view[offset] = value;
    }

    protected _readNum(offset: number, byteLength: number, isLE: boolean, signed: boolean, noAssert?: boolean): number {
        if(typeof offset !== 'number') offset = 0;
        this._throwOrReturnOnOutOfRange(offset, noAssert, byteLength);

        if(typeof byteLength !== 'number') byteLength = 1;
        else if(byteLength < 1) byteLength = 1;
        else if(byteLength > 6) byteLength = 6;

        var value = 0;
        if(isLE) {
            for(var i = 0; i < byteLength; i++) {
                console.log(this._octet(offset + i));
                value *= 0x100;
                value += this._octet(offset + i);
            }
        } else {
            for(var i = byteLength - 1; i >= 0; i--) {
                value *= 0x100;
                value += this._octet(offset + i);
            }
        }


        // if(signed) {
        //     value
        // }

        return value;
    }

    readIntBE(offset: number, byteLength: number, noAssert?: boolean): number {
        return this._readNum(offset, byteLength, false, true, noAssert);
    }

    readIntLE(offset: number, byteLength: number, noAssert?: boolean): number {
        return this._readNum(offset, byteLength, true, true, noAssert);
    }

    readInt8(offset: number, noAssert?: boolean): number {
        if(typeof offset !== 'number') offset = 0;
        this._throwOrReturnOnOutOfRange(offset, noAssert);
        var octet = this._octet(offset);
        return octet <= 0b01111111 ? octet : 0xFFFFFF00 | octet;
    }

    readUInt8(offset: number, noAssert?: boolean): number {
        if(typeof offset !== 'number') offset = 0;
        this._throwOrReturnOnOutOfRange(offset, noAssert);
        return this._octet(offset);
    }

    readInt16BE(offset: number, noAssert?: boolean): number {
        return this._readNum(offset, 2, false, true, noAssert);
    }

    readInt16LE(offset: number, noAssert?: boolean): number {
        return this._readNum(offset, 2, true, true, noAssert);
    }

    readInt32BE(offset: number, noAssert?: boolean): number {
        return this._readNum(offset, 4, false, true, noAssert);
    }

    readInt32LE(offset: number, noAssert?: boolean): number {
        return this._readNum(offset, 4, true, true, noAssert);
    }

    writeInt8(value: number, offset: number, noAssert?: boolean): number {
        if(typeof offset !== 'number') offset = 0;
        if(this._throwOrReturnOnOutOfRange(offset, noAssert)) return;
        this._setOctet(offset, value);
    }

    writeUInt8(value: number, offset: number, noAssert?: boolean): number {
        if(typeof offset !== 'number') offset = 0;
        if(this._throwOrReturnOnOutOfRange(offset, noAssert)) return;
        this._setOctet(offset, value);
    }
}


"use strict";
var Buffer = (function () {
    function Buffer(size) {
        this._ab = null;
        this._view = null;
        this._ab = new ArrayBuffer(size);
        this._view = new Uint8Array(this._ab);
        this.__proto__ = this._view;
        return this._view;
    }
    Buffer.from = function (array) {
        var buf = new Buffer(array.length);
        for (var i = 0; i < array.length; i++)
            buf.writeUInt8(array[i], i);
        return buf;
    };
    Buffer.prototype._throwOrReturnOnOutOfRange = function (offset, noAssert, size) {
        if (size === void 0) { size = 1; }
        if (this._view.length < offset + 1)
            if (noAssert)
                return true;
            else
                throw RangeError('index out of range');
        return false;
    };
    Buffer.prototype._octet = function (offset) {
        return this._view[offset];
    };
    Buffer.prototype._setOctet = function (offset, value) {
        this._view[offset] = value;
    };
    Buffer.prototype._readNum = function (offset, byteLength, isLE, signed, noAssert) {
        if (typeof offset !== 'number')
            offset = 0;
        this._throwOrReturnOnOutOfRange(offset, noAssert, byteLength);
        if (typeof byteLength !== 'number')
            byteLength = 1;
        else if (byteLength < 1)
            byteLength = 1;
        else if (byteLength > 6)
            byteLength = 6;
        var value = 0;
        if (isLE) {
            for (var i = 0; i < byteLength; i++) {
                console.log(this._octet(offset + i));
                value *= 0x100;
                value += this._octet(offset + i);
            }
        }
        else {
            for (var i = byteLength - 1; i >= 0; i--) {
                value *= 0x100;
                value += this._octet(offset + i);
            }
        }
        // if(signed) {
        //     value
        // }
        return value;
    };
    Buffer.prototype.readIntBE = function (offset, byteLength, noAssert) {
        return this._readNum(offset, byteLength, false, true, noAssert);
    };
    Buffer.prototype.readIntLE = function (offset, byteLength, noAssert) {
        return this._readNum(offset, byteLength, true, true, noAssert);
    };
    Buffer.prototype.readInt8 = function (offset, noAssert) {
        if (typeof offset !== 'number')
            offset = 0;
        this._throwOrReturnOnOutOfRange(offset, noAssert);
        var octet = this._octet(offset);
        return octet <= 127 ? octet : 0xFFFFFF00 | octet;
    };
    Buffer.prototype.readUInt8 = function (offset, noAssert) {
        if (typeof offset !== 'number')
            offset = 0;
        this._throwOrReturnOnOutOfRange(offset, noAssert);
        return this._octet(offset);
    };
    Buffer.prototype.readInt16BE = function (offset, noAssert) {
        return this._readNum(offset, 2, false, true, noAssert);
    };
    Buffer.prototype.readInt16LE = function (offset, noAssert) {
        return this._readNum(offset, 2, true, true, noAssert);
    };
    Buffer.prototype.readInt32BE = function (offset, noAssert) {
        return this._readNum(offset, 4, false, true, noAssert);
    };
    Buffer.prototype.readInt32LE = function (offset, noAssert) {
        return this._readNum(offset, 4, true, true, noAssert);
    };
    Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
        if (typeof offset !== 'number')
            offset = 0;
        if (this._throwOrReturnOnOutOfRange(offset, noAssert))
            return;
        this._setOctet(offset, value);
    };
    Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
        if (typeof offset !== 'number')
            offset = 0;
        if (this._throwOrReturnOnOutOfRange(offset, noAssert))
            return;
        this._setOctet(offset, value);
    };
    return Buffer;
}());
exports.Buffer = Buffer;

"use strict";
var libsys = require('libsys');
var libjs = require('../libjs/libjs');
var SharedArrayBuffer = (function () {
    function SharedArrayBuffer() {
    }
    SharedArrayBuffer.alloc = function (length) {
    };
    SharedArrayBuffer.allocAt = function (address, length) {
    };
    return SharedArrayBuffer;
}());
exports.SharedArrayBuffer = SharedArrayBuffer;
var StaticArrayBuffer = (function () {
    function StaticArrayBuffer() {
    }
    StaticArrayBuffer.getProtectionValue = function (prot) {
        if (typeof prot !== 'string')
            throw TypeError('Protection must be a string.');
        if (prot.match(/[^rwe]/))
            throw TypeError("Protection string can contain only \"r\", \"w\" and \"e\" characters, given \"" + prot + "\".");
        var val = 0;
        if (prot.indexOf('r') > -1)
            val |= 1 /* READ */;
        if (prot.indexOf('w') > -1)
            val |= 2 /* WRITE */;
        if (prot.indexOf('e') > -1)
            val |= 4 /* EXEC */;
        return val;
    };
    // Allocates memory using `mmap` system call.
    StaticArrayBuffer.alloc = function (size, protection) {
        if (protection === void 0) { protection = 'rw'; }
        var prot = StaticArrayBuffer.getProtectionValue(protection);
        var addr = libjs.mmap(0, size, prot, 2 /* PRIVATE */ | 32 /* ANONYMOUS */, -1, 0);
        if (addr[1] < 0)
            throw Error('Could not allocate memory.');
        var ab = libsys.malloc64(addr[0], addr[1], size);
        ab.getAddress = StaticArrayBuffer.getAddress.bind(ab);
        ab.setProtection = StaticArrayBuffer.setProtection.bind(ab);
        ab.free = StaticArrayBuffer.free.bind(ab);
        return ab;
    };
    StaticArrayBuffer.getAddress = function () {
        var ab = this;
    };
    StaticArrayBuffer.setProtection = function (prot) {
    };
    StaticArrayBuffer.free = function () {
        var ab = this;
        libjs.munmap();
    };
    StaticArrayBuffer.call = function () {
        var ab = this;
    };
    return StaticArrayBuffer;
}());
exports.StaticArrayBuffer = StaticArrayBuffer;

// var libsys = require('../libsys/libsys');
var libsys = require('libsys');
// var libjs = require('../libjs/libjs');
var libjs = require('libjs');


exports.StaticArrayBuffer = StaticArrayBuffer;


function prot2num(prot) {
    if(typeof prot !== 'string')
        throw TypeError('Protection must be a string.');
    if(prot.match(/[^rwe]/))
        throw TypeError('Protection string can contain only "r", "w" and "e" characters, given "' + prot + '".');

    var val = 0 /* PROT_NONE */;
    if(prot.indexOf('r') > -1) val |= 1 /* PROT_READ */;
    if(prot.indexOf('w') > -1) val |= 2 /* PROT_WRITE */;
    if(prot.indexOf('e') > -1) val |= 4 /* PROT_EXEC */;
    return val;
}


function alloc(size, prot) {
    if(typeof size !== 'number')
        throw TypeError('size must be a number.');
    if(size < 0)
        throw TypeError('Invalid size argument.');

    if(!prot) prot = 'rw';

    var flags = 2 /* MAP_PRIVATE */ | 32 /* MAP_ANONYMOUS */;
    var protnum = prot2num(prot);
    var addr = libjs.mmap(0, size, protnum, flags, -1, 0);
    if(addr[1] < 0)
        throw Error('Could not allocate memory.');

    var ab = libsys.malloc(addr, size);
    if(!(ab instanceof ArrayBuffer))
        throw Error('Could not allocate ArrayBuffer.');

    return ab;
}


function allocAt(addr, size) {
    var ab = libsys.malloc(addr, size);
    if(!(ab instanceof ArrayBuffer))
        throw Error('Could not allocate ArrayBuffer.');
    return ab;
}


function StaticArrayBuffer(size, prot) {
    var ab;
    if(size instanceof ArrayBuffer) {
        ab = size;
    } else {
        ab = alloc(size, prot);
    }
    ab.__proto__ = StaticArrayBuffer.prototype;
    return ab;
}

ArrayBuffer.Static = StaticArrayBuffer;

StaticArrayBuffer.alloc = function(size, prot) {
    return new StaticArrayBuffer(size, prot);
};

StaticArrayBuffer.allocAt = function(addr, size) {
    return new StaticArrayBuffer(allocAt(addr, size));
};

StaticArrayBuffer.isStaticArrayBuffer = function(sab) {
    if((sab instanceof StaticArrayBuffer) && (typeof sab.getAddress === 'function')) return true;
    return false;
};

StaticArrayBuffer.prototype.__proto__ =
    ArrayBuffer.prototype;

StaticArrayBuffer.prototype.call = function(args, offset) {
    // if(!args) args = [];
    if(!offset) offset = 0;
    return libsys.call(this, offset, args);
};

StaticArrayBuffer.prototype.setProtection = function(prot) {
    var protnum = prot2num(prot);
    // return libjs.mprotect(this, this.length, protnum);
    var res = libjs.mprotect(this, this.length, protnum);
    if(res < -1) throw Error('Could not change protection level.');
};

StaticArrayBuffer.prototype.free = function() {
    var res = libjs.munmap(this, this.length);
    if(res < 0) throw Error('Error on freeing memory.');
};

StaticArrayBuffer.prototype.getAddress = function(offset) {
    return libsys.addressArrayBuffer64(this, offset);
};

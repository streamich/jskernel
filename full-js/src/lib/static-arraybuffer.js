exports.StaticArrayBuffer = StaticArrayBuffer;

// new StaticArrayBuffer(size);
// StaticArrayBuffer.frame(address, size);
// StaticArrayBuffer.alloc(size, protection);


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


// "frame" because it does not allocate,
// just frames a slice of memory into ArrayBuffer.
function frame(addr, size) {
    var ab = process.frame(addr, size);
    if(!(ab instanceof ArrayBuffer))
        throw Error('Could not allocate ArrayBuffer.');
    return ab;
}


function alloc(size, prot) {
    if (typeof size !== 'number')
        throw TypeError('size must be a number.');
    if (size < 0)
        throw TypeError('Invalid size argument.');

    if (!prot) prot = 'rw';

    var flags = 2 /* MAP_PRIVATE */ | 32 /* MAP_ANONYMOUS */;
    var protnum = prot2num(prot);
    var libjs = require('../libjs/index');
    var addr = libjs.mmap(0, size, protnum, flags, -1, 0);

    // Address in 64-bit x86 can be negative and errors are from -1 to -124.
    if ((addr[1] === -1) && ((addr[0] < 0) && (addr[0] > -125)))
        throw Error('Could not allocate memory.');

    var ab = frame(addr, size);
    return ab;
}


// Two constructors, one exposed externally to user:
//
//  1. new StaticArrayBuffer(size)
//
// Another one that we just use internally here:
//
//  2. new StaticArrayBuffer(arrayBuffer);
//
function StaticArrayBuffer(size) {
    var ab;
    if(size instanceof ArrayBuffer) {
        ab = size;
    } else {
        ab = new ArrayBuffer(size); // Let's pray it's actually 'static'.
    }
    ab.__proto__ = StaticArrayBuffer.prototype;
    return ab;
}


// # Static methods

// StaticArrayBuffers allocated with `alloc` have to be (currently) freed using `buffer.free`.
StaticArrayBuffer.alloc = function(size, prot) {
    return new StaticArrayBuffer(alloc(size, prot));
};

StaticArrayBuffer.frame = function(addr, size) {
    return new StaticArrayBuffer(frame(addr, size));
};

StaticArrayBuffer.isStaticArrayBuffer = function(sab) {
    if((sab instanceof StaticArrayBuffer) && (typeof sab.getAddress === 'function')) return true;
    return false;
};



StaticArrayBuffer.prototype.__proto__ =
    ArrayBuffer.prototype;



// # Member instance methods

StaticArrayBuffer.prototype.call = function(offset, args) {
    if(typeof offset !== 'number') offset = 0;
    if(offset < 0) offset = 0;
    if(!isFinite(offset)) offset = 0;

    if(!(args instanceof Array)) args = [];

    return process.call(this, offset, args);
};

StaticArrayBuffer.prototype.setProtection = function(prot) {
    var protnum = prot2num(prot);
    // return libjs.mprotect(this, this.length, protnum);
    var libjs = require('../libjs/index');
    var res = libjs.mprotect(this, this.length, protnum);
    if(res < -1)
        throw Error('Could not change protection level.');
};

StaticArrayBuffer.prototype.free = function() {
    var libjs = require('../libjs/index');
    var res = libjs.munmap(this, this.length);
    if(res < 0)
        throw Error('Error on freeing memory.');
};

StaticArrayBuffer.prototype.getAddress = function(offset) {
    return process.getAddress(this, offset);
};

var StaticArrayBuffer = ArrayBuffer.Static || require('./arraybuffer').StaticArrayBuffer;


exports.StaticBuffer = StaticBuffer;


function toChar(num) {
    if(num < 30) return '.';
    else return String.fromCharCode(num);
}

function printBuffer(buf) {
    var int_size = 8;
    var ints = Math.ceil(buf.length / int_size);
    var lines = [];

    for(var j = 0; j < ints; j++) {
        var parts = [];
        var chars = [];

        var addr = '';
        addr = (j * int_size).toString();
        if(addr.length < 6)
            addr = (new Array(7 - addr.length)).join('0') + addr;

        parts.push(addr + ' ');

        for(var m = 0; m < int_size; m++) {
            var index = (j * int_size) + m;
            if(index >= buf.length) break;
            var char = buf[index];
            chars.push(toChar(char));
            var hex = char.toString(16);
            if(hex.length === 1) hex = '0' + hex;
            parts.push(hex);
        }

        var len = parts.join(' ').length;
        if(len < 32) parts.push((new Array(32 - len)).join(' '))
        else parts.push('  ');
        parts.push(chars.join(''));
        lines.push(parts.join(' '));
    }

    var str = lines.join('\n');
    console.log(str);
}


// function bufferNew(size) {
//     return new Buffer(size); // Node < 6.0
// return Buffer.allocUnsafe(size); // Node 6.0
// }

function bufferFrom(arr, a, b) {
    return new Buffer(arr, a, b); // Node < 6.0
    // return Buffer.from(arr, a, b); // Node 6.0
}

// function StaticBuffer(staticArrayBuffer, byteOffset, length);
// function StaticBuffer(size, prot);
function StaticBuffer(a, b, c) {
    var buf;
    if(StaticArrayBuffer.isStaticArrayBuffer(a)) {
        var staticArrayBuffer = a, byteOffset = b, length = c;
        if(!byteOffset) byteOffset = 0;
        if(!length) length = staticArrayBuffer.byteLength;
        buf = bufferFrom(staticArrayBuffer);
        buf = buf.slice(byteOffset, byteOffset + length);
    } else if(typeof a === 'number') {
        var size = a, prot = b;
        var sab = new StaticArrayBuffer(size, prot);
        buf = bufferFrom(sab);
    } else
        throw TypeError('Invalid StaticBuffer constructor arguments.');

    buf.__proto__ = StaticBuffer.prototype;
    return buf;
}

Buffer.Static = StaticBuffer;

StaticBuffer.isStaticBuffer = function(sbuf) {
    if((sbuf instanceof StaticBuffer) && (typeof sbuf.getAddress === 'function')) return true;
    else return false;
};

StaticBuffer.allocUnsafe = function(size, prot) {
    return new StaticBuffer(size, prot);
};

StaticBuffer.alloc = function(size, fill, encoding, prot) {
    var sab = new StaticBuffer(size, prot);
    sab.fill(fill, 0, sab.length, encoding);
    return sab;
};

StaticBuffer.from = function(obj, a, b, c) {
    if(obj instanceof Array) {
        var array = obj;
        var size = array.length;
        var prot = a;
        var sbuf = new StaticBuffer(size, prot);

        // var buf = bufferFrom(array);
        // buf.copy(sbuf);
        for(var i = 0; i < array.length; i++)
            sbuf[i] = array[i];

        return sbuf;
    } else if(StaticArrayBuffer.isStaticArrayBuffer(obj)) {
        var staticArrayBuffer = obj, byteOffset = a, length = b;
        return new StaticBuffer(staticArrayBuffer, byteOffset, length);
    } else if(obj instanceof ArrayBuffer) {
        var arrayBuffer = obj, byteOffset = a, length = b, prot = c;
        var buf = bufferFrom(arrayBuffer, byteOffset, length);
        var size = buf.length;
        var sbuf = new StaticBuffer(size, prot);
        sbuf.fill(buf);
        return sbuf;
    } else if(obj instanceof Uint8Array) {
        // This includes `instanceof Buffer` as Buffer extends Uint8Array.
        var buf = bufferFrom(obj);
        var size = buf.length;
        var prot = a;
        var sbuf = new StaticBuffer(size, prot);
        sbuf.fill(buf);
        return sbuf;
    } else
        throw TypeError("Don't know how to create StaticBuffer from this type.");
};

StaticBuffer.prototype.__proto__ =
    Buffer.prototype;

StaticBuffer.prototype.call = function(args, offset) {
    if(!args) args = [];
    if(!offset) offset = 0;
    return this.buffer.call(args, this.byteOffset + offset);
};

StaticBuffer.prototype.getAddress = function(offset) {
    if(!offset) offset = 0;
    return this.buffer.getAddress(this.buffer.byteOffset + offset);
};

// In general we extend the `Buffer` object and all methods return
// either something that is not buffer or `Buffer` objects that is `this`
// except for `.slice()` method that creates a new `Buffer`. We overwrite it
// because we want to return an object of `StaticBuffer` instead.
StaticBuffer.prototype.slice = function(start, end) {
    if(!start) start = 0;
    if(!end) end = this.length;
    if(typeof start !== 'number') throw TypeError('start must be number');
    if(typeof end !== 'number') throw TypeError('end must be number');
    var length = end - start;
    if(length <= 0) throw TypeError('end must be greater than start');
    return new StaticBuffer(this.buffer, start, length);
};

StaticBuffer.prototype.print = function() {
    printBuffer(this);
};

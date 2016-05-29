import * as buffer from '../buffer';


var data = [1,-2,3,4, 0,0,0,0];
// var data = [1,-2,3,4];
var buf = new Buffer(data);
var mybuf = buffer.Buffer.from(data);

console.log(buf.readInt16BE(1));
console.log(mybuf.readInt16BE(1));


console.log(buf.readInt16BE(0));
console.log(buf.readInt16LE(1));
console.log(mybuf.readInt16BE(0));
console.log(mybuf.readInt16LE(1));
//
// console.log(buf.readInt32BE(0));
// console.log(buf.readInt32LE(0));
// console.log(mybuf.readInt32BE(0));
// console.log(mybuf.readInt32LE(0));
// console.log(buf.readInt32LE(1));



// console.log(buf.readUInt8(0));
// console.log(mybuf.readUInt8(0));
//
// console.log(buf);
// console.log(mybuf);


// var sb = StaticArrayBuffer.alloc(20);
// console.log(sb);
//
// var ab = new ArrayBuffer(20);
// var view = new Uint8Array(ab);
// var buf = new Buffer(ab);
//
// view[0] = 25;
// console.log(buf.readUInt8(0));
// console.log(buf);
// console.log(view[0]);
// console.log(ab);

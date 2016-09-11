

var buf = new Buffer('Hello');
var frame = process.frame(buf, buf.length);

console.log(frame);
var ua = new Uint8Array(frame);

for(var i = 0; i < ua.length; i++) console.log(ua[i]);

console.log(process.getAddress(buf));
console.log(process.getAddress(frame));
console.log('Buffer: ', buf.getAddress());

var sb = new StaticBuffer(12);
setTimeout(function() {
    console.log('StaticBuffer: ', sb.getAddress());
}, 100);

var sb2 = StaticBuffer.from('str');
setTimeout(function() {
    console.log('StaticBuffer: ', sb2.getAddress());
}, 100);

console.log(frame.getAddress());

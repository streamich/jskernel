var addon = require('./build/Release/jskernel-sys');

var str = 'Hello world, hell yeah!';
var buf = new Buffer(str + '\n');
console.log(addon.syscall64(331, 1, buf, buf.length));
console.log(addon.errno());

var addr = addon.addr(buf);
console.log('Addr', addr);
var newbuf = addon.malloc(addr, buf.length);
console.log('newbuf', newbuf.toString());

setTimeout(function() {}, 4000);

// var addr = addon.addr(buf);
// var size = buf.length;
//
// console.log(addr, size);
// console.log(addon.addr64(buf));

// var myaddr = addon.gen();
// console.log(myaddr);
// var buf_alloc = addon.malloc(myaddr, 3);
// console.log(' > .> ', buf_alloc.toString());

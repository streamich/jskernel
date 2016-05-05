var addon = require('./build/Release/sys.node');

var str = 'Hello world, hell yeah!';
var buf = new Buffer(str + '\n');
// console.log(addon.syscall64(331, 1, buf, buf.length));
// console.log(addon.errno());

// console.log(buf.toString());
var addr = addon.addr64(buf);
var arr = addon.malloc64(addr[0], addr[1], buf.length);
console.log(arr);
var newbuf = new Buffer(arr);
console.log('Addr', addr);
console.log('buf', buf.toString(), buf.length);
console.log('newbuf', newbuf.toString(), newbuf.length);
// console.log('newbuf', newbuf.toString(), newbuf.length);
// console.log('newbuf addr', addon.addr64(newbuf));


// var addr = addon.addr(buf);
// var size = buf.length;
//
// console.log(addr, size);
// console.log(addon.addr64(buf));

// var myaddr = addon.gen();
// console.log(myaddr);
// var buf_alloc = addon.malloc(myaddr, 3);
// console.log(' > .> ', buf_alloc.toString());

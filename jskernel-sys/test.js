var addon = require('./build/Release/jskernel-sys');

var str = 'Hello world, hell yeah!';
var buf = new Buffer(str + '\n');
addon.syscall(1, 1, buf, buf.length);
console.log(addon.addr(buf));
console.log(addon.addr64(buf));

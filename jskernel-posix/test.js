var syscall = require('jskernel-sys').syscall;

var buf = new Buffer('trololo');
console.log(syscall(1, 1, buf, buf.length));
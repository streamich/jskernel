"use strict";
var index_1 = require('./index');
var definitions_1 = require('../libjs/definitions');
var asyscall = new index_1.Asyscall;
asyscall.build(4, 10);
console.log(asyscall.errorTimeout);
asyscall.exec(definitions_1.syscalls.getpid, function (res, thread) {
    console.log('result pid:', res, thread);
});
setTimeout(function () {
    asyscall.stop();
    setTimeout(function () {
        asyscall.sbuf.print();
    }, 100);
}, 100);

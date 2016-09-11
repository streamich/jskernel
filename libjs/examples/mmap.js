"use strict";
var libjs = require('../libjs');
var sys = require('../node_modules/libsys/index');
// mmap(0, size, PROT_READ | PROT_WRITE | PROT_EXEC, MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
var filepath = '/share/jskernel-posix/examples/read.txt';
// var fd = libjs.open(filepath, posix.OFLAG.O_RDONLY);
// console.log(fd);
var code = new Buffer([
    0x48, 0x89, 0xc6,
    0x48, 0xc7, 0xc0, 1, 0, 0, 0,
    0x48, 0xc7, 0xc7, 1, 0, 0, 0,
    0x48, 0x83, 0xc6, 31,
    0x48, 0xc7, 0xc2, 13, 0, 0, 0,
    0x0f, 0x05,
    0xc3,
    0x48, 0x65, 0x6C, 0x6C, 0x6F, 0x20,
    0x57, 0x6F, 0x72, 0x6C, 0x64, 0x21,
    0x0A, 0 // \n\0
]);
var addr = libjs.mmap(0, 1024, 1 /* READ */ | 2 /* WRITE */ | 4 /* EXEC */, 2 /* PRIVATE */ | 32 /* ANONYMOUS */, -1, 0);
// var addr = libjs.mmap(0, 1024, 7, 34, -1, 0);
console.log(addr);
// var myaddr = [0x44332211, 0x88776655];
var myaddr = addr;
// var addrbuf = new Buffer(8);
// addrbuf.writeInt32LE(myaddr[0], 0);
// addrbuf.writeInt32LE(myaddr[1], 4);
// console.log('addrbuf', addrbuf);
// addrbuf.copy(code, 2);
var arr = sys.malloc64(addr[0], addr[1], 1024);
var buf = new Buffer(arr);
code.copy(buf, 0);
console.log(code);
console.log(arr);
console.log(buf);
sys.call64(addr[0], addr[1]);
// setTimeout(() => {}, 3000);

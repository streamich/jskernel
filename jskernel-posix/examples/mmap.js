"use strict";
var posix = require('../posix');
var filepath = '/share/jskernel-posix/examples/read.txt';
var fd = posix.open(filepath, posix.OFLAG.O_RDONLY);
console.log(fd);
var map = posix.mmap(0, 100, posix.PROT.NONE, posix.MAP.PRIVATE, fd, 0);
console.log(map);

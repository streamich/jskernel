"use strict";
var posix = require('../posix');
var filepath = '/share/jskernel-posix/examples/read.txt';
var fd = posix.open(filepath, 0 /* O_RDONLY */);
console.log(fd);
var map = posix.mmap(0, 100, 0 /* NONE */, 0 /* PRIVATE */, fd, 0);
console.log(map);

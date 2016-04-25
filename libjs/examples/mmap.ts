import * as libjs from '../libjs';


var filepath = '/share/jskernel-posix/examples/read.txt';
var fd = libjs.open(filepath, posix.OFLAG.O_RDONLY);
console.log(fd);
var map = libjs.mmap(0, 100, posix.PROT.NONE, posix.MAP.PRIVATE, fd, 0);
console.log(map);

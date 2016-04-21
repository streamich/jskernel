import * as posix from '../posix';
import * as fs from 'fs';

var filepath = '/share/jskernel-posix/examples/read.txt';
var fd = posix.open(filepath, posix.open.flag.O_RDONLY);
var stats = posix.stat(filepath);
console.log(stats);
var stats2 = posix.fstat(fd);
console.log(stats2);
console.log(fs.statSync(filepath));

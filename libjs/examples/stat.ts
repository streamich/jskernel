import * as libjs from '../libjs';
import * as defs from '../definitions';
import * as fs from 'fs';

var filepath = '/share/libjs/examples/read.txt';
var fd = libjs.open(filepath, defs.FLAG.O_RDONLY);
var stats = libjs.stat(filepath);
console.log(stats);
var stats2 = libjs.fstat(fd);
console.log(stats2);
console.log(fs.statSync(filepath));

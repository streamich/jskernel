"use strict";
var libfs = require('../fs');
var path = __dirname + '/test.txt';
// fs.accessSync(__dirname + '/data.txt');
// libfs.accessSync(__dirname + '/data.txt');
// var fd = fs.openSync(path, 'r');
// var stats = fs.fstatSync(fd);
// console.log(stats);
var stats2 = libfs.truncateSync(path, 5);

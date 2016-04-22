"use strict";
var posix = require('../posix');
// listenfd = socket(AF_INET, SOCK_STREAM, 0);
var fd = posix.socket(2 /* INET */, 1 /* STREAM */, 0);
console.log(fd);

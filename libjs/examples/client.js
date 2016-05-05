"use strict";
var libjs = require('../libjs');
var socket = require('../socket');
var defs = require('../definitions');
var fd = libjs.socket(2 /* INET */, 1 /* STREAM */, 0);
var addr_in = {
    sin_family: 2 /* INET */,
    sin_port: socket.hton16(8080),
    sin_addr: {
        s_addr: new socket.Ipv4('127.0.0.1')
    },
    sin_zero: [0, 0, 0, 0, 0, 0, 0, 0]
};
var res;
res = libjs.connect(fd, addr_in);
console.log('connect', res);
res = libjs.write(fd, 'GET / \n\n');
console.log('write', res);
// posix.send(fd, new Buffer('GET / \n\n\0'));
setTimeout(function () {
    var buf = new Buffer(1000);
    var bytes = libjs.read(fd, buf);
    console.log(buf.toString().substr(0, bytes));
    libjs.close(fd);
}, 20);

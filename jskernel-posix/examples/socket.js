"use strict";
var posix = require('../posix');
var socket = require('../socket');
var defs = require('../definitions');
var fd = posix.socket(2 /* INET */, 1 /* STREAM */, 0);
var addr_in = {
    sin_family: 2 /* INET */,
    sin_port: socket.htons32(80),
    sin_addr: {
        s_addr: new socket.Ipv4('192.168.1.150')
    },
    sin_zero: [0, 0, 0, 0, 0, 0, 0, 0]
};
posix.connect(fd, addr_in);
posix.write(fd, 'GET / \n\n');
// posix.send(fd, new Buffer('GET / \n\n'));
setTimeout(function () {
    var buf = new Buffer(1000);
    var bytes = posix.read(fd, buf);
    console.log(buf.toString().substr(0, bytes));
    posix.close(fd);
}, 20);

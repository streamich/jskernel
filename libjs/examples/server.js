"use strict";
var libjs = require('../libjs');
var socket = require('../socket');
var defs = require('../definitions');
var fd = libjs.socket(2 /* INET */, 1 /* STREAM */, 0);
var serv_addr = {
    sin_family: 2 /* INET */,
    sin_port: socket.hton16(8080),
    sin_addr: {
        s_addr: new socket.Ipv4('0.0.0.0')
    },
    sin_zero: [0, 0, 0, 0, 0, 0, 0, 0]
};
libjs.bind(fd, serv_addr);
libjs.listen(fd, 10);
var client_addr_buf = new Buffer(defs.sockaddr_in.size);
var sock = libjs.accept(fd, client_addr_buf);
setInterval(function () {
    var msg = new Buffer(255);
    var bytes = libjs.read(sock, msg);
    var str = msg.toString().substr(0, bytes);
    libjs.write(sock, str);
}, 50);
// Now telnet to your server and talk to it:
// telnet 127.0.0.1 8080

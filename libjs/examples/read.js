"use strict";
var libjs = require('../libjs');
var defs = require('../definitions');
var filepath = '/share/libjs/examples/read.txt';
var fd = libjs.open(filepath, 0 /* O_RDONLY */);
if (fd > -1) {
    var buf = new Buffer(1024);
    var bytes_read = libjs.read(fd, buf);
    console.log('Bytes read: ', bytes_read);
    console.log(buf.toString().substr(0, bytes_read));
}
else {
    console.log('Error: ', fd);
}
libjs.openAsync(filepath, 0 /* O_RDONLY */, null, function (fd) {
    if (fd > -1) {
        var buf = new Buffer(1024);
        libjs.readAsync(fd, buf, function (bytes_read) {
            console.log('Bytes read: ', bytes_read);
            console.log(buf.toString().substr(0, bytes_read));
        });
    }
    else {
        console.log('Error: ', fd);
    }
});

"use strict";
var fs_1 = require("./fs");
var fs = fs_1.build({
    path: require('path'),
    EventEmitter: require('events').EventEmitter,
    Buffer: require('buffer').Buffer,
    Readable: require('stream').Readable,
    Writable: require('stream').Writable
});
var data = fs.readFileSync('./examples/test.txt');
console.log(data.toString());

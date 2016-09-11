import {build} from "./fs";
declare var require;

var fs = build({
    path: require('path'),
    EventEmitter: require('events').EventEmitter,
    Buffer: require('buffer').Buffer,
    Readable: require('stream').Readable,
    Writable: require('stream').Writable,
});


var data = fs.readFileSync('./examples/test.txt');
console.log(data.toString());

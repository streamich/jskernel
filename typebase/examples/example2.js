var t = require('./typebase.js');

// ```c
// struct address {
//     int port,
//     unsigned char ip[4],
// }
// ```


var address = t.Struct.define([
    ['port', t.i32],
    ['ip', t.List.define(t.ui8, 4)]
]);

var p = new t.Pointer(new Buffer(address.size), 0);
var host = {
    port: 8080,
    ip: [127, 0, 0, 1]
};
address.pack(p, host);
var unpacked = address.unpack(p);


console.log(host);
console.log(p.buf);
console.log(unpacked);

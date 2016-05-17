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

var p = new t.Pointer(new Buffer(100), 0);


var host = {
    port: 8080,
    ip: [127, 0, 0, 1]
};

var v = new t.Variable(address, p);
v.pack(host);
var unpacked = v.unpack();



var address_and_protocol = t.Struct.define([
    address,
    ['protocol', t.i32]
]);


v.cast(address_and_protocol);

v.pack({
    port: 8080,
    ip: [127, 0, 0, 1],
    protocol: 4
});

console.log(v.get('protocol').unpack());




console.log(p.buf);


var t = require('../typebase.js');


var address = t.Struct.define([
    ['port', t.i32],
    ['ip', t.List.define(t.ui8, 4)]
]);


var packet = t.Struct.define([
    ['id', t.ui32],
    ['addr', address],
    ['time', t.i32]
]);


var p = new t.Pointer(new Buffer(100), 0);
var v = new t.Variable(packet, p);

v.get('addr').get('ip').pack([127, 0, 0, 1]);
console.log(v.get('addr').get('ip').unpack());
console.log(p.buf);



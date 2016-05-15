var t = require('./typebase.js');


var Books = t.Struct.define([
    ['title',    t.List.define(t.i8, 50)],
    ['book_id',  t.i32]
]);

var mybook = {
    title: 'Some Book Title'.split('').map(function(char) { return char.charCodeAt(0) }),
    book_id: 1234
};

var buf = new Buffer(Books.size);
buf.fill(0);
var p = new t.Pointer(buf, 0);

Books.pack(p, mybook);

console.log(p.buf);

var unpacked = Books.unpack(p);
unpacked.title = unpacked.title.map(function(char) { return String.fromCharCode(char); }).join('');
unpacked.title = unpacked.title.substr(0, unpacked.title.indexOf('\0'));
console.log(unpacked);


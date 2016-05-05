"use strict";
var struct = require('./struct');
var struct_1 = require('./struct');
var t_string = struct_1.Struct.define([
    ['length', struct.t_ui16],
    ['max', struct.t_ui16],
    ['value', struct_1.List.define(struct.t_char)],
]);
var p = new struct.Pointer(new Buffer(20));
var mystr = new struct.Variable(t_string, p);
mystr.pack({
    length: 3,
    max: 20,
    value: [1, 2, 3]
});
console.log(p);
var str = mystr.unpack();
console.log(str);
str.value = mystr.getField('value').unpack(str.length);
console.log(str);
var t_object = struct_1.Struct.define([
    ['type', struct_1.t_i8],
    ['ref', struct.t_pointer]
]);
var t_number = struct_1.Struct.define([
    ['obj', t_object],
    ['value', struct_1.t_i32],
]);

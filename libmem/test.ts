import * as struct from './struct';
import {Struct, List, t_i8, t_i32} from './struct';


var t_string = Struct.define([
    ['length', struct.t_ui16],
    ['max', struct.t_ui16],
    ['value', List.define(struct.t_char)],
]);

var p = new struct.Pointer(new Buffer(20));
var mystr = new struct.Variable(t_string, p);

mystr.pack({
    length: 3,
    max: 20,
    value: [1, 2, 3],
});

console.log(p);

var str = mystr.unpack();
console.log(str);
str.value = mystr.getField('value').unpack(str.length);
console.log(str);


var t_object = Struct.define([
    ['type', t_i8],
    ['ref', struct.t_pointer]
]);


var t_number = Struct.define([
    ['obj', t_object],
    ['value', t_i32],
]);


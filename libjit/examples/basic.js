"use strict";
var jit = require('../libjit');
var interpreter_1 = require('../compiler/interpreter');
var ret2 = new jit.Function;
ret2.setReturn(jit.OperandValue.create(2));
var c = new jit.Composer(new jit.Function);
var val = c.call(ret2, []);
var i = c.define(10);
var loop_start = c.label();
c
    .add(i, -1)
    .mul(val, 2)
    .jif(i, loop_start)
    .returns(val);
// console.log(c.func);
c.print();
var interp = new interpreter_1.Interpreter();
var result = interp.run(c.func, [1]);
console.log(result);
// var gcd = new jit.Function;
// var s = new jit.Composer(gcd);
//
// var x = s.arg(0);
// var y = s.arg(1);

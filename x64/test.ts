import * as i from './instruction';
import {extend} from './util';
import {Encoder} from './encoder';
import {rax, r8} from './regfile';
import * as def from './def';
import {Code} from './code';


var _ = new Code;
_.movq(rax, rax);
// _.push(rax);
// _.push(r8);
// _.pop(rax);
// _.push(r8);
console.log(new Buffer(_.compile()));


// console.log(_.push(rax).write([]));
// console.log(_.push(r8).write([]));
// console.log(_.pop(rax).write([]));
// console.log(_.push(r8).write([]));



// var ops = new i.Operands(r8);
// var encoder = new Encoder;
// var ins = encoder.createInstruction(def.PUSH, ops);
// console.log(ins);
// var code = ins.write([]);



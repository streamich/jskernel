import {x64, rax, eax, r13, r10d} from '../index';




var _ = new x64.Code;
var ins = _.incq(0x11);
// var ins = _.incq(rax.ref());
// var ins = _.incq(rax.ref().disp(0x11));
// var ins = _.incq(rax);
// var ins = _.sysenter();
// var ins = _.int(0x80);
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



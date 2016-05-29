import * as t from '../x86/table';
import * as d from '../x86/def';
import {rax, rdx, rsi, rdi, rbx, rcx} from '../x86/operand';
import {table, Code} from '../x64/code';



var _ = new Code;

// var ins = _.addq(rsi, 31);
// console.log(ins);


_.movq(rsi, rax);
_.movq(rax, 1);
_.movq(rdi, 1);
_.addq(rsi, 31);
_.movq(rdx, 13);
_.syscall();
_.ret();
_.db('Hello World!\n\0');

// var ins = _.movq(rax.ref(), rax);
// var ins = _.movq(rax, 0x01);
// var ins = _.ret(5);
// console.log(ins);
// _.incq(rax).lock();
// var ins = _.int(0x80);
// _.syscall();

var bin = _.compile();
console.log(_.toString());


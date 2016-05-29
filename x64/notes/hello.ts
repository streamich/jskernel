import {rax, rdx, rsi, rdi, rbx, rcx} from '../x86/operand';
import {Code} from '../x64/code';

var _ = new Code;

_.movq(rsi, rax);
_.movq(rax, 1);
_.movq(rdi, 1);
_.addq(rsi, 31);
_.movq(rdx, 13);
_.syscall();
_.ret();
_.db('Hello World!\n\0');

console.log(_.toString());

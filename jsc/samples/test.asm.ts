var StaticBuffer = require('../../static-buffer/buffer').StaticBuffer;
import {Code} from '../../ass-js/x86/x64/code';
import {rax, rbx, rdx, rcx, rbp, rsp, rdi, rsi, r8, r9, r10, r11, r12, r13, r14, r15, Register} from '../../ass-js/x86/operand';




var _ = new Code;

_._('push', rbp);
_._('push', rbx);

_._('mov', [rbp, rsp]);
_._('sub', [rsp, 0x10]);

_._('mov', [r13, 5]);
_._('mov', [rax, rdi]);
_._('mov', [rbx, r13]);

_._('add', [rax, r13]);
// _._('mov', [rax, 123]);

_._('mov', [rsp, rbp]);
_._('pop', rbx);
_._('pop', rbp);
_._('ret');

// 004         movq    r13, 0x00000005             ; 000004|000004 0x49, 0xC7, 0xC5, 0x05, 0x00, 0x00, 0x00 7 bytes
// 005         movq    rax, rdi                    ; 00000B|00000B 0x48, 0x89, 0xF8 3 bytes
// 006         movq    rbx, r13                    ; 00000E|00000E 0x4C, 0x89, 0xEB 3 bytes
// 007         addq    rax, rbx                    ; 000011|000011 0x48, 0x01, 0xD8 3 bytes
// 008         movq    r12, rax                    ; 000014|000014 0x49, 0x89, 0xC4 3 bytes
// 009         movq    rdi, r12                    ; 000017|000017 0x4C, 0x89, 0xE7 3 bytes
// 010         movq    rax, rdi                    ; 00001A|00001A 0x48, 0x89, 0xF8 3 bytes
// 011         movq    rsp, rbp                    ; 00001D|00001D 0x48, 0x89, 0xEC 3 bytes


console.log(_.toString());

var bin = _.compile();
var buf = new StaticBuffer(bin.length, 'rwe');
for(var i = 0; i < bin.length; i++) buf[i] = bin[i];
var res = buf.call([5]);
console.log(res);

// 002         pushq   rbp                         ; 000000|000000 0x55 1 bytes


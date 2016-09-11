"use strict";
var operand_1 = require('../../node_modules/ass-js/x86/operand');
var code_1 = require('../../node_modules/ass-js/x86/x64/code');
var static_buffer_1 = require('../lib/static-buffer');
var _ = new code_1.Code;
var msg = 'Hello world\n';
var lbl_msg = _.lbl('message');
_._('mov', [operand_1.rax, 1]);
_._('mov', [operand_1.rdi, 1]);
_._('lea', [operand_1.rsi, operand_1.rip.disp(lbl_msg)]);
_._('mov', [operand_1.rdx, msg.length]);
_._('syscall');
_._('ret');
_.insert(lbl_msg);
_.db(msg);
var bin = _.compile();
console.log(_.toString());
var sb = static_buffer_1.StaticBuffer.alloc(bin, 'rwe');
sb.call(); // Hello world

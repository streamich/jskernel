"use strict";
var encoder_1 = require('./encoder');
var regfile_1 = require('./regfile');
var t = new encoder_1.Encoder();
var op = t.dec(regfile_1.r10d);
console.log(new Buffer(op));
var op = t.movq_r_r(regfile_1.rax, regfile_1.rax);
console.log(new Buffer(op));
var op = t.movq_m_r(regfile_1.r11.ref(regfile_1.r12, 8).disp(0x11), regfile_1.rbx);
// _.mov _.r9.ref(_.r12, 4).disp(0x11), _.r8
// var op = t.movq_m_r(r.r9.ind().disp(0x11223344), r.r8);
console.log(new Buffer(op));
console.log(new Buffer(t.movabs([0x11223344, 0x55667788], regfile_1.rax)));
console.log(new Buffer(t.movq_imm_r64(0x11223344, regfile_1.rax)));
console.log(new Buffer(t.movl_imm_r32(0x11223344, regfile_1.ebx)));

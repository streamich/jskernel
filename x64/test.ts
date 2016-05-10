import {Encoder} from './encoder';
import {rax, rbx, r9, r11, r12, r10d, edx, ebx} from './regfile';


var t = new Encoder();

var op = t.dec(r10d);
console.log(new Buffer(op));

var op = t.movq_r_r(rax, rax);
console.log(new Buffer(op));


var op = t.movq_m_r(r11.ref(r12, 8).disp(0x11), rbx);
// _.mov _.r9.ref(_.r12, 4).disp(0x11), _.r8
// var op = t.movq_m_r(r.r9.ind().disp(0x11223344), r.r8);
console.log(new Buffer(op));



console.log(new Buffer(t.movabs([0x11223344, 0x55667788], rax)));
console.log(new Buffer(t.movq_imm_r64(0x11223344, rax)));
console.log(new Buffer(t.movl_imm_r32(0x11223344, ebx)));




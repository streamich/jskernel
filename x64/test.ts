import {Encoder} from './encoder';
import {rax, rbx, r9, r11, r12, r10d, eax, edx, ebx} from './regfile';


var t = new Encoder();

console.log(new Buffer(t.dec(r10d)));
console.log(new Buffer(t.mov_rm(eax, ebx)));
console.log(new Buffer(t.movq_r_r(rax, rax)));
console.log(new Buffer(t.movq_r_m(rax, rax.ref())));
console.log(new Buffer(t.movq_m_r(rbx.ref(), rax)));
console.log(new Buffer(t.movq_r_r(r12, r12)));
console.log(new Buffer(t.movq_m_r(r12.ref(), r12)));
console.log(new Buffer(t.movq_r_m(r12, r12.ref())));




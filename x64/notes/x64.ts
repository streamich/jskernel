import * as t from '../x86/table';
import * as d from '../x86/def';
import {rax} from '../x86/operand';
import {table, Code} from '../x64/code';



var _ = new Code;
var ins = _.movq(rax.ref(), rax);
// console.log(ins);
// _.incq(rax).lock();
// var ins = _.int(0x80);
// _.syscall();

var bin = _.compile();
console.log(new Buffer(bin));
console.log(_.toString());


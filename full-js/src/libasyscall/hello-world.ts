import {rax, rdi, rsi, rdx, rip} from '../../node_modules/ass-js/x86/operand';
import {Code} from '../../node_modules/ass-js/x86/x64/code';
import {StaticBuffer} from '../lib/static-buffer';


var _ = new Code;

var msg = 'Hello world\n';
var lbl_msg = _.lbl('message');

_._('mov', [rax, 1]);
_._('mov', [rdi, 1]);
_._('lea', [rsi, rip.disp(lbl_msg)]);
_._('mov', [rdx, msg.length]);
_._('syscall');
_._('ret');

_.insert(lbl_msg);
_.db(msg);


var bin = _.compile();
console.log(_.toString());
var sb = StaticBuffer.alloc(bin, 'rwe');
sb.call(); // Hello world


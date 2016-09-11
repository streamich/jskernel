import {Asyscall} from './index';
import {syscalls} from '../libjs/definitions';


var asyscall = new Asyscall;
asyscall.build(4, 10);
console.log(asyscall.errorTimeout);
asyscall.exec(syscalls.getpid, function(res, thread) {
    console.log('result pid:', res, thread);
});


setTimeout(() => {
    asyscall.stop();
    setTimeout(() => {
        asyscall.sbuf.print();
    }, 100);
}, 100);


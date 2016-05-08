import {registers as r, Register} from './model';

class Table {

    movq(src, dst) {
        // 48 89 c0             	mov    %rax,%rax
        if(src instanceof Register) {
            if(dst instanceof Register) {
                return [0x48, 0x89, 0xC0];
            }
        }
    }

}
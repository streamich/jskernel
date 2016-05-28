import {extend} from '../util';
import * as t from '../x86/table';
import {S, M, r8, r32, r64, m, m8, m32, m64, rm8, rm32, rm64, imm, imm8, imm16, imm32} from '../x86/table';


export var defaults = extend<any>({}, t.defaults,
    {s: S.DOUBLE});


export var table: t.TableDefinition = {
    mov: [
        {mn: 'mov'},
        {o: 0x8B, mn: 'movq', ops: [rm64, rm64], dbit: true},
        {o: 0xC7, ops: [r64, imm32]},
    ],
    inc: [
        {o: 0xFF, or: 0, lock: true},
        {ops: [rm32]},
        {ops: [rm64]},
    ],
    dec: [
        {o: 0xFF, or: 1, lock: true},
        {ops: [rm32]},
        {ops: [rm64]},
    ],
    syscall:    [{o: 0x0F05}],
    sysenter:   [{o: 0x0F34}],
    sysexit:    [{o: 0x0F35}],
    int:        [{o: 0xCD, ops: [imm8]}],
};


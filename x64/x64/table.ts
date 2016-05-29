import {extend} from '../util';
import * as t from '../x86/table';
import {S, M, r8, r32, r64, m, m8, m32, m64, rm8, rm32, rm64, imm, imm8, imm16, imm32} from '../x86/table';


export var defaults = extend<any>({}, t.defaults,
    {s: S.DOUBLE, rex: false});


export var table: t.TableDefinition = {
    // Arithmetic.
    add: [{},
        {o: 0x83, or: 0, ops: [rm64, imm8], s: S.QUAD},
    ],

    mov: [{mn: 'mov'},
        {o: 0x8B, mn: 'movq', ops: [rm64, rm64], dbit: true, s: S.QUAD},
        {o: 0xC7, or: 0, ops: [r64, imm32], s: S.QUAD},
    ],
    inc:        [{o: 0xFF, or: 0, ops: [rm64], lock: true, s: S.QUAD}],
    dec:        [{o: 0xFF, or: 1, ops: [rm64], lock: true, s: S.QUAD}],
    syscall:    [{o: 0x0F05}],
    sysenter:   [{o: 0x0F34}],
    sysexit:    [{o: 0x0F35}],
    int:        [{o: 0xCD, ops: [imm8]}],
    ret: [{},
        {o: 0xC3},
        {o: 0xC2, ops: [imm16]}
    ],
};


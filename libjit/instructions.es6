
var CPU = {
    data: {
        mem: {
            size: 1024 * 1024 * 1024, // 1Gb
            // value: new ArrayBuffer(1024 * 1024 * 1024)
        },
        PC: {
            size: 8
        },
        RAX: {
            size: 8
            // value: new ArrayBuffer(8)
        },
        RDI: {
            size: 8
            // value: new ArrayBuffer(8)
        }
    },
    pointer: {
        mem: {
            data: 'mem',
            indexed: 8 // Every byte can be indexed separately.
        },
        PC: {
            data: 'PC',
            offset: 0,
            size: 8
        },
        RAX: {
            data: 'RAX',
            offset: 0,
            size: 8
        },
        EAX: {
            data: 'RAX',
            offset: 4,
            size: 4
        },
        RDI: {
            data: 'RDI',
            offset: 0,
            size: 8
        }
    },

    '05': {
        src: [{p: 'EAX'}, {imm: 4}, {p: 'PC'}],
        dst: [{p: 'EAX'}, {p: 'PC'}],
        op: (eax, immediate, pc) => {
            pc += 1 + 4;
            return [eax + immediate, pc];
        }
    },
    '48': { // REX.W
        '89': {
            'C6': {
                asm: 'mov %rdi, %rax',
                src: [{p: 'RDI'}, {p: 'PC'}],
                dst: [{p: 'RAX'}, {p: 'PC'}],
                op: (rdi, pc) => {
                    pc += 3;
                    return [rdi, pc];
                }
            }
        },
        '83': {
            'C0': { // add $, %rax
                src: [{imm: 1}, {p: 'RAX'}, {p: 'PC'}],
                dst: [{p: 'RAX'}, {p: 'PC'}],
                op: (immediate, rax, pc) => {
                    pc += 3;
                    return [rax + val, pc];
                }
            }
        },
        'C7': {
            '45': {
                asm: 'mov QWORD PTR [%rbp-disp], $',
                src: [{imm: 1}, {imm: 4}, {pointer: 'RBP'}, {pointer: 'RSP'}],
                dst: [
                    {
                        pointer: 'mem',
                        index: (disp8, immediate, rbp, mem, rsp) => {
                            return rbp + disp8;
                        }
                    },
                    {pointer: 'RSP'}
                ],
                op: (disp8, immediate, rbp, rsp) => {
                    return [immediate, ++rsp];
                }
            }
        }
    }
};


var list = {
    // 32-bit


    // # 64-bit
    'mov %rdi, %rax':           [[0b01001000, 0b10001001, 0b11111000],              [0x48, 0x89, 0xF8],         [72, 127, 248]],

    // ## Move 8-bit signed integer into register.
    'mov $127, %rax':           [[0b01001000, 0b10001001, 0b11111000],              [0x48, 0x89, 0xF8],         [72, 127, 248]],

    'mov %rsi, %rax': [0x48, 0x89, 0xC6], // [0b01001000, 0b10001001, 0b11000110]
    //                                          ||||||||    ||||||||    ||||||||
    //                 REX.W 64-bit prefix ---> 01001000    ||||||||    ||||||||
    //              1 means immediate mode instruction ---> 1|||||||    ||||||||
    //                 Op-code for MOV instruction is 2 ---> 00010||    ||||||||
    //                               0 means from REG to R/M ---> 0|    ||||||||
    //                                 1 means 64-bit operand ---> 1    ||||||||
    //                         MOD 11 means "register to register" ---> 11||||||
    //                                       REG 000 is RAX register ---> 000|||
    //                                          R/M 110 is RSI register ---> 110

    'mov QWORD PTR [rbp-0x8],0x7b': [0x48, 0xc7, 0x45, 0xf8, 0x7b, 0x00, 0x00, 0x00],
    // [0b01001000, 0b11000111, 0b01000101, 0b11111000, 0b01111011, 0b00000000, 0b00000000, 0b00000000]
    //    ||||||||    ||||||||    ||||||||    ||||||||    ||||||||    ||||||||    ||||||||    ||||||||
    //    ||||||||    ||||||||    ||||||||    ||||||||    ||||||||    ||||||||    ||||||||    00000000 <--- 4th byte of constant
    //    ||||||||    ||||||||    ||||||||    ||||||||    ||||||||    ||||||||    00000000 <--- 3rd byte of constant
    //    ||||||||    ||||||||    ||||||||    ||||||||    ||||||||    00000000 <--- 2nd byte of constant
    //    ||||||||    ||||||||    ||||||||    ||||||||    01111011 <--- 1st byte of constant of 123
    //    ||||||||    ||||||||    ||||||||    11111000 <--- Disp8 signed displacement value -8
    //    ||||||||    ||||||||    |||||101 <--- RBP register as R/M
    //    ||||||||    ||||||||    ||000 <--- RAX register as REG
    //    ||||||||    ||||||||    01 <--- One-byte signed displacement (Disp8) after addressing mode
    //    ||||||||    |||||||1 <--- 64-bit operand size
    //    ||||||||    ||||||1 <--- 1 means R/M to REG
    //    ||||||||    110001 <--- MOV instruction op-code
    //    01001000 <--- REX.W 64-bit mode prefix

    //                                                                  REX.W prfx  Op-code     Mod-R/M     Disp8       Constant
    'add QWORD PTR [rbp-0x8], 0x1': [0x48, 0x83, 0x45, 0xF8, 0x01], // [0b01001000, 0b10000011, 0b01000101, 0b11111000, 0b00000001] or [72, 131, 192, 127]
    //                                                                    ||||||||    ||||||||    ||||||||    ||||||||    ||||||||
    //                                            64-bit mode prefix ---> 01001000    ||||||||    ||||||||    ||||||||    ||||||||
    //                                        1 means immediate mode instruction ---> 1|||||||    ||||||||    ||||||||    ||||||||
    //                                                   00000 is ADD instruction ---> 00000||    ||||||||    ||||||||    ||||||||
    //               d bit, 1 is from memory to register, 0 is from register to memory ---> 1|    ||||||||    ||||||||    ||||||||
    //                                s bit, 0 = 8-bit operand, 1 = 32-bit(64?) operand ---> 1    ||||||||    ||||||||    ||||||||
    //                01 indicates a 1-byte signed displacement follows addressing mode byte ---> 01||||||    ||||||||    ||||||||
    //                                                                     000 is RAX register ---> 000|||    ||||||||    ||||||||
    //                                                                        101 is RBP register ---> 101    ||||||||    ||||||||
    //                                                          Sign bit, 1 means the number is negative ---> 1|||||||    ||||||||
    //                                                     Together with the sign bit, means -8 in binary ---> 1111000    ||||||||
    //                                                                                    The constant we are adding ---> 00000001

    // ## Add 8-bit signed integer to register.
    //                                                        REX.W prfx  Op-code     Mod-R/M     Constant
    'add $127, %rax':           [0x48, 0x83, 0xc0, 0x7F], // [0b01001000, 0b10000011, 0b11000000, 0b01111111] or [72, 131, 192, 127]
    //                                                          ||||||||    ||||||||    ||||||||    ||||||||
    //                                  64-bit mode prefix ---> 01001000    ||||||||    ||||||||    ||||||||
    //                              1 means immediate mode instruction ---> 1|||||||    ||||||||    ||||||||
    //                             00000 is op-code for ADD instruction ---> 00000||    ||||||||    ||||||||
    //                                                  R/M to REG direction ---> 1|    ||||||||    ||||||||
    //                                                 1 means 64-bit operand ---> 1    ||||||||    ||||||||
    //                                     MOD 11 means "register addressing mode" ---> 11||||||    ||||||||
    //                                                 REG field 000 is RAX register ---> 000|||    ||||||||
    //                                                    R/M field 000 is RAX register ---> 000    ||||||||
    //                                                                      Constant value 127 ---> 01111111

    'add $127, %rcx':           [0x48, 0x83, 0xc1, 0x7F], // [0b01001000, 0b10000011, 0b11000001, 0b01111111] or [72, 131, 193, 127]
    'add $127, %rdx':           [0x48, 0x83, 0xc2, 0x7F], // [0b01001000, 0b10000011, 0b11000010, 0b01111111] or [72, 131, 194, 127]
    'add $127, %rdx':           [0x48, 0x83, 0xc2, 0x7F], // [0b01001000, 0b10000011, 0b11000010, 0b01111111] or [72, 131, 194, 127]
    'add $127, %rbx':           [[0b01001000, 0b10000011, 0b11000011, 0b01111111],  [0x48, 0x83, 0xc3, 0x7F],   [72, 131, 195, 127]],
    'add $127, %rbp':           [[0b01001000, 0b10000011, 0b11000101, 0b01111111],  [0x48, 0x83, 0xc5, 0x7F],   [72, 131, 197, 127]],
    'add $127, %rsi':           [[0b01001000, 0b10000011, 0b11000110, 0b01111111],  [0x48, 0x83, 0xc6, 0x7F],   [72, 131, 198, 127]],
    'add $127, %rdi':           [[0b01001000, 0b10000011, 0b11000111, 0b01111111],  [0x48, 0x83, 0xc7, 0x7F],   [72, 131, 199, 127]],

    // ## Add 32-bit unsigned to register.


    'ret':                      [[0b11000011],                                      [0xC3],                     [195]],
};



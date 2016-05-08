

export enum RTYPE {
    GENERAL_PURPOSE = 0,
    GENERAL_PURPOSE_SPECIAL, // Like RAX which plays special role in multiplication/division operations.
    STACK_POINTER,
    BASE_POINTER,
    FLOATING_POINT,
}


export class Register {
    id: boolean;
    type: RTYPE;
    name: string;
    size: number; // Size in bits.o

    constructor(id, name, size, type) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.size = size;
    }
}


export class RegisterInner extends Register {
    parent: string; // Parent register that contains this register.
    offset: number; // Offset in bits inside the parent register.

    constructor(id, name, size, offset, parent, type) {
        super(id, name, size, type);
        this.parent = parent;
        this.offset = offset;
    }
}


function reg(name, id, size, type = RTYPE.GENERAL_PURPOSE) {
    return new Register(id, name, size, type);
}

function subreg(parent, name, id, offset, size, type = RTYPE.GENERAL_PURPOSE) {
    return new RegisterInner(id, name, size, offset, parent, type);
}


export var registers = {
    rax: reg('rax', 0, 64, RTYPE.GENERAL_PURPOSE_SPECIAL),
    rbx: reg('rbx', 2, 64),
    rcx: reg('rcx', 1, 64, RTYPE.GENERAL_PURPOSE_SPECIAL),
    rdx: reg('rdx', 3, 64, RTYPE.GENERAL_PURPOSE_SPECIAL),
    rsp: reg('rsp', 4, 64, RTYPE.STACK_POINTER),
    rbp: reg('rbp', 5, 64, RTYPE.BASE_POINTER),
    rsi: reg('rsi', 6, 64),
    rdi: reg('rsi', 7, 64),
    r8 : reg('r8',  0, 64),
    r9 : reg('r9',  1, 64),
    r10: reg('r10', 2, 64),
    r11: reg('r11', 3, 64),
    r12: reg('r12', 4, 64),
    r13: reg('r13', 5, 64),
    r14: reg('r14', 6, 64),
    r15: reg('r15', 7, 64),
    
    eax: subreg('rax', 'eax', 0, 32, 32, RTYPE.GENERAL_PURPOSE_SPECIAL),
};





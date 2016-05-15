import {Register, SIZE} from './operand';


// Values on standard registers as used in Mod-R/M byte:
export const enum R64 {
    RAX = 0,
    RBX = 3,
    RCX = 1,
    RDX = 2,
    RSI = 6,
    RDI = 7,
    RBP = 5,
    RSP = 4,
}

// Values of extra 8 registers as used in Mod-R/M byte:
export const enum RE64 {
    R8 = 0,
    R9,
    R10,
    R11,
    R12,
    R13,
    R14,
    R15,
}

export const enum R32 {
    EAX = 0,
    EBX = 3,
    ECX = 1,
    EDX = 2,
    ESI = 6,
    EDI = 7,
    EBP = 5,
    ESP = 4,
}

export const enum RE32 {
    R8D = 0,
    R9D,
    R10D,
    R11D,
    R12D,
    R13D,
    R14D,
    R15D,
}

export const enum R8 {
    AL = 0,
    BL = 3,
    CL = 1,
    DL = 2,
    SIL = 6,
    DIL = 7,
    BPL = 5,
    SPL = 4,
}

export const enum RE8 {
    R8B = 0,
    R9B,
    R10B,
    R11B,
    R12B,
    R13B,
    R14B,
    R15B,
}


export var rax  = new Register('rax', R64.RAX, SIZE.QUAD, false);
export var rbx  = new Register('rbx', R64.RBX, SIZE.QUAD, false);
export var rcx  = new Register('rcx', R64.RCX, SIZE.QUAD, false);
export var rdx  = new Register('rdx', R64.RDX, SIZE.QUAD, false);
export var rsi  = new Register('rsi', R64.RSI, SIZE.QUAD, false);
export var rdi  = new Register('rdi', R64.RDI, SIZE.QUAD, false);
export var rbp  = new Register('rbp', R64.RBP, SIZE.QUAD, false);
export var rsp  = new Register('rsp', R64.RSP, SIZE.QUAD, false);

export var r8   = new Register('r8',  RE64.R8, SIZE.QUAD, true);
export var r9   = new Register('r9',  RE64.R9, SIZE.QUAD, true);
export var r10  = new Register('r10', RE64.R10, SIZE.QUAD, true);
export var r11  = new Register('r11', RE64.R11, SIZE.QUAD, true);
export var r12  = new Register('r12', RE64.R12, SIZE.QUAD, true);
export var r13  = new Register('r13', RE64.R13, SIZE.QUAD, true);
export var r14  = new Register('r14', RE64.R14, SIZE.QUAD, true);
export var r15  = new Register('r15', RE64.R15, SIZE.QUAD, true);


export var eax  = new Register('eax', R32.EAX, SIZE.DOUBLE, false);
export var ebx  = new Register('ebx', R32.EBX, SIZE.DOUBLE, false);
export var ecx  = new Register('ecx', R32.ECX, SIZE.DOUBLE, false);
export var edx  = new Register('edx', R32.EDX, SIZE.DOUBLE, false);
export var esi  = new Register('esi', R32.ESI, SIZE.DOUBLE, false);
export var edi  = new Register('edi', R32.EDI, SIZE.DOUBLE, false);
export var ebp  = new Register('ebp', R32.EBP, SIZE.DOUBLE, false);
export var esp  = new Register('esp', R32.ESP, SIZE.DOUBLE, false);

export var r8d  = new Register('r8d',  RE32.R8D, SIZE.DOUBLE, true);
export var r9d  = new Register('r9d',  RE32.R9D, SIZE.DOUBLE, true);
export var r10d = new Register('r10d', RE32.R10D, SIZE.DOUBLE, true);
export var r11d = new Register('r11d', RE32.R11D, SIZE.DOUBLE, true);
export var r12d = new Register('r12d', RE32.R12D, SIZE.DOUBLE, true);
export var r13d = new Register('r13d', RE32.R13D, SIZE.DOUBLE, true);
export var r14d = new Register('r14d', RE32.R14D, SIZE.DOUBLE, true);
export var r15d = new Register('r15d', RE32.R15D, SIZE.DOUBLE, true);


export var al   = new Register('al',  R8.AL, SIZE.BYTE, false);
export var bl   = new Register('bl',  R8.BL, SIZE.BYTE, false);
export var cl   = new Register('cl',  R8.CL, SIZE.BYTE, false);
export var dl   = new Register('dl',  R8.DL, SIZE.BYTE, false);
export var sil  = new Register('sil', R8.SIL, SIZE.BYTE, false);
export var dil  = new Register('dil', R8.DIL, SIZE.BYTE, false);
export var bpl  = new Register('bpl', R8.BPL, SIZE.BYTE, false);
export var spl  = new Register('spl', R8.SPL, SIZE.BYTE, false);

export var r8b  = new Register('r8b',  RE8.R8B, SIZE.BYTE, true);
export var r9b  = new Register('r9b',  RE8.R9B, SIZE.BYTE, true);
export var r10b = new Register('r10b', RE8.R10B, SIZE.BYTE, true);
export var r11b = new Register('r11b', RE8.R11B, SIZE.BYTE, true);
export var r12b = new Register('r12b', RE8.R12B, SIZE.BYTE, true);
export var r13b = new Register('r13b', RE8.R13B, SIZE.BYTE, true);
export var r14b = new Register('r14b', RE8.R14B, SIZE.BYTE, true);
export var r15b = new Register('r15b', RE8.R15B, SIZE.BYTE, true);


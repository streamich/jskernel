import * as o from './operand';


export var S        = o.SIZE;
export var M        = o.MODE;
export var r8       = [o.Register8];
export var r32      = [o.Register32];
export var r64      = [o.Register64];
export var m        = [o.Memory];
export var m8       = [o.Memory8];
export var m32      = [o.Memory32];
export var m64      = [o.Memory64];
export var rm8      = [o.Register8, o.Memory8];
export var rm32     = [o.Register32, o.Memory32];
export var rm64     = [o.Register64, o.Memory64];
export var imm      = [o.Immediate];
export var imm8     = [o.Immediate8];
export var imm16    = [o.Immediate16];
export var imm32    = [o.Immediate32];


export interface Definition {
    s?: number;             // Operand size.
    lock?: boolean;         // Whether LOCK prefix allowed.
    ops?: (any[])[];        // Operands this instruction accepts.
    mn?: string;            // Mnemonic
    o?: number;             // Opcode
    or?: number;            // Opreg - 3bit opcode part in modrm.reg field, -1 if none.
    r?: boolean;            // /r - 3bit register encoded in lowest opcode bits.
    dbit?: boolean;         // Whether it is allowed to change `d` bit in opcode.
    rex?: boolean;          // Whether REX prefix is mandatory for this instruction.
}

export type GroupDefinition = Definition[];
export type TableDefinition = {[s: string]: GroupDefinition};


// Global defaults
export var defaults: Definition
    = {s: S.DOUBLE, lock: false, ops: null, or: -1, r: false, dbit: false, rex: false};


// Instruction are divided in groups, each group consists of list
// of possible instructions. The first object is NOT an instruction
// but defaults for the group.
export var table: TableDefinition = {
    mov: [
        {mn: 'mov'},
        {o: 0x8B, mn: 'movq', ops: [r64, r64]},
        {o: 0xC7, ops: [r64, imm32]},
    ],
    inc: [
        {o: 0xFF, or: 0, lock: true},
        {o: 0xFE, ops: [rm8]},
        {ops: [rm32]},
        {ops: [rm64]},
    ]
};


// Op-code of instructions.
//
//     |76543210|
//     |......ds|
//     |.......s <--- Operation size: 1 = word, 0 = byte.
//     |......d <--- Operation direction: 1 = register is destination, 0 = register is source.
//     |765432 <--- Op-code
export const enum OP {
    MOV     = 0x89,
    MOVL    = 0xB8,
    MOVQ    = 0xC7,
    MOVABS  = 0xB8, // Lower 3 bits encode destination register.
    INC     = 0xff,
    DEC     = 0xff,
    PUSH    = 0x50,
    POP     = 0x58,
}

// Op-code extension into `REG` field of `Mod-R/M` byte.
export const enum OPREG {
    INC = 0,
    DEC = 1,
}

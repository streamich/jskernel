
// Op-code of instructions, op-code byte:
//
//     |76543210|
//     |......ds|
//     |.......s
//     |......d
//     |XXXXXX00 <--- Op-code = OP

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


// Op-code extension into `REG` field of Mod-R/M byte, Mod-R/M byte:
//
//     |76543210|
//      .....XXX <--- R/M field
//      ..XXX <------ REG field = OPREG
//      XX <--------- MOD field

export const enum OPREG {
    INC = 0,
    DEC = 1,
}

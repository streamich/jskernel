
export const enum EI {
    MAG0        = 0,
    MAG1,
    MAG2,
    MAG3,
    CLASS,
    DATA,
    VERSION,
    OSABI,
    ABIVERSION,
    PAD,
    NIDENT      = 16,
}

export const enum EI_CLASS {
    ELFCLASS32  = 1,
    ELFCLASS64  = 2,
}

export const enum EI_DATA {
    ELFDATA2LSB = 1,
    ELFDATA2MSB = 2,
}

export const enum EI_OSABI {
    ELFOSABI_SYSV = 0,
    ELFOSABI_HPUX = 1,
    ELFOSABI_STANDALONE = 255,
}

export const enum ET {
    NONE        = 0,
    REL         = 1,
    EXEC        = 2,
    DYN         = 3,
    CORE        = 4,
    LOOS        = 0xFE00,
    HIOS        = 0xFEFF,
    LOPROC      = 0xFF00,
    HIPROC      = 0xFFFF,
}

export const enum EM {
    NONE        = 0,
    M32         = 1,
    SPARC       = 2,
    x386        = 3,
    x68K        = 4,
    x88K        = 5,
    x860        = 7,
    MIPS        = 8,
}

export enum EV {    // ELF version :)
    NONE        = 0,
    CURRENT     = 1,
}

export const enum SHN {
    UNDEF       = 0,
    LOPROC      = 0xFF00,
    HIPROC      = 0xFF1F,
    LOOS        = 0xFF20,
    HIOS        = 0xFF3F,
    ABS         = 0xFFF1,
    COMMON      = 0xFFF2,
}

export const enum SHT {
    NULL        = 0,
    PROGBITS    = 1,
    SYMTAB      = 2,
    STRTAB      = 3,
    RELA        = 4,
    HASH        = 5,
    DYNAMIC     = 6,
    NOTE        = 7,
    NOBITS      = 8,
    REL         = 9,
    SHLIB       = 10,
    DYNSYM      = 11,
    LOOS        = 0x60000000,
    HIOS        = 0x6FFFFFFF,
    LOPROC      = 0x70000000,
    HIPROC      = 0x7FFFFFFF,
}

export const enum SHF {
    WRITE       = 0x1,
    ALLOC       = 0x2,
    EXECINSTR   = 0x4,
    MASKOS      = 0x0F000000,
    MASKPROC    = 0xF0000000,
}

export const enum STB {
    LOCAL       = 0,
    GLOBAL      = 1,
    WEAK        = 2,
    LOOS        = 10,
    HIOS        = 12,
    LOPROC      = 13,
    HIPROC      = 15,
}

export const enum STT {
    NOTYPE      = 0,
    OBJECT      = 1,
    FUNC        = 2,
    SECTION     = 3,
    FILE        = 4,
    LOOS        = 10,
    HIOS        = 12,
    LOPROC      = 13,
    HIPROC      = 15,
}

export const enum R {
    R_386_NONE = 0,
    R_386_32,
    R_386_PC32,
    R_386_GOT32,
    R_386_PLT32,
    R_386_COPY,
    R_386_GLOB_DAT,
    R_386_JMP_SLOT,
    R_386_RELATIVE,
    R_386_GOTOFF,
    R_386_GOTPC,
}

export const enum PT {
    NULL        = 0,
    LOAD        = 1,
    DYNAMIC     = 2,
    INTERP      = 3,
    NOTE        = 4,
    SHLIB       = 5,
    PHDR        = 6,
    LOOS        = 0x60000000,
    HIOS        = 0x6FFFFFFF,
    LOPROC      = 0x70000000,
    HIPROC      = 0x7FFFFFFF,
}

export const enum PF {
    X           = 0x1,
    W           = 0x2,
    R           = 0x4,
    MASKOS      = 0x00FF0000,
    MASKPROC    = 0xFF000000,
}

export const enum DT {
    NULL = 0,
    NEEDED,
    PLTRELSZ,
    PLTGOT,
    HASH,
    STRTAB,
    SYMTAB,
    RELA,
    RELASZ,
    RELAENT,
    STRSZ,
    SYMENT,
    INIT,
    FINI,
    SONAME,
    RPATH,
    SYMBOLIC,
    REL,
    RELSZ,
    RELENT,
    PLTREL,
    DEBUG,
    TEXTREL,
    JMPREL,
    BIND_NOW,
    INIT_ARRAY,
    FINI_ARRAY,
    INIT_ARRAYSZ,
    FINI_ARRAYSZ,
    LOOS = 0x60000000,
    HIOS = 0x6FFFFFFF,
    LOPROC = 0x70000000,
    HIPROC = 0x7FFFFFFF,
}

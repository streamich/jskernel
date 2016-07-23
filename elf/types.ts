
export type number64 = [number, number];


export interface IEhdr {
    ident: number[],
    type: number,
    machine: number;
    version: number;
    entry: number64|number,
    phoff: number64|number,
    shoff: number64|number,
    flags: number,
    ehsize: number,
    phentsize: number,
    phnum: number,
    shentsize: number,
    shnum: number,
    shstrndx: number,
}

export interface IShdr {
    name: number,
    type: number,
    flags: number,
    addr: number64|number,
    offset: number64|number,
    size: number,
    link: number,
    info: number,
    addralign: number,
    entsize: number,
}

export interface IPhdr {
    type: number,
    flags: number,
    offset: number64|number,
    vaddr: number64|number,
    paddr: number64|number,
    size: number64|number,
    memsz: number64|number,
    align: number64|number,
}


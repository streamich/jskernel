import * as t from './typebase';
import {DT, EI, EV, EI_CLASS, EI_DATA, EI_OSABI, ET, SHN, SHT, SHF, STT, PT, PF, STB, EM} from './const';
import {number64, IEhdr, IPhdr, IShdr} from './types';
import * as t32l from './types32le';
import * as t32b from './types32be';
import * as t64l from './types64le';
import * as t64b from './types64be';
import * as util from './util';


function toNumber(num: number|number64): number {
    if(typeof num === 'number') return num;
    else return util.UInt64.joinToNumber(num[1], num[0]);
}


export class File {

    static createExecutable(bits = 64, littleEndian = true) {
        var file = new File;
        var hdata = file.fh.data;

        function setLE(tl, tb) {
            if(littleEndian) {
                file.isLE = true;
                file.fh.data.ident[EI.DATA] = EI_DATA.ELFDATA2LSB;
                file.t = tl;
            } else {
                file.isLE = false;
                file.fh.data.ident[EI.DATA] = EI_DATA.ELFDATA2MSB;
                file.t = tb;
            }
        }


        if(bits === 64) {
            file.is64 = true;
            hdata.ident[EI.CLASS] = EI_CLASS.ELFCLASS64;
            setLE(t64l, t64b);
        } else { // 32 bits
            file.is64 = false;
            hdata.ident[EI.CLASS] = EI_CLASS.ELFCLASS32;
            setLE(t32l, t32b);
        }

        hdata.type = ET.EXEC; // executable
        hdata.machine = 62; // TODO: machine
        hdata.entry = 4195456;

        return file;
    }

    is64 = true;    // 64-bit file
    isLE = true;    // Little-endian
    t = t64l;       // t64l, t64b, t32l, or t32b

    ptr: t.Pointer;

    fh: FileHeader = new FileHeader(this);
    sh: SectionHeader[] = [];
    ph: ProgramHeader[] = [];

    createProgramHeader(): ProgramHeader {
        var index = this.ph.length;
        var ph = new ProgramHeader(this);
        ph.index = index;
        this.ph[index] = ph;
        return ph;
    }

    addProgramHeader(buffer?: Buffer): ProgramHeader {
        var ph = this.createProgramHeader();
        if (buffer) ph.buf = buffer;

        this.fh.data.phnum++;
        if((this.ph.length === 1) && !this.fh.data.phoff) {
            this.fh.data.phoff = this.fh.type.size;
            this.fh.data.phentsize = ph.type.size;
        }

        return ph;
    }

    calculateSize() {
        var size = this.fh.type.size;
        for(var sh of this.sh) size += sh.type.size + sh.buf.length;
        for(var ph of this.ph) size += ph.type.size + ph.buf.length;
        return size;
    }

    // Calcualte section header and program header offsets once all data sizes are known.
    calculateOffsets() {
        var offset = this.fh.type.size;
        if(this.ph.length) {
            offset += this.ph.length * this.ph[0].type.size;
            for(var ph of this.ph) {
                ph.data.offset = offset;
                ph.data.size = ph.buf.length;
                offset += ph.buf.length;
            }
        }
    }

    hasSectionHeaderTable() {
        var offset = toNumber(this.fh.data.shoff);
        return !!offset;
    }

    hasProgramHeaderTable() {
        var offset = toNumber(this.fh.data.phoff);
        return !!offset;
    }

    getStringSection() {
        return this.sh[this.fh.data.shstrndx];
    }

    write(ptr: t.Pointer) {
        this.fh.setPtr(ptr).pack();

    }

    parse(buf: Buffer, offset = 0) {
        this.ptr = new t.Pointer(buf, offset);
        this.fh.parse(this.ptr);
        this.parseSectionHeaders();
        this.parseProgramHeaders();
    }

    parseSectionHeaders() {
        var offset = toNumber(this.fh.data.shoff);
        if(!offset) return;

        var size = this.fh.data.shentsize;
        for(var i = 0; i < this.fh.data.shnum; i++) {
            this.sh[i] = new SectionHeader(this);
            this.sh[i].parse(this.ptr.offset(offset + (size * i)));
        }
    }

    parseProgramHeaders() {
        var offset = toNumber(this.fh.data.phoff);
        if(!offset) return;

        var size = this.fh.data.phentsize;
        for(var i = 0; i < this.fh.data.phnum; i++) {
            this.createProgramHeader().parse(this.ptr.offset(offset + (size * i)));
        }
    }

    toJson() {
        var arch = this.is64 ? 64 : 32;
        var json = {
            elf: `${arch}-bit ELF file`,
            fileHeader: this.fh.toJson(),
            sectionHeaders: [],
            programHeaders: [],
        };
        for(var sh of this.sh) json.sectionHeaders.push(sh.toJson());
        for(var ph of this.ph) json.programHeaders.push(ph.toJson());
        return json;
    }
}

export abstract class Header {
    file: File;
    type: t.Struct;
    v: t.Variable;
    data: any;

    constructor(file: File) {
        this.file = file;
    }

    parse(ptr: t.Pointer) {
        this.v = new t.Variable(this.type, ptr);
        this.unpack();
    }

    setPtr(ptr: t.Pointer): this {
        if(!this.v) this.v = new t.Variable(this.type, ptr);
        else this.v.pointer = ptr;
        return this;
    }

    unpack() {
        this.data = this.v.unpack();
    }

    pack() {
        this.v.pack(this.data);
    }
}

export class FileHeader extends Header {

    data: IEhdr;

    constructor(file: File) {
        super(file);
        this.type = this.file.t.Ehdr;
        this.data = {
            ident: [
                0x7F,   0x45,   0x4C,       0x46, // ELF
                0,      0,      EV.CURRENT, 0,
                0,      0,      0,          0,
                0,      0,      0,          0,  ],
            type:       0,
            machine:    0,
            'version':  EV.CURRENT,
            entry:      0,
            phoff:      0,
            shoff:      0,
            flags:      0,
            ehsize:     this.type.size,
            phentsize:  0,
            phnum:      0,
            shentsize:  0,
            shnum:      0,
            shstrndx:   0,
        };
    }

    write(ptr: t.Pointer) {
        this.v.pack(ptr);
    }

    parse(ptr: t.Pointer) {

        if( (ptr.buf[ptr.off + 0] !== 0x7F) ||
            (ptr.buf[ptr.off + 1] !== 0x45) ||
            (ptr.buf[ptr.off + 2] !== 0x4C) ||
            (ptr.buf[ptr.off + 3] !== 0x46))
            throw Error('Invalid magic bytes 0x7F, E, L, F.');

        var parseEndiannes = (function (tl, tb) {
            var endiannes = new t.Variable(t64l.char, ptr.offset(EI.DATA)).unpack();
            if(endiannes === EI_DATA.ELFDATA2LSB) {
                this.file.isLE = true;
                this.file.t = tl;
            } else if(endiannes === EI_DATA.ELFDATA2MSB) {
                this.file.isLE = false;
                this.file.t = tb;
            } else
                throw Error('Invalid indent[DATA] field.');
        }).bind(this);

        var arch = new t.Variable(t64l.char, ptr.offset(EI.CLASS)).unpack();
        switch(arch) {
            case EI_CLASS.ELFCLASS64:
                this.file.is64 = true;
                parseEndiannes(t64l, t64b);
                break;
            case EI_CLASS.ELFCLASS32:
                this.file.is64 = false;
                parseEndiannes(t32l, t32b);
                break;
            default:
                throw Error(`Invalid EI_CLASS value ${arch}.`);
        }

        this.type = this.file.t.Ehdr;
        super.parse(ptr);
    }
    
    validateMagicBytes() {
        var ident = this.data.ident;
        if(ident[EI.MAG0] != 0x7F) return false;
        if(ident[EI.MAG1] != 0x45) return false; // E
        if(ident[EI.MAG2] != 0x4C) return false; // L
        if(ident[EI.MAG3] != 0x46) return false; // F
        return true;
    }

    toJson() {
        var ident: any = {};
        var json: any = {ident: ident};

        switch(this.data.ident[EI.CLASS]) {
            case EI_CLASS.ELFCLASS32: ident['class'] = '32-bit objects'; break;
            case EI_CLASS.ELFCLASS64: ident['class'] = '64-bit objects'; break;
        }
        switch(this.data.ident[EI.DATA]) {
            case EI_DATA.ELFDATA2LSB: ident['data'] = 'little-endian'; break;
            case EI_DATA.ELFDATA2MSB: ident['data'] = 'big-endian'; break;
        }
        switch(this.data.ident[EI.OSABI]) {
            case EI_OSABI.ELFOSABI_SYSV: ident['osabi'] = 'System V ABI'; break;
            case EI_OSABI.ELFOSABI_HPUX: ident['osabi'] = 'HP-UX operating system'; break;
            case EI_OSABI.ELFOSABI_STANDALONE: ident['osabi'] = 'Standalone (embedded) application'; break;
            default: ident['osabi'] = this.data.ident[EI.OSABI];
        }

        switch(this.data.type) {
            case ET.NONE: json.type = 'No file type'; break;
            case ET.REL: json.type = 'Relocatable object file'; break;
            case ET.EXEC: json.type = 'Executable file'; break;
            case ET.DYN: json.type = 'Shared object file'; break;
            case ET.CORE: json.type = 'Core file'; break;
            default: json.type = '0x' + this.data.type.toString(16); break;
        }

        json.raw = this.data;
        return json;
    }
}

export abstract class DataHeader extends Header {

    index: number = -1;
    buf: Buffer = null;

    dataPointer(): t.Pointer {
        var offset = toNumber(this.data.offset);

        return this.file.ptr.offset(offset);
    }

    dataBuffer(): Buffer {
        var ptr = this.dataPointer();
        var size = toNumber(this.data.size);
        return ptr.buf.slice(ptr.off, ptr.off + size);
    }

    toJson() {
        return this.data;
    }
}

export class SectionHeader extends DataHeader {
    type = t64l.Shdr;
    data: IShdr;

    constructor(file: File) {
        super(file);
        this.type = this.file.t.Shdr;
    }

    getName() {
        var sh_str = this.file.getStringSection();
        if(!sh_str) return '';

        var ptr = sh_str.dataPointer().offset(this.data.name);
        var end = ptr.off;
        var val = ptr.buf[end];
        while(val) { // `\0` null-terminated string
            end++;
            val = ptr.buf[end];
        }
        return ptr.buf.slice(ptr.off, end).toString();
    }

    toJson() {
        var json: any = {name: this.getName()};

        switch(this.data.type) {
            case SHT.NULL:
                json.type = 'NULL';
                json.typeInfo = 'Marks an unused section header';
                break;
            case SHT.PROGBITS:
                json.type = 'PROGBITS';
                json.typeInfo = 'Contains information defined by the program';
                break;
            case SHT.SYMTAB:
                json.type = 'SYMTAB';
                json.typeInfo = 'Contains a linker symbol table';
                break;
            case SHT.STRTAB:
                json.type = 'STRTAB';
                json.typeInfo = 'Contains a string table';
                break;
            case SHT.RELA:
                json.type = 'RELA';
                json.typeInfo = 'Contains "Rela" type relocation entries';
                break;
            case SHT.HASH:
                json.type = 'HASH';
                json.typeInfo = 'Contains a symbol hash table';
                break;
            case SHT.DYNAMIC:
                json.type = 'DYNAMIC';
                json.typeInfo = 'Contains dynamic linking tables';
                break;
            case SHT.NOTE:
                json.type = 'NOTE';
                json.typeInfo = 'Contains note information';
                break;
            case SHT.NOBITS:
                json.type = 'NOBITS';
                json.typeInfo = 'Contains uninitialized space';
                break;
            case SHT.REL:
                json.type = 'REl';
                json.typeInfo = 'Contains "Rel" type relocation entries';
                break;
            case SHT.SHLIB:
                json.type = 'SHLIB';
                json.typeInfo = 'Reserved';
                break;
            case SHT.DYNSYM:
                json.type = 'DYNSYM';
                json.typeInfo = 'Contains a dynamic loader symbol table';
                break;
            default:
                json.type = 'other';
                json.typeInfo = '';
                break;
        }

        json.raw = super.toJson();
        return json;
    }
}

export class ProgramHeader extends DataHeader {
    type = t64l.Phdr;
    data: IPhdr;

    constructor(file: File) {
        super(file);
        this.type = this.file.t.Phdr;
        this.data = {
            type: 0,
            flags: 0,
            offset: 0,
            vaddr: 0,
            paddr: 0,
            size: 0,
            memsz: 0,
            align: 0,
        }
    }
}

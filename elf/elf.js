"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var t = require('./typebase');
var const_1 = require('./const');
var t32l = require('./types32le');
var t32b = require('./types32be');
var t64l = require('./types64le');
var t64b = require('./types64be');
var util = require('./util');
function toNumber(num) {
    if (typeof num === 'number')
        return num;
    else
        return util.UInt64.joinToNumber(num[1], num[0]);
}
var File = (function () {
    function File() {
        this.is64 = true;
        this.isLE = true;
        this.t = t64l;
        this.fh = new FileHeader(this);
        this.sh = [];
        this.ph = [];
    }
    File.createExecutable = function (bits, littleEndian) {
        if (bits === void 0) { bits = 64; }
        if (littleEndian === void 0) { littleEndian = true; }
        var file = new File;
        var hdata = file.fh.data;
        function setLE(tl, tb) {
            if (littleEndian) {
                file.isLE = true;
                file.fh.data.ident[5] = 1;
                file.t = tl;
            }
            else {
                file.isLE = false;
                file.fh.data.ident[5] = 2;
                file.t = tb;
            }
        }
        if (bits === 64) {
            file.is64 = true;
            hdata.ident[4] = 2;
            setLE(t64l, t64b);
        }
        else {
            file.is64 = false;
            hdata.ident[4] = 1;
            setLE(t32l, t32b);
        }
        hdata.type = 2;
        hdata.machine = 62;
        hdata.entry = 4195456;
        return file;
    };
    File.prototype.createProgramHeader = function () {
        var index = this.ph.length;
        var ph = new ProgramHeader(this);
        ph.index = index;
        this.ph[index] = ph;
        return ph;
    };
    File.prototype.addProgramHeader = function (buffer) {
        var ph = this.createProgramHeader();
        if (buffer)
            ph.buf = buffer;
        this.fh.data.phnum++;
        if ((this.ph.length === 1) && !this.fh.data.phoff) {
            this.fh.data.phoff = this.fh.type.size;
            this.fh.data.phentsize = ph.type.size;
        }
        return ph;
    };
    File.prototype.calculateSize = function () {
        var size = this.fh.type.size;
        for (var _i = 0, _a = this.sh; _i < _a.length; _i++) {
            var sh = _a[_i];
            size += sh.type.size + sh.buf.length;
        }
        for (var _b = 0, _c = this.ph; _b < _c.length; _b++) {
            var ph = _c[_b];
            size += ph.type.size + ph.buf.length;
        }
        return size;
    };
    File.prototype.calculateOffsets = function () {
        var offset = this.fh.type.size;
        if (this.ph.length) {
            offset += this.ph.length * this.ph[0].type.size;
            for (var _i = 0, _a = this.ph; _i < _a.length; _i++) {
                var ph = _a[_i];
                ph.data.offset = offset;
                ph.data.size = ph.buf.length;
                offset += ph.buf.length;
            }
        }
    };
    File.prototype.hasSectionHeaderTable = function () {
        var offset = toNumber(this.fh.data.shoff);
        return !!offset;
    };
    File.prototype.hasProgramHeaderTable = function () {
        var offset = toNumber(this.fh.data.phoff);
        return !!offset;
    };
    File.prototype.getStringSection = function () {
        return this.sh[this.fh.data.shstrndx];
    };
    File.prototype.write = function (ptr) {
        this.fh.setPtr(ptr).pack();
    };
    File.prototype.parse = function (buf, offset) {
        if (offset === void 0) { offset = 0; }
        this.ptr = new t.Pointer(buf, offset);
        this.fh.parse(this.ptr);
        this.parseSectionHeaders();
        this.parseProgramHeaders();
    };
    File.prototype.parseSectionHeaders = function () {
        var offset = toNumber(this.fh.data.shoff);
        if (!offset)
            return;
        var size = this.fh.data.shentsize;
        for (var i = 0; i < this.fh.data.shnum; i++) {
            this.sh[i] = new SectionHeader(this);
            this.sh[i].parse(this.ptr.offset(offset + (size * i)));
        }
    };
    File.prototype.parseProgramHeaders = function () {
        var offset = toNumber(this.fh.data.phoff);
        if (!offset)
            return;
        var size = this.fh.data.phentsize;
        for (var i = 0; i < this.fh.data.phnum; i++) {
            this.createProgramHeader().parse(this.ptr.offset(offset + (size * i)));
        }
    };
    File.prototype.toJson = function () {
        var arch = this.is64 ? 64 : 32;
        var json = {
            elf: arch + "-bit ELF file",
            fileHeader: this.fh.toJson(),
            sectionHeaders: [],
            programHeaders: [],
        };
        for (var _i = 0, _a = this.sh; _i < _a.length; _i++) {
            var sh = _a[_i];
            json.sectionHeaders.push(sh.toJson());
        }
        for (var _b = 0, _c = this.ph; _b < _c.length; _b++) {
            var ph = _c[_b];
            json.programHeaders.push(ph.toJson());
        }
        return json;
    };
    return File;
}());
exports.File = File;
var Header = (function () {
    function Header(file) {
        this.file = file;
    }
    Header.prototype.parse = function (ptr) {
        this.v = new t.Variable(this.type, ptr);
        this.unpack();
    };
    Header.prototype.setPtr = function (ptr) {
        if (!this.v)
            this.v = new t.Variable(this.type, ptr);
        else
            this.v.pointer = ptr;
        return this;
    };
    Header.prototype.unpack = function () {
        this.data = this.v.unpack();
    };
    Header.prototype.pack = function () {
        this.v.pack(this.data);
    };
    return Header;
}());
exports.Header = Header;
var FileHeader = (function (_super) {
    __extends(FileHeader, _super);
    function FileHeader(file) {
        _super.call(this, file);
        this.type = this.file.t.Ehdr;
        this.data = {
            ident: [
                0x7F, 0x45, 0x4C, 0x46,
                0, 0, const_1.EV.CURRENT, 0,
                0, 0, 0, 0,
                0, 0, 0, 0,],
            type: 0,
            machine: 0,
            'version': const_1.EV.CURRENT,
            entry: 0,
            phoff: 0,
            shoff: 0,
            flags: 0,
            ehsize: this.type.size,
            phentsize: 0,
            phnum: 0,
            shentsize: 0,
            shnum: 0,
            shstrndx: 0,
        };
    }
    FileHeader.prototype.write = function (ptr) {
        this.v.pack(ptr);
    };
    FileHeader.prototype.parse = function (ptr) {
        if ((ptr.buf[ptr.off + 0] !== 0x7F) ||
            (ptr.buf[ptr.off + 1] !== 0x45) ||
            (ptr.buf[ptr.off + 2] !== 0x4C) ||
            (ptr.buf[ptr.off + 3] !== 0x46))
            throw Error('Invalid magic bytes 0x7F, E, L, F.');
        var parseEndiannes = (function (tl, tb) {
            var endiannes = new t.Variable(t64l.char, ptr.offset(5)).unpack();
            if (endiannes === 1) {
                this.file.isLE = true;
                this.file.t = tl;
            }
            else if (endiannes === 2) {
                this.file.isLE = false;
                this.file.t = tb;
            }
            else
                throw Error('Invalid indent[DATA] field.');
        }).bind(this);
        var arch = new t.Variable(t64l.char, ptr.offset(4)).unpack();
        switch (arch) {
            case 2:
                this.file.is64 = true;
                parseEndiannes(t64l, t64b);
                break;
            case 1:
                this.file.is64 = false;
                parseEndiannes(t32l, t32b);
                break;
            default:
                throw Error("Invalid EI_CLASS value " + arch + ".");
        }
        this.type = this.file.t.Ehdr;
        _super.prototype.parse.call(this, ptr);
    };
    FileHeader.prototype.validateMagicBytes = function () {
        var ident = this.data.ident;
        if (ident[0] != 0x7F)
            return false;
        if (ident[1] != 0x45)
            return false;
        if (ident[2] != 0x4C)
            return false;
        if (ident[3] != 0x46)
            return false;
        return true;
    };
    FileHeader.prototype.toJson = function () {
        var ident = {};
        var json = { ident: ident };
        switch (this.data.ident[4]) {
            case 1:
                ident['class'] = '32-bit objects';
                break;
            case 2:
                ident['class'] = '64-bit objects';
                break;
        }
        switch (this.data.ident[5]) {
            case 1:
                ident['data'] = 'little-endian';
                break;
            case 2:
                ident['data'] = 'big-endian';
                break;
        }
        switch (this.data.ident[7]) {
            case 0:
                ident['osabi'] = 'System V ABI';
                break;
            case 1:
                ident['osabi'] = 'HP-UX operating system';
                break;
            case 255:
                ident['osabi'] = 'Standalone (embedded) application';
                break;
            default: ident['osabi'] = this.data.ident[7];
        }
        switch (this.data.type) {
            case 0:
                json.type = 'No file type';
                break;
            case 1:
                json.type = 'Relocatable object file';
                break;
            case 2:
                json.type = 'Executable file';
                break;
            case 3:
                json.type = 'Shared object file';
                break;
            case 4:
                json.type = 'Core file';
                break;
            default:
                json.type = '0x' + this.data.type.toString(16);
                break;
        }
        json.raw = this.data;
        return json;
    };
    return FileHeader;
}(Header));
exports.FileHeader = FileHeader;
var DataHeader = (function (_super) {
    __extends(DataHeader, _super);
    function DataHeader() {
        _super.apply(this, arguments);
        this.index = -1;
        this.buf = null;
    }
    DataHeader.prototype.dataPointer = function () {
        var offset = toNumber(this.data.offset);
        return this.file.ptr.offset(offset);
    };
    DataHeader.prototype.dataBuffer = function () {
        var ptr = this.dataPointer();
        var size = toNumber(this.data.size);
        return ptr.buf.slice(ptr.off, ptr.off + size);
    };
    DataHeader.prototype.toJson = function () {
        return this.data;
    };
    return DataHeader;
}(Header));
exports.DataHeader = DataHeader;
var SectionHeader = (function (_super) {
    __extends(SectionHeader, _super);
    function SectionHeader(file) {
        _super.call(this, file);
        this.type = t64l.Shdr;
        this.type = this.file.t.Shdr;
    }
    SectionHeader.prototype.getName = function () {
        var sh_str = this.file.getStringSection();
        if (!sh_str)
            return '';
        var ptr = sh_str.dataPointer().offset(this.data.name);
        var end = ptr.off;
        var val = ptr.buf[end];
        while (val) {
            end++;
            val = ptr.buf[end];
        }
        return ptr.buf.slice(ptr.off, end).toString();
    };
    SectionHeader.prototype.toJson = function () {
        var json = { name: this.getName() };
        switch (this.data.type) {
            case 0:
                json.type = 'NULL';
                json.typeInfo = 'Marks an unused section header';
                break;
            case 1:
                json.type = 'PROGBITS';
                json.typeInfo = 'Contains information defined by the program';
                break;
            case 2:
                json.type = 'SYMTAB';
                json.typeInfo = 'Contains a linker symbol table';
                break;
            case 3:
                json.type = 'STRTAB';
                json.typeInfo = 'Contains a string table';
                break;
            case 4:
                json.type = 'RELA';
                json.typeInfo = 'Contains "Rela" type relocation entries';
                break;
            case 5:
                json.type = 'HASH';
                json.typeInfo = 'Contains a symbol hash table';
                break;
            case 6:
                json.type = 'DYNAMIC';
                json.typeInfo = 'Contains dynamic linking tables';
                break;
            case 7:
                json.type = 'NOTE';
                json.typeInfo = 'Contains note information';
                break;
            case 8:
                json.type = 'NOBITS';
                json.typeInfo = 'Contains uninitialized space';
                break;
            case 9:
                json.type = 'REl';
                json.typeInfo = 'Contains "Rel" type relocation entries';
                break;
            case 10:
                json.type = 'SHLIB';
                json.typeInfo = 'Reserved';
                break;
            case 11:
                json.type = 'DYNSYM';
                json.typeInfo = 'Contains a dynamic loader symbol table';
                break;
            default:
                json.type = 'other';
                json.typeInfo = '';
                break;
        }
        json.raw = _super.prototype.toJson.call(this);
        return json;
    };
    return SectionHeader;
}(DataHeader));
exports.SectionHeader = SectionHeader;
var ProgramHeader = (function (_super) {
    __extends(ProgramHeader, _super);
    function ProgramHeader(file) {
        _super.call(this, file);
        this.type = t64l.Phdr;
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
        };
    }
    return ProgramHeader;
}(DataHeader));
exports.ProgramHeader = ProgramHeader;

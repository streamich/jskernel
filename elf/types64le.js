"use strict";
var t = require('./typebase');
exports.Addr = t.ui64;
exports.Off = t.ui64;
exports.Half = t.ui16;
exports.Word = t.ui32;
exports.Sword = t.i32;
exports.Xword = t.ui64;
exports.Sxword = t.i64;
exports.char = t.ui8;
exports.Ehdr = t.Struct.define([
    [t.List.define(exports.char, 16), 'ident'],
    [exports.Half, 'type'],
    [exports.Half, 'machine'],
    [exports.Word, 'version'],
    [exports.Addr, 'entry'],
    [exports.Off, 'phoff'],
    [exports.Off, 'shoff'],
    [exports.Word, 'flags'],
    [exports.Half, 'ehsize'],
    [exports.Half, 'phentsize'],
    [exports.Half, 'phnum'],
    [exports.Half, 'shentsize'],
    [exports.Half, 'shnum'],
    [exports.Half, 'shstrndx'],
], 'Ehdr');
exports.Shdr = t.Struct.define([
    [exports.Word, 'name'],
    [exports.Word, 'type'],
    [exports.Xword, 'flags'],
    [exports.Addr, 'addr'],
    [exports.Off, 'offset'],
    [exports.Xword, 'size'],
    [exports.Word, 'link'],
    [exports.Word, 'info'],
    [exports.Xword, 'addralign'],
    [exports.Xword, 'entsize'],
], 'Shdr');
exports.Sym = t.Struct.define([
    [exports.Word, 'name'],
    [exports.char, 'info'],
    [exports.char, 'other'],
    [exports.Half, 'shndx'],
    [exports.Addr, 'value'],
    [exports.Xword, 'size'],
], 'Sym');
exports.Rel = t.Struct.define([
    [exports.Addr, 'offset'],
    [exports.Xword, 'info'],
], 'Rel');
exports.Rela = t.Struct.define([
    [exports.Addr, 'offset'],
    [exports.Xword, 'info'],
    [exports.Sxword, 'addend'],
], 'Rela');
exports.Phdr = t.Struct.define([
    [exports.Word, 'type'],
    [exports.Word, 'flags'],
    [exports.Off, 'offset'],
    [exports.Addr, 'vaddr'],
    [exports.Addr, 'paddr'],
    [exports.Xword, 'size'],
    [exports.Xword, 'memsz'],
    [exports.Xword, 'align'],
], 'Phdr');
exports.Dyn = t.Struct.define([
    [exports.Sxword, 'tag'],
    [exports.Addr, 'ptr'],
], 'Dyn');

import * as t from './typebase';


export var Addr   = t.bui64;
export var Off    = t.bui64;
export var Half   = t.bui16;
export var Word   = t.bui32;
export var Sword  = t.bi32;
export var Xword  = t.bui64;
export var Sxword = t.bi64;
export var char   = t.ui8;


export var Ehdr = t.Struct.define([
    [t.List.define(char, 16), 'ident'],
    [Half,      'type'],
    [Half,      'machine'],
    [Word,      'version'],
    [Addr,      'entry'],
    [Off,       'phoff'],
    [Off,       'shoff'],
    [Word,      'flags'],
    [Half,      'ehsize'],
    [Half,      'phentsize'],
    [Half,      'phnum'],
    [Half,      'shentsize'],
    [Half,      'shnum'],
    [Half,      'shstrndx'],
], 'Ehdr');

export var Shdr = t.Struct.define([
    [Word,      'name'],
    [Word,      'type'],
    [Xword,     'flags'],
    [Addr,      'addr'],
    [Off,       'offset'],
    [Xword,     'size'],
    [Word,      'link'],
    [Word,      'info'],
    [Xword,     'addralign'],
    [Xword,     'entsize'],
], 'Shdr');

export var Sym = t.Struct.define([
    [Word,      'name'],
    [char,      'info'],
    [char,      'other'],
    [Half,      'shndx'],
    [Addr,      'value'],
    [Xword,     'size'],
], 'Sym');

export var Rel = t.Struct.define([
    [Addr,      'offset'],
    [Xword,     'info'],
], 'Rel');

export var Rela = t.Struct.define([
    [Addr,      'offset'],
    [Xword,     'info'],
    [Sxword,    'addend'],
], 'Rela');

export var Phdr = t.Struct.define([
    [Word,      'type'],
    [Word,      'flags'],
    [Off,       'offset'],
    [Addr,      'vaddr'],
    [Addr,      'paddr'],

    // Should be `filesz`, we rename it to `size` to be consistent with `Shdr`,
    // used in inheritance later.
    [Xword,     'size'],

    [Xword,     'memsz'],
    [Xword,     'align'],
], 'Phdr');

export var Dyn = t.Struct.define([
    [Sxword,    'tag'],
    [Addr,      'ptr'],
], 'Dyn');

import * as t from './typebase';


export var Addr   = t.bui32;
export var Off    = t.bui32;
export var Half   = t.bui16;
export var Word   = t.bui32;
export var Sword  = t.bi32;
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
    [Word,      'flags'],
    [Addr,      'addr'],
    [Off,       'offset'],
    [Word,      'size'],
    [Word,      'link'],
    [Word,      'info'],
    [Word,      'addralign'],
    [Word,      'entsize'],
], 'Shdr');

export var Sym = t.Struct.define([
    [Word,      'name'],
    [Addr,      'value'],
    [Word,      'size'],
    [char,      'info'],
    [char,      'other'],
    [Half,      'shndx'],
], 'Sym');

export var Rel = t.Struct.define([
    [Addr,      'offset'],
    [Word,      'info'],
], 'Rel');

export var Rela = t.Struct.define([
    [Addr,      'offset'],
    [Word,      'info'],
    [Sword,     'addend'],
], 'Rela');

export var Phdr = t.Struct.define([
    [Word,      'type'],
    [Off,       'offset'],
    [Addr,      'vaddr'],
    [Addr,      'paddr'],

    // Should be `filesz`, we rename it to `size` to be consistent with `Shdr`,
    // used in inheritance later.
    [Word,      'size'],

    [Word,      'memsz'],
    [Word,      'flags'],
    [Word,      'align'],
], 'Phdr');

export var Dyn = t.Struct.define([
    [Sword,     'tag'],
    [Addr,      'ptr'],
], 'Dyn');

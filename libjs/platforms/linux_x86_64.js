"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require('./linux_x86_64/types')); // Definition of all C types, that we need to build and parse to comm using syscalls.
// import * as _types from './linux_x86_64/types';       // Definition of all C types, that we need to build and parse to comm using syscalls.
var syscalls_1 = require('./linux_x86_64/syscalls'); // System call table.
exports.arch = 64; // 64-bit
exports.isLE = true; // Is little-endian?
exports.SYS = syscalls_1.SYS;
// export var types = _types;

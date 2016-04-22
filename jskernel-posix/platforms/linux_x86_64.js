"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
exports.arch = 64; // 64-bit
exports.isLE = true; // Is little-endian?
__export(require('./linux_x86_64/types')); // Definition of all C types, that we need to build and parse to comm using syscalls.
__export(require('./linux_x86_64/syscalls')); // System call table.

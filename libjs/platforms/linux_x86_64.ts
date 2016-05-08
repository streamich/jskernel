
export var arch = 64;                       // 64-bit
export var isLE = true;                     // Is little-endian?
export * from './linux_x86_64/types';       // Definition of all C types, that we need to build and parse to comm using syscalls.
export * from './linux_x86_64/syscalls';    // System call table.

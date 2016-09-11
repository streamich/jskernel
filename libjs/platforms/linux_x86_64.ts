export * from './linux_x86_64/types';       // Definition of all C types, that we need to build and parse to comm using syscalls.
// import * as _types from './linux_x86_64/types';       // Definition of all C types, that we need to build and parse to comm using syscalls.
import {SYS as _SYS} from './linux_x86_64/syscalls';    // System call table.


export var arch = 64;                       // 64-bit
export var isLE = true;                     // Is little-endian?
export var SYS = _SYS;
// export var types = _types;

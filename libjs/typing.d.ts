/// <reference path="../typings/typing.d.ts" />


declare module 'libsys' {
    export type TSysArg = number|string|ArrayBuffer|Uint8Array|Buffer;
    export function syscall     (command: number, arg1?: TSysArg, arg2?: TSysArg, arg3?: TSysArg, arg4?: TSysArg, arg5?: TSysArg, arg6?: TSysArg): number;
    export function syscall64   (command: number, arg1?: TSysArg, arg2?: TSysArg, arg3?: TSysArg, arg4?: TSysArg, arg5?: TSysArg, arg6?: TSysArg): [number, number];
    export function malloc64(lo: number, hi: number, size: number): Buffer;
    export function addr(buf: Buffer): number;
    export function addr64(buf: Buffer): [number, number];
    export function errno(): number;
}

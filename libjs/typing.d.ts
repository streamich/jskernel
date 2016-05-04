/// <reference path="../typings/typing.d.ts" />


declare module 'libsys' {
    export type TSysArg = number|string|Buffer;
    export function syscall     (command: number, arg1?: TSysArg, arg2?: TSysArg, arg3?: TSysArg, arg4?: TSysArg, arg5?: TSysArg, arg6?: TSysArg): number;
    export function syscall64   (command: number, arg1?: TSysArg, arg2?: TSysArg, arg3?: TSysArg, arg4?: TSysArg, arg5?: TSysArg, arg6?: TSysArg): [number, number];
    export function malloc64(lo: number, hi: number, size: number): Buffer;
    export function errno(): number;
}

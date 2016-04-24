/// <reference path="../typings/typing.d.ts" />


declare module 'jskernel-sys' {
    export type TSysArg = number|string|Buffer;
    export function syscall     (command: number, arg1?: TSysArg, arg2?: TSysArg, arg3?: TSysArg, arg4?: TSysArg, arg5?: TSysArg, arg6?: TSysArg): number;
    export function syscall64   (command: number, arg1?: TSysArg, arg2?: TSysArg, arg3?: TSysArg, arg4?: TSysArg, arg5?: TSysArg, arg6?: TSysArg): [number, number];
    export function errno(): number;
}

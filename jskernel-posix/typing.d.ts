/// <reference path="../typings/typing.d.ts" />


declare module 'jskernel-sys' {
    export function syscall(command: number, ...args: (number|string|Buffer)[]): number;
    export function syscall64(command: number, ...args: (number|string|Buffer)[]): [number, number];
}

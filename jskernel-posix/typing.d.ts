/// <reference path="../typings/typing.d.ts" />

declare namespace JskernelSys {
    export function syscall(command: number, ...args: (number|string|Buffer)[]): number;
}

declare module 'jskernel-sys' {
    export = JskernelSys;
}

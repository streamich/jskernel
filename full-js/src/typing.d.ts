
// Constant set by Webpack, whether to print debug info.
declare var __DEBUG__: boolean;

// Constant set by Webpack, whether to trace syscalls.
declare var __STRACE__: boolean;

// Constant set by Webpack, whether JIT compile `process.asyscall` function.
declare var __BUILD_ASYNC_SYSCALL__: boolean;


// declare var __dirname;
// declare var __filename;
// declare var exports;
// declare var require;
// declare var process;


type TcallbackTyped <E, D> = (err?: E, data?: D) => void;
type Tcallback = TcallbackTyped <Error, any>;
type TcallbackData <D> = TcallbackTyped <Error, D>;

type number64 = [number, number];

// Types that JS runtime can use as memory address or can convert to some memory address.
type Taddress = number|number64|string|ArrayBuffer;


declare function setIOPoll(callback: (...args: any[]) => void, ...args: any[]): any;
declare function clearIOPoll(immediateId: any): void;


interface StaticArrayBufferConstructor extends ArrayBufferConstructor {

}

declare var StaticArrayBuffer: StaticArrayBufferConstructor;


declare namespace NodeJS {
    export interface Process {
        loop: any; // Main event loop

        // Whether `process` has `frame()` and `call()` methods.
        hasBinaryUtils: boolean;

        syscall(num:number): number;
        syscall(num:number, arg1:number): number;
        syscall(num:number, arg1:number, arg2:number): number;
        syscall(num:number, arg1:number, arg2:number, arg3:number): number;
        syscall(num:number, arg1:number, arg2:number, arg3:number, arg4:number): number;
        syscall(num:number, arg1:number, arg2:number, arg3:number, arg4:number, arg5:number): number;
        syscall(num:number, arg1:number, arg2:number, arg3:number, arg4:number, arg5:number, arg6:number): number;

        syscall64(num:number): number64;
        syscall64(num:number, arg1:number): number64;
        syscall64(num:number, arg1:number, arg2:number): number64;
        syscall64(num:number, arg1:number, arg2:number, arg3:number): number64;
        syscall64(num:number, arg1:number, arg2:number, arg3:number, arg4:number): number64;
        syscall64(num:number, arg1:number, arg2:number, arg3:number, arg4:number, arg5:number): number64;
        syscall64(num:number, arg1:number, arg2:number, arg3:number, arg4:number, arg5:number, arg6:number): number64;

        asyscall(num:number, callback:(res:number) => void);
        asyscall(num:number, arg1:number, callback:(res:number) => void);
        asyscall(num:number, arg1:number, arg2:number, callback:(res:number) => void);
        asyscall(num:number, arg1:number, arg2:number, arg3:number, callback:(res:number) => void);
        asyscall(num:number, arg1:number, arg2:number, arg3:number, arg4:number, callback:(res:number) => void);
        asyscall(num:number, arg1:number, arg2:number, arg3:number, arg4:number, arg5:number, callback:(res:number) => void);
        asyscall(num:number, arg1:number, arg2:number, arg3:number, arg4:number, arg5:number, arg6:number, callback:(res:number) => void);

        asyscall64(num:number, callback:(res:number64) => void);
        asyscall64(num:number, arg1:number, callback:(res:number64) => void);
        asyscall64(num:number, arg1:number, arg2:number, callback:(res:number64) => void);
        asyscall64(num:number, arg1:number, arg2:number, arg3:number, callback:(res:number64) => void);
        asyscall64(num:number, arg1:number, arg2:number, arg3:number, arg4:number, callback:(res:number64) => void);
        asyscall64(num:number, arg1:number, arg2:number, arg3:number, arg4:number, arg5:number, callback:(res:number64) => void);
        asyscall64(num:number, arg1:number, arg2:number, arg3:number, arg4:number, arg5:number, arg6:number, callback:(res:number64) => void);

    }
}

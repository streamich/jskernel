import * as libsys from 'libsys';
import * as libjs from '../libjs/libjs';


export class SharedArrayBuffer {
    static alloc(length: number): ArrayBuffer {

    }

    static allocAt(address: number, length: number): ArrayBuffer {

    }
}


export interface IStaticArrayBuffer extends ArrayBuffer {
    getAddress: () => libjs.number64;
    free: () => void;
    setProtection: (prot: string) => void;
}


export class StaticArrayBuffer {

    private static getProtectionValue(prot: string): number {
        if(typeof prot !== 'string')
            throw TypeError('Protection must be a string.');
        if(prot.match(/[^rwe]/))
            throw TypeError(`Protection string can contain only "r", "w" and "e" characters, given "${prot}".`);

        var val = 0;
        if(prot.indexOf('r') > -1) val |= libjs.PROT.READ;
        if(prot.indexOf('w') > -1) val |= libjs.PROT.WRITE;
        if(prot.indexOf('e') > -1) val |= libjs.PROT.EXEC;
        return val;
    }

    // Allocates memory using `mmap` system call.
    static alloc(size: number, protection: string = 'rw'): ArrayBuffer {
        var prot = StaticArrayBuffer.getProtectionValue(protection);
        var addr = libjs.mmap(0, size, prot, libjs.MAP.PRIVATE | libjs.MAP.ANONYMOUS, -1, 0);
        if(addr[1] < 0) throw Error('Could not allocate memory.');
        var ab: IStaticArrayBuffer = libsys.malloc64(addr[0], addr[1], size) as IStaticArrayBuffer;

        ab.getAddress = StaticArrayBuffer.getAddress.bind(ab);
        ab.setProtection = StaticArrayBuffer.setProtection.bind(ab);
        ab.free = StaticArrayBuffer.free.bind(ab);

        return ab;
    }

    private static getAddress() {
        var ab = this as any as ArrayBuffer;

    }

    private static setProtection(prot: string) {

    }

    private static free() {
        var ab = this as any as ArrayBuffer;
        libjs.munmap();
    }

    private static call() {
        var ab = this as any as ArrayBuffer;

    }

    // Allocates memory using `shmget` system call.
    // static allocShared(length: number, key: number): StaticArrayBuffer {
    //
    // }

    // Allocates memory at a specified memory address.
    // static allocAtAddress(length: number, addr: number): StaticArrayBuffer {
    //
    // }


    // setProtection(protection: string) {
    //
    // }

    // Push current instruction pointer on stack and jumps to `StaticArrayBuffer`.
    // jmp() {
    //
    // }

    // Calls machine code in the `StaticArrayBuffer` using standard host architecture calling conventions.
    // call(...args: number[]): number {
    //
    // }

    // address() {
    //     return libsys.addr(this);
    // }

    // free() {
    //
    // }
}


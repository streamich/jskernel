import {Buffer} from './buffer';


export class StaticBuffer extends Buffer {
    static isStaticBuffer(value: any): boolean;
    static alloc(size: number|number[], prot: string): StaticBuffer;
    static frame(addr: Taddress, size: number): StaticBuffer;
    static from(value): StaticBuffer;

    constructor(size: number);
    constructor(array: number[]);

    call(offset?: number, args?: number[]);
    getAddress(offset?: number): number64;
    slice(start?: number, end?: number): StaticBuffer;
    free();

    _next: StaticBuffer; // Secret property used in asynchronous syscall thread pool
    print(); // Available only while debugging.
}

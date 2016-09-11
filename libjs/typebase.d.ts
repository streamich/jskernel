export interface IType {
    size: number;
    unpack(buf: Buffer, offset?: number): any;
    pack(data: any, buf: Buffer, offset: any): any;
}
export declare class Type implements IType {
    static define(size: any, unpack: any, pack: any): Type;
    size: number;
    unpackF: (offset: number) => void;
    packF: (data: any, offset: number) => void;
    unpack(buf: Buffer, offset?: number): any;
    pack(data: any, buf?: Buffer, offset?: number): Buffer;
}
export declare class Arr {
    static define(type: IType, len: number): Arr;
    type: IType;
    len: number;
    size: number;
    unpack(buf: Buffer, offset?: number): any;
    pack(data: any, buf?: Buffer, offset?: number): Buffer;
}
export declare class Struct implements IType {
    static define(size: any, defs: any): Struct;
    defs: any;
    size: number;
    unpack(buf: Buffer, offset?: number): any;
    pack(data: any, buf?: Buffer, offset?: number): Buffer;
}

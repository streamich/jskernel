import { Arr } from './typebase';
export declare function flip(buf: Buffer, offset?: number, len?: number): Buffer;
export declare function hton16(num: number): number;
export declare function htons(buf: Buffer, offset?: number, len?: number): Buffer;
export declare class Ip {
    sep: string;
    buf: Buffer;
    constructor(ip: string | number[]);
    toString(): any;
    toBuffer(): Buffer;
    presentationToOctet(presentation: any): number;
    octetToPresentation(octet: any): any;
}
export declare class Ipv4 extends Ip {
    static type: Arr;
    constructor(ip?: string | number[]);
}
export declare class Ipv6 extends Ip {
    static type: Arr;
    sep: string;
    constructor(ip?: string | number[]);
    presentationToOctet(presentation: any): number;
    octetToPresentation(octet: any): any;
}

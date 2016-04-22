import {Arr} from './typebase';
import {isLE as IS_LE, uint8} from './definitions';


export function flip(buf: Buffer, offset = 0, len = buf.length) {
    var mid = len >> 1, tmp, lside, rside;
    for(var i = 0; i < mid; i++) {
        lside = i + offset;
        rside = offset + len - i - 1;
        tmp = buf.readInt8(lside);
        buf.writeInt8(buf.readInt8(rside), lside);
        buf.writeInt8(tmp, rside);
    }
    return buf;
}


export function htons32(num: number): number {
    if(IS_LE) return ((num & 0xFF00) >> 8) + ((num & 0xFF) << 8);
    else return num;
}


export function htons(buf: Buffer, offset = 0, len = buf.length) {
    if(IS_LE) return flip(buf, offset, len);
    else return buf;
}


// http://linux.die.net/man/3/inet_aton
// export function inet_aton(ip: string): number {
// export function inet_addr(ip: string): Ipv4 {
//     var ipobj = new Ipv4(ip);
//     htons(ipobj.buf);
//     return ipobj;
// }


export class Ipv4 {
    static type = Arr.define(uint8, 4);

    buf: Buffer;

    constructor(ip: string) {
        this.buf = new Buffer(ip.split('.'));
    }

    toString() {
        return Ipv4.type.unpack(this.buf).join('.');
    }

    toBuffer() {
        return this.buf;
    }

    // htons(): this {
        // TODO: IP byte ordering is always correct in this way?
        // TODO: So we don't need this function.
        // if(!IS_LE) this.buf = htons(this.buf);
        // return this;
    // }
}

export class Ipv6 extends Buffer {

}


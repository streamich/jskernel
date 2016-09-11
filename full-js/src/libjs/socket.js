"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var typebase_1 = require('./typebase');
var buffer_1 = require('../lib/buffer');
var x86_64_linux_1 = require('./platforms/x86_64_linux');
function flip(buf, offset, len) {
    if (offset === void 0) { offset = 0; }
    if (len === void 0) { len = buf.length; }
    var mid = len >> 1, tmp, lside, rside;
    for (var i = 0; i < mid; i++) {
        lside = i + offset;
        rside = offset + len - i - 1;
        tmp = buf.readInt8(lside);
        buf.writeInt8(buf.readInt8(rside), lside);
        buf.writeInt8(tmp, rside);
    }
    return buf;
}
exports.flip = flip;
// TODO: We cannot use 4-byte `htonl`, because JS allows bit shifting only up to 4-bytes
// TODO: AND those 4-bytes are treated as SIGNED int, so the 32-nd bit will change the sign of the number.
// export function htons32(num: number): number {
//     if(IS_LE) return ((num & 0xFF00) >> 8) + ((num & 0xFF) << 8);
//     else return num;
// }
function hton16(num) {
    if (x86_64_linux_1.isLE)
        return ((num & 0xFF00) >> 8) + ((num & 0xFF) << 8);
    else
        return num;
}
exports.hton16 = hton16;
function htons(buf, offset, len) {
    if (offset === void 0) { offset = 0; }
    if (len === void 0) { len = buf.length; }
    if (x86_64_linux_1.isLE)
        return flip(buf, offset, len);
    else
        return buf;
}
exports.htons = htons;
// http://linux.die.net/man/3/inet_aton
// export function inet_aton(ip: string): number {
// export function inet_addr(ip: string): Ipv4 {
//     var ipobj = new Ipv4(ip);
//     htons(ipobj.buf);
//     return ipobj;
// }
var Ip = (function () {
    function Ip(ip) {
        this.sep = '.';
        if (typeof ip === 'string') {
            this.buf = new buffer_1.Buffer(ip.split(this.sep));
        }
        else if (ip instanceof Array) {
            this.buf = new buffer_1.Buffer(ip);
        }
    }
    Ip.prototype.toString = function () {
        return Ipv4.type.unpack(this.buf).join(this.sep);
    };
    Ip.prototype.toBuffer = function () {
        return this.buf;
    };
    Ip.prototype.presentationToOctet = function (presentation) {
        return +presentation;
    };
    Ip.prototype.octetToPresentation = function (octet) {
        return octet;
    };
    return Ip;
}());
exports.Ip = Ip;
var Ipv4 = (function (_super) {
    __extends(Ipv4, _super);
    function Ipv4(ip) {
        if (ip === void 0) { ip = '127.0.0.1'; }
        _super.call(this, ip);
    }
    Ipv4.type = typebase_1.Arr.define(x86_64_linux_1.uint8, 4);
    return Ipv4;
}(Ip));
exports.Ipv4 = Ipv4;
var Ipv6 = (function (_super) {
    __extends(Ipv6, _super);
    function Ipv6(ip) {
        if (ip === void 0) { ip = '0:0:0:0:0:0:0:1'; }
        _super.call(this, ip);
        this.sep = ':';
    }
    Ipv6.prototype.presentationToOctet = function (presentation) {
        return parseInt(presentation, 16);
    };
    Ipv6.prototype.octetToPresentation = function (octet) {
        return octet.toString(16);
    };
    Ipv6.type = typebase_1.Arr.define(x86_64_linux_1.uint16, 16);
    return Ipv6;
}(Ip));
exports.Ipv6 = Ipv6;

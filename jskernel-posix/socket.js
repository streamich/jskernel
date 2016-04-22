"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var typebase_1 = require('./typebase');
var definitions_1 = require('./definitions');
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
function htons32(num) {
    if (definitions_1.isLE)
        return ((num & 0xFF00) >> 8) + ((num & 0xFF) << 8);
    else
        return num;
}
exports.htons32 = htons32;
function htons(buf, offset, len) {
    if (offset === void 0) { offset = 0; }
    if (len === void 0) { len = buf.length; }
    if (definitions_1.isLE)
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
var Ipv4 = (function () {
    function Ipv4(ip) {
        this.buf = new Buffer(ip.split('.'));
    }
    Ipv4.prototype.toString = function () {
        return Ipv4.type.unpack(this.buf).join('.');
    };
    Ipv4.prototype.toBuffer = function () {
        return this.buf;
    };
    Ipv4.type = typebase_1.Arr.define(definitions_1.uint8, 4);
    return Ipv4;
}());
exports.Ipv4 = Ipv4;
var Ipv6 = (function (_super) {
    __extends(Ipv6, _super);
    function Ipv6() {
        _super.apply(this, arguments);
    }
    return Ipv6;
}(Buffer));
exports.Ipv6 = Ipv6;

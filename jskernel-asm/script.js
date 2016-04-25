"use strict";
var Asm = (function () {
    function Asm() {
        this.bytes = [];
        this.eax = 0;
        this.ecx = 1;
    }
    Asm.prototype.add = function (src, dst) {
        this.bytes.push(1); // Adding 32bit values.
        if ((src == this.eax) && (dst == this.ecx)) {
            // 11000001
            // 11 - register
            // 000 - eax
            // 001 - ecx
            this.bytes.push(0xC1);
        }
        return this;
    };
    Asm.prototype.mov = function (src, dst) {
        return this;
    };
    Asm.prototype.jmp = function (code) {
        return this;
    };
    Asm.prototype.int = function (val) {
        return this;
    };
    Asm.prototype.system = function () {
        return this.int(80);
    };
    return Asm;
}());
exports.Asm = Asm;

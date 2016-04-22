"use strict";
var Script = (function () {
    function Script() {
        this.bytes = [];
        this.eax = 0;
        this.ecx = 1;
    }
    Script.prototype.add = function (src, dst) {
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
    Script.prototype.mov = function (src, dst) {
        return this;
    };
    Script.prototype.jmp = function () {
        return this;
    };
    Script.prototype.int = function (val) {
        return this;
    };
    Script.prototype.system = function () {
        return this.int(80);
    };
    return Script;
}());
exports.Script = Script;

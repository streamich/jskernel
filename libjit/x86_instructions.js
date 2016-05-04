"use strict";
var ins = [];
ins[0x05] = function (eax, immediate, pc) {
    var cpu = this;
    var immediate = cpu.readInt32();
    cpu.p.EAX.set(cpu.p.EAX.int32() + immediate);
};
ins[0x48] = []; // REX.W
ins[0x48][0x89] = [];
ins[0x48][0x89][0xC6] = function () {
};

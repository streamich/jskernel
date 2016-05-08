"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (RTYPE) {
    RTYPE[RTYPE["GENERAL_PURPOSE"] = 0] = "GENERAL_PURPOSE";
    RTYPE[RTYPE["GENERAL_PURPOSE_SPECIAL"] = 1] = "GENERAL_PURPOSE_SPECIAL";
    RTYPE[RTYPE["STACK_POINTER"] = 2] = "STACK_POINTER";
    RTYPE[RTYPE["BASE_POINTER"] = 3] = "BASE_POINTER";
    RTYPE[RTYPE["FLOATING_POINT"] = 4] = "FLOATING_POINT";
})(exports.RTYPE || (exports.RTYPE = {}));
var RTYPE = exports.RTYPE;
var Register = (function () {
    function Register(id, name, size, type) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.size = size;
    }
    return Register;
}());
exports.Register = Register;
var RegisterInner = (function (_super) {
    __extends(RegisterInner, _super);
    function RegisterInner(id, name, size, offset, parent, type) {
        _super.call(this, id, name, size, type);
        this.parent = parent;
        this.offset = offset;
    }
    return RegisterInner;
}(Register));
exports.RegisterInner = RegisterInner;
function reg(name, id, size, type) {
    if (type === void 0) { type = RTYPE.GENERAL_PURPOSE; }
    return new Register(id, name, size, type);
}
function subreg(parent, name, id, offset, size, type) {
    if (type === void 0) { type = RTYPE.GENERAL_PURPOSE; }
    return new RegisterInner(id, name, size, offset, parent, type);
}
exports.registers = {
    rax: reg('rax', 0, 64, RTYPE.GENERAL_PURPOSE_SPECIAL),
    rbx: reg('rbx', 2, 64),
    rcx: reg('rcx', 1, 64, RTYPE.GENERAL_PURPOSE_SPECIAL),
    rdx: reg('rdx', 3, 64, RTYPE.GENERAL_PURPOSE_SPECIAL),
    rsp: reg('rsp', 4, 64, RTYPE.STACK_POINTER),
    rbp: reg('rbp', 5, 64, RTYPE.BASE_POINTER),
    rsi: reg('rsi', 6, 64),
    rdi: reg('rsi', 7, 64),
    r8: reg('r8', 0, 64),
    r9: reg('r9', 1, 64),
    r10: reg('r10', 2, 64),
    r11: reg('r11', 3, 64),
    r12: reg('r12', 4, 64),
    r13: reg('r13', 5, 64),
    r14: reg('r14', 6, 64),
    r15: reg('r15', 7, 64),
    eax: subreg('rax', 'eax', 0, 32, 32, RTYPE.GENERAL_PURPOSE_SPECIAL)
};

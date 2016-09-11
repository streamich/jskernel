"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
(function (OPERATOR) {
    OPERATOR[OPERATOR["Undefined"] = -1] = "Undefined";
    OPERATOR[OPERATOR["Ret"] = 0] = "Ret";
    OPERATOR[OPERATOR["Br"] = 1] = "Br";
    OPERATOR[OPERATOR["Jmp"] = 2] = "Jmp";
    OPERATOR[OPERATOR["Cmp"] = 3] = "Cmp";
    OPERATOR[OPERATOR["Call"] = 4] = "Call";
    OPERATOR[OPERATOR["Label"] = 5] = "Label";
    OPERATOR[OPERATOR["Assign"] = 6] = "Assign";
    OPERATOR[OPERATOR["Add"] = 20] = "Add";
    OPERATOR[OPERATOR["Sub"] = 21] = "Sub";
    OPERATOR[OPERATOR["Mul"] = 22] = "Mul";
    OPERATOR[OPERATOR["UDiv"] = 23] = "UDiv";
    OPERATOR[OPERATOR["SDiv"] = 24] = "SDiv";
    OPERATOR[OPERATOR["URem"] = 25] = "URem";
    OPERATOR[OPERATOR["SRem"] = 26] = "SRem";
    OPERATOR[OPERATOR["Shl"] = 40] = "Shl";
    OPERATOR[OPERATOR["LShr"] = 41] = "LShr";
    OPERATOR[OPERATOR["AShr"] = 42] = "AShr";
    OPERATOR[OPERATOR["And"] = 43] = "And";
    OPERATOR[OPERATOR["Or"] = 44] = "Or";
    OPERATOR[OPERATOR["Xor"] = 45] = "Xor";
    OPERATOR[OPERATOR["Alloc"] = 60] = "Alloc";
    OPERATOR[OPERATOR["Load"] = 61] = "Load";
    OPERATOR[OPERATOR["Store"] = 62] = "Store";
    OPERATOR[OPERATOR["Trunc"] = 80] = "Trunc";
    OPERATOR[OPERATOR["ZExt"] = 81] = "ZExt";
    OPERATOR[OPERATOR["SExt"] = 82] = "SExt";
    OPERATOR[OPERATOR["PtrToInt"] = 83] = "PtrToInt";
    OPERATOR[OPERATOR["IntToPtr"] = 84] = "IntToPtr";
    OPERATOR[OPERATOR["Bitcast"] = 85] = "Bitcast";
})(exports.OPERATOR || (exports.OPERATOR = {}));
var OPERATOR = exports.OPERATOR;
var Instruction = (function () {
    function Instruction(op1, op2, op3) {
        if (op1 === void 0) { op1 = null; }
        if (op2 === void 0) { op2 = null; }
        if (op3 === void 0) { op3 = null; }
        this.operator = OPERATOR.Undefined;
        this.next = null;
        this.prev = null;
        this.op1 = op1;
        this.op2 = op2;
        this.op3 = op3;
    }
    Instruction.fromJson = function () {
    };
    Instruction.prototype.operands = function () {
        var ops = [];
        if (this.op1) {
            ops.push(this.op1);
            if (this.op2) {
                ops.push(this.op2);
                if (this.op3) {
                    ops.push(this.op3);
                }
            }
        }
        return ops;
    };
    Instruction.prototype.toJson = function () {
        var ops = [];
    };
    Instruction.prototype.toBinary = function () {
    };
    Instruction.prototype.toString = function () {
        if (!this.op2)
            return OPERATOR[this.operator] + (this.op1 ? ' ' + this.op1.toString() : '');
        return OPERATOR[this.operator] +
            (this.op1 ? ' ' + this.op1.toString() : '') +
            (this.op2 ? ', ' + this.op2.toString() : '') +
            (this.op3 ? ', ' + this.op3.toString() : '');
    };
    return Instruction;
}());
exports.Instruction = Instruction;
var Assign = (function (_super) {
    __extends(Assign, _super);
    function Assign() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.Assign;
    }
    Assign.prototype.toString = function () {
        return this.op1.toString() + ' = ' + this.op2.toString();
    };
    return Assign;
}(Instruction));
exports.Assign = Assign;
var Terminator = (function (_super) {
    __extends(Terminator, _super);
    function Terminator() {
        _super.apply(this, arguments);
    }
    return Terminator;
}(Instruction));
exports.Terminator = Terminator;
var Br = (function (_super) {
    __extends(Br, _super);
    function Br(test, ifTrueLbl, ifFalseLbl) {
        _super.call(this, test, ifTrueLbl, ifFalseLbl);
        this.operator = OPERATOR.Br;
    }
    return Br;
}(Terminator));
exports.Br = Br;
var Jmp = (function (_super) {
    __extends(Jmp, _super);
    function Jmp() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.Jmp;
    }
    return Jmp;
}(Terminator));
exports.Jmp = Jmp;
var Ret = (function (_super) {
    __extends(Ret, _super);
    function Ret() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.Ret;
    }
    return Ret;
}(Terminator));
exports.Ret = Ret;
var Binary = (function (_super) {
    __extends(Binary, _super);
    function Binary() {
        _super.apply(this, arguments);
    }
    Binary.prototype.toString = function () {
        return (this.op1 ? this.op1.toString() + ' = ' : '') + OPERATOR[this.operator] +
            (this.op2 ? ' ' + this.op2.toString() : '') + (this.op3 ? ', ' + this.op3.toString() : '');
    };
    return Binary;
}(Instruction));
exports.Binary = Binary;
function toStringBinArithmetic(ins, operator) {
    return ins.op1.toString() + ' = ' + ins.op2.toString() + ' ' + operator + ' ' + ins.op3.toString();
}
var Add = (function (_super) {
    __extends(Add, _super);
    function Add() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.Add;
    }
    Add.prototype.toString = function () {
        return toStringBinArithmetic(this, '+');
    };
    return Add;
}(Binary));
exports.Add = Add;
var Sub = (function (_super) {
    __extends(Sub, _super);
    function Sub() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.Sub;
    }
    Sub.prototype.toString = function () {
        return toStringBinArithmetic(this, '-');
    };
    return Sub;
}(Binary));
exports.Sub = Sub;
var Mul = (function (_super) {
    __extends(Mul, _super);
    function Mul() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.Mul;
    }
    Mul.prototype.toString = function () {
        return toStringBinArithmetic(this, '*');
    };
    return Mul;
}(Binary));
exports.Mul = Mul;
var UDiv = (function (_super) {
    __extends(UDiv, _super);
    function UDiv() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.UDiv;
    }
    UDiv.prototype.toString = function () {
        return toStringBinArithmetic(this, 'u/');
    };
    return UDiv;
}(Binary));
exports.UDiv = UDiv;
var SDiv = (function (_super) {
    __extends(SDiv, _super);
    function SDiv() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.SDiv;
    }
    SDiv.prototype.toString = function () {
        return toStringBinArithmetic(this, 's/');
    };
    return SDiv;
}(Binary));
exports.SDiv = SDiv;
var URem = (function (_super) {
    __extends(URem, _super);
    function URem() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.URem;
    }
    URem.prototype.toString = function () {
        return toStringBinArithmetic(this, 'u%');
    };
    return URem;
}(Binary));
exports.URem = URem;
var SRem = (function (_super) {
    __extends(SRem, _super);
    function SRem() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.SRem;
    }
    SRem.prototype.toString = function () {
        return toStringBinArithmetic(this, 's%');
    };
    return SRem;
}(Binary));
exports.SRem = SRem;
var Shl = (function (_super) {
    __extends(Shl, _super);
    function Shl() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.Shl;
    }
    Shl.prototype.toString = function () {
        return toStringBinArithmetic(this, '<<');
    };
    return Shl;
}(Binary));
exports.Shl = Shl;
var LShr = (function (_super) {
    __extends(LShr, _super);
    function LShr() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.LShr;
    }
    LShr.prototype.toString = function () {
        return toStringBinArithmetic(this, 'l>>');
    };
    return LShr;
}(Binary));
exports.LShr = LShr;
var AShr = (function (_super) {
    __extends(AShr, _super);
    function AShr() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.AShr;
    }
    AShr.prototype.toString = function () {
        return toStringBinArithmetic(this, 'a>>');
    };
    return AShr;
}(Binary));
exports.AShr = AShr;
var And = (function (_super) {
    __extends(And, _super);
    function And() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.And;
    }
    And.prototype.toString = function () {
        return toStringBinArithmetic(this, '&');
    };
    return And;
}(Binary));
exports.And = And;
var Or = (function (_super) {
    __extends(Or, _super);
    function Or() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.Or;
    }
    Or.prototype.toString = function () {
        return toStringBinArithmetic(this, '|');
    };
    return Or;
}(Binary));
exports.Or = Or;
var Xor = (function (_super) {
    __extends(Xor, _super);
    function Xor() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.Xor;
    }
    Xor.prototype.toString = function () {
        return toStringBinArithmetic(this, '^');
    };
    return Xor;
}(Binary));
exports.Xor = Xor;
var Alloc = (function (_super) {
    __extends(Alloc, _super);
    function Alloc(ptr, ptrType) {
        _super.call(this, ptr);
        this.operator = OPERATOR.Alloc;
        this.type = ptrType;
    }
    Alloc.prototype.toString = function () {
        return this.op1.toString() + ' = ' + OPERATOR[this.operator] + ' ' + this.type.toString();
    };
    return Alloc;
}(Instruction));
exports.Alloc = Alloc;
var Load = (function (_super) {
    __extends(Load, _super);
    function Load(val, ptr, valueType) {
        _super.call(this, val, ptr);
        this.operator = OPERATOR.Load;
        this.type = valueType;
    }
    Load.prototype.toString = function () {
        return this.op1.toString() + ' = ' +
            OPERATOR[this.operator] + ' ' + this.type.toString() + ' ' + this.op2.toString();
    };
    return Load;
}(Instruction));
exports.Load = Load;
var Store = (function (_super) {
    __extends(Store, _super);
    function Store() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.Store;
    }
    return Store;
}(Instruction));
exports.Store = Store;
var Cast = (function (_super) {
    __extends(Cast, _super);
    function Cast(op1, op2, toType) {
        _super.call(this, op1, op2);
        this.toType = toType;
    }
    Cast.prototype.toString = function () {
        return (this.op1 ? this.op1.toString() + ' = ' : '') + OPERATOR[this.operator] +
            (this.op2 ? ' ' + this.op2.toString() : '') + (this.op3 ? ', ' + this.op3.toString() : '');
    };
    return Cast;
}(Instruction));
exports.Cast = Cast;
var Trunc = (function (_super) {
    __extends(Trunc, _super);
    function Trunc() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.Trunc;
    }
    return Trunc;
}(Cast));
exports.Trunc = Trunc;
var ZExt = (function (_super) {
    __extends(ZExt, _super);
    function ZExt() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.ZExt;
    }
    return ZExt;
}(Cast));
exports.ZExt = ZExt;
var SExt = (function (_super) {
    __extends(SExt, _super);
    function SExt() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.SExt;
    }
    return SExt;
}(Cast));
exports.SExt = SExt;
var PtrToInt = (function (_super) {
    __extends(PtrToInt, _super);
    function PtrToInt() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.PtrToInt;
    }
    return PtrToInt;
}(Cast));
exports.PtrToInt = PtrToInt;
var IntToPtr = (function (_super) {
    __extends(IntToPtr, _super);
    function IntToPtr() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.IntToPtr;
    }
    return IntToPtr;
}(Cast));
exports.IntToPtr = IntToPtr;
var Bitcast = (function (_super) {
    __extends(Bitcast, _super);
    function Bitcast() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.Bitcast;
    }
    return Bitcast;
}(Cast));
exports.Bitcast = Bitcast;
(function (CONDITION) {
    CONDITION[CONDITION["EQ"] = 0] = "EQ";
    CONDITION[CONDITION["NE"] = 1] = "NE";
    CONDITION[CONDITION["UGT"] = 2] = "UGT";
    CONDITION[CONDITION["UGE"] = 3] = "UGE";
    CONDITION[CONDITION["ULT"] = 4] = "ULT";
    CONDITION[CONDITION["ULE"] = 5] = "ULE";
    CONDITION[CONDITION["SGT"] = 6] = "SGT";
    CONDITION[CONDITION["SGE"] = 7] = "SGE";
    CONDITION[CONDITION["SLT"] = 8] = "SLT";
    CONDITION[CONDITION["SLE"] = 9] = "SLE";
})(exports.CONDITION || (exports.CONDITION = {}));
var CONDITION = exports.CONDITION;
var Cmp = (function (_super) {
    __extends(Cmp, _super);
    function Cmp(resBool, op2, op3, condition) {
        _super.call(this, resBool, op2, op3);
        this.operator = OPERATOR.Cmp;
        this.condition = condition;
    }
    Cmp.prototype.toString = function () {
        return this.op1.toString() + " = Cmp." + CONDITION[this.condition] + " " + this.op2.toString() + ", " + this.op3.toString();
    };
    return Cmp;
}(Instruction));
exports.Cmp = Cmp;
var Call = (function (_super) {
    __extends(Call, _super);
    function Call() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.Call;
    }
    return Call;
}(Instruction));
exports.Call = Call;
var Asm = (function (_super) {
    __extends(Asm, _super);
    function Asm(tpl) {
        _super.call(this);
        this.tpl = tpl;
    }
    Asm.prototype.toString = function () {
        var list = [];
        var probe = function (mnemonic, operands) {
            var opList = [];
            if (operands) {
                for (var _i = 0, operands_1 = operands; _i < operands_1.length; _i++) {
                    var op = operands_1[_i];
                    opList.push(op.toString());
                }
            }
            list.push(mnemonic + (opList.length ? ' ' + opList.join(', ') : ''));
        };
        probe.r = function (rname, index) {
            return {
                toString: function () { return rname; },
            };
        };
        this.tpl(probe);
        return list.join('\n');
    };
    return Asm;
}(Instruction));
exports.Asm = Asm;
var Label = (function (_super) {
    __extends(Label, _super);
    function Label() {
        _super.apply(this, arguments);
        this.operator = OPERATOR.Label;
    }
    Label.prototype.toString = function () {
        return this.op1.toString() + ':';
    };
    return Label;
}(Instruction));
exports.Label = Label;

"use strict";
var type = require('./type');
var tac = require('./ir');
var op = require('./operand');
var ins = require('./ins');
exports.COND = ins.CONDITION;
exports.t = type.t;
var IrUiUnitContext = (function () {
    function IrUiUnitContext() {
        this.unit = new tac.Unit;
        this.t = type.t;
    }
    IrUiUnitContext.prototype.func = function (a, b, c, d) {
        var p = {};
        var continuation;
        var typeofA = typeof a;
        if (typeofA === 'function') {
            continuation = a;
        }
        else if (typeofA === 'object') {
            if (a instanceof type.Type) {
                p.type = a;
                p.args = b;
                p.name = c;
                continuation = d;
            }
            else {
                p = a;
                continuation = b;
            }
        }
        else if (typeofA === 'string') {
            p.name = a;
            continuation = b;
        }
        var func = new IrUiFunctionContext(p);
        this.unit.pushFunction(func.func);
        continuation(func);
    };
    IrUiUnitContext.prototype.toString = function () {
        return this.unit.toString();
    };
    return IrUiUnitContext;
}());
exports.IrUiUnitContext = IrUiUnitContext;
var IrUiFunctionContext = (function () {
    function IrUiFunctionContext(props) {
        this.func = new tac.Function;
        this.t = type.t;
        this.defaultType = this.t.i64;
        this.func = new tac.Function(props.type, props.args, props.name, props.attr);
    }
    IrUiFunctionContext.prototype.op = function (value, t) {
        if (value === void 0) { value = null; }
        if (t === void 0) { t = this.defaultType; }
        if (typeof value === 'number') {
            return new op.OperandConst(t, value);
        }
        else if (!value) {
            return this.func.createVariable(t);
        }
        else if (value instanceof op.Operand) {
            return value;
        }
        else if (typeof value === 'string') {
            var operand = this.func.vars.get(value);
            if (operand)
                return operand;
            else
                throw Error("Variable not found \"" + value + "\".");
        }
        else
            throw Error("Do not know how to create operand out of type " + typeof value + ".");
    };
    IrUiFunctionContext.prototype.lop = function (lvalue) {
        if (lvalue instanceof op.OperandVariable) {
            return lvalue;
        }
        else
            throw Error('L-value expected as destination operand.');
    };
    IrUiFunctionContext.prototype['var'] = function (t, name) {
        if (t === void 0) { t = this.defaultType; }
        return this.func.vars.getOrCreate(t, name);
    };
    IrUiFunctionContext.prototype.lbl = function (lblOperand) {
        if (!lblOperand) {
            return this.func.labels.create();
        }
        else if (typeof lblOperand === 'string') {
            return this.func.labels.getOrCreate(lblOperand);
        }
        else if (lblOperand instanceof op.OperandLabel) {
            return lblOperand;
        }
        else
            throw TypeError('Expected TUiLabel.');
    };
    IrUiFunctionContext.prototype.label = function (lbl) {
        var lblOperand = this.lbl(lbl);
        var instruction = new ins.Label(lblOperand);
        return this.func.pushInstruction(instruction);
    };
    IrUiFunctionContext.prototype.assign = function (op1, op2, t) {
        var operand1;
        var operand2;
        var operand2 = this.op(op2, t);
        operand1 = this.op(op1);
        var instruction = new ins.Assign(operand1, operand2);
        this.func.pushInstruction(instruction);
        return instruction;
    };
    IrUiFunctionContext.prototype.is = function (op1, op2, t) {
        return this.assign(op1, op2, t);
    };
    IrUiFunctionContext.prototype.add = function (op1, op2, op3) {
        return this.func.pushInstruction(new ins.Add(this.op(op1), this.op(op2), this.op(op3)));
    };
    IrUiFunctionContext.prototype.sub = function (op1, op2, op3) {
        return this.func.pushInstruction(new ins.Sub(this.op(op1), this.op(op2), this.op(op3)));
    };
    IrUiFunctionContext.prototype.mul = function (op1, op2, op3) {
        return this.func.pushInstruction(new ins.Mul(this.op(op1), this.op(op2), this.op(op3)));
    };
    IrUiFunctionContext.prototype.sdiv = function (op1, op2, op3) {
        return this.func.pushInstruction(new ins.SDiv(this.op(op1), this.op(op2), this.op(op3)));
    };
    IrUiFunctionContext.prototype.udiv = function (op1, op2, op3) {
        return this.func.pushInstruction(new ins.UDiv(this.op(op1), this.op(op2), this.op(op3)));
    };
    IrUiFunctionContext.prototype.urem = function (op1, op2, op3) {
        return this.func.pushInstruction(new ins.URem(this.op(op1), this.op(op2), this.op(op3)));
    };
    IrUiFunctionContext.prototype.srem = function (op1, op2, op3) {
        return this.func.pushInstruction(new ins.SRem(this.op(op1), this.op(op2), this.op(op3)));
    };
    IrUiFunctionContext.prototype.shl = function (op1, op2, op3) {
        return this.func.pushInstruction(new ins.Shl(this.op(op1), this.op(op2), this.op(op3)));
    };
    IrUiFunctionContext.prototype.lshr = function (op1, op2, op3) {
        return this.func.pushInstruction(new ins.LShr(this.op(op1), this.op(op2), this.op(op3)));
    };
    IrUiFunctionContext.prototype.ashr = function (op1, op2, op3) {
        return this.func.pushInstruction(new ins.AShr(this.op(op1), this.op(op2), this.op(op3)));
    };
    IrUiFunctionContext.prototype.and = function (op1, op2, op3) {
        return this.func.pushInstruction(new ins.And(this.op(op1), this.op(op2), this.op(op3)));
    };
    IrUiFunctionContext.prototype.or = function (op1, op2, op3) {
        return this.func.pushInstruction(new ins.Or(this.op(op1), this.op(op2), this.op(op3)));
    };
    IrUiFunctionContext.prototype.xor = function (op1, op2, op3) {
        return this.func.pushInstruction(new ins.Xor(this.op(op1), this.op(op2), this.op(op3)));
    };
    IrUiFunctionContext.prototype.trunc = function (op1, op2, toType) {
        return this.func.pushInstruction(new ins.Trunc(this.op(op1), this.op(op2), toType));
    };
    IrUiFunctionContext.prototype.zext = function (op1, op2, toType) {
        return this.func.pushInstruction(new ins.ZExt(this.op(op1), this.op(op2), toType));
    };
    IrUiFunctionContext.prototype.sext = function (op1, op2, toType) {
        return this.func.pushInstruction(new ins.SExt(this.op(op1), this.op(op2), toType));
    };
    IrUiFunctionContext.prototype.ptrtoint = function (op1, op2, toType) {
        return this.func.pushInstruction(new ins.PtrToInt(this.op(op1), this.op(op2), toType));
    };
    IrUiFunctionContext.prototype.inttoptr = function (op1, op2, toType) {
        return this.func.pushInstruction(new ins.IntToPtr(this.op(op1), this.op(op2), toType));
    };
    IrUiFunctionContext.prototype.bitcast = function (op1, op2, toType) {
        return this.func.pushInstruction(new ins.Bitcast(this.op(op1), this.op(op2), toType));
    };
    IrUiFunctionContext.prototype.cmp = function (op1, op2, op3, condition) {
        return this.func.pushInstruction(new ins.Cmp(this.lop(op1), this.op(op2), this.op(op3), condition));
    };
    IrUiFunctionContext.prototype.br = function (op1, lbl1, lbl2) {
        return this.func.pushInstruction(new ins.Br(this.op(op1), this.lbl(lbl1), this.lbl(lbl2)));
    };
    IrUiFunctionContext.prototype.jmp = function (lbl) {
        return this.func.pushInstruction(new ins.Jmp(this.lbl(lbl)));
    };
    IrUiFunctionContext.prototype.ret = function (operand) {
        if (typeof operand === 'undefined') {
            return this.func.pushInstruction(new ins.Ret());
        }
        else {
            return this.func.pushInstruction(new ins.Ret(this.op(operand)));
        }
    };
    IrUiFunctionContext.prototype.alloc = function (ptr, ptrType) {
        return this.func.pushInstruction(new ins.Alloc(ptr, ptrType));
    };
    IrUiFunctionContext.prototype.store = function (ptr, value) {
        return this.func.pushInstruction(new ins.Store(this.lop(ptr), this.op(value)));
    };
    IrUiFunctionContext.prototype.load = function (val, ptr, valueType) {
        return this.func.pushInstruction(new ins.Load(this.op(val), this.lop(ptr), valueType));
    };
    IrUiFunctionContext.prototype.asm = function (tpl) {
        return this.func.pushInstruction(new ins.Asm(tpl));
    };
    return IrUiFunctionContext;
}());
exports.IrUiFunctionContext = IrUiFunctionContext;
function create() {
    var ui = new IrUiUnitContext;
    return ui;
}
exports.create = create;

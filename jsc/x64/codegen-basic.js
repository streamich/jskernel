"use strict";
var codegen_1 = require("./codegen");
var irop = require('../ir/operand');
var ins = require('../ir/ins');
var code_1 = require('../../ass-js/x86/x64/code');
var probe_1 = require('../../ass-js/x86/probe');
var operand_1 = require('../../ass-js/x86/operand');
var ins_1 = require("../ir/ins");
var REG_ACC = operand_1.rax;
var REG_TMP = operand_1.rdx;
var REG_REMAINDER = operand_1.rdx;
var REG_SHIFT = operand_1.rcx;
var BasicFunctionGodegen = (function () {
    function BasicFunctionGodegen(codegen, func, ar) {
        if (ar === void 0) { ar = new codegen_1.ActivationRecordC; }
        this.label = null;
        this.codegen = codegen;
        this.mc = codegen.mc;
        this.func = func;
        this.ar = ar;
    }
    BasicFunctionGodegen.prototype.load = function (operand, into) {
        if (operand instanceof irop.OperandVariable) {
            var location = operand.location;
            if (location instanceof codegen_1.LocationStack) {
                var size = operand.type.size;
                if (size === 1) {
                    size = 8;
                }
                var disp = location.offset;
                this.mc._('mov', [into.getRegisterSized(size), operand_1.rbp.disp(disp)]);
            }
            else if (location instanceof codegen_1.LocationRegister) {
                this.mc._('mov', [into, location.register]);
            }
            else
                throw Error("Do not know how to load variable \"" + operand.toString() + "\".");
        }
        else if (operand instanceof irop.OperandConst) {
            this.mc._('mov', [into, operand.value]);
        }
        else
            throw Error("Do not know how to load operand of type " + operand.constructor.name + ".");
    };
    BasicFunctionGodegen.prototype.loadIfNotRegister = function (operand, into) {
        if ((operand instanceof irop.OperandVariable) && (operand.location instanceof codegen_1.LocationRegister)) {
            return operand.location.register;
        }
        else {
            this.load(operand, into);
            return into;
        }
    };
    BasicFunctionGodegen.prototype.storeToLocation = function (operand, what) {
        var loc = operand.location;
        var size = operand.type.size;
        if (size === 1) {
            size = 8;
        }
        if (loc instanceof codegen_1.LocationRegister) {
            var to_reg = loc.register;
            if (what instanceof operand_1.Register) {
                this.mc._('mov', [to_reg, what]);
            }
            else if (what instanceof irop.OperandConst) {
                this.mc._('mov', [to_reg, what.value]);
            }
            else if (what instanceof irop.OperandVariable) {
                if (what.location instanceof codegen_1.LocationRegister) {
                    var from_reg = what.location.register;
                    this.mc._('mov', [to_reg, from_reg]);
                }
                else if (what.location instanceof codegen_1.LocationStack) {
                    var disp = what.location.offset;
                    this.mc._('mov', [to_reg, operand_1.rbp.disp(disp)]);
                }
                else
                    throw Error("Unexpected store r-value.");
            }
            else
                throw Error("Unexpected store r-value.");
        }
        else if (loc instanceof codegen_1.LocationStack) {
            var disp = loc.offset;
            var mem = operand_1.rbp.disp(disp);
            if (what instanceof operand_1.Register) {
                this.mc._('mov', [mem, what.getRegisterSized(size)]);
            }
            else if (what instanceof irop.OperandConst) {
                this.mc._('mov', [mem, what.value], size);
            }
            else if (what instanceof irop.OperandVariable) {
                if (what.location instanceof codegen_1.LocationRegister) {
                    var from_reg = what.location.register;
                    this.mc._('mov', [mem, from_reg.getRegisterSized(size)]);
                }
                else if (what.location instanceof codegen_1.LocationStack) {
                    this.load(what, REG_ACC);
                    this.mc._('mov', [mem, REG_ACC.getRegisterSized(size)]);
                }
                else
                    throw Error("Unexpected store r-value.");
            }
            else
                throw Error("Unexpected store r-value.");
        }
        else
            throw Error('Store location must be an l-value.');
    };
    BasicFunctionGodegen.prototype.store = function (operand, what) {
        if (operand instanceof irop.OperandVariable) {
            this.storeToLocation(operand, what);
        }
        else
            throw Error("Store location must be an l-value");
    };
    BasicFunctionGodegen.prototype.conditionToJumpMnemonic = function (cond) {
        switch (cond) {
            case ins_1.CONDITION.EQ: return 'je';
            case ins_1.CONDITION.NE: return 'jne';
            case ins_1.CONDITION.UGT: return 'ja';
            case ins_1.CONDITION.UGE: return 'jae';
            case ins_1.CONDITION.ULT: return 'jb';
            case ins_1.CONDITION.ULE: return 'jbe';
            case ins_1.CONDITION.SGT: return 'jg';
            case ins_1.CONDITION.SGE: return 'jge';
            case ins_1.CONDITION.SLT: return 'jl';
            case ins_1.CONDITION.SLE: return 'jle';
            default:
                throw Error('Unsupported branch condition.');
        }
    };
    BasicFunctionGodegen.prototype.onCmp = function (instruction) {
        var reg_op2 = this.loadIfNotRegister(instruction.op2, REG_ACC);
        var reg_op3 = this.loadIfNotRegister(instruction.op3, REG_TMP);
        this.mc._('cmp', [reg_op2, reg_op3]);
        var lblTrue = this.mc.lbl();
        var lblContinue = this.mc.lbl();
        var mnemonic = this.conditionToJumpMnemonic(instruction.condition);
        this.mc._(mnemonic, lblTrue);
        this.store(instruction.op1, new irop.OperandConst(instruction.op1.type, 0));
        this.mc._('jmp', lblContinue);
        this.mc.insert(lblTrue);
        this.store(instruction.op1, new irop.OperandConst(instruction.op1.type, 1));
        this.mc.insert(lblContinue);
    };
    BasicFunctionGodegen.prototype.onLabel = function (instruction) {
        this.mc.insert(instruction.op1.native);
    };
    BasicFunctionGodegen.prototype.onBr = function (instruction) {
        this.load(instruction.op1, REG_ACC);
        this.mc._('cmp', [REG_ACC, 0]);
        var lblFalse = instruction.op3.native;
        var lblTrue = instruction.op2.native;
        this.mc._('jne', lblTrue);
        this.mc._('jmp', lblFalse);
    };
    BasicFunctionGodegen.prototype.onJmp = function (instruction) {
        var lbl = instruction.op1.native;
        this.mc._('jmp', lbl);
    };
    BasicFunctionGodegen.prototype.onAdd = function (instruction) {
        this.load(instruction.op2, REG_ACC);
        if (instruction.op3 instanceof irop.OperandConst) {
            this.mc._('add', [REG_ACC, instruction.op3.value]);
        }
        else {
            this.load(instruction.op3, REG_TMP);
            this.mc._('add', [REG_ACC, REG_TMP]);
        }
        this.store(instruction.op1, REG_ACC);
    };
    BasicFunctionGodegen.prototype.onSub = function (instruction) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('sub', [REG_ACC, REG_TMP]);
        this.store(instruction.op1, REG_ACC);
    };
    BasicFunctionGodegen.prototype.onMul = function (instruction) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('mul', [REG_TMP]);
        this.store(instruction.op1, REG_ACC);
    };
    BasicFunctionGodegen.prototype.onUDiv = function (instruction) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('div', [REG_TMP]);
        this.store(instruction.op1, REG_ACC);
    };
    BasicFunctionGodegen.prototype.onSDiv = function (instruction) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('idiv', [REG_TMP]);
        this.store(instruction.op1, REG_ACC);
    };
    BasicFunctionGodegen.prototype.onURem = function (instruction) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('div', [REG_TMP]);
        this.store(instruction.op1, REG_REMAINDER);
    };
    BasicFunctionGodegen.prototype.onSRem = function (instruction) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('idiv', [REG_TMP]);
        this.store(instruction.op1, REG_REMAINDER);
    };
    BasicFunctionGodegen.prototype.onAnd = function (instruction) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('and', [REG_ACC, REG_TMP]);
        this.store(instruction.op1, REG_ACC);
    };
    BasicFunctionGodegen.prototype.onOr = function (instruction) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('or', [REG_ACC, REG_TMP]);
        this.store(instruction.op1, REG_ACC);
    };
    BasicFunctionGodegen.prototype.onXor = function (instruction) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('xor', [REG_ACC, REG_TMP]);
        this.store(instruction.op1, REG_ACC);
    };
    BasicFunctionGodegen.prototype.onRet = function (instruction) {
        if (instruction.op1) {
            this.load(instruction.op1, this.ar.cc.returnRegister);
        }
        this.ar.emitPrologue(this.mc);
    };
    BasicFunctionGodegen.prototype.onAssign = function (instruction) {
        this.store(instruction.op1, instruction.op2);
    };
    BasicFunctionGodegen.prototype.onAsm = function (asm) {
        var probe = probe_1.createProbe(this.mc);
        asm.tpl(probe);
    };
    BasicFunctionGodegen.prototype.translateInstruction = function (instruction) {
        if (instruction instanceof ins.Assign)
            this.onAssign(instruction);
        else if (instruction instanceof ins.Add)
            this.onAdd(instruction);
        else if (instruction instanceof ins.Sub)
            this.onSub(instruction);
        else if (instruction instanceof ins.Mul)
            this.onMul(instruction);
        else if (instruction instanceof ins.UDiv)
            this.onUDiv(instruction);
        else if (instruction instanceof ins.SDiv)
            this.onSDiv(instruction);
        else if (instruction instanceof ins.URem)
            this.onURem(instruction);
        else if (instruction instanceof ins.SRem)
            this.onSRem(instruction);
        else if (instruction instanceof ins.And)
            this.onAnd(instruction);
        else if (instruction instanceof ins.Or)
            this.onOr(instruction);
        else if (instruction instanceof ins.Xor)
            this.onXor(instruction);
        else if (instruction instanceof ins.Ret)
            this.onRet(instruction);
        else if (instruction instanceof ins.Cmp)
            return this.onCmp(instruction);
        else if (instruction instanceof ins.Label)
            return this.onLabel(instruction);
        else if (instruction instanceof ins.Br)
            return this.onBr(instruction);
        else if (instruction instanceof ins.Jmp)
            return this.onJmp(instruction);
        else if (instruction instanceof ins.Asm)
            return this.onAsm(instruction);
        else
            console.log("Do not know how to translate instruction of type " + instruction.constructor.name + ".");
    };
    BasicFunctionGodegen.prototype.assignVariableLocations = function () {
        for (var _i = 0, _a = this.func.args; _i < _a.length; _i++) {
            var arg = _a[_i];
            var location = this.ar.allocateArgument(arg);
            arg.setLocation(location);
        }
        for (var varname in this.func.vars.map) {
            var op = this.func.vars.get(varname);
            if (!(op.location instanceof codegen_1.LocationPhysical)) {
                var location = this.ar.allocateLocalVar(op);
                op.setLocation(location);
            }
        }
        if (this.ar.stack.length) {
            this.mc._('sub', [operand_1.rsp, this.ar.stack.length * codegen_1.WORDSIZE]);
        }
    };
    BasicFunctionGodegen.prototype.createLabelObjects = function () {
        var curr = this.func.block.start;
        while (curr) {
            if (curr instanceof ins.Label) {
                var op1 = curr.op1;
                var lbl = this.mc.lbl(op1.getName());
                op1.native = lbl;
            }
            curr = curr.next;
        }
    };
    BasicFunctionGodegen.prototype.enforceRetAsLastInstruction = function () {
        if (!(this.func.block.end instanceof ins.Ret)) {
            this.onRet(new ins.Ret);
        }
    };
    BasicFunctionGodegen.prototype.translate = function () {
        this.label = this.mc.label(this.func.getName());
        this.ar.emitEpilogue(this.mc);
        this.assignVariableLocations();
        this.createLabelObjects();
        var curr = this.func.block.start;
        while (curr) {
            this.translateInstruction(curr);
            curr = curr.next;
        }
        this.enforceRetAsLastInstruction();
    };
    return BasicFunctionGodegen;
}());
exports.BasicFunctionGodegen = BasicFunctionGodegen;
var BasicUnitCodegen = (function () {
    function BasicUnitCodegen(unit) {
        this.mc = new code_1.Code;
        this.unit = unit;
    }
    BasicUnitCodegen.prototype.translate = function () {
        for (var _i = 0, _a = this.unit.functions; _i < _a.length; _i++) {
            var func = _a[_i];
            var funcGenerator = new BasicFunctionGodegen(this, func);
            funcGenerator.translate();
        }
    };
    return BasicUnitCodegen;
}());
exports.BasicUnitCodegen = BasicUnitCodegen;

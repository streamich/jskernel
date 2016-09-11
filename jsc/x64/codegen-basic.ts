import {
    CallingConventionC, CallingConvention, LocationStack, WORDSIZE,
    ActivationRecordC, LocationPhysical, LocationRegister
} from "./codegen";
import * as irop from '../ir/operand';
import * as ins from '../ir/ins';
import * as tac from '../ir/ir';
import {Code} from '../../ass-js/x86/x64/code';
import {createProbe as createAsmProbe} from '../../ass-js/x86/probe';
import {rax, rbx, rdx, rcx, rbp, rsp, rdi, rsi, r8, r9, r10, r11, r12, r13, r14, r15, Register} from '../../ass-js/x86/operand';
import {Label} from '../../ass-js/instruction';
import {CONDITION} from "../ir/ins";


const REG_ACC = rax;
const REG_TMP = rdx;
const REG_REMAINDER = rdx;
const REG_SHIFT = rcx;


export class BasicFunctionGodegen {
    ar: ActivationRecordC;
    codegen: BasicUnitCodegen;
    mc: Code;
    func: tac.Function;

    label: Label = null;

    constructor(codegen: BasicUnitCodegen, func: tac.Function, ar: ActivationRecordC = new ActivationRecordC) {
        this.codegen = codegen;
        this.mc = codegen.mc;
        this.func = func;
        this.ar = ar;
    }

    load(operand: irop.Operand, into: Register) {
        if(operand instanceof irop.OperandVariable) {
            var location = operand.location;
            if(location instanceof LocationStack) {

                var size = operand.type.size;
                if(size === 1) {
                    size = 8;
                }

                var disp = location.offset;
                this.mc._('mov', [into.getRegisterSized(size), rbp.disp(disp)]);
            } else if(location instanceof LocationRegister) {
                this.mc._('mov', [into, location.register]);
            } else
                throw Error(`Do not know how to load variable "${operand.toString()}".`);

        } else if(operand instanceof irop.OperandConst) {
            this.mc._('mov', [into, operand.value]);
        } else
            throw Error(`Do not know how to load operand of type ${(operand.constructor as any).name}.`);
    }

    loadIfNotRegister(operand: irop.Operand, into: Register): Register {
        if((operand instanceof irop.OperandVariable) && (operand.location instanceof LocationRegister)) {
            return (operand.location as LocationRegister).register;
        } else {
            this.load(operand, into);
            return into;
        }
    }

    protected storeToLocation(operand: irop.OperandVariable, what: Register|irop.Operand) {
        var loc = operand.location;

        var size = operand.type.size;
        if(size === 1) {
            size = 8;
        }

        if(loc instanceof LocationRegister) {
            var to_reg = (loc as LocationRegister).register;

            if(what instanceof Register) {
                this.mc._('mov', [to_reg, what]);
            } else if(what instanceof irop.OperandConst) {
                this.mc._('mov', [to_reg, what.value])
            } else if(what instanceof irop.OperandVariable) {
                if(what.location instanceof LocationRegister) {
                    var from_reg = (what.location as LocationRegister).register;
                    this.mc._('mov', [to_reg, from_reg]);
                } else if(what.location instanceof LocationStack) {
                    var disp = (what.location as LocationStack).offset;
                    this.mc._('mov', [to_reg, rbp.disp(disp)]);
                } else
                    throw Error(`Unexpected store r-value.`);
            } else
                throw Error(`Unexpected store r-value.`);
        } else if(loc instanceof LocationStack) {
            var disp = (loc as LocationStack).offset;
            var mem = rbp.disp(disp);

            if(what instanceof Register) {
                this.mc._('mov', [mem, what.getRegisterSized(size)]);
            } else if(what instanceof irop.OperandConst) {
                this.mc._('mov', [mem, what.value], size)
            } else if(what instanceof irop.OperandVariable) {
                if(what.location instanceof LocationRegister) {
                    var from_reg = (what.location as LocationRegister).register;
                    this.mc._('mov', [mem, from_reg.getRegisterSized(size)]);
                } else if(what.location instanceof LocationStack) {
                    this.load(what, REG_ACC);
                    this.mc._('mov', [mem, REG_ACC.getRegisterSized(size)]);
                } else
                    throw Error(`Unexpected store r-value.`);
            } else
                throw Error(`Unexpected store r-value.`);
        } else
            throw Error('Store location must be an l-value.');
    }

    store(operand: irop.Operand, what: Register|irop.Operand) {
        if(operand instanceof irop.OperandVariable) {
            this.storeToLocation(operand, what);
        } else
            throw Error(`Store location must be an l-value`);
    }

    protected conditionToJumpMnemonic(cond: CONDITION) {
        switch(cond) {
            case CONDITION.EQ:  return 'je';
            case CONDITION.NE:  return 'jne';

            case CONDITION.UGT: return 'ja';
            case CONDITION.UGE: return 'jae';
            case CONDITION.ULT: return 'jb';
            case CONDITION.ULE: return 'jbe';

            case CONDITION.SGT: return 'jg';
            case CONDITION.SGE: return 'jge';
            case CONDITION.SLT: return 'jl';
            case CONDITION.SLE: return 'jle';

            default:
                throw Error('Unsupported branch condition.');
        }
    }

    onCmp(instruction: ins.Cmp) {
        var reg_op2 = this.loadIfNotRegister(instruction.op2, REG_ACC);
        var reg_op3 = this.loadIfNotRegister(instruction.op3, REG_TMP);
        this.mc._('cmp', [reg_op2, reg_op3]);

        var lblTrue = this.mc.lbl();
        // var lblFalse = this.mc.lbl();
        var lblContinue = this.mc.lbl();

        var mnemonic = this.conditionToJumpMnemonic(instruction.condition);
        this.mc._(mnemonic, lblTrue);

        // this.mc.insert(lblFalse);
        this.store(instruction.op1, new irop.OperandConst(instruction.op1.type, 0));
        this.mc._('jmp', lblContinue);

        this.mc.insert(lblTrue);
        this.store(instruction.op1, new irop.OperandConst(instruction.op1.type, 1));

        this.mc.insert(lblContinue);
    }

    onLabel(instruction: ins.Label) {
        this.mc.insert((instruction.op1 as irop.OperandLabel).native);
    }

    onBr(instruction: ins.Br) {
        this.load(instruction.op1, REG_ACC);
        this.mc._('cmp', [REG_ACC, 0]);

        var lblFalse = (instruction.op3 as irop.OperandLabel).native;
        var lblTrue = (instruction.op2 as irop.OperandLabel).native;
        this.mc._('jne', lblTrue);
        this.mc._('jmp', lblFalse);
    }

    onJmp(instruction: ins.Br) {
        var lbl = (instruction.op1 as irop.OperandLabel).native;
        this.mc._('jmp', lbl);
    }

    onAdd(instruction: ins.Add) {
        this.load(instruction.op2, REG_ACC);
        if(instruction.op3 instanceof irop.OperandConst) {
            this.mc._('add', [REG_ACC, (instruction.op3 as irop.OperandConst).value]);
        } else {
            this.load(instruction.op3, REG_TMP);
            this.mc._('add', [REG_ACC, REG_TMP]);
        }
        this.store(instruction.op1, REG_ACC);
    }

    onSub(instruction: ins.Add) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('sub', [REG_ACC, REG_TMP]);
        this.store(instruction.op1, REG_ACC);
    }

    onMul(instruction: ins.Add) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('mul', [REG_TMP]);
        this.store(instruction.op1, REG_ACC);
    }

    onUDiv(instruction: ins.Add) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('div', [REG_TMP]);
        this.store(instruction.op1, REG_ACC);
    }

    onSDiv(instruction: ins.Add) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('idiv', [REG_TMP]);
        this.store(instruction.op1, REG_ACC);
    }

    onURem(instruction: ins.Add) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('div', [REG_TMP]);
        this.store(instruction.op1, REG_REMAINDER);
    }

    onSRem(instruction: ins.Add) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('idiv', [REG_TMP]);
        this.store(instruction.op1, REG_REMAINDER);
    }

    // onShl(instruction: ins.Add) {
    //     this.load(instruction.op2, REG_ACC);
    //     this.load(instruction.op3, REG_SHIFT);
    //     this.mc._('shl', [REG_ACC, REG_SHIFT]);
    //     this.store(instruction.op1, REG_ACC);
    // }

    // onAShr(instruction: ins.Add) {
    //     this.load(instruction.op2, REG_ACC);
    //     this.load(instruction.op3, REG_SHIFT);
    //     this.mc._('sar', [REG_ACC, REG_SHIFT]);
    //     this.store(instruction.op1, REG_ACC);
    // }

    // onLShr(instruction: ins.Add) {
    //     this.load(instruction.op2, REG_ACC);
    //     this.load(instruction.op3, REG_SHIFT);
    //     this.mc._('shr', [REG_ACC, REG_SHIFT]);
    //     this.store(instruction.op1, REG_ACC);
    // }

    onAnd(instruction: ins.And) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('and', [REG_ACC, REG_TMP]);
        this.store(instruction.op1, REG_ACC);
    }

    onOr(instruction: ins.And) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('or', [REG_ACC, REG_TMP]);
        this.store(instruction.op1, REG_ACC);
    }

    onXor(instruction: ins.And) {
        this.load(instruction.op2, REG_ACC);
        this.load(instruction.op3, REG_TMP);
        this.mc._('xor', [REG_ACC, REG_TMP]);
        this.store(instruction.op1, REG_ACC);
    }

    onRet(instruction: ins.Ret) {
        if(instruction.op1) {
            this.load(instruction.op1, this.ar.cc.returnRegister);
        }
        this.ar.emitPrologue(this.mc);
    }

    onAssign(instruction: ins.Assign) {
        this.store(instruction.op1, instruction.op2);
    }

    onAsm(asm: ins.Asm) {
        var probe = createAsmProbe(this.mc);
        asm.tpl(probe);
    }

    translateInstruction(instruction: ins.Instruction) {
        if(instruction instanceof ins.Assign)       this.onAssign(instruction);

        else if(instruction instanceof ins.Add)     this.onAdd(instruction);
        else if(instruction instanceof ins.Sub)     this.onSub(instruction);
        else if(instruction instanceof ins.Mul)     this.onMul(instruction);
        else if(instruction instanceof ins.UDiv)    this.onUDiv(instruction);
        else if(instruction instanceof ins.SDiv)    this.onSDiv(instruction);
        else if(instruction instanceof ins.URem)    this.onURem(instruction);
        else if(instruction instanceof ins.SRem)    this.onSRem(instruction);
        // else if(instruction instanceof ins.Shl)     this.onShl(instruction);
        // else if(instruction instanceof ins.AShr)    this.onAShr(instruction);
        // else if(instruction instanceof ins.LShr)    this.onLShr(instruction);
        else if(instruction instanceof ins.And)     this.onAnd(instruction);
        else if(instruction instanceof ins.Or)      this.onOr(instruction);
        else if(instruction instanceof ins.Xor)     this.onXor(instruction);

        else if(instruction instanceof ins.Ret)     this.onRet(instruction);
        else if(instruction instanceof ins.Cmp)     return this.onCmp(instruction);
        else if(instruction instanceof ins.Label)   return this.onLabel(instruction);
        else if(instruction instanceof ins.Br)      return this.onBr(instruction);
        else if(instruction instanceof ins.Jmp)     return this.onJmp(instruction);
        else if(instruction instanceof ins.Asm)     return this.onAsm(instruction);
        else
            // throw Error(`Do not know how to translate instruction of type ${(ins.constructor as any).name}.`);
            console.log(`Do not know how to translate instruction of type ${(instruction.constructor as any).name}.`);
    }

    protected assignVariableLocations() {
        for(var arg of this.func.args) {
            var location = this.ar.allocateArgument(arg);
            arg.setLocation(location);
        }

        for(var varname in this.func.vars.map) {
            var op = this.func.vars.get(varname);
            if(!(op.location instanceof LocationPhysical)) {
                var location = this.ar.allocateLocalVar(op);
                op.setLocation(location);
            }
        }

        if(this.ar.stack.length) {
            this.mc._('sub', [rsp, this.ar.stack.length * WORDSIZE]);
        }
    }

    protected createLabelObjects() {
        var curr = this.func.block.start;
        while(curr) {
            if(curr instanceof ins.Label) {
                var op1 = curr.op1 as irop.OperandLabel;
                var lbl = this.mc.lbl(op1.getName());
                op1.native = lbl;
            }
            curr = curr.next;
        }
    }

    protected enforceRetAsLastInstruction() {
        if(!(this.func.block.end instanceof ins.Ret)) {
            this.onRet(new ins.Ret);
        }
    }

    translate() {
        this.label = this.mc.label(this.func.getName());
        this.ar.emitEpilogue(this.mc);

        this.assignVariableLocations();

        this.createLabelObjects();

        var curr = this.func.block.start;
        while(curr) {
            this.translateInstruction(curr);
            curr = curr.next;
        }

        this.enforceRetAsLastInstruction();
    }
}


// Very basic code generator.
//
//  1. Does not allocate registers or try to spare registers for storage.
//  2. Stores all data on stack.
//  3. For each instruction read data from memory.
export class BasicUnitCodegen {
    mc: Code = new Code;
    unit: tac.Unit;

    constructor(unit: tac.Unit) {
        this.unit = unit;
    }

    translate() {
        for(var func of this.unit.functions) {
            var funcGenerator = new BasicFunctionGodegen(this, func);
            funcGenerator.translate();
        }
    }
}

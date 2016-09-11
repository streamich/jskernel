import * as irop from '../ir/operand';
import * as irtype from '../ir/type';
import {Code} from '../../ass-js/x86/x64/code';
import {rax, rbx, rdx, rcx, rbp, rsp, rdi, rsi, r8, r9, r10, r11, r12, r13, r14, r15, Register} from '../../ass-js/x86/operand';
import {Location} from "../ir/operand";


export const WORDSIZE = 8;


export class RegisterInfo {

}


export class VirtualRegisterToRegister {

}


export class LocationPhysical extends Location {

}


export class LocationRegister extends LocationPhysical {
    register: Register;

    constructor(register: Register) {
        super();
        this.register = register;
    }

    toString() {
        return this.register.toString();
    }
}


export class LocationStack extends LocationPhysical {
    // Offset as provided in displacement from base pointer.
    offset: number;

    constructor(offset: number) {
        super();
        this.offset = offset;
    }

    toString() {
        return '[rbp' + this.offset + ']';
    }
}


export class RegisterFile {
    registerize() {

    }
}


export class Stack {
    length: number = 0;
    slotLength: number = 0;

    argLength: number = 0;

    allocate(variable: irop.OperandVariable) {
        this.length++;
        var slots = Math.ceil((variable.type.size / 8) / WORDSIZE);
        this.slotLength += slots;
        var location = new LocationStack(-this.slotLength * WORDSIZE);
        return location;
    }

    allocateArgument(index: number, type: irtype.Type = null) {
        this.argLength++;
        return new LocationStack((this.argLength + 1) * WORDSIZE);
    }
}


export abstract class CallingConvention {
    stackAlignment = 0; // In bytes.
    returnRegister = rax;
}


// See standard:
// https://uclibc.org/docs/psABI-x86_64.pdf
export class CallingConventionC extends CallingConvention {
    // scratchRegisters: Register[] = [rbx, rbp, r12, r13, r14, r15];
    // scratchRegisters: Register[] = [r12, r13, r14, r15];
    scratchRegisters: Register[]    = [];

    argumentRegisters: Register[]   = [rdi, rsi, rdx, rcx, r8, r9];

    // callerRegisters: Register[]     = [rbx, rbp, r12, r13, r14, r15];
    callerRegisters: Register[]     = [rbx, r12, r13, r14, r15];
    calleeRegisters: Register[]     = [rax, rcx, rdx, rdi, rsi, r8, r9, r10, r11];
    stackPointer: Register          = rsp;
    basePointer: Register           = rbp;
    returnRegister: Register        = rax;
}


export abstract class ActivationRecord {
    cc: CallingConvention;
    regs: RegisterFile = new RegisterFile;
    stack: Stack = new Stack;

    storeArgument(index: number, operand: irop.Operand) {

    }

    // TODO: Handle structs/arrays passed by value.
    abstract allocateArgument(arg: irop.OperandVariable);
}


export class ActivationRecordC extends ActivationRecord {
    cc: CallingConventionC = new CallingConventionC;
    regs: RegisterFile = new RegisterFile;
    stack: Stack = new Stack;

    availableRegisters: Register[] = [];

    argLength = 0;
    argBytes = 0;

    varLength = 0;
    varBytes = 0;

    emitEpilogue(_: Code) {
        _._('push', rbp);
        _._('mov', [rbp, rsp]);
    }

    emitPrologue(_: Code) {
        _._('mov', [rsp, rbp]);
        _._('pop', rbp);
        _._('ret');
    }

    storeArgument(index: number, operand: irop.Operand) {

    }

    allocateLocalVar(variable: irop.OperandVariable): Location {
        var varRegisters = this.availableRegisters;
        var location: Location;

        if(this.varLength >= varRegisters.length) {
            location = this.stack.allocate(variable);
        } else {
            location = new LocationRegister(varRegisters[this.varLength]);
        }

        this.varLength++;
        // this.varBytes += variable.

        return location;
    }

    // TODO: Handle structs/arrays passed by value.
    allocateArgument(arg: irop.OperandVariable): Location {
        var argRegisters = this.cc.argumentRegisters;
        var location: Location;

        if(this.argLength >= argRegisters.length) {
            location = this.stack.allocateArgument(this.argLength - argRegisters.length);
        } else {
            location = new LocationRegister(argRegisters[this.argLength]);
        }

        this.argLength++;
        this.argBytes += WORDSIZE;
        return location;
    }
}


export class LiveSet {
    ops: irop.OperandVariable[] = [];
}

export class Liveliness {

}

export class RegisterInterferenceGraph {

}

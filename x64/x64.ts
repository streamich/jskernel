import * as code from './code';
import * as o from './operand';
import {Definition, IDefinition} from './def';
import * as i from './instruction';
import * as p from './parts';
import {extend} from './util';
import {OP, OPREG} from './opcode';


export namespace x64 {

    const defDefaults: IDefinition = {
        size: 32,
        addrSize: 64,
    };

    function insdef(defs: IDefinition) {
        return new Definition(extend<IDefinition>({}, defDefaults, defs));
    }

    const INC = insdef({op: OP.INC, opreg: OPREG.INC});
    const DEC = insdef({op: OP.DEC, opreg: OPREG.DEC});
    const INT = insdef({op: OP.INT, hasImmediate: true});
    const SYSCALL = insdef({op: OP.SYSCALL});
    const SYSENTER = insdef({op: OP.SYSENTER});
    const SYSEXIT = insdef({op: OP.SYSEXIT});


    export class Instruction extends i.Instruction {

        prefixRex: p.PrefixRex = null;

        protected writePrefixes(arr: number[]) {
            super.writePrefixes(arr);
            if(this.prefixRex) this.prefixRex.write(arr);
        }

        protected needsOperandSizeChange() {
            return (this.def.size == o.SIZE.DOUBLE) && this.hasRegisterOfSize(o.SIZE.QUAD);
        }

        protected createPrefixes() {
            super.createPrefixes();
            if(this.def.mandatoryRex || this.needsOperandSizeChange() || this.hasExtendedRegister())
                this.prefixRex = this.createRex();
        }

        protected createRex(): p.PrefixRex {
            var W = 0, R = 0, X = 0, B = 0;

            if(this.needsOperandSizeChange()) W = 1;

            var {dst, src} = this.op;
            if(dst && dst.reg() && (dst.reg() as o.Register).isExtended()) R = 1;
            if(src && src.reg() && (src.reg() as o.Register).isExtended()) B = 1;

            var mem: o.Memory = this.getMemoryOperand();
            if(mem) {
                if(mem.base && mem.base.isExtended()) B = 1;
                if(mem.index && mem.index.isExtended()) X = 1;
            }

            // if(!this.regToRegDirectionRegIsDst) [R, B] = [B, R];
            return new p.PrefixRex(W, R, X, B);
        }

        // Adding RIP-relative addressing in long mode.
        //
        // > In the 64-bit mode, any instruction that uses ModRM addressing can use RIP-relative addressing.
        //
        // > Without RIP-relative addressing, ModRM instructions address memory relative to zero. With RIP-relative
        // > addressing, ModRM instructions can address memory relative to the 64-bit RIP using a signed
        // > 32-bit displacement.
        protected createModrm() {
            var mem: o.Memory = this.getMemoryOperand();
            if(mem && mem.base && (mem.base === o.rip)) {
                var disp = mem.displacement;
                if(!disp)
                    throw TypeError('RIP-relative addressing requires 4-byte displacement.');
                if(mem.index || mem.scale)
                    throw TypeError('RIP-relative addressing does not support index and scale addressing.');

                if(disp.size < o.SIZE.DOUBLE) disp.zeroExtend(o.SIZE.DOUBLE);


            } else super.createModrm();
        }

        // Adding RIP-relative addressing in long mode.
        protected sibNeeded() {
            // RIP-relative addressing overwrites this case, uses it without SIB byte to specify RIP + disp32.
            if((this.modrm.mod === p.Modrm.MOD.INDIRECT) && (this.modrm.rm === p.Modrm.RM_INDIRECT_SIB))
                return false;
            return super.sibNeeded();
        }
    }

    export class Code extends code.Code {
        protected ClassInstruction = Instruction;

        incq(dst: o.Register|o.Memory|number) {
            return this.insOneOperand(INC, dst);
        }

        decq(dst: o.Register|o.Memory|number) {
            return this.insOneOperand(DEC, dst);
        }

        int(num: number) {
            if(typeof num !== 'number')
                throw TypeError('INT argument must be of type number.');
            return this.insImmediate(INT, num, false);
        }

        syscall() {
            return this.insZeroOperands(SYSCALL);
        }

        sysenter() {
            return this.insZeroOperands(SYSENTER);
        }

        sysexit() {
            return this.insZeroOperands(SYSEXIT);
        }
    }


    // Generates logically equivalent code to `Instruction` but the actual
    // bytes of the machine code will likely differ, because `FuzzyInstruction`
    // picks at random one of the possible instructions when multiple instructions
    // can perform the same operation. Here are some examples:
    //
    //  - Bits in `REX` prefix are ignored if they don't have an effect on the instruction.
    //  - Register-to-register `MOV` instruction can be encoded in two different ways.
    //  - Up to four prefixes may be added to instruction, if they are not used, they are ignored.
    //  - There can be many different *no-op* instruction that are used to fill in padding, for example:
    //
    //     mov %rax, %rax
    //     add $0, %rax
    export class FuzzyInstruction extends Instruction {
        protected regToRegDirectionRegIsDst = !(Math.random() > 0.5);

        protected oneOrZero(): number {
            return Math.random() > 0.5 ? 1 : 0;
        }

        // Randomize unused bits in REX byte.
        protected createRex() {
            var rex: p.PrefixRex = super.createRex();
            var {dst, src} = this.op;
            if(!dst && !src) {
                rex.X = this.oneOrZero();
                if(!src) rex.B = this.oneOrZero();
            }
            return rex;
        }
    }

    export class FuzzyCode extends Code {
        protected ClassInstruction = FuzzyInstruction;

        nop(size = 1) {

        }
    }

}

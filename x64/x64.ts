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
    const MOV = insdef({op: OP.MOV, opDirectionBit: true});
    const INT = insdef({op: OP.INT, hasImmediate: true, size: 64});
    const SYSCALL = insdef({op: OP.SYSCALL, size: 64});
    const SYSENTER = insdef({op: OP.SYSENTER, size: 64});
    const SYSEXIT = insdef({op: OP.SYSEXIT, size: 64});


    export class Instruction extends i.Instruction {

        prefixRex: p.PrefixRex = null;

        operandSize = o.SIZE.QUAD;

        getOperandSize() {
            return this.operandSize;
        }

        protected writePrefixes(arr: number[]) {
            super.writePrefixes(arr);
            if(this.prefixRex) this.prefixRex.write(arr);
        }

        protected needsOperandSizeChange() {
            return (this.def.size === o.SIZE.DOUBLE) && (this.getOperandSize() === o.SIZE.QUAD);
        }

        protected createPrefixes() {
            super.createPrefixes();
            if(this.def.needsRex || this.needsOperandSizeChange() || this.hasExtendedRegister())
                this.prefixRex = this.createRex();
        }

        protected createRex(): p.PrefixRex {
            var W = 0, R = 0, X = 0, B = 0;

            if(this.needsOperandSizeChange()) W = 1;

            var {dst, src} = this.op;

            if((dst instanceof o.Register) && (src instanceof o.Register)) {
                if((dst as o.Register).isExtended()) R = 1;
                if((src as o.Register).isExtended()) B = 1;
            } else {

                var r: o.Register = this.op.getRegisterOperand();
                var mem: o.Memory = this.op.getMemoryOperand();

                if(r) {
                    if(r.isExtended())
                        if(mem) R = 1;
                        else    B = 1;
                }

                if(mem) {
                    if(mem.base && mem.base.isExtended()) B = 1;
                    if(mem.index && mem.index.isExtended()) X = 1;
                }
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
            var mem: o.Memory = this.op.getMemoryOperand();
            if(mem && mem.base && (mem.base instanceof o.RegisterRip)) {
                if(mem.index || mem.scale)
                    throw TypeError('RIP-relative addressing does not support index and scale addressing.');

                var disp = mem.displacement;
                if(!disp)
                    throw TypeError('RIP-relative addressing requires 4-byte displacement.');
                if(disp.size < o.SIZE.DOUBLE) // Maybe this should go to `.createDisplacement()`?
                    disp.zeroExtend(o.SIZE.DOUBLE);

                // Encode `Modrm.reg` field.
                var reg = 0;
                if(this.def.opreg > -1) {
                    reg = this.def.opreg;
                } else {
                    var r: o.Register = this.op.getRegisterOperand();
                    if (r) reg = r.get3bitId();
                }

                this.modrm = new p.Modrm(p.Modrm.MOD.INDIRECT, reg, p.Modrm.RM.INDIRECT_DISP);

            } else super.createModrm();
        }
    }

    export class Code extends code.Code {
        protected ClassInstruction = Instruction;

        incq(dst: code.TOperand) {
            return this.insOneOperand(INC, dst);
        }

        decq(dst: code.TOperand) {
            return this.insOneOperand(DEC, dst);
        }
        
        movq(dst: code.TOperand, src: code.TOperand) {
            return this.insTwoOperands(MOV, dst, src);
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

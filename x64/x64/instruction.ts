import * as o from '../x86/operand';
import * as i from '../x86/instruction';
import * as p from '../x86/parts';


export class Instruction extends i.Instruction {

    prefixRex: p.PrefixRex = null;

    operandSize = o.SIZE.DOUBLE;

    getOperandSize() {
        return this.operandSize;
    }

    protected writePrefixes(arr: number[]) {
        super.writePrefixes(arr);
        if(this.prefixRex) this.prefixRex.write(arr);
    }

    protected needs32To64OperandSizeChange() {
        // Default operand size in x64 mode is 32 bits.
        return this.def.operandSize === o.SIZE.QUAD;
    }

    protected createPrefixes() {
        super.createPrefixes();
        if(this.def.mandatoryRex ||
            (this.op.hasRegisterOrMemory() && (this.needs32To64OperandSizeChange() || this.hasExtendedRegister()))
        )
            this.createRex();
    }

    protected createRex() {
        var W = 0, R = 0, X = 0, B = 0;

        if(this.needs32To64OperandSizeChange()) W = 1;

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

        this.prefixRex = new p.PrefixRex(W, R, X, B);
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

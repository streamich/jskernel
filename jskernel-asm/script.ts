


export class Script {

    bytes = [];

    eax = 0;
    ecx = 1;

    add(src, dst): this {
        this.bytes.push(1); // Adding 32bit values.
        if((src == this.eax) && (dst == this.ecx)) {
            // 11000001
            // 11 - register
            // 000 - eax
            // 001 - ecx
            this.bytes.push(0xC1);
        }
        return this;
    }

    mov(src, dst): this {

        return this;
    }

    jmp(): this {

        return this;
    }

    int(val): this {

        return this;
    }

    system(): this {
        return this.int(80);
    }

}




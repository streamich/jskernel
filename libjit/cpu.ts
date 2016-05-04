

export class DataBuffer {
    length = 0; // Size in bytes.
}

export class Register64DataBuffer extends DataBuffer {
    length = 8;
}

export class MemoryDataBuffer extends DataBuffer {

}

export class Pointer {

}

export class IndexPointer extends Pointer {
    buffer: DataBuffer;
    factor = 1; // One element size in bytes.
}

export class MemoryPointer extends IndexPointer {

}

export class SlicePointer extends Pointer {
    buffer: DataBuffer;
    offset: number = 0;
    length: number = 0;

    constructor(buf: DataBuffer, offset = 0, length = buf.length) {
        super();
        this.buffer = buf;
        this.offset = offset;
        this.length = length;
    }
}



var dr1 = new Register64DataBuffer();
var rax = new SlicePointer(dr1, 0, 8);
var eax = new SlicePointer(dr1, 4, 4);
var al = new SlicePointer(dr1, 6, 2);


export class Cpu {
    pointers = {};
}


export class Cpu86 {

    p = {
        PC: new SlicePointer(new Register64DataBuffer(), 0, 8),
        RAX: new SlicePointer(dr1, 0, 8),
        EAX: new SlicePointer(dr1, 4, 4),
    };

    constructor() {

    }
}




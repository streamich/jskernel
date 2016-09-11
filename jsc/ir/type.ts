
export class Type {

    static int(size = 64) {
        var type = new TypeInteger(size);
        return type;
    }

    size: number = 0; // In bits

    toString() {
        return '<untyped>';
    }
}

export class TypeInteger extends Type {
    // isSigned = true;
    // isInteger = true;

    constructor(size: number) {
        super();
        this.size = size;
    }

    toString() {
        // return '<i' + this.size + '>';
        return 'i' + this.size;
        // return '<' + (this.isInteger ? 'i' : '') + (this.isSigned ? '' : 'u') + this.size + '>';
    }
}


// export class TypeBool extends TypeInteger {
//     constructor() {
//         super(1);
//     }
// }


export class TypeVoid extends Type {
    toString() {
        return 'void';
    }
}


export class TypePointer extends Type {
    base: Type;

    constructor(baseType: Type) {
        super();
        this.base = baseType;
    }

    toString() {
        return '[' + this.base.toString() + ']';
    }
}


export class TypeLabel extends Type {
    toString() {
        // return '<label>';
        return 'label';
    }
}


export class TypeAggregate extends Type {

}


export class TypeArray extends TypeAggregate {

}


export const t = {
    'void': new TypeVoid,
    label: new TypeLabel,
    i1: Type.int(1),
    i8: Type.int(8),
    i32: Type.int(32),
    i64: Type.int(64),

    i: (size: number) => {
        var prop = 'i' + size;
        if(!t[prop]) {
            t[prop] = Type.int(size);
        }
        return t[prop];
    },

    ptr: function() {

    }
};

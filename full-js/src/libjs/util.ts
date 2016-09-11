
export function extend<T> (obj1: T, obj2: T, ...objs: T[]): T {
    if(typeof obj2 === 'object') for(var i in obj2) obj1[i] = obj2[i];

    if(objs.length) return extend.apply(null, [obj1, ...objs]);
    else return obj1;
}

export function noop() {}


export type Toffset = number;
export type Tmethod = (Toffset) => number;
export type TStructDefinition = {[s: string]: [Toffset, Tmethod]};
export type TStructParsed = {[s: string]: number};
export function parseStruct(buf: Buffer, definition): any {
    var result: any = {};
    for(var prop in definition) {
        var [offset, method] = definition[prop];
        result[prop] = method.call(buf, offset);
    }
    return result;
}

"use strict";
function extend(obj1, obj2) {
    var objs = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        objs[_i - 2] = arguments[_i];
    }
    if (typeof obj2 === 'object')
        for (var i in obj2)
            obj1[i] = obj2[i];
    if (objs.length)
        return extend.apply(null, [obj1].concat(objs));
    else
        return obj1;
}
exports.extend = extend;
function noop() { }
exports.noop = noop;

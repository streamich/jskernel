"use strict";
var util_1 = require('./util');
exports.definitionDefaults = {
    name: '',
    op: 0,
    opDirectionBit: false,
    opreg: -1,
    regInOp: false,
    operands: 0,
    hasImmediate: false,
    immediateSizes: [],
    needsRex: false,
    size: 32,
    addrSize: 64,
    maxDisplacementSize: 32,
};
var Definition = (function () {
    function Definition(defs) {
        util_1.extend(this, exports.definitionDefaults, defs);
    }
    return Definition;
}());
exports.Definition = Definition;

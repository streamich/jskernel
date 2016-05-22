"use strict";
var util_1 = require('./util');
exports.definitionDefaults = {
    op: 0,
    opreg: -1,
    regInOp: false,
    operands: 0,
    hasImmediate: false,
    immediateSizes: [],
    mandatoryRex: false,
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

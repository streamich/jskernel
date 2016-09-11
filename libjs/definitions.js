"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
__export(require('./platforms/linux_x86_64'));
var defs = require('./platforms/linux_x86_64');
exports.arch = defs.arch;
exports.isLE = defs.isLE;
exports.SYS = defs.SYS;
// export var types = defs.types;

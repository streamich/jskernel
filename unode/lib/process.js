"use strict";
var libjs = require('../node_modules/libjs/libjs');
function getgid() {
    return libjs.getgid();
}
exports.getgid = getgid;

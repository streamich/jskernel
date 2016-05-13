"use strict";
// import * as libjs from '../node_modules/libjs/libjs'
var libjs = require('../../libjs/libjs');
function getgid() {
    return libjs.getgid();
}
exports.getgid = getgid;
function cwd() {
    try {
        return libjs.getcwd();
    }
    catch (e) {
        return '.';
    }
}
exports.cwd = cwd;

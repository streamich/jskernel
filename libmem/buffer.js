"use strict";
// Similar to `ArrayBuffer`, but its contents can be accessed by other threads.
var SharedArrayBuffer = (function () {
    function SharedArrayBuffer() {
    }
    return SharedArrayBuffer;
}());
exports.SharedArrayBuffer = SharedArrayBuffer;
// Similar to `ArrayBuffer`, but its contents can be run as machine code.
var ExecutableArrayBuffer = (function () {
    function ExecutableArrayBuffer() {
    }
    ExecutableArrayBuffer.prototype.exec = function () {
    };
    return ExecutableArrayBuffer;
}());
exports.ExecutableArrayBuffer = ExecutableArrayBuffer;

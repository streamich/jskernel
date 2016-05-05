"use strict";
// Similar to `ArrayBuffer`, but its contents can be accessed by other threads.
var SharedArrayBuffer = (function () {
    function SharedArrayBuffer() {
    }
    return SharedArrayBuffer;
}());
exports.SharedArrayBuffer = SharedArrayBuffer;
// Similar to `ArrayBuffer`, but its contents can be run as machine code.
function ExecutableArrayBuffer() {
}
exports.ExecutableArrayBuffer = ExecutableArrayBuffer;
ExecutableArrayBuffer.prototype = {
    __proto__: ArrayBuffer.prototype,
    call: function () {
    }
};

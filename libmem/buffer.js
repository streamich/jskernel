"use strict";
var libjs = require('libjs');
var ProxyArrayBuffer = (function () {
    function ProxyArrayBuffer() {
    }
    return ProxyArrayBuffer;
}());
// Similar to `ArrayBuffer`, but its contents can be accessed by other threads.
var SharedArrayBuffer = (function () {
    function SharedArrayBuffer() {
        var key = 6566;
        var shmid = libjs.shmget(key, 1024, libjs.IPC.CREAT | 438); // 438 = 0666
        // var shmid = libjs.shmget(key, 1024, libjs.IPC.CREAT);
        var addr = libjs.shmat(shmid, libjs.NULL, 0);
        var buf = sys.malloc64(addr[0], addr[1], 1024);
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

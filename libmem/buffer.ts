import * as libjs from 'libjs';


class ProxyArrayBuffer {

}

// Similar to `ArrayBuffer`, but its contents can be accessed by other threads.
export class SharedArrayBuffer {
    ab: ArrayBuffer;

    constructor() {
        var key = 6566;
        var shmid = libjs.shmget(key, 1024, libjs.IPC.CREAT | 438 ); // 438 = 0666
        // var shmid = libjs.shmget(key, 1024, libjs.IPC.CREAT);
        var addr = libjs.shmat(shmid, libjs.NULL, 0);

        var buf = sys.malloc64(addr[0], addr[1], 1024);
    }
}

// Similar to `ArrayBuffer`, but its contents can be run as machine code.
export function ExecutableArrayBuffer() {

}

ExecutableArrayBuffer.prototype = {
    __proto__: ArrayBuffer.prototype,

    call: function() {

    }
};


// Similar to `ArrayBuffer`, but its contents can be accessed by other threads.
export class SharedArrayBuffer {

}

// Similar to `ArrayBuffer`, but its contents can be run as machine code.
export function ExecutableArrayBuffer() {

}

ExecutableArrayBuffer.prototype = {
    __proto__: ArrayBuffer.prototype,

    call: function() {

    }
};

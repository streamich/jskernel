"use strict";
var static_buffer_1 = require('../lib/static-buffer');
function link(curr, next) {
    var _a = next.getAddress(), lo = _a[0], hi = _a[1];
    curr.writeInt32LE(lo, 72 /* BLOCK_SIZE */ - 8 /* INT */);
    curr.writeInt32LE(hi, 72 /* BLOCK_SIZE */ - 8 /* INT */ + 4);
}
var Asyscall = (function () {
    function Asyscall() {
        this.code = null; // Thread pool code.
        this.curr = null; // Current block.
        this.next = null; // Next block.
        // Keep old used blocks for reuse in linked list.
        // We keep them here not just for reuse, but because some sleeping
        // threads may not have yet left them. References first block in "used" queue.
        this.usedFirst = null;
        this.usedLast = null; // Last block in "used" queue.
    }
    Asyscall.prototype.build = function () {
        // var bin = require('./bin');
        // var buf = new Buffer(bin);
        // this.code = StaticBuffer.alloc(bin.length * 10, 'rwe');
        // buf.copy(this.code);
        // this.code = this.code.slice(0, bin.length);
        var bin = require('./bin');
        this.code = static_buffer_1.StaticBuffer.alloc(bin, 'rwe');
        this.curr = this.code.slice(this.code.length - 72 /* BLOCK_SIZE */);
        this.curr.writeInt32LE(0 /* UNINITIALIZED */, 0);
        this.curr.writeInt32LE(0, 4); // Number of threads left this block.
        this.next = this.newBlock();
        link(this.curr, this.next);
        this.code.call();
        // We don't need to keep the reference to the machine code.
        // So delete it and that writable and executable memory is no more available.
        // this.code = null;
    };
    Asyscall.prototype.recycleBlock = function (block) {
        // console.log(block.getAddress());
        block._id = Asyscall._id;
        Asyscall._id++;
        if (!this.usedFirst) {
            this.usedFirst = this.usedLast = block;
        }
        else {
            block._next = this.usedLast;
            this.usedLast = block;
        }
    };
    Asyscall.prototype.newBlock = function () {
        var block = this.usedFirst;
        // if(this.usedFirst) {
        //     var threadsLeft = this.usedFirst.readInt32LE(4);
        //     console.log('Threads left: ' + threadsLeft);
        // }
        if (block && (block.readInt32LE(4) === 2 /* THREADS */)) {
            // console.log('REUSING');
            // console.log('ID: ' + block._id);
            // console.log(block.getAddress());
            // if(this.usedLast === block) {
            //     this.usedFirst = this.usedLast = null;
            // } else {
            //     this.usedFirst = block._next;
            //     block._next = null;
            // }
            // console.log('freeing memory');
            this.usedFirst = block._next;
        }
        // } else {
        //     console.log('ALLOCATING NEW');
        // TODO: We should use `new StaticBuffer()` here, but we allocate
        // using `mmap` instead because for now we don't have a proper `StaticBuffer`
        // in V8.
        block = static_buffer_1.StaticBuffer.alloc(72 /* BLOCK_SIZE */, 'rw');
        // block = new StaticBuffer(CONF.BLOCK_SIZE);
        // console.log(block.getAddress());
        // block = new StaticBuffer(CONF.BLOCK_SIZE);
        // }
        block.writeInt32LE(0 /* UNINITIALIZED */, 0);
        block.writeInt32LE(0, 4); // Number of threads left this block.
        // block.print();
        return block;
    };
    Asyscall.prototype.writeArg = function (arg, slot) {
        var curr = this.curr;
        if (typeof arg === 'string') {
            var str = arg + '\0';
            arg = new static_buffer_1.StaticBuffer(str.length);
            for (var l = 0; l < str.length; l++)
                arg[l] = str.charCodeAt(l);
        }
        // TODO: Should be StaticBuffer
        if (arg instanceof Buffer) {
            arg = arg.getAddress();
        }
        if (typeof arg === 'number') {
            // This converts `number` to `[number, number]` because JavaScript numbers
            // can be up to 53-bits, but we need to write it in chunks of 4-bytes.
            // Do we need this?
            // var [lo, hi] = UInt64.toNumber64(arg);
            // curr.writeInt32LE(lo, slot * CONF.INT);
            // curr.writeInt32LE(hi, slot * CONF.INT + 4);
            curr.writeInt32LE(arg, slot * 8 /* INT */);
            curr.writeInt32LE(0, slot * 8 /* INT */ + 4);
        }
        else if (arg instanceof Array) {
            curr.writeInt32LE(arg[0], slot * 8 /* INT */);
            curr.writeInt32LE(arg[1], slot * 8 /* INT */ + 4);
        }
    };
    // Fill the current block with syscall data.
    Asyscall.prototype.fillBlock = function () {
        var _a = this, curr = _a.curr, next = _a.next;
        // Write arguments to block and find callback function.
        var callback;
        for (var j = 0; j < arguments.length; j++) {
            var arg = arguments[j];
            if (typeof arg === 'function') {
                callback = arg;
                break;
            }
            else {
                this.writeArg(arg, j + 1);
            }
        }
        // Fill the rest of the block with 0x00, except for the pointer to the next block,
        // which is already filled.
        for (var j = arguments.length; j < 7; j++) {
            curr.writeInt32LE(0, (j + 1) * 8 /* INT */);
            curr.writeInt32LE(0, (j + 1) * 8 /* INT */ + 4);
        }
        // console.log('Filled:');
        // curr.print();
        // The last thing we do, is mark this block as available for threads.
        // curr.writeInt32LE(LOCK.FREE, 0);
        curr[0] = 1 /* FREE */;
        return callback;
    };
    // Start polling the current block for results.
    Asyscall.prototype.pollBlock = function (callback, is64) {
        var _this = this;
        var curr = this.curr;
        var poll = function () {
            // This relies on little-endiannes of Linux, use block.readInt32LE(0) instead?
            // Or then refactor thread pool to use 8-bit value.
            var lock = curr[0];
            if (lock === 3 /* DONE */) {
                // console.log('Done:');
                // curr.print();
                // console.log('---------');
                if (is64) {
                    callback([
                        curr.readInt32LE(8 /* INT */ * 7),
                        curr.readInt32LE(8 /* INT */ * 7 + 4)]);
                }
                else {
                    callback(curr.readInt32LE(8 /* INT */ * 7));
                }
                _this.recycleBlock(curr);
            }
            else
                setIOPoll(poll);
        };
        setIOPoll(poll);
    };
    Asyscall.prototype.exec = function () {
        // Allocate the third block before we fill in the current block,
        // so that threads that go to the next block can see a correct
        // pointer written in it to the third block.
        var block = this.newBlock();
        link(this.next, block);
        var callback = this.fillBlock.apply(this, arguments);
        // Start polling block for results.
        this.pollBlock(callback, false);
        this.curr = this.next;
        this.next = block;
    };
    Asyscall.prototype.exec64 = function () {
        var block = this.newBlock();
        link(this.next, block);
        var callback = this.fillBlock.apply(this, arguments);
        this.pollBlock(callback, true);
        this.curr = this.next;
        this.next = block;
    };
    // Stop the thread pool. Threads automatically stop when they see `LOCK.EXIT` in
    // lock field.
    Asyscall.prototype.stop = function () {
        this.curr.writeInt32LE(4 /* EXIT */, 0);
        this.next.writeInt32LE(4 /* EXIT */, 0);
        this.code.free();
    };
    // This is a hack: we allocate a large chunk of memory so that
    // V8 does not move it around, so we imitate `StaticBuffer`. When we
    // have a proper `StaticBuffer` we don't need this function anymore.
    // protected allocatePage() {
    //     const BLOCKS = 200;
    //     var page = StaticBuffer.alloc(BLOCKS * CONF.BLOCK_SIZE, 'rw');
    //
    //     Insert first block.
    // var first = page.slice(0, CONF.BLOCK_SIZE);
    // first.writeInt32LE(CONF.THREADS, 4);
    // var prev = first;
    //
    // for(var i = 1; i < BLOCKS; i++) {
    //     var curr = page.slice(i * CONF.BLOCK_SIZE, (i + 1) * CONF.BLOCK_SIZE);
    //     curr.writeInt32LE(CONF.THREADS, 4);
    //     prev._next = curr;
    //     prev = curr;
    // }
    //
    // if(!this.usedFirst) {
    //     this.usedFirst = first;
    //     this.usedLast = curr;
    // } else {
    //     curr._next = this.usedFirst;
    //     this.usedFirst = first;
    // }
    // }
    Asyscall._id = 0;
    return Asyscall;
}());
exports.Asyscall = Asyscall;

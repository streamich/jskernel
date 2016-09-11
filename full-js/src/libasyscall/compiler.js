"use strict";
var operand_1 = require('../../node_modules/ass-js/x86/operand');
var code_1 = require('../../node_modules/ass-js/x86/x64/code');
var abi_1 = require('../../node_modules/ass-js/abi');
// Async Syscall 2 is different from the first version because it does not
// allocate a queue for syscalls but a linked lists and allocates new memory on the fly as needed.
// Create a queue where syscall parameters written to memory, threads run in the background
// and execute the syscalls and write result back to the blocks. Block format:
//
//      <---------- 32 bits ----------> <---------- 32 bits ----------->
//     +================================================================+
//     | Lock                          | Threads left                   |
//     +----------------------------------------------------------------+
//     | Syscall number                                                 |
//     +----------------------------------------------------------------+
//     | Argument 1                                                     |
//     +----------------------------------------------------------------+
//     | Argument 2                                                     |
//     +----------------------------------------------------------------+
//     | Argument 3                                                     |
//     +----------------------------------------------------------------+
//     | Argument 4                                                     |
//     +----------------------------------------------------------------+
//     | Argument 5 / Thread ID                                         |
//     +----------------------------------------------------------------+
//     | Argument 6 / Result                                            |
//     +----------------------------------------------------------------+
//     | Next block pointer                                             | ----------> Next block
//     +================================================================+
var __DEBUG__ = true;
var AsyscallCompiler = (function () {
    function AsyscallCompiler() {
        this.queue = 100;
        this.stackSize = 5 * 8 /* INT */;
        this.stacksSize = 0;
        this.blockSize = 9 * 8 /* INT */; // control INT + syscall num + 6 args + next block pointer
    }
    AsyscallCompiler.prototype.compile = function () {
        var _this = this;
        this.stacksSize = 2 /* THREADS */ * this.stackSize;
        var _ = new code_1.Code;
        var abi = new abi_1.Abi(_);
        var func_create_thread = abi.func('func_create_thread', false, [operand_1.rax, operand_1.rsi, operand_1.rcx, operand_1.rdx]);
        var func_thread = abi.func('func_thread');
        var lbl_stacks = _.lbl('stacks');
        var lbl_first_block = _.lbl('first_block');
        // main()
        for (var j = 1; j <= 2 /* THREADS */; j++) {
            abi.call(func_create_thread, [j], []);
        }
        _._('ret');
        func_create_thread._(function () {
            _._('mov', [operand_1.rax, operand_1.rdi]); // Thread index, starting from 1
            _._('mov', [operand_1.rcx, _this.stackSize]); // Stack size
            _._('mul', operand_1.rcx); // Stack offset
            _._('lea', [operand_1.rsi, operand_1.rip.disp(lbl_stacks.rel(-8 /* INT */ * 2))]); // Address of stack frame bottom + 1
            _._('add', [operand_1.rsi, operand_1.rax]); // Address of stack top for this thread, RSI second arg to syscall
            _._('lea', [operand_1.rdx, operand_1.rip.disp(func_thread.lbl)]); // Address of thread function code in top of stack
            _._('mov', [operand_1.rsi.ref(), operand_1.rdx]); // Top of stack, RET address
            _._('mov', [operand_1.rsi.disp(8 /* INT */), operand_1.rdi]); // Thread ID in bottom of stack
            // In C: long clone(unsigned long flags, void *child_stack);
            abi.syscall([56 /* clone */, -2147381504 /* THREAD_FLAGS */]); // 2nd arg RSI, stack top address
            // When thread starts the address of its starting function is
            // stored on its stack, the next instruction here is `RET` so it
            // jumps to that address.
        });
        func_thread._(function () {
            var curr = operand_1.r13; // Current block address
            var next = operand_1.r14; // Next block address
            _._('lea', [curr, operand_1.rip.disp(lbl_first_block)]); // R13 = Queue start address
            _._('mov', [next, curr.disp(8 /* INT */ * 8)]); // R14 = Pointer to next block
            var lbl_execute_block = _.lbl('execute_block');
            var lbl_go_to_next_block = _.lbl('go_to_next_block');
            var lbl_thread_stop = _.lbl('thread_stop');
            var lbl_process_block = _.label('process_block');
            _._('mov', [operand_1.eax, curr.ref()]); // Lock in RAX
            _._('cmp', [operand_1.eax, 4 /* EXIT */]); // if(lock == LOCK.EXIT) -> stop thread
            _._('je', lbl_thread_stop);
            _._('cmp', [operand_1.eax, 0 /* UNINITIALIZED */]); // Wait for this block until something is written to it
            _._('jne', lbl_execute_block);
            abi.syscall([24 /* sched_yield */]); // yield and ...
            _._('jmp', lbl_process_block); // ... try this block again
            _.insert(lbl_execute_block);
            _._('cmp', [operand_1.eax, 1 /* FREE */]); // Check block is possibly available
            _._('jne', lbl_go_to_next_block);
            _._('mov', [operand_1.edx, 2 /* LOCKED */]);
            _._('cmpxchg', [curr.ref(), operand_1.edx]).lock(); // Try to acquire lock for this block
            _._('cmp', [curr.ref(), 2 /* LOCKED */], 32); // Check we actually got the lock
            _._('jne', lbl_go_to_next_block); // If not, go to next block
            abi.syscall([
                curr.disp(8 /* INT */),
                curr.disp(8 /* INT */ * 2),
                curr.disp(8 /* INT */ * 3),
                curr.disp(8 /* INT */ * 4),
                curr.disp(8 /* INT */ * 5),
                curr.disp(8 /* INT */ * 6),
                curr.disp(8 /* INT */ * 7),
            ]);
            _._('mov', [curr.disp(8 /* INT */ * 7), operand_1.rax]); // Store syscall result in memory, in place of the 6th argument
            _._('mov', [curr.ref(), 3 /* DONE */], 32); // Mark block as DONE
            // Store ID of this thread in place of 5th argument, for DEBUG purposes
            if (__DEBUG__) {
                _._('mov', [operand_1.rax, operand_1.rsp.ref()]);
                _._('mov', [curr.disp(8 /* INT */ * 6), operand_1.rax]);
            }
            _.insert(lbl_go_to_next_block);
            _._('add', [curr.disp(4), 1], 32).lock(); // Mark that this thread left the block.
            _._('mov', [curr, next]); // Go to next block.
            _._('mov', [next, curr.disp(8 /* INT */ * 8)]); // Store the pointer to the next-next block in register.
            _._('jmp', lbl_process_block);
            // Stop this thread.
            _.insert(lbl_thread_stop);
            if (__DEBUG__) {
                _._('mov', [operand_1.r13.disp(8 /* INT */), 0xBEBA]); // Write "BABE" in place of syscall number.
            }
            abi.syscall([60 /* exit */]);
        });
        if (__DEBUG__) {
            _.align(8);
            _.db('stack');
        }
        _.align(8);
        _.insert(lbl_stacks);
        _.db(0, this.stacksSize);
        if (__DEBUG__) {
            _.align(8);
            _.db('1 block');
        }
        _.align(8);
        _.insert(lbl_first_block);
        _.db(0, this.blockSize);
        var bin = _.compile();
        console.log(_.toString());
        return bin;
    };
    return AsyscallCompiler;
}());
exports.AsyscallCompiler = AsyscallCompiler;

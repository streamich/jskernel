import {CONF, LOCK} from './conf';
import {rax, rsi, rdi, rcx, rdx, rsp, rip, eax, edx, r13, r14} from '../../node_modules/ass-js/x86/operand';
import {Code} from '../../node_modules/ass-js/x86/x64/code';
import {Abi} from '../../node_modules/ass-js/abi';


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


const __DEBUG__ = true;

const enum SYS {
    write           = 1,
    mmap            = 9,
    clone           = 56,
    exit            = 60,
    sched_yield     = 24,
    getuid          = 102,
    getpid          = 39,
}

const enum CLONE {
    VM              = 0x00000100,
    FS              = 0x00000200,
    FILES           = 0x00000400,
    SIGHAND         = 0x00000800,
    PARENT          = 0x00008000,
    THREAD          = 0x00010000,
    IO              = 0x80000000,
    THREAD_FLAGS = CLONE.VM | CLONE.FS | CLONE.FILES | CLONE.SIGHAND |
        CLONE.PARENT | CLONE.THREAD | CLONE.IO,
}

export class AsyscallCompiler {

    queue: number       = 100;
    stackSize           = 5 * CONF.INT;
    stacksSize          = 0;
    blockSize           = 9 * CONF.INT; // control INT + syscall num + 6 args + next block pointer


    compile(): number[] {
        this.stacksSize = CONF.THREADS * this.stackSize;

        var _ = new Code;
        var abi = new Abi(_);

        var func_create_thread      = abi.func('func_create_thread', false, [rax, rsi, rcx, rdx]);
        var func_thread             = abi.func('func_thread');
        var lbl_stacks              = _.lbl('stacks');
        var lbl_first_block         = _.lbl('first_block');

        // main()
        for(var j = 1; j <= CONF.THREADS; j++) {
            abi.call(func_create_thread, [j], []);
        }
        _._('ret');

        func_create_thread._(() => {
            _._('mov', [rax, rdi]);                                             // Thread index, starting from 1
            _._('mov', [rcx, this.stackSize]);                                  // Stack size
            _._('mul', rcx);                                                    // Stack offset

            _._('lea', [rsi, rip.disp(lbl_stacks.rel(-CONF.INT * 2))]);         // Address of stack frame bottom + 1
            _._('add', [rsi, rax]);                                             // Address of stack top for this thread, RSI second arg to syscall

            _._('lea', [rdx, rip.disp(func_thread.lbl)]);                       // Address of thread function code in top of stack
            _._('mov', [rsi.ref(), rdx]);                                       // Top of stack, RET address

            _._('mov', [rsi.disp(CONF.INT), rdi]);                              // Thread ID in bottom of stack

            // In C: long clone(unsigned long flags, void *child_stack);
            abi.syscall([SYS.clone, CLONE.THREAD_FLAGS]); // 2nd arg RSI, stack top address
            // When thread starts the address of its starting function is
            // stored on its stack, the next instruction here is `RET` so it
            // jumps to that address.
        });

        func_thread._(() => {
            var curr = r13;           // Current block address
            var next = r14;           // Next block address


            _._('lea', [curr, rip.disp(lbl_first_block)]);              // R13 = Queue start address
            _._('mov', [next, curr.disp(CONF.INT * 8)]);                // R14 = Pointer to next block


            var lbl_execute_block       = _.lbl('execute_block');
            var lbl_go_to_next_block    = _.lbl('go_to_next_block');
            var lbl_thread_stop         = _.lbl('thread_stop');


            var lbl_process_block = _.label('process_block');
            _._('mov', [eax, curr.ref()]);                              // Lock in RAX
            _._('cmp', [eax, LOCK.EXIT]);                               // if(lock == LOCK.EXIT) -> stop thread
            _._('je', lbl_thread_stop);
            _._('cmp', [eax, LOCK.UNINITIALIZED]);                      // Wait for this block until something is written to it
            _._('jne', lbl_execute_block);
            abi.syscall([SYS.sched_yield]);                             // yield and ...
            _._('jmp', lbl_process_block);                              // ... try this block again

            _.insert(lbl_execute_block);
            _._('cmp', [eax, LOCK.FREE]);                               // Check block is possibly available
            _._('jne', lbl_go_to_next_block);
            _._('mov', [edx, LOCK.LOCKED]);
            _._('cmpxchg', [curr.ref(), edx]).lock();                   // Try to acquire lock for this block
            _._('cmp', [curr.ref(), LOCK.LOCKED], 32);                  // Check we actually got the lock
            _._('jne', lbl_go_to_next_block);                           // If not, go to next block


            abi.syscall([                                               // Execute the syscall
                curr.disp(CONF.INT),
                curr.disp(CONF.INT * 2),
                curr.disp(CONF.INT * 3),
                curr.disp(CONF.INT * 4),
                curr.disp(CONF.INT * 5),
                curr.disp(CONF.INT * 6),
                curr.disp(CONF.INT * 7),
            ]);
            _._('mov', [curr.disp(CONF.INT * 7), rax]);                 // Store syscall result in memory, in place of the 6th argument
            _._('mov', [curr.ref(), LOCK.DONE], 32);                    // Mark block as DONE


            // Store ID of this thread in place of 5th argument, for DEBUG purposes
            if(__DEBUG__) {
                _._('mov', [rax, rsp.ref()]);
                _._('mov', [curr.disp(CONF.INT * 6), rax]);
            }

            _.insert(lbl_go_to_next_block);
            _._('add', [curr.disp(4), 1], 32).lock();                   // Mark that this thread left the block.
            _._('mov', [curr, next]);                                   // Go to next block.
            _._('mov', [next, curr.disp(CONF.INT * 8)]);                // Store the pointer to the next-next block in register.
            _._('jmp', lbl_process_block);


            // Stop this thread.
            _.insert(lbl_thread_stop);
            if(__DEBUG__) {
                _._('mov', [r13.disp(CONF.INT), 0xBEBA]);               // Write "BABE" in place of syscall number.
            }
            abi.syscall([SYS.exit]);
        });


        if(__DEBUG__) { // Mark the beginning of stacks
            _.align(8);
            _.db('stack');
        }
        _.align(8);
        _.insert(lbl_stacks);
        _.db(0, this.stacksSize);


        if(__DEBUG__) { // Mark the beginning of the first block
            _.align(8);
            _.db('1 block');
        }
        _.align(8);
        _.insert(lbl_first_block);
        _.db(0, this.blockSize);


        var bin = _.compile();
        console.log(_.toString());
        return bin;
    }
}

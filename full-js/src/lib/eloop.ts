import {sched_yield, nanosleep} from '../libjs/index';
import {IEventPoll, IEventPollConstructor} from '../libaio/event';


var Poll: IEventPollConstructor;
const platform = process.platform;
switch(platform) {
    case 'linux':
        Poll = require('../libaio/epoll').Poll;
        break;
    default:
        // require('../libaio/epoll-et');
        // require('../libaio/kqueue');
        // require('../libaio/poll');
        // require('../libaio/select');
        // require('../libaio/fake_socket_poll');
        throw Error(`Platform not supported: ${platform}`);
}


// TODO: Bugs and TODOs:
// TODO:
// TODO:  - Sometimes `setIOPoll` executes faster than `setImmediate`, or does it?
// TODO:  - Cache `Date.now()` once at the beginning of each loop, or it will not boost performance?



export const enum DELAY {
    IMMEDIATE = -2,     // In Node.js `setImmediate` is executed before I/O polling events.
    IO = -1,
}

const POINTER_NONE = -1;

const DELAYS = [
    DELAY.IMMEDIATE,    // `setImmediate` == `setTimeout(, -2)`
    DELAY.IO,           // `setIOPoll` == `setTimeout(, -1)`
    1,
    // 2,
    // 4,
    8,
    16,
    32,
    64,
    128,
    256,
    // 512,
    1024,
    // 2048,
    4096,
    // 8192,
    16384,
    // 32768,
    65536,
    131072,
    // 262144,
    524288,
    // 1048576,
    2097152,
    // 4194304,
    8388608,
    // 16777216,
    33554432,
    // 67108864,
    // 134217728,
    268435456,
    // 536870912,
    // 1073741824,
    2147483648,
    Infinity,
];
const DELAY_LAST = DELAYS.length - 1;

function findDelayIndex(delay) {
    for(var i = 0; i <= DELAY_LAST; i++)
        if(delay <= DELAYS[i]) return i;
}


export interface IQueue {
    next: IQueue;
    prev: IQueue;
}


// var _task_id = -1125899906842624;
export class MicroTask implements IQueue {
    // id: number = _task_id++;         // Every task has a unique ID in increasing order, used to merge queues with equal IDs.
    next: MicroTask = null;             // Previous task in list
    prev: MicroTask = null;             // Next task in list
    callback;                           // Callback to be executed if any
    args;                               // Optional arguments to pass to callback.

    constructor(callback?, args?) {
        this.callback = callback || null;
        this.args = args || null;
    }

    exec() {
        var args = this.args, callback = this.callback;
        if(!args) {
            callback();
        } else {
            switch (args.length) {
                case 1:
                    callback(args[0]);
                    break;
                case 2:
                    callback(args[0], args[1]);
                    break;
                case 3:
                    callback(args[0], args[1], args[2]);
                    break;
                default:
                    callback.apply(null, args);
            }
        }
    }
}


export class Task extends MicroTask {
    next: Task;
    prev: Task;
    delay: number = DELAY.IMMEDIATE;    // Delay in ms
    timeout: number = 0;                // UNIX time in ms when `delay` happens
    pointer: number = POINTER_NONE;     // >1 if some deep pointer from queue points to this task.
    isRef: boolean = true;              // Whether to keep process running while this task scheduled.
    queue: EventQueue = null;           // `EventQueue` where this `Task` is inserted.

    // constructor() { }

    ref() {
        if(!this.isRef) {
            
        }
    }

    unref() {
        if(this.isRef) {
            
        }
    }

    cancel() {
        this.queue.cancel(this);
    }
}


export class EventQueue {
    start: Task = null;         // Macro-task queue: `setImmediate`, `I/O`, `setTimeout`, `setInterval`.
    active: Task = null;        // Slice of `macroQueue` that is being executed in current event loop cycle.


    // Deep pointers into `macroQueue` by the `delay` of the last task inserted in
    // the queue with that delay or lesser, these give us the guidance where in the
    // queue we should start looking for to insert a new task.
    pointers: Task[] = [
        // 0:   Last `setImmediate` in the queue
        // 1:   Last `setTimeout(..., 1) in the queue
        // 8:   Last `setTimeout(..., 2..8) in the queue
        // 16:  Last `setTimeout(..., 9..16) in the queue
        // .
        // .
        // .
        // Infinity:  Last `setTimeout(..., 2147483649..Infinity) in the queue
    ];


    protected setPointer(pointer_index: number, task: Task) {
        var pointers = this.pointers;
        var timeout = task.timeout;

        pointers[pointer_index] = task;
        task.pointer = pointer_index;

        // Make sure all pointers pointing to greater delay values are
        // pointing at least as deep in the queue as the current pointer.
        for(var i = pointer_index + 1; i <= DELAY_LAST; i++) {
            var p = pointers[i];
            if (!p) {
                pointers[i] = task;
            } else {
                if (p.timeout <= timeout) {
                    pointers[i] = task;
                } else {
                    break;
                }
            }
        }
    }

    protected insertTask(curr: Task, task: Task) {
        var timeout = task.timeout;
        var prev: Task = null;

        if(timeout >= curr.timeout) {
            do {
                prev = curr;
                curr = curr.next;
            } while(curr && (curr.timeout <= timeout));

            prev.next = task;
            task.prev = prev;

            if(curr) {
                curr.prev = task;
                task.next = curr;
            }

        } else {
            do {
                prev = curr;
                curr = curr.prev;
            } while(curr && (curr.timeout > timeout));

            prev.prev = task;
            task.next = prev;

            if(curr) {
                curr.next = task;
                task.prev = curr;
            } else { // First element in queue
                this.start = task;
            }
        }
    }

    // Milliseconds when next task to be executed.
    msNextTask() {
        if(this.start) {
            return this.start.timeout - Date.now();
        }
        return Infinity;
    }

    insert(task: Task) {
        task.queue = this;

        var delay = task.delay;
        var timeout = task.timeout = Date.now() + delay;

        var pointers = this.pointers;
        var pointer_index = findDelayIndex(delay);

        var curr: Task = pointers[pointer_index];

        if(!curr) {
            this.setPointer(pointer_index, task);

            if(pointer_index) {
                for (var i = pointer_index - 1; i >= 0; i--) {
                    if (pointers[i]) {
                        curr = pointers[i];
                        break;
                    }
                }
            }

            if(!curr) curr = this.start;

            if(!curr) { // Means `macroQueue` completely empty.
                this.start = task;
            } else {
                this.insertTask(curr, task);
            }
        } else {
            if(timeout >= curr.timeout) {
                this.setPointer(pointer_index, task);
            }
            this.insertTask(curr, task);
        }
    }

    // debug() {
    //     var curr: Task = this.start;
    //     if(!curr) return;
    //     do {
    //         console.log(curr.delay, curr.timeout);
    //     } while(curr = curr.next);
    // }

    cancel(task: Task) {
        var prev = task.prev;
        var next = task.next;

        task.prev = task.next = null;
        if(prev) prev.next = next;
        if(next) next.prev = prev;

        if(!prev) { // First task in queue
            this.start = next;
        }

        if(task.pointer !== POINTER_NONE) {
            var index = task.pointer;
            if(index) {
                this.pointers[index] = this.pointers[index - 1];
            } else {
                this.pointers[index] = null;
            }
        }
    }

    // 1. Splice `this.activeQueue` for the beginning of the `this.macroQueue` up to the
    //    very last Task that timed out.
    // 2. In the process reset `this.pointers` which were sliced out.
    protected sliceActiveQueue() {
        var curr: Task = this.start;
        if(!curr) return; // No events queued.

        var time = Date.now();
        var pointers = this.pointers;
        for(var i = 0; i <= DELAY_LAST; i++) {
            var pointer = pointers[i];
            if(pointer) {
                if(pointer.timeout <= time) {
                    pointers[i] = null;
                    // pointer.pointer = POINTER_NONE;
                    curr = pointer;
                } else {
                    break;
                }
            }
        }

        if(curr.timeout > time) return;

        var prev: Task;
        do {
            prev = curr;
            curr = curr.next;
        } while (curr && (curr.timeout <= time));

        prev.next = null;
        if(curr) curr.prev = null;

        this.active = this.start;
        this.start = curr;
    }

    cycle() {
        // Crate new active queue
        this.sliceActiveQueue();
    }

    // Pop next task to be executed.
    pop() {
        var task = this.active;
        if(!task) return null;
        this.active = task.next;
        return task;
    }
}


export class EventLoop {
    microQueue: MicroTask = null;           // Micro-task queue: `process.nextTick`.
    microQueueEnd: MicroTask = null;        // The last task in micro-task queue.
    refQueue = new EventQueue;              // Events that keep process running.
    unrefQueue = new EventQueue;            // Optional events.

    poll: IEventPoll = new Poll;

    protected shouldStop() {
        if(!this.refQueue.start) return true;
        return false;
    }

    insertMicrotask(microtask: MicroTask) {
        var last = this.microQueueEnd;
        this.microQueueEnd = microtask;
        if(!last) { // Empty micro task list
            this.microQueue = microtask;
        } else {
            last.next = microtask; // One-way list
        }
    }

    insert(task: Task) {
        if(task.isRef) this.refQueue.insert(task);
        else this.unrefQueue.insert(task);
    }

    start() {
        function exec_task(task: Task) {
            // TODO: BTW, which one is faster? (1) `if(task.callback)` vs. (2) `noop()`
            if(task.callback) task.callback();
        }

        // THE LOOP
        while(1) {

            // Create new active queues
            this.refQueue.cycle();
            this.unrefQueue.cycle();

            var refTask = this.refQueue.pop();
            var unrefTask = this.unrefQueue.pop();

            // Execute all macro tasks of the current cycle in the event loop.
            var task: Task;
            while(refTask || unrefTask) {

                if(refTask && unrefTask) {
                    if(refTask.timeout < unrefTask.timeout) {
                        refTask.exec();
                        refTask = null;
                    } else if(refTask.timeout > unrefTask.timeout) {
                        unrefTask.exec();
                        unrefTask = null;
                    } else {
                        // if(refTask.id <= unrefTask.id) {
                        if(refTask.timeout <= unrefTask.timeout) {
                            refTask.exec();
                            refTask = null;
                        } else {
                            unrefTask.exec();
                            unrefTask = null;
                        }
                    }
                } else {
                    if(refTask) {
                        refTask.exec();
                        refTask = null;
                    } else {
                        unrefTask.exec();
                        unrefTask = null;
                    }
                }


                // Execute all micro tasks accumulated while executing this macro task.
                var microtask;
                do {
                    microtask = this.microQueue;
                    if(microtask) {
                        if(microtask.callback) microtask.exec();
                        this.microQueue = microtask.next;
                    }
                } while(this.microQueue);
                this.microQueueEnd = null;


                // Pop one more task to execute.
                if(!refTask)    refTask = this.refQueue.pop();
                else            unrefTask = this.unrefQueue.pop();
            }


            // Stop the program?
            var havePollEvents = this.poll.hasRefs();
            if(this.shouldStop() && !havePollEvents) break;


            // ----------------------------------------------------------------------------------
            // TODO:
            // By here we finished executing all the macro and micro tasks of the current cycle.
            // Now we need to decide if we have immediate tasks to execute in the next cycle,
            // or (if not) we can save CPU cycles by idling. We should use the `nanosleep`,
            // `sched_yield` and `epoll` system calls to idle this infinite loop when possible.
            //
            // `nanosleep` should be available on all systems, so we can use it right here. Similarly,
            // we can use `sched_yield` here, if it is not available on some systems we just create a no-op
            // shim for it.
            //
            // Now, `epoll` syscall is available only on Linux (other systems have different alternatives),
            // so we don't use it here as-it-is but create an abstraction for it, so that a correct
            // async mechanism can be used on each system.
            //
            // For timer tasks `setInterval` and `setTimeout` we know the exact time when we need
            // to execute them, for `setImmediate` task we know as well that we have to execute it
            // immediately. So, if there are only future timer tasks scheduled, we `nanosleep` just
            // enough to wake up before the task has to be executed.
            //
            // The interesting part are async I/O tasks, which are of two types:
            //
            //  - Type 1: `process.asyscall` provided by thread pool
            //  - Type 2: Async I/O provided by kernel using `epoll`
            //
            // If there are Type 1 tasks in queue (we should be able to detect that) then we cannot
            // `nanosleep`, but if there are no immediate tasks to be executed we can `sched_yield`
            // as it should be an order of magnitude faster than file I/O.
            //
            // If there are Type 2 tasks -- we can `epoll` in two ways: with or without a blocking timeout.
            // We should detect if it is possible and use `epoll` with timeout which effectively
            // idles the loop up until the timeout is reached or when new events are received.
            // Otherwise we just use `epoll` asynchronously -- without the blocking timeout.
            //
            // Also, use `eventfd` to notify `epoll` from thread poll when task is completed.

            var ref_ms = this.refQueue.msNextTask();
            var unref_ms = this.unrefQueue.msNextTask();

            const CAP = 1000000;
            var ms = Math.min(ref_ms, unref_ms, CAP);
            if(ms > 0) {
                if(havePollEvents) {
                    this.poll.wait(ms); // epoll_wait
                } else {
                    var seconds = Math.floor(ms / 1000);
                    var nanoseconds = (ms % 1000) * 1000000;
                    nanosleep(seconds, nanoseconds);
                }
            } else {
                if(ms > 1) {
                    sched_yield();
                }
            }

        }
    }
}

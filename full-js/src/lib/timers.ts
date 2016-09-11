import {Task, MicroTask, DELAY} from './eloop';


// TODO: We can relax this to 53 bits, right?
const TIMEOUT_MAX = 2147483647; // 2^31-1


export class Timeout {
    task: Task;

    constructor(callback?, args?) {
        this.task = new Task(callback, args);
    }

    ref() {
        this.task.ref();
    }

    unref() {
        this.task.unref();
    }
}


export class Immediate extends Task {
    // delay = DELAY.IMMEDIATE;
}


export function setTimeout(callback, after, arg1, arg2, arg3) {
    if (typeof callback !== 'function') {
        throw new TypeError('"callback" argument must be a function');
    }

    after *= 1; // coalesce to number or NaN

    if (!(after >= 1 && after <= TIMEOUT_MAX)) {
        after = 1; // schedule on next tick, follows browser behaviour
    }

    var timer = new Timeout(callback);
    var task = timer.task;
    task.delay = after;
    var length = arguments.length;

    switch (length) {
        case 0:
        case 1:
        case 2:
            break;
        default:
            var args = new Array(length - 2);
            for (var i = 2; i < length; i++)
                args[i - 2] = arguments[i];
            task.args = args;
            break;
    }

    process.loop.insert(task);
    return timer;
}

export function clearTimeout(timer: Timeout) {
    timer.task.cancel();
}


export function setInterval(callback, repeat) {
    var args = arguments;
    var timer = setTimeout.apply(null, args);
    var wrapper = function() {
        var new_timer = setTimeout.apply(null, args);
        timer.task = new_timer.task;
        timer.task.callback = wrapper;

        callback.apply(null, arguments);
    };
    timer.task.callback = wrapper;
    return timer;
}

export function clearInterval(timer) {
    timer.task.cancel();
}


function createImm(callback, arg1, arg2, arg3) {
    if (typeof callback !== 'function') {
        throw new TypeError('"callback" argument must be a function');
    }

    var i, args;

    switch (arguments.length) {
        case 0:
        case 1:
            break;
        case 2:
            args = [arg1];
            break;
        case 3:
            args = [arg1, arg2];
            break;
        case 4:
            args = [arg1, arg2, arg3];
            break;
        default:
            args = [arg1, arg2, arg3];
            for (i = 4; i < arguments.length; i++)
                args[i - 1] = arguments[i];
            break;
    }

    return new Immediate(callback, args);
}


export function setImmediate(callback, arg1, arg2, arg3) {
    var timer = createImm(callback, arg1, arg2, arg3);
    process.loop.insert(timer);
    return timer;
}

export function clearImmediate(immediate) {
    if (!immediate) return;
    immediate.cancel();
}


// I/O operations use this to schedule polling.
// Same as `setImmediate` we just make sure I/O requests are polled
// after `setImmediate` callbacks are processed just to be compatible with Node.js,
// otherwise we don't need this.
export function setIOPoll(callback, arg1, arg2, arg3) {
    var timer = createImm(callback, arg1, arg2, arg3);
    timer.delay = DELAY.IO;
    process.loop.insert(timer);
    return timer;
}

export function clearIOPoll(poll) {
    if(poll) poll.cancel();
}


export function setMicroTask(callback) {
    var args;
    if (arguments.length > 1) {
        args = new Array(arguments.length - 1);
        for (var i = 1; i < arguments.length; i++)
            args[i - 1] = arguments[i];
    }

    process.loop.insertMicrotask(new MicroTask(callback, args));
}

"use strict";
var arch_linux_x64_1 = require('./arch_linux_x64');
var style_1 = require('./style');
var ctypes_1 = require('../libjs/ctypes');
var util = require('../lib/util');
var Strace = (function () {
    function Strace() {
        var _this = this;
        this.printQueue = [];
        this.blockStdout = false;
        this.onsync = function (e) {
            var blockStdout = _this.blockStdout && (e.name === 'write') && (e.args[0] === 1);
            var time = 0, result = 0;
            if (!blockStdout) {
                var tmp = [e.num].concat(e.args);
                time = Date.now();
                result = e.syscall.apply(null, tmp);
                time = Date.now() - time;
            }
            var callstr = _this.formatCall(e);
            var timestr;
            // If system call executes longer than even 1ms, its too long
            if (time > 0)
                timestr = style_1.style(style_1.interval(time), 27 /* BG_RED */);
            else
                timestr = style_1.style(style_1.interval(time), 18 /* GREY */);
            callstr += ' ' + timestr;
            var str = callstr + _this.formatResult(e, result) + style_1.style(' ', 0 /* RESET */);
            _this.print(style_1.style(str, 0 /* RESET */) + '\n');
            // this.print(str + '\n');
            return result;
        };
        this.onasync = function (e, callback) {
            e.syscall.apply(null, [e.num].concat(e.args, [function (result) {
                var callstr = _this.formatCall(e, true);
                var str = callstr + _this.formatResult(e, result) + style_1.style(' ', 0 /* RESET */);
                _this.print(style_1.style(str, 0 /* RESET */) + '\n');
                callback(result);
            }]));
        };
    }
    Strace.prototype.formatAddress = function (tuple) {
        var value = ctypes_1.UInt64.joinToNumber(tuple[1], tuple[0]);
        return value < 0 ? '-' : '' + '0x' + value.toString(16);
    };
    Strace.prototype.formatValue = function (val) {
        if (typeof val === 'number') {
            var hex = '';
            if (Math.abs(val) > 255) {
                hex = ' ' + (val < 0 ? '-' : '') + '0x' + val.toString(16) + '';
            }
            return String(val) + hex;
        }
        else if (val instanceof Array) {
            var value = ctypes_1.UInt64.joinToNumber(val[1], val[0]);
            var hex = '';
            if (Math.abs(value) > 255) {
                hex = ' ' + (value < 0 ? '-' : '') + '0x' + value.toString(16) + '';
            }
            return (value + " [" + val[1] + ", " + val[0] + "]") + hex;
        }
        else if (StaticBuffer.isStaticBuffer(val)) {
            return "<StaticBuffer " + this.formatAddress(val.getAddress()) + ">";
        }
        else if (Buffer.isBuffer(val)) {
            return "<Buffer " + this.formatAddress(val.getAddress()) + ">";
        }
        else if (val instanceof ArrayBuffer) {
            return '<ArrayBuffer>';
        }
        else if (val instanceof Uint8Array) {
            var sab = new StaticArrayBuffer(val.buffer);
            return "<Uint8Array " + this.formatAddress(sab.getAddress()) + ">";
        }
        else if (val === null) {
            return 'null';
        }
        else if (typeof val === 'undefined') {
            return val;
        }
        else
            return String(val);
    };
    Strace.prototype.formatCall = function (e, isAsync) {
        var str = [
            style_1.style('syscall', 12 /* GREEN */) + ' ' + (isAsync ? style_1.style('ASYNC', 28 /* BG_GREEN */) + ' ' : '')
        ];
        var time = Date.now();
        if (this.time)
            str.push(style_1.style('+' + style_1.interval(time - this.time), 18 /* GREY */) + ' ');
        this.time = time;
        str.push(style_1.style(e.name, 16 /* CYAN */));
        // Format arguments
        var params = arch_linux_x64_1.ARGS[e.num] || [];
        var args = [];
        for (var i = 0; i < Math.max(params.length, e.args.length); i++) {
            var argstr = '';
            var param = params[i];
            if (param)
                argstr += style_1.style(param[0], 18 /* GREY */) + ' ' + style_1.style(param[1], 13 /* YELLOW */) + ' = ';
            argstr += this.formatValue(e.args[i]);
            args.push(argstr);
        }
        str.push('(' + args.join(', ') + ')');
        return str.join('');
    };
    Strace.prototype.formatResult = function (e, res) {
        var resint;
        var resstr;
        if (res instanceof Array) {
            resint = ctypes_1.UInt64.joinToNumber(res[1], res[0]);
            resstr = this.formatValue(res);
        }
        else {
            resint = res;
            resstr = this.formatValue(res);
        }
        var str = [style_1.style(' = ', 0 /* RESET */)];
        if (resint < 0) {
            str.push(style_1.style('ERROR', 27 /* BG_RED */) + ' ' + resstr);
            var errconst = arch_linux_x64_1.ERROR[-resint];
            if (errconst) {
                str.push(' ' + style_1.style(errconst, 11 /* RED */));
                var errstr = arch_linux_x64_1.ERROR_MSG[-resint];
                if (errstr)
                    str.push(' ' + style_1.style(errstr, 13 /* YELLOW */));
            }
            else {
                str.push(' ' + style_1.style('UNKNOWN', 11 /* RED */));
            }
        }
        else {
            str.push(style_1.style(resstr, 12 /* GREEN */));
            var results = arch_linux_x64_1.RESULT[e.num];
            if (results) {
                if (typeof results === 'string') {
                    str.push(' ' + style_1.style(results, 18 /* GREY */));
                }
            }
        }
        return str.join('');
    };
    // We need to execute syscall explicitly, otherwise `console.log` uses
    // `write` syscall to STDOUT and we get infinite loop.
    Strace.prototype.printSyscall = function (msg) {
        this.syscall(1, 1, msg, msg.length);
    };
    Strace.prototype.print = function (msg) {
        if (this.syscall) {
            if (this.printQueue.length) {
                for (var _i = 0, _a = this.printQueue; _i < _a.length; _i++) {
                    var oldmsg = _a[_i];
                    this.printSyscall(oldmsg);
                }
                this.printQueue = [];
            }
            this.printSyscall(msg);
        }
        else {
            this.printQueue.push(msg);
        }
    };
    Strace.prototype.processSync = function (num, args, is64) {
        if (is64 === void 0) { is64 = false; }
        var syscall = !is64 ? this.syscall : this.syscall64;
        var event = {
            num: num,
            name: arch_linux_x64_1.SYS[num],
            args: args,
            is64: is64,
            syscall: syscall
        };
        var result = this.onsync(event);
        return (typeof result === 'number') || (result instanceof Array)
            ? result
            : syscall.apply(null, [num].concat(args));
    };
    Strace.prototype.processAsync = function (num, args, is64, callback) {
        if (is64 === void 0) { is64 = false; }
        var syscall = !is64 ? this.asyscall : this.asyscall64;
        var event = {
            num: num,
            name: arch_linux_x64_1.SYS[num],
            args: args,
            is64: is64,
            syscall: syscall
        };
        this.onasync(event, function (result) {
            if ((typeof result === 'number') || (result instanceof Array))
                callback(result);
            else
                syscall.apply(null, [num].concat(args, [callback]));
        });
    };
    Strace.prototype.overwriteSync = function (object, method, method64) {
        var _this = this;
        if (object === void 0) { object = process; }
        if (method === void 0) { method = 'syscall'; }
        if (method64 === void 0) { method64 = 'syscall64'; }
        this.syscall = object[method].bind(object);
        this.syscall64 = object[method64].bind(object);
        object[method] = function (num) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return _this.processSync(num, args, false);
        };
        object[method64] = function (num) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return _this.processSync(num, args, true);
        };
    };
    Strace.prototype.overwriteAsync = function (object, method, method64) {
        var _this = this;
        if (object === void 0) { object = process; }
        if (method === void 0) { method = 'asyscall'; }
        if (method64 === void 0) { method64 = 'asyscall64'; }
        this.asyscall = object[method].bind(object);
        this.asyscall64 = object[method64].bind(object);
        object[method] = function (num) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var callback = args[args.length - 1];
            args = args.splice(0, args.length - 1);
            _this.processAsync(num, args, false, callback);
        };
        object[method64] = function (num) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            var callback = args[args.length - 1];
            args = args.splice(0, args.length - 1);
            _this.processAsync(num, args, true, callback);
        };
    };
    return Strace;
}());
exports.Strace = Strace;
function createLogger() {
    return new Strace;
}
exports.createLogger = createLogger;

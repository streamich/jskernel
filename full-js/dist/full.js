global = this;
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	
	__webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// This file is in `.js` because we set global variables here, but TypeScript
	// transpiles with `"use strict"` and in strict mode you cannot set globals.


	// Self is set to global `this` by Webpack, see `webpack.config.js`.
	// In different environments global variables are called differently,
	// for example, in Duktape the global variable is called `Duktape`,
	// so here we make sure there is a global variable called `global`.
	// global = self;
	// global.global = global;


	// TODO: Remove these for production.
	process.env = {NODE_DEBUG: 'stream'};
	var __STRACE__ = false;


	// Useful for debugging when porting to new runtime, just create a global `print`
	// function that prints strings to STDOUT.
	if(true) {
	    if((typeof print !== 'undefined') && (typeof console === 'undefined')) {
	        console = {
	            log: function () {
	                var str = Array.prototype.join.call(arguments, ', ');
	                print(str);
	            }
	        };
	    }
	}


	if(__STRACE__) {
	    var strace = __webpack_require__(2).createLogger();
	    strace.blockStdout = (false);
	    strace.overwriteSync(process, 'syscall', 'syscall64');
	}


	// Export `Buffer` as global. Other things use `Buffer`, so we export Buffer first.
	Buffer = global.Buffer = __webpack_require__(7).Buffer;


	// Check if we have more tools than just `process.syscall`.
	process.hasBinaryUtils = process.call && process.frame;


	// Export `StaticArrayBuffer`, required by `StaticBuffer`.
	if(typeof StaticArrayBuffer === 'undefined') {
	    StaticArrayBuffer = global.StaticArrayBuffer = process.hasBinaryUtils
	            ? __webpack_require__(11).StaticArrayBuffer
	            : ArrayBuffer;
	}


	// Export `StaticBuffer`, `libjs` needs `StaticBuffer` so export it early.
	if(typeof StaticBuffer === 'undefined') {
	    StaticBuffer = global.StaticBuffer= process.hasBinaryUtils
	            ? __webpack_require__(13).StaticBuffer
	            : Buffer;
	}




	// Set-up `process` global.
	__webpack_require__(17);


	// Create global `console` object.
	console = global.console = __webpack_require__(35);


	// The main event loop, attached to `process` as `loop` property.
	var eloop = __webpack_require__(20);
	var EventLoop = eloop.EventLoop;
	var Task = eloop.Task;
	var loop = process.loop = new EventLoop;


	// Export timers as globals.
	var timers = __webpack_require__(37);
	setTimeout = timers.setTimeout;
	clearTimeout = timers.clearTimeout;
	setInterval = timers.setInterval;
	clearInterval = timers.clearInterval;
	setImmediate = timers.setImmediate;
	clearImmediate = timers.clearImmediate;
	setIOPoll = timers.setIOPoll;
	clearIOPoll = timers.clearIOPoll;
	setMicroTask = process.nextTick = timers.setMicroTask;


	// First task in the event loop.

	var task = new Task;
	task.callback = function() {

	    // !IMPORTANT: everything that uses `process.nextTick()` must
	    // bet executed in this callback so all the micro-tasks get correctly
	    // executed after this first macro-task is processed.


	    // Create `process.asyscall` and `process.asyscall64`
	    __webpack_require__(38);
	    if(__STRACE__) {
	        strace.overwriteAsync(process, 'asyscall', 'asyscall64');
	    }


	    try {
	        // Eval the file specified in first argument `full app.js`
	        if(process.argv[1]) {
	            var path = __webpack_require__(25);
	            var Module = __webpack_require__(41).Module;
	            process.argv = process.argv.splice(1);
	            process.argv[1] = path.resolve(process.argv[1]);
	            setImmediate(function() {
	                try {
	                    Module.runMain();
	                } catch(e) {
	                    console.log(e);
	                    console.log(e.stack);
	                }
	            });
	        }
	    } catch(e) {
	        console.log(e);
	        console.log(e.stack);
	    }

	};
	loop.insert(task);
	loop.start();


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var arch_linux_x64_1 = __webpack_require__(3);
	var style_1 = __webpack_require__(4);
	var ctypes_1 = __webpack_require__(5);
	var util = __webpack_require__(6);
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
	            if (time > 0)
	                timestr = style_1.style(style_1.interval(time), 27);
	            else
	                timestr = style_1.style(style_1.interval(time), 18);
	            callstr += ' ' + timestr;
	            var str = callstr + _this.formatResult(e, result) + style_1.style(' ', 0);
	            _this.print(style_1.style(str, 0) + '\n');
	            return result;
	        };
	        this.onasync = function (e, callback) {
	            e.syscall.apply(null, [e.num].concat(e.args, [function (result) {
	                var callstr = _this.formatCall(e, true);
	                var str = callstr + _this.formatResult(e, result) + style_1.style(' ', 0);
	                _this.print(style_1.style(str, 0) + '\n');
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
	            style_1.style('syscall', 12) + ' ' + (isAsync ? style_1.style('ASYNC', 28) + ' ' : '')
	        ];
	        var time = Date.now();
	        if (this.time)
	            str.push(style_1.style('+' + style_1.interval(time - this.time), 18) + ' ');
	        this.time = time;
	        str.push(style_1.style(e.name, 16));
	        var params = arch_linux_x64_1.ARGS[e.num] || [];
	        var args = [];
	        for (var i = 0; i < Math.max(params.length, e.args.length); i++) {
	            var argstr = '';
	            var param = params[i];
	            if (param)
	                argstr += style_1.style(param[0], 18) + ' ' + style_1.style(param[1], 13) + ' = ';
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
	        var str = [style_1.style(' = ', 0)];
	        if (resint < 0) {
	            str.push(style_1.style('ERROR', 27) + ' ' + resstr);
	            var errconst = arch_linux_x64_1.ERROR[-resint];
	            if (errconst) {
	                str.push(' ' + style_1.style(errconst, 11));
	                var errstr = arch_linux_x64_1.ERROR_MSG[-resint];
	                if (errstr)
	                    str.push(' ' + style_1.style(errstr, 13));
	            }
	            else {
	                str.push(' ' + style_1.style('UNKNOWN', 11));
	            }
	        }
	        else {
	            str.push(style_1.style(resstr, 12));
	            var results = arch_linux_x64_1.RESULT[e.num];
	            if (results) {
	                if (typeof results === 'string') {
	                    str.push(' ' + style_1.style(results, 18));
	                }
	            }
	        }
	        return str.join('');
	    };
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


/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	(function (ERROR) {
	    ERROR[ERROR["EPERM"] = 1] = "EPERM";
	    ERROR[ERROR["ENOENT"] = 2] = "ENOENT";
	    ERROR[ERROR["ESRCH"] = 3] = "ESRCH";
	    ERROR[ERROR["EINTR"] = 4] = "EINTR";
	    ERROR[ERROR["EIO"] = 5] = "EIO";
	    ERROR[ERROR["ENXIO"] = 6] = "ENXIO";
	    ERROR[ERROR["E2BIG"] = 7] = "E2BIG";
	    ERROR[ERROR["ENOEXEC"] = 8] = "ENOEXEC";
	    ERROR[ERROR["EBADF"] = 9] = "EBADF";
	    ERROR[ERROR["ECHILD"] = 10] = "ECHILD";
	    ERROR[ERROR["EAGAIN"] = 11] = "EAGAIN";
	    ERROR[ERROR["ENOMEM"] = 12] = "ENOMEM";
	    ERROR[ERROR["EACCES"] = 13] = "EACCES";
	    ERROR[ERROR["EFAULT"] = 14] = "EFAULT";
	    ERROR[ERROR["ENOTBLK"] = 15] = "ENOTBLK";
	    ERROR[ERROR["EBUSY"] = 16] = "EBUSY";
	    ERROR[ERROR["EEXIST"] = 17] = "EEXIST";
	    ERROR[ERROR["EXDEV"] = 18] = "EXDEV";
	    ERROR[ERROR["ENODEV"] = 19] = "ENODEV";
	    ERROR[ERROR["ENOTDIR"] = 20] = "ENOTDIR";
	    ERROR[ERROR["EISDIR"] = 21] = "EISDIR";
	    ERROR[ERROR["EINVAL"] = 22] = "EINVAL";
	    ERROR[ERROR["ENFILE"] = 23] = "ENFILE";
	    ERROR[ERROR["EMFILE"] = 24] = "EMFILE";
	    ERROR[ERROR["ENOTTY"] = 25] = "ENOTTY";
	    ERROR[ERROR["ETXTBSY"] = 26] = "ETXTBSY";
	    ERROR[ERROR["EFBIG"] = 27] = "EFBIG";
	    ERROR[ERROR["ENOSPC"] = 28] = "ENOSPC";
	    ERROR[ERROR["ESPIPE"] = 29] = "ESPIPE";
	    ERROR[ERROR["EROFS"] = 30] = "EROFS";
	    ERROR[ERROR["EMLINK"] = 31] = "EMLINK";
	    ERROR[ERROR["EPIPE"] = 32] = "EPIPE";
	    ERROR[ERROR["EDOM"] = 33] = "EDOM";
	    ERROR[ERROR["ERANGE"] = 34] = "ERANGE";
	    ERROR[ERROR["EDEADLK"] = 35] = "EDEADLK";
	    ERROR[ERROR["ENAMETOOLONG"] = 36] = "ENAMETOOLONG";
	    ERROR[ERROR["ENOLCK"] = 37] = "ENOLCK";
	    ERROR[ERROR["ENOSYS"] = 38] = "ENOSYS";
	    ERROR[ERROR["ENOTEMPTY"] = 39] = "ENOTEMPTY";
	    ERROR[ERROR["ELOOP"] = 40] = "ELOOP";
	    ERROR[ERROR["EWOULDBLOCK"] = 11] = "EWOULDBLOCK";
	    ERROR[ERROR["ENOMSG"] = 42] = "ENOMSG";
	    ERROR[ERROR["EIDRM"] = 43] = "EIDRM";
	    ERROR[ERROR["ECHRNG"] = 44] = "ECHRNG";
	    ERROR[ERROR["EL2NSYNC"] = 45] = "EL2NSYNC";
	    ERROR[ERROR["EL3HLT"] = 46] = "EL3HLT";
	    ERROR[ERROR["EL3RST"] = 47] = "EL3RST";
	    ERROR[ERROR["ELNRNG"] = 48] = "ELNRNG";
	    ERROR[ERROR["EUNATCH"] = 49] = "EUNATCH";
	    ERROR[ERROR["ENOCSI"] = 50] = "ENOCSI";
	    ERROR[ERROR["EL2HLT"] = 51] = "EL2HLT";
	    ERROR[ERROR["EBADE"] = 52] = "EBADE";
	    ERROR[ERROR["EBADR"] = 53] = "EBADR";
	    ERROR[ERROR["EXFULL"] = 54] = "EXFULL";
	    ERROR[ERROR["ENOANO"] = 55] = "ENOANO";
	    ERROR[ERROR["EBADRQC"] = 56] = "EBADRQC";
	    ERROR[ERROR["EBADSLT"] = 57] = "EBADSLT";
	    ERROR[ERROR["EDEADLOCK"] = 35] = "EDEADLOCK";
	    ERROR[ERROR["EBFONT"] = 59] = "EBFONT";
	    ERROR[ERROR["ENOSTR"] = 60] = "ENOSTR";
	    ERROR[ERROR["ENODATA"] = 61] = "ENODATA";
	    ERROR[ERROR["ETIME"] = 62] = "ETIME";
	    ERROR[ERROR["ENOSR"] = 63] = "ENOSR";
	    ERROR[ERROR["ENONET"] = 64] = "ENONET";
	    ERROR[ERROR["ENOPKG"] = 65] = "ENOPKG";
	    ERROR[ERROR["EREMOTE"] = 66] = "EREMOTE";
	    ERROR[ERROR["ENOLINK"] = 67] = "ENOLINK";
	    ERROR[ERROR["EADV"] = 68] = "EADV";
	    ERROR[ERROR["ESRMNT"] = 69] = "ESRMNT";
	    ERROR[ERROR["ECOMM"] = 70] = "ECOMM";
	    ERROR[ERROR["EPROTO"] = 71] = "EPROTO";
	    ERROR[ERROR["EMULTIHOP"] = 72] = "EMULTIHOP";
	    ERROR[ERROR["EDOTDOT"] = 73] = "EDOTDOT";
	    ERROR[ERROR["EBADMSG"] = 74] = "EBADMSG";
	    ERROR[ERROR["EOVERFLOW"] = 75] = "EOVERFLOW";
	    ERROR[ERROR["ENOTUNIQ"] = 76] = "ENOTUNIQ";
	    ERROR[ERROR["EBADFD"] = 77] = "EBADFD";
	    ERROR[ERROR["EREMCHG"] = 78] = "EREMCHG";
	    ERROR[ERROR["ELIBACC"] = 79] = "ELIBACC";
	    ERROR[ERROR["ELIBBAD"] = 80] = "ELIBBAD";
	    ERROR[ERROR["ELIBSCN"] = 81] = "ELIBSCN";
	    ERROR[ERROR["ELIBMAX"] = 82] = "ELIBMAX";
	    ERROR[ERROR["ELIBEXEC"] = 83] = "ELIBEXEC";
	    ERROR[ERROR["EILSEQ"] = 84] = "EILSEQ";
	    ERROR[ERROR["ERESTART"] = 85] = "ERESTART";
	    ERROR[ERROR["ESTRPIPE"] = 86] = "ESTRPIPE";
	    ERROR[ERROR["EUSERS"] = 87] = "EUSERS";
	    ERROR[ERROR["ENOTSOCK"] = 88] = "ENOTSOCK";
	    ERROR[ERROR["EDESTADDRREQ"] = 89] = "EDESTADDRREQ";
	    ERROR[ERROR["EMSGSIZE"] = 90] = "EMSGSIZE";
	    ERROR[ERROR["EPROTOTYPE"] = 91] = "EPROTOTYPE";
	    ERROR[ERROR["ENOPROTOOPT"] = 92] = "ENOPROTOOPT";
	    ERROR[ERROR["EPROTONOSUPPORT"] = 93] = "EPROTONOSUPPORT";
	    ERROR[ERROR["ESOCKTNOSUPPORT"] = 94] = "ESOCKTNOSUPPORT";
	    ERROR[ERROR["EOPNOTSUPP"] = 95] = "EOPNOTSUPP";
	    ERROR[ERROR["EPFNOSUPPORT"] = 96] = "EPFNOSUPPORT";
	    ERROR[ERROR["EAFNOSUPPORT"] = 97] = "EAFNOSUPPORT";
	    ERROR[ERROR["EADDRINUSE"] = 98] = "EADDRINUSE";
	    ERROR[ERROR["EADDRNOTAVAIL"] = 99] = "EADDRNOTAVAIL";
	    ERROR[ERROR["ENETDOWN"] = 100] = "ENETDOWN";
	    ERROR[ERROR["ENETUNREACH"] = 101] = "ENETUNREACH";
	    ERROR[ERROR["ENETRESET"] = 102] = "ENETRESET";
	    ERROR[ERROR["ECONNABORTED"] = 103] = "ECONNABORTED";
	    ERROR[ERROR["ECONNRESET"] = 104] = "ECONNRESET";
	    ERROR[ERROR["ENOBUFS"] = 105] = "ENOBUFS";
	    ERROR[ERROR["EISCONN"] = 106] = "EISCONN";
	    ERROR[ERROR["ENOTCONN"] = 107] = "ENOTCONN";
	    ERROR[ERROR["ESHUTDOWN"] = 108] = "ESHUTDOWN";
	    ERROR[ERROR["ETOOMANYREFS"] = 109] = "ETOOMANYREFS";
	    ERROR[ERROR["ETIMEDOUT"] = 110] = "ETIMEDOUT";
	    ERROR[ERROR["ECONNREFUSED"] = 111] = "ECONNREFUSED";
	    ERROR[ERROR["EHOSTDOWN"] = 112] = "EHOSTDOWN";
	    ERROR[ERROR["EHOSTUNREACH"] = 113] = "EHOSTUNREACH";
	    ERROR[ERROR["EALREADY"] = 114] = "EALREADY";
	    ERROR[ERROR["EINPROGRESS"] = 115] = "EINPROGRESS";
	    ERROR[ERROR["ESTALE"] = 116] = "ESTALE";
	    ERROR[ERROR["EUCLEAN"] = 117] = "EUCLEAN";
	    ERROR[ERROR["ENOTNAM"] = 118] = "ENOTNAM";
	    ERROR[ERROR["ENAVAIL"] = 119] = "ENAVAIL";
	    ERROR[ERROR["EISNAM"] = 120] = "EISNAM";
	    ERROR[ERROR["EREMOTEIO"] = 121] = "EREMOTEIO";
	    ERROR[ERROR["EDQUOT"] = 122] = "EDQUOT";
	    ERROR[ERROR["ENOMEDIUM"] = 123] = "ENOMEDIUM";
	    ERROR[ERROR["EMEDIUMTYPE"] = 124] = "EMEDIUMTYPE";
	})(exports.ERROR || (exports.ERROR = {}));
	var ERROR = exports.ERROR;
	exports.ERROR_MSG = (_a = {},
	    _a[ERROR.EPERM] = 'Operation not permitted',
	    _a[ERROR.ENOENT] = 'No such file or directory',
	    _a[ERROR.ESRCH] = 'No such process',
	    _a[ERROR.EINTR] = 'Interrupted system call',
	    _a[ERROR.EIO] = 'I/O error',
	    _a[ERROR.ENXIO] = 'No such device or address',
	    _a[ERROR.E2BIG] = 'Arg list too long',
	    _a[ERROR.ENOEXEC] = 'Exec format error',
	    _a[ERROR.EBADF] = 'Bad file number',
	    _a[ERROR.ECHILD] = 'No child processes',
	    _a[ERROR.EAGAIN] = 'Try again',
	    _a[ERROR.ENOMEM] = 'Out of memory',
	    _a[ERROR.EACCES] = 'Permission denied',
	    _a[ERROR.EFAULT] = 'Bad address',
	    _a[ERROR.ENOTBLK] = 'Block device required',
	    _a[ERROR.EBUSY] = 'Device or resource busy',
	    _a[ERROR.EEXIST] = 'File exists',
	    _a[ERROR.EXDEV] = 'Cross-device link',
	    _a[ERROR.ENODEV] = 'No such device',
	    _a[ERROR.ENOTDIR] = 'Not a directory',
	    _a[ERROR.EISDIR] = 'Is a directory',
	    _a[ERROR.EINVAL] = 'Invalid argument',
	    _a[ERROR.ENFILE] = 'File table overflow',
	    _a[ERROR.EMFILE] = 'Too many open files',
	    _a[ERROR.ENOTTY] = 'Not a typewriter',
	    _a[ERROR.ETXTBSY] = 'Text file busy',
	    _a[ERROR.EFBIG] = 'File too large',
	    _a[ERROR.ENOSPC] = 'No space left on device',
	    _a[ERROR.ESPIPE] = 'Illegal seek',
	    _a[ERROR.EROFS] = 'Read-only file system',
	    _a[ERROR.EMLINK] = 'Too many links',
	    _a[ERROR.EPIPE] = 'Broken pipe',
	    _a[ERROR.EDOM] = 'Math argument out of domain of func',
	    _a[ERROR.ERANGE] = 'Math result not representable',
	    _a[ERROR.EDEADLK] = 'Resource deadlock would occur',
	    _a[ERROR.ENAMETOOLONG] = 'File name too long',
	    _a[ERROR.ENOLCK] = 'No record locks available',
	    _a[ERROR.ENOSYS] = 'Function not implemented',
	    _a[ERROR.ENOTEMPTY] = 'Directory not empty',
	    _a[ERROR.ELOOP] = 'Too many symbolic links encountered',
	    _a[ERROR.ENOMSG] = 'No message of desired type',
	    _a[ERROR.EIDRM] = 'Identifier removed',
	    _a[ERROR.ECHRNG] = 'Channel number out of range',
	    _a[ERROR.EL2NSYNC] = 'Level 2 not synchronized',
	    _a[ERROR.EL3HLT] = 'Level 3 halted',
	    _a[ERROR.EL3RST] = 'Level 3 reset',
	    _a[ERROR.ELNRNG] = 'Link number out of range',
	    _a[ERROR.EUNATCH] = 'Protocol driver not attached',
	    _a[ERROR.ENOCSI] = 'No CSI structure available',
	    _a[ERROR.EL2HLT] = 'Level 2 halted',
	    _a[ERROR.EBADE] = 'Invalid exchange',
	    _a[ERROR.EBADR] = 'Invalid request descriptor',
	    _a[ERROR.EXFULL] = 'Exchange full',
	    _a[ERROR.ENOANO] = 'No anode',
	    _a[ERROR.EBADRQC] = 'Invalid request code',
	    _a[ERROR.EBADSLT] = 'Invalid slot',
	    _a[ERROR.EBFONT] = 'Bad font file format',
	    _a[ERROR.ENOSTR] = 'Device not a stream',
	    _a[ERROR.ENODATA] = 'No data available',
	    _a[ERROR.ETIME] = 'Timer expired',
	    _a[ERROR.ENOSR] = 'Out of streams resources',
	    _a[ERROR.ENONET] = 'Machine is not on the network',
	    _a[ERROR.ENOPKG] = 'Package not installed',
	    _a[ERROR.EREMOTE] = 'Object is remote',
	    _a[ERROR.ENOLINK] = 'Link has been severed',
	    _a[ERROR.EADV] = 'Advertise error',
	    _a[ERROR.ESRMNT] = 'Srmount error',
	    _a[ERROR.ECOMM] = 'Communication error on send',
	    _a[ERROR.EPROTO] = 'Protocol error',
	    _a[ERROR.EMULTIHOP] = 'Multihop attempted',
	    _a[ERROR.EDOTDOT] = 'RFS specific error',
	    _a[ERROR.EBADMSG] = 'Not a data message',
	    _a[ERROR.EOVERFLOW] = 'Value too large for defined data type',
	    _a[ERROR.ENOTUNIQ] = 'Name not unique on network',
	    _a[ERROR.EBADFD] = 'File descriptor in bad state',
	    _a[ERROR.EREMCHG] = 'Remote address changed',
	    _a[ERROR.ELIBACC] = 'Can not access a needed shared library',
	    _a[ERROR.ELIBBAD] = 'Accessing a corrupted shared library',
	    _a[ERROR.ELIBSCN] = '.lib section in a.out corrupted',
	    _a[ERROR.ELIBMAX] = 'Attempting to link in too many shared libraries',
	    _a[ERROR.ELIBEXEC] = 'Cannot exec a shared library directly',
	    _a[ERROR.EILSEQ] = 'Illegal byte sequence',
	    _a[ERROR.ERESTART] = 'Interrupted system call should be restarted',
	    _a[ERROR.ESTRPIPE] = 'Streams pipe error',
	    _a[ERROR.EUSERS] = 'Too many users',
	    _a[ERROR.ENOTSOCK] = 'Socket operation on non-socket',
	    _a[ERROR.EDESTADDRREQ] = 'Destination address required',
	    _a[ERROR.EMSGSIZE] = 'Message too long',
	    _a[ERROR.EPROTOTYPE] = 'Protocol wrong type for socket',
	    _a[ERROR.ENOPROTOOPT] = 'Protocol not available',
	    _a[ERROR.EPROTONOSUPPORT] = 'Protocol not supported',
	    _a[ERROR.ESOCKTNOSUPPORT] = 'Socket type not supported',
	    _a[ERROR.EOPNOTSUPP] = 'Operation not supported on transport endpoint',
	    _a[ERROR.EPFNOSUPPORT] = 'Protocol family not supported',
	    _a[ERROR.EAFNOSUPPORT] = 'Address family not supported by protocol',
	    _a[ERROR.EADDRINUSE] = 'Address already in use',
	    _a[ERROR.EADDRNOTAVAIL] = 'Cannot assign requested address',
	    _a[ERROR.ENETDOWN] = 'Network is down',
	    _a[ERROR.ENETUNREACH] = 'Network is unreachable',
	    _a[ERROR.ENETRESET] = 'Network dropped connection because of reset',
	    _a[ERROR.ECONNABORTED] = 'Software caused connection abort',
	    _a[ERROR.ECONNRESET] = 'Connection reset by peer',
	    _a[ERROR.ENOBUFS] = 'No buffer space available',
	    _a[ERROR.EISCONN] = 'Transport endpoint is already connected',
	    _a[ERROR.ENOTCONN] = 'Transport endpoint is not connected',
	    _a[ERROR.ESHUTDOWN] = 'Cannot send after transport endpoint shutdown',
	    _a[ERROR.ETOOMANYREFS] = 'Too many references: cannot splice',
	    _a[ERROR.ETIMEDOUT] = 'Connection timed out',
	    _a[ERROR.ECONNREFUSED] = 'Connection refused',
	    _a[ERROR.EHOSTDOWN] = 'Host is down',
	    _a[ERROR.EHOSTUNREACH] = 'No route to host',
	    _a[ERROR.EALREADY] = 'Operation already in progress',
	    _a[ERROR.EINPROGRESS] = 'Operation now in progress',
	    _a[ERROR.ESTALE] = 'Stale NFS file handle',
	    _a[ERROR.EUCLEAN] = 'Structure needs cleaning',
	    _a[ERROR.ENOTNAM] = 'Not a XENIX named type file',
	    _a[ERROR.ENAVAIL] = 'No XENIX semaphores available',
	    _a[ERROR.EISNAM] = 'Is a named type file',
	    _a[ERROR.EREMOTEIO] = 'Remote I/O error',
	    _a[ERROR.EDQUOT] = 'Quota exceeded',
	    _a[ERROR.ENOMEDIUM] = 'No medium found',
	    _a[ERROR.EMEDIUMTYPE] = 'Wrong medium type',
	    _a
	);
	(function (SYS) {
	    SYS[SYS["read"] = 0] = "read";
	    SYS[SYS["write"] = 1] = "write";
	    SYS[SYS["open"] = 2] = "open";
	    SYS[SYS["close"] = 3] = "close";
	    SYS[SYS["stat"] = 4] = "stat";
	    SYS[SYS["fstat"] = 5] = "fstat";
	    SYS[SYS["lstat"] = 6] = "lstat";
	    SYS[SYS["poll"] = 7] = "poll";
	    SYS[SYS["lseek"] = 8] = "lseek";
	    SYS[SYS["mmap"] = 9] = "mmap";
	    SYS[SYS["mprotect"] = 10] = "mprotect";
	    SYS[SYS["munmap"] = 11] = "munmap";
	    SYS[SYS["brk"] = 12] = "brk";
	    SYS[SYS["rt_sigaction"] = 13] = "rt_sigaction";
	    SYS[SYS["rt_sigprocmask"] = 14] = "rt_sigprocmask";
	    SYS[SYS["rt_sigreturn"] = 15] = "rt_sigreturn";
	    SYS[SYS["ioctl"] = 16] = "ioctl";
	    SYS[SYS["pread64"] = 17] = "pread64";
	    SYS[SYS["pwrite64"] = 18] = "pwrite64";
	    SYS[SYS["readv"] = 19] = "readv";
	    SYS[SYS["writev"] = 20] = "writev";
	    SYS[SYS["access"] = 21] = "access";
	    SYS[SYS["pipe"] = 22] = "pipe";
	    SYS[SYS["select"] = 23] = "select";
	    SYS[SYS["sched_yield"] = 24] = "sched_yield";
	    SYS[SYS["mremap"] = 25] = "mremap";
	    SYS[SYS["msync"] = 26] = "msync";
	    SYS[SYS["mincore"] = 27] = "mincore";
	    SYS[SYS["madvise"] = 28] = "madvise";
	    SYS[SYS["shmget"] = 29] = "shmget";
	    SYS[SYS["shmat"] = 30] = "shmat";
	    SYS[SYS["shmctl"] = 31] = "shmctl";
	    SYS[SYS["dup"] = 32] = "dup";
	    SYS[SYS["dup2"] = 33] = "dup2";
	    SYS[SYS["pause"] = 34] = "pause";
	    SYS[SYS["nanosleep"] = 35] = "nanosleep";
	    SYS[SYS["getitimer"] = 36] = "getitimer";
	    SYS[SYS["alarm"] = 37] = "alarm";
	    SYS[SYS["setitimer"] = 38] = "setitimer";
	    SYS[SYS["getpid"] = 39] = "getpid";
	    SYS[SYS["sendfile"] = 40] = "sendfile";
	    SYS[SYS["socket"] = 41] = "socket";
	    SYS[SYS["connect"] = 42] = "connect";
	    SYS[SYS["accept"] = 43] = "accept";
	    SYS[SYS["sendto"] = 44] = "sendto";
	    SYS[SYS["recvfrom"] = 45] = "recvfrom";
	    SYS[SYS["sendmsg"] = 46] = "sendmsg";
	    SYS[SYS["recvmsg"] = 47] = "recvmsg";
	    SYS[SYS["shutdown"] = 48] = "shutdown";
	    SYS[SYS["bind"] = 49] = "bind";
	    SYS[SYS["listen"] = 50] = "listen";
	    SYS[SYS["getsockname"] = 51] = "getsockname";
	    SYS[SYS["getpeername"] = 52] = "getpeername";
	    SYS[SYS["socketpair"] = 53] = "socketpair";
	    SYS[SYS["setsockopt"] = 54] = "setsockopt";
	    SYS[SYS["getsockopt"] = 55] = "getsockopt";
	    SYS[SYS["shmdt"] = 67] = "shmdt";
	    SYS[SYS["fcntl"] = 72] = "fcntl";
	    SYS[SYS["fsync"] = 74] = "fsync";
	    SYS[SYS["fdatasync"] = 75] = "fdatasync";
	    SYS[SYS["truncate"] = 76] = "truncate";
	    SYS[SYS["ftruncate"] = 77] = "ftruncate";
	    SYS[SYS["getdents"] = 78] = "getdents";
	    SYS[SYS["getcwd"] = 79] = "getcwd";
	    SYS[SYS["chdir"] = 80] = "chdir";
	    SYS[SYS["fchdir"] = 81] = "fchdir";
	    SYS[SYS["rename"] = 82] = "rename";
	    SYS[SYS["mkdir"] = 83] = "mkdir";
	    SYS[SYS["rmdir"] = 84] = "rmdir";
	    SYS[SYS["creat"] = 85] = "creat";
	    SYS[SYS["link"] = 86] = "link";
	    SYS[SYS["unlink"] = 87] = "unlink";
	    SYS[SYS["symlink"] = 88] = "symlink";
	    SYS[SYS["readlink"] = 89] = "readlink";
	    SYS[SYS["chmod"] = 90] = "chmod";
	    SYS[SYS["fchmod"] = 91] = "fchmod";
	    SYS[SYS["chown"] = 92] = "chown";
	    SYS[SYS["fchown"] = 93] = "fchown";
	    SYS[SYS["lchown"] = 94] = "lchown";
	    SYS[SYS["umask"] = 95] = "umask";
	    SYS[SYS["gettimeofday"] = 96] = "gettimeofday";
	    SYS[SYS["getrlimit"] = 97] = "getrlimit";
	    SYS[SYS["getrusage"] = 98] = "getrusage";
	    SYS[SYS["getuid"] = 102] = "getuid";
	    SYS[SYS["getgid"] = 104] = "getgid";
	    SYS[SYS["geteuid"] = 107] = "geteuid";
	    SYS[SYS["getegid"] = 108] = "getegid";
	    SYS[SYS["setpgid"] = 109] = "setpgid";
	    SYS[SYS["getppid"] = 110] = "getppid";
	    SYS[SYS["utime"] = 132] = "utime";
	    SYS[SYS["epoll_create"] = 213] = "epoll_create";
	    SYS[SYS["getdents64"] = 217] = "getdents64";
	    SYS[SYS["epoll_wait"] = 232] = "epoll_wait";
	    SYS[SYS["epoll_ctl"] = 233] = "epoll_ctl";
	    SYS[SYS["utimes"] = 235] = "utimes";
	    SYS[SYS["inotify_init"] = 253] = "inotify_init";
	    SYS[SYS["inotify_add_watch"] = 254] = "inotify_add_watch";
	    SYS[SYS["inotify_rm_watch"] = 255] = "inotify_rm_watch";
	    SYS[SYS["mkdirat"] = 258] = "mkdirat";
	    SYS[SYS["futimesat"] = 261] = "futimesat";
	    SYS[SYS["utimensat"] = 280] = "utimensat";
	    SYS[SYS["eventfd"] = 284] = "eventfd";
	    SYS[SYS["accept4"] = 288] = "accept4";
	    SYS[SYS["epoll_create1"] = 291] = "epoll_create1";
	    SYS[SYS["inotify_init1"] = 294] = "inotify_init1";
	})(exports.SYS || (exports.SYS = {}));
	var SYS = exports.SYS;
	exports.ARGS = (_b = {},
	    _b[SYS.open] = [['const char*', 'pathname'], ['int', 'flags'], ['mode_t', 'mode']],
	    _b[SYS.close] = [['int', 'fd']],
	    _b[SYS.write] = [['int', 'fd'], ['const void*', 'buf'], ['size_t', 'count']],
	    _b[SYS.read] = [['int', 'fd'], ['void*', 'buf'], ['size_t', 'count']],
	    _b[SYS.getcwd] = [['char*', 'buf'], ['size_t', 'size']],
	    _b[SYS.stat] = [['const char*', 'pathname'], ['struct stat*', 'buf']],
	    _b[SYS.fstat] = [['int', 'fd'], ['struct stat*', 'buf']],
	    _b[SYS.lstat] = [['const char*', 'pathname'], ['struct stat*', 'buf']],
	    _b[SYS.socket] = [['int', 'domain'], ['int', 'type'], ['int', 'protocol']],
	    _b[SYS.connect] = [['int', 'sockfd'], ['const struct sockaddr*', 'addr'], ['socklen_t', 'addrlen']],
	    _b[SYS.accept] = [['int', 'sockfd'], ['struct sockaddr*', 'addr'], ['socklen_t*', 'addrlen']],
	    _b[SYS.sendto] = [['int', 'sockfd'], ['void*', 'buf'], ['size_t', 'len'], ['int', 'flags'], ['sockaddr*', 'dest_addr'], ['socklen_t', 'addrlen']],
	    _b[SYS.recvfrom] = [['int', 'sockfd'], ['void*', 'buf'], ['size_t', 'len'], ['int', 'flags'], ['sockaddr*', 'src_addr'], ['socklen_t*', 'addrlen']],
	    _b[SYS.bind] = [['int', 'sockfd'], ['sockaddr*', 'addr'], ['socklen_t', 'addrlen']],
	    _b[SYS.listen] = [['int', 'socket'], ['int', 'backlog']],
	    _b[SYS.getsockopt] = [['int', 'sockfd'], ['int', 'level'], ['int', 'optname'], ['void*', 'optval'], ['socklen_t*', 'optlen']],
	    _b[SYS.setsockopt] = [['int', 'sockfd'], ['int', 'level'], ['int', 'optname'], ['void*', 'optval'], ['socklen_t', 'optlen']],
	    _b[SYS.epoll_create] = [['int', 'size']],
	    _b[SYS.epoll_create1] = [['int', 'flags']],
	    _b[SYS.epoll_wait] = [['int', 'epfd'], ['epoll_event*', 'events'], ['int', 'maxevents'], ['int', 'timeout']],
	    _b[SYS.epoll_ctl] = [['int', 'epfd'], ['int', 'op'], ['int', 'fd'], ['struct epoll_event*', 'event']],
	    _b[SYS.eventfd] = [['unsigned int', 'initval'], ['int', 'flags']],
	    _b[SYS.mmap] = [['void*', 'addr'], ['size_t', 'length'], ['int', 'prot'], ['int', 'flags'], ['int', 'fd'], ['off_t', 'offset']],
	    _b[SYS.munmap] = [['void*', 'addr'], ['size_t', 'length']],
	    _b
	);
	exports.RESULT = (_c = {},
	    _c[SYS.write] = 'bytes written',
	    _c[SYS.read] = 'bytes read',
	    _c[SYS.getcwd] = 'path length',
	    _c[SYS.getpid] = 'process ID',
	    _c[SYS.epoll_create1] = 'epoll file descriptor',
	    _c
	);
	var _a, _b, _c;


/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";
	exports.CODES = (_a = {},
	    _a[0] = [0, 0],
	    _a[1] = [1, 21],
	    _a[2] = [2, 22],
	    _a[3] = [3, 23],
	    _a[4] = [4, 24],
	    _a[5] = [5, 25],
	    _a[6] = [7, 27],
	    _a[7] = [8, 28],
	    _a[8] = [9, 29],
	    _a[9] = [39, 39],
	    _a[10] = [30, 39],
	    _a[11] = [31, 39],
	    _a[12] = [32, 39],
	    _a[13] = [33, 39],
	    _a[14] = [34, 39],
	    _a[15] = [35, 39],
	    _a[16] = [36, 39],
	    _a[17] = [97, 39],
	    _a[18] = [90, 39],
	    _a[19] = [37, 39],
	    _a[20] = [91, 39],
	    _a[21] = [92, 39],
	    _a[22] = [93, 39],
	    _a[23] = [94, 39],
	    _a[24] = [95, 39],
	    _a[25] = [94, 39],
	    _a[26] = [40, 49],
	    _a[27] = [41, 49],
	    _a[28] = [42, 49],
	    _a[29] = [43, 49],
	    _a[30] = [44, 49],
	    _a[31] = [45, 49],
	    _a[32] = [46, 49],
	    _a[33] = [107, 49],
	    _a[34] = [100, 49],
	    _a[35] = [101, 49],
	    _a[36] = [102, 49],
	    _a[37] = [103, 49],
	    _a[38] = [104, 49],
	    _a[39] = [105, 49],
	    _a[40] = [106, 49],
	    _a[41] = [47, 49],
	    _a
	);
	function style(msg, style) {
	    var _a = exports.CODES[style], start = _a[0], end = _a[1];
	    return "\u001B[" + start + "m" + msg + "\u001B[" + end + "m";
	}
	exports.style = style;
	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	function interval(ms) {
	    if (ms >= d)
	        return Math.round(ms / d) + 'd';
	    if (ms >= h)
	        return Math.round(ms / h) + 'h';
	    if (ms >= m)
	        return Math.round(ms / m) + 'm';
	    if (ms >= s)
	        return Math.round(ms / s) + 's';
	    return ms + 'ms';
	}
	exports.interval = interval;
	var _a;


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	var UInt64 = (function () {
	    function UInt64() {
	    }
	    UInt64.hi = function (a, lo) {
	        if (lo === void 0) { lo = UInt64.lo(a); }
	        var hi = a - lo;
	        hi /= 4294967296;
	        if ((hi < 0) || (hi >= 1048576))
	            throw Error("Not an int52: " + a);
	        return hi;
	    };
	    UInt64.lo = function (a) {
	        var lo = a | 0;
	        if (lo < 0)
	            lo += 4294967296;
	        return lo;
	    };
	    UInt64.joinToNumber = function (hi, lo) {
	        if (lo < 0)
	            lo += 4294967296;
	        return hi * 4294967296 + lo;
	    };
	    return UInt64;
	}());
	exports.UInt64 = UInt64;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Buffer = __webpack_require__(7).Buffer;


	var isError = function(err) { return err instanceof Error; };
	var kDefaultMaxLength = 100;


	function extend(obj1, obj2) {
	    var objs = [];
	    for (var _i = 2; _i < arguments.length; _i++) {
	        objs[_i - 2] = arguments[_i];
	    }
	    if (typeof obj2 === 'object')
	        for (var i in obj2)
	            obj1[i] = obj2[i];
	    if (objs.length)
	        return extend.apply(null, [obj1].concat(objs));
	    else
	        return obj1;
	}
	exports.extend = extend;


	var Debug;

	function tryStringify(arg) {
	    try {
	        return JSON.stringify(arg);
	    } catch (_) {
	        return '[Circular]';
	    }
	}

	exports.format = function(f) {
	    if (typeof f !== 'string') {
	        const objects = new Array(arguments.length);
	        for (var index = 0; index < arguments.length; index++) {
	            objects[index] = inspect(arguments[index]);
	        }
	        return objects.join(' ');
	    }

	    var argLen = arguments.length;

	    if (argLen === 1) return f;

	    var str = '';
	    var a = 1;
	    var lastPos = 0;
	    for (var i = 0; i < f.length;) {
	        if (f.charCodeAt(i) === 37/*'%'*/ && i + 1 < f.length) {
	            switch (f.charCodeAt(i + 1)) {
	                case 100: // 'd'
	                    if (a >= argLen)
	                        break;
	                    if (lastPos < i)
	                        str += f.slice(lastPos, i);
	                    str += Number(arguments[a++]);
	                    lastPos = i = i + 2;
	                    continue;
	                case 106: // 'j'
	                    if (a >= argLen)
	                        break;
	                    if (lastPos < i)
	                        str += f.slice(lastPos, i);
	                    str += tryStringify(arguments[a++]);
	                    lastPos = i = i + 2;
	                    continue;
	                case 115: // 's'
	                    if (a >= argLen)
	                        break;
	                    if (lastPos < i)
	                        str += f.slice(lastPos, i);
	                    str += String(arguments[a++]);
	                    lastPos = i = i + 2;
	                    continue;
	                case 37: // '%'
	                    if (lastPos < i)
	                        str += f.slice(lastPos, i);
	                    str += '%';
	                    lastPos = i = i + 2;
	                    continue;
	            }
	        }
	        ++i;
	    }
	    if (lastPos === 0)
	        str = f;
	    else if (lastPos < f.length)
	        str += f.slice(lastPos);
	    while (a < argLen) {
	        const x = arguments[a++];
	        if (x === null || (typeof x !== 'object' && typeof x !== 'symbol')) {
	            str += ' ' + x;
	        } else {
	            str += ' ' + inspect(x);
	        }
	    }

	    return str;
	};




	var debugs = {};
	var debugEnviron;
	exports.debuglog = function(set) {
	    if (debugEnviron === undefined)
	        debugEnviron = process.env.NODE_DEBUG || '';
	    set = set.toUpperCase();
	    if (!debugs[set]) {
	        var res = new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron);
	        if (res) {
	            var pid = process.pid;
	            debugs[set] = function() {
	                var msg = exports.format.apply(exports, arguments);
	                console.error('%s %d: %s', set, pid, msg);
	            };
	        } else {
	            debugs[set] = function() {};
	        }
	    }
	    return debugs[set];
	};  


	/**
	 * Echos the value of a value. Tries to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	    // default options
	    var ctx = {
	        seen: [],
	        stylize: stylizeNoColor
	    };
	    // legacy...
	    if (arguments.length >= 3) ctx.depth = arguments[2];
	    if (arguments.length >= 4) ctx.colors = arguments[3];
	    if (typeof opts === 'boolean') {
	        // legacy...
	        ctx.showHidden = opts;
	    } else if (opts) {
	        // got an "options" object
	        exports._extend(ctx, opts);
	    }
	    // set default options
	    if (ctx.showHidden === undefined) ctx.showHidden = false;
	    if (ctx.depth === undefined) ctx.depth = 2;
	    if (ctx.colors === undefined) ctx.colors = false;
	    if (ctx.customInspect === undefined) ctx.customInspect = true;
	    if (ctx.showProxy === undefined) ctx.showProxy = false;
	    if (ctx.colors) ctx.stylize = stylizeWithColor;
	    if (ctx.maxArrayLength === undefined) ctx.maxArrayLength = kDefaultMaxLength;
	    if (ctx.maxArrayLength === null) ctx.maxArrayLength = Infinity;
	    return formatValue(ctx, obj, ctx.depth);
	}
	exports.inspect = inspect;


	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	    'bold': [1, 22],
	    'italic': [3, 23],
	    'underline': [4, 24],
	    'inverse': [7, 27],
	    'white': [37, 39],
	    'grey': [90, 39],
	    'black': [30, 39],
	    'blue': [34, 39],
	    'cyan': [36, 39],
	    'green': [32, 39],
	    'magenta': [35, 39],
	    'red': [31, 39],
	    'yellow': [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	    'special': 'cyan',
	    'number': 'yellow',
	    'boolean': 'yellow',
	    'undefined': 'grey',
	    'null': 'bold',
	    'string': 'green',
	    'symbol': 'green',
	    'date': 'magenta',
	    // "name": intentionally not styling
	    'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	    var style = inspect.styles[styleType];

	    if (style) {
	        return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	            '\u001b[' + inspect.colors[style][1] + 'm';
	    } else {
	        return str;
	    }
	}


	function stylizeNoColor(str, styleType) {
	    return str;
	}


	function arrayToHash(array) {
	    var hash = Object.create(null);

	    for (var i = 0; i < array.length; i++) {
	        var val = array[i];
	        hash[val] = true;
	    }

	    return hash;
	}


	function getConstructorOf(obj) {
	    while (obj) {
	        var descriptor = Object.getOwnPropertyDescriptor(obj, 'constructor');
	        if (descriptor !== undefined &&
	            typeof descriptor.value === 'function' &&
	            descriptor.value.name !== '') {
	            return descriptor.value;
	        }

	        obj = Object.getPrototypeOf(obj);
	    }

	    return null;
	}


	function ensureDebugIsInitialized() {
	    if (Debug === undefined) {
	        const runInDebugContext = __webpack_require__(10).runInDebugContext;
	        Debug = runInDebugContext('Debug');
	    }
	}


	function inspectPromise(p) {
	    ensureDebugIsInitialized();
	    // Only create a mirror if the object is a Promise.
	    if (!binding.isPromise(p))
	        return null;
	    const mirror = Debug.MakeMirror(p, true);
	    return {status: mirror.status(), value: mirror.promiseValue().value_};
	}


	function formatValue(ctx, value, recurseTimes) {
	    if (ctx.showProxy &&
	        ((typeof value === 'object' && value !== null) ||
	        typeof value === 'function')) {
	        var proxy = undefined;
	        var proxyCache = ctx.proxyCache;
	        if (!proxyCache)
	            proxyCache = ctx.proxyCache = new Map();
	        // Determine if we've already seen this object and have
	        // determined that it either is or is not a proxy.
	        if (proxyCache.has(value)) {
	            // We've seen it, if the value is not undefined, it's a Proxy.
	            proxy = proxyCache.get(value);
	        } else {
	            // Haven't seen it. Need to check.
	            // If it's not a Proxy, this will return undefined.
	            // Otherwise, it'll return an array. The first item
	            // is the target, the second item is the handler.
	            // We ignore (and do not return) the Proxy isRevoked property.
	            proxy = binding.getProxyDetails(value);
	            if (proxy) {
	                // We know for a fact that this isn't a Proxy.
	                // Mark it as having already been evaluated.
	                // We do this because this object is passed
	                // recursively to formatValue below in order
	                // for it to get proper formatting, and because
	                // the target and handle objects also might be
	                // proxies... it's unfortunate but necessary.
	                proxyCache.set(proxy, undefined);
	            }
	            // If the object is not a Proxy, then this stores undefined.
	            // This tells the code above that we've already checked and
	            // ruled it out. If the object is a proxy, this caches the
	            // results of the getProxyDetails call.
	            proxyCache.set(value, proxy);
	        }
	        if (proxy) {
	            return 'Proxy ' + formatValue(ctx, proxy, recurseTimes);
	        }
	    }

	    // Provide a hook for user-specified inspect functions.
	    // Check that value is an object with an inspect function on it
	    if (ctx.customInspect &&
	        value &&
	        typeof value.inspect === 'function' &&
	        // Filter out the util module, it's inspect function is special
	        value.inspect !== exports.inspect &&
	        // Also filter out any prototype objects using the circular check.
	        !(value.constructor && value.constructor.prototype === value)) {
	        var ret = value.inspect(recurseTimes, ctx);
	        if (typeof ret !== 'string') {
	            ret = formatValue(ctx, ret, recurseTimes);
	        }
	        return ret;
	    }

	    // Primitive types cannot have properties
	    var primitive = formatPrimitive(ctx, value);
	    if (primitive) {
	        return primitive;
	    }

	    // Look up the keys of the object.
	    var keys = Object.keys(value);
	    var visibleKeys = arrayToHash(keys);

	    if (ctx.showHidden) {
	        keys = Object.getOwnPropertyNames(value);
	        keys = keys.concat(Object.getOwnPropertySymbols(value));
	    }

	    // This could be a boxed primitive (new String(), etc.), check valueOf()
	    // NOTE: Avoid calling `valueOf` on `Date` instance because it will return
	    // a number which, when object has some additional user-stored `keys`,
	    // will be printed out.
	    var formatted;
	    var raw = value;
	    try {
	        // the .valueOf() call can fail for a multitude of reasons
	        if (!isDate(value))
	            raw = value.valueOf();
	    } catch (e) {
	        // ignore...
	    }

	    if (typeof raw === 'string') {
	        // for boxed Strings, we have to remove the 0-n indexed entries,
	        // since they just noisy up the output and are redundant
	        keys = keys.filter(function(key) {
	            return !(key >= 0 && key < raw.length);
	        });
	    }

	    // Some type of object without properties can be shortcutted.
	    if (keys.length === 0) {
	        if (typeof value === 'function') {
	            var name = value.name ? ': ' + value.name : '';
	            return ctx.stylize('[Function' + name + ']', 'special');
	        }
	        if (isRegExp(value)) {
	            return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	        }
	        if (isDate(value)) {
	            if (Number.isNaN(value.getTime())) {
	                return ctx.stylize(value.toString(), 'date');
	            } else {
	                return ctx.stylize(Date.prototype.toISOString.call(value), 'date');
	            }
	        }
	        if (isError(value)) {
	            return formatError(value);
	        }
	        // now check the `raw` value to handle boxed primitives
	        if (typeof raw === 'string') {
	            formatted = formatPrimitiveNoColor(ctx, raw);
	            return ctx.stylize('[String: ' + formatted + ']', 'string');
	        }
	        if (typeof raw === 'number') {
	            formatted = formatPrimitiveNoColor(ctx, raw);
	            return ctx.stylize('[Number: ' + formatted + ']', 'number');
	        }
	        if (typeof raw === 'boolean') {
	            formatted = formatPrimitiveNoColor(ctx, raw);
	            return ctx.stylize('[Boolean: ' + formatted + ']', 'boolean');
	        }
	        // Fast path for ArrayBuffer.  Can't do the same for DataView because it
	        // has a non-primitive .buffer property that we need to recurse for.
	        if (value instanceof ArrayBuffer) {
	            return getConstructorOf(value).name +
	                ' byteLength: ' + formatNumber(ctx, value.byteLength);
	        }
	    }

	    var constructor = getConstructorOf(value);
	    var base = '', empty = false, braces;
	    var formatter = formatObject;

	    // We can't compare constructors for various objects using a comparison like
	    // `constructor === Array` because the object could have come from a different
	    // context and thus the constructor won't match. Instead we check the
	    // constructor names (including those up the prototype chain where needed) to
	    // determine object types.
	    if (Array.isArray(value)) {
	        // Unset the constructor to prevent "Array [...]" for ordinary arrays.
	        if (constructor && constructor.name === 'Array')
	            constructor = null;
	        braces = ['[', ']'];
	        empty = value.length === 0;
	        formatter = formatArray;
	    // } else if (binding.isSet(value)) {
	    //     braces = ['{', '}'];
	        // With `showHidden`, `length` will display as a hidden property for
	        // arrays. For consistency's sake, do the same for `size`, even though this
	        // property isn't selected by Object.getOwnPropertyNames().
	        // if (ctx.showHidden)
	        //     keys.unshift('size');
	        // empty = value.size === 0;
	        // formatter = formatSet;
	    // } else if (binding.isMap(value)) {
	    //     braces = ['{', '}'];
	        // Ditto.
	        // if (ctx.showHidden)
	        //     keys.unshift('size');
	        // empty = value.size === 0;
	        // formatter = formatMap;
	    } else if (value instanceof ArrayBuffer) {
	        braces = ['{', '}'];
	        keys.unshift('byteLength');
	        visibleKeys.byteLength = true;
	    } else if (value instanceof DataView) {
	        braces = ['{', '}'];
	        // .buffer goes last, it's not a primitive like the others.
	        keys.unshift('byteLength', 'byteOffset', 'buffer');
	        visibleKeys.byteLength = true;
	        visibleKeys.byteOffset = true;
	        visibleKeys.buffer = true;
	    // } else if (value instanceof TypedArray) {
	    //     braces = ['[', ']'];
	    //     formatter = formatTypedArray;
	        // if (ctx.showHidden) {
	            // .buffer goes last, it's not a primitive like the others.
	            // keys.unshift('BYTES_PER_ELEMENT',
	            //     'length',
	            //     'byteLength',
	            //     'byteOffset',
	            //     'buffer');
	        // }
	    } else {
	        // var promiseInternals = inspectPromise(value);
	        // if (promiseInternals) {
	        //     braces = ['{', '}'];
	        //     formatter = formatPromise;
	        // } else {
	            // if (binding.isMapIterator(value)) {
	            //     constructor = { name: 'MapIterator' };
	            //     braces = ['{', '}'];
	            //     empty = false;
	            //     formatter = formatCollectionIterator;
	            // } else if (binding.isSetIterator(value)) {
	            //     constructor = { name: 'SetIterator' };
	            //     braces = ['{', '}'];
	            //     empty = false;
	            //     formatter = formatCollectionIterator;
	            // } else {
	                // Unset the constructor to prevent "Object {...}" for ordinary objects.
	                if (constructor && constructor.name === 'Object')
	                    constructor = null;
	                braces = ['{', '}'];
	                empty = true;  // No other data than keys.
	            // }
	        // }
	    }

	    empty = empty === true && keys.length === 0;

	    // Make functions say that they are functions
	    if (typeof value === 'function') {
	        var n = value.name ? ': ' + value.name : '';
	        base = ' [Function' + n + ']';
	    }

	    // Make RegExps say that they are RegExps
	    if (isRegExp(value)) {
	        base = ' ' + RegExp.prototype.toString.call(value);
	    }

	    // Make dates with properties first say the date
	    if (isDate(value)) {
	        base = ' ' + Date.prototype.toISOString.call(value);
	    }

	    // Make error with message first say the error
	    if (isError(value)) {
	        base = ' ' + formatError(value);
	    }

	    // Make boxed primitive Strings look like such
	    if (typeof raw === 'string') {
	        formatted = formatPrimitiveNoColor(ctx, raw);
	        base = ' ' + '[String: ' + formatted + ']';
	    }

	    // Make boxed primitive Numbers look like such
	    if (typeof raw === 'number') {
	        formatted = formatPrimitiveNoColor(ctx, raw);
	        base = ' ' + '[Number: ' + formatted + ']';
	    }

	    // Make boxed primitive Booleans look like such
	    if (typeof raw === 'boolean') {
	        formatted = formatPrimitiveNoColor(ctx, raw);
	        base = ' ' + '[Boolean: ' + formatted + ']';
	    }

	    // Add constructor name if available
	    if (base === '' && constructor)
	        braces[0] = constructor.name + ' ' + braces[0];

	    if (empty === true) {
	        return braces[0] + base + braces[1];
	    }

	    if (recurseTimes < 0) {
	        if (isRegExp(value)) {
	            return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	        } else {
	            return ctx.stylize('[Object]', 'special');
	        }
	    }

	    ctx.seen.push(value);

	    var output = formatter(ctx, value, recurseTimes, visibleKeys, keys);

	    ctx.seen.pop();

	    return reduceToSingleString(output, base, braces);
	}

	function formatNumber(ctx, value) {
	    // Format -0 as '-0'. Strict equality won't distinguish 0 from -0,
	    // so instead we use the fact that 1 / -0 < 0 whereas 1 / 0 > 0 .
	    if (value === 0 && 1 / value < 0)
	        return ctx.stylize('-0', 'number');
	    return ctx.stylize('' + value, 'number');
	}


	function formatPrimitive(ctx, value) {
	    if (value === undefined)
	        return ctx.stylize('undefined', 'undefined');

	    // For some reason typeof null is "object", so special case here.
	    if (value === null)
	        return ctx.stylize('null', 'null');

	    var type = typeof value;

	    if (type === 'string') {
	        var simple = '\'' +
	            JSON.stringify(value)
	                .replace(/^"|"$/g, '')
	                .replace(/'/g, "\\'")
	                .replace(/\\"/g, '"') +
	            '\'';
	        return ctx.stylize(simple, 'string');
	    }
	    if (type === 'number')
	        return formatNumber(ctx, value);
	    if (type === 'boolean')
	        return ctx.stylize('' + value, 'boolean');
	    // es6 symbol primitive
	    if (type === 'symbol')
	        return ctx.stylize(value.toString(), 'symbol');
	}


	function formatPrimitiveNoColor(ctx, value) {
	    var stylize = ctx.stylize;
	    ctx.stylize = stylizeNoColor;
	    var str = formatPrimitive(ctx, value);
	    ctx.stylize = stylize;
	    return str;
	}


	function formatError(value) {
	    return value.stack || '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatObject(ctx, value, recurseTimes, visibleKeys, keys) {
	    return keys.map(function(key) {
	        return formatProperty(ctx, value, recurseTimes, visibleKeys, key, false);
	    });
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	    var output = [];
	    const maxLength = Math.min(Math.max(0, ctx.maxArrayLength), value.length);
	    const remaining = value.length - maxLength;
	    for (var i = 0; i < maxLength; ++i) {
	        if (hasOwnProperty(value, String(i))) {
	            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	                String(i), true));
	        } else {
	            output.push('');
	        }
	    }
	    if (remaining > 0) {
	        output.push("... ${remaining} more item${remaining > 1 ? 's' : ''}");
	    }
	    keys.forEach(function(key) {
	        if (typeof key === 'symbol' || !key.match(/^\d+$/)) {
	            output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	                key, true));
	        }
	    });
	    return output;
	}


	function formatTypedArray(ctx, value, recurseTimes, visibleKeys, keys) {
	    const maxLength = Math.min(Math.max(0, ctx.maxArrayLength), value.length);
	    const remaining = value.length - maxLength;
	    var output = new Array(maxLength);
	    for (var i = 0; i < maxLength; ++i)
	        output[i] = formatNumber(ctx, value[i]);
	    if (remaining > 0) {
	        output.push("... " + remaining + " more item" + (remaining > 1 ? 's' : ''));
	    }
	    for (var i = 0; i < keys.length; i++) {
	        var key = keys[i];
	        if (typeof key === 'symbol' || !key.match(/^\d+$/)) {
	            output.push(
	                formatProperty(ctx, value, recurseTimes, visibleKeys, key, true));
	        }
	    }
	    return output;
	}


	function formatSet(ctx, value, recurseTimes, visibleKeys, keys) {
	    var output = [];
	    value.forEach(function(v) {
	        var nextRecurseTimes = recurseTimes === null ? null : recurseTimes - 1;
	        var str = formatValue(ctx, v, nextRecurseTimes);
	        output.push(str);
	    });
	    keys.forEach(function(key) {
	        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	            key, false));
	    });
	    return output;
	}


	function formatMap(ctx, value, recurseTimes, visibleKeys, keys) {
	    var output = [];
	    value.forEach(function(v, k) {
	        var nextRecurseTimes = recurseTimes === null ? null : recurseTimes - 1;
	        var str = formatValue(ctx, k, nextRecurseTimes);
	        str += ' => ';
	        str += formatValue(ctx, v, nextRecurseTimes);
	        output.push(str);
	    });
	    keys.forEach(function(key) {
	        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	            key, false));
	    });
	    return output;
	}

	function formatCollectionIterator(ctx, value, recurseTimes, visibleKeys, keys) {
	    ensureDebugIsInitialized();
	    const mirror = Debug.MakeMirror(value, true);
	    var nextRecurseTimes = recurseTimes === null ? null : recurseTimes - 1;
	    var vals = mirror.preview();
	    var output = [];
	    for(var i = 0; i < vals.length; i++) {
	        var o = vals[i];
	        output.push(formatValue(ctx, o, nextRecurseTimes));
	    }
	    return output;
	}

	function formatPromise(ctx, value, recurseTimes, visibleKeys, keys) {
	    var output = [];
	    var internals = inspectPromise(value);
	    if (internals.status === 'pending') {
	        output.push('<pending>');
	    } else {
	        var nextRecurseTimes = recurseTimes === null ? null : recurseTimes - 1;
	        var str = formatValue(ctx, internals.value, nextRecurseTimes);
	        if (internals.status === 'rejected') {
	            output.push('<rejected> ' + str);
	        } else {
	            output.push(str);
	        }
	    }
	    keys.forEach(function(key) {
	        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	            key, false));
	    });
	    return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	    var name, str, desc;
	    desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	    if (desc.get) {
	        if (desc.set) {
	            str = ctx.stylize('[Getter/Setter]', 'special');
	        } else {
	            str = ctx.stylize('[Getter]', 'special');
	        }
	    } else {
	        if (desc.set) {
	            str = ctx.stylize('[Setter]', 'special');
	        }
	    }
	    if (!hasOwnProperty(visibleKeys, key)) {
	        if (typeof key === 'symbol') {
	            name = '[' + ctx.stylize(key.toString(), 'symbol') + ']';
	        } else {
	            name = '[' + key + ']';
	        }
	    }
	    if (!str) {
	        if (ctx.seen.indexOf(desc.value) < 0) {
	            if (recurseTimes === null) {
	                str = formatValue(ctx, desc.value, null);
	            } else {
	                str = formatValue(ctx, desc.value, recurseTimes - 1);
	            }
	            if (str.indexOf('\n') > -1) {
	                if (array) {
	                    str = str.replace(/\n/g, '\n  ');
	                } else {
	                    str = str.replace(/(^|\n)/g, '\n   ');
	                }
	            }
	        } else {
	            str = ctx.stylize('[Circular]', 'special');
	        }
	    }
	    if (name === undefined) {
	        if (array && key.match(/^\d+$/)) {
	            return str;
	        }
	        name = JSON.stringify('' + key);
	        if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	            name = name.substr(1, name.length - 2);
	            name = ctx.stylize(name, 'name');
	        } else {
	            name = name.replace(/'/g, "\\'")
	                .replace(/\\"/g, '"')
	                .replace(/(^"|"$)/g, "'")
	                .replace(/\\\\/g, '\\');
	            name = ctx.stylize(name, 'string');
	        }
	    }

	    return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	    var length = output.reduce(function(prev, cur) {
	        return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	    }, 0);

	    if (length > 60) {
	        return braces[0] +
	            // If the opening "brace" is too large, like in the case of "Set {",
	            // we need to force the first item to be on the next line or the
	            // items will not line up correctly.
	            (base === '' && braces[0].length === 1 ? '' : base + '\n ') +
	            ' ' +
	            output.join(',\n  ') +
	            ' ' +
	            braces[1];
	    }

	    return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	exports.isArray = Array.isArray;

	function isBoolean(arg) {
	    return typeof arg === 'boolean';
	}
	exports.isBoolean = isBoolean;

	function isNull(arg) {
	    return arg === null;
	}
	exports.isNull = isNull;

	function isNullOrUndefined(arg) {
	    return arg === null || arg === undefined;
	}
	exports.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	    return typeof arg === 'number';
	}
	exports.isNumber = isNumber;

	function isString(arg) {
	    return typeof arg === 'string';
	}
	exports.isString = isString;

	function isSymbol(arg) {
	    return typeof arg === 'symbol';
	}
	exports.isSymbol = isSymbol;

	function isUndefined(arg) {
	    return arg === undefined;
	}
	exports.isUndefined = isUndefined;

	function isRegExp(re) {
	    return re instanceof RegExp;
	}
	exports.isRegExp = isRegExp;

	function isObject(arg) {
	    return arg !== null && typeof arg === 'object';
	}
	exports.isObject = isObject;

	function isDate(d) {
	    return d instanceof Date;
	}
	exports.isDate = isDate;

	exports.isError = isError;

	function isFunction(arg) {
	    return typeof arg === 'function';
	}
	exports.isFunction = isFunction;

	function isPrimitive(arg) {
	    return arg === null ||
	        typeof arg !== 'object' && typeof arg !== 'function';
	}
	exports.isPrimitive = isPrimitive;

	exports.isBuffer = Buffer.isBuffer;

	function pad(n) {
	    return n < 10 ? '0' + n.toString(10) : n.toString(10);
	}


	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
	    'Oct', 'Nov', 'Dec'];

	// 26 Feb 16:19:34
	function timestamp() {
	    var d = new Date();
	    var time = [pad(d.getHours()),
	        pad(d.getMinutes()),
	        pad(d.getSeconds())].join(':');
	    return [d.getDate(), months[d.getMonth()], time].join(' ');
	}


	// log is just a thin wrapper to console.log that prepends a timestamp
	exports.log = function() {
	    console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
	};


	/**
	 * Inherit the prototype methods from one constructor into another.
	 *
	 * The Function.prototype.inherits from lang.js rewritten as a standalone
	 * function (not on Function.prototype). NOTE: If this file is to be loaded
	 * during bootstrapping this function needs to be rewritten using some native
	 * functions as prototype setup using normal JavaScript does not work as
	 * expected during bootstrapping (see mirror.js in r114903).
	 *
	 * @param {function} ctor Constructor function which needs to inherit the
	 *     prototype.
	 * @param {function} superCtor Constructor function to inherit prototype from.
	 * @throws {TypeError} Will error if either constructor is null, or if
	 *     the super constructor lacks a prototype.
	 */
	exports.inherits = function(ctor, superCtor) {

	    if (ctor === undefined || ctor === null)
	        throw new TypeError('The constructor to "inherits" must not be ' +
	            'null or undefined');

	    if (superCtor === undefined || superCtor === null)
	        throw new TypeError('The super constructor to "inherits" must not ' +
	            'be null or undefined');

	    if (superCtor.prototype === undefined)
	        throw new TypeError('The super constructor to "inherits" must ' +
	            'have a prototype');

	    ctor.super_ = superCtor;
	    Object.setPrototypeOf(ctor.prototype, superCtor.prototype);
	};

	exports._extend = function(origin, add) {
	    // Don't do anything if add isn't an object
	    if (add === null || typeof add !== 'object') return origin;

	    var keys = Object.keys(add);
	    var i = keys.length;
	    while (i--) {
	        origin[keys[i]] = add[keys[i]];
	    }
	    return origin;
	};

	function hasOwnProperty(obj, prop) {
	    return Object.prototype.hasOwnProperty.call(obj, prop);
	}


	// Deprecated old stuff.

	var internalUtil = {
	    deprecate: function(method, message) {
	        return function() {
	            console.log(message);
	            method.apply(null, arguments);
	        };
	    },
	};

	exports.deprecate = internalUtil.deprecate;

	exports.print = internalUtil.deprecate(function() {
	    for (var i = 0, len = arguments.length; i < len; ++i) {
	        process.stdout.write(String(arguments[i]));
	    }
	}, 'util.print is deprecated. Use console.log instead.');


	exports.puts = internalUtil.deprecate(function() {
	    for (var i = 0, len = arguments.length; i < len; ++i) {
	        process.stdout.write(arguments[i] + '\n');
	    }
	}, 'util.puts is deprecated. Use console.log instead.');


	exports.debug = internalUtil.deprecate(function(x) {
	    process.stderr.write('DEBUG: ' + x + '\n');
	}, 'util.debug is deprecated. Use console.error instead.');


	exports.error = internalUtil.deprecate(function(x) {
	    for (var i = 0, len = arguments.length; i < len; ++i) {
	        process.stderr.write(arguments[i] + '\n');
	    }
	}, 'util.error is deprecated. Use console.error instead.');


	exports._errnoException = function(err, syscall, original) {
	    var errname = err;
	    var message = syscall + ' ' + errname;
	    if (original)
	        message += ' ' + original;
	    var e = new Error(message);
	    e.code = errname;
	    e.errno = errname;
	    e.syscall = syscall;
	    return e;
	};


	exports._exceptionWithHostPort = function(err,
	                                          syscall,
	                                          address,
	                                          port,
	                                          additional) {
	    var details;
	    if (port && port > 0) {
	        details = address + ':' + port;
	    } else {
	        details = address;
	    }

	    if (additional) {
	        details += ' - Local (' + additional + ')';
	    }
	    var ex = exports._errnoException(err, syscall, details);
	    ex.address = address;
	    if (port) {
	        ex.port = port;
	    }
	    return ex;
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	


	// DEPRECATED: this should be removed, use `StaticArrayBuffer` instead.
	ArrayBuffer.prototype.getAddress = function(offset) {
	    return process.getAddress(this, offset);
	};



	/*!
	 * The buffer module from node.js, for the browser.
	 *
	 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
	 * @license  MIT
	 */


	// The absence of semicolons breaks my editor ffs,
	// TODO: Let's use the no-ArrayBuffer feature to suuport JS engines that don't have ArrayBuffers.


	var lookup = []
	var revLookup = []
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

	function init () {
	    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
	    for (var i = 0, len = code.length; i < len; ++i) {
	        lookup[i] = code[i]
	        revLookup[code.charCodeAt(i)] = i
	    }

	    revLookup['-'.charCodeAt(0)] = 62
	    revLookup['_'.charCodeAt(0)] = 63
	}

	init()

	function toByteArray (b64) {
	    var i, j, l, tmp, placeHolders, arr
	    var len = b64.length

	    if (len % 4 > 0) {
	        throw new Error('Invalid string. Length must be a multiple of 4')
	    }

	    // the number of equal signs (place holders)
	    // if there are two placeholders, than the two characters before it
	    // represent one byte
	    // if there is only one, then the three characters before it represent 2 bytes
	    // this is just a cheap hack to not do indexOf twice
	    placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0

	    // base64 is 4/3 + up to two characters of the original data
	    arr = new Arr(len * 3 / 4 - placeHolders)

	    // if there are placeholders, only get up to the last complete 4 chars
	    l = placeHolders > 0 ? len - 4 : len

	    var L = 0

	    for (i = 0, j = 0; i < l; i += 4, j += 3) {
	        tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
	        arr[L++] = (tmp >> 16) & 0xFF
	        arr[L++] = (tmp >> 8) & 0xFF
	        arr[L++] = tmp & 0xFF
	    }

	    if (placeHolders === 2) {
	        tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
	        arr[L++] = tmp & 0xFF
	    } else if (placeHolders === 1) {
	        tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
	        arr[L++] = (tmp >> 8) & 0xFF
	        arr[L++] = tmp & 0xFF
	    }

	    return arr
	}

	function tripletToBase64 (num) {
	    return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	    var tmp
	    var output = []
	    for (var i = start; i < end; i += 3) {
	        tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
	        output.push(tripletToBase64(tmp))
	    }
	    return output.join('')
	}

	function fromByteArray (uint8) {
	    var tmp
	    var len = uint8.length
	    var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
	    var output = ''
	    var parts = []
	    var maxChunkLength = 16383 // must be multiple of 3

	    // go through the array every three bytes, we'll deal with trailing stuff later
	    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	        parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
	    }

	    // pad the end with zeros, but make sure to not forget the extra bytes
	    if (extraBytes === 1) {
	        tmp = uint8[len - 1]
	        output += lookup[tmp >> 2]
	        output += lookup[(tmp << 4) & 0x3F]
	        output += '=='
	    } else if (extraBytes === 2) {
	        tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
	        output += lookup[tmp >> 10]
	        output += lookup[(tmp >> 4) & 0x3F]
	        output += lookup[(tmp << 2) & 0x3F]
	        output += '='
	    }

	    parts.push(output)

	    return parts.join('')
	}











	var ieee754 = __webpack_require__(8)
	var isArray = __webpack_require__(9)
	Buffer._full = true;
	exports.Buffer = Buffer
	exports.SlowBuffer = SlowBuffer
	exports.INSPECT_MAX_BYTES = 50

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = true;
	// Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
	//     ? global.TYPED_ARRAY_SUPPORT
	//     : typedArraySupport()

	/*
	 * Export kMaxLength after typed array support is determined.
	 */
	exports.kMaxLength = kMaxLength()

	function typedArraySupport () {
	    try {
	        var arr = new Uint8Array(1)
	        arr.foo = function () { return 42 }
	        return arr.foo() === 42 && // typed array instances can be augmented
	            typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
	            arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
	    } catch (e) {
	        return false
	    }
	}

	function kMaxLength () {
	    return Buffer.TYPED_ARRAY_SUPPORT
	        ? 0x7fffffff
	        : 0x3fffffff
	}

	function createBuffer (that, length) {
	    if (kMaxLength() < length) {
	        throw new RangeError('Invalid typed array length')
	    }
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	        // Return an augmented `Uint8Array` instance, for best performance
	        that = new Uint8Array(length)
	        that.__proto__ = Buffer.prototype
	    } else {
	        // Fallback: Return an object instance of the Buffer class
	        if (that === null) {
	            that = new Buffer(length)
	        }
	        that.length = length
	    }

	    return that
	}

	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */

	function Buffer (arg, encodingOrOffset, length) {
	    if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
	        return new Buffer(arg, encodingOrOffset, length)
	    }

	    // Common case.
	    if (typeof arg === 'number') {
	        if (typeof encodingOrOffset === 'string') {
	            throw new Error(
	                'If encoding is specified then the first argument must be a string'
	            )
	        }
	        return allocUnsafe(this, arg)
	    }

	    var buf = from(this, arg, encodingOrOffset, length)
	    return buf;
	}

	Buffer.poolSize = 8192 // not used by this implementation

	// TODO: Legacy, not needed anymore. Remove in next major version.
	Buffer._augment = function (arr) {
	    arr.__proto__ = Buffer.prototype
	    return arr
	}

	function from (that, value, encodingOrOffset, length) {
	    if (typeof value === 'number') {
	        throw new TypeError('"value" argument must not be a number')
	    }

	    if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
	        return fromArrayBuffer(that, value, encodingOrOffset, length)
	    }

	    if (typeof value === 'string') {
	        return fromString(that, value, encodingOrOffset)
	    }

	    return fromObject(that, value)
	}

	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	    return from(null, value, encodingOrOffset, length)
	}

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	    Buffer.prototype.__proto__ = Uint8Array.prototype
	    Buffer.__proto__ = Uint8Array
	    if (typeof Symbol !== 'undefined' && Symbol.species &&
	        Buffer[Symbol.species] === Buffer) {
	        // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
	        Object.defineProperty(Buffer, Symbol.species, {
	            value: null,
	            configurable: true
	        })
	    }
	}

	function assertSize (size) {
	    if (typeof size !== 'number') {
	        throw new TypeError('"size" argument must be a number')
	    }
	}

	function alloc (that, size, fill, encoding) {
	    assertSize(size)
	    if (size <= 0) {
	        return createBuffer(that, size)
	    }
	    if (fill !== undefined) {
	        // Only pay attention to encoding if it's a string. This
	        // prevents accidentally sending in a number that would
	        // be interpretted as a start offset.
	        return typeof encoding === 'string'
	            ? createBuffer(that, size).fill(fill, encoding)
	            : createBuffer(that, size).fill(fill)
	    }
	    return createBuffer(that, size)
	}

	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	    return alloc(null, size, fill, encoding)
	}

	function allocUnsafe (that, size) {
	    assertSize(size)
	    that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
	    if (!Buffer.TYPED_ARRAY_SUPPORT) {
	        for (var i = 0; i < size; i++) {
	            that[i] = 0
	        }
	    }
	    return that
	}

	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	    return allocUnsafe(null, size)
	}
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	    return allocUnsafe(null, size)
	}

	function fromString (that, string, encoding) {
	    if (typeof encoding !== 'string' || encoding === '') {
	        encoding = 'utf8'
	    }

	    if (!Buffer.isEncoding(encoding)) {
	        throw new TypeError('"encoding" must be a valid string encoding')
	    }

	    var length = byteLength(string, encoding) | 0
	    that = createBuffer(that, length)

	    that.write(string, encoding)
	    return that
	}

	function fromArrayLike (that, array) {
	    var length = checked(array.length) | 0
	    that = createBuffer(that, length)
	    for (var i = 0; i < length; i += 1) {
	        that[i] = array[i] & 255
	    }
	    return that
	}

	function fromArrayBuffer (that, array, byteOffset, length) {
	    array.byteLength // this throws if `array` is not a valid ArrayBuffer

	    if (byteOffset < 0 || array.byteLength < byteOffset) {
	        throw new RangeError('\'offset\' is out of bounds')
	    }

	    if (array.byteLength < byteOffset + (length || 0)) {
	        throw new RangeError('\'length\' is out of bounds')
	    }

	    if (length === undefined) {
	        array = new Uint8Array(array, byteOffset)
	    } else {
	        array = new Uint8Array(array, byteOffset, length)
	    }

	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	        // Return an augmented `Uint8Array` instance, for best performance
	        that = array
	        that.__proto__ = Buffer.prototype
	    } else {
	        // Fallback: Return an object instance of the Buffer class
	        that = fromArrayLike(that, array)
	    }

	    return that
	}

	function fromObject (that, obj) {
	    if (Buffer.isBuffer(obj)) {
	        var len = checked(obj.length) | 0
	        that = createBuffer(that, len)

	        if (that.length === 0) {
	            return that
	        }

	        obj.copy(that, 0, 0, len)
	        return that
	    }

	    if (obj) {
	        if ((typeof ArrayBuffer !== 'undefined' &&
	            obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
	            if (typeof obj.length !== 'number' || isnan(obj.length)) {
	                return createBuffer(that, 0)
	            }
	            return fromArrayLike(that, obj)
	        }

	        if (obj.type === 'Buffer' && isArray(obj.data)) {
	            return fromArrayLike(that, obj.data)
	        }
	    }

	    throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
	}

	function checked (length) {
	    // Note: cannot use `length < kMaxLength` here because that fails when
	    // length is NaN (which is otherwise coerced to zero.)
	    if (length >= kMaxLength()) {
	        throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	            'size: 0x' + kMaxLength().toString(16) + ' bytes')
	    }
	    return length | 0
	}

	function SlowBuffer (length) {
	    if (+length != length) { // eslint-disable-line eqeqeq
	        length = 0
	    }
	    return Buffer.alloc(+length)
	}

	Buffer.isBuffer = function isBuffer (b) {
	    return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	        throw new TypeError('Arguments must be Buffers')
	    }

	    if (a === b) return 0

	    var x = a.length
	    var y = b.length

	    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	        if (a[i] !== b[i]) {
	            x = a[i]
	            y = b[i]
	            break
	        }
	    }

	    if (x < y) return -1
	    if (y < x) return 1
	    return 0
	}

	Buffer.isEncoding = function isEncoding (encoding) {
	    switch (String(encoding).toLowerCase()) {
	        case 'hex':
	        case 'utf8':
	        case 'utf-8':
	        case 'ascii':
	        case 'binary':
	        case 'base64':
	        case 'raw':
	        case 'ucs2':
	        case 'ucs-2':
	        case 'utf16le':
	        case 'utf-16le':
	            return true
	        default:
	            return false
	    }
	}

	Buffer.concat = function concat (list, length) {
	    if (!isArray(list)) {
	        throw new TypeError('"list" argument must be an Array of Buffers')
	    }

	    if (list.length === 0) {
	        return Buffer.alloc(0)
	    }

	    var i
	    if (length === undefined) {
	        length = 0
	        for (i = 0; i < list.length; i++) {
	            length += list[i].length
	        }
	    }

	    var buffer = Buffer.allocUnsafe(length)
	    var pos = 0
	    for (i = 0; i < list.length; i++) {
	        var buf = list[i]
	        if (!Buffer.isBuffer(buf)) {
	            throw new TypeError('"list" argument must be an Array of Buffers')
	        }
	        buf.copy(buffer, pos)
	        pos += buf.length
	    }
	    return buffer
	}

	function byteLength (string, encoding) {
	    if (Buffer.isBuffer(string)) {
	        return string.length
	    }
	    if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
	        (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
	        return string.byteLength
	    }
	    if (typeof string !== 'string') {
	        string = '' + string
	    }

	    var len = string.length
	    if (len === 0) return 0

	    // Use a for loop to avoid recursion
	    var loweredCase = false
	    for (;;) {
	        switch (encoding) {
	            case 'ascii':
	            case 'binary':
	            // Deprecated
	            case 'raw':
	            case 'raws':
	                return len
	            case 'utf8':
	            case 'utf-8':
	            case undefined:
	                return utf8ToBytes(string).length
	            case 'ucs2':
	            case 'ucs-2':
	            case 'utf16le':
	            case 'utf-16le':
	                return len * 2
	            case 'hex':
	                return len >>> 1
	            case 'base64':
	                return base64ToBytes(string).length
	            default:
	                if (loweredCase) return utf8ToBytes(string).length // assume utf8
	                encoding = ('' + encoding).toLowerCase()
	                loweredCase = true
	        }
	    }
	}
	Buffer.byteLength = byteLength

	function slowToString (encoding, start, end) {
	    var loweredCase = false

	    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	    // property of a typed array.

	    // This behaves neither like String nor Uint8Array in that we set start/end
	    // to their upper/lower bounds if the value passed is out of range.
	    // undefined is handled specially as per ECMA-262 6th Edition,
	    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	    if (start === undefined || start < 0) {
	        start = 0
	    }
	    // Return early if start > this.length. Done here to prevent potential uint32
	    // coercion fail below.
	    if (start > this.length) {
	        return ''
	    }

	    if (end === undefined || end > this.length) {
	        end = this.length
	    }

	    if (end <= 0) {
	        return ''
	    }

	    // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	    end >>>= 0
	    start >>>= 0

	    if (end <= start) {
	        return ''
	    }

	    if (!encoding) encoding = 'utf8'

	    while (true) {
	        switch (encoding) {
	            case 'hex':
	                return hexSlice(this, start, end)

	            case 'utf8':
	            case 'utf-8':
	                return utf8Slice(this, start, end)

	            case 'ascii':
	                return asciiSlice(this, start, end)

	            case 'binary':
	                return binarySlice(this, start, end)

	            case 'base64':
	                return base64Slice(this, start, end)

	            case 'ucs2':
	            case 'ucs-2':
	            case 'utf16le':
	            case 'utf-16le':
	                return utf16leSlice(this, start, end)

	            default:
	                if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	                encoding = (encoding + '').toLowerCase()
	                loweredCase = true
	        }
	    }
	}

	// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
	// Buffer instances.
	Buffer.prototype._isBuffer = true

	function swap (b, n, m) {
	    var i = b[n]
	    b[n] = b[m]
	    b[m] = i
	}

	Buffer.prototype.swap16 = function swap16 () {
	    var len = this.length
	    if (len % 2 !== 0) {
	        throw new RangeError('Buffer size must be a multiple of 16-bits')
	    }
	    for (var i = 0; i < len; i += 2) {
	        swap(this, i, i + 1)
	    }
	    return this
	}

	Buffer.prototype.swap32 = function swap32 () {
	    var len = this.length
	    if (len % 4 !== 0) {
	        throw new RangeError('Buffer size must be a multiple of 32-bits')
	    }
	    for (var i = 0; i < len; i += 4) {
	        swap(this, i, i + 3)
	        swap(this, i + 1, i + 2)
	    }
	    return this
	}

	Buffer.prototype.toString = function toString () {
	    var length = this.length | 0
	    if (length === 0) return ''
	    if (arguments.length === 0) return utf8Slice(this, 0, length)
	    return slowToString.apply(this, arguments)
	}

	Buffer.prototype.equals = function equals (b) {
	    if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
	    if (this === b) return true
	    return Buffer.compare(this, b) === 0
	}

	Buffer.prototype.inspect = function inspect () {
	    var str = ''
	    var max = exports.INSPECT_MAX_BYTES
	    if (this.length > 0) {
	        str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
	        if (this.length > max) str += ' ... '
	    }
	    return '<Buffer ' + str + '>'
	}

	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	    if (!Buffer.isBuffer(target)) {
	        throw new TypeError('Argument must be a Buffer')
	    }

	    if (start === undefined) {
	        start = 0
	    }
	    if (end === undefined) {
	        end = target ? target.length : 0
	    }
	    if (thisStart === undefined) {
	        thisStart = 0
	    }
	    if (thisEnd === undefined) {
	        thisEnd = this.length
	    }

	    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	        throw new RangeError('out of range index')
	    }

	    if (thisStart >= thisEnd && start >= end) {
	        return 0
	    }
	    if (thisStart >= thisEnd) {
	        return -1
	    }
	    if (start >= end) {
	        return 1
	    }

	    start >>>= 0
	    end >>>= 0
	    thisStart >>>= 0
	    thisEnd >>>= 0

	    if (this === target) return 0

	    var x = thisEnd - thisStart
	    var y = end - start
	    var len = Math.min(x, y)

	    var thisCopy = this.slice(thisStart, thisEnd)
	    var targetCopy = target.slice(start, end)

	    for (var i = 0; i < len; ++i) {
	        if (thisCopy[i] !== targetCopy[i]) {
	            x = thisCopy[i]
	            y = targetCopy[i]
	            break
	        }
	    }

	    if (x < y) return -1
	    if (y < x) return 1
	    return 0
	}

	function arrayIndexOf (arr, val, byteOffset, encoding) {
	    var indexSize = 1
	    var arrLength = arr.length
	    var valLength = val.length

	    if (encoding !== undefined) {
	        encoding = String(encoding).toLowerCase()
	        if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	            encoding === 'utf16le' || encoding === 'utf-16le') {
	            if (arr.length < 2 || val.length < 2) {
	                return -1
	            }
	            indexSize = 2
	            arrLength /= 2
	            valLength /= 2
	            byteOffset /= 2
	        }
	    }

	    function read (buf, i) {
	        if (indexSize === 1) {
	            return buf[i]
	        } else {
	            return buf.readUInt16BE(i * indexSize)
	        }
	    }

	    var foundIndex = -1
	    for (var i = 0; byteOffset + i < arrLength; i++) {
	        if (read(arr, byteOffset + i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	            if (foundIndex === -1) foundIndex = i
	            if (i - foundIndex + 1 === valLength) return (byteOffset + foundIndex) * indexSize
	        } else {
	            if (foundIndex !== -1) i -= i - foundIndex
	            foundIndex = -1
	        }
	    }
	    return -1
	}

	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	    if (typeof byteOffset === 'string') {
	        encoding = byteOffset
	        byteOffset = 0
	    } else if (byteOffset > 0x7fffffff) {
	        byteOffset = 0x7fffffff
	    } else if (byteOffset < -0x80000000) {
	        byteOffset = -0x80000000
	    }
	    byteOffset >>= 0

	    if (this.length === 0) return -1
	    if (byteOffset >= this.length) return -1

	    // Negative offsets start from the end of the buffer
	    if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

	    if (typeof val === 'string') {
	        val = Buffer.from(val, encoding)
	    }

	    if (Buffer.isBuffer(val)) {
	        // special case: looking for empty string/buffer always fails
	        if (val.length === 0) {
	            return -1
	        }
	        return arrayIndexOf(this, val, byteOffset, encoding)
	    }
	    if (typeof val === 'number') {
	        if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
	            return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
	        }
	        return arrayIndexOf(this, [ val ], byteOffset, encoding)
	    }

	    throw new TypeError('val must be string, number or Buffer')
	}

	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
	    return this.indexOf(val, byteOffset, encoding) !== -1
	}

	function hexWrite (buf, string, offset, length) {
	    offset = Number(offset) || 0
	    var remaining = buf.length - offset
	    if (!length) {
	        length = remaining
	    } else {
	        length = Number(length)
	        if (length > remaining) {
	            length = remaining
	        }
	    }

	    // must be an even number of digits
	    var strLen = string.length
	    if (strLen % 2 !== 0) throw new Error('Invalid hex string')

	    if (length > strLen / 2) {
	        length = strLen / 2
	    }
	    for (var i = 0; i < length; i++) {
	        var parsed = parseInt(string.substr(i * 2, 2), 16)
	        if (isNaN(parsed)) return i
	        buf[offset + i] = parsed
	    }
	    return i
	}

	function utf8Write (buf, string, offset, length) {
	    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	    return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function binaryWrite (buf, string, offset, length) {
	    return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	    return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write (string, offset, length, encoding) {
	    // Buffer#write(string)
	    if (offset === undefined) {
	        encoding = 'utf8'
	        length = this.length
	        offset = 0
	        // Buffer#write(string, encoding)
	    } else if (length === undefined && typeof offset === 'string') {
	        encoding = offset
	        length = this.length
	        offset = 0
	        // Buffer#write(string, offset[, length][, encoding])
	    } else if (isFinite(offset)) {
	        offset = offset | 0
	        if (isFinite(length)) {
	            length = length | 0
	            if (encoding === undefined) encoding = 'utf8'
	        } else {
	            encoding = length
	            length = undefined
	        }
	        // legacy write(string, encoding, offset, length) - remove in v0.13
	    } else {
	        throw new Error(
	            'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	        )
	    }

	    var remaining = this.length - offset
	    if (length === undefined || length > remaining) length = remaining

	    if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	        throw new RangeError('Attempt to write outside buffer bounds')
	    }

	    if (!encoding) encoding = 'utf8'

	    var loweredCase = false
	    for (;;) {
	        switch (encoding) {
	            case 'hex':
	                return hexWrite(this, string, offset, length)

	            case 'utf8':
	            case 'utf-8':
	                return utf8Write(this, string, offset, length)

	            case 'ascii':
	                return asciiWrite(this, string, offset, length)

	            case 'binary':
	                return binaryWrite(this, string, offset, length)

	            case 'base64':
	                // Warning: maxLength not taken into account in base64Write
	                return base64Write(this, string, offset, length)

	            case 'ucs2':
	            case 'ucs-2':
	            case 'utf16le':
	            case 'utf-16le':
	                return ucs2Write(this, string, offset, length)

	            default:
	                if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	                encoding = ('' + encoding).toLowerCase()
	                loweredCase = true
	        }
	    }
	}

	Buffer.prototype.toJSON = function toJSON () {
	    return {
	        type: 'Buffer',
	        data: Array.prototype.slice.call(this._arr || this, 0)
	    }
	}

	function base64Slice (buf, start, end) {
	    if (start === 0 && end === buf.length) {
	        return base64.fromByteArray(buf)
	    } else {
	        return base64.fromByteArray(buf.slice(start, end))
	    }
	}

	function utf8Slice (buf, start, end) {
	    end = Math.min(buf.length, end)
	    var res = []

	    var i = start
	    while (i < end) {
	        var firstByte = buf[i]
	        var codePoint = null
	        var bytesPerSequence = (firstByte > 0xEF) ? 4
	            : (firstByte > 0xDF) ? 3
	            : (firstByte > 0xBF) ? 2
	            : 1

	        if (i + bytesPerSequence <= end) {
	            var secondByte, thirdByte, fourthByte, tempCodePoint

	            switch (bytesPerSequence) {
	                case 1:
	                    if (firstByte < 0x80) {
	                        codePoint = firstByte
	                    }
	                    break
	                case 2:
	                    secondByte = buf[i + 1]
	                    if ((secondByte & 0xC0) === 0x80) {
	                        tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
	                        if (tempCodePoint > 0x7F) {
	                            codePoint = tempCodePoint
	                        }
	                    }
	                    break
	                case 3:
	                    secondByte = buf[i + 1]
	                    thirdByte = buf[i + 2]
	                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	                        tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
	                        if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	                            codePoint = tempCodePoint
	                        }
	                    }
	                    break
	                case 4:
	                    secondByte = buf[i + 1]
	                    thirdByte = buf[i + 2]
	                    fourthByte = buf[i + 3]
	                    if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	                        tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
	                        if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	                            codePoint = tempCodePoint
	                        }
	                    }
	            }
	        }

	        if (codePoint === null) {
	            // we did not generate a valid codePoint so insert a
	            // replacement char (U+FFFD) and advance only 1 byte
	            codePoint = 0xFFFD
	            bytesPerSequence = 1
	        } else if (codePoint > 0xFFFF) {
	            // encode to utf16 (surrogate pair dance)
	            codePoint -= 0x10000
	            res.push(codePoint >>> 10 & 0x3FF | 0xD800)
	            codePoint = 0xDC00 | codePoint & 0x3FF
	        }

	        res.push(codePoint)
	        i += bytesPerSequence
	    }

	    return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000

	function decodeCodePointsArray (codePoints) {
	    var len = codePoints.length
	    if (len <= MAX_ARGUMENTS_LENGTH) {
	        return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	    }

	    // Decode in chunks to avoid "call stack size exceeded".
	    var res = ''
	    var i = 0
	    while (i < len) {
	        res += String.fromCharCode.apply(
	            String,
	            codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	        )
	    }
	    return res
	}

	function asciiSlice (buf, start, end) {
	    var ret = ''
	    end = Math.min(buf.length, end)

	    for (var i = start; i < end; i++) {
	        ret += String.fromCharCode(buf[i] & 0x7F)
	    }
	    return ret
	}

	function binarySlice (buf, start, end) {
	    var ret = ''
	    end = Math.min(buf.length, end)

	    for (var i = start; i < end; i++) {
	        ret += String.fromCharCode(buf[i])
	    }
	    return ret
	}

	function hexSlice (buf, start, end) {
	    var len = buf.length

	    if (!start || start < 0) start = 0
	    if (!end || end < 0 || end > len) end = len

	    var out = ''
	    for (var i = start; i < end; i++) {
	        out += toHex(buf[i])
	    }
	    return out
	}

	function utf16leSlice (buf, start, end) {
	    var bytes = buf.slice(start, end)
	    var res = ''
	    for (var i = 0; i < bytes.length; i += 2) {
	        res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
	    }
	    return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	    var len = this.length
	    start = ~~start
	    end = end === undefined ? len : ~~end

	    if (start < 0) {
	        start += len
	        if (start < 0) start = 0
	    } else if (start > len) {
	        start = len
	    }

	    if (end < 0) {
	        end += len
	        if (end < 0) end = 0
	    } else if (end > len) {
	        end = len
	    }

	    if (end < start) end = start

	    var newBuf
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	        newBuf = this.subarray(start, end)
	        newBuf.__proto__ = Buffer.prototype
	    } else {
	        var sliceLen = end - start
	        newBuf = new Buffer(sliceLen, undefined)
	        for (var i = 0; i < sliceLen; i++) {
	            newBuf[i] = this[i + start]
	        }
	    }

	    return newBuf
	}

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	    if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	    if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	    offset = offset | 0
	    byteLength = byteLength | 0
	    if (!noAssert) checkOffset(offset, byteLength, this.length)

	    var val = this[offset]
	    var mul = 1
	    var i = 0
	    while (++i < byteLength && (mul *= 0x100)) {
	        val += this[offset + i] * mul
	    }

	    return val
	}

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	    offset = offset | 0
	    byteLength = byteLength | 0
	    if (!noAssert) {
	        checkOffset(offset, byteLength, this.length)
	    }

	    var val = this[offset + --byteLength]
	    var mul = 1
	    while (byteLength > 0 && (mul *= 0x100)) {
	        val += this[offset + --byteLength] * mul
	    }

	    return val
	}

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	    if (!noAssert) checkOffset(offset, 1, this.length)
	    return this[offset]
	}

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	    if (!noAssert) checkOffset(offset, 2, this.length)
	    return this[offset] | (this[offset + 1] << 8)
	}

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	    if (!noAssert) checkOffset(offset, 2, this.length)
	    return (this[offset] << 8) | this[offset + 1]
	}

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	    if (!noAssert) checkOffset(offset, 4, this.length)

	    return ((this[offset]) |
	        (this[offset + 1] << 8) |
	        (this[offset + 2] << 16)) +
	        (this[offset + 3] * 0x1000000)
	}

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	    if (!noAssert) checkOffset(offset, 4, this.length)

	    return (this[offset] * 0x1000000) +
	        ((this[offset + 1] << 16) |
	        (this[offset + 2] << 8) |
	        this[offset + 3])
	}

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	    offset = offset | 0
	    byteLength = byteLength | 0
	    if (!noAssert) checkOffset(offset, byteLength, this.length)

	    var val = this[offset]
	    var mul = 1
	    var i = 0
	    while (++i < byteLength && (mul *= 0x100)) {
	        val += this[offset + i] * mul
	    }
	    mul *= 0x80

	    if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	    return val
	}

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	    offset = offset | 0
	    byteLength = byteLength | 0
	    if (!noAssert) checkOffset(offset, byteLength, this.length)

	    var i = byteLength
	    var mul = 1
	    var val = this[offset + --i]
	    while (i > 0 && (mul *= 0x100)) {
	        val += this[offset + --i] * mul
	    }
	    mul *= 0x80

	    if (val >= mul) val -= Math.pow(2, 8 * byteLength)

	    return val
	}

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	    if (!noAssert) checkOffset(offset, 1, this.length)
	    if (!(this[offset] & 0x80)) return (this[offset])
	    return ((0xff - this[offset] + 1) * -1)
	}

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	    if (!noAssert) checkOffset(offset, 2, this.length)
	    var val = this[offset] | (this[offset + 1] << 8)
	    return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	    if (!noAssert) checkOffset(offset, 2, this.length)
	    var val = this[offset + 1] | (this[offset] << 8)
	    return (val & 0x8000) ? val | 0xFFFF0000 : val
	}

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	    if (!noAssert) checkOffset(offset, 4, this.length)

	    return (this[offset]) |
	        (this[offset + 1] << 8) |
	        (this[offset + 2] << 16) |
	        (this[offset + 3] << 24)
	}

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	    if (!noAssert) checkOffset(offset, 4, this.length)

	    return (this[offset] << 24) |
	        (this[offset + 1] << 16) |
	        (this[offset + 2] << 8) |
	        (this[offset + 3])
	}

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	    if (!noAssert) checkOffset(offset, 4, this.length)
	    return ieee754.read(this, offset, true, 23, 4)
	}

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	    if (!noAssert) checkOffset(offset, 4, this.length)
	    return ieee754.read(this, offset, false, 23, 4)
	}

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	    if (!noAssert) checkOffset(offset, 8, this.length)
	    return ieee754.read(this, offset, true, 52, 8)
	}

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	    if (!noAssert) checkOffset(offset, 8, this.length)
	    return ieee754.read(this, offset, false, 52, 8)
	}

	function checkInt (buf, value, offset, ext, max, min) {
	    if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	    if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	    value = +value
	    offset = offset | 0
	    byteLength = byteLength | 0
	    if (!noAssert) {
	        var maxBytes = Math.pow(2, 8 * byteLength) - 1
	        checkInt(this, value, offset, byteLength, maxBytes, 0)
	    }

	    var mul = 1
	    var i = 0
	    this[offset] = value & 0xFF
	    while (++i < byteLength && (mul *= 0x100)) {
	        this[offset + i] = (value / mul) & 0xFF
	    }

	    return offset + byteLength
	}

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	    value = +value
	    offset = offset | 0
	    byteLength = byteLength | 0
	    if (!noAssert) {
	        var maxBytes = Math.pow(2, 8 * byteLength) - 1
	        checkInt(this, value, offset, byteLength, maxBytes, 0)
	    }

	    var i = byteLength - 1
	    var mul = 1
	    this[offset + i] = value & 0xFF
	    while (--i >= 0 && (mul *= 0x100)) {
	        this[offset + i] = (value / mul) & 0xFF
	    }

	    return offset + byteLength
	}

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	    value = +value
	    offset = offset | 0
	    if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
	    if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	    this[offset] = (value & 0xff)
	    return offset + 1
	}

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	    if (value < 0) value = 0xffff + value + 1
	    for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
	        buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	            (littleEndian ? i : 1 - i) * 8
	    }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	    value = +value
	    offset = offset | 0
	    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	        this[offset] = (value & 0xff)
	        this[offset + 1] = (value >>> 8)
	    } else {
	        objectWriteUInt16(this, value, offset, true)
	    }
	    return offset + 2
	}

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	    value = +value
	    offset = offset | 0
	    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	        this[offset] = (value >>> 8)
	        this[offset + 1] = (value & 0xff)
	    } else {
	        objectWriteUInt16(this, value, offset, false)
	    }
	    return offset + 2
	}

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	    if (value < 0) value = 0xffffffff + value + 1
	    for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
	        buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
	    }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	    value = +value
	    offset = offset | 0
	    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	        this[offset + 3] = (value >>> 24)
	        this[offset + 2] = (value >>> 16)
	        this[offset + 1] = (value >>> 8)
	        this[offset] = (value & 0xff)
	    } else {
	        objectWriteUInt32(this, value, offset, true)
	    }
	    return offset + 4
	}

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	    value = +value
	    offset = offset | 0
	    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	        this[offset] = (value >>> 24)
	        this[offset + 1] = (value >>> 16)
	        this[offset + 2] = (value >>> 8)
	        this[offset + 3] = (value & 0xff)
	    } else {
	        objectWriteUInt32(this, value, offset, false)
	    }
	    return offset + 4
	}

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	    value = +value
	    offset = offset | 0
	    if (!noAssert) {
	        var limit = Math.pow(2, 8 * byteLength - 1)

	        checkInt(this, value, offset, byteLength, limit - 1, -limit)
	    }

	    var i = 0
	    var mul = 1
	    var sub = 0
	    this[offset] = value & 0xFF
	    while (++i < byteLength && (mul *= 0x100)) {
	        if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	            sub = 1
	        }
	        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	    }

	    return offset + byteLength
	}

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	    value = +value
	    offset = offset | 0
	    if (!noAssert) {
	        var limit = Math.pow(2, 8 * byteLength - 1)

	        checkInt(this, value, offset, byteLength, limit - 1, -limit)
	    }

	    var i = byteLength - 1
	    var mul = 1
	    var sub = 0
	    this[offset + i] = value & 0xFF
	    while (--i >= 0 && (mul *= 0x100)) {
	        if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	            sub = 1
	        }
	        this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
	    }

	    return offset + byteLength
	}

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	    value = +value
	    offset = offset | 0
	    if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
	    if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
	    if (value < 0) value = 0xff + value + 1
	    this[offset] = (value & 0xff)
	    return offset + 1
	}

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	    value = +value
	    offset = offset | 0
	    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	        this[offset] = (value & 0xff)
	        this[offset + 1] = (value >>> 8)
	    } else {
	        objectWriteUInt16(this, value, offset, true)
	    }
	    return offset + 2
	}

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	    value = +value
	    offset = offset | 0
	    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	        this[offset] = (value >>> 8)
	        this[offset + 1] = (value & 0xff)
	    } else {
	        objectWriteUInt16(this, value, offset, false)
	    }
	    return offset + 2
	}

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	    value = +value
	    offset = offset | 0
	    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	        this[offset] = (value & 0xff)
	        this[offset + 1] = (value >>> 8)
	        this[offset + 2] = (value >>> 16)
	        this[offset + 3] = (value >>> 24)
	    } else {
	        objectWriteUInt32(this, value, offset, true)
	    }
	    return offset + 4
	}

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	    value = +value
	    offset = offset | 0
	    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
	    if (value < 0) value = 0xffffffff + value + 1
	    if (Buffer.TYPED_ARRAY_SUPPORT) {
	        this[offset] = (value >>> 24)
	        this[offset + 1] = (value >>> 16)
	        this[offset + 2] = (value >>> 8)
	        this[offset + 3] = (value & 0xff)
	    } else {
	        objectWriteUInt32(this, value, offset, false)
	    }
	    return offset + 4
	}

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	    if (offset + ext > buf.length) throw new RangeError('Index out of range')
	    if (offset < 0) throw new RangeError('Index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	    if (!noAssert) {
	        checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
	    }
	    ieee754.write(buf, value, offset, littleEndian, 23, 4)
	    return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	    return writeFloat(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	    return writeFloat(this, value, offset, false, noAssert)
	}

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	    if (!noAssert) {
	        checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
	    }
	    ieee754.write(buf, value, offset, littleEndian, 52, 8)
	    return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	    return writeDouble(this, value, offset, true, noAssert)
	}

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	    return writeDouble(this, value, offset, false, noAssert)
	}

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	    if (!start) start = 0
	    if (!end && end !== 0) end = this.length
	    if (targetStart >= target.length) targetStart = target.length
	    if (!targetStart) targetStart = 0
	    if (end > 0 && end < start) end = start

	    // Copy 0 bytes; we're done
	    if (end === start) return 0
	    if (target.length === 0 || this.length === 0) return 0

	    // Fatal error conditions
	    if (targetStart < 0) {
	        throw new RangeError('targetStart out of bounds')
	    }
	    if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	    if (end < 0) throw new RangeError('sourceEnd out of bounds')

	    // Are we oob?
	    if (end > this.length) end = this.length
	    if (target.length - targetStart < end - start) {
	        end = target.length - targetStart + start
	    }

	    var len = end - start
	    var i

	    if (this === target && start < targetStart && targetStart < end) {
	        // descending copy from end
	        for (i = len - 1; i >= 0; i--) {
	            target[i + targetStart] = this[i + start]
	        }
	    } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	        // ascending copy from start
	        for (i = 0; i < len; i++) {
	            target[i + targetStart] = this[i + start]
	        }
	    } else {
	        Uint8Array.prototype.set.call(
	            target,
	            this.subarray(start, start + len),
	            targetStart
	        )
	    }

	    return len
	}

	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill (val, start, end, encoding) {
	    // Handle string cases:
	    if (typeof val === 'string') {
	        if (typeof start === 'string') {
	            encoding = start
	            start = 0
	            end = this.length
	        } else if (typeof end === 'string') {
	            encoding = end
	            end = this.length
	        }
	        if (val.length === 1) {
	            var code = val.charCodeAt(0)
	            if (code < 256) {
	                val = code
	            }
	        }
	        if (encoding !== undefined && typeof encoding !== 'string') {
	            throw new TypeError('encoding must be a string')
	        }
	        if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	            throw new TypeError('Unknown encoding: ' + encoding)
	        }
	    } else if (typeof val === 'number') {
	        val = val & 255
	    }

	    // Invalid ranges are not set to a default, so can range check early.
	    if (start < 0 || this.length < start || this.length < end) {
	        throw new RangeError('Out of range index')
	    }

	    if (end <= start) {
	        return this
	    }

	    start = start >>> 0
	    end = end === undefined ? this.length : end >>> 0

	    if (!val) val = 0

	    var i
	    if (typeof val === 'number') {
	        for (i = start; i < end; i++) {
	            this[i] = val
	        }
	    } else {
	        var bytes = Buffer.isBuffer(val)
	            ? val
	            : utf8ToBytes(new Buffer(val, encoding).toString())
	        var len = bytes.length
	        for (i = 0; i < end - start; i++) {
	            this[i + start] = bytes[i % len]
	        }
	    }

	    return this
	}

	// HELPER FUNCTIONS
	// ================

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

	function base64clean (str) {
	    // Node strips out invalid characters like \n and \t from the string, base64-js does not
	    str = stringtrim(str).replace(INVALID_BASE64_RE, '')
	    // Node converts strings with length < 2 to ''
	    if (str.length < 2) return ''
	    // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	    while (str.length % 4 !== 0) {
	        str = str + '='
	    }
	    return str
	}

	function stringtrim (str) {
	    if (str.trim) return str.trim()
	    return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	    if (n < 16) return '0' + n.toString(16)
	    return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	    units = units || Infinity
	    var codePoint
	    var length = string.length
	    var leadSurrogate = null
	    var bytes = []

	    for (var i = 0; i < length; i++) {
	        codePoint = string.charCodeAt(i)

	        // is surrogate component
	        if (codePoint > 0xD7FF && codePoint < 0xE000) {
	            // last char was a lead
	            if (!leadSurrogate) {
	                // no lead yet
	                if (codePoint > 0xDBFF) {
	                    // unexpected trail
	                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	                    continue
	                } else if (i + 1 === length) {
	                    // unpaired lead
	                    if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	                    continue
	                }

	                // valid lead
	                leadSurrogate = codePoint

	                continue
	            }

	            // 2 leads in a row
	            if (codePoint < 0xDC00) {
	                if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	                leadSurrogate = codePoint
	                continue
	            }

	            // valid surrogate pair
	            codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
	        } else if (leadSurrogate) {
	            // valid bmp char, but last char was a lead
	            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
	        }

	        leadSurrogate = null

	        // encode utf8
	        if (codePoint < 0x80) {
	            if ((units -= 1) < 0) break
	            bytes.push(codePoint)
	        } else if (codePoint < 0x800) {
	            if ((units -= 2) < 0) break
	            bytes.push(
	                codePoint >> 0x6 | 0xC0,
	                codePoint & 0x3F | 0x80
	            )
	        } else if (codePoint < 0x10000) {
	            if ((units -= 3) < 0) break
	            bytes.push(
	                codePoint >> 0xC | 0xE0,
	                codePoint >> 0x6 & 0x3F | 0x80,
	                codePoint & 0x3F | 0x80
	            )
	        } else if (codePoint < 0x110000) {
	            if ((units -= 4) < 0) break
	            bytes.push(
	                codePoint >> 0x12 | 0xF0,
	                codePoint >> 0xC & 0x3F | 0x80,
	                codePoint >> 0x6 & 0x3F | 0x80,
	                codePoint & 0x3F | 0x80
	            )
	        } else {
	            throw new Error('Invalid code point')
	        }
	    }

	    return bytes
	}

	function asciiToBytes (str) {
	    var byteArray = []
	    for (var i = 0; i < str.length; i++) {
	        // Node's code seems to be doing this and not & 0x7F..
	        byteArray.push(str.charCodeAt(i) & 0xFF)
	    }
	    return byteArray
	}

	function utf16leToBytes (str, units) {
	    var c, hi, lo
	    var byteArray = []
	    for (var i = 0; i < str.length; i++) {
	        if ((units -= 2) < 0) break

	        c = str.charCodeAt(i)
	        hi = c >> 8
	        lo = c % 256
	        byteArray.push(lo)
	        byteArray.push(hi)
	    }

	    return byteArray
	}

	function base64ToBytes (str) {
	    return base64.toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	    for (var i = 0; i < length; i++) {
	        if ((i + offset >= dst.length) || (i >= src.length)) break
	        dst[i + offset] = src[i]
	    }
	    return i
	}

	function isnan (val) {
	    return val !== val // eslint-disable-line no-self-compare
	}





	// Support to print Buffer in console, maybe wrap it in __DEBUG__


	function toChar(num) {
	    if(num < 30) return '.';
	    else return String.fromCharCode(num);
	}

	function printBuffer(buf) {
	    var int_size = 8;
	    var ints = Math.ceil(buf.length / int_size);
	    var lines = [];

	    for(var j = 0; j < ints; j++) {
	        var parts = [];
	        var chars = [];

	        var addr = '';
	        addr = (j * int_size).toString();
	        if(addr.length < 6)
	            addr = (new Array(7 - addr.length)).join('0') + addr;

	        parts.push(addr + ' ');

	        for(var m = 0; m < int_size; m++) {
	            var index = (j * int_size) + m;
	            if(index >= buf.length) break;
	            var char = buf[index];
	            chars.push(toChar(char));
	            var hex = char.toString(16);
	            if(hex.length === 1) hex = '0' + hex;
	            parts.push(hex);
	        }

	        var len = parts.join(' ').length;
	        if(len < 32) parts.push((new Array(32 - len)).join(' '));
	        else parts.push('  ');
	        parts.push(chars.join(''));
	        lines.push(parts.join(' '));
	    }

	    var str = lines.join('\n');
	    console.log(str);
	}

	Buffer.prototype.print = function() {
	    printBuffer(this);
	};

	// DEPRECATED: this should be removed, use `StaticBuffer` instead.
	Buffer.prototype.getAddress = function(offset) {
	    if(!offset) offset = 0;
	    offset += this.byteOffset;
	    return this.buffer.getAddress(offset);
	};



/***/ },
/* 8 */
/***/ function(module, exports) {

	exports.read = function (buffer, offset, isLE, mLen, nBytes) {
	  var e, m
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var nBits = -7
	  var i = isLE ? (nBytes - 1) : 0
	  var d = isLE ? -1 : 1
	  var s = buffer[offset + i]

	  i += d

	  e = s & ((1 << (-nBits)) - 1)
	  s >>= (-nBits)
	  nBits += eLen
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1)
	  e >>= (-nBits)
	  nBits += mLen
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen)
	    e = e - eBias
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c
	  var eLen = nBytes * 8 - mLen - 1
	  var eMax = (1 << eLen) - 1
	  var eBias = eMax >> 1
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
	  var i = isLE ? 0 : (nBytes - 1)
	  var d = isLE ? 1 : -1
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

	  value = Math.abs(value)

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0
	    e = eMax
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2)
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--
	      c *= 2
	    }
	    if (e + eBias >= 1) {
	      value += rt / c
	    } else {
	      value += rt * Math.pow(2, 1 - eBias)
	    }
	    if (value * c >= 2) {
	      e++
	      c /= 2
	    }

	    if (e + eBias >= eMax) {
	      m = 0
	      e = eMax
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen)
	      e = e + eBias
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
	      e = 0
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m
	  eLen += mLen
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128
	}


/***/ },
/* 9 */
/***/ function(module, exports) {

	var toString = {}.toString;

	module.exports = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};


/***/ },
/* 10 */
/***/ function(module, exports) {

	module.exports = require("vm");

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	exports.StaticArrayBuffer = StaticArrayBuffer;

	// new StaticArrayBuffer(size);
	// StaticArrayBuffer.frame(address, size);
	// StaticArrayBuffer.alloc(size, protection);


	function prot2num(prot) {
	    if(typeof prot !== 'string')
	        throw TypeError('Protection must be a string.');
	    if(prot.match(/[^rwe]/))
	        throw TypeError('Protection string can contain only "r", "w" and "e" characters, given "' + prot + '".');

	    var val = 0 /* PROT_NONE */;
	    if(prot.indexOf('r') > -1) val |= 1 /* PROT_READ */;
	    if(prot.indexOf('w') > -1) val |= 2 /* PROT_WRITE */;
	    if(prot.indexOf('e') > -1) val |= 4 /* PROT_EXEC */;
	    return val;
	}


	// "frame" because it does not allocate,
	// just frames a slice of memory into ArrayBuffer.
	function frame(addr, size) {
	    var ab = process.frame(addr, size);
	    if(!(ab instanceof ArrayBuffer))
	        throw Error('Could not allocate ArrayBuffer.');
	    return ab;
	}


	function alloc(size, prot) {
	    if (typeof size !== 'number')
	        throw TypeError('size must be a number.');
	    if (size < 0)
	        throw TypeError('Invalid size argument.');

	    if (!prot) prot = 'rw';

	    var flags = 2 /* MAP_PRIVATE */ | 32 /* MAP_ANONYMOUS */;
	    var protnum = prot2num(prot);
	    var libjs = __webpack_require__(12);
	    var addr = libjs.mmap(0, size, protnum, flags, -1, 0);

	    // Address in 64-bit x86 can be negative and errors are from -1 to -124.
	    if ((addr[1] === -1) && ((addr[0] < 0) && (addr[0] > -125)))
	        throw Error('Could not allocate memory.');

	    var ab = frame(addr, size);
	    return ab;
	}


	// Two constructors, one exposed externally to user:
	//
	//  1. new StaticArrayBuffer(size)
	//
	// Another one that we just use internally here:
	//
	//  2. new StaticArrayBuffer(arrayBuffer);
	//
	function StaticArrayBuffer(size) {
	    var ab;
	    if(size instanceof ArrayBuffer) {
	        ab = size;
	    } else {
	        ab = new ArrayBuffer(size); // Let's pray it's actually 'static'.
	    }
	    ab.__proto__ = StaticArrayBuffer.prototype;
	    return ab;
	}


	// # Static methods

	// StaticArrayBuffers allocated with `alloc` have to be (currently) freed using `buffer.free`.
	StaticArrayBuffer.alloc = function(size, prot) {
	    return new StaticArrayBuffer(alloc(size, prot));
	};

	StaticArrayBuffer.frame = function(addr, size) {
	    return new StaticArrayBuffer(frame(addr, size));
	};

	StaticArrayBuffer.isStaticArrayBuffer = function(sab) {
	    if((sab instanceof StaticArrayBuffer) && (typeof sab.getAddress === 'function')) return true;
	    return false;
	};



	StaticArrayBuffer.prototype.__proto__ =
	    ArrayBuffer.prototype;



	// # Member instance methods

	StaticArrayBuffer.prototype.call = function(offset, args) {
	    if(typeof offset !== 'number') offset = 0;
	    if(offset < 0) offset = 0;
	    if(!isFinite(offset)) offset = 0;

	    if(!(args instanceof Array)) args = [];

	    return process.call(this, offset, args);
	};

	StaticArrayBuffer.prototype.setProtection = function(prot) {
	    var protnum = prot2num(prot);
	    // return libjs.mprotect(this, this.length, protnum);
	    var libjs = __webpack_require__(12);
	    var res = libjs.mprotect(this, this.length, protnum);
	    if(res < -1)
	        throw Error('Could not change protection level.');
	};

	StaticArrayBuffer.prototype.free = function() {
	    var libjs = __webpack_require__(12);
	    var res = libjs.munmap(this, this.length);
	    if(res < 0)
	        throw Error('Error on freeing memory.');
	};

	StaticArrayBuffer.prototype.getAddress = function(offset) {
	    return process.getAddress(this, offset);
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	var buffer_1 = __webpack_require__(7);
	var static_buffer_1 = __webpack_require__(13);
	var p = process;
	var syscall = p.syscall;
	var syscall64 = p.syscall64;
	var isSB = static_buffer_1.StaticBuffer.isStaticBuffer;
	function malloc(size) {
	    return new buffer_1.Buffer(size);
	}
	var x86_64_linux_1 = __webpack_require__(14);
	var types = __webpack_require__(14);
	__export(__webpack_require__(14));
	exports.arch = {
	    isLE: true,
	    kernel: 'linux',
	    int: 64,
	    SYS: x86_64_linux_1.SYS,
	    types: types
	};
	__export(__webpack_require__(5));
	__export(__webpack_require__(16));
	function noop() { }
	function read(fd, buf) {
	    return syscall(x86_64_linux_1.SYS.read, fd, buf, buf.length);
	}
	exports.read = read;
	function readAsync(fd, buf, callback) {
	    p.asyscall(x86_64_linux_1.SYS.read, fd, buf, buf.length, callback);
	}
	exports.readAsync = readAsync;
	function write(fd, buf) {
	    return syscall(x86_64_linux_1.SYS.write, fd, buf, buf.length);
	}
	exports.write = write;
	function writeAsync(fd, buf, callback) {
	    p.asyscall(x86_64_linux_1.SYS.write, fd, buf, buf.length, callback);
	}
	exports.writeAsync = writeAsync;
	function open(pathname, flags, mode) {
	    var args = [x86_64_linux_1.SYS.open, pathname, flags];
	    if (typeof mode === 'number')
	        args.push(mode);
	    return syscall.apply(null, args);
	}
	exports.open = open;
	function openAsync(pathname, flags, mode, callback) {
	    p.asyscall(x86_64_linux_1.SYS.open, pathname, flags, mode, callback);
	}
	exports.openAsync = openAsync;
	function close(fd) {
	    return syscall(x86_64_linux_1.SYS.close, fd);
	}
	exports.close = close;
	function closeAsync(fd, callback) {
	    p.asyscall(x86_64_linux_1.SYS.close, fd, callback);
	}
	exports.closeAsync = closeAsync;
	function access(pathname, mode) {
	    return syscall(x86_64_linux_1.SYS.access, pathname, mode);
	}
	exports.access = access;
	function accessAsync(pathname, mode, callback) {
	    p.asyscall(x86_64_linux_1.SYS.access, pathname, mode, callback);
	}
	exports.accessAsync = accessAsync;
	function chmod(pathname, mode) {
	    return syscall(x86_64_linux_1.SYS.chmod, pathname, mode);
	}
	exports.chmod = chmod;
	function chmodAsync(pathname, mode, callback) {
	    p.asyscall(x86_64_linux_1.SYS.chmod, pathname, mode, callback);
	}
	exports.chmodAsync = chmodAsync;
	function fchmod(fd, mode) {
	    return syscall(x86_64_linux_1.SYS.chmod, fd, mode);
	}
	exports.fchmod = fchmod;
	function fchmodAsync(fd, mode, callback) {
	    p.asyscall(x86_64_linux_1.SYS.chmod, fd, mode, callback);
	}
	exports.fchmodAsync = fchmodAsync;
	function chown(pathname, owner, group) {
	    return syscall(x86_64_linux_1.SYS.chown, pathname, owner, group);
	}
	exports.chown = chown;
	function chownAsync(pathname, owner, group, callback) {
	    p.asyscall(x86_64_linux_1.SYS.chown, pathname, owner, group, callback);
	}
	exports.chownAsync = chownAsync;
	function fchown(fd, owner, group) {
	    return syscall(x86_64_linux_1.SYS.fchown, fd, owner, group);
	}
	exports.fchown = fchown;
	function fchownAsync(fd, owner, group, callback) {
	    p.asyscall(x86_64_linux_1.SYS.fchown, fd, owner, group, callback);
	}
	exports.fchownAsync = fchownAsync;
	function lchown(pathname, owner, group) {
	    return syscall(x86_64_linux_1.SYS.lchown, pathname, owner, group);
	}
	exports.lchown = lchown;
	function lchownAsync(pathname, owner, group, callback) {
	    p.asyscall(x86_64_linux_1.SYS.lchown, pathname, owner, group, callback);
	}
	exports.lchownAsync = lchownAsync;
	function fsync(fd) {
	    return syscall(x86_64_linux_1.SYS.fsync, fd);
	}
	exports.fsync = fsync;
	function fsyncAsync(fd, callback) {
	    p.asyscall(x86_64_linux_1.SYS.fsync, fd, callback);
	}
	exports.fsyncAsync = fsyncAsync;
	function fdatasync(fd) {
	    return syscall(x86_64_linux_1.SYS.fdatasync, fd);
	}
	exports.fdatasync = fdatasync;
	function fdatasyncAsync(fd, callback) {
	    p.asyscall(x86_64_linux_1.SYS.fdatasync, fd, callback);
	}
	exports.fdatasyncAsync = fdatasyncAsync;
	function stat(filepath) {
	    var buf = new buffer_1.Buffer(types.stat.size + 200);
	    var result = syscall(x86_64_linux_1.SYS.stat, filepath, buf);
	    if (result == 0)
	        return types.stat.unpack(buf);
	    throw result;
	}
	exports.stat = stat;
	function __unpackStats(buf, result, callback) {
	    if (result === 0) {
	        try {
	            callback(null, types.stat.unpack(buf));
	        }
	        catch (e) {
	            callback(e);
	        }
	    }
	    else
	        callback(result);
	}
	function statAsync(filepath, callback) {
	    var buf = new buffer_1.Buffer(types.stat.size + 100);
	    p.asyscall(x86_64_linux_1.SYS.stat, filepath, buf, function (result) { return __unpackStats(buf, result, callback); });
	}
	exports.statAsync = statAsync;
	function lstat(linkpath) {
	    var buf = new buffer_1.Buffer(types.stat.size + 100);
	    var result = syscall(x86_64_linux_1.SYS.lstat, linkpath, buf);
	    if (result == 0)
	        return types.stat.unpack(buf);
	    throw result;
	}
	exports.lstat = lstat;
	function lstatAsync(linkpath, callback) {
	    var buf = new buffer_1.Buffer(types.stat.size + 100);
	    p.asyscall(x86_64_linux_1.SYS.lstat, linkpath, buf, function (result) { return __unpackStats(buf, result, callback); });
	}
	exports.lstatAsync = lstatAsync;
	function fstat(fd) {
	    var buf = new buffer_1.Buffer(types.stat.size + 100);
	    var result = syscall(x86_64_linux_1.SYS.fstat, fd, buf);
	    if (result == 0)
	        return types.stat.unpack(buf);
	    throw result;
	}
	exports.fstat = fstat;
	function fstatAsync(fd, callback) {
	    var buf = new buffer_1.Buffer(types.stat.size + 100);
	    p.asyscall(x86_64_linux_1.SYS.fstat, fd, buf, function (result) { return __unpackStats(buf, result, callback); });
	}
	exports.fstatAsync = fstatAsync;
	function truncate(path, length) {
	    return syscall(x86_64_linux_1.SYS.truncate, path, length);
	}
	exports.truncate = truncate;
	function truncateAsync(path, length, callback) {
	    p.asyscall(x86_64_linux_1.SYS.truncate, path, length, callback);
	}
	exports.truncateAsync = truncateAsync;
	function ftruncate(fd, length) {
	    return syscall(x86_64_linux_1.SYS.ftruncate, fd, length);
	}
	exports.ftruncate = ftruncate;
	function ftruncateAsync(fd, length, callback) {
	    p.asyscall(x86_64_linux_1.SYS.ftruncate, fd, length, callback);
	}
	exports.ftruncateAsync = ftruncateAsync;
	function lseek(fd, offset, whence) {
	    return syscall(x86_64_linux_1.SYS.lseek, fd, offset, whence);
	}
	exports.lseek = lseek;
	function lseekAsync(fd, offset, whence, callback) {
	    p.asyscall(x86_64_linux_1.SYS.lseek, fd, offset, whence, callback);
	}
	exports.lseekAsync = lseekAsync;
	function rename(oldpath, newpath) {
	    return syscall(x86_64_linux_1.SYS.rename, oldpath, newpath);
	}
	exports.rename = rename;
	function renameAsync(oldpath, newpath, callback) {
	    p.asyscall(x86_64_linux_1.SYS.rename, oldpath, newpath, callback);
	}
	exports.renameAsync = renameAsync;
	function mkdir(pathname, mode) {
	    return syscall(x86_64_linux_1.SYS.mkdir, pathname, mode);
	}
	exports.mkdir = mkdir;
	function mkdirAsync(pathname, mode, callback) {
	    p.asyscall(x86_64_linux_1.SYS.mkdir, pathname, mode, callback);
	}
	exports.mkdirAsync = mkdirAsync;
	function mkdirat(dirfd, pathname, mode) {
	    return syscall(x86_64_linux_1.SYS.mkdirat, dirfd, pathname, mode);
	}
	exports.mkdirat = mkdirat;
	function mkdiratAsync(dirfd, pathname, mode, callback) {
	    p.asyscall(x86_64_linux_1.SYS.mkdirat, dirfd, pathname, mode, callback);
	}
	exports.mkdiratAsync = mkdiratAsync;
	function rmdir(pathname) {
	    return syscall(x86_64_linux_1.SYS.rmdir, pathname);
	}
	exports.rmdir = rmdir;
	function rmdirAsync(pathname, callback) {
	    p.asyscall(x86_64_linux_1.SYS.rmdir, pathname, callback);
	}
	exports.rmdirAsync = rmdirAsync;
	function getcwd() {
	    var buf = new buffer_1.Buffer(264);
	    var res = syscall(x86_64_linux_1.SYS.getcwd, buf, buf.length);
	    if (res < 0) {
	        if (res === -34) {
	            buf = new buffer_1.Buffer(4096);
	            res = syscall(x86_64_linux_1.SYS.getcwd, buf, buf.length);
	            if (res < 0)
	                throw res;
	        }
	        else
	            throw res;
	    }
	    return buf.slice(0, res - 1).toString();
	}
	exports.getcwd = getcwd;
	function getcwdAsync(callback) {
	    var buf = new buffer_1.Buffer(264);
	    p.asyscall(x86_64_linux_1.SYS.getcwd, buf, buf.length, function (res) {
	        if (res < 0) {
	            if (res === -34) {
	                buf = new buffer_1.Buffer(4096);
	                p.asyscall(x86_64_linux_1.SYS.getcwd, buf, buf.length, function (res) {
	                    if (res < 0)
	                        callback(res);
	                    else
	                        callback(null, buf.slice(0, res).toString());
	                });
	            }
	            else
	                callback(res);
	        }
	        callback(null, buf.slice(0, res).toString());
	    });
	}
	exports.getcwdAsync = getcwdAsync;
	function getdents64(fd, dirp) {
	    return syscall(x86_64_linux_1.SYS.getdents64, fd, dirp, dirp.length);
	}
	exports.getdents64 = getdents64;
	function getdents64Async(fd, dirp, callback) {
	    p.asyscall(x86_64_linux_1.SYS.getdents64, fd, dirp, dirp.length, callback);
	}
	exports.getdents64Async = getdents64Async;
	function readdir(path, encoding) {
	    if (encoding === void 0) { encoding = 'utf8'; }
	    var fd = open(path, 0 | 65536);
	    if (fd < 0)
	        throw fd;
	    var buf = new buffer_1.Buffer(4096);
	    var struct = types.linux_dirent64;
	    var list = [];
	    var res = getdents64(fd, buf);
	    do {
	        var offset = 0;
	        while (offset + struct.size < res) {
	            var unpacked = struct.unpack(buf, offset);
	            var name = buf.slice(offset + struct.size, offset + unpacked.d_reclen).toString(encoding);
	            name = name.substr(0, name.indexOf("\0"));
	            var entry = {
	                ino: unpacked.ino64_t,
	                offset: unpacked.off64_t[0],
	                type: unpacked.d_type,
	                name: name
	            };
	            list.push(entry);
	            offset += unpacked.d_reclen;
	        }
	        res = getdents64(fd, buf);
	    } while (res > 0);
	    if (res < 0)
	        throw res;
	    close(fd);
	    return list;
	}
	exports.readdir = readdir;
	function readdirList(path, encoding) {
	    if (encoding === void 0) { encoding = 'utf8'; }
	    var fd = open(path, 65536);
	    if (fd < 0)
	        throw fd;
	    var buf = new buffer_1.Buffer(4096);
	    var struct = types.linux_dirent64;
	    var list = [];
	    var res = getdents64(fd, buf);
	    do {
	        var offset = 0;
	        while (offset + struct.size < res) {
	            var unpacked = struct.unpack(buf, offset);
	            var name = buf.slice(offset + struct.size, offset + unpacked.d_reclen).toString(encoding);
	            name = name.substr(0, name.indexOf("\0"));
	            if ((name != '.') && (name != '..'))
	                list.push(name);
	            offset += unpacked.d_reclen;
	        }
	        res = getdents64(fd, buf);
	    } while (res > 0);
	    if (res < 0)
	        throw res;
	    close(fd);
	    return list;
	}
	exports.readdirList = readdirList;
	function readdirListAsync(path, encoding, callback) {
	    if (encoding === void 0) { encoding = 'utf8'; }
	    openAsync(path, 65536, 0, function (fd) {
	        if (fd < 0)
	            return callback(fd);
	        var buf = new static_buffer_1.StaticBuffer(4096);
	        var struct = types.linux_dirent64;
	        var list = [];
	        function done() {
	            closeAsync(fd, noop);
	            callback(null, list);
	        }
	        function loop() {
	            getdents64Async(fd, buf, function (res) {
	                if (res < 0) {
	                    callback(res);
	                    return;
	                }
	                var offset = 0;
	                while (offset + struct.size < res) {
	                    var unpacked = struct.unpack(buf, offset);
	                    var name = buf.slice(offset + struct.size, offset + unpacked.d_reclen).toString(encoding);
	                    name = name.substr(0, name.indexOf("\0"));
	                    if ((name != '.') && (name != '..'))
	                        list.push(name);
	                    offset += unpacked.d_reclen;
	                }
	                if (res > 0)
	                    loop();
	                else
	                    done();
	            });
	        }
	        loop();
	    });
	}
	exports.readdirListAsync = readdirListAsync;
	function symlink(target, linkpath) {
	    return syscall(x86_64_linux_1.SYS.symlink, target, linkpath);
	}
	exports.symlink = symlink;
	function symlinkAsync(target, linkpath, callback) {
	    p.asyscall(x86_64_linux_1.SYS.symlink, target, linkpath, callback);
	}
	exports.symlinkAsync = symlinkAsync;
	function unlink(pathname) {
	    return syscall(x86_64_linux_1.SYS.unlink, pathname);
	}
	exports.unlink = unlink;
	function unlinkAsync(pathname, callback) {
	    p.asyscall(x86_64_linux_1.SYS.unlink, pathname, callback);
	}
	exports.unlinkAsync = unlinkAsync;
	function readlink(pathname) {
	    var sb = new static_buffer_1.StaticBuffer(types.PATH_MAX);
	    var bytes = syscall(x86_64_linux_1.SYS.readlink, pathname, sb, sb.length);
	    if (bytes < 0)
	        throw bytes;
	    else
	        return sb.slice(0, bytes).toString();
	}
	exports.readlink = readlink;
	function readlinkAsync(pathname, callback) {
	    var sb = new static_buffer_1.StaticBuffer(types.PATH_MAX);
	    p.asyscall(x86_64_linux_1.SYS.readlink, pathname, sb, sb.length, function (bytes) {
	        if (bytes < 0)
	            callback(bytes);
	        else
	            callback(bytes, sb.slice(0, bytes).toString());
	    });
	}
	exports.readlinkAsync = readlinkAsync;
	function link(oldpath, newpath) {
	    return syscall(x86_64_linux_1.SYS.link, oldpath, newpath);
	}
	exports.link = link;
	function linkAsync(oldpath, newpath, callback) {
	    p.asyscall(x86_64_linux_1.SYS.link, oldpath, newpath, callback);
	}
	exports.linkAsync = linkAsync;
	function utime(filename, times) {
	    var buf = types.utimbuf.pack(times);
	    return syscall(x86_64_linux_1.SYS.utime, filename, buf);
	}
	exports.utime = utime;
	function utimeAsync(filename, times, callback) {
	    var buf = types.utimbuf.pack(times);
	    p.asyscall(x86_64_linux_1.SYS.utime, filename, buf, callback);
	}
	exports.utimeAsync = utimeAsync;
	function utimes(filename, times) {
	    var buf = types.timevalarr.pack(times);
	    return syscall(x86_64_linux_1.SYS.utimes, buf);
	}
	exports.utimes = utimes;
	function utimesAsync(filename, times, callback) {
	    var buf = types.timevalarr.pack(times);
	    p.asyscall(x86_64_linux_1.SYS.utimes, buf, callback);
	}
	exports.utimesAsync = utimesAsync;
	function socket(domain, type, protocol) {
	    return syscall(x86_64_linux_1.SYS.socket, domain, type, protocol);
	}
	exports.socket = socket;
	function socketAsync(domain, type, protocol, callback) {
	    p.asyscall(x86_64_linux_1.SYS.socket, domain, type, protocol, callback);
	}
	exports.socketAsync = socketAsync;
	function connect(fd, sockaddr) {
	    var buf = types.sockaddr_in.pack(sockaddr);
	    return syscall(x86_64_linux_1.SYS.connect, fd, buf, buf.length);
	}
	exports.connect = connect;
	function connectAsync(fd, sockaddr, callback) {
	    var buf = types.sockaddr_in.pack(sockaddr);
	    p.asyscall(x86_64_linux_1.SYS.connect, fd, buf, buf.length, callback);
	}
	exports.connectAsync = connectAsync;
	function bind(fd, sockaddr, addr_type) {
	    var buf = addr_type.pack(sockaddr);
	    return syscall(x86_64_linux_1.SYS.bind, fd, buf, buf.length);
	}
	exports.bind = bind;
	function bindAsync(fd, sockaddr, addr_type, callback) {
	    var buf = addr_type.pack(sockaddr);
	    p.asyscall(x86_64_linux_1.SYS.bind, fd, buf, buf.length, callback);
	}
	exports.bindAsync = bindAsync;
	function listen(fd, backlog) {
	    return syscall(x86_64_linux_1.SYS.listen, fd, backlog);
	}
	exports.listen = listen;
	function listenAsync(fd, backlog, callback) {
	    p.asyscall(x86_64_linux_1.SYS.listen, fd, backlog, callback);
	}
	exports.listenAsync = listenAsync;
	function accept(fd, buf) {
	    var buflen = types.int32.pack(buf.length);
	    return syscall(x86_64_linux_1.SYS.accept, fd, buf, buflen);
	}
	exports.accept = accept;
	function acceptAsync(fd, buf, callback) {
	    var buflen = types.int32.pack(buf.length);
	    p.asyscall(x86_64_linux_1.SYS.accept, fd, buf, buflen, callback);
	}
	exports.acceptAsync = acceptAsync;
	function accept4(fd, buf, flags) {
	    var buflen = types.int32.pack(buf.length);
	    return syscall(x86_64_linux_1.SYS.accept4, fd, buf, buflen, flags);
	}
	exports.accept4 = accept4;
	function accept4Async(fd, buf, flags, callback) {
	    var buflen = types.int32.pack(buf.length);
	    p.asyscall(x86_64_linux_1.SYS.accept4, fd, buf, buflen, flags, callback);
	}
	exports.accept4Async = accept4Async;
	function shutdown(fd, how) {
	    return syscall(x86_64_linux_1.SYS.shutdown, fd, how);
	}
	exports.shutdown = shutdown;
	function shutdownAsync(fd, how, callback) {
	    p.asyscall(x86_64_linux_1.SYS.shutdown, fd, how, callback);
	}
	exports.shutdownAsync = shutdownAsync;
	function send(fd, buf, flags) {
	    if (flags === void 0) { flags = 0; }
	    return sendto(fd, buf, flags);
	}
	exports.send = send;
	function sendAsync(fd, buf, flags, callback) {
	    if (flags === void 0) { flags = 0; }
	    sendtoAsync(fd, buf, flags, null, null, callback);
	}
	exports.sendAsync = sendAsync;
	function sendto(fd, buf, flags, addr, addr_type) {
	    if (flags === void 0) { flags = 0; }
	    var params = [x86_64_linux_1.SYS.sendto, fd, buf, buf.length, flags, 0, 0];
	    if (addr) {
	        var addrbuf = addr_type.pack(addr);
	        params[5] = addrbuf;
	        params[6] = addrbuf.length;
	    }
	    return syscall.apply(null, params);
	}
	exports.sendto = sendto;
	function sendtoAsync(fd, buf, flags, addr, addr_type, callback) {
	    if (flags === void 0) { flags = 0; }
	    var params = [x86_64_linux_1.SYS.sendto, fd, buf, buf.length, flags, 0, 0, callback];
	    if (addr) {
	        var addrbuf = addr_type.pack(addr);
	        params[5] = addrbuf;
	        params[6] = addrbuf.length;
	    }
	    syscall.apply(null, params);
	}
	exports.sendtoAsync = sendtoAsync;
	function recv(sockfd, buf, flags) {
	    if (flags === void 0) { flags = 0; }
	    return recvfrom(sockfd, buf, buf.length, flags, 0, 0);
	}
	exports.recv = recv;
	function recvfrom(sockfd, buf, len, flags, addr, addrlen) {
	    return syscall(x86_64_linux_1.SYS.recvfrom, sockfd, buf, len, flags, addr, addrlen);
	}
	exports.recvfrom = recvfrom;
	function setsockopt(sockfd, level, optname, optval) {
	    return syscall(x86_64_linux_1.SYS.setsockopt, sockfd, level, optname, optval, optval.length);
	}
	exports.setsockopt = setsockopt;
	function getpid() {
	    return syscall(x86_64_linux_1.SYS.getpid);
	}
	exports.getpid = getpid;
	function getppid() {
	    return syscall(x86_64_linux_1.SYS.getppid);
	}
	exports.getppid = getppid;
	function getppidAsync(callback) {
	    p.asyscall(x86_64_linux_1.SYS.getppid, callback);
	}
	exports.getppidAsync = getppidAsync;
	function getuid() {
	    return syscall(x86_64_linux_1.SYS.getuid);
	}
	exports.getuid = getuid;
	function geteuid() {
	    return syscall(x86_64_linux_1.SYS.geteuid);
	}
	exports.geteuid = geteuid;
	function getgid() {
	    return syscall(x86_64_linux_1.SYS.getgid);
	}
	exports.getgid = getgid;
	function getegid() {
	    return syscall(x86_64_linux_1.SYS.getegid);
	}
	exports.getegid = getegid;
	function sched_yield() {
	    syscall(x86_64_linux_1.SYS.sched_yield);
	}
	exports.sched_yield = sched_yield;
	function nanosleep(seconds, nanoseconds) {
	    var buf = types.timespec.pack({
	        tv_sec: [seconds, 0],
	        tv_nsec: [nanoseconds, 0]
	    });
	    return syscall(x86_64_linux_1.SYS.nanosleep, buf, types.NULL);
	}
	exports.nanosleep = nanosleep;
	function epoll_create(size) {
	    return syscall(x86_64_linux_1.SYS.epoll_create, size);
	}
	exports.epoll_create = epoll_create;
	function epoll_create1(flags) {
	    return syscall(x86_64_linux_1.SYS.epoll_create1, flags);
	}
	exports.epoll_create1 = epoll_create1;
	function epoll_wait(epfd, buf, maxevents, timeout) {
	    return syscall(x86_64_linux_1.SYS.epoll_wait, epfd, buf, maxevents, timeout);
	}
	exports.epoll_wait = epoll_wait;
	function epoll_ctl(epfd, op, fd, epoll_event) {
	    var buf = types.epoll_event.pack(epoll_event);
	    return syscall(x86_64_linux_1.SYS.epoll_ctl, epfd, op, fd, buf);
	}
	exports.epoll_ctl = epoll_ctl;
	function inotify_init() {
	    return syscall(x86_64_linux_1.SYS.inotify_init);
	}
	exports.inotify_init = inotify_init;
	function inotify_init1(flags) {
	    return syscall(x86_64_linux_1.SYS.inotify_init1, flags);
	}
	exports.inotify_init1 = inotify_init1;
	function inotify_add_watch(fd, pathname, mask) {
	    return syscall(x86_64_linux_1.SYS.inotify_add_watch, fd, pathname, mask);
	}
	exports.inotify_add_watch = inotify_add_watch;
	function inotify_rm_watch(fd, wd) {
	    return syscall(x86_64_linux_1.SYS.inotify_rm_watch, fd, wd);
	}
	exports.inotify_rm_watch = inotify_rm_watch;
	function fcntl(fd, cmd, arg) {
	    var params = [x86_64_linux_1.SYS.fcntl, fd, cmd];
	    if (typeof arg !== 'undefined')
	        params.push(arg);
	    return syscall.apply(null, params);
	}
	exports.fcntl = fcntl;
	function isatty(fd) {
	    if ((fd >= 0) && (fd <= 3))
	        return true;
	    else
	        false;
	}
	exports.isatty = isatty;
	function mmap(addr, length, prot, flags, fd, offset) {
	    return syscall64(x86_64_linux_1.SYS.mmap, addr, length, prot, flags, fd, offset);
	}
	exports.mmap = mmap;
	function munmap(addr, length) {
	    return syscall(x86_64_linux_1.SYS.munmap, addr, length);
	}
	exports.munmap = munmap;
	function mprotect(addr, len, prot) {
	    return syscall(x86_64_linux_1.SYS.mprotect, addr, len, prot);
	}
	exports.mprotect = mprotect;
	function shmget(key, size, shmflg) {
	    return syscall(x86_64_linux_1.SYS.shmget, key, size, shmflg);
	}
	exports.shmget = shmget;
	function shmat(shmid, shmaddr, shmflg) {
	    if (shmaddr === void 0) { shmaddr = types.NULL; }
	    if (shmflg === void 0) { shmflg = 0; }
	    return syscall64(x86_64_linux_1.SYS.shmat, shmid, shmaddr, shmflg);
	}
	exports.shmat = shmat;
	function shmdt(shmaddr) {
	    return syscall(x86_64_linux_1.SYS.shmdt, shmaddr);
	}
	exports.shmdt = shmdt;
	function shmctl(shmid, cmd, buf) {
	    if (buf === void 0) { buf = types.NULL; }
	    if (buf instanceof buffer_1.Buffer) {
	    }
	    else if (typeof buf === 'object') {
	        buf = types.shmid_ds.pack(buf);
	    }
	    else {
	    }
	    return syscall(x86_64_linux_1.SYS.shmctl, shmid, cmd, buf);
	}
	exports.shmctl = shmctl;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var StaticArrayBuffer = __webpack_require__(11).StaticArrayBuffer;


	exports.StaticBuffer = StaticBuffer;


	// function bufferNew(size) {
	//     return new Buffer(size); // Node < 6.0
	// return Buffer.allocUnsafe(size); // Node 6.0
	// }

	function bufferFrom(arr, a, b) {
	    return new Buffer(arr, a, b); // Node < 6.0
	    // return Buffer.from(arr, a, b); // Node 6.0
	}


	// new StaticBuffer(size);
	// new StaticBuffer(staticArrayBuffer, byteOffset, length);
	function StaticBuffer(a, b, c) {
	    this._next = null; // Used in thread pool

	    var buf;
	    if(StaticArrayBuffer.isStaticArrayBuffer(a)) {
	        var staticArrayBuffer = a, byteOffset = b, length = c;
	        if(!byteOffset) byteOffset = 0;
	        if(!length) length = staticArrayBuffer.byteLength;
	        buf = bufferFrom(staticArrayBuffer);
	        if((byteOffset !== 0) || (length !== staticArrayBuffer.byteLength)) {
	            buf = buf.slice(byteOffset, byteOffset + length);
	        }
	    } else if(typeof a === 'number') {
	        var size = a;
	        var sab = new StaticArrayBuffer(size);
	        buf = bufferFrom(sab);
	    } else if(typeof a === 'string') {
	        var str = a;
	        var size = str.length;
	        var sab = new StaticArrayBuffer(size);
	        buf = bufferFrom(sab);
	        for(var i = 0; i < size; i++) buf[i] = str.charCodeAt(i);
	    } else
	        throw TypeError('Invalid StaticBuffer constructor arguments.');

	    buf.__proto__ = StaticBuffer.prototype;
	    return buf;
	}


	// # Static methods

	StaticBuffer.isStaticBuffer = function(sbuf) {
	    if((sbuf instanceof StaticBuffer) && (typeof sbuf.getAddress === 'function')) return true;
	    else return false;
	};

	StaticBuffer.alloc = function(size, prot) {
	    var arr;
	    if(size instanceof Array) {
	        arr = size;
	        size = size.length;
	    }
	    var sab = StaticArrayBuffer.alloc(size, prot);
	    var sb = new StaticBuffer(sab);

	    if(arr) sb.fillWith(arr);
	    return sb;
	};

	StaticBuffer.allocSafe = function(size, fill, encoding, prot) {
	    var sb = StaticBuffer.alloc(size, prot);
	    sb.fill(fill, 0, sab.length, encoding);
	    return sb;
	};

	StaticBuffer.frame = function(address, size) {
	    var sab = StaticArrayBuffer.frame(address, size);
	    return new StaticBuffer(sab);
	};

	StaticBuffer.concat = function(list) {
	    
	}

	// StaticBuffer.from([1, 2, 3]);
	// StaticBuffer.from(new StaticArrayBuffer(100));
	// StaticBuffer.from(new ArrayBuffer(100));
	// StaticBuffer.from(new Buffer(100));
	// StaticBuffer.from('Hello world');
	StaticBuffer.from = function(obj, a, b) {
	    if(obj instanceof Array) {
	        var array = obj;
	        var size = array.length;
	        var sb = new StaticBuffer(size);
	        for(var i = 0; i < size; i++) sbuf[i] = array[i];
	        return sb;
	    } else if(StaticArrayBuffer.isStaticArrayBuffer(obj)) {
	        var staticArrayBuffer = obj, byteOffset = a, length = b;
	        return new StaticBuffer(staticArrayBuffer, byteOffset, length);
	    } else if(obj instanceof ArrayBuffer) {
	        var arrayBuffer = obj, byteOffset = a, length = b;
	        return StaticBuffer.from(new StaticArrayBuffer(arrayBuffer), byteOffset, length);


	    } else if(Buffer.isBuffer(obj) && !StaticBuffer.isStaticBuffer(obj)) {

	        // Create a `StaticBuffer` from simple `Buffer`.
	        // This is very ad-hoc and hacky currently.

	        const MIN_SIZE = 200;
	        const LEN = obj.length;
	        if(LEN < MIN_SIZE) {
	            var sab = new StaticArrayBuffer(MIN_SIZE);
	            var sb = new StaticBuffer(sab, 0, LEN);
	            obj.copy(sb);
	            return sb;
	        } else {
	            // If buffer is already big we just wrap that memory contents into
	            // StaticBuffer, btw could we use `process.frame()` here?
	            var sab = new StaticArrayBuffer(obj.buffer);
	            return new StaticBuffer(sab);
	        }

	    } else if(typeof obj === 'string') {
	        var len = obj.length;
	        // TODO: It should be new StaticBuffer()
	        var sb = new StaticBuffer(len);
	        // var sb1 = new StaticBuffer(30000000);
	        // var sb = sb1.slice(0, obj.length);
	        for(var i = 0; i < len; i++) sb[i] = obj.charCodeAt(i);
	        return sb;
	    } else if(obj instanceof Uint8Array) {
	        // This includes `instanceof Buffer` as Buffer extends Uint8Array.
	        var sb = new StaticBuffer(obj.length);
	        sb.fill(obj);
	        return sb;
	    } else
	        throw TypeError("Do not know how to create StaticBuffer from this type.");
	};




	StaticBuffer.prototype.__proto__ =
	    Buffer.prototype;



	// # Member instance methods

	// Execute machine code inside the buffer.
	StaticBuffer.prototype.call = function(offset, args) {
	    offset += this.byteOffset;
	    return this.buffer.call(offset, args);
	};

	StaticBuffer.prototype.getAddress = function(offset) {
	    if(!offset) offset = 0;
	    offset += this.byteOffset;
	    return this.buffer.getAddress(offset);
	};

	// We don't add `setProtection` and `free` methods to `StaticBuffer`
	// because those are really specific to the underlying `StaticArrayBuffer`.

	// We extend the `Buffer`. In general, all methods of `Buffer` return
	// something that IS NOT a `Buffer` OR they return `this`.
	//
	// The exception is `.slice()` method that creates a new `Buffer`, but
	// we need to return `StaticBuffer`. So we override it here.
	StaticBuffer.prototype.slice = function(start, end) {
	    var buf = Buffer.prototype.slice.call(this, start, end);
	    buf.__proto__ = StaticBuffer.prototype;
	    return buf;
	};


	StaticBuffer.prototype.fillWith = function(arr, offset, offsetArr, len) {
	    if(!offset) offset = 0;
	    if(!offsetArr) offsetArr = 0;
	    if(!len) len = arr.length;
	    for(var i = 0; i < len; i++)
	        this[offset + i] = arr[offsetArr + i];
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var typebase_1 = __webpack_require__(15);
	exports.PATH_MAX = 4096;
	exports.isLE = true;
	exports.NULL = 0;
	var buf = Buffer.prototype;
	exports.int8 = typebase_1.Type.define(1, buf.readInt8, buf.writeInt8);
	exports.uint8 = typebase_1.Type.define(1, buf.readUInt8, buf.readUInt8);
	exports.int16 = typebase_1.Type.define(2, buf.readInt16LE, buf.writeInt16LE);
	exports.uint16 = typebase_1.Type.define(2, buf.readUInt16LE, buf.writeUInt16LE);
	exports.int32 = typebase_1.Type.define(4, buf.readInt32LE, buf.writeInt32LE);
	exports.uint32 = typebase_1.Type.define(4, buf.readUInt32LE, buf.writeUInt32LE);
	exports.int64 = typebase_1.Arr.define(exports.int32, 2);
	exports.uint64 = typebase_1.Arr.define(exports.uint32, 2);
	exports.size_t = exports.uint64;
	exports.time_t = exports.uint64;
	exports.pid_t = exports.uint32;
	exports.optval_t = exports.int32;
	exports.ipv4 = typebase_1.Type.define(4, function (offset) {
	    if (offset === void 0) { offset = 0; }
	    var buf = this;
	    var socket = __webpack_require__(16);
	    var octets = socket.Ipv4.type.unpack(buf, offset);
	    return new socket.Ipv4(octets);
	}, function (data, offset) {
	    if (offset === void 0) { offset = 0; }
	    var buf = this;
	    data.toBuffer().copy(buf, offset);
	});
	exports.pointer_t = exports.uint64;
	exports.stat = typebase_1.Struct.define(32 * 4, [
	    [0, exports.uint32, 'dev'],
	    [2 * 4, exports.uint32, 'ino'],
	    [4 * 4, exports.uint32, 'nlink'],
	    [6 * 4, exports.int32, 'mode'],
	    [7 * 4, exports.int32, 'uid'],
	    [8 * 4, exports.int32, 'gid'],
	    [10 * 4, exports.uint32, 'rdev'],
	    [12 * 4, exports.uint32, 'size'],
	    [14 * 4, exports.uint32, 'blksize'],
	    [16 * 4, exports.uint32, 'blocks'],
	    [18 * 4, exports.uint32, 'atime'],
	    [20 * 4, exports.uint32, 'atime_nsec'],
	    [22 * 4, exports.uint32, 'mtime'],
	    [24 * 4, exports.uint32, 'mtime_nsec'],
	    [26 * 4, exports.uint32, 'ctime'],
	    [28 * 4, exports.uint32, 'ctime_nsec'],
	]);
	exports.in_addr = typebase_1.Struct.define(4, [
	    [0, exports.ipv4, 's_addr'],
	]);
	exports.sockaddr_in = typebase_1.Struct.define(16, [
	    [0, exports.int16, 'sin_family'],
	    [2, exports.uint16, 'sin_port'],
	    [4, exports.in_addr, 'sin_addr'],
	    [8, typebase_1.Arr.define(exports.int8, 8), 'sin_zero'],
	]);
	exports.sockaddr = typebase_1.Struct.define(1, [
	    [0, 'sa_family', exports.uint16],
	    [2, 'sa_data', typebase_1.Arr.define(exports.int8, 14)],
	]);
	exports.epoll_event = typebase_1.Struct.define(4 + 8, [
	    [0, exports.uint32, 'events'],
	    [4, exports.uint64, 'data'],
	]);
	exports.ipc_perm = typebase_1.Struct.define(48, [
	    [0, exports.int32, '__key'],
	    [4, exports.uint32, 'uid'],
	    [8, exports.uint32, 'gid'],
	    [12, exports.uint32, 'cuid'],
	    [16, exports.uint32, 'cgid'],
	    [20, exports.uint16, 'mode'],
	    [24, exports.uint16, '__seq'],
	]);
	exports.shmid_ds = typebase_1.Struct.define(112, [
	    [0, exports.ipc_perm, 'shm_perm'],
	    [48, exports.size_t, 'shm_segsz'],
	    [56, exports.time_t, 'shm_atime'],
	    [64, exports.time_t, 'shm_dtime'],
	    [72, exports.time_t, 'shm_ctime'],
	    [80, exports.pid_t, 'shm_cpid'],
	    [84, exports.pid_t, 'shm_lpid'],
	    [88, exports.uint64, 'shm_nattch'],
	]);
	exports.utimbuf = typebase_1.Struct.define(16, [
	    [0, exports.uint64, 'actime'],
	    [8, exports.uint64, 'modtime'],
	]);
	exports.timeval = typebase_1.Struct.define(16, [
	    [0, exports.uint64, 'tv_sec'],
	    [8, exports.uint64, 'tv_nsec'],
	]);
	exports.timevalarr = typebase_1.Arr.define(exports.timeval, 2);
	exports.timespec = exports.timeval;
	exports.timespecarr = exports.timevalarr;
	exports.linux_dirent64 = typebase_1.Struct.define(19, [
	    [0, exports.uint64, 'ino64_t'],
	    [8, exports.uint64, 'off64_t'],
	    [16, exports.uint16, 'd_reclen'],
	    [18, exports.uint8, 'd_type'],
	]);
	exports.inotify_event = typebase_1.Struct.define(16, [
	    [0, exports.int32, 'wd'],
	    [4, exports.uint32, 'mask'],
	    [8, exports.uint32, 'cookie'],
	    [12, exports.uint32, 'len'],
	]);
	exports.SYS = {
	    read: 0,
	    write: 1,
	    open: 2,
	    close: 3,
	    stat: 4,
	    fstat: 5,
	    lstat: 6,
	    lseek: 8,
	    mmap: 9,
	    mprotect: 10,
	    munmap: 11,
	    brk: 12,
	    rt_sigaction: 13,
	    rt_sigprocmask: 14,
	    rt_sigreturn: 15,
	    ioctl: 16,
	    pread64: 17,
	    pwrite64: 18,
	    readv: 19,
	    writev: 20,
	    access: 21,
	    pipe: 22,
	    sched_yield: 24,
	    mremap: 25,
	    msync: 26,
	    mincore: 27,
	    madvise: 28,
	    shmget: 29,
	    shmat: 30,
	    shmctl: 31,
	    dup: 32,
	    dup2: 33,
	    pause: 34,
	    nanosleep: 35,
	    getitimer: 36,
	    alarm: 37,
	    setitimer: 38,
	    getpid: 39,
	    sendfile: 40,
	    socket: 41,
	    connect: 42,
	    accept: 43,
	    sendto: 44,
	    recvfrom: 45,
	    sendmsg: 46,
	    recvmsg: 47,
	    shutdown: 48,
	    bind: 49,
	    listen: 50,
	    getsockname: 51,
	    getpeername: 52,
	    socketpair: 53,
	    setsockopt: 54,
	    getsockopt: 55,
	    shmdt: 67,
	    fcntl: 72,
	    fsync: 74,
	    fdatasync: 75,
	    truncate: 76,
	    ftruncate: 77,
	    getdents: 78,
	    getcwd: 79,
	    chdir: 80,
	    fchdir: 81,
	    rename: 82,
	    mkdir: 83,
	    rmdir: 84,
	    creat: 85,
	    link: 86,
	    unlink: 87,
	    symlink: 88,
	    readlink: 89,
	    chmod: 90,
	    fchmod: 91,
	    chown: 92,
	    fchown: 93,
	    lchown: 94,
	    umask: 95,
	    gettimeofday: 96,
	    getrlimit: 97,
	    getrusage: 98,
	    getuid: 102,
	    getgid: 104,
	    geteuid: 107,
	    getegid: 108,
	    setpgid: 109,
	    getppid: 110,
	    utime: 132,
	    epoll_create: 213,
	    getdents64: 217,
	    epoll_wait: 232,
	    epoll_ctl: 233,
	    utimes: 235,
	    inotify_init: 253,
	    inotify_add_watch: 254,
	    inotify_rm_watch: 255,
	    mkdirat: 258,
	    futimesat: 261,
	    utimensat: 280,
	    accept4: 288,
	    epoll_create1: 291,
	    inotify_init1: 294
	};


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var buffer_1 = __webpack_require__(7);
	var Type = (function () {
	    function Type() {
	        this.size = 1;
	    }
	    Type.define = function (size, unpack, pack) {
	        var new_type = new Type;
	        new_type.size = size;
	        new_type.unpackF = unpack;
	        new_type.packF = pack;
	        return new_type;
	    };
	    Type.prototype.unpack = function (buf, offset) {
	        if (offset === void 0) { offset = 0; }
	        return this.unpackF.call(buf, offset);
	    };
	    Type.prototype.pack = function (data, buf, offset) {
	        if (offset === void 0) { offset = 0; }
	        if (!buf)
	            buf = new buffer_1.Buffer(this.size);
	        if (data instanceof buffer_1.Buffer)
	            data.copy(buf, offset);
	        else if (typeof data == 'object')
	            data.toBuffer().copy(buf, offset);
	        else
	            this.packF.call(buf, data, offset);
	        return buf;
	    };
	    return Type;
	}());
	exports.Type = Type;
	var Arr = (function () {
	    function Arr() {
	    }
	    Arr.define = function (type, len) {
	        var new_arr = new Arr;
	        new_arr.len = len;
	        new_arr.type = type;
	        new_arr.size = type.size * len;
	        return new_arr;
	    };
	    Arr.prototype.unpack = function (buf, offset) {
	        if (offset === void 0) { offset = 0; }
	        var arr = [], off;
	        for (var i = 0; i < this.len; i++) {
	            off = offset + (i * this.type.size);
	            arr.push(this.type.unpack(buf, off));
	        }
	        return arr;
	    };
	    Arr.prototype.pack = function (data, buf, offset) {
	        if (offset === void 0) { offset = 0; }
	        if (!buf)
	            buf = new buffer_1.Buffer(this.size);
	        if (data) {
	            var off;
	            for (var i = 0; (i < this.len) && (i < data.length); i++) {
	                off = offset + (i * this.type.size);
	                this.type.pack(data[i], buf, off);
	            }
	        }
	        return buf;
	    };
	    return Arr;
	}());
	exports.Arr = Arr;
	var Struct = (function () {
	    function Struct() {
	        this.defs = [];
	        this.size = 0;
	    }
	    Struct.define = function (size, defs) {
	        var new_struct = new Struct;
	        new_struct.size = size;
	        new_struct.defs = defs;
	        return new_struct;
	    };
	    Struct.prototype.unpack = function (buf, offset) {
	        if (offset === void 0) { offset = 0; }
	        var result = {};
	        for (var _i = 0, _a = this.defs; _i < _a.length; _i++) {
	            var field = _a[_i];
	            var off = field[0], type = field[1], name = field[2];
	            result[name] = type.unpack(buf, offset + off);
	        }
	        return result;
	    };
	    Struct.prototype.pack = function (data, buf, offset) {
	        if (offset === void 0) { offset = 0; }
	        if (!buf)
	            buf = new buffer_1.Buffer(this.size);
	        for (var _i = 0, _a = this.defs; _i < _a.length; _i++) {
	            var field = _a[_i];
	            var off = field[0], type = field[1], name = field[2];
	            type.pack(data[name], buf, offset + off);
	        }
	        return buf;
	    };
	    return Struct;
	}());
	exports.Struct = Struct;


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var typebase_1 = __webpack_require__(15);
	var buffer_1 = __webpack_require__(7);
	var x86_64_linux_1 = __webpack_require__(14);
	function flip(buf, offset, len) {
	    if (offset === void 0) { offset = 0; }
	    if (len === void 0) { len = buf.length; }
	    var mid = len >> 1, tmp, lside, rside;
	    for (var i = 0; i < mid; i++) {
	        lside = i + offset;
	        rside = offset + len - i - 1;
	        tmp = buf.readInt8(lside);
	        buf.writeInt8(buf.readInt8(rside), lside);
	        buf.writeInt8(tmp, rside);
	    }
	    return buf;
	}
	exports.flip = flip;
	function hton16(num) {
	    if (x86_64_linux_1.isLE)
	        return ((num & 0xFF00) >> 8) + ((num & 0xFF) << 8);
	    else
	        return num;
	}
	exports.hton16 = hton16;
	function htons(buf, offset, len) {
	    if (offset === void 0) { offset = 0; }
	    if (len === void 0) { len = buf.length; }
	    if (x86_64_linux_1.isLE)
	        return flip(buf, offset, len);
	    else
	        return buf;
	}
	exports.htons = htons;
	var Ip = (function () {
	    function Ip(ip) {
	        this.sep = '.';
	        if (typeof ip === 'string') {
	            this.buf = new buffer_1.Buffer(ip.split(this.sep));
	        }
	        else if (ip instanceof Array) {
	            this.buf = new buffer_1.Buffer(ip);
	        }
	    }
	    Ip.prototype.toString = function () {
	        return Ipv4.type.unpack(this.buf).join(this.sep);
	    };
	    Ip.prototype.toBuffer = function () {
	        return this.buf;
	    };
	    Ip.prototype.presentationToOctet = function (presentation) {
	        return +presentation;
	    };
	    Ip.prototype.octetToPresentation = function (octet) {
	        return octet;
	    };
	    return Ip;
	}());
	exports.Ip = Ip;
	var Ipv4 = (function (_super) {
	    __extends(Ipv4, _super);
	    function Ipv4(ip) {
	        if (ip === void 0) { ip = '127.0.0.1'; }
	        _super.call(this, ip);
	    }
	    Ipv4.type = typebase_1.Arr.define(x86_64_linux_1.uint8, 4);
	    return Ipv4;
	}(Ip));
	exports.Ipv4 = Ipv4;
	var Ipv6 = (function (_super) {
	    __extends(Ipv6, _super);
	    function Ipv6(ip) {
	        if (ip === void 0) { ip = '0:0:0:0:0:0:0:1'; }
	        _super.call(this, ip);
	        this.sep = ':';
	    }
	    Ipv6.prototype.presentationToOctet = function (presentation) {
	        return parseInt(presentation, 16);
	    };
	    Ipv6.prototype.octetToPresentation = function (octet) {
	        return octet.toString(16);
	    };
	    Ipv6.type = typebase_1.Arr.define(x86_64_linux_1.uint16, 16);
	    return Ipv6;
	}(Ip));
	exports.Ipv6 = Ipv6;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var EventEmitter = __webpack_require__(18).EventEmitter;
	var eloop = __webpack_require__(20);


	if(!process)
	    throw Error('`process` global not defined by JS runtime.');


	// The most important method Kappa
	process.noop = function() {};


	process.on = EventEmitter.prototype.on.bind(process);
	process.emit = EventEmitter.prototype.emit.bind(process);


	process.title = 'full.js';

	process.release = {
	    name: 'full.js',
	    lts: '',
	    sourceUrl: '',
	    headersUrl: ''
	};


	// Node.js does not allow to overwrite this property, so
	// in Node.js it will hold the Node.js version.
	process.version = 'v1.0.0';
	process.platform = 'linux';
	process.moduleLoadList = []; // For compatibility with node.
	process.versions = {
	    full: '1.0.0'
	};
	// process.arch = process.arch;
	// process.platform = process.platform;
	// process.release = process.release;
	process.argv = process.argv || [];
	process.execArgv = [];

	process.env = process.env || {
	        NODE_VERSION: '',
	        HOSTNAME: '',
	        TERM: '',
	        NPM_CONFIG_LOGLEVEL: '',
	        PATH: '',
	        PWD: '',
	        SHLVL: '',
	        HOME: '',
	        _: '',
	        OLDPWD: '',
	        NODE_DEBUG: 'stream'
	    };

	process.features = {
	    debug: false,
	    uv: false,
	    ipv6: false,
	    tls_npn: false,
	    tls_sni: false,
	    tls_ocsp: false,
	    tls: false
	};
	process.execPath = process.execPath || '';
	process.config = {};
	// reallyExit: [Function: reallyExit],


	var libjs = __webpack_require__(12);

	process.pid = libjs.getpid();

	process.getgid = function() {
	    return libjs.getgid();
	};

	process.cwd = function() {
	    try {
	        return libjs.getcwd();
	    } catch(e) {
	        console.log(e);
	        console.log(e.stack);
	        return '.';
	    }
	};

	process.yield = function() {
	    libjs.sched_yield();
	};

	process.nanosleep = function(seconds, nanoseconds) {
	    libjs.nanosleep(seconds, nanoseconds);
	};



	process.hrtime = function hrtime() {

	};


	var fs = __webpack_require__(23);
	var STDIN = 0;
	var STDOUT = 1;
	var STDERR = 2;
	process.stdout = new fs.SyncWriteStream(STDOUT);
	process.stderr = new fs.SyncWriteStream(STDERR);
	process.stdin = new fs.ReadStream(null, {fd: STDIN, autoClose: false, highWaterMark: 0});



	// abort: [Function: abort],
	// chdir: [Function: chdir],
	// umask: [Function: umask],
	// getuid: [Function: getuid],
	// geteuid: [Function: geteuid],
	// setuid: [Function: setuid],
	// seteuid: [Function: seteuid],
	// setgid: [Function: setgid],
	// setegid: [Function: setegid],
	// getgid: [Function: getgid],
	// getegid: [Function: getegid],
	// getgroups: [Function: getgroups],
	// setgroups: [Function: setgroups],
	// initgroups: [Function: initgroups],
	// hrtime: [Function: hrtime],
	// dlopen: [Function: dlopen],

	// uptime: [Function: uptime],
	// memoryUsage: [Function: memoryUsage],


	// _linkedBinding: [Function: _linkedBinding],
	// _setupDomainUse: [Function: _setupDomainUse],
	// _events:
	// { newListener: [Function],
	//     removeListener: [Function],
	//     SIGWINCH: [ [Function], [Function] ] },
	// _rawDebug: [Function],
	//     _eventsCount: 3,
	//     domain: null,
	//     _maxListeners: undefined,
	//     EventEmitter:
	// { [Function: EventEmitter]
	//     EventEmitter: [Circular],
	//         usingDomains: false,
	//     defaultMaxListeners: 10,
	//     init: [Function],
	//     listenerCount: [Function] },
	// _fatalException: [Function],
	//     _exiting: false,
	//     assert: [Function],
	//     config:
	// { target_defaults:
	// { cflags: [],
	//     default_configuration: 'Release',
	//     defines: [],
	//     include_dirs: [],
	//     libraries: [] },
	//     variables:
	//     { asan: 0,
	//         gas_version: '2.23',
	//         host_arch: 'x64',
	//         icu_data_file: 'icudt56l.dat',
	//         icu_data_in: '../../deps/icu/source/data/in/icudt56l.dat',
	//         icu_endianness: 'l',
	//         icu_gyp_path: 'tools/icu/icu-generic.gyp',
	//         icu_locales: 'en,root',
	//         icu_path: './deps/icu',
	//         icu_small: true,
	//         icu_ver_major: '56',
	//         node_byteorder: 'little',
	//         node_install_npm: true,
	//         node_prefix: '/',
	//         node_release_urlbase: 'https://nodejs.org/download/release/',
	//         node_shared_http_parser: false,
	//         node_shared_libuv: false,
	//         node_shared_openssl: false,
	//         node_shared_zlib: false,
	//         node_tag: '',
	//         node_use_dtrace: false,
	//         node_use_etw: false,
	//         node_use_lttng: false,
	//         node_use_openssl: true,
	//         node_use_perfctr: false,
	//         openssl_fips: '',
	//         openssl_no_asm: 0,
	//         target_arch: 'x64',
	//         uv_parent_path: '/deps/uv/',
	//         uv_use_dtrace: false,
	//         v8_enable_gdbjit: 0,
	//         v8_enable_i18n_support: 1,
	//         v8_no_strict_aliasing: 1,
	//         v8_optimized_debug: 0,
	//         v8_random_seed: 0,
	//         v8_use_snapshot: true,
	//         want_separate_host_toolset: 0 } },
	// nextTick: [Function: nextTick],
	// _tickCallback: [Function: _tickCallback],
	// _tickDomainCallback: [Function: _tickDomainCallback],
	// stdout: [Getter],
	//     stderr: [Getter],
	//     stdin: [Getter],
	//     openStdin: [Function],
	//     exit: [Function],
	//     kill: [Function],
	//     mainModule:
	// Module {
	//     id: '.',
	//         exports: {},
	//     parent: null,
	//         filename: '/share/full-js/lib/boot.js',
	//         loaded: false,
	//         children: [ [Object], [Object] ],
	//         paths:
	//     [ '/share/full-js/lib/node_modules',
	//         '/share/full-js/node_modules',
	//         '/share/node_modules',
	//         '/node_modules' ] } }



/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var domain;

	// This constructor is used to store event handlers. Instantiating this is
	// faster than explicitly calling `Object.create(null)` to get a "clean" empty
	// object (tested with v8 v4.9).
	function EventHandlers() {}
	EventHandlers.prototype = Object.create(null);

	function EventEmitter() {
	    EventEmitter.init.call(this);
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.usingDomains = false;

	EventEmitter.prototype.domain = undefined;
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	var defaultMaxListeners = 10;

	Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
	    enumerable: true,
	    get: function() {
	        return defaultMaxListeners;
	    },
	    set: function(arg) {
	        // force global console to be compiled.
	        // see https://github.com/nodejs/node/issues/4467
	        console;
	        defaultMaxListeners = arg;
	    }
	});

	EventEmitter.init = function() {
	    this.domain = null;
	    if (EventEmitter.usingDomains) {
	        // if there is an active domain, then attach to it.
	        domain = domain || __webpack_require__(19);
	        if (domain.active && !(this instanceof domain.Domain)) {
	            this.domain = domain.active;
	        }
	    }

	    if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
	        this._events = new EventHandlers();
	        this._eventsCount = 0;
	    }

	    this._maxListeners = this._maxListeners || undefined;
	};

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
	    if (typeof n !== 'number' || n < 0 || isNaN(n))
	        throw new TypeError('"n" argument must be a positive number');
	    this._maxListeners = n;
	    return this;
	};

	function $getMaxListeners(that) {
	    if (that._maxListeners === undefined)
	        return EventEmitter.defaultMaxListeners;
	    return that._maxListeners;
	}

	EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
	    return $getMaxListeners(this);
	};

	// These standalone emit* functions are used to optimize calling of event
	// handlers for fast cases because emit() itself often has a variable number of
	// arguments and can be deoptimized because of that. These functions always have
	// the same number of arguments and thus do not get deoptimized, so the code
	// inside them can execute faster.
	function emitNone(handler, isFn, self) {
	    if (isFn)
	        handler.call(self);
	    else {
	        var len = handler.length;
	        var listeners = arrayClone(handler, len);
	        for (var i = 0; i < len; ++i)
	            listeners[i].call(self);
	    }
	}
	function emitOne(handler, isFn, self, arg1) {
	    if (isFn)
	        handler.call(self, arg1);
	    else {
	        var len = handler.length;
	        var listeners = arrayClone(handler, len);
	        for (var i = 0; i < len; ++i)
	            listeners[i].call(self, arg1);
	    }
	}
	function emitTwo(handler, isFn, self, arg1, arg2) {
	    if (isFn)
	        handler.call(self, arg1, arg2);
	    else {
	        var len = handler.length;
	        var listeners = arrayClone(handler, len);
	        for (var i = 0; i < len; ++i)
	            listeners[i].call(self, arg1, arg2);
	    }
	}
	function emitThree(handler, isFn, self, arg1, arg2, arg3) {
	    if (isFn)
	        handler.call(self, arg1, arg2, arg3);
	    else {
	        var len = handler.length;
	        var listeners = arrayClone(handler, len);
	        for (var i = 0; i < len; ++i)
	            listeners[i].call(self, arg1, arg2, arg3);
	    }
	}

	function emitMany(handler, isFn, self, args) {
	    if (isFn)
	        handler.apply(self, args);
	    else {
	        var len = handler.length;
	        var listeners = arrayClone(handler, len);
	        for (var i = 0; i < len; ++i)
	            listeners[i].apply(self, args);
	    }
	}

	EventEmitter.prototype.emit = function emit(type) {
	    var er, handler, len, args, i, events, domain;
	    // var needDomainExit = false;
	    var doError = (type === 'error');

	    events = this._events;
	    if (events)
	        doError = (doError && events.error == null);
	    else if (!doError)
	        return false;

	    // domain = this.domain;
	    domain = null;

	    // If there is no 'error' event listener then throw.
	    if (doError) {
	        er = arguments[1];
	        if (domain) {
	            if (!er)
	                er = new Error('Uncaught, unspecified "error" event');
	            er.domainEmitter = this;
	            er.domain = domain;
	            er.domainThrown = false;
	            domain.emit('error', er);
	        } else if (er instanceof Error) {
	            throw er; // Unhandled 'error' event
	        } else {
	            // At least give some kind of context to the user
	            var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	            err.context = er;
	            throw err;
	        }
	        return false;
	    }

	    handler = events[type];

	    if (!handler)
	        return false;

	    // if (domain && this !== process) {
	    //     domain.enter();
	    //     needDomainExit = true;
	    // }

	    var isFn = typeof handler === 'function';
	    len = arguments.length;
	    switch (len) {
	        // fast cases
	        case 1:
	            emitNone(handler, isFn, this);
	            break;
	        case 2:
	            emitOne(handler, isFn, this, arguments[1]);
	            break;
	        case 3:
	            emitTwo(handler, isFn, this, arguments[1], arguments[2]);
	            break;
	        case 4:
	            emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
	            break;
	        // slower
	        default:
	            args = new Array(len - 1);
	            for (i = 1; i < len; i++)
	                args[i - 1] = arguments[i];
	            emitMany(handler, isFn, this, args);
	    }

	    // if (needDomainExit)
	    //     domain.exit();

	    return true;
	};

	function _addListener(target, type, listener, prepend) {
	    var m;
	    var events;
	    var existing;

	    if (typeof listener !== 'function')
	        throw new TypeError('"listener" argument must be a function');

	    events = target._events;
	    if (!events) {
	        events = target._events = new EventHandlers();
	        target._eventsCount = 0;
	    } else {
	        // To avoid recursion in the case that type === "newListener"! Before
	        // adding it to the listeners, first emit "newListener".
	        if (events.newListener) {
	            target.emit('newListener', type,
	                listener.listener ? listener.listener : listener);

	            // Re-assign `events` because a newListener handler could have caused the
	            // this._events to be assigned to a new object
	            events = target._events;
	        }
	        existing = events[type];
	    }

	    if (!existing) {
	        // Optimize the case of one listener. Don't need the extra array object.
	        existing = events[type] = listener;
	        ++target._eventsCount;
	    } else {
	        if (typeof existing === 'function') {
	            // Adding the second element, need to change to array.
	            existing = events[type] = prepend ? [listener, existing] :
	                [existing, listener];
	        } else {
	            // If we've already got an array, just append.
	            if (prepend) {
	                existing.unshift(listener);
	            } else {
	                existing.push(listener);
	            }
	        }

	        // Check for listener leak
	        if (!existing.warned) {
	            m = $getMaxListeners(target);
	            if (m && m > 0 && existing.length > m) {
	                existing.warned = true;
	                process.emitWarning('Possible EventEmitter memory leak detected. ' +
	                    existing.length + ' ' + type + ' listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit');
	            }
	        }
	    }

	    return target;
	}

	EventEmitter.prototype.addListener = function addListener(type, listener) {
	    return _addListener(this, type, listener, false);
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.prependListener =
	    function prependListener(type, listener) {
	        return _addListener(this, type, listener, true);
	    };

	function _onceWrap(target, type, listener) {
	    var fired = false;
	    function g() {
	        target.removeListener(type, g);
	        if (!fired) {
	            fired = true;
	            listener.apply(target, arguments);
	        }
	    }
	    g.listener = listener;
	    return g;
	}

	EventEmitter.prototype.once = function once(type, listener) {
	    if (typeof listener !== 'function')
	        throw new TypeError('"listener" argument must be a function');
	    this.on(type, _onceWrap(this, type, listener));
	    return this;
	};

	EventEmitter.prototype.prependOnceListener =
	    function prependOnceListener(type, listener) {
	        if (typeof listener !== 'function')
	            throw new TypeError('"listener" argument must be a function');
	        this.prependListener(type, _onceWrap(this, type, listener));
	        return this;
	    };

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener =
	    function removeListener(type, listener) {
	        var list, events, position, i, originalListener;

	        if (typeof listener !== 'function')
	            throw new TypeError('"listener" argument must be a function');

	        events = this._events;
	        if (!events)
	            return this;

	        list = events[type];
	        if (!list)
	            return this;

	        if (list === listener || (list.listener && list.listener === listener)) {
	            if (--this._eventsCount === 0)
	                this._events = new EventHandlers();
	            else {
	                delete events[type];
	                if (events.removeListener)
	                    this.emit('removeListener', type, list.listener || listener);
	            }
	        } else if (typeof list !== 'function') {
	            position = -1;

	            for (i = list.length; i-- > 0;) {
	                if (list[i] === listener ||
	                    (list[i].listener && list[i].listener === listener)) {
	                    originalListener = list[i].listener;
	                    position = i;
	                    break;
	                }
	            }

	            if (position < 0)
	                return this;

	            if (list.length === 1) {
	                list[0] = undefined;
	                if (--this._eventsCount === 0) {
	                    this._events = new EventHandlers();
	                    return this;
	                } else {
	                    delete events[type];
	                }
	            } else {
	                spliceOne(list, position);
	            }

	            if (events.removeListener)
	                this.emit('removeListener', type, originalListener || listener);
	        }

	        return this;
	    };

	EventEmitter.prototype.removeAllListeners =
	    function removeAllListeners(type) {
	        var listeners, events;

	        events = this._events;
	        if (!events)
	            return this;

	        // not listening for removeListener, no need to emit
	        if (!events.removeListener) {
	            if (arguments.length === 0) {
	                this._events = new EventHandlers();
	                this._eventsCount = 0;
	            } else if (events[type]) {
	                if (--this._eventsCount === 0)
	                    this._events = new EventHandlers();
	                else
	                    delete events[type];
	            }
	            return this;
	        }

	        // emit removeListener for all listeners on all events
	        if (arguments.length === 0) {
	            var keys = Object.keys(events);
	            for (var i = 0, key; i < keys.length; ++i) {
	                key = keys[i];
	                if (key === 'removeListener') continue;
	                this.removeAllListeners(key);
	            }
	            this.removeAllListeners('removeListener');
	            this._events = new EventHandlers();
	            this._eventsCount = 0;
	            return this;
	        }

	        listeners = events[type];

	        if (typeof listeners === 'function') {
	            this.removeListener(type, listeners);
	        } else if (listeners) {
	            // LIFO order
	            do {
	                this.removeListener(type, listeners[listeners.length - 1]);
	            } while (listeners[0]);
	        }

	        return this;
	    };

	EventEmitter.prototype.listeners = function listeners(type) {
	    var evlistener;
	    var ret;
	    var events = this._events;

	    if (!events)
	        ret = [];
	    else {
	        evlistener = events[type];
	        if (!evlistener)
	            ret = [];
	        else if (typeof evlistener === 'function')
	            ret = [evlistener];
	        else
	            ret = arrayClone(evlistener, evlistener.length);
	    }

	    return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	    if (typeof emitter.listenerCount === 'function') {
	        return emitter.listenerCount(type);
	    } else {
	        return listenerCount.call(emitter, type);
	    }
	};

	EventEmitter.prototype.listenerCount = listenerCount;
	function listenerCount(type) {
	    const events = this._events;

	    if (events) {
	        const evlistener = events[type];

	        if (typeof evlistener === 'function') {
	            return 1;
	        } else if (evlistener) {
	            return evlistener.length;
	        }
	    }

	    return 0;
	}

	EventEmitter.prototype.eventNames = function eventNames() {
	    return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
	};

	// About 1.5x faster than the two-arg version of Array#splice().
	function spliceOne(list, index) {
	    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
	        list[i] = list[k];
	    list.pop();
	}

	function arrayClone(arr, i) {
	    var copy = new Array(i);
	    while (i--)
	        copy[i] = arr[i];
	    return copy;
	}


/***/ },
/* 19 */
/***/ function(module, exports) {

	module.exports = require("domain");

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var index_1 = __webpack_require__(12);
	var Poll;
	var platform = process.platform;
	switch (platform) {
	    case 'linux':
	        Poll = __webpack_require__(21).Poll;
	        break;
	    default:
	        throw Error("Platform not supported: " + platform);
	}
	var POINTER_NONE = -1;
	var DELAYS = [
	    -2,
	    -1,
	    1,
	    8,
	    16,
	    32,
	    64,
	    128,
	    256,
	    1024,
	    4096,
	    16384,
	    65536,
	    131072,
	    524288,
	    2097152,
	    8388608,
	    33554432,
	    268435456,
	    2147483648,
	    Infinity,
	];
	var DELAY_LAST = DELAYS.length - 1;
	function findDelayIndex(delay) {
	    for (var i = 0; i <= DELAY_LAST; i++)
	        if (delay <= DELAYS[i])
	            return i;
	}
	var MicroTask = (function () {
	    function MicroTask(callback, args) {
	        this.next = null;
	        this.prev = null;
	        this.callback = callback || null;
	        this.args = args || null;
	    }
	    MicroTask.prototype.exec = function () {
	        var args = this.args, callback = this.callback;
	        if (!args) {
	            callback();
	        }
	        else {
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
	    };
	    return MicroTask;
	}());
	exports.MicroTask = MicroTask;
	var Task = (function (_super) {
	    __extends(Task, _super);
	    function Task() {
	        _super.apply(this, arguments);
	        this.delay = -2;
	        this.timeout = 0;
	        this.pointer = POINTER_NONE;
	        this.isRef = true;
	        this.queue = null;
	    }
	    Task.prototype.ref = function () {
	        if (!this.isRef) {
	        }
	    };
	    Task.prototype.unref = function () {
	        if (this.isRef) {
	        }
	    };
	    Task.prototype.cancel = function () {
	        this.queue.cancel(this);
	    };
	    return Task;
	}(MicroTask));
	exports.Task = Task;
	var EventQueue = (function () {
	    function EventQueue() {
	        this.start = null;
	        this.active = null;
	        this.pointers = [];
	    }
	    EventQueue.prototype.setPointer = function (pointer_index, task) {
	        var pointers = this.pointers;
	        var timeout = task.timeout;
	        pointers[pointer_index] = task;
	        task.pointer = pointer_index;
	        for (var i = pointer_index + 1; i <= DELAY_LAST; i++) {
	            var p = pointers[i];
	            if (!p) {
	                pointers[i] = task;
	            }
	            else {
	                if (p.timeout <= timeout) {
	                    pointers[i] = task;
	                }
	                else {
	                    break;
	                }
	            }
	        }
	    };
	    EventQueue.prototype.insertTask = function (curr, task) {
	        var timeout = task.timeout;
	        var prev = null;
	        if (timeout >= curr.timeout) {
	            do {
	                prev = curr;
	                curr = curr.next;
	            } while (curr && (curr.timeout <= timeout));
	            prev.next = task;
	            task.prev = prev;
	            if (curr) {
	                curr.prev = task;
	                task.next = curr;
	            }
	        }
	        else {
	            do {
	                prev = curr;
	                curr = curr.prev;
	            } while (curr && (curr.timeout > timeout));
	            prev.prev = task;
	            task.next = prev;
	            if (curr) {
	                curr.next = task;
	                task.prev = curr;
	            }
	            else {
	                this.start = task;
	            }
	        }
	    };
	    EventQueue.prototype.msNextTask = function () {
	        if (this.start) {
	            return this.start.timeout - Date.now();
	        }
	        return Infinity;
	    };
	    EventQueue.prototype.insert = function (task) {
	        task.queue = this;
	        var delay = task.delay;
	        var timeout = task.timeout = Date.now() + delay;
	        var pointers = this.pointers;
	        var pointer_index = findDelayIndex(delay);
	        var curr = pointers[pointer_index];
	        if (!curr) {
	            this.setPointer(pointer_index, task);
	            if (pointer_index) {
	                for (var i = pointer_index - 1; i >= 0; i--) {
	                    if (pointers[i]) {
	                        curr = pointers[i];
	                        break;
	                    }
	                }
	            }
	            if (!curr)
	                curr = this.start;
	            if (!curr) {
	                this.start = task;
	            }
	            else {
	                this.insertTask(curr, task);
	            }
	        }
	        else {
	            if (timeout >= curr.timeout) {
	                this.setPointer(pointer_index, task);
	            }
	            this.insertTask(curr, task);
	        }
	    };
	    EventQueue.prototype.cancel = function (task) {
	        var prev = task.prev;
	        var next = task.next;
	        task.prev = task.next = null;
	        if (prev)
	            prev.next = next;
	        if (next)
	            next.prev = prev;
	        if (!prev) {
	            this.start = next;
	        }
	        if (task.pointer !== POINTER_NONE) {
	            var index = task.pointer;
	            if (index) {
	                this.pointers[index] = this.pointers[index - 1];
	            }
	            else {
	                this.pointers[index] = null;
	            }
	        }
	    };
	    EventQueue.prototype.sliceActiveQueue = function () {
	        var curr = this.start;
	        if (!curr)
	            return;
	        var time = Date.now();
	        var pointers = this.pointers;
	        for (var i = 0; i <= DELAY_LAST; i++) {
	            var pointer = pointers[i];
	            if (pointer) {
	                if (pointer.timeout <= time) {
	                    pointers[i] = null;
	                    curr = pointer;
	                }
	                else {
	                    break;
	                }
	            }
	        }
	        if (curr.timeout > time)
	            return;
	        var prev;
	        do {
	            prev = curr;
	            curr = curr.next;
	        } while (curr && (curr.timeout <= time));
	        prev.next = null;
	        if (curr)
	            curr.prev = null;
	        this.active = this.start;
	        this.start = curr;
	    };
	    EventQueue.prototype.cycle = function () {
	        this.sliceActiveQueue();
	    };
	    EventQueue.prototype.pop = function () {
	        var task = this.active;
	        if (!task)
	            return null;
	        this.active = task.next;
	        return task;
	    };
	    return EventQueue;
	}());
	exports.EventQueue = EventQueue;
	var EventLoop = (function () {
	    function EventLoop() {
	        this.microQueue = null;
	        this.microQueueEnd = null;
	        this.refQueue = new EventQueue;
	        this.unrefQueue = new EventQueue;
	        this.poll = new Poll;
	    }
	    EventLoop.prototype.shouldStop = function () {
	        if (!this.refQueue.start)
	            return true;
	        return false;
	    };
	    EventLoop.prototype.insertMicrotask = function (microtask) {
	        var last = this.microQueueEnd;
	        this.microQueueEnd = microtask;
	        if (!last) {
	            this.microQueue = microtask;
	        }
	        else {
	            last.next = microtask;
	        }
	    };
	    EventLoop.prototype.insert = function (task) {
	        if (task.isRef)
	            this.refQueue.insert(task);
	        else
	            this.unrefQueue.insert(task);
	    };
	    EventLoop.prototype.start = function () {
	        function exec_task(task) {
	            if (task.callback)
	                task.callback();
	        }
	        while (1) {
	            this.refQueue.cycle();
	            this.unrefQueue.cycle();
	            var refTask = this.refQueue.pop();
	            var unrefTask = this.unrefQueue.pop();
	            var task;
	            while (refTask || unrefTask) {
	                if (refTask && unrefTask) {
	                    if (refTask.timeout < unrefTask.timeout) {
	                        refTask.exec();
	                        refTask = null;
	                    }
	                    else if (refTask.timeout > unrefTask.timeout) {
	                        unrefTask.exec();
	                        unrefTask = null;
	                    }
	                    else {
	                        if (refTask.timeout <= unrefTask.timeout) {
	                            refTask.exec();
	                            refTask = null;
	                        }
	                        else {
	                            unrefTask.exec();
	                            unrefTask = null;
	                        }
	                    }
	                }
	                else {
	                    if (refTask) {
	                        refTask.exec();
	                        refTask = null;
	                    }
	                    else {
	                        unrefTask.exec();
	                        unrefTask = null;
	                    }
	                }
	                var microtask;
	                do {
	                    microtask = this.microQueue;
	                    if (microtask) {
	                        if (microtask.callback)
	                            microtask.exec();
	                        this.microQueue = microtask.next;
	                    }
	                } while (this.microQueue);
	                this.microQueueEnd = null;
	                if (!refTask)
	                    refTask = this.refQueue.pop();
	                else
	                    unrefTask = this.unrefQueue.pop();
	            }
	            var havePollEvents = this.poll.hasRefs();
	            if (this.shouldStop() && !havePollEvents)
	                break;
	            var ref_ms = this.refQueue.msNextTask();
	            var unref_ms = this.unrefQueue.msNextTask();
	            var CAP = 1000000;
	            var ms = Math.min(ref_ms, unref_ms, CAP);
	            if (ms > 0) {
	                if (havePollEvents) {
	                    this.poll.wait(ms);
	                }
	                else {
	                    var seconds = Math.floor(ms / 1000);
	                    var nanoseconds = (ms % 1000) * 1000000;
	                    index_1.nanosleep(seconds, nanoseconds);
	                }
	            }
	            else {
	                if (ms > 1) {
	                    index_1.sched_yield();
	                }
	            }
	        }
	    };
	    return EventLoop;
	}());
	exports.EventLoop = EventLoop;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var libjs = __webpack_require__(12);
	var static_buffer_1 = __webpack_require__(13);
	var event_1 = __webpack_require__(22);
	var CHUNK = 11;
	var Socket = (function () {
	    function Socket() {
	        this.poll = null;
	        this.fd = 0;
	        this.connected = false;
	        this.reffed = false;
	        this.onstart = event_1.noop;
	        this.onstop = event_1.noop;
	        this.ondata = event_1.noop;
	        this.onerror = event_1.noop;
	    }
	    Socket.prototype.start = function () {
	        this.fd = libjs.socket(2, this.type, 0);
	        if (this.fd < 0)
	            return Error("Could not create scoket: errno = " + this.fd);
	        var fcntl = libjs.fcntl(this.fd, 4, 2048);
	        if (fcntl < 0)
	            return Error("Could not make socket non-blocking: errno = " + fcntl);
	    };
	    Socket.prototype.stop = function () {
	        if (this.fd) {
	            libjs.close(this.fd);
	            this.fd = 0;
	        }
	        this.onstop();
	    };
	    return Socket;
	}());
	exports.Socket = Socket;
	var SocketUdp4 = (function (_super) {
	    __extends(SocketUdp4, _super);
	    function SocketUdp4() {
	        _super.apply(this, arguments);
	        this.type = 2;
	        this.isIPv4 = true;
	    }
	    SocketUdp4.prototype.start = function () {
	        var err = _super.prototype.start.call(this);
	        if (err)
	            return err;
	        var fd = this.fd;
	        var event = {
	            events: 1,
	            data: [fd, 0]
	        };
	        var ctl = libjs.epoll_ctl(this.poll.epfd, 1, fd, event);
	        if (ctl < 0)
	            return Error("Could not add epoll events: errno = " + ctl);
	    };
	    SocketUdp4.prototype.send = function (buf, ip, port) {
	        var addr = {
	            sin_family: 2,
	            sin_port: libjs.hton16(port),
	            sin_addr: {
	                s_addr: new libjs.Ipv4(ip)
	            },
	            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0]
	        };
	        var flags = 64 | 16384;
	        var res = libjs.sendto(this.fd, buf, flags, addr, libjs.sockaddr_in);
	        if (res < 0) {
	            if (-res == 11) {
	                return;
	            }
	            else {
	                return Error("sendto error, errno = " + res);
	            }
	        }
	    };
	    SocketUdp4.prototype.setOption = function (level, option, value) {
	        var buf = libjs.optval_t.pack(value);
	        return libjs.setsockopt(this.fd, level, option, buf);
	    };
	    SocketUdp4.prototype.bind = function (port, ip, reuse) {
	        if (ip === void 0) { ip = '0.0.0.0'; }
	        if (reuse) {
	            var reuseRes = this.setOption(65535, 4, 1);
	            if (reuseRes < 0)
	                return reuseRes;
	        }
	        var addr = {
	            sin_family: 2,
	            sin_port: libjs.hton16(port),
	            sin_addr: {
	                s_addr: new libjs.Ipv4(ip)
	            },
	            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0]
	        };
	        var res = libjs.bind(this.fd, addr, libjs.sockaddr_in);
	        if (res < 0)
	            return res;
	        this.reffed = true;
	        this.poll.refs++;
	    };
	    SocketUdp4.prototype.update = function (events) {
	        if ((events & 1) || (events & 2)) {
	            do {
	                var addrlen = libjs.sockaddr_in.size;
	                var buf = new static_buffer_1.StaticBuffer(CHUNK + addrlen + 4);
	                var data = buf.slice(0, CHUNK);
	                var addr = buf.slice(CHUNK, CHUNK + addrlen);
	                var addrlenBuf = buf.slice(CHUNK + addrlen);
	                libjs.int32.pack(libjs.sockaddr_in.size, addrlenBuf);
	                var bytes = libjs.recvfrom(this.fd, data, CHUNK, 0, addr, addrlenBuf);
	                if (bytes < -1) {
	                    this.onerror(Error("Error reading data: " + bytes));
	                    break;
	                }
	                else {
	                    var retAddrLen = libjs.int32.unpack(addrlenBuf);
	                    var addrStruct = libjs.sockaddr_in.unpack(addr);
	                    var from = {
	                        address: addrStruct.sin_addr.s_addr.toString(),
	                        family: retAddrLen === addrlen ? 'IPv4' : 'IPv6',
	                        port: addrStruct.sin_port,
	                        size: bytes
	                    };
	                    this.ondata(buf.slice(0, bytes), from);
	                }
	            } while (bytes === CHUNK);
	        }
	        if (events & 8) {
	            this.onerror(Error("Some error on " + this.fd));
	        }
	        if (events & 8192) {
	        }
	        if (events & 16) {
	        }
	    };
	    SocketUdp4.prototype.setTtl = function (ttl) {
	        if (ttl < 1 || ttl > 255)
	            return -22;
	        return this.setOption(0, 2, ttl);
	    };
	    SocketUdp4.prototype.setMulticastTtl = function (ttl) {
	        return this.setOption(0, 33, ttl);
	    };
	    SocketUdp4.prototype.setMulticastLoop = function (on) {
	        return this.setOption(0, 34, on ? 1 : 0);
	    };
	    return SocketUdp4;
	}(Socket));
	exports.SocketUdp4 = SocketUdp4;
	var SocketUdp6 = (function (_super) {
	    __extends(SocketUdp6, _super);
	    function SocketUdp6() {
	        _super.apply(this, arguments);
	        this.isIPv4 = false;
	    }
	    SocketUdp6.prototype.setTtl = function (ttl) {
	        if (ttl < 1 || ttl > 255)
	            return -22;
	        return this.setOption(41, 16, ttl);
	    };
	    SocketUdp6.prototype.setMulticastTtl = function (ttl) {
	        return this.setOption(41, 18, ttl);
	    };
	    SocketUdp6.prototype.setMulticastLoop = function (on) {
	        return this.setOption(41, 19, on ? 1 : 0);
	    };
	    return SocketUdp6;
	}(SocketUdp4));
	exports.SocketUdp6 = SocketUdp6;
	var SocketTcp = (function (_super) {
	    __extends(SocketTcp, _super);
	    function SocketTcp() {
	        _super.apply(this, arguments);
	        this.type = 1;
	        this.connected = false;
	    }
	    SocketTcp.prototype.connect = function (opts) {
	        var addr_in = {
	            sin_family: 2,
	            sin_port: libjs.hton16(opts.port),
	            sin_addr: {
	                s_addr: new libjs.Ipv4(opts.host)
	            },
	            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0]
	        };
	        var res = libjs.connect(this.fd, addr_in);
	        if (res == -115) {
	            this.poll();
	            return;
	        }
	        if (res < 0)
	            throw Error("Could no connect: " + res);
	        throw Error('Something went not according to plan.');
	    };
	    SocketTcp.prototype.onRead = function () {
	    };
	    SocketTcp.prototype.write = function (data) {
	        var sb = static_buffer_1.StaticBuffer.from(data + '\0');
	        var res = libjs.write(this.fd, sb);
	        return res;
	    };
	    return SocketTcp;
	}(Socket));
	exports.SocketTcp = SocketTcp;
	var Poll = (function () {
	    function Poll() {
	        this.socks = {};
	        this.refs = 0;
	        this.epfd = 0;
	        this.onerror = event_1.noop;
	        this.maxEvents = 10;
	        this.eventSize = libjs.epoll_event.size;
	        this.eventBuf = static_buffer_1.StaticBuffer.alloc(this.maxEvents * this.eventSize, 'rw');
	        this.epfd = libjs.epoll_create1(0);
	        if (this.epfd < 0)
	            throw Error("Could not create epoll fd: errno = " + this.epfd);
	    }
	    Poll.prototype.wait = function (timeout) {
	        var EVENT_SIZE = this.eventSize;
	        var evbuf = this.eventBuf;
	        var waitres = libjs.epoll_wait(this.epfd, evbuf, this.maxEvents, timeout);
	        if (waitres > 0) {
	            for (var i = 0; i < waitres; i++) {
	                var event = libjs.epoll_event.unpack(evbuf, i * EVENT_SIZE);
	                var fd = event.data[0];
	                var socket = this.socks[fd];
	                if (socket) {
	                    socket.update(event.events);
	                }
	                else {
	                    this.onerror(Error("Socket not in pool: " + fd));
	                }
	            }
	        }
	        else if (waitres < 0) {
	            this.onerror(Error("Error while waiting for connection: " + waitres));
	        }
	        setTimeout(this.wait.bind(this), 1000);
	    };
	    Poll.prototype.hasRefs = function () {
	        return !!this.refs;
	    };
	    Poll.prototype.createUdpSocket = function (udp6) {
	        var sock = !udp6 ? new SocketUdp4 : new SocketUdp6;
	        sock.poll = this;
	        var err = sock.start();
	        this.socks[sock.fd] = sock;
	        if (err)
	            return err;
	        else
	            return sock;
	    };
	    return Poll;
	}());
	exports.Poll = Poll;


/***/ },
/* 22 */
/***/ function(module, exports) {

	"use strict";
	function noop() { }
	exports.noop = noop;


/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var libjs = __webpack_require__(12);
	var inotify_1 = __webpack_require__(24);
	var util = __webpack_require__(6);
	var pathModule = __webpack_require__(25);
	var events_1 = __webpack_require__(18);
	var buffer_1 = __webpack_require__(7);
	var static_buffer_1 = __webpack_require__(13);
	var stream_1 = __webpack_require__(26);
	if (true) {
	    exports.isFULLjs = true;
	}
	function noop() { }
	var isSB = static_buffer_1.StaticBuffer.isStaticBuffer;
	var ERRSTR = {
	    PATH_STR: 'path must be a string',
	    FD: 'file descriptor must be a unsigned 32-bit integer',
	    MODE_INT: 'mode must be an integer',
	    CB: 'callback must be a function',
	    UID: 'uid must be an unsigned int',
	    GID: 'gid must be an unsigned int',
	    LEN: 'len must be an integer',
	    ATIME: 'atime must be an integer',
	    MTIME: 'mtime must be an integer',
	    PREFIX: 'filename prefix is required',
	    BUFFER: 'buffer must be an instance of Buffer or StaticBuffer',
	    OFFSET: 'offset must be an integer',
	    LENGTH: 'length must be an integer',
	    POSITION: 'position must be an integer'
	};
	var ERRSTR_OPTS = function (tipeof) { return ("Expected options to be either an object or a string, but got " + tipeof + " instead"); };
	function formatError(errno, func, path, path2) {
	    if (func === void 0) { func = ''; }
	    if (path === void 0) { path = ''; }
	    if (path2 === void 0) { path2 = ''; }
	    switch (-errno) {
	        case 2: return "ENOENT: no such file or directory, " + func + " '" + path + "'";
	        case 9: return "EBADF: bad file descriptor, " + func;
	        case 22: return "EINVAL: invalid argument, " + func;
	        case 1: return "EPERM: operation not permitted, " + func + " '" + path + "' -> '" + path2 + "'";
	        case 71: return "EPROTO: protocol error, " + func + " '" + path + "' -> '" + path2 + "'";
	        case 17: return "EEXIST: file already exists, " + func + " '" + path + "' -> '" + path2 + "'";
	        default: return "Error occurred in " + func + ": errno = " + errno;
	    }
	}
	function throwError(errno, func, path, path2) {
	    if (func === void 0) { func = ''; }
	    if (path === void 0) { path = ''; }
	    if (path2 === void 0) { path2 = ''; }
	    throw Error(formatError(errno, func, path, path2));
	}
	function pathOrError(path, encoding) {
	    if (path instanceof buffer_1.Buffer)
	        path = path.toString(encoding);
	    if (typeof path !== 'string')
	        return TypeError(ERRSTR.PATH_STR);
	    return path;
	}
	function validPathOrThrow(path, encoding) {
	    var p = pathOrError(path, encoding);
	    if (p instanceof TypeError)
	        throw p;
	    else
	        return p;
	}
	function assertEncoding(encoding) {
	    if (encoding && !buffer_1.Buffer.isEncoding(encoding))
	        throw Error('Unknown encoding: ' + encoding);
	}
	function validateFd(fd) {
	    if (typeof fd !== 'number')
	        throw TypeError(ERRSTR.FD);
	}
	function getOptions(defaults, options) {
	    if (!options)
	        return defaults;
	    else {
	        var tipeof = typeof options;
	        switch (tipeof) {
	            case 'string': return util.extend({}, defaults, { encoding: options });
	            case 'object': return util.extend({}, defaults, options);
	            default: throw TypeError(ERRSTR_OPTS(tipeof));
	        }
	    }
	}
	var optionGenerator = function (defaults) { return function (options) { return getOptions(defaults, options); }; };
	function validateCallback(callback) {
	    if (typeof callback !== 'function')
	        throw TypeError(ERRSTR.CB);
	    return callback;
	}
	var optionAndCallbackGenerator = function (getOpts) {
	    return function (options, callback) { return typeof options === 'function'
	        ? [getOpts(), options]
	        : [getOpts(options), validateCallback(callback)]; };
	};
	(function (flags) {
	    flags[flags["r"] = 0 | 0] = "r";
	    flags[flags['r+'] = 2 | 0] = 'r+';
	    flags[flags["rs"] = 0 | 16384 | 1052672] = "rs";
	    flags[flags['rs+'] = 2 | 16384 | 1052672] = 'rs+';
	    flags[flags["w"] = 1 | 64 | 512] = "w";
	    flags[flags["wx"] = 1 | 64 | 512 | 128] = "wx";
	    flags[flags['w+'] = 2 | 64 | 512] = 'w+';
	    flags[flags['wx+'] = 2 | 64 | 512 | 128] = 'wx+';
	    flags[flags["a"] = 1 | 1024 | 64] = "a";
	    flags[flags["ax"] = 1 | 1024 | 64 | 128] = "ax";
	    flags[flags['a+'] = 2 | 1024 | 64] = 'a+';
	    flags[flags['ax+'] = 2 | 1024 | 64 | 128] = 'ax+';
	})(exports.flags || (exports.flags = {}));
	var flags = exports.flags;
	var CHUNK = 4096;
	exports.F_OK = 0;
	exports.R_OK = 4;
	exports.W_OK = 2;
	exports.X_OK = 1;
	var appendFileDefaults = {
	    encoding: 'utf8',
	    mode: 438,
	    flag: 'a'
	};
	var writeFileDefaults = {
	    encoding: 'utf8',
	    mode: 438,
	    flag: 'w'
	};
	function flagsToFlagsValue(f) {
	    if (typeof f === 'number')
	        return f;
	    if (typeof f !== 'string')
	        throw TypeError("flags must be string or number");
	    var flagsval = flags[f];
	    if (typeof flagsval !== 'number')
	        throw TypeError("Invalid flags string value '" + f + "'");
	    return flagsval;
	}
	var optionsDefaults = {
	    encoding: 'utf8'
	};
	var readFileOptionsDefaults = {
	    flag: 'r'
	};
	var Stats = (function () {
	    function Stats() {
	    }
	    Stats.prototype.isFile = function () {
	        return (this.mode & 32768) == 32768;
	    };
	    Stats.prototype.isDirectory = function () {
	        return (this.mode & 16384) == 16384;
	    };
	    Stats.prototype.isBlockDevice = function () {
	        return (this.mode & 24576) == 24576;
	    };
	    Stats.prototype.isCharacterDevice = function () {
	        return (this.mode & 8192) == 8192;
	    };
	    Stats.prototype.isSymbolicLink = function () {
	        return (this.mode & 40960) == 40960;
	    };
	    Stats.prototype.isFIFO = function () {
	        return (this.mode & 4096) == 4096;
	    };
	    Stats.prototype.isSocket = function () {
	        return (this.mode & 49152) == 49152;
	    };
	    return Stats;
	}());
	exports.Stats = Stats;
	function accessSync(path, mode) {
	    if (mode === void 0) { mode = exports.F_OK; }
	    var vpath = validPathOrThrow(path);
	    var res = libjs.access(vpath, mode);
	    if (res < 0)
	        throwError(res, 'access', vpath);
	}
	exports.accessSync = accessSync;
	function access(path, a, b) {
	    var mode, callback;
	    if (typeof a === 'function') {
	        callback = a;
	        mode = exports.F_OK;
	    }
	    else {
	        mode = a;
	        callback = b;
	        validateCallback(callback);
	    }
	    var vpath = pathOrError(path);
	    if (vpath instanceof TypeError)
	        return callback(vpath);
	    libjs.accessAsync(vpath, mode, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'access', vpath)));
	        else
	            callback(null);
	    });
	}
	exports.access = access;
	function appendFileSync(file, data, options) {
	    if (!options)
	        options = appendFileDefaults;
	    else {
	        var tipof = typeof options;
	        switch (tipof) {
	            case 'object':
	                options = util.extend({}, appendFileDefaults, options);
	                break;
	            case 'string':
	                options = util.extend({ encoding: options }, appendFileDefaults);
	                break;
	            default:
	                throw TypeError(ERRSTR_OPTS(tipof));
	        }
	    }
	    var b;
	    if (buffer_1.Buffer.isBuffer(data))
	        b = data;
	    else
	        b = new buffer_1.Buffer(String(data), options.encoding);
	    var sb = static_buffer_1.StaticBuffer.isStaticBuffer(b) ? b : static_buffer_1.StaticBuffer.from(b);
	    var fd;
	    var is_fd = typeof file === 'number';
	    if (is_fd) {
	        fd = file;
	    }
	    else {
	        var filename;
	        if (buffer_1.Buffer.isBuffer(file))
	            filename = file.toString();
	        else if (typeof file === 'string')
	            filename = file;
	        else
	            throw TypeError(ERRSTR.PATH_STR);
	        var flags = flagsToFlagsValue(options.flag);
	        if (typeof options.mode !== 'number')
	            throw TypeError(ERRSTR.MODE_INT);
	        fd = libjs.open(filename, flags, options.mode);
	        if (fd < 0)
	            throwError(fd, 'appendFile', filename);
	    }
	    var res = libjs.write(fd, sb);
	    if (res < 0)
	        throwError(res, 'appendFile', String(file));
	    if (!is_fd)
	        libjs.close(fd);
	}
	exports.appendFileSync = appendFileSync;
	function appendFile(file, data, options, callback) {
	    var opts;
	    if (typeof options === 'function') {
	        callback = options;
	        opts = appendFileDefaults;
	    }
	    else {
	        var tipof = typeof options;
	        switch (tipof) {
	            case 'object':
	                opts = util.extend({}, appendFileDefaults, options);
	                break;
	            case 'string':
	                opts = util.extend({ encoding: options }, appendFileDefaults);
	                break;
	            default:
	                throw TypeError(ERRSTR_OPTS(tipof));
	        }
	        validateCallback(callback);
	    }
	    var b;
	    if (buffer_1.Buffer.isBuffer(data))
	        b = data;
	    else
	        b = new buffer_1.Buffer(String(data), opts.encoding);
	    var sb = static_buffer_1.StaticBuffer.isStaticBuffer(b) ? b : static_buffer_1.StaticBuffer.from(b);
	    function on_open(fd, is_fd) {
	        var res = libjs.write(fd, sb);
	        if (res < 0)
	            throwError(res, 'appendFile', String(file));
	        if (!is_fd)
	            libjs.closeAsync(fd, noop);
	    }
	    var fd;
	    var is_fd = typeof file === 'number';
	    if (is_fd) {
	        fd = file;
	        on_open(fd, is_fd);
	    }
	    else {
	        var filename;
	        if (buffer_1.Buffer.isBuffer(file))
	            filename = file.toString();
	        else if (typeof file === 'string')
	            filename = file;
	        else
	            throw TypeError(ERRSTR.PATH_STR);
	        var flags = flagsToFlagsValue(opts.flag);
	        if (typeof opts.mode !== 'number')
	            throw TypeError(ERRSTR.MODE_INT);
	        libjs.openAsync(filename, flags, opts.mode, function (fd) {
	            if (fd < 0)
	                return callback(Error(formatError(fd, 'appendFile', filename)));
	            on_open(fd, is_fd);
	        });
	    }
	}
	exports.appendFile = appendFile;
	function chmodSync(path, mode) {
	    var vpath = validPathOrThrow(path);
	    if (typeof mode !== 'number')
	        throw TypeError(ERRSTR.MODE_INT);
	    var result = libjs.chmod(vpath, mode);
	    if (result < 0)
	        throwError(result, 'chmod', vpath);
	}
	exports.chmodSync = chmodSync;
	function chmod(path, mode, callback) {
	    var vpath = validPathOrThrow(path);
	    if (typeof mode !== 'number')
	        throw TypeError(ERRSTR.MODE_INT);
	    libjs.chmodAsync(vpath, mode, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'chmod', vpath)));
	        else
	            callback(null);
	    });
	}
	exports.chmod = chmod;
	function fchmodSync(fd, mode) {
	    validateFd(fd);
	    if (typeof mode !== 'number')
	        throw TypeError(ERRSTR.MODE_INT);
	    var result = libjs.fchmod(fd, mode);
	    if (result < 0)
	        throwError(result, 'chmod');
	}
	exports.fchmodSync = fchmodSync;
	function fchmod(fd, mode, callback) {
	    validateFd(fd);
	    if (typeof mode !== 'number')
	        throw TypeError(ERRSTR.MODE_INT);
	    libjs.fchmodAsync(fd, mode, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'chmod')));
	        else
	            callback(null);
	    });
	}
	exports.fchmod = fchmod;
	function chownSync(path, uid, gid) {
	    var vpath = validPathOrThrow(path);
	    if (typeof uid !== 'number')
	        throw TypeError(ERRSTR.UID);
	    if (typeof gid !== 'number')
	        throw TypeError(ERRSTR.GID);
	    var result = libjs.chown(vpath, uid, gid);
	    if (result < 0)
	        throwError(result, 'chown', vpath);
	}
	exports.chownSync = chownSync;
	function chown(path, uid, gid, callback) {
	    var vpath = validPathOrThrow(path);
	    if (typeof uid !== 'number')
	        throw TypeError(ERRSTR.UID);
	    if (typeof gid !== 'number')
	        throw TypeError(ERRSTR.GID);
	    libjs.chownAsync(vpath, uid, gid, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'chown', vpath)));
	        else
	            callback(null);
	    });
	}
	exports.chown = chown;
	function fchownSync(fd, uid, gid) {
	    validateFd(fd);
	    if (typeof uid !== 'number')
	        throw TypeError(ERRSTR.UID);
	    if (typeof gid !== 'number')
	        throw TypeError(ERRSTR.GID);
	    var result = libjs.fchown(fd, uid, gid);
	    if (result < 0)
	        throwError(result, 'fchown');
	}
	exports.fchownSync = fchownSync;
	function fchown(fd, uid, gid, callback) {
	    validateFd(fd);
	    if (typeof uid !== 'number')
	        throw TypeError(ERRSTR.UID);
	    if (typeof gid !== 'number')
	        throw TypeError(ERRSTR.GID);
	    libjs.fchownAsync(fd, uid, gid, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'fchown')));
	        else
	            callback(null);
	    });
	}
	exports.fchown = fchown;
	function lchownSync(path, uid, gid) {
	    var vpath = validPathOrThrow(path);
	    if (typeof uid !== 'number')
	        throw TypeError(ERRSTR.UID);
	    if (typeof gid !== 'number')
	        throw TypeError(ERRSTR.GID);
	    var result = libjs.lchown(vpath, uid, gid);
	    if (result < 0)
	        throwError(result, 'lchown', vpath);
	}
	exports.lchownSync = lchownSync;
	function lchown(path, uid, gid, callback) {
	    var vpath = validPathOrThrow(path);
	    if (typeof uid !== 'number')
	        throw TypeError(ERRSTR.UID);
	    if (typeof gid !== 'number')
	        throw TypeError(ERRSTR.GID);
	    libjs.lchownAsync(vpath, uid, gid, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'lchown', vpath)));
	        else
	            callback(null);
	    });
	}
	exports.lchown = lchown;
	function closeSync(fd) {
	    if (typeof fd !== 'number')
	        throw TypeError(ERRSTR.FD);
	    var result = libjs.close(fd);
	    if (result < 0)
	        throwError(result, 'close');
	}
	exports.closeSync = closeSync;
	function close(fd, callback) {
	    if (typeof fd !== 'number')
	        throw TypeError(ERRSTR.FD);
	    libjs.closeAsync(fd, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'close')));
	        else
	            callback(null);
	    });
	}
	exports.close = close;
	function existsSync(path) {
	    try {
	        accessSync(path);
	        return true;
	    }
	    catch (e) {
	        return false;
	    }
	}
	exports.existsSync = existsSync;
	function exists(path, callback) {
	    access(path, function (err) { callback(!err); });
	}
	exports.exists = exists;
	function fsyncSync(fd) {
	    if (typeof fd !== 'number')
	        throw TypeError(ERRSTR.FD);
	    var result = libjs.fsync(fd);
	    if (result < 0)
	        throwError(result, 'fsync');
	}
	exports.fsyncSync = fsyncSync;
	function fsync(fd, callback) {
	    if (typeof fd !== 'number')
	        throw TypeError(ERRSTR.FD);
	    libjs.fsyncAsync(fd, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'fsync')));
	        else
	            callback(null);
	    });
	}
	exports.fsync = fsync;
	function fdatasyncSync(fd) {
	    if (typeof fd !== 'number')
	        throw TypeError(ERRSTR.FD);
	    var result = libjs.fdatasync(fd);
	    if (result < 0)
	        throwError(result, 'fdatasync');
	}
	exports.fdatasyncSync = fdatasyncSync;
	function fdatasync(fd, callback) {
	    if (typeof fd !== 'number')
	        throw TypeError(ERRSTR.FD);
	    libjs.fdatasyncAsync(fd, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'fdatasync')));
	        else
	            callback(null);
	    });
	}
	exports.fdatasync = fdatasync;
	function createStatsObject(res) {
	    var stats = new Stats;
	    stats.dev = res.dev;
	    stats.mode = res.mode;
	    stats.nlink = res.nlink;
	    stats.uid = res.uid;
	    stats.gid = res.gid;
	    stats.rdev = res.rdev;
	    stats.blksize = res.blksize;
	    stats.ino = res.ino;
	    stats.size = res.size;
	    stats.blocks = res.blocks;
	    stats.atime = new Date((res.atime * 1000) + Math.floor(res.atime_nsec / 1000000));
	    stats.mtime = new Date((res.mtime * 1000) + Math.floor(res.mtime_nsec / 1000000));
	    stats.ctime = new Date((res.ctime * 1000) + Math.floor(res.ctime_nsec / 1000000));
	    stats.birthtime = stats.ctime;
	    return stats;
	}
	function statSync(path) {
	    var vpath = validPathOrThrow(path);
	    try {
	        var res = libjs.stat(vpath);
	        return createStatsObject(res);
	    }
	    catch (errno) {
	        throwError(errno, 'stat', vpath);
	    }
	}
	exports.statSync = statSync;
	function stat(path, callback) {
	    var vpath = validPathOrThrow(path);
	    libjs.statAsync(vpath, function (err, res) {
	        if (err)
	            callback(Error(formatError(err, 'stat', vpath)));
	        else
	            callback(null, createStatsObject(res));
	    });
	}
	exports.stat = stat;
	function fstatSync(fd) {
	    validateFd(fd);
	    try {
	        var res = libjs.fstat(fd);
	        return createStatsObject(res);
	    }
	    catch (errno) {
	        throwError(errno, 'fstat');
	    }
	}
	exports.fstatSync = fstatSync;
	function fstat(fd, callback) {
	    validateFd(fd);
	    libjs.fstatAsync(fd, function (err, res) {
	        if (err)
	            callback(Error(formatError(err, 'fstat')));
	        else
	            callback(null, createStatsObject(res));
	    });
	}
	exports.fstat = fstat;
	function lstatSync(path) {
	    var vpath = validPathOrThrow(path);
	    try {
	        var res = libjs.lstat(vpath);
	        return createStatsObject(res);
	    }
	    catch (errno) {
	        throwError(errno, 'lstat', vpath);
	    }
	}
	exports.lstatSync = lstatSync;
	function lstat(path, callback) {
	    var vpath = validPathOrThrow(path);
	    libjs.lstatAsync(vpath, function (err, res) {
	        if (err)
	            callback(Error(formatError(err, 'lstat', vpath)));
	        else
	            callback(null, createStatsObject(res));
	    });
	}
	exports.lstat = lstat;
	function truncateSync(path, len) {
	    var vpath = validPathOrThrow(path);
	    if (typeof len !== 'number')
	        throw TypeError(ERRSTR.LEN);
	    var res = libjs.truncate(vpath, len);
	    if (res < 0)
	        throwError(res, 'truncate', vpath);
	}
	exports.truncateSync = truncateSync;
	function truncate(path, len, callback) {
	    var vpath = validPathOrThrow(path);
	    if (typeof len !== 'number')
	        throw TypeError(ERRSTR.LEN);
	    libjs.truncateAsync(vpath, len, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'truncate', vpath)));
	        else
	            callback(null);
	    });
	}
	exports.truncate = truncate;
	function ftruncateSync(fd, len) {
	    validateFd(fd);
	    if (typeof len !== 'number')
	        throw TypeError(ERRSTR.LEN);
	    var res = libjs.ftruncate(fd, len);
	    if (res < 0)
	        throwError(res, 'ftruncate');
	}
	exports.ftruncateSync = ftruncateSync;
	function ftruncate(fd, len, callback) {
	    validateFd(fd);
	    if (typeof len !== 'number')
	        throw TypeError(ERRSTR.LEN);
	    libjs.ftruncateAsync(fd, len, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'ftruncate')));
	        else
	            callback(null);
	    });
	}
	exports.ftruncate = ftruncate;
	function utimesSync(path, atime, mtime) {
	    var vpath = validPathOrThrow(path);
	    if (typeof atime !== 'number')
	        throw TypeError(ERRSTR.ATIME);
	    if (typeof mtime !== 'number')
	        throw TypeError(ERRSTR.MTIME);
	    var vatime = atime;
	    var vmtime = mtime;
	    if (!isFinite(vatime))
	        vatime = Date.now();
	    if (!isFinite(vmtime))
	        vmtime = Date.now();
	    vatime = Math.round(vatime / 1000);
	    vmtime = Math.round(vmtime / 1000);
	    var times = {
	        actime: [libjs.UInt64.lo(vatime), libjs.UInt64.hi(vatime)],
	        modtime: [libjs.UInt64.lo(vmtime), libjs.UInt64.hi(vmtime)]
	    };
	    var res = libjs.utime(vpath, times);
	    if (res < 0)
	        throwError(res, 'utimes', vpath);
	}
	exports.utimesSync = utimesSync;
	function utimes(path, atime, mtime, callback) {
	    var vpath = validPathOrThrow(path);
	    if (typeof atime !== 'number')
	        throw TypeError(ERRSTR.ATIME);
	    if (typeof mtime !== 'number')
	        throw TypeError(ERRSTR.MTIME);
	    var vatime = atime;
	    var vmtime = mtime;
	    if (!isFinite(vatime))
	        vatime = Date.now();
	    if (!isFinite(vmtime))
	        vmtime = Date.now();
	    vatime = Math.round(vatime / 1000);
	    vmtime = Math.round(vmtime / 1000);
	    var times = {
	        actime: [libjs.UInt64.lo(vatime), libjs.UInt64.hi(vatime)],
	        modtime: [libjs.UInt64.lo(vmtime), libjs.UInt64.hi(vmtime)]
	    };
	    libjs.utimeAsync(vpath, times, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'utimes', vpath)));
	        else
	            callback(null);
	    });
	}
	exports.utimes = utimes;
	function linkSync(srcpath, dstpath) {
	    var vsrcpath = validPathOrThrow(srcpath);
	    var vdstpath = validPathOrThrow(dstpath);
	    var res = libjs.link(vsrcpath, vdstpath);
	    if (res < 0)
	        throwError(res, 'link', vsrcpath, vdstpath);
	}
	exports.linkSync = linkSync;
	function link(srcpath, dstpath, callback) {
	    var vsrcpath = validPathOrThrow(srcpath);
	    var vdstpath = validPathOrThrow(dstpath);
	    libjs.linkAsync(vsrcpath, vdstpath, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'link', vsrcpath, vdstpath)));
	        else
	            callback(null);
	    });
	}
	exports.link = link;
	function mkdirSync(path, mode) {
	    if (mode === void 0) { mode = 511; }
	    var vpath = validPathOrThrow(path);
	    if (typeof mode !== 'number')
	        throw TypeError(ERRSTR.MODE_INT);
	    var res = libjs.mkdir(vpath, mode);
	    if (res < 0)
	        throwError(res, 'mkdir', vpath);
	}
	exports.mkdirSync = mkdirSync;
	function mkdir(path, mode, callback) {
	    if (mode === void 0) { mode = 511; }
	    var vpath = validPathOrThrow(path);
	    if (typeof mode === 'function') {
	        callback = mode;
	        mode = 511;
	    }
	    else {
	        if (typeof mode !== 'number')
	            throw TypeError(ERRSTR.MODE_INT);
	        if (typeof callback !== 'function')
	            throw TypeError(ERRSTR.CB);
	    }
	    libjs.mkdirAsync(vpath, mode, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'mkdir', vpath)));
	        else
	            callback(null);
	    });
	}
	exports.mkdir = mkdir;
	function rndStr6() {
	    return (+new Date).toString(36).slice(-6);
	}
	function mkdtempSync(prefix) {
	    if (!prefix || typeof prefix !== 'string')
	        throw new TypeError(ERRSTR.PREFIX);
	    var retries = 10;
	    var fullname;
	    var found_tmp_name = false;
	    for (var i = 0; i < retries; i++) {
	        fullname = prefix + rndStr6();
	        try {
	            accessSync(fullname);
	        }
	        catch (e) {
	            found_tmp_name = true;
	            break;
	        }
	    }
	    if (found_tmp_name) {
	        mkdirSync(fullname);
	        return fullname;
	    }
	    else {
	        throw Error("Could not find a new name, mkdtemp");
	    }
	}
	exports.mkdtempSync = mkdtempSync;
	function mkdtemp(prefix, callback) {
	    if (!prefix || typeof prefix !== 'string')
	        throw new TypeError(ERRSTR.PREFIX);
	    var retries = 10;
	    var fullname;
	    function mk_dir() {
	        mkdir(fullname, function (err) {
	            if (err)
	                callback(err);
	            else
	                callback(null, fullname);
	        });
	    }
	    function name_loop() {
	        if (retries < 1) {
	            callback(Error('Could not find a new name, mkdtemp'));
	            return;
	        }
	        retries--;
	        fullname = prefix + rndStr6();
	        access(fullname, function (err) {
	            if (err)
	                mk_dir();
	            else
	                name_loop();
	        });
	    }
	    name_loop();
	}
	exports.mkdtemp = mkdtemp;
	function openSync(path, flags, mode) {
	    if (mode === void 0) { mode = 438; }
	    var vpath = validPathOrThrow(path);
	    var flagsval = flagsToFlagsValue(flags);
	    if (typeof mode !== 'number')
	        throw TypeError(ERRSTR.MODE_INT);
	    var res = libjs.open(vpath, flagsval, mode);
	    if (res < 0)
	        throwError(res, 'open', vpath);
	    return res;
	}
	exports.openSync = openSync;
	function open(path, flags, mode, callback) {
	    if (typeof mode === 'function') {
	        callback = mode;
	        mode = 438;
	    }
	    var vpath = validPathOrThrow(path);
	    var flagsval = flagsToFlagsValue(flags);
	    if (typeof mode !== 'number')
	        throw TypeError(ERRSTR.MODE_INT);
	    libjs.openAsync(vpath, flagsval, mode, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'open', vpath)));
	        return callback(null, res);
	    });
	}
	exports.open = open;
	function readSync(fd, buffer, offset, length, position) {
	    validateFd(fd);
	    if (!(buffer instanceof buffer_1.Buffer))
	        throw TypeError(ERRSTR.BUFFER);
	    if (typeof offset !== 'number')
	        throw TypeError(ERRSTR.OFFSET);
	    if (typeof length !== 'number')
	        throw TypeError(ERRSTR.LENGTH);
	    if (position) {
	        if (typeof position !== 'number')
	            throw TypeError(ERRSTR.POSITION);
	        var seekres = libjs.lseek(fd, position, 0);
	        if (seekres < 0)
	            throwError(seekres, 'read');
	    }
	    var buf = buffer.slice(offset, offset + length);
	    var res = libjs.read(fd, buf);
	    if (res < 0)
	        throwError(res, 'read');
	    return res;
	}
	exports.readSync = readSync;
	function read(fd, buffer, offset, length, position, callback) {
	    validateFd(fd);
	    if (!(buffer instanceof buffer_1.Buffer))
	        throw TypeError(ERRSTR.BUFFER);
	    if (typeof offset !== 'number')
	        throw TypeError(ERRSTR.OFFSET);
	    if (typeof length !== 'number')
	        throw TypeError(ERRSTR.LENGTH);
	    function do_read() {
	        var buf = buffer.slice(offset, offset + length);
	        libjs.readAsync(fd, buf, function (res) {
	            if (res < 0)
	                callback(Error(formatError(res, 'read')));
	            else
	                callback(null, res, buffer);
	        });
	    }
	    if (position) {
	        if (typeof position !== 'number')
	            throw TypeError(ERRSTR.POSITION);
	        libjs.lseekAsync(fd, position, 0, function (seekres) {
	            if (seekres < 0)
	                callback(Error(formatError(seekres, 'read')));
	            else
	                do_read();
	        });
	    }
	    else {
	        do_read();
	    }
	}
	exports.read = read;
	function optsEncoding(options) {
	    if (!options)
	        return optionsDefaults.encoding;
	    else {
	        var typeofopt = typeof options;
	        switch (typeofopt) {
	            case 'string': return options;
	            case 'object':
	                return options.encoding
	                    ? options.encoding : optionsDefaults.encoding;
	            default: throw TypeError(ERRSTR_OPTS(typeofopt));
	        }
	    }
	}
	function readdirSync(path, options) {
	    var vpath = validPathOrThrow(path);
	    var encoding = optsEncoding(options);
	    return libjs.readdirList(vpath, encoding);
	}
	exports.readdirSync = readdirSync;
	function readdir(path, options, callback) {
	    var vpath = validPathOrThrow(path);
	    var encoding;
	    if (typeof options === 'function') {
	        callback = options;
	        encoding = optionsDefaults.encoding;
	    }
	    else {
	        encoding = optsEncoding(options);
	        validateCallback(callback);
	    }
	    options = util.extend(options, optionsDefaults);
	    libjs.readdirListAsync(vpath, encoding, function (errno, list) {
	        if (errno < 0)
	            callback(Error(formatError(errno, 'readdir', vpath)));
	        else
	            callback(null, list);
	    });
	}
	exports.readdir = readdir;
	var getReadFileOptions = optionGenerator(readFileOptionsDefaults);
	function readFileSync(file, options) {
	    var opts = getReadFileOptions(options);
	    var fd;
	    var is_fd = typeof file === 'number';
	    if (is_fd)
	        fd = file;
	    else {
	        var vfile = validPathOrThrow(file);
	        var flag = flagsToFlagsValue(opts.flag);
	        fd = libjs.open(vfile, flag, 438);
	        if (fd < 0)
	            throwError(fd, 'readFile', vfile);
	    }
	    var list = [];
	    do {
	        var buf = new buffer_1.Buffer(CHUNK);
	        var res = libjs.read(fd, buf);
	        if (res < 0)
	            throwError(res, 'readFile');
	        if (res < CHUNK)
	            buf = buf.slice(0, res);
	        list.push(buf);
	    } while (res > 0);
	    if (!is_fd)
	        libjs.close(fd);
	    var buffer = buffer_1.Buffer.concat(list);
	    if (opts.encoding)
	        return buffer.toString(opts.encoding);
	    else
	        return buffer;
	}
	exports.readFileSync = readFileSync;
	var getReadFileOptionsAndCallback = optionAndCallbackGenerator(getReadFileOptions);
	function readFile(file, options, cb) {
	    if (options === void 0) { options = {}; }
	    var _a = getReadFileOptionsAndCallback(options, cb), opts = _a[0], callback = _a[1];
	    var is_fd = typeof file === 'number';
	    function on_open(fd) {
	        var list = [];
	        function done() {
	            var buffer = buffer_1.Buffer.concat(list);
	            if (opts.encoding)
	                callback(null, buffer.toString(opts.encoding));
	            else
	                callback(null, buffer);
	            if (!is_fd)
	                libjs.closeAsync(fd, noop);
	        }
	        function loop() {
	            var buf = new static_buffer_1.StaticBuffer(CHUNK);
	            libjs.readAsync(fd, buf, function (res) {
	                if (res < 0)
	                    return callback(Error(formatError(res, 'readFile')));
	                if (res < CHUNK)
	                    buf = buf.slice(0, res);
	                list.push(buf);
	                if (res > 0)
	                    loop();
	                else
	                    done();
	            });
	        }
	        loop();
	    }
	    if (is_fd)
	        on_open(file);
	    else {
	        var vfile = validPathOrThrow(file);
	        var flag = flagsToFlagsValue(opts.flag);
	        libjs.openAsync(vfile, flag, 438, function (fd) {
	            if (fd < 0)
	                callback(Error(formatError(fd, 'readFile', vfile)));
	            else
	                on_open(fd);
	        });
	    }
	}
	exports.readFile = readFile;
	function readlinkSync(path, options) {
	    if (options === void 0) { options = null; }
	    var vpath = validPathOrThrow(path);
	    var encBuffer = false;
	    var filename;
	    if (typeof path === 'string') {
	        filename = path;
	    }
	    else if (buffer_1.Buffer.isBuffer(path)) {
	        var encoding = optsEncoding(options);
	        if (encoding === 'buffer') {
	            filename = path.toString();
	            encBuffer = true;
	        }
	        else {
	            filename = path.toString(encoding);
	        }
	    }
	    else
	        throw TypeError(ERRSTR.PATH_STR);
	    try {
	        var res = libjs.readlink(filename);
	    }
	    catch (errno) {
	        throwError(errno, 'readlink', vpath);
	    }
	    return !encBuffer ? res : new buffer_1.Buffer(res);
	}
	exports.readlinkSync = readlinkSync;
	function renameSync(oldPath, newPath) {
	    var voldPath = validPathOrThrow(oldPath);
	    var vnewPath = validPathOrThrow(newPath);
	    var res = libjs.rename(voldPath, vnewPath);
	    if (res < 0)
	        throwError(res, 'rename', voldPath, vnewPath);
	}
	exports.renameSync = renameSync;
	function rename(oldPath, newPath, callback) {
	    var voldPath = validPathOrThrow(oldPath);
	    var vnewPath = validPathOrThrow(newPath);
	    libjs.renameAsync(voldPath, vnewPath, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'rename', voldPath, vnewPath)));
	        else
	            callback(null);
	    });
	}
	exports.rename = rename;
	function rmdirSync(path) {
	    var vpath = validPathOrThrow(path);
	    var res = libjs.rmdir(vpath);
	    if (res < 0)
	        throwError(res, 'rmdir', vpath);
	}
	exports.rmdirSync = rmdirSync;
	function rmdir(path, callback) {
	    var vpath = validPathOrThrow(path);
	    libjs.rmdirAsync(vpath, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'rmdir', vpath)));
	        else
	            callback(null);
	    });
	}
	exports.rmdir = rmdir;
	function symlinkSync(target, path) {
	    var vtarget = validPathOrThrow(target);
	    var vpath = validPathOrThrow(path);
	    var res = libjs.symlink(vtarget, vpath);
	    if (res < 0)
	        throwError(res, 'symlink', vtarget, vpath);
	}
	exports.symlinkSync = symlinkSync;
	function symlink(target, path, type, callback) {
	    var vtarget = validPathOrThrow(target);
	    var vpath = validPathOrThrow(path);
	    if (typeof type === 'function') {
	        callback = type;
	    }
	    validateCallback(callback);
	    libjs.symlinkAsync(vtarget, vpath, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'symlink', vtarget, vpath)));
	        else
	            callback(null);
	    });
	}
	exports.symlink = symlink;
	function unlinkSync(path) {
	    var vpath = validPathOrThrow(path);
	    var res = libjs.unlink(vpath);
	    if (res < 0)
	        throwError(res, 'unlink', vpath);
	}
	exports.unlinkSync = unlinkSync;
	function unlink(path, callback) {
	    var vpath = validPathOrThrow(path);
	    libjs.unlinkAsync(vpath, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'unlink', vpath)));
	        else
	            callback(null);
	    });
	}
	exports.unlink = unlink;
	function watchFile(filename, a, b) {
	    if (a === void 0) { a = {}; }
	    var vfilename = validPathOrThrow(filename);
	    vfilename = pathModule.resolve(vfilename);
	    var opts;
	    var listener;
	    if (typeof a !== 'object') {
	        opts = watchFileOptionDefaults;
	        listener = a;
	    }
	    else {
	        opts = util.extend(a, watchFileOptionDefaults);
	        listener = b;
	    }
	    if (typeof listener !== 'function')
	        throw new Error('"watchFile()" requires a listener function');
	    var watcher = StatWatcher.map[vfilename];
	    if (!watcher) {
	        watcher = new StatWatcher;
	        watcher.start(vfilename, opts.persistent, opts.interval);
	        StatWatcher.map[vfilename] = watcher;
	    }
	    watcher.on('change', listener);
	    return watcher;
	}
	exports.watchFile = watchFile;
	function writeSync(fd, data, a, b, c) {
	    validateFd(fd);
	    var buf;
	    var position;
	    if (typeof b === 'number') {
	        if (!(data instanceof buffer_1.Buffer))
	            throw TypeError('buffer must be instance of Buffer.');
	        var offset = a;
	        if (typeof offset !== 'number')
	            throw TypeError('offset must be an integer');
	        var length = b;
	        buf = data.slice(offset, offset + length);
	        position = c;
	    }
	    else {
	        var encoding = 'utf8';
	        if (b) {
	            if (typeof b !== 'string')
	                throw TypeError('encoding must be a string');
	            encoding = b;
	        }
	        if (data instanceof buffer_1.Buffer)
	            buf = data;
	        else if (typeof data === 'string') {
	            buf = new buffer_1.Buffer(data, encoding);
	        }
	        else
	            throw TypeError('data must be a Buffer or a string.');
	        position = a;
	    }
	    if (typeof position === 'number') {
	        var sres = libjs.lseek(fd, position, 0);
	        if (sres < 0)
	            throwError(sres, 'write:lseek');
	    }
	    var sb = static_buffer_1.StaticBuffer.isStaticBuffer(buf)
	        ? buf : static_buffer_1.StaticBuffer.from(buf);
	    var res = libjs.write(fd, sb);
	    if (res < 0)
	        throwError(res, 'write');
	}
	exports.writeSync = writeSync;
	var getWriteFileOptions = optionGenerator(writeFileDefaults);
	function writeFileSync(file, data, options) {
	    var opts = getWriteFileOptions(options);
	    var fd;
	    var vpath;
	    var is_fd = typeof file === 'number';
	    if (is_fd) {
	        fd = file;
	    }
	    else {
	        vpath = validPathOrThrow(file);
	        var flags = flagsToFlagsValue(opts.flag);
	        fd = libjs.open(vpath, flags, opts.mode);
	        if (fd < 0)
	            throwError(fd, 'writeFile', vpath);
	    }
	    var sb = static_buffer_1.StaticBuffer.isStaticBuffer(data) ? data : static_buffer_1.StaticBuffer.from(data);
	    var res = libjs.write(fd, sb);
	    if (res < 0)
	        throwError(res, 'writeFile', is_fd ? String(fd) : vpath);
	    if (!is_fd)
	        libjs.close(fd);
	}
	exports.writeFileSync = writeFileSync;
	var getWriteFileOptionsAndCallback = optionAndCallbackGenerator(getWriteFileOptions);
	function writeFile(file, data, options, cb) {
	    var _a = getWriteFileOptionsAndCallback(options, cb), opts = _a[0], callback = _a[1];
	    var is_fd = typeof file === 'number';
	    function on_write(fd) {
	        var sb = isSB(data) ? data : static_buffer_1.StaticBuffer.from(data);
	        libjs.writeAsync(fd, sb, function (res) {
	            if (res < 0)
	                callback(Error(formatError(res, 'writeFile', is_fd ? String(fd) : vpath)));
	            else
	                callback(null, sb);
	            setTimeout(function () {
	                sb.print();
	            }, 100);
	            if (!is_fd)
	                libjs.closeAsync(fd, noop);
	        });
	    }
	    if (is_fd)
	        on_write(file);
	    else {
	        var vpath = validPathOrThrow(file);
	        var flags = flagsToFlagsValue(opts.flag);
	        libjs.openAsync(vpath, flags, opts.mode, function (fd) {
	            if (fd < 0)
	                callback(Error(formatError(fd, 'writeFile', vpath)));
	            else
	                on_write(fd);
	        });
	    }
	}
	exports.writeFile = writeFile;
	var FSWatcher = (function (_super) {
	    __extends(FSWatcher, _super);
	    function FSWatcher() {
	        _super.apply(this, arguments);
	        this.inotify = new inotify_1.Inotify;
	    }
	    FSWatcher.prototype.start = function (filename, persistent, recursive, encoding) {
	        var _this = this;
	        this.inotify.encoding = encoding;
	        this.inotify.onerror = noop;
	        this.inotify.onevent = function (event) {
	            var is_rename = (event.mask & 192) || (event.mask & 256);
	            if (is_rename) {
	                _this.emit('change', 'rename', event.name);
	            }
	            else {
	                _this.emit('change', 'change', event.name);
	            }
	        };
	        this.inotify.start();
	        this.inotify.addPath(filename);
	    };
	    FSWatcher.prototype.close = function () {
	        this.inotify.stop();
	        this.inotify = null;
	    };
	    return FSWatcher;
	}(events_1.EventEmitter));
	exports.FSWatcher = FSWatcher;
	var watchOptionsDefaults = {
	    encoding: 'utf8',
	    persistent: true,
	    recursive: false
	};
	var StatWatcher = (function (_super) {
	    __extends(StatWatcher, _super);
	    function StatWatcher() {
	        _super.apply(this, arguments);
	        this.last = null;
	    }
	    StatWatcher.prototype.loop = function () {
	        var _this = this;
	        stat(this.filename, function (err, stats) {
	            if (err)
	                return _this.emit('error', err);
	            if (_this.last instanceof Stats) {
	                if (_this.last.atime.getTime() != stats.atime.getTime()) {
	                    _this.emit('change', stats, _this.last);
	                }
	            }
	            _this.last = stats;
	        });
	    };
	    StatWatcher.prototype.start = function (filename, persistent, interval) {
	        var _this = this;
	        this.filename = filename;
	        stat(filename, function (err, stats) {
	            if (err)
	                return _this.emit('error', err);
	            _this.last = stats;
	            _this.interval = setInterval(_this.loop.bind(_this), interval);
	        });
	    };
	    StatWatcher.prototype.stop = function () {
	        clearInterval(this.interval);
	        this.last = null;
	    };
	    StatWatcher.map = {};
	    return StatWatcher;
	}(events_1.EventEmitter));
	exports.StatWatcher = StatWatcher;
	var watchFileOptionDefaults = {
	    persistent: true,
	    interval: 5007
	};
	function unwatchFile(filename, listener) {
	    var vfilename = validPathOrThrow(filename);
	    vfilename = pathModule.resolve(vfilename);
	    var watcher = StatWatcher.map[vfilename];
	    if (!watcher)
	        return;
	    if (typeof listener === 'function')
	        watcher.removeListener('change', listener);
	    else
	        watcher.removeAllListeners('change');
	    if (watcher.listenerCount('change') === 0) {
	        watcher.stop();
	        delete StatWatcher.map[vfilename];
	    }
	}
	exports.unwatchFile = unwatchFile;
	function createReadStream(path, options) {
	    return new ReadStream(path, options);
	}
	exports.createReadStream = createReadStream;
	function createWriteStream(path, options) {
	    return new WriteStream(path, options);
	}
	exports.createWriteStream = createWriteStream;
	var kMinPoolSpace = 128;
	var pool;
	function allocNewPool(poolSize) {
	    pool = new buffer_1.Buffer(poolSize);
	    pool.used = 0;
	}
	function ReadStream(path, options) {
	    if (!(this instanceof ReadStream))
	        return new ReadStream(path, options);
	    options = util._extend({
	        highWaterMark: 64 * 1024
	    }, options || {});
	    stream_1.Readable.call(this, options);
	    this.path = path;
	    this.fd = options.hasOwnProperty('fd') ? options.fd : null;
	    this.flags = options.hasOwnProperty('flags') ? options.flags : 'r';
	    this.mode = options.hasOwnProperty('mode') ? options.mode : 438;
	    this.start = options.hasOwnProperty('start') ? options.start : undefined;
	    this.end = options.hasOwnProperty('end') ? options.end : undefined;
	    this.autoClose = options.hasOwnProperty('autoClose') ?
	        options.autoClose : true;
	    this.pos = undefined;
	    if (!util.isUndefined(this.start)) {
	        if (!util.isNumber(this.start)) {
	            throw TypeError('start must be a Number');
	        }
	        if (util.isUndefined(this.end)) {
	            this.end = Infinity;
	        }
	        else if (!util.isNumber(this.end)) {
	            throw TypeError('end must be a Number');
	        }
	        if (this.start > this.end) {
	            throw new Error('start must be <= end');
	        }
	        this.pos = this.start;
	    }
	    if (!util.isNumber(this.fd))
	        this.open();
	    this.on('end', function () {
	        if (this.autoClose) {
	            this.destroy();
	        }
	    });
	}
	exports.ReadStream = ReadStream;
	util.inherits(ReadStream, stream_1.Readable);
	ReadStream.prototype.open = function () {
	    var self = this;
	    open(this.path, this.flags, this.mode, function (er, fd) {
	        if (er) {
	            if (self.autoClose) {
	                self.destroy();
	            }
	            self.emit('error', er);
	            return;
	        }
	        self.fd = fd;
	        self.emit('open', fd);
	        self.read();
	    });
	};
	ReadStream.prototype._read = function (n) {
	    if (!util.isNumber(this.fd))
	        return this.once('open', function () {
	            this._read(n);
	        });
	    if (this.destroyed)
	        return;
	    if (!pool || pool.length - pool.used < kMinPoolSpace) {
	        pool = null;
	        allocNewPool(this._readableState.highWaterMark);
	    }
	    var thisPool = pool;
	    var toRead = Math.min(pool.length - pool.used, n);
	    var start = pool.used;
	    if (!util.isUndefined(this.pos))
	        toRead = Math.min(this.end - this.pos + 1, toRead);
	    if (toRead <= 0)
	        return this.push(null);
	    var self = this;
	    console.log('reading...', n);
	    read(this.fd, pool, pool.used, toRead, this.pos, onread);
	    if (!util.isUndefined(this.pos))
	        this.pos += toRead;
	    pool.used += toRead;
	    function onread(er, bytesRead) {
	        if (er) {
	            if (self.autoClose) {
	                self.destroy();
	            }
	            self.emit('error', er);
	        }
	        else {
	            var b = null;
	            if (bytesRead > 0)
	                b = thisPool.slice(start, start + bytesRead);
	            self.push(b);
	        }
	    }
	};
	ReadStream.prototype.destroy = function () {
	    if (this.destroyed)
	        return;
	    this.destroyed = true;
	    if (util.isNumber(this.fd))
	        this.close();
	};
	ReadStream.prototype.close = function (cb) {
	    var self = this;
	    if (cb)
	        this.once('close', cb);
	    if (this.closed || !util.isNumber(this.fd)) {
	        if (!util.isNumber(this.fd)) {
	            this.once('open', _close);
	            return;
	        }
	        return process.nextTick(this.emit.bind(this, 'close'));
	    }
	    this.closed = true;
	    _close();
	    function _close(fd) {
	        close(fd || self.fd, function (er) {
	            if (er)
	                self.emit('error', er);
	            else
	                self.emit('close');
	        });
	        self.fd = null;
	    }
	};
	function WriteStream(path, options) {
	    if (!(this instanceof WriteStream))
	        return new WriteStream(path, options);
	    options = options || {};
	    stream_1.Writable.call(this, options);
	    this.path = path;
	    this.fd = null;
	    this.fd = options.hasOwnProperty('fd') ? options.fd : null;
	    this.flags = options.hasOwnProperty('flags') ? options.flags : 'w';
	    this.mode = options.hasOwnProperty('mode') ? options.mode : 438;
	    this.start = options.hasOwnProperty('start') ? options.start : undefined;
	    this.pos = undefined;
	    this.bytesWritten = 0;
	    if (!util.isUndefined(this.start)) {
	        if (!util.isNumber(this.start)) {
	            throw TypeError('start must be a Number');
	        }
	        if (this.start < 0) {
	            throw new Error('start must be >= zero');
	        }
	        this.pos = this.start;
	    }
	    if (!util.isNumber(this.fd))
	        this.open();
	    this.once('finish', this.close);
	}
	exports.WriteStream = WriteStream;
	util.inherits(WriteStream, stream_1.Writable);
	WriteStream.prototype.open = function () {
	    open(this.path, this.flags, this.mode, function (er, fd) {
	        if (er) {
	            this.destroy();
	            this.emit('error', er);
	            return;
	        }
	        this.fd = fd;
	        this.emit('open', fd);
	    }.bind(this));
	};
	WriteStream.prototype._write = function (data, encoding, cb) {
	    if (!util.isBuffer(data))
	        return this.emit('error', new Error('Invalid data'));
	    if (!util.isNumber(this.fd))
	        return this.once('open', function () {
	            this._write(data, encoding, cb);
	        });
	    var self = this;
	    write(this.fd, data, 0, data.length, this.pos, function (er, bytes) {
	        if (er) {
	            self.destroy();
	            return cb(er);
	        }
	        self.bytesWritten += bytes;
	        cb();
	    });
	    if (!util.isUndefined(this.pos))
	        this.pos += data.length;
	};
	WriteStream.prototype.destroy = ReadStream.prototype.destroy;
	WriteStream.prototype.close = ReadStream.prototype.close;
	WriteStream.prototype.destroySoon = WriteStream.prototype.end;
	function SyncWriteStream(fd, options) {
	    stream_1.Stream.call(this);
	    options = options || {};
	    validateFd(fd);
	    this.fd = fd;
	    this.writable = true;
	    this.readable = false;
	    this.autoClose = options.autoClose === undefined ? true : options.autoClose;
	}
	exports.SyncWriteStream = SyncWriteStream;
	util.inherits(SyncWriteStream, stream_1.Stream);
	SyncWriteStream.prototype.write = function (data, arg1, arg2) {
	    var encoding, cb;
	    if (arg1) {
	        if (typeof arg1 === 'string') {
	            encoding = arg1;
	            cb = arg2;
	        }
	        else if (typeof arg1 === 'function') {
	            cb = arg1;
	        }
	        else {
	            throw Error('Bad arguments');
	        }
	    }
	    assertEncoding(encoding);
	    if (typeof data === 'string') {
	        data = buffer_1.Buffer.from(data, encoding);
	    }
	    writeSync(this.fd, data, 0, data.length);
	    if (cb)
	        process.nextTick(cb);
	    return true;
	};
	SyncWriteStream.prototype.end = function (data, arg1, arg2) {
	    if (data) {
	        this.write(data, arg1, arg2);
	    }
	    this.destroy();
	};
	SyncWriteStream.prototype.destroy = function () {
	    if (this.autoClose)
	        closeSync(this.fd);
	    this.fd = null;
	    this.emit('close');
	    return true;
	};
	SyncWriteStream.prototype.destroySoon = SyncWriteStream.prototype.destroy;


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var libjs = __webpack_require__(12);
	var static_buffer_1 = __webpack_require__(13);
	function noop() { }
	var Inotify = (function () {
	    function Inotify(poll_interval, buffer_size) {
	        if (poll_interval === void 0) { poll_interval = 200; }
	        if (buffer_size === void 0) { buffer_size = 4096; }
	        this.onevent = noop;
	        this.onerror = noop;
	        this.wdCount = 0;
	        this.wd = {};
	        this.wdr = {};
	        this.pollBound = this.poll.bind(this);
	        this.encoding = 'utf8';
	        this.pollInterval = poll_interval;
	        this.bufSize = buffer_size;
	    }
	    Inotify.prototype.poll = function () {
	        var res = libjs.read(this.fd, this.buf);
	        if (res < 0) {
	            if (-res == 11) {
	            }
	            else {
	                this.onerror(Error("Could not poll for events: errno = " + res), res);
	            }
	            this.nextTick();
	            return;
	        }
	        if (res > 0) {
	            var offset = 0;
	            var struct = libjs.inotify_event;
	            while (offset < res) {
	                var event = struct.unpack(this.buf, offset);
	                var name_off = offset + struct.size;
	                var name = this.buf.slice(name_off, name_off + event.len).toString(this.encoding);
	                name = name.substr(0, name.indexOf("\0"));
	                event.name = name;
	                event.path = this.wdr[event.wd];
	                this.onevent(event);
	                offset += struct.size + event.len;
	            }
	        }
	        this.nextTick();
	    };
	    Inotify.prototype.nextTick = function () {
	        if (this.hasStarted() && this.wdCount)
	            this.timeout = setTimeout(this.pollBound, this.pollInterval);
	    };
	    Inotify.prototype.stopPolling = function () {
	        clearTimeout(this.timeout);
	        this.timeout = null;
	    };
	    Inotify.prototype.hasStarted = function () {
	        return !!this.fd;
	    };
	    Inotify.prototype.start = function () {
	        this.fd = libjs.inotify_init1(2048);
	        if (this.fd < 0)
	            throw Error("Could not init: errno = " + this.fd);
	        this.buf = new static_buffer_1.StaticBuffer(this.bufSize);
	        return this.fd;
	    };
	    Inotify.prototype.stop = function () {
	        this.stopPolling();
	        for (var pathname in this.wd)
	            this.removePath(pathname);
	        var fd = this.fd;
	        this.fd = 0;
	        return libjs.close(fd);
	    };
	    Inotify.prototype.addPath = function (pathname, events) {
	        if (events === void 0) { events = 4095; }
	        if (!this.fd)
	            throw Error("inotify file descriptor not initialized, call .init() first.");
	        var wd = libjs.inotify_add_watch(this.fd, pathname, events);
	        if (wd < 0)
	            throw Error("Could not add watch: errno = " + wd);
	        this.wdCount++;
	        this.wd[pathname] = wd;
	        this.wdr[wd] = pathname;
	        if (this.wdCount == 1)
	            this.nextTick();
	        return wd;
	    };
	    Inotify.prototype.removePath = function (pathname) {
	        var wd = this.wd[pathname];
	        if (!wd)
	            return -1;
	        delete this.wd[pathname];
	        delete this.wdr[wd];
	        this.wdCount--;
	        return libjs.inotify_rm_watch(this.fd, wd);
	    };
	    return Inotify;
	}());
	exports.Inotify = Inotify;


/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const inspect = __webpack_require__(6).inspect;

	function assertPath(path) {
	    if (typeof path !== 'string') {
	        throw new TypeError('Path must be a string. Received ' + inspect(path));
	    }
	}

	// Resolves . and .. elements in a path with directory names
	function normalizeStringWin32(path, allowAboveRoot) {
	    var res = '';
	    var lastSlash = -1;
	    var dots = 0;
	    var code;
	    for (var i = 0; i <= path.length; ++i) {
	        if (i < path.length)
	            code = path.charCodeAt(i);
	        else if (code === 47/*/*/ || code === 92/*\*/)
	            break;
	        else
	            code = 47/*/*/;
	        if (code === 47/*/*/ || code === 92/*\*/) {
	            if (lastSlash === i - 1 || dots === 1) {
	                // NOOP
	            } else if (lastSlash !== i - 1 && dots === 2) {
	                if (res.length < 2 ||
	                    res.charCodeAt(res.length - 1) !== 46/*.*/ ||
	                    res.charCodeAt(res.length - 2) !== 46/*.*/) {
	                    if (res.length > 2) {
	                        const start = res.length - 1;
	                        var j = start;
	                        for (; j >= 0; --j) {
	                            if (res.charCodeAt(j) === 92/*\*/)
	                                break;
	                        }
	                        if (j !== start) {
	                            if (j === -1)
	                                res = '';
	                            else
	                                res = res.slice(0, j);
	                            lastSlash = i;
	                            dots = 0;
	                            continue;
	                        }
	                    } else if (res.length === 2 || res.length === 1) {
	                        res = '';
	                        lastSlash = i;
	                        dots = 0;
	                        continue;
	                    }
	                }
	                if (allowAboveRoot) {
	                    if (res.length > 0)
	                        res += '\\..';
	                    else
	                        res = '..';
	                }
	            } else {
	                if (res.length > 0)
	                    res += '\\' + path.slice(lastSlash + 1, i);
	                else
	                    res = path.slice(lastSlash + 1, i);
	            }
	            lastSlash = i;
	            dots = 0;
	        } else if (code === 46/*.*/ && dots !== -1) {
	            ++dots;
	        } else {
	            dots = -1;
	        }
	    }
	    return res;
	}

	// Resolves . and .. elements in a path with directory names
	function normalizeStringPosix(path, allowAboveRoot) {
	    var res = '';
	    var lastSlash = -1;
	    var dots = 0;
	    var code;
	    for (var i = 0; i <= path.length; ++i) {
	        if (i < path.length)
	            code = path.charCodeAt(i);
	        else if (code === 47/*/*/)
	            break;
	        else
	            code = 47/*/*/;
	        if (code === 47/*/*/) {
	            if (lastSlash === i - 1 || dots === 1) {
	                // NOOP
	            } else if (lastSlash !== i - 1 && dots === 2) {
	                if (res.length < 2 ||
	                    res.charCodeAt(res.length - 1) !== 46/*.*/ ||
	                    res.charCodeAt(res.length - 2) !== 46/*.*/) {
	                    if (res.length > 2) {
	                        const start = res.length - 1;
	                        var j = start;
	                        for (; j >= 0; --j) {
	                            if (res.charCodeAt(j) === 47/*/*/)
	                                break;
	                        }
	                        if (j !== start) {
	                            if (j === -1)
	                                res = '';
	                            else
	                                res = res.slice(0, j);
	                            lastSlash = i;
	                            dots = 0;
	                            continue;
	                        }
	                    } else if (res.length === 2 || res.length === 1) {
	                        res = '';
	                        lastSlash = i;
	                        dots = 0;
	                        continue;
	                    }
	                }
	                if (allowAboveRoot) {
	                    if (res.length > 0)
	                        res += '/..';
	                    else
	                        res = '..';
	                }
	            } else {
	                if (res.length > 0)
	                    res += '/' + path.slice(lastSlash + 1, i);
	                else
	                    res = path.slice(lastSlash + 1, i);
	            }
	            lastSlash = i;
	            dots = 0;
	        } else if (code === 46/*.*/ && dots !== -1) {
	            ++dots;
	        } else {
	            dots = -1;
	        }
	    }
	    return res;
	}

	function _format(sep, pathObject) {
	    const dir = pathObject.dir || pathObject.root;
	    const base = pathObject.base ||
	        ((pathObject.name || '') + (pathObject.ext || ''));
	    if (!dir) {
	        return base;
	    }
	    if (dir === pathObject.root) {
	        return dir + base;
	    }
	    return dir + sep + base;
	}

	const win32 = {
	    // path.resolve([from ...], to)
	    resolve: function resolve() {
	        var resolvedDevice = '';
	        var resolvedTail = '';
	        var resolvedAbsolute = false;

	        for (var i = arguments.length - 1; i >= -1; i--) {
	            var path;
	            if (i >= 0) {
	                path = arguments[i];
	            } else if (!resolvedDevice) {
	                path = process.cwd();
	            } else {
	                // Windows has the concept of drive-specific current working
	                // directories. If we've resolved a drive letter but not yet an
	                // absolute path, get cwd for that drive. We're sure the device is not
	                // a UNC path at this points, because UNC paths are always absolute.
	                path = process.env['=' + resolvedDevice];
	                // Verify that a drive-local cwd was found and that it actually points
	                // to our drive. If not, default to the drive's root.
	                if (path === undefined ||
	                    path.slice(0, 3).toLowerCase() !==
	                    resolvedDevice.toLowerCase() + '\\') {
	                    path = resolvedDevice + '\\';
	                }
	            }

	            assertPath(path);

	            // Skip empty entries
	            if (path.length === 0) {
	                continue;
	            }

	            var len = path.length;
	            var rootEnd = 0;
	            var code = path.charCodeAt(0);
	            var device = '';
	            var isAbsolute = false;

	            // Try to match a root
	            if (len > 1) {
	                if (code === 47/*/*/ || code === 92/*\*/) {
	                    // Possible UNC root

	                    // If we started with a separator, we know we at least have an
	                    // absolute path of some kind (UNC or otherwise)
	                    isAbsolute = true;

	                    code = path.charCodeAt(1);
	                    if (code === 47/*/*/ || code === 92/*\*/) {
	                        // Matched double path separator at beginning
	                        var j = 2;
	                        var last = j;
	                        // Match 1 or more non-path separators
	                        for (; j < len; ++j) {
	                            code = path.charCodeAt(j);
	                            if (code === 47/*/*/ || code === 92/*\*/)
	                                break;
	                        }
	                        if (j < len && j !== last) {
	                            const firstPart = path.slice(last, j);
	                            // Matched!
	                            last = j;
	                            // Match 1 or more path separators
	                            for (; j < len; ++j) {
	                                code = path.charCodeAt(j);
	                                if (code !== 47/*/*/ && code !== 92/*\*/)
	                                    break;
	                            }
	                            if (j < len && j !== last) {
	                                // Matched!
	                                last = j;
	                                // Match 1 or more non-path separators
	                                for (; j < len; ++j) {
	                                    code = path.charCodeAt(j);
	                                    if (code === 47/*/*/ || code === 92/*\*/)
	                                        break;
	                                }
	                                if (j === len) {
	                                    // We matched a UNC root only

	                                    device = '\\\\' + firstPart + '\\' + path.slice(last);
	                                    rootEnd = j;
	                                } else if (j !== last) {
	                                    // We matched a UNC root with leftovers

	                                    device = '\\\\' + firstPart + '\\' + path.slice(last, j);
	                                    rootEnd = j;
	                                }
	                            }
	                        }
	                    } else {
	                        rootEnd = 1;
	                    }
	                } else if ((code >= 65/*A*/ && code <= 90/*Z*/) ||
	                    (code >= 97/*a*/ && code <= 122/*z*/)) {
	                    // Possible device root

	                    code = path.charCodeAt(1);
	                    if (path.charCodeAt(1) === 58/*:*/) {
	                        device = path.slice(0, 2);
	                        rootEnd = 2;
	                        if (len > 2) {
	                            code = path.charCodeAt(2);
	                            if (code === 47/*/*/ || code === 92/*\*/) {
	                                // Treat separator following drive name as an absolute path
	                                // indicator
	                                isAbsolute = true;
	                                rootEnd = 3;
	                            }
	                        }
	                    }
	                }
	            } else if (code === 47/*/*/ || code === 92/*\*/) {
	                // `path` contains just a path separator
	                rootEnd = 1;
	                isAbsolute = true;
	            }

	            if (device.length > 0 &&
	                resolvedDevice.length > 0 &&
	                device.toLowerCase() !== resolvedDevice.toLowerCase()) {
	                // This path points to another device so it is not applicable
	                continue;
	            }

	            if (resolvedDevice.length === 0 && device.length > 0) {
	                resolvedDevice = device;
	            }
	            if (!resolvedAbsolute) {
	                resolvedTail = path.slice(rootEnd) + '\\' + resolvedTail;
	                resolvedAbsolute = isAbsolute;
	            }

	            if (resolvedDevice.length > 0 && resolvedAbsolute) {
	                break;
	            }
	        }

	        // At this point the path should be resolved to a full absolute path,
	        // but handle relative paths to be safe (might happen when process.cwd()
	        // fails)

	        // Normalize the tail path
	        resolvedTail = normalizeStringWin32(resolvedTail, !resolvedAbsolute);

	        return (resolvedDevice + (resolvedAbsolute ? '\\' : '') + resolvedTail) ||
	            '.';
	    },

	    normalize: function normalize(path) {
	        assertPath(path);
	        const len = path.length;
	        if (len === 0)
	            return '.';
	        var rootEnd = 0;
	        var code = path.charCodeAt(0);
	        var device;
	        var isAbsolute = false;

	        // Try to match a root
	        if (len > 1) {
	            if (code === 47/*/*/ || code === 92/*\*/) {
	                // Possible UNC root

	                // If we started with a separator, we know we at least have an absolute
	                // path of some kind (UNC or otherwise)
	                isAbsolute = true;

	                code = path.charCodeAt(1);
	                if (code === 47/*/*/ || code === 92/*\*/) {
	                    // Matched double path separator at beginning
	                    var j = 2;
	                    var last = j;
	                    // Match 1 or more non-path separators
	                    for (; j < len; ++j) {
	                        code = path.charCodeAt(j);
	                        if (code === 47/*/*/ || code === 92/*\*/)
	                            break;
	                    }
	                    if (j < len && j !== last) {
	                        const firstPart = path.slice(last, j);
	                        // Matched!
	                        last = j;
	                        // Match 1 or more path separators
	                        for (; j < len; ++j) {
	                            code = path.charCodeAt(j);
	                            if (code !== 47/*/*/ && code !== 92/*\*/)
	                                break;
	                        }
	                        if (j < len && j !== last) {
	                            // Matched!
	                            last = j;
	                            // Match 1 or more non-path separators
	                            for (; j < len; ++j) {
	                                code = path.charCodeAt(j);
	                                if (code === 47/*/*/ || code === 92/*\*/)
	                                    break;
	                            }
	                            if (j === len) {
	                                // We matched a UNC root only
	                                // Return the normalized version of the UNC root since there
	                                // is nothing left to process

	                                return '\\\\' + firstPart + '\\' + path.slice(last) + '\\';
	                            } else if (j !== last) {
	                                // We matched a UNC root with leftovers

	                                device = '\\\\' + firstPart + '\\' + path.slice(last, j);
	                                rootEnd = j;
	                            }
	                        }
	                    }
	                } else {
	                    rootEnd = 1;
	                }
	            } else if ((code >= 65/*A*/ && code <= 90/*Z*/) ||
	                (code >= 97/*a*/ && code <= 122/*z*/)) {
	                // Possible device root

	                code = path.charCodeAt(1);
	                if (path.charCodeAt(1) === 58/*:*/) {
	                    device = path.slice(0, 2);
	                    rootEnd = 2;
	                    if (len > 2) {
	                        code = path.charCodeAt(2);
	                        if (code === 47/*/*/ || code === 92/*\*/) {
	                            // Treat separator following drive name as an absolute path
	                            // indicator
	                            isAbsolute = true;
	                            rootEnd = 3;
	                        }
	                    }
	                }
	            }
	        } else if (code === 47/*/*/ || code === 92/*\*/) {
	            // `path` contains just a path separator, exit early to avoid unnecessary
	            // work
	            return '\\';
	        }

	        code = path.charCodeAt(len - 1);
	        var trailingSeparator = (code === 47/*/*/ || code === 92/*\*/);
	        var tail;
	        if (rootEnd < len)
	            tail = normalizeStringWin32(path.slice(rootEnd), !isAbsolute);
	        else
	            tail = '';
	        if (tail.length === 0 && !isAbsolute)
	            tail = '.';
	        if (tail.length > 0 && trailingSeparator)
	            tail += '\\';
	        if (device === undefined) {
	            if (isAbsolute) {
	                if (tail.length > 0)
	                    return '\\' + tail;
	                else
	                    return '\\';
	            } else if (tail.length > 0) {
	                return tail;
	            } else {
	                return '';
	            }
	        } else {
	            if (isAbsolute) {
	                if (tail.length > 0)
	                    return device + '\\' + tail;
	                else
	                    return device + '\\';
	            } else if (tail.length > 0) {
	                return device + tail;
	            } else {
	                return device;
	            }
	        }
	    },


	    isAbsolute: function isAbsolute(path) {
	        assertPath(path);
	        const len = path.length;
	        if (len === 0)
	            return false;
	        var code = path.charCodeAt(0);
	        if (code === 47/*/*/ || code === 92/*\*/) {
	            return true;
	        } else if ((code >= 65/*A*/ && code <= 90/*Z*/) ||
	            (code >= 97/*a*/ && code <= 122/*z*/)) {
	            // Possible device root

	            if (len > 2 && path.charCodeAt(1) === 58/*:*/) {
	                code = path.charCodeAt(2);
	                if (code === 47/*/*/ || code === 92/*\*/)
	                    return true;
	            }
	        }
	        return false;
	    },


	    join: function join() {
	        if (arguments.length === 0)
	            return '.';

	        var joined;
	        var firstPart;
	        for (var i = 0; i < arguments.length; ++i) {
	            var arg = arguments[i];
	            assertPath(arg);
	            if (arg.length > 0) {
	                if (joined === undefined)
	                    joined = firstPart = arg;
	                else
	                    joined += '\\' + arg;
	            }
	        }

	        if (joined === undefined)
	            return '.';

	        // Make sure that the joined path doesn't start with two slashes, because
	        // normalize() will mistake it for an UNC path then.
	        //
	        // This step is skipped when it is very clear that the user actually
	        // intended to point at an UNC path. This is assumed when the first
	        // non-empty string arguments starts with exactly two slashes followed by
	        // at least one more non-slash character.
	        //
	        // Note that for normalize() to treat a path as an UNC path it needs to
	        // have at least 2 components, so we don't filter for that here.
	        // This means that the user can use join to construct UNC paths from
	        // a server name and a share name; for example:
	        //   path.join('//server', 'share') -> '\\\\server\\share\\')
	        //var firstPart = paths[0];
	        var needsReplace = true;
	        var slashCount = 0;
	        var code = firstPart.charCodeAt(0);
	        if (code === 47/*/*/ || code === 92/*\*/) {
	            ++slashCount;
	            const firstLen = firstPart.length;
	            if (firstLen > 1) {
	                code = firstPart.charCodeAt(1);
	                if (code === 47/*/*/ || code === 92/*\*/) {
	                    ++slashCount;
	                    if (firstLen > 2) {
	                        code = firstPart.charCodeAt(2);
	                        if (code === 47/*/*/ || code === 92/*\*/)
	                            ++slashCount;
	                        else {
	                            // We matched a UNC path in the first part
	                            needsReplace = false;
	                        }
	                    }
	                }
	            }
	        }
	        if (needsReplace) {
	            // Find any more consecutive slashes we need to replace
	            for (; slashCount < joined.length; ++slashCount) {
	                code = joined.charCodeAt(slashCount);
	                if (code !== 47/*/*/ && code !== 92/*\*/)
	                    break;
	            }

	            // Replace the slashes if needed
	            if (slashCount >= 2)
	                joined = '\\' + joined.slice(slashCount);
	        }

	        return win32.normalize(joined);
	    },


	    // It will solve the relative path from `from` to `to`, for instance:
	    //  from = 'C:\\orandea\\test\\aaa'
	    //  to = 'C:\\orandea\\impl\\bbb'
	    // The output of the function should be: '..\\..\\impl\\bbb'
	    relative: function relative(from, to) {
	        assertPath(from);
	        assertPath(to);

	        if (from === to)
	            return '';

	        var fromOrig = win32.resolve(from);
	        var toOrig = win32.resolve(to);

	        if (fromOrig === toOrig)
	            return '';

	        from = fromOrig.toLowerCase();
	        to = toOrig.toLowerCase();

	        if (from === to)
	            return '';

	        // Trim any leading backslashes
	        var fromStart = 0;
	        for (; fromStart < from.length; ++fromStart) {
	            if (from.charCodeAt(fromStart) !== 92/*\*/)
	                break;
	        }
	        // Trim trailing backslashes (applicable to UNC paths only)
	        var fromEnd = from.length;
	        for (; fromEnd - 1 > fromStart; --fromEnd) {
	            if (from.charCodeAt(fromEnd - 1) !== 92/*\*/)
	                break;
	        }
	        var fromLen = (fromEnd - fromStart);

	        // Trim any leading backslashes
	        var toStart = 0;
	        for (; toStart < to.length; ++toStart) {
	            if (to.charCodeAt(toStart) !== 92/*\*/)
	                break;
	        }
	        // Trim trailing backslashes (applicable to UNC paths only)
	        var toEnd = to.length;
	        for (; toEnd - 1 > toStart; --toEnd) {
	            if (to.charCodeAt(toEnd - 1) !== 92/*\*/)
	                break;
	        }
	        var toLen = (toEnd - toStart);

	        // Compare paths to find the longest common path from root
	        var length = (fromLen < toLen ? fromLen : toLen);
	        var lastCommonSep = -1;
	        var i = 0;
	        for (; i <= length; ++i) {
	            if (i === length) {
	                if (toLen > length) {
	                    if (to.charCodeAt(toStart + i) === 92/*\*/) {
	                        // We get here if `from` is the exact base path for `to`.
	                        // For example: from='C:\\foo\\bar'; to='C:\\foo\\bar\\baz'
	                        return toOrig.slice(toStart + i + 1);
	                    } else if (i === 2) {
	                        // We get here if `from` is the device root.
	                        // For example: from='C:\\'; to='C:\\foo'
	                        return toOrig.slice(toStart + i);
	                    }
	                }
	                if (fromLen > length) {
	                    if (from.charCodeAt(fromStart + i) === 92/*\*/) {
	                        // We get here if `to` is the exact base path for `from`.
	                        // For example: from='C:\\foo\\bar'; to='C:\\foo'
	                        lastCommonSep = i;
	                    } else if (i === 2) {
	                        // We get here if `to` is the device root.
	                        // For example: from='C:\\foo\\bar'; to='C:\\'
	                        lastCommonSep = 3;
	                    }
	                }
	                break;
	            }
	            var fromCode = from.charCodeAt(fromStart + i);
	            var toCode = to.charCodeAt(toStart + i);
	            if (fromCode !== toCode)
	                break;
	            else if (fromCode === 92/*\*/)
	                lastCommonSep = i;
	        }

	        // We found a mismatch before the first common path separator was seen, so
	        // return the original `to`.
	        // TODO: do this just for device roots (and not UNC paths)?
	        if (i !== length && lastCommonSep === -1) {
	            if (toStart > 0)
	                return toOrig.slice(toStart);
	            else
	                return toOrig;
	        }

	        var out = '';
	        if (lastCommonSep === -1)
	            lastCommonSep = 0;
	        // Generate the relative path based on the path difference between `to` and
	        // `from`
	        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
	            if (i === fromEnd || from.charCodeAt(i) === 92/*\*/) {
	                if (out.length === 0)
	                    out += '..';
	                else
	                    out += '\\..';
	            }
	        }

	        // Lastly, append the rest of the destination (`to`) path that comes after
	        // the common path parts
	        if (out.length > 0)
	            return out + toOrig.slice(toStart + lastCommonSep, toEnd);
	        else {
	            toStart += lastCommonSep;
	            if (toOrig.charCodeAt(toStart) === 92/*\*/)
	                ++toStart;
	            return toOrig.slice(toStart, toEnd);
	        }
	    },


	    _makeLong: function _makeLong(path) {
	        // Note: this will *probably* throw somewhere.
	        if (typeof path !== 'string')
	            return path;

	        if (path.length === 0) {
	            return '';
	        }

	        const resolvedPath = win32.resolve(path);

	        if (resolvedPath.length >= 3) {
	            var code = resolvedPath.charCodeAt(0);
	            if (code === 92/*\*/) {
	                // Possible UNC root

	                if (resolvedPath.charCodeAt(1) === 92/*\*/) {
	                    code = resolvedPath.charCodeAt(2);
	                    if (code !== 63/*?*/ && code !== 46/*.*/) {
	                        // Matched non-long UNC root, convert the path to a long UNC path
	                        return '\\\\?\\UNC\\' + resolvedPath.slice(2);
	                    }
	                }
	            } else if ((code >= 65/*A*/ && code <= 90/*Z*/) ||
	                (code >= 97/*a*/ && code <= 122/*z*/)) {
	                // Possible device root

	                if (resolvedPath.charCodeAt(1) === 58/*:*/ &&
	                    resolvedPath.charCodeAt(2) === 92/*\*/) {
	                    // Matched device root, convert the path to a long UNC path
	                    return '\\\\?\\' + resolvedPath;
	                }
	            }
	        }

	        return path;
	    },


	    dirname: function dirname(path) {
	        assertPath(path);
	        const len = path.length;
	        if (len === 0)
	            return '.';
	        var rootEnd = -1;
	        var end = -1;
	        var matchedSlash = true;
	        var offset = 0;
	        var code = path.charCodeAt(0);

	        // Try to match a root
	        if (len > 1) {
	            if (code === 47/*/*/ || code === 92/*\*/) {
	                // Possible UNC root

	                rootEnd = offset = 1;

	                code = path.charCodeAt(1);
	                if (code === 47/*/*/ || code === 92/*\*/) {
	                    // Matched double path separator at beginning
	                    var j = 2;
	                    var last = j;
	                    // Match 1 or more non-path separators
	                    for (; j < len; ++j) {
	                        code = path.charCodeAt(j);
	                        if (code === 47/*/*/ || code === 92/*\*/)
	                            break;
	                    }
	                    if (j < len && j !== last) {
	                        // Matched!
	                        last = j;
	                        // Match 1 or more path separators
	                        for (; j < len; ++j) {
	                            code = path.charCodeAt(j);
	                            if (code !== 47/*/*/ && code !== 92/*\*/)
	                                break;
	                        }
	                        if (j < len && j !== last) {
	                            // Matched!
	                            last = j;
	                            // Match 1 or more non-path separators
	                            for (; j < len; ++j) {
	                                code = path.charCodeAt(j);
	                                if (code === 47/*/*/ || code === 92/*\*/)
	                                    break;
	                            }
	                            if (j === len) {
	                                // We matched a UNC root only
	                                return path;
	                            }
	                            if (j !== last) {
	                                // We matched a UNC root with leftovers

	                                // Offset by 1 to include the separator after the UNC root to
	                                // treat it as a "normal root" on top of a (UNC) root
	                                rootEnd = offset = j + 1;
	                            }
	                        }
	                    }
	                }
	            } else if ((code >= 65/*A*/ && code <= 90/*Z*/) ||
	                (code >= 97/*a*/ && code <= 122/*z*/)) {
	                // Possible device root

	                code = path.charCodeAt(1);
	                if (path.charCodeAt(1) === 58/*:*/) {
	                    rootEnd = offset = 2;
	                    if (len > 2) {
	                        code = path.charCodeAt(2);
	                        if (code === 47/*/*/ || code === 92/*\*/)
	                            rootEnd = offset = 3;
	                    }
	                }
	            }
	        } else if (code === 47/*/*/ || code === 92/*\*/) {
	            return path[0];
	        }

	        for (var i = len - 1; i >= offset; --i) {
	            code = path.charCodeAt(i);
	            if (code === 47/*/*/ || code === 92/*\*/) {
	                if (!matchedSlash) {
	                    end = i;
	                    break;
	                }
	            } else {
	                // We saw the first non-path separator
	                matchedSlash = false;
	            }
	        }

	        if (end === -1) {
	            if (rootEnd === -1)
	                return '.';
	            else
	                end = rootEnd;
	        }
	        return path.slice(0, end);
	    },


	    basename: function basename(path, ext) {
	        if (ext !== undefined && typeof ext !== 'string')
	            throw new TypeError('"ext" argument must be a string');
	        assertPath(path);
	        var start = 0;
	        var end = -1;
	        var matchedSlash = true;
	        var i;

	        // Check for a drive letter prefix so as not to mistake the following
	        // path separator as an extra separator at the end of the path that can be
	        // disregarded
	        if (path.length >= 2) {
	            const drive = path.charCodeAt(0);
	            if ((drive >= 65/*A*/ && drive <= 90/*Z*/) ||
	                (drive >= 97/*a*/ && drive <= 122/*z*/)) {
	                if (path.charCodeAt(1) === 58/*:*/)
	                    start = 2;
	            }
	        }

	        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
	            if (ext.length === path.length && ext === path)
	                return '';
	            var extIdx = ext.length - 1;
	            var firstNonSlashEnd = -1;
	            for (i = path.length - 1; i >= start; --i) {
	                const code = path.charCodeAt(i);
	                if (code === 47/*/*/ || code === 92/*\*/) {
	                    // If we reached a path separator that was not part of a set of path
	                    // separators at the end of the string, stop now
	                    if (!matchedSlash) {
	                        start = i + 1;
	                        break;
	                    }
	                } else {
	                    if (firstNonSlashEnd === -1) {
	                        // We saw the first non-path separator, remember this index in case
	                        // we need it if the extension ends up not matching
	                        matchedSlash = false;
	                        firstNonSlashEnd = i + 1;
	                    }
	                    if (extIdx >= 0) {
	                        // Try to match the explicit extension
	                        if (code === ext.charCodeAt(extIdx)) {
	                            if (--extIdx === -1) {
	                                // We matched the extension, so mark this as the end of our path
	                                // component
	                                end = i;
	                            }
	                        } else {
	                            // Extension does not match, so our result is the entire path
	                            // component
	                            extIdx = -1;
	                            end = firstNonSlashEnd;
	                        }
	                    }
	                }
	            }

	            if (start === end)
	                end = firstNonSlashEnd;
	            else if (end === -1)
	                end = path.length;
	            return path.slice(start, end);
	        } else {
	            for (i = path.length - 1; i >= start; --i) {
	                const code = path.charCodeAt(i);
	                if (code === 47/*/*/ || code === 92/*\*/) {
	                    // If we reached a path separator that was not part of a set of path
	                    // separators at the end of the string, stop now
	                    if (!matchedSlash) {
	                        start = i + 1;
	                        break;
	                    }
	                } else if (end === -1) {
	                    // We saw the first non-path separator, mark this as the end of our
	                    // path component
	                    matchedSlash = false;
	                    end = i + 1;
	                }
	            }

	            if (end === -1)
	                return '';
	            return path.slice(start, end);
	        }
	    },


	    extname: function extname(path) {
	        assertPath(path);
	        var startDot = -1;
	        var startPart = 0;
	        var end = -1;
	        var matchedSlash = true;
	        // Track the state of characters (if any) we see before our first dot and
	        // after any path separator we find
	        var preDotState = 0;
	        for (var i = path.length - 1; i >= 0; --i) {
	            const code = path.charCodeAt(i);
	            if (code === 47/*/*/ || code === 92/*\*/) {
	                // If we reached a path separator that was not part of a set of path
	                // separators at the end of the string, stop now
	                if (!matchedSlash) {
	                    startPart = i + 1;
	                    break;
	                }
	                continue;
	            }
	            if (end === -1) {
	                // We saw the first non-path separator, mark this as the end of our
	                // extension
	                matchedSlash = false;
	                end = i + 1;
	            }
	            if (code === 46/*.*/) {
	                // If this is our first dot, mark it as the start of our extension
	                if (startDot === -1)
	                    startDot = i;
	                else if (preDotState !== 1)
	                    preDotState = 1;
	            } else if (startDot !== -1) {
	                // We saw a non-dot and non-path separator before our dot, so we should
	                // have a good chance at having a non-empty extension
	                preDotState = -1;
	            }
	        }

	        if (startDot === -1 ||
	            end === -1 ||
	            // We saw a non-dot character immediately before the dot
	            preDotState === 0 ||
	            // The (right-most) trimmed path component is exactly '..'
	            (preDotState === 1 &&
	            startDot === end - 1 &&
	            startDot === startPart + 1)) {
	            return '';
	        }
	        return path.slice(startDot, end);
	    },


	    format: function format(pathObject) {
	        if (pathObject === null || typeof pathObject !== 'object') {
	            throw new TypeError(
	                'Parameter "pathObject" must be an object, not ' + (typeof pathObject)
	            );
	        }
	        return _format('\\', pathObject);
	    },


	    parse: function parse(path) {
	        assertPath(path);

	        var ret = { root: '', dir: '', base: '', ext: '', name: '' };
	        if (path.length === 0)
	            return ret;

	        var len = path.length;
	        var rootEnd = 0;
	        var code = path.charCodeAt(0);
	        var isAbsolute = false;

	        // Try to match a root
	        if (len > 1) {
	            if (code === 47/*/*/ || code === 92/*\*/) {
	                // Possible UNC root

	                isAbsolute = true;

	                code = path.charCodeAt(1);
	                rootEnd = 1;
	                if (code === 47/*/*/ || code === 92/*\*/) {
	                    // Matched double path separator at beginning
	                    var j = 2;
	                    var last = j;
	                    // Match 1 or more non-path separators
	                    for (; j < len; ++j) {
	                        code = path.charCodeAt(j);
	                        if (code === 47/*/*/ || code === 92/*\*/)
	                            break;
	                    }
	                    if (j < len && j !== last) {
	                        // Matched!
	                        last = j;
	                        // Match 1 or more path separators
	                        for (; j < len; ++j) {
	                            code = path.charCodeAt(j);
	                            if (code !== 47/*/*/ && code !== 92/*\*/)
	                                break;
	                        }
	                        if (j < len && j !== last) {
	                            // Matched!
	                            last = j;
	                            // Match 1 or more non-path separators
	                            for (; j < len; ++j) {
	                                code = path.charCodeAt(j);
	                                if (code === 47/*/*/ || code === 92/*\*/)
	                                    break;
	                            }
	                            if (j === len) {
	                                // We matched a UNC root only

	                                rootEnd = j;
	                            } else if (j !== last) {
	                                // We matched a UNC root with leftovers

	                                rootEnd = j + 1;
	                            }
	                        }
	                    }
	                }
	            } else if ((code >= 65/*A*/ && code <= 90/*Z*/) ||
	                (code >= 97/*a*/ && code <= 122/*z*/)) {
	                // Possible device root

	                code = path.charCodeAt(1);
	                if (path.charCodeAt(1) === 58/*:*/) {
	                    rootEnd = 2;
	                    if (len > 2) {
	                        code = path.charCodeAt(2);
	                        if (code === 47/*/*/ || code === 92/*\*/) {
	                            if (len === 3) {
	                                // `path` contains just a drive root, exit early to avoid
	                                // unnecessary work
	                                ret.root = ret.dir = path.slice(0, 3);
	                                return ret;
	                            }
	                            isAbsolute = true;
	                            rootEnd = 3;
	                        }
	                    } else {
	                        // `path` contains just a drive root, exit early to avoid
	                        // unnecessary work
	                        ret.root = ret.dir = path.slice(0, 2);
	                        return ret;
	                    }
	                }
	            }
	        } else if (code === 47/*/*/ || code === 92/*\*/) {
	            // `path` contains just a path separator, exit early to avoid
	            // unnecessary work
	            ret.root = ret.dir = path[0];
	            return ret;
	        }

	        if (rootEnd > 0)
	            ret.root = path.slice(0, rootEnd);

	        var startDot = -1;
	        var startPart = 0;
	        var end = -1;
	        var matchedSlash = true;
	        var i = path.length - 1;

	        // Track the state of characters (if any) we see before our first dot and
	        // after any path separator we find
	        var preDotState = 0;

	        // Get non-dir info
	        for (; i >= rootEnd; --i) {
	            code = path.charCodeAt(i);
	            if (code === 47/*/*/ || code === 92/*\*/) {
	                // If we reached a path separator that was not part of a set of path
	                // separators at the end of the string, stop now
	                if (!matchedSlash) {
	                    startPart = i + 1;
	                    break;
	                }
	                continue;
	            }
	            if (end === -1) {
	                // We saw the first non-path separator, mark this as the end of our
	                // extension
	                matchedSlash = false;
	                end = i + 1;
	            }
	            if (code === 46/*.*/) {
	                // If this is our first dot, mark it as the start of our extension
	                if (startDot === -1)
	                    startDot = i;
	                else if (preDotState !== 1)
	                    preDotState = 1;
	            } else if (startDot !== -1) {
	                // We saw a non-dot and non-path separator before our dot, so we should
	                // have a good chance at having a non-empty extension
	                preDotState = -1;
	            }
	        }

	        if (startDot === -1 ||
	            end === -1 ||
	            // We saw a non-dot character immediately before the dot
	            preDotState === 0 ||
	            // The (right-most) trimmed path component is exactly '..'
	            (preDotState === 1 &&
	            startDot === end - 1 &&
	            startDot === startPart + 1)) {
	            if (end !== -1) {
	                if (startPart === 0 && isAbsolute)
	                    ret.base = ret.name = path.slice(rootEnd, end);
	                else
	                    ret.base = ret.name = path.slice(startPart, end);
	            }
	        } else {
	            if (startPart === 0 && isAbsolute) {
	                ret.name = path.slice(rootEnd, startDot);
	                ret.base = path.slice(rootEnd, end);
	            } else {
	                ret.name = path.slice(startPart, startDot);
	                ret.base = path.slice(startPart, end);
	            }
	            ret.ext = path.slice(startDot, end);
	        }

	        if (startPart > 0)
	            ret.dir = path.slice(0, startPart - 1);
	        else if (isAbsolute)
	            ret.dir = path.slice(0, rootEnd);

	        return ret;
	    },


	    sep: '\\',
	    delimiter: ';',
	    win32: null,
	    posix: null
	};


	const posix = {
	    // path.resolve([from ...], to)
	    resolve: function resolve() {
	        var resolvedPath = '';
	        var resolvedAbsolute = false;
	        var cwd;

	        for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
	            var path;
	            if (i >= 0)
	                path = arguments[i];
	            else {
	                if (cwd === undefined)
	                    cwd = process.cwd();
	                path = cwd;
	            }

	            assertPath(path);

	            // Skip empty entries
	            if (path.length === 0) {
	                continue;
	            }

	            resolvedPath = path + '/' + resolvedPath;
	            resolvedAbsolute = path.charCodeAt(0) === 47/*/*/;
	        }

	        // At this point the path should be resolved to a full absolute path, but
	        // handle relative paths to be safe (might happen when process.cwd() fails)

	        // Normalize the path
	        resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

	        if (resolvedAbsolute) {
	            if (resolvedPath.length > 0)
	                return '/' + resolvedPath;
	            else
	                return '/';
	        } else if (resolvedPath.length > 0) {
	            return resolvedPath;
	        } else {
	            return '.';
	        }
	    },


	    normalize: function normalize(path) {
	        assertPath(path);

	        if (path.length === 0)
	            return '.';

	        const isAbsolute = path.charCodeAt(0) === 47/*/*/;
	        const trailingSeparator = path.charCodeAt(path.length - 1) === 47/*/*/;

	        // Normalize the path
	        path = normalizeStringPosix(path, !isAbsolute);

	        if (path.length === 0 && !isAbsolute)
	            path = '.';
	        if (path.length > 0 && trailingSeparator)
	            path += '/';

	        if (isAbsolute)
	            return '/' + path;
	        return path;
	    },


	    isAbsolute: function isAbsolute(path) {
	        assertPath(path);
	        return path.length > 0 && path.charCodeAt(0) === 47/*/*/;
	    },


	    join: function join() {
	        if (arguments.length === 0)
	            return '.';
	        var joined;
	        for (var i = 0; i < arguments.length; ++i) {
	            var arg = arguments[i];
	            assertPath(arg);
	            if (arg.length > 0) {
	                if (joined === undefined)
	                    joined = arg;
	                else
	                    joined += '/' + arg;
	            }
	        }
	        if (joined === undefined)
	            return '.';
	        return posix.normalize(joined);
	    },


	    relative: function relative(from, to) {
	        assertPath(from);
	        assertPath(to);

	        if (from === to)
	            return '';

	        from = posix.resolve(from);
	        to = posix.resolve(to);

	        if (from === to)
	            return '';

	        // Trim any leading backslashes
	        var fromStart = 1;
	        for (; fromStart < from.length; ++fromStart) {
	            if (from.charCodeAt(fromStart) !== 47/*/*/)
	                break;
	        }
	        var fromEnd = from.length;
	        var fromLen = (fromEnd - fromStart);

	        // Trim any leading backslashes
	        var toStart = 1;
	        for (; toStart < to.length; ++toStart) {
	            if (to.charCodeAt(toStart) !== 47/*/*/)
	                break;
	        }
	        var toEnd = to.length;
	        var toLen = (toEnd - toStart);

	        // Compare paths to find the longest common path from root
	        var length = (fromLen < toLen ? fromLen : toLen);
	        var lastCommonSep = -1;
	        var i = 0;
	        for (; i <= length; ++i) {
	            if (i === length) {
	                if (toLen > length) {
	                    if (to.charCodeAt(toStart + i) === 47/*/*/) {
	                        // We get here if `from` is the exact base path for `to`.
	                        // For example: from='/foo/bar'; to='/foo/bar/baz'
	                        return to.slice(toStart + i + 1);
	                    } else if (i === 0) {
	                        // We get here if `from` is the root
	                        // For example: from='/'; to='/foo'
	                        return to.slice(toStart + i);
	                    }
	                } else if (fromLen > length) {
	                    if (from.charCodeAt(fromStart + i) === 47/*/*/) {
	                        // We get here if `to` is the exact base path for `from`.
	                        // For example: from='/foo/bar/baz'; to='/foo/bar'
	                        lastCommonSep = i;
	                    } else if (i === 0) {
	                        // We get here if `to` is the root.
	                        // For example: from='/foo'; to='/'
	                        lastCommonSep = 0;
	                    }
	                }
	                break;
	            }
	            var fromCode = from.charCodeAt(fromStart + i);
	            var toCode = to.charCodeAt(toStart + i);
	            if (fromCode !== toCode)
	                break;
	            else if (fromCode === 47/*/*/)
	                lastCommonSep = i;
	        }

	        var out = '';
	        // Generate the relative path based on the path difference between `to`
	        // and `from`
	        for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
	            if (i === fromEnd || from.charCodeAt(i) === 47/*/*/) {
	                if (out.length === 0)
	                    out += '..';
	                else
	                    out += '/..';
	            }
	        }

	        // Lastly, append the rest of the destination (`to`) path that comes after
	        // the common path parts
	        if (out.length > 0)
	            return out + to.slice(toStart + lastCommonSep);
	        else {
	            toStart += lastCommonSep;
	            if (to.charCodeAt(toStart) === 47/*/*/)
	                ++toStart;
	            return to.slice(toStart);
	        }
	    },


	    _makeLong: function _makeLong(path) {
	        return path;
	    },


	    dirname: function dirname(path) {
	        assertPath(path);
	        if (path.length === 0)
	            return '.';
	        var code = path.charCodeAt(0);
	        var hasRoot = (code === 47/*/*/);
	        var end = -1;
	        var matchedSlash = true;
	        for (var i = path.length - 1; i >= 1; --i) {
	            code = path.charCodeAt(i);
	            if (code === 47/*/*/) {
	                if (!matchedSlash) {
	                    end = i;
	                    break;
	                }
	            } else {
	                // We saw the first non-path separator
	                matchedSlash = false;
	            }
	        }

	        if (end === -1)
	            return hasRoot ? '/' : '.';
	        if (hasRoot && end === 1)
	            return '//';
	        return path.slice(0, end);
	    },


	    basename: function basename(path, ext) {
	        if (ext !== undefined && typeof ext !== 'string')
	            throw new TypeError('"ext" argument must be a string');
	        assertPath(path);

	        var start = 0;
	        var end = -1;
	        var matchedSlash = true;
	        var i;

	        if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
	            if (ext.length === path.length && ext === path)
	                return '';
	            var extIdx = ext.length - 1;
	            var firstNonSlashEnd = -1;
	            for (i = path.length - 1; i >= 0; --i) {
	                const code = path.charCodeAt(i);
	                if (code === 47/*/*/) {
	                    // If we reached a path separator that was not part of a set of path
	                    // separators at the end of the string, stop now
	                    if (!matchedSlash) {
	                        start = i + 1;
	                        break;
	                    }
	                } else {
	                    if (firstNonSlashEnd === -1) {
	                        // We saw the first non-path separator, remember this index in case
	                        // we need it if the extension ends up not matching
	                        matchedSlash = false;
	                        firstNonSlashEnd = i + 1;
	                    }
	                    if (extIdx >= 0) {
	                        // Try to match the explicit extension
	                        if (code === ext.charCodeAt(extIdx)) {
	                            if (--extIdx === -1) {
	                                // We matched the extension, so mark this as the end of our path
	                                // component
	                                end = i;
	                            }
	                        } else {
	                            // Extension does not match, so our result is the entire path
	                            // component
	                            extIdx = -1;
	                            end = firstNonSlashEnd;
	                        }
	                    }
	                }
	            }

	            if (start === end)
	                end = firstNonSlashEnd;
	            else if (end === -1)
	                end = path.length;
	            return path.slice(start, end);
	        } else {
	            for (i = path.length - 1; i >= 0; --i) {
	                if (path.charCodeAt(i) === 47/*/*/) {
	                    // If we reached a path separator that was not part of a set of path
	                    // separators at the end of the string, stop now
	                    if (!matchedSlash) {
	                        start = i + 1;
	                        break;
	                    }
	                } else if (end === -1) {
	                    // We saw the first non-path separator, mark this as the end of our
	                    // path component
	                    matchedSlash = false;
	                    end = i + 1;
	                }
	            }

	            if (end === -1)
	                return '';
	            return path.slice(start, end);
	        }
	    },


	    extname: function extname(path) {
	        assertPath(path);
	        var startDot = -1;
	        var startPart = 0;
	        var end = -1;
	        var matchedSlash = true;
	        // Track the state of characters (if any) we see before our first dot and
	        // after any path separator we find
	        var preDotState = 0;
	        for (var i = path.length - 1; i >= 0; --i) {
	            const code = path.charCodeAt(i);
	            if (code === 47/*/*/) {
	                // If we reached a path separator that was not part of a set of path
	                // separators at the end of the string, stop now
	                if (!matchedSlash) {
	                    startPart = i + 1;
	                    break;
	                }
	                continue;
	            }
	            if (end === -1) {
	                // We saw the first non-path separator, mark this as the end of our
	                // extension
	                matchedSlash = false;
	                end = i + 1;
	            }
	            if (code === 46/*.*/) {
	                // If this is our first dot, mark it as the start of our extension
	                if (startDot === -1)
	                    startDot = i;
	                else if (preDotState !== 1)
	                    preDotState = 1;
	            } else if (startDot !== -1) {
	                // We saw a non-dot and non-path separator before our dot, so we should
	                // have a good chance at having a non-empty extension
	                preDotState = -1;
	            }
	        }

	        if (startDot === -1 ||
	            end === -1 ||
	            // We saw a non-dot character immediately before the dot
	            preDotState === 0 ||
	            // The (right-most) trimmed path component is exactly '..'
	            (preDotState === 1 &&
	            startDot === end - 1 &&
	            startDot === startPart + 1)) {
	            return '';
	        }
	        return path.slice(startDot, end);
	    },


	    format: function format(pathObject) {
	        if (pathObject === null || typeof pathObject !== 'object') {
	            throw new TypeError(
	                'Parameter "pathObject" must be an object, not' + (typeof pathObject)
	            );
	        }
	        return _format('/', pathObject);
	    },


	    parse: function parse(path) {
	        assertPath(path);

	        var ret = { root: '', dir: '', base: '', ext: '', name: '' };
	        if (path.length === 0)
	            return ret;
	        var code = path.charCodeAt(0);
	        var isAbsolute = (code === 47/*/*/);
	        var start;
	        if (isAbsolute) {
	            ret.root = '/';
	            start = 1;
	        } else {
	            start = 0;
	        }
	        var startDot = -1;
	        var startPart = 0;
	        var end = -1;
	        var matchedSlash = true;
	        var i = path.length - 1;

	        // Track the state of characters (if any) we see before our first dot and
	        // after any path separator we find
	        var preDotState = 0;

	        // Get non-dir info
	        for (; i >= start; --i) {
	            code = path.charCodeAt(i);
	            if (code === 47/*/*/) {
	                // If we reached a path separator that was not part of a set of path
	                // separators at the end of the string, stop now
	                if (!matchedSlash) {
	                    startPart = i + 1;
	                    break;
	                }
	                continue;
	            }
	            if (end === -1) {
	                // We saw the first non-path separator, mark this as the end of our
	                // extension
	                matchedSlash = false;
	                end = i + 1;
	            }
	            if (code === 46/*.*/) {
	                // If this is our first dot, mark it as the start of our extension
	                if (startDot === -1)
	                    startDot = i;
	                else if (preDotState !== 1)
	                    preDotState = 1;
	            } else if (startDot !== -1) {
	                // We saw a non-dot and non-path separator before our dot, so we should
	                // have a good chance at having a non-empty extension
	                preDotState = -1;
	            }
	        }

	        if (startDot === -1 ||
	            end === -1 ||
	            // We saw a non-dot character immediately before the dot
	            preDotState === 0 ||
	            // The (right-most) trimmed path component is exactly '..'
	            (preDotState === 1 &&
	            startDot === end - 1 &&
	            startDot === startPart + 1)) {
	            if (end !== -1) {
	                if (startPart === 0 && isAbsolute)
	                    ret.base = ret.name = path.slice(1, end);
	                else
	                    ret.base = ret.name = path.slice(startPart, end);
	            }
	        } else {
	            if (startPart === 0 && isAbsolute) {
	                ret.name = path.slice(1, startDot);
	                ret.base = path.slice(1, end);
	            } else {
	                ret.name = path.slice(startPart, startDot);
	                ret.base = path.slice(startPart, end);
	            }
	            ret.ext = path.slice(startDot, end);
	        }

	        if (startPart > 0)
	            ret.dir = path.slice(0, startPart - 1);
	        else if (isAbsolute)
	            ret.dir = '/';

	        return ret;
	    },


	    sep: '/',
	    delimiter: ':',
	    win32: null,
	    posix: null
	};


	posix.win32 = win32.win32 = win32;
	posix.posix = win32.posix = posix;


	if (process.platform === 'win32')
	    module.exports = win32;
	else
	    module.exports = posix;



/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = Stream;

	const EE = __webpack_require__(18);
	const util = __webpack_require__(6);

	util.inherits(Stream, EE);
	Stream.Readable = __webpack_require__(27);
	Stream.Writable = __webpack_require__(30);
	Stream.Duplex = __webpack_require__(32);
	Stream.Transform = __webpack_require__(33);
	Stream.PassThrough = __webpack_require__(34);

	// Backwards-compat with node 0.4.x
	Stream.Stream = Stream;


	// old-style streams.  Note that the pipe method (the only relevant
	// part of this class) is overridden in the Readable class.

	function Stream() {
	    EE.call(this);
	}

	Stream.prototype.pipe = function(dest, options) {
	    var source = this;

	    function ondata(chunk) {
	        if (dest.writable) {
	            if (false === dest.write(chunk) && source.pause) {
	                source.pause();
	            }
	        }
	    }

	    source.on('data', ondata);

	    function ondrain() {
	        if (source.readable && source.resume) {
	            source.resume();
	        }
	    }

	    dest.on('drain', ondrain);

	    // If the 'end' option is not supplied, dest.end() will be called when
	    // source gets the 'end' or 'close' events.  Only dest.end() once.
	    if (!dest._isStdio && (!options || options.end !== false)) {
	        source.on('end', onend);
	        source.on('close', onclose);
	    }

	    var didOnEnd = false;
	    function onend() {
	        if (didOnEnd) return;
	        didOnEnd = true;

	        dest.end();
	    }


	    function onclose() {
	        if (didOnEnd) return;
	        didOnEnd = true;

	        if (typeof dest.destroy === 'function') dest.destroy();
	    }

	    // don't leave dangling pipes when there are errors.
	    function onerror(er) {
	        cleanup();
	        if (EE.listenerCount(this, 'error') === 0) {
	            throw er; // Unhandled stream error in pipe.
	        }
	    }

	    source.on('error', onerror);
	    dest.on('error', onerror);

	    // remove all the event listeners that were added.
	    function cleanup() {
	        source.removeListener('data', ondata);
	        dest.removeListener('drain', ondrain);

	        source.removeListener('end', onend);
	        source.removeListener('close', onclose);

	        source.removeListener('error', onerror);
	        dest.removeListener('error', onerror);

	        source.removeListener('end', cleanup);
	        source.removeListener('close', cleanup);

	        dest.removeListener('close', cleanup);
	    }

	    source.on('end', cleanup);
	    source.on('close', cleanup);

	    dest.on('close', cleanup);

	    dest.emit('pipe', source);

	    // Allow for unix-like usage: A.pipe(B).pipe(C)
	    return dest;
	};


/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = Readable;
	Readable.ReadableState = ReadableState;

	const EE = __webpack_require__(18);
	const Stream = __webpack_require__(26);
	const Buffer = __webpack_require__(7).Buffer;
	const util = __webpack_require__(6);
	const debug = util.debuglog('stream');
	const BufferList = __webpack_require__(28);
	var StringDecoder;

	util.inherits(Readable, Stream);

	var prependListener;
	if (typeof EE.prototype.prependListener === 'function') {
	    prependListener = function prependListener(emitter, event, fn) {
	        return emitter.prependListener(event, fn);
	    };
	} else {
	    prependListener = function prependListener(emitter, event, fn) {
	        // This is a hack to make sure that our error handler is attached before any
	        // userland ones.  NEVER DO THIS. This is here only because this code needs
	        // to continue to work with older versions of Node.js that do not include
	        // the prependListener() method. The goal is to eventually remove this hack.
	        if (!emitter._events || !emitter._events[event])
	            emitter.on(event, fn);
	        else if (Array.isArray(emitter._events[event]))
	            emitter._events[event].unshift(fn);
	        else
	            emitter._events[event] = [fn, emitter._events[event]];
	    };
	}

	function ReadableState(options, stream) {
	    options = options || {};

	    // object stream flag. Used to make read(n) ignore n and to
	    // make all the buffer merging and length checks go away
	    this.objectMode = !!options.objectMode;

	    if (stream instanceof Stream.Duplex)
	        this.objectMode = this.objectMode || !!options.readableObjectMode;

	    // the point at which it stops calling _read() to fill the buffer
	    // Note: 0 is a valid value, means "don't call _read preemptively ever"
	    var hwm = options.highWaterMark;
	    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
	    this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

	    // cast to ints.
	    this.highWaterMark = ~~this.highWaterMark;

	    // A linked list is used to store data chunks instead of an array because the
	    // linked list can remove elements from the beginning faster than
	    // array.shift()
	    this.buffer = new BufferList();
	    this.length = 0;
	    this.pipes = null;
	    this.pipesCount = 0;
	    this.flowing = null;
	    this.ended = false;
	    this.endEmitted = false;
	    this.reading = false;

	    // a flag to be able to tell if the onwrite cb is called immediately,
	    // or on a later tick.  We set this to true at first, because any
	    // actions that shouldn't happen until "later" should generally also
	    // not happen before the first write call.
	    this.sync = true;

	    // whenever we return null, then we set a flag to say
	    // that we're awaiting a 'readable' event emission.
	    this.needReadable = false;
	    this.emittedReadable = false;
	    this.readableListening = false;
	    this.resumeScheduled = false;

	    // Crypto is kind of old and crusty.  Historically, its default string
	    // encoding is 'binary' so we have to make this configurable.
	    // Everything else in the universe uses 'utf8', though.
	    this.defaultEncoding = options.defaultEncoding || 'utf8';

	    // when piping, we only care about 'readable' events that happen
	    // after read()ing all the bytes and not getting any pushback.
	    this.ranOut = false;

	    // the number of writers that are awaiting a drain event in .pipe()s
	    this.awaitDrain = 0;

	    // if true, a maybeReadMore has been scheduled
	    this.readingMore = false;

	    this.decoder = null;
	    this.encoding = null;
	    if (options.encoding) {
	        if (!StringDecoder)
	            StringDecoder = __webpack_require__(29).StringDecoder;
	        this.decoder = new StringDecoder(options.encoding);
	        this.encoding = options.encoding;
	    }
	}

	function Readable(options) {
	    if (!(this instanceof Readable))
	        return new Readable(options);

	    this._readableState = new ReadableState(options, this);

	    // legacy
	    this.readable = true;

	    if (options && typeof options.read === 'function')
	        this._read = options.read;

	    Stream.call(this);
	}

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function(chunk, encoding) {
	    var state = this._readableState;

	    if (!state.objectMode && typeof chunk === 'string') {
	        encoding = encoding || state.defaultEncoding;
	        if (encoding !== state.encoding) {
	            chunk = Buffer.from(chunk, encoding);
	            encoding = '';
	        }
	    }

	    return readableAddChunk(this, state, chunk, encoding, false);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function(chunk) {
	    var state = this._readableState;
	    return readableAddChunk(this, state, chunk, '', true);
	};

	Readable.prototype.isPaused = function() {
	    return this._readableState.flowing === false;
	};

	function readableAddChunk(stream, state, chunk, encoding, addToFront) {
	    var er = chunkInvalid(state, chunk);
	    if (er) {
	        stream.emit('error', er);
	    } else if (chunk === null) {
	        state.reading = false;
	        onEofChunk(stream, state);
	    } else if (state.objectMode || chunk && chunk.length > 0) {
	        if (state.ended && !addToFront) {
	            const e = new Error('stream.push() after EOF');
	            stream.emit('error', e);
	        } else if (state.endEmitted && addToFront) {
	            const e = new Error('stream.unshift() after end event');
	            stream.emit('error', e);
	        } else {
	            var skipAdd;
	            if (state.decoder && !addToFront && !encoding) {
	                chunk = state.decoder.write(chunk);
	                skipAdd = (!state.objectMode && chunk.length === 0);
	            }

	            if (!addToFront)
	                state.reading = false;

	            // Don't add to the buffer if we've decoded to an empty string chunk and
	            // we're not in object mode
	            if (!skipAdd) {
	                // if we want the data now, just emit it.
	                if (state.flowing && state.length === 0 && !state.sync) {
	                    stream.emit('data', chunk);
	                    stream.read(0);
	                } else {
	                    // update the buffer info.
	                    state.length += state.objectMode ? 1 : chunk.length;
	                    if (addToFront)
	                        state.buffer.unshift(chunk);
	                    else
	                        state.buffer.push(chunk);

	                    if (state.needReadable)
	                        emitReadable(stream);
	                }
	            }

	            maybeReadMore(stream, state);
	        }
	    } else if (!addToFront) {
	        state.reading = false;
	    }

	    return needMoreData(state);
	}


	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
	    return !state.ended &&
	        (state.needReadable ||
	        state.length < state.highWaterMark ||
	        state.length === 0);
	}

	// backwards compatibility.
	Readable.prototype.setEncoding = function(enc) {
	    if (!StringDecoder)
	        StringDecoder = __webpack_require__(29).StringDecoder;
	    this._readableState.decoder = new StringDecoder(enc);
	    this._readableState.encoding = enc;
	    return this;
	};

	// Don't raise the hwm > 8MB
	const MAX_HWM = 0x800000;
	function computeNewHighWaterMark(n) {
	    if (n >= MAX_HWM) {
	        n = MAX_HWM;
	    } else {
	        // Get the next highest power of 2 to prevent increasing hwm excessively in
	        // tiny amounts
	        n--;
	        n |= n >>> 1;
	        n |= n >>> 2;
	        n |= n >>> 4;
	        n |= n >>> 8;
	        n |= n >>> 16;
	        n++;
	    }
	    return n;
	}

	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function howMuchToRead(n, state) {
	    if (n <= 0 || (state.length === 0 && state.ended))
	        return 0;
	    if (state.objectMode)
	        return 1;
	    if (n !== n) {
	        // Only flow one buffer at a time
	        if (state.flowing && state.length)
	            return state.buffer.head.data.length;
	        else
	            return state.length;
	    }
	    // If we're asking for more than the current hwm, then raise the hwm.
	    if (n > state.highWaterMark)
	        state.highWaterMark = computeNewHighWaterMark(n);
	    if (n <= state.length)
	        return n;
	    // Don't have enough
	    if (!state.ended) {
	        state.needReadable = true;
	        return 0;
	    }
	    return state.length;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function(n) {
	    debug('read', n);
	    n = parseInt(n, 10);
	    var state = this._readableState;
	    var nOrig = n;

	    if (n !== 0)
	        state.emittedReadable = false;

	    // if we're doing read(0) to trigger a readable event, but we
	    // already have a bunch of data in the buffer, then just trigger
	    // the 'readable' event and move on.
	    var n0 = n === 0;
	    var state0 = (state.length >= state.highWaterMark || state.ended);
	    // debug('read(0)?', n0, state.needReadable, state0, state.length, state.highWaterMark);
	    if (n0 && state.needReadable && state0) {
	        debug('read: emitReadable', state.length, state.ended);
	        if (state.length === 0 && state.ended)
	            endReadable(this);
	        else
	            emitReadable(this);
	        return null;
	    }

	    n = howMuchToRead(n, state);

	    // if we've ended, and we're now clear, then finish it up.
	    if (n === 0 && state.ended) {
	        if (state.length === 0)
	            endReadable(this);
	        return null;
	    }

	    // All the actual chunk generation logic needs to be
	    // *below* the call to _read.  The reason is that in certain
	    // synthetic stream cases, such as passthrough streams, _read
	    // may be a completely synchronous operation which may change
	    // the state of the read buffer, providing enough data when
	    // before there was *not* enough.
	    //
	    // So, the steps are:
	    // 1. Figure out what the state of things will be after we do
	    // a read from the buffer.
	    //
	    // 2. If that resulting state will trigger a _read, then call _read.
	    // Note that this may be asynchronous, or synchronous.  Yes, it is
	    // deeply ugly to write APIs this way, but that still doesn't mean
	    // that the Readable class should behave improperly, as streams are
	    // designed to be sync/async agnostic.
	    // Take note if the _read call is sync or async (ie, if the read call
	    // has returned yet), so that we know whether or not it's safe to emit
	    // 'readable' etc.
	    //
	    // 3. Actually pull the requested chunks out of the buffer and return.

	    // if we need a readable event, then we need to do some reading.
	    var doRead = state.needReadable;
	    debug('need readable', doRead);

	    // if we currently have less than the highWaterMark, then also read some
	    if (state.length === 0 || state.length - n < state.highWaterMark) {
	        doRead = true;
	        debug('length less than watermark', doRead);
	    }

	    // however, if we've ended, then there's no point, and if we're already
	    // reading, then it's unnecessary.
	    if (state.ended || state.reading) {
	        doRead = false;
	        debug('reading or ended', doRead);
	    } else if (doRead) {
	        debug('do read');
	        state.reading = true;
	        state.sync = true;
	        // if the length is currently zero, then we *need* a readable event.
	        if (state.length === 0)
	            state.needReadable = true;
	        // call internal read method
	        this._read(state.highWaterMark);
	        state.sync = false;
	        // If _read pushed data synchronously, then `reading` will be false,
	        // and we need to re-evaluate how much data we can return to the user.
	        if (!state.reading)
	            n = howMuchToRead(nOrig, state);
	    }

	    var ret;
	    if (n > 0)
	        ret = fromList(n, state);
	    else
	        ret = null;

	    if (ret === null) {
	        state.needReadable = true;
	        n = 0;
	    } else {
	        state.length -= n;
	    }

	    if (state.length === 0) {
	        // If we have nothing in the buffer, then we want to know
	        // as soon as we *do* get something into the buffer.
	        if (!state.ended)
	            state.needReadable = true;

	        // If we tried to read() past the EOF, then emit end on the next tick.
	        if (nOrig !== n && state.ended)
	            endReadable(this);
	    }

	    if (ret !== null)
	        this.emit('data', ret);

	    return ret;
	};

	function chunkInvalid(state, chunk) {
	    var er = null;
	    if (!(chunk instanceof Buffer) &&
	        typeof chunk !== 'string' &&
	        chunk !== null &&
	        chunk !== undefined &&
	        !state.objectMode) {
	        er = new TypeError('Invalid non-string/buffer chunk');
	    }
	    return er;
	}


	function onEofChunk(stream, state) {
	    if (state.ended) return;
	    if (state.decoder) {
	        var chunk = state.decoder.end();
	        if (chunk && chunk.length) {
	            state.buffer.push(chunk);
	            state.length += state.objectMode ? 1 : chunk.length;
	        }
	    }
	    state.ended = true;

	    // emit 'readable' now to make sure it gets picked up.
	    emitReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	    var state = stream._readableState;
	    state.needReadable = false;
	    if (!state.emittedReadable) {
	        debug('emitReadable', state.flowing);
	        state.emittedReadable = true;
	        if (state.sync)
	            process.nextTick(emitReadable_, stream);
	        else
	            emitReadable_(stream);
	    }
	}

	function emitReadable_(stream) {
	    debug('emit readable');
	    stream.emit('readable');
	    flow(stream);
	}


	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	    if (!state.readingMore) {
	        state.readingMore = true;
	        process.nextTick(maybeReadMore_, stream, state);
	    }
	}

	function maybeReadMore_(stream, state) {
	    var len = state.length;
	    while (!state.reading && !state.flowing && !state.ended &&
	    state.length < state.highWaterMark) {
	        debug('maybeReadMore read 0');
	        stream.read(0);
	        if (len === state.length)
	        // didn't get any data, stop spinning.
	            break;
	        else
	            len = state.length;
	    }
	    state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function(n) {
	    this.emit('error', new Error('not implemented'));
	};

	Readable.prototype.pipe = function(dest, pipeOpts) {
	    var src = this;
	    var state = this._readableState;

	    switch (state.pipesCount) {
	        case 0:
	            state.pipes = dest;
	            break;
	        case 1:
	            state.pipes = [state.pipes, dest];
	            break;
	        default:
	            state.pipes.push(dest);
	            break;
	    }
	    state.pipesCount += 1;
	    debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

	    var doEnd = (!pipeOpts || pipeOpts.end !== false) &&
	        dest !== process.stdout &&
	        dest !== process.stderr;

	    var endFn = doEnd ? onend : cleanup;
	    if (state.endEmitted)
	        process.nextTick(endFn);
	    else
	        src.once('end', endFn);

	    dest.on('unpipe', onunpipe);
	    function onunpipe(readable) {
	        debug('onunpipe');
	        if (readable === src) {
	            cleanup();
	        }
	    }

	    function onend() {
	        debug('onend');
	        dest.end();
	    }

	    // when the dest drains, it reduces the awaitDrain counter
	    // on the source.  This would be more elegant with a .once()
	    // handler in flow(), but adding and removing repeatedly is
	    // too slow.
	    var ondrain = pipeOnDrain(src);
	    dest.on('drain', ondrain);

	    var cleanedUp = false;
	    function cleanup() {
	        debug('cleanup');
	        // cleanup event handlers once the pipe is broken
	        dest.removeListener('close', onclose);
	        dest.removeListener('finish', onfinish);
	        dest.removeListener('drain', ondrain);
	        dest.removeListener('error', onerror);
	        dest.removeListener('unpipe', onunpipe);
	        src.removeListener('end', onend);
	        src.removeListener('end', cleanup);
	        src.removeListener('data', ondata);

	        cleanedUp = true;

	        // if the reader is waiting for a drain event from this
	        // specific writer, then it would cause it to never start
	        // flowing again.
	        // So, if this is awaiting a drain, then we just call it now.
	        // If we don't know, then assume that we are waiting for one.
	        if (state.awaitDrain &&
	            (!dest._writableState || dest._writableState.needDrain))
	            ondrain();
	    }

	    // If the user pushes more data while we're writing to dest then we'll end up
	    // in ondata again. However, we only want to increase awaitDrain once because
	    // dest will only emit one 'drain' event for the multiple writes.
	    // => Introduce a guard on increasing awaitDrain.
	    var increasedAwaitDrain = false;
	    src.on('data', ondata);
	    function ondata(chunk) {
	        debug('ondata');
	        increasedAwaitDrain = false;
	        var ret = dest.write(chunk);
	        if (false === ret && !increasedAwaitDrain) {
	            // If the user unpiped during `dest.write()`, it is possible
	            // to get stuck in a permanently paused state if that write
	            // also returned false.
	            // => Check whether `dest` is still a piping destination.
	            if (((state.pipesCount === 1 && state.pipes === dest) ||
	                (state.pipesCount > 1 && state.pipes.indexOf(dest) !== -1)) &&
	                !cleanedUp) {
	                debug('false write response, pause', src._readableState.awaitDrain);
	                src._readableState.awaitDrain++;
	                increasedAwaitDrain = true;
	            }
	            src.pause();
	        }
	    }

	    // if the dest has an error, then stop piping into it.
	    // however, don't suppress the throwing behavior for this.
	    function onerror(er) {
	        debug('onerror', er);
	        unpipe();
	        dest.removeListener('error', onerror);
	        if (EE.listenerCount(dest, 'error') === 0)
	            dest.emit('error', er);
	    }

	    // Make sure our error handler is attached before userland ones.
	    prependListener(dest, 'error', onerror);

	    // Both close and finish should trigger unpipe, but only once.
	    function onclose() {
	        dest.removeListener('finish', onfinish);
	        unpipe();
	    }
	    dest.once('close', onclose);
	    function onfinish() {
	        debug('onfinish');
	        dest.removeListener('close', onclose);
	        unpipe();
	    }
	    dest.once('finish', onfinish);

	    function unpipe() {
	        debug('unpipe');
	        src.unpipe(dest);
	    }

	    // tell the dest that it's being piped to
	    dest.emit('pipe', src);

	    // start the flow if it hasn't been started already.
	    if (!state.flowing) {
	        debug('pipe resume');
	        src.resume();
	    }

	    return dest;
	};

	function pipeOnDrain(src) {
	    return function() {
	        var state = src._readableState;
	        debug('pipeOnDrain', state.awaitDrain);
	        if (state.awaitDrain)
	            state.awaitDrain--;
	        if (state.awaitDrain === 0 && EE.listenerCount(src, 'data')) {
	            state.flowing = true;
	            flow(src);
	        }
	    };
	}


	Readable.prototype.unpipe = function(dest) {
	    var state = this._readableState;

	    // if we're not piping anywhere, then do nothing.
	    if (state.pipesCount === 0)
	        return this;

	    // just one destination.  most common case.
	    if (state.pipesCount === 1) {
	        // passed in one, but it's not the right one.
	        if (dest && dest !== state.pipes)
	            return this;

	        if (!dest)
	            dest = state.pipes;

	        // got a match.
	        state.pipes = null;
	        state.pipesCount = 0;
	        state.flowing = false;
	        if (dest)
	            dest.emit('unpipe', this);
	        return this;
	    }

	    // slow case. multiple pipe destinations.

	    if (!dest) {
	        // remove all.
	        var dests = state.pipes;
	        var len = state.pipesCount;
	        state.pipes = null;
	        state.pipesCount = 0;
	        state.flowing = false;

	        for (var j = 0; j < len; j++)
	            dests[j].emit('unpipe', this);
	        return this;
	    }

	    // try to find the right one.
	    const i = state.pipes.indexOf(dest);
	    if (i === -1)
	        return this;

	    state.pipes.splice(i, 1);
	    state.pipesCount -= 1;
	    if (state.pipesCount === 1)
	        state.pipes = state.pipes[0];

	    dest.emit('unpipe', this);

	    return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function(ev, fn) {
	    const res = Stream.prototype.on.call(this, ev, fn);

	    if (ev === 'data') {
	        // Start flowing on next tick if stream isn't explicitly paused
	        if (this._readableState.flowing !== false)
	            this.resume();
	    } else if (ev === 'readable') {
	        const state = this._readableState;
	        if (!state.endEmitted && !state.readableListening) {
	            state.readableListening = state.needReadable = true;
	            state.emittedReadable = false;
	            if (!state.reading) {
	                process.nextTick(nReadingNextTick, this);
	            } else if (state.length) {
	                emitReadable(this, state);
	            }
	        }
	    }

	    return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	function nReadingNextTick(self) {
	    debug('readable nexttick read 0');
	    self.read(0);
	}

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function() {
	    var state = this._readableState;
	    if (!state.flowing) {
	        debug('resume');
	        state.flowing = true;
	        resume(this, state);
	    }
	    return this;
	};

	function resume(stream, state) {
	    if (!state.resumeScheduled) {
	        state.resumeScheduled = true;
	        process.nextTick(resume_, stream, state);
	    }
	}

	function resume_(stream, state) {
	    if (!state.reading) {
	        debug('resume read 0');
	        stream.read(0);
	    }

	    state.resumeScheduled = false;
	    state.awaitDrain = 0;
	    stream.emit('resume');
	    flow(stream);
	    if (state.flowing && !state.reading)
	        stream.read(0);
	}

	Readable.prototype.pause = function() {
	    debug('call pause flowing=%j', this._readableState.flowing);
	    if (false !== this._readableState.flowing) {
	        debug('pause');
	        this._readableState.flowing = false;
	        this.emit('pause');
	    }
	    return this;
	};

	function flow(stream) {
	    const state = stream._readableState;
	    debug('flow', state.flowing);
	    while (state.flowing && stream.read() !== null);
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function(stream) {
	    var state = this._readableState;
	    var paused = false;

	    var self = this;
	    stream.on('end', function() {
	        debug('wrapped end');
	        if (state.decoder && !state.ended) {
	            var chunk = state.decoder.end();
	            if (chunk && chunk.length)
	                self.push(chunk);
	        }

	        self.push(null);
	    });

	    stream.on('data', function(chunk) {
	        debug('wrapped data');
	        if (state.decoder)
	            chunk = state.decoder.write(chunk);

	        // don't skip over falsy values in objectMode
	        if (state.objectMode && (chunk === null || chunk === undefined))
	            return;
	        else if (!state.objectMode && (!chunk || !chunk.length))
	            return;

	        var ret = self.push(chunk);
	        if (!ret) {
	            paused = true;
	            stream.pause();
	        }
	    });

	    // proxy all the other methods.
	    // important when wrapping filters and duplexes.
	    for (var i in stream) {
	        if (this[i] === undefined && typeof stream[i] === 'function') {
	            this[i] = function(method) { return function() {
	                return stream[method].apply(stream, arguments);
	            }; }(i);
	        }
	    }

	    // proxy certain important events.
	    const events = ['error', 'close', 'destroy', 'pause', 'resume'];
	    events.forEach(function(ev) {
	        stream.on(ev, self.emit.bind(self, ev));
	    });

	    // when we try to consume some more bytes, simply unpause the
	    // underlying stream.
	    self._read = function(n) {
	        if (paused) {
	            paused = false;
	            stream.resume();
	        }
	    };

	    return self;
	};


	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromList(n, state) {
	    // nothing buffered
	    if (state.length === 0)
	        return null;

	    var ret;
	    if (state.objectMode)
	        ret = state.buffer.shift();
	    else if (!n || n >= state.length) {
	        // read it all, truncate the list
	        if (state.decoder)
	            ret = state.buffer.join('');
	        else if (state.buffer.length === 1)
	            ret = state.buffer.head.data;
	        else
	            ret = state.buffer.concat(state.length);
	        state.buffer.clear();
	    } else {
	        // read part of list
	        ret = fromListPartial(n, state.buffer, state.decoder);
	    }

	    return ret;
	}

	// Extracts only enough buffered data to satisfy the amount requested.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromListPartial(n, list, hasStrings) {
	    var ret;
	    if (n < list.head.data.length) {
	        // slice is the same for buffers and strings
	        ret = list.head.data.slice(0, n);
	        list.head.data = list.head.data.slice(n);
	    } else if (n === list.head.data.length) {
	        // first chunk is a perfect match
	        ret = list.shift();
	    } else {
	        // result spans more than one buffer
	        ret = (hasStrings
	            ? copyFromBufferString(n, list)
	            : copyFromBuffer(n, list));
	    }
	    return ret;
	}

	// Copies a specified amount of characters from the list of buffered data
	// chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBufferString(n, list) {
	    var p = list.head;
	    var c = 1;
	    var ret = p.data;
	    n -= ret.length;
	    while (p = p.start) {
	        const str = p.data;
	        const nb = (n > str.length ? str.length : n);
	        if (nb === str.length)
	            ret += str;
	        else
	            ret += str.slice(0, n);
	        n -= nb;
	        if (n === 0) {
	            if (nb === str.length) {
	                ++c;
	                if (p.start)
	                    list.head = p.start;
	                else
	                    list.head = list.tail = null;
	            } else {
	                list.head = p;
	                p.data = str.slice(nb);
	            }
	            break;
	        }
	        ++c;
	    }
	    list.length -= c;
	    return ret;
	}

	// Copies a specified amount of bytes from the list of buffered data chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBuffer(n, list) {
	    const ret = Buffer.allocUnsafe(n);
	    var p = list.head;
	    var c = 1;
	    p.data.copy(ret);
	    n -= p.data.length;
	    while (p = p.start) {
	        const buf = p.data;
	        const nb = (n > buf.length ? buf.length : n);
	        buf.copy(ret, ret.length - n, 0, nb);
	        n -= nb;
	        if (n === 0) {
	            if (nb === buf.length) {
	                ++c;
	                if (p.start)
	                    list.head = p.start;
	                else
	                    list.head = list.tail = null;
	            } else {
	                list.head = p;
	                p.data = buf.slice(nb);
	            }
	            break;
	        }
	        ++c;
	    }
	    list.length -= c;
	    return ret;
	}

	function endReadable(stream) {
	    var state = stream._readableState;

	    // If we get here before consuming all the bytes, then that is a
	    // bug in node.  Should never happen.
	    if (state.length > 0)
	        throw new Error('"endReadable()" called on non-empty stream');

	    if (!state.endEmitted) {
	        state.ended = true;
	        process.nextTick(endReadableNT, state, stream);
	    }
	}

	function endReadableNT(state, stream) {
	    // Check that we didn't get one last unshift.
	    if (!state.endEmitted && state.length === 0) {
	        state.endEmitted = true;
	        stream.readable = false;
	        stream.emit('end');
	    }
	}


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const Buffer = __webpack_require__(7).Buffer;

	module.exports = BufferList;

	function BufferList() {
	    this.head = null;
	    this.tail = null;
	    this.length = 0;
	}

	BufferList.prototype.push = function(v) {
	    const entry = { data: v, next: null };
	    if (this.length > 0)
	        this.tail.next = entry;
	    else
	        this.head = entry;
	    this.tail = entry;
	    ++this.length;
	};

	BufferList.prototype.unshift = function(v) {
	    const entry = { data: v, next: this.head };
	    if (this.length === 0)
	        this.tail = entry;
	    this.head = entry;
	    ++this.length;
	};

	BufferList.prototype.shift = function() {
	    if (this.length === 0)
	        return;
	    const ret = this.head.data;
	    if (this.length === 1)
	        this.head = this.tail = null;
	    else
	        this.head = this.head.next;
	    --this.length;
	    return ret;
	};

	BufferList.prototype.clear = function() {
	    this.head = this.tail = null;
	    this.length = 0;
	};

	BufferList.prototype.join = function(s) {
	    if (this.length === 0)
	        return '';
	    var p = this.head;
	    var ret = '' + p.data;
	    while (p = p.next)
	        ret += s + p.data;
	    return ret;
	};

	BufferList.prototype.concat = function(n) {
	    if (this.length === 0)
	        return Buffer.alloc(0);
	    if (this.length === 1)
	        return this.head.data;
	    const ret = Buffer.allocUnsafe(n >>> 0);
	    var p = this.head;
	    var i = 0;
	    while (p) {
	        p.data.copy(ret, i);
	        i += p.data.length;
	        p = p.next;
	    }
	    return ret;
	};


/***/ },
/* 29 */
/***/ function(module, exports) {

	module.exports = require("string_decoder");

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	// A bit simpler than readable streams.
	// Implement an async ._write(chunk, encoding, cb), and it'll handle all
	// the drain event emission and buffering.

	'use strict';

	module.exports = Writable;
	Writable.WritableState = WritableState;

	const util = __webpack_require__(6);
	const internalUtil = __webpack_require__(31);
	const Stream = __webpack_require__(26);
	const Buffer = __webpack_require__(7).Buffer;

	util.inherits(Writable, Stream);

	function nop() {}

	function WriteReq(chunk, encoding, cb) {
	    this.chunk = chunk;
	    this.encoding = encoding;
	    this.callback = cb;
	    this.next = null;
	}

	function WritableState(options, stream) {
	    options = options || {};

	    // object stream flag to indicate whether or not this stream
	    // contains buffers or objects.
	    this.objectMode = !!options.objectMode;

	    if (stream instanceof Stream.Duplex)
	        this.objectMode = this.objectMode || !!options.writableObjectMode;

	    // the point at which write() starts returning false
	    // Note: 0 is a valid value, means that we always return false if
	    // the entire buffer is not flushed immediately on write()
	    var hwm = options.highWaterMark;
	    var defaultHwm = this.objectMode ? 16 : 16 * 1024;
	    this.highWaterMark = (hwm || hwm === 0) ? hwm : defaultHwm;

	    // cast to ints.
	    this.highWaterMark = ~~this.highWaterMark;

	    this.needDrain = false;
	    // at the start of calling end()
	    this.ending = false;
	    // when end() has been called, and returned
	    this.ended = false;
	    // when 'finish' is emitted
	    this.finished = false;

	    // should we decode strings into buffers before passing to _write?
	    // this is here so that some node-core streams can optimize string
	    // handling at a lower level.
	    var noDecode = options.decodeStrings === false;
	    this.decodeStrings = !noDecode;

	    // Crypto is kind of old and crusty.  Historically, its default string
	    // encoding is 'binary' so we have to make this configurable.
	    // Everything else in the universe uses 'utf8', though.
	    this.defaultEncoding = options.defaultEncoding || 'utf8';

	    // not an actual buffer we keep track of, but a measurement
	    // of how much we're waiting to get pushed to some underlying
	    // socket or file.
	    this.length = 0;

	    // a flag to see when we're in the middle of a write.
	    this.writing = false;

	    // when true all writes will be buffered until .uncork() call
	    this.corked = 0;

	    // a flag to be able to tell if the onwrite cb is called immediately,
	    // or on a later tick.  We set this to true at first, because any
	    // actions that shouldn't happen until "later" should generally also
	    // not happen before the first write call.
	    this.sync = true;

	    // a flag to know if we're processing previously buffered items, which
	    // may call the _write() callback in the same tick, so that we don't
	    // end up in an overlapped onwrite situation.
	    this.bufferProcessing = false;

	    // the callback that's passed to _write(chunk,cb)
	    this.onwrite = function(er) {
	        onwrite(stream, er);
	    };

	    // the callback that the user supplies to write(chunk,encoding,cb)
	    this.writecb = null;

	    // the amount that is being written when _write is called.
	    this.writelen = 0;

	    this.bufferedRequest = null;
	    this.lastBufferedRequest = null;

	    // number of pending user-supplied write callbacks
	    // this must be 0 before 'finish' can be emitted
	    this.pendingcb = 0;

	    // emit prefinish if the only thing we're waiting for is _write cbs
	    // This is relevant for synchronous Transform streams
	    this.prefinished = false;

	    // True if the error was already emitted and should not be thrown again
	    this.errorEmitted = false;

	    // count buffered requests
	    this.bufferedRequestCount = 0;

	    // allocate the first CorkedRequest, there is always
	    // one allocated and free to use, and we maintain at most two
	    this.corkedRequestsFree = new CorkedRequest(this);
	}

	WritableState.prototype.getBuffer = function writableStateGetBuffer() {
	    var current = this.bufferedRequest;
	    var out = [];
	    while (current) {
	        out.push(current);
	        current = current.start;
	    }
	    return out;
	};

	Object.defineProperty(WritableState.prototype, 'buffer', {
	    get: internalUtil.deprecate(function() {
	        return this.getBuffer();
	    }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' +
	        'instead.')
	});

	function Writable(options) {
	    // Writable ctor is applied to Duplexes, though they're not
	    // instanceof Writable, they're instanceof Readable.
	    if (!(this instanceof Writable) && !(this instanceof Stream.Duplex))
	        return new Writable(options);

	    this._writableState = new WritableState(options, this);

	    // legacy.
	    this.writable = true;

	    if (options) {
	        if (typeof options.write === 'function')
	            this._write = options.write;

	        if (typeof options.writev === 'function')
	            this._writev = options.writev;
	    }

	    Stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function() {
	    this.emit('error', new Error('Cannot pipe, not readable'));
	};


	function writeAfterEnd(stream, cb) {
	    var er = new Error('write after end');
	    // TODO: defer error events consistently everywhere, not just the cb
	    stream.emit('error', er);
	    process.nextTick(cb, er);
	}

	// If we get something that is not a buffer, string, null, or undefined,
	// and we're not in objectMode, then that's an error.
	// Otherwise stream chunks are all considered to be of length=1, and the
	// watermarks determine how many objects to keep in the buffer, rather than
	// how many bytes or characters.
	function validChunk(stream, state, chunk, cb) {
	    var valid = true;
	    var er = false;
	    // Always throw error if a null is written
	    // if we are not in object mode then throw
	    // if it is not a buffer, string, or undefined.
	    if (chunk === null) {
	        er = new TypeError('May not write null values to stream');
	    } else if (!(chunk instanceof Buffer) &&
	        typeof chunk !== 'string' &&
	        chunk !== undefined &&
	        !state.objectMode) {
	        er = new TypeError('Invalid non-string/buffer chunk');
	    }
	    if (er) {
	        stream.emit('error', er);
	        process.nextTick(cb, er);
	        valid = false;
	    }
	    return valid;
	}

	Writable.prototype.write = function(chunk, encoding, cb) {
	    var state = this._writableState;
	    var ret = false;

	    if (typeof encoding === 'function') {
	        cb = encoding;
	        encoding = null;
	    }

	    if (chunk instanceof Buffer)
	        encoding = 'buffer';
	    else if (!encoding)
	        encoding = state.defaultEncoding;

	    if (typeof cb !== 'function')
	        cb = nop;

	    if (state.ended)
	        writeAfterEnd(this, cb);
	    else if (validChunk(this, state, chunk, cb)) {
	        state.pendingcb++;
	        ret = writeOrBuffer(this, state, chunk, encoding, cb);
	    }

	    return ret;
	};

	Writable.prototype.cork = function() {
	    var state = this._writableState;

	    state.corked++;
	};

	Writable.prototype.uncork = function() {
	    var state = this._writableState;

	    if (state.corked) {
	        state.corked--;

	        if (!state.writing &&
	            !state.corked &&
	            !state.finished &&
	            !state.bufferProcessing &&
	            state.bufferedRequest)
	            clearBuffer(this, state);
	    }
	};

	Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
	    // node::ParseEncoding() requires lower case.
	    if (typeof encoding === 'string')
	        encoding = encoding.toLowerCase();
	    if (!Buffer.isEncoding(encoding))
	        throw new TypeError('Unknown encoding: ' + encoding);
	    this._writableState.defaultEncoding = encoding;
	    return this;
	};

	function decodeChunk(state, chunk, encoding) {
	    if (!state.objectMode &&
	        state.decodeStrings !== false &&
	        typeof chunk === 'string') {
	        chunk = Buffer.from(chunk, encoding);
	    }
	    return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, chunk, encoding, cb) {
	    chunk = decodeChunk(state, chunk, encoding);

	    if (chunk instanceof Buffer)
	        encoding = 'buffer';
	    var len = state.objectMode ? 1 : chunk.length;

	    state.length += len;

	    var ret = state.length < state.highWaterMark;
	    // we must ensure that previous needDrain will not be reset to false.
	    if (!ret)
	        state.needDrain = true;

	    if (state.writing || state.corked) {
	        var last = state.lastBufferedRequest;
	        state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
	        if (last) {
	            last.next = state.lastBufferedRequest;
	        } else {
	            state.bufferedRequest = state.lastBufferedRequest;
	        }
	        state.bufferedRequestCount += 1;
	    } else {
	        doWrite(stream, state, false, len, chunk, encoding, cb);
	    }

	    return ret;
	}

	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	    state.writelen = len;
	    state.writecb = cb;
	    state.writing = true;
	    state.sync = true;
	    if (writev)
	        stream._writev(chunk, state.onwrite);
	    else
	        stream._write(chunk, encoding, state.onwrite);
	    state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
	    --state.pendingcb;
	    if (sync)
	        process.nextTick(cb, er);
	    else
	        cb(er);

	    stream._writableState.errorEmitted = true;
	    stream.emit('error', er);
	}

	function onwriteStateUpdate(state) {
	    state.writing = false;
	    state.writecb = null;
	    state.length -= state.writelen;
	    state.writelen = 0;
	}

	function onwrite(stream, er) {
	    var state = stream._writableState;
	    var sync = state.sync;
	    var cb = state.writecb;

	    onwriteStateUpdate(state);

	    if (er)
	        onwriteError(stream, state, sync, er, cb);
	    else {
	        // Check if we're actually ready to finish, but don't emit yet
	        var finished = needFinish(state);

	        if (!finished &&
	            !state.corked &&
	            !state.bufferProcessing &&
	            state.bufferedRequest) {
	            clearBuffer(stream, state);
	        }

	        if (sync) {
	            process.nextTick(afterWrite, stream, state, finished, cb);
	        } else {
	            afterWrite(stream, state, finished, cb);
	        }
	    }
	}

	function afterWrite(stream, state, finished, cb) {
	    if (!finished)
	        onwriteDrain(stream, state);
	    state.pendingcb--;
	    cb();
	    finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	    if (state.length === 0 && state.needDrain) {
	        state.needDrain = false;
	        stream.emit('drain');
	    }
	}

	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	    state.bufferProcessing = true;
	    var entry = state.bufferedRequest;

	    if (stream._writev && entry && entry.next) {
	        // Fast case, write everything using _writev()
	        var l = state.bufferedRequestCount;
	        var buffer = new Array(l);
	        var holder = state.corkedRequestsFree;
	        holder.entry = entry;

	        var count = 0;
	        while (entry) {
	            buffer[count] = entry;
	            entry = entry.next;
	            count += 1;
	        }

	        doWrite(stream, state, true, state.length, buffer, '', holder.finish);

	        // doWrite is almost always async, defer these to save a bit of time
	        // as the hot path ends with doWrite
	        state.pendingcb++;
	        state.lastBufferedRequest = null;
	        if (holder.next) {
	            state.corkedRequestsFree = holder.next;
	            holder.next = null;
	        } else {
	            state.corkedRequestsFree = new CorkedRequest(state);
	        }
	    } else {
	        // Slow case, write chunks one-by-one
	        while (entry) {
	            var chunk = entry.chunk;
	            var encoding = entry.encoding;
	            var cb = entry.callback;
	            var len = state.objectMode ? 1 : chunk.length;

	            doWrite(stream, state, false, len, chunk, encoding, cb);
	            entry = entry.next;
	            // if we didn't call the onwrite immediately, then
	            // it means that we need to wait until it does.
	            // also, that means that the chunk and cb are currently
	            // being processed, so move the buffer counter past them.
	            if (state.writing) {
	                break;
	            }
	        }

	        if (entry === null)
	            state.lastBufferedRequest = null;
	    }

	    state.bufferedRequestCount = 0;
	    state.bufferedRequest = entry;
	    state.bufferProcessing = false;
	}

	Writable.prototype._write = function(chunk, encoding, cb) {
	    cb(new Error('not implemented'));
	};

	Writable.prototype._writev = null;

	Writable.prototype.end = function(chunk, encoding, cb) {
	    var state = this._writableState;

	    if (typeof chunk === 'function') {
	        cb = chunk;
	        chunk = null;
	        encoding = null;
	    } else if (typeof encoding === 'function') {
	        cb = encoding;
	        encoding = null;
	    }

	    if (chunk !== null && chunk !== undefined)
	        this.write(chunk, encoding);

	    // .end() fully uncorks
	    if (state.corked) {
	        state.corked = 1;
	        this.uncork();
	    }

	    // ignore unnecessary end() calls.
	    if (!state.ending && !state.finished)
	        endWritable(this, state, cb);
	};


	function needFinish(state) {
	    return (state.ending &&
	    state.length === 0 &&
	    state.bufferedRequest === null &&
	    !state.finished &&
	    !state.writing);
	}

	function prefinish(stream, state) {
	    if (!state.prefinished) {
	        state.prefinished = true;
	        stream.emit('prefinish');
	    }
	}

	function finishMaybe(stream, state) {
	    var need = needFinish(state);
	    if (need) {
	        if (state.pendingcb === 0) {
	            prefinish(stream, state);
	            state.finished = true;
	            stream.emit('finish');
	        } else {
	            prefinish(stream, state);
	        }
	    }
	    return need;
	}

	function endWritable(stream, state, cb) {
	    state.ending = true;
	    finishMaybe(stream, state);
	    if (cb) {
	        if (state.finished)
	            process.nextTick(cb);
	        else
	            stream.once('finish', cb);
	    }
	    state.ended = true;
	    stream.writable = false;
	}

	// It seems a linked list but it is not
	// there will be only 2 of these for each stream
	function CorkedRequest(state) {
	    this.next = null;
	    this.entry = null;

	    this.finish = function (err) {
	        var entry = this.entry;
	        this.entry = null;
	        while (entry) {
	            var cb = entry.callback;
	            state.pendingcb--;
	            cb(err);
	            entry = entry.next;
	        }
	        if (state.corkedRequestsFree) {
	            state.corkedRequestsFree.next = this;
	        } else {
	            state.corkedRequestsFree = this;
	        }
	    }.bind(this);
	}


/***/ },
/* 31 */
/***/ function(module, exports) {

	'use strict';

	// var binding = process.binding('util');
	var binding = {};
	var prefix = '(' + process.release.name + ':' + process.pid + ') ';

	var kArrowMessagePrivateSymbolIndex = binding['arrow_message_private_symbol'];
	var kDecoratedPrivateSymbolIndex = binding['decorated_private_symbol'];

	exports.getHiddenValue = binding.getHiddenValue;
	exports.setHiddenValue = binding.setHiddenValue;

	// All the internal deprecations have to use this function only, as this will
	// prepend the prefix to the actual message.
	exports.deprecate = function(fn, msg) {
	    return exports._deprecate(fn, msg);
	};

	// All the internal deprecations have to use this function only, as this will
	// prepend the prefix to the actual message.
	exports.printDeprecationMessage = function(msg, warned, ctor) {
	    if (warned || process.noDeprecation)
	        return true;
	    process.emitWarning(msg, 'DeprecationWarning',
	        ctor || exports.printDeprecationMessage);
	    return true;
	};

	exports.error = function(msg) {
	    var fmt = prefix + msg;
	    if (arguments.length > 1) {
	        var args = new Array(arguments.length);
	        args[0] = fmt;
	        for (var i = 1; i < arguments.length; ++i)
	            args[i] = arguments[i];
	        console.error.apply(console, args);
	    } else {
	        console.error(fmt);
	    }
	};

	exports.trace = function(msg) {
	    console.trace(prefix + msg);
	};

	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	exports._deprecate = function(fn, msg) {
	    // Allow for deprecating things in the process of starting up.
	    if (global.process === undefined) {
	        return function() {
	            return exports._deprecate(fn, msg).apply(this, arguments);
	        };
	    }

	    if (process.noDeprecation === true) {
	        return fn;
	    }

	    var warned = false;
	    function deprecated() {
	        warned = exports.printDeprecationMessage(msg, warned, deprecated);
	        return fn.apply(this, arguments);
	    }

	    return deprecated;
	};

	exports.decorateErrorStack = function decorateErrorStack(err) {
	    if (!(exports.isError(err) && err.stack) ||
	        exports.getHiddenValue(err, kDecoratedPrivateSymbolIndex) === true)
	        return;

	    var arrow = exports.getHiddenValue(err, kArrowMessagePrivateSymbolIndex);

	    if (arrow) {
	        err.stack = arrow + err.stack;
	        exports.setHiddenValue(err, kDecoratedPrivateSymbolIndex, true);
	    }
	};

	exports.isError = function isError(e) {
	    return exports.objectToString(e) === '[object Error]' || e instanceof Error;
	};

	exports.objectToString = function objectToString(o) {
	    return Object.prototype.toString.call(o);
	};

	var noCrypto = !process.versions.openssl;
	exports.assertCrypto = function(exports) {
	    if (noCrypto)
	        throw new Error('Node.js is not compiled with openssl crypto support');
	};


/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	// a duplex stream is just a stream that is both readable and writable.
	// Since JS doesn't have multiple prototypal inheritance, this class
	// prototypally inherits from Readable, and then parasitically from
	// Writable.

	'use strict';

	module.exports = Duplex;

	const util = __webpack_require__(6);
	const Readable = __webpack_require__(27);
	const Writable = __webpack_require__(30);

	util.inherits(Duplex, Readable);

	var keys = Object.keys(Writable.prototype);
	for (var v = 0; v < keys.length; v++) {
	    var method = keys[v];
	    if (!Duplex.prototype[method])
	        Duplex.prototype[method] = Writable.prototype[method];
	}

	function Duplex(options) {
	    if (!(this instanceof Duplex))
	        return new Duplex(options);

	    Readable.call(this, options);
	    Writable.call(this, options);

	    if (options && options.readable === false)
	        this.readable = false;

	    if (options && options.writable === false)
	        this.writable = false;

	    this.allowHalfOpen = true;
	    if (options && options.allowHalfOpen === false)
	        this.allowHalfOpen = false;

	    this.once('end', onend);
	}

	// the no-half-open enforcer
	function onend() {
	    // if we allow half-open state, or if the writable side ended,
	    // then we're ok.
	    if (this.allowHalfOpen || this._writableState.ended)
	        return;

	    // no more data can be written.
	    // But allow more writes to happen in this tick.
	    process.nextTick(onEndNT, this);
	}

	function onEndNT(self) {
	    self.end();
	}


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	// a transform stream is a readable/writable stream where you do
	// something with the data.  Sometimes it's called a "filter",
	// but that's not a great name for it, since that implies a thing where
	// some bits pass through, and others are simply ignored.  (That would
	// be a valid example of a transform, of course.)
	//
	// While the output is causally related to the input, it's not a
	// necessarily symmetric or synchronous transformation.  For example,
	// a zlib stream might take multiple plain-text writes(), and then
	// emit a single compressed chunk some time in the future.
	//
	// Here's how this works:
	//
	// The Transform stream has all the aspects of the readable and writable
	// stream classes.  When you write(chunk), that calls _write(chunk,cb)
	// internally, and returns false if there's a lot of pending writes
	// buffered up.  When you call read(), that calls _read(n) until
	// there's enough pending readable data buffered up.
	//
	// In a transform stream, the written data is placed in a buffer.  When
	// _read(n) is called, it transforms the queued up data, calling the
	// buffered _write cb's as it consumes chunks.  If consuming a single
	// written chunk would result in multiple output chunks, then the first
	// outputted bit calls the readcb, and subsequent chunks just go into
	// the read buffer, and will cause it to emit 'readable' if necessary.
	//
	// This way, back-pressure is actually determined by the reading side,
	// since _read has to be called to start processing a new chunk.  However,
	// a pathological inflate type of transform can cause excessive buffering
	// here.  For example, imagine a stream where every byte of input is
	// interpreted as an integer from 0-255, and then results in that many
	// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
	// 1kb of data being output.  In this case, you could write a very small
	// amount of input, and end up with a very large amount of output.  In
	// such a pathological inflating mechanism, there'd be no way to tell
	// the system to stop doing the transform.  A single 4MB write could
	// cause the system to run out of memory.
	//
	// However, even in such a pathological case, only a single written chunk
	// would be consumed, and then the rest would wait (un-transformed) until
	// the results of the previous transformed chunk were consumed.

	'use strict';

	module.exports = Transform;

	const Duplex = __webpack_require__(32);
	const util = __webpack_require__(6);
	util.inherits(Transform, Duplex);


	function TransformState(stream) {
	    this.afterTransform = function(er, data) {
	        return afterTransform(stream, er, data);
	    };

	    this.needTransform = false;
	    this.transforming = false;
	    this.writecb = null;
	    this.writechunk = null;
	    this.writeencoding = null;
	}

	function afterTransform(stream, er, data) {
	    var ts = stream._transformState;
	    ts.transforming = false;

	    var cb = ts.writecb;

	    if (!cb)
	        return stream.emit('error', new Error('no writecb in Transform class'));

	    ts.writechunk = null;
	    ts.writecb = null;

	    if (data !== null && data !== undefined)
	        stream.push(data);

	    cb(er);

	    var rs = stream._readableState;
	    rs.reading = false;
	    if (rs.needReadable || rs.length < rs.highWaterMark) {
	        stream._read(rs.highWaterMark);
	    }
	}


	function Transform(options) {
	    if (!(this instanceof Transform))
	        return new Transform(options);

	    Duplex.call(this, options);

	    this._transformState = new TransformState(this);

	    // when the writable side finishes, then flush out anything remaining.
	    var stream = this;

	    // start out asking for a readable event once data is transformed.
	    this._readableState.needReadable = true;

	    // we have implemented the _read method, and done the other things
	    // that Readable wants before the first _read call, so unset the
	    // sync guard flag.
	    this._readableState.sync = false;

	    if (options) {
	        if (typeof options.transform === 'function')
	            this._transform = options.transform;

	        if (typeof options.flush === 'function')
	            this._flush = options.flush;
	    }

	    this.once('prefinish', function() {
	        if (typeof this._flush === 'function')
	            this._flush(function(er, data) {
	                done(stream, er, data);
	            });
	        else
	            done(stream);
	    });
	}

	Transform.prototype.push = function(chunk, encoding) {
	    this._transformState.needTransform = false;
	    return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function(chunk, encoding, cb) {
	    throw new Error('Not implemented');
	};

	Transform.prototype._write = function(chunk, encoding, cb) {
	    var ts = this._transformState;
	    ts.writecb = cb;
	    ts.writechunk = chunk;
	    ts.writeencoding = encoding;
	    if (!ts.transforming) {
	        var rs = this._readableState;
	        if (ts.needTransform ||
	            rs.needReadable ||
	            rs.length < rs.highWaterMark)
	            this._read(rs.highWaterMark);
	    }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function(n) {
	    var ts = this._transformState;

	    if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
	        ts.transforming = true;
	        this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	    } else {
	        // mark that we need a transform, so that any data that comes in
	        // will get processed, now that we've asked for it.
	        ts.needTransform = true;
	    }
	};


	function done(stream, er, data) {
	    if (er)
	        return stream.emit('error', er);

	    if (data !== null && data !== undefined)
	        stream.push(data);

	    // if there's nothing in the write buffer, then that means
	    // that nothing more will ever be provided
	    var ws = stream._writableState;
	    var ts = stream._transformState;

	    if (ws.length)
	        throw new Error('Calling transform done when ws.length != 0');

	    if (ts.transforming)
	        throw new Error('Calling transform done when still transforming');

	    return stream.push(null);
	}


/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	// a passthrough stream.
	// basically just the most minimal sort of Transform stream.
	// Every written chunk gets output as-is.

	'use strict';

	module.exports = PassThrough;

	const Transform = __webpack_require__(33);
	const util = __webpack_require__(6);
	util.inherits(PassThrough, Transform);

	function PassThrough(options) {
	    if (!(this instanceof PassThrough))
	        return new PassThrough(options);

	    Transform.call(this, options);
	}

	PassThrough.prototype._transform = function(chunk, encoding, cb) {
	    cb(null, chunk);
	};


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var util = __webpack_require__(6);


	function Console(stdout, stderr) {

	    if (!(this instanceof Console)) {
	        return new Console(stdout, stderr);
	    }
	    if (!stdout || typeof stdout.write !== 'function') {
	        throw new TypeError('Console expects a writable stream instance');
	    }
	    if (!stderr) {
	        stderr = stdout;
	    } else if (typeof stderr.write !== 'function') {
	        throw new TypeError('Console expects writable stream instances');
	    }

	    // if(__DEBUG__) {
	    //     this.isFULLjs = true;
	    // }

	    // var prop = {
	    //     writable: true,
	    //     enumerable: false,
	    //     configurable: true
	    // };
	    // prop.value = stdout;
	    // Object.defineProperty(this, '_stdout', prop);
	    this._stdout = stdout;

	    // prop.value = stderr;
	    // Object.defineProperty(this, '_stderr', prop);
	    this._stderr = stderr;

	    // prop.value = new Map();
	    // Object.defineProperty(this, '_times', prop);
	    this._times = {};

	    // bind the prototype functions to this Console instance
	    for(var k in Console.prototype) this[k] = this[k].bind(this);
	}


	// As of v8 5.0.71.32, the combination of rest param, template string
	// and .apply(null, args) benchmarks consistently faster than using
	// the spread operator when calling util.format.
	Console.prototype.log = function() {
	    this._stdout.write(util.format.apply(null, arguments) + '\n');
	};


	Console.prototype.info = Console.prototype.log;


	Console.prototype.warn = function() {
	    this._stderr.write(util.format.apply(null, arguments) + '\n');
	};


	Console.prototype.error = Console.prototype.warn;


	Console.prototype.dir = function(object, options) {
	    options = util.extend({customInspect: false}, options);
	    this._stdout.write(util.inspect(object, options) + '\n');
	};


	Console.prototype.time = function(label) {
	    this._times[label] = process.hrtime();
	};


	Console.prototype.timeEnd = function(label) {
	    // const time = this._times.get(label);
	    const time = this._times[label];
	    if (!time) {
	        process.emitWarning("No such label '" + label + "' for console.timeEnd()");
	        return;
	    }
	    const duration = process.hrtime(time);
	    const ms = duration[0] * 1000 + duration[1] / 1e6;
	    this.log('%s: %sms', label, ms.toFixed(3));
	    delete this._times[label];
	};


	Console.prototype.trace = function trace() {
	    // TODO probably can to do this better with V8's debug object once that is
	    // exposed.
	    var err = new Error();
	    err.name = 'Trace';
	    err.message = util.format.apply(null, arguments);

	    // TODO: is `Error.captureStackTrace` specific to V8?
	    if(Error.captureStackTrace)
	        Error.captureStackTrace(err, trace);

	    this.error(err.stack);
	};


	Console.prototype.assert = function(expression) {
	    if (!expression) {
	        __webpack_require__(36).ok(false, util.format.apply(null, arguments));
	    }
	};


	module.exports = new Console(process.stdout, process.stderr);
	module.exports.Console = Console;


/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
	//
	// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
	//
	// Originally from narwhal.js (http://narwhaljs.org)
	// Copyright (c) 2009 Thomas Robinson <280north.com>
	//
	// Permission is hereby granted, free of charge, to any person obtaining a copy
	// of this software and associated documentation files (the 'Software'), to
	// deal in the Software without restriction, including without limitation the
	// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
	// sell copies of the Software, and to permit persons to whom the Software is
	// furnished to do so, subject to the following conditions:
	//
	// The above copyright notice and this permission notice shall be included in
	// all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
	// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
	// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

	'use strict';

	// UTILITY
	// const compare = process.binding('buffer').compare;
	const util = __webpack_require__(6);
	const Buffer = __webpack_require__(7).Buffer;
	const pToString = function(obj) { return Object.prototype.toString.call(obj); };

	// 1. The assert module provides functions that throw
	// AssertionError's when particular conditions are not met. The
	// assert module must conform to the following interface.

	const assert = module.exports = ok;

	// 2. The AssertionError is defined in assert.
	// new assert.AssertionError({ message: message,
	//                             actual: actual,
	//                             expected: expected })

	assert.AssertionError = function AssertionError(options) {
	    this.name = 'AssertionError';
	    this.actual = options.actual;
	    this.expected = options.expected;
	    this.operator = options.operator;
	    if (options.message) {
	        this.message = options.message;
	        this.generatedMessage = false;
	    } else {
	        this.message = getMessage(this);
	        this.generatedMessage = true;
	    }
	    var stackStartFunction = options.stackStartFunction || fail;
	    Error.captureStackTrace(this, stackStartFunction);
	};

	// assert.AssertionError instanceof Error
	util.inherits(assert.AssertionError, Error);

	function truncate(s, n) {
	    if (typeof s === 'string') {
	        return s.length < n ? s : s.slice(0, n);
	    } else {
	        return s;
	    }
	}

	function getMessage(self) {
	    return truncate(util.inspect(self.actual), 128) + ' ' +
	        self.operator + ' ' +
	        truncate(util.inspect(self.expected), 128);
	}

	// At present only the three keys mentioned above are used and
	// understood by the spec. Implementations or sub modules can pass
	// other keys to the AssertionError's constructor - they will be
	// ignored.

	// 3. All of the following functions must throw an AssertionError
	// when a corresponding condition is not met, with a message that
	// may be undefined if not provided.  All assertion methods provide
	// both the actual and expected values to the assertion error for
	// display purposes.

	function fail(actual, expected, message, operator, stackStartFunction) {
	    throw new assert.AssertionError({
	        message: message,
	        actual: actual,
	        expected: expected,
	        operator: operator,
	        stackStartFunction: stackStartFunction
	    });
	}

	// EXTENSION! allows for well behaved errors defined elsewhere.
	assert.fail = fail;

	// 4. Pure assertion tests whether a value is truthy, as determined
	// by !!guard.
	// assert.ok(guard, message_opt);
	// This statement is equivalent to assert.equal(true, !!guard,
	// message_opt);. To test strictly for the value true, use
	// assert.strictEqual(true, guard, message_opt);.

	function ok(value, message) {
	    if (!value) fail(value, true, message, '==', assert.ok);
	}
	assert.ok = ok;

	// 5. The equality assertion tests shallow, coercive equality with
	// ==.
	// assert.equal(actual, expected, message_opt);

	assert.equal = function equal(actual, expected, message) {
	    if (actual != expected) fail(actual, expected, message, '==', assert.equal);
	};

	// 6. The non-equality assertion tests for whether two objects are not equal
	// with != assert.notEqual(actual, expected, message_opt);

	assert.notEqual = function notEqual(actual, expected, message) {
	    if (actual == expected) {
	        fail(actual, expected, message, '!=', assert.notEqual);
	    }
	};

	// 7. The equivalence assertion tests a deep equality relation.
	// assert.deepEqual(actual, expected, message_opt);

	assert.deepEqual = function deepEqual(actual, expected, message) {
	    if (!_deepEqual(actual, expected, false)) {
	        fail(actual, expected, message, 'deepEqual', assert.deepEqual);
	    }
	};

	assert.deepStrictEqual = function deepStrictEqual(actual, expected, message) {
	    if (!_deepEqual(actual, expected, true)) {
	        fail(actual, expected, message, 'deepStrictEqual', assert.deepStrictEqual);
	    }
	};

	function _deepEqual(actual, expected, strict, memos) {
	    // 7.1. All identical values are equivalent, as determined by ===.
	    if (actual === expected) {
	        return true;
	    } else if (actual instanceof Buffer && expected instanceof Buffer) {
	        return Buffer.compare(actual, expected) === 0;

	        // 7.2. If the expected value is a Date object, the actual value is
	        // equivalent if it is also a Date object that refers to the same time.
	    } else if (util.isDate(actual) && util.isDate(expected)) {
	        return actual.getTime() === expected.getTime();

	        // 7.3 If the expected value is a RegExp object, the actual value is
	        // equivalent if it is also a RegExp object with the same source and
	        // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
	    } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
	        return actual.source === expected.source &&
	            actual.global === expected.global &&
	            actual.multiline === expected.multiline &&
	            actual.lastIndex === expected.lastIndex &&
	            actual.ignoreCase === expected.ignoreCase;

	        // 7.4. Other pairs that do not both pass typeof value == 'object',
	        // equivalence is determined by ==.
	    } else if ((actual === null || typeof actual !== 'object') &&
	        (expected === null || typeof expected !== 'object')) {
	        return strict ? actual === expected : actual == expected;

	        // If both values are instances of typed arrays, wrap their underlying
	        // ArrayBuffers in a Buffer each to increase performance
	        // This optimization requires the arrays to have the same type as checked by
	        // Object.prototype.toString (aka pToString). Never perform binary
	        // comparisons for Float*Arrays, though, since e.g. +0 === -0 but their
	        // bit patterns are not identical.
	    } else if (ArrayBuffer.isView(actual) && ArrayBuffer.isView(expected) &&
	        pToString(actual) === pToString(expected) &&
	        !(actual instanceof Float32Array ||
	        actual instanceof Float64Array)) {
	        return Buffer.compare(Buffer.from(actual.buffer),
	                Buffer.from(expected.buffer)) === 0;

	        // 7.5 For all other Object pairs, including Array objects, equivalence is
	        // determined by having the same number of owned properties (as verified
	        // with Object.prototype.hasOwnProperty.call), the same set of keys
	        // (although not necessarily the same order), equivalent values for every
	        // corresponding key, and an identical 'prototype' property. Note: this
	        // accounts for both named and indexed properties on Arrays.
	    } else {
	        memos = memos || {actual: [], expected: []};

	        const actualIndex = memos.actual.indexOf(actual);
	        if (actualIndex !== -1) {
	            if (actualIndex === memos.expected.indexOf(expected)) {
	                return true;
	            }
	        }

	        memos.actual.push(actual);
	        memos.expected.push(expected);

	        return objEquiv(actual, expected, strict, memos);
	    }
	}

	function isArguments(object) {
	    return Object.prototype.toString.call(object) == '[object Arguments]';
	}

	function objEquiv(a, b, strict, actualVisitedObjects) {
	    if (a === null || a === undefined || b === null || b === undefined)
	        return false;
	    // if one is a primitive, the other must be same
	    if (util.isPrimitive(a) || util.isPrimitive(b))
	        return a === b;
	    if (strict && Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
	        return false;
	    const aIsArgs = isArguments(a);
	    const bIsArgs = isArguments(b);
	    if ((aIsArgs && !bIsArgs) || (!aIsArgs && bIsArgs))
	        return false;
	    const ka = Object.keys(a);
	    const kb = Object.keys(b);
	    var key, i;
	    // having the same number of owned properties (keys incorporates
	    // hasOwnProperty)
	    if (ka.length !== kb.length)
	        return false;
	    //the same set of keys (although not necessarily the same order),
	    ka.sort();
	    kb.sort();
	    //~~~cheap key test
	    for (i = ka.length - 1; i >= 0; i--) {
	        if (ka[i] !== kb[i])
	            return false;
	    }
	    //equivalent values for every corresponding key, and
	    //~~~possibly expensive deep test
	    for (i = ka.length - 1; i >= 0; i--) {
	        key = ka[i];
	        if (!_deepEqual(a[key], b[key], strict, actualVisitedObjects))
	            return false;
	    }
	    return true;
	}

	// 8. The non-equivalence assertion tests for any deep inequality.
	// assert.notDeepEqual(actual, expected, message_opt);

	assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
	    if (_deepEqual(actual, expected, false)) {
	        fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
	    }
	};

	assert.notDeepStrictEqual = notDeepStrictEqual;
	function notDeepStrictEqual(actual, expected, message) {
	    if (_deepEqual(actual, expected, true)) {
	        fail(actual, expected, message, 'notDeepStrictEqual', notDeepStrictEqual);
	    }
	}


	// 9. The strict equality assertion tests strict equality, as determined by ===.
	// assert.strictEqual(actual, expected, message_opt);

	assert.strictEqual = function strictEqual(actual, expected, message) {
	    if (actual !== expected) {
	        fail(actual, expected, message, '===', assert.strictEqual);
	    }
	};

	// 10. The strict non-equality assertion tests for strict inequality, as
	// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

	assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
	    if (actual === expected) {
	        fail(actual, expected, message, '!==', assert.notStrictEqual);
	    }
	};

	function expectedException(actual, expected) {
	    if (!actual || !expected) {
	        return false;
	    }

	    if (Object.prototype.toString.call(expected) == '[object RegExp]') {
	        return expected.test(actual);
	    }

	    try {
	        if (actual instanceof expected) {
	            return true;
	        }
	    } catch (e) {
	        // Ignore.  The instanceof check doesn't work for arrow functions.
	    }

	    if (Error.isPrototypeOf(expected)) {
	        return false;
	    }

	    return expected.call({}, actual) === true;
	}

	function _tryBlock(block) {
	    var error;
	    try {
	        block();
	    } catch (e) {
	        error = e;
	    }
	    return error;
	}

	function _throws(shouldThrow, block, expected, message) {
	    var actual;

	    if (typeof block !== 'function') {
	        throw new TypeError('"block" argument must be a function');
	    }

	    if (typeof expected === 'string') {
	        message = expected;
	        expected = null;
	    }

	    actual = _tryBlock(block);

	    message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
	        (message ? ' ' + message : '.');

	    if (shouldThrow && !actual) {
	        fail(actual, expected, 'Missing expected exception' + message);
	    }

	    const userProvidedMessage = typeof message === 'string';
	    const isUnwantedException = !shouldThrow && util.isError(actual);
	    const isUnexpectedException = !shouldThrow && actual && !expected;

	    if ((isUnwantedException &&
	        userProvidedMessage &&
	        expectedException(actual, expected)) ||
	        isUnexpectedException) {
	        fail(actual, expected, 'Got unwanted exception' + message);
	    }

	    if ((shouldThrow && actual && expected &&
	        !expectedException(actual, expected)) || (!shouldThrow && actual)) {
	        throw actual;
	    }
	}

	// 11. Expected to throw an error:
	// assert.throws(block, Error_opt, message_opt);

	assert.throws = function(block, /*optional*/error, /*optional*/message) {
	    _throws(true, block, error, message);
	};

	// EXTENSION! This is annoying to write outside this module.
	assert.doesNotThrow = function(block, /*optional*/error, /*optional*/message) {
	    _throws(false, block, error, message);
	};

	assert.ifError = function(err) { if (err) throw err; };


/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var eloop_1 = __webpack_require__(20);
	var TIMEOUT_MAX = 2147483647;
	var Timeout = (function () {
	    function Timeout(callback, args) {
	        this.task = new eloop_1.Task(callback, args);
	    }
	    Timeout.prototype.ref = function () {
	        this.task.ref();
	    };
	    Timeout.prototype.unref = function () {
	        this.task.unref();
	    };
	    return Timeout;
	}());
	exports.Timeout = Timeout;
	var Immediate = (function (_super) {
	    __extends(Immediate, _super);
	    function Immediate() {
	        _super.apply(this, arguments);
	    }
	    return Immediate;
	}(eloop_1.Task));
	exports.Immediate = Immediate;
	function setTimeout(callback, after, arg1, arg2, arg3) {
	    if (typeof callback !== 'function') {
	        throw new TypeError('"callback" argument must be a function');
	    }
	    after *= 1;
	    if (!(after >= 1 && after <= TIMEOUT_MAX)) {
	        after = 1;
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
	exports.setTimeout = setTimeout;
	function clearTimeout(timer) {
	    timer.task.cancel();
	}
	exports.clearTimeout = clearTimeout;
	function setInterval(callback, repeat) {
	    var args = arguments;
	    var timer = setTimeout.apply(null, args);
	    var wrapper = function () {
	        var new_timer = setTimeout.apply(null, args);
	        timer.task = new_timer.task;
	        timer.task.callback = wrapper;
	        callback.apply(null, arguments);
	    };
	    timer.task.callback = wrapper;
	    return timer;
	}
	exports.setInterval = setInterval;
	function clearInterval(timer) {
	    timer.task.cancel();
	}
	exports.clearInterval = clearInterval;
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
	function setImmediate(callback, arg1, arg2, arg3) {
	    var timer = createImm(callback, arg1, arg2, arg3);
	    process.loop.insert(timer);
	    return timer;
	}
	exports.setImmediate = setImmediate;
	function clearImmediate(immediate) {
	    if (!immediate)
	        return;
	    immediate.cancel();
	}
	exports.clearImmediate = clearImmediate;
	function setIOPoll(callback, arg1, arg2, arg3) {
	    var timer = createImm(callback, arg1, arg2, arg3);
	    timer.delay = -1;
	    process.loop.insert(timer);
	    return timer;
	}
	exports.setIOPoll = setIOPoll;
	function clearIOPoll(poll) {
	    if (poll)
	        poll.cancel();
	}
	exports.clearIOPoll = clearIOPoll;
	function setMicroTask(callback) {
	    var args;
	    if (arguments.length > 1) {
	        args = new Array(arguments.length - 1);
	        for (var i = 1; i < arguments.length; i++)
	            args[i - 1] = arguments[i];
	    }
	    process.loop.insertMicrotask(new eloop_1.MicroTask(callback, args));
	}
	exports.setMicroTask = setMicroTask;


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	if (!process.asyscall) {
	    if (process.hasBinaryUtils && (true)) {
	        var Asyscall = __webpack_require__(39).Asyscall;
	        var asyscall = new Asyscall;
	        asyscall.build();
	        process.asyscall = asyscall.exec.bind(asyscall);
	        process.asyscall64 = asyscall.exec64.bind(asyscall);
	    }
	    else {
	        process.asyscall = function () {
	            var len = arguments.length - 1;
	            var args = new Array(len);
	            for (var i = 0; i < len; i++)
	                args[i] = arguments[i];
	            var res = process.syscall.apply(null, args);
	            arguments[len](res);
	        };
	        process.asyscall64 = function () {
	            var len = arguments.length - 1;
	            var args = new Array(len);
	            for (var i = 0; i < len; i++)
	                args[i] = arguments[i];
	            var res = process.syscall64.apply(null, args);
	            arguments[len](res);
	        };
	    }
	}


/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var static_buffer_1 = __webpack_require__(13);
	function link(curr, next) {
	    var _a = next.getAddress(), lo = _a[0], hi = _a[1];
	    curr.writeInt32LE(lo, 72 - 8);
	    curr.writeInt32LE(hi, 72 - 8 + 4);
	}
	var Asyscall = (function () {
	    function Asyscall() {
	        this.code = null;
	        this.curr = null;
	        this.next = null;
	        this.usedFirst = null;
	        this.usedLast = null;
	    }
	    Asyscall.prototype.build = function () {
	        var bin = __webpack_require__(40);
	        this.code = static_buffer_1.StaticBuffer.alloc(bin, 'rwe');
	        this.curr = this.code.slice(this.code.length - 72);
	        this.curr.writeInt32LE(0, 0);
	        this.curr.writeInt32LE(0, 4);
	        this.next = this.newBlock();
	        link(this.curr, this.next);
	        this.code.call();
	    };
	    Asyscall.prototype.recycleBlock = function (block) {
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
	        if (block && (block.readInt32LE(4) === 2)) {
	            this.usedFirst = block._next;
	        }
	        block = static_buffer_1.StaticBuffer.alloc(72, 'rw');
	        block.writeInt32LE(0, 0);
	        block.writeInt32LE(0, 4);
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
	        if (arg instanceof Buffer) {
	            arg = arg.getAddress();
	        }
	        if (typeof arg === 'number') {
	            curr.writeInt32LE(arg, slot * 8);
	            curr.writeInt32LE(0, slot * 8 + 4);
	        }
	        else if (arg instanceof Array) {
	            curr.writeInt32LE(arg[0], slot * 8);
	            curr.writeInt32LE(arg[1], slot * 8 + 4);
	        }
	    };
	    Asyscall.prototype.fillBlock = function () {
	        var _a = this, curr = _a.curr, next = _a.next;
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
	        for (var j = arguments.length; j < 7; j++) {
	            curr.writeInt32LE(0, (j + 1) * 8);
	            curr.writeInt32LE(0, (j + 1) * 8 + 4);
	        }
	        curr[0] = 1;
	        return callback;
	    };
	    Asyscall.prototype.pollBlock = function (callback, is64) {
	        var _this = this;
	        var curr = this.curr;
	        var poll = function () {
	            var lock = curr[0];
	            if (lock === 3) {
	                if (is64) {
	                    callback([
	                        curr.readInt32LE(8 * 7),
	                        curr.readInt32LE(8 * 7 + 4)]);
	                }
	                else {
	                    callback(curr.readInt32LE(8 * 7));
	                }
	                _this.recycleBlock(curr);
	            }
	            else
	                setIOPoll(poll);
	        };
	        setIOPoll(poll);
	    };
	    Asyscall.prototype.exec = function () {
	        var block = this.newBlock();
	        link(this.next, block);
	        var callback = this.fillBlock.apply(this, arguments);
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
	    Asyscall.prototype.stop = function () {
	        this.curr.writeInt32LE(4, 0);
	        this.next.writeInt32LE(4, 0);
	        this.code.free();
	    };
	    Asyscall._id = 0;
	    return Asyscall;
	}());
	exports.Asyscall = Asyscall;


/***/ },
/* 40 */
/***/ function(module, exports) {

	module.exports = [72,199,199,1,0,0,0,232,13,0,0,0,72,199,199,2,0,0,0,232,1,0,0,0,195,72,137,248,72,199,193,40,0,0,0,72,247,225,72,141,53,179,0,0,0,72,1,198,72,141,21,24,0,0,0,72,137,22,72,137,126,8,72,199,192,56,0,0,0,72,199,199,0,143,1,128,15,5,195,76,141,45,242,0,0,0,77,139,117,64,65,139,69,0,131,248,4,15,132,107,0,0,0,131,248,0,117,11,72,199,192,24,0,0,0,15,5,235,227,131,248,1,117,68,186,2,0,0,0,240,65,15,177,85,0,65,131,125,0,2,117,50,73,139,69,8,73,139,125,16,73,139,117,24,73,139,85,32,77,139,85,40,77,139,69,48,77,139,77,56,15,5,73,137,69,56,65,199,69,0,3,0,0,0,72,139,4,36,73,137,69,48,240,65,131,69,4,1,77,137,245,77,139,117,64,233,136,255,255,255,65,199,69,8,186,190,0,0,72,199,192,60,0,0,0,15,5,195,15,31,64,0,115,116,97,99,107,15,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,49,32,98,108,111,99,107,144,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// Note: in general `module.js` needs 2 system calls to get `require` working:
	//  1. `fs.readFileSync()`
	//  2. `fs.statSync()`
	//
	// To add support for paths in symlinks it also needs `fs.realpathSync()`, however,
	// `realpath` IS NOT a system call, it is a function implemented in `libc`.
	//
	// So, we need to implement `fs.realpathSync()` then we can support symlinks in `require`,
	// though it might not be 100% compatible with Node.js.


	var NativeModule = __webpack_require__(42).NativeModule;
	var util = __webpack_require__(6);
	var internalModule = __webpack_require__(48);
	var internalUtil = __webpack_require__(31);
	var vm = __webpack_require__(61);
	var assert = __webpack_require__(36).ok;
	var fs = __webpack_require__(23);
	var path = __webpack_require__(25);
	var libjs = __webpack_require__(12);

	// const internalModuleReadFile = process.binding('fs').internalModuleReadFile;
	// const internalModuleStat = process.binding('fs').internalModuleStat;
	// const preserveSymlinks = !!process.binding('config').preserveSymlinks;


	// From: https://github.com/nodejs/node/blob/master/src/node_file.cc#L528
	// Used to speed up module loading.  Returns the contents of the file as
	// a string or undefined when the file cannot be opened.  The speedup
	// comes from not creating Error objects on failure.
	var internalModuleReadFile = function(path) {
	    try {
	        return fs.readFileSync(path, 'utf8');
	    } catch(e) {
	        return undefined;
	    }
	};

	// const internalModuleStat = ;
	var preserveSymlinks = false;


	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty(obj, prop) {
	    return Object.prototype.hasOwnProperty.call(obj, prop);
	}


	// TODO: Change this retarded `stat()` name to `isDir()`.
	function stat(filename) {
	    filename = path._makeLong(filename);
	    var cache = stat.cache;
	    if (cache !== null) {
	        var result = cache[filename];
	        if (result !== undefined) return result;
	    }

	    try {
	        var res = libjs.stat(filename);
	    } catch(errno) {
	        return errno;
	    }

	    result = (res.mode & /* libjs.S.IFDIR */ 16384) ? 1 : 0;

	    if (cache !== null)
	        cache[filename] = result;

	    return result;
	}
	stat.cache = null;


	function Module(id, parent) {
	    this.id = id;
	    this.exports = {};
	    this.parent = parent;
	    if (parent && parent.children) {
	        parent.children.push(this);
	    }

	    this.filename = null;
	    this.loaded = false;
	    this.children = [];
	}
	module.exports = Module;

	Module._cache = {};
	Module._pathCache = {};
	Module._extensions = {};
	var modulePaths = [];
	Module.globalPaths = [];

	Module.wrapper = NativeModule.wrapper;
	Module.wrap = NativeModule.wrap;
	Module._debug = util.debuglog('module');

	// We use this alias for the preprocessor that filters it out
	var debug = Module._debug;


	// given a module name, and a list of paths to test, returns the first
	// matching file in the following precedence.
	//
	// require("a.<ext>")
	//   -> a.<ext>
	//
	// require("a")
	//   -> a
	//   -> a.<ext>
	//   -> a/index.<ext>

	// check if the directory is a package.json dir
	var packageMainCache = {};

	function readPackage(requestPath) {

	    if (hasOwnProperty(packageMainCache, requestPath)) {
	        return packageMainCache[requestPath];
	    }

	    // var jsonPath = path.resolve(requestPath, 'package.json');

	    // const json = internalModuleReadFile(path._makeLong(jsonPath));
	    // console.log(jsonPath);
	    try {
	        var jsonPath = path.resolve(requestPath, 'package.json');
	        var json = internalModuleReadFile(path._makeLong(jsonPath));
	    } catch (e) {
	        return false;
	    }


	    if (json === undefined) {
	        return false;
	    }

	    try {
	        var pkg = packageMainCache[requestPath] = JSON.parse(json).main;
	    } catch (e) {
	        e.path = jsonPath;
	        e.message = 'Error parsing ' + jsonPath + ': ' + e.message;
	        throw e;
	    }
	    return pkg;
	}

	function tryPackage(requestPath, exts, isMain) {
	    var pkg = readPackage(requestPath);

	    if (!pkg) return false;

	    var filename = path.resolve(requestPath, pkg);
	    return tryFile(filename, isMain) ||
	        tryExtensions(filename, exts, isMain) ||
	        tryExtensions(path.resolve(filename, 'index'), exts, isMain);
	}

	// check if the file exists and is not a directory
	// if using --preserve-symlinks and isMain is false,
	// keep symlinks intact, otherwise resolve to the
	// absolute realpath.
	function tryFile(requestPath, isMain) {
	    // console.log(requestPath, isMain);
	    return requestPath;
	    var rc = stat(requestPath);
	    // console.log('rc', rc);
	    if(rc) return requestPath;
	    else return false;
	    // console.log(rc);
	    // if (preserveSymlinks && !isMain) {
	    //     return rc === 0 && path.resolve(requestPath);
	    // }
	    // return rc === 0 && fs.realpathSync(requestPath);
	}

	// given a path check a the file exists with any of the set extensions
	function tryExtensions(p, exts, isMain) {
	    for (var i = 0; i < exts.length; i++) {

	        var filename = tryFile(p + exts[i], isMain);

	        if (filename) {
	            return filename;
	        }
	    }
	    return false;
	}

	var warned = false;
	Module._findPath = function(request, paths, isMain) {
	    if (path.isAbsolute(request)) {
	        paths = [''];
	    } else if (!paths || paths.length === 0) {
	        return false;
	    }

	    const cacheKey = JSON.stringify({request: request, paths: paths});
	    if (Module._pathCache[cacheKey]) {
	        return Module._pathCache[cacheKey];
	    }

	    var exts;
	    const trailingSlash = request.length > 0 &&
	        request.charCodeAt(request.length - 1) === 47/*/*/;

	    // For each path
	    for (var i = 0; i < paths.length; i++) {

	        // Don't search further if path doesn't exist
	        var curPath = paths[i];
	        if (curPath && stat(curPath) < 1) continue;

	        var basePath = path.resolve(curPath, request);

	        var filename;


	        if (!trailingSlash) {
	            var rc = stat(basePath);
	            if (rc === 0) {  // File.
	                // if (preserveSymlinks && !isMain) {
	                    filename = path.resolve(basePath);
	                // } else {
	                //     filename = fs.realpathSync(basePath);
	                // }
	            } else if (rc === 1) {  // Directory.
	                if (exts === undefined)
	                    exts = Object.keys(Module._extensions);
	                filename = tryPackage(basePath, exts, isMain);
	            }

	            if (!filename) {
	                // try it with each of the extensions
	                if (exts === undefined)
	                    exts = Object.keys(Module._extensions);
	                filename = tryExtensions(basePath, exts, isMain);
	            }
	        }

	        if (!filename) {
	            if (exts === undefined)
	                exts = Object.keys(Module._extensions);
	            filename = tryPackage(basePath, exts, isMain);
	        }

	        if (!filename) {
	            // try it with each of the extensions at "index"
	            if (exts === undefined)
	                exts = Object.keys(Module._extensions);
	            filename = tryExtensions(path.resolve(basePath, 'index'), exts, isMain);
	        }

	        if (filename) {
	            // Warn once if '.' resolved outside the module dir
	            if (request === '.' && i > 0) {
	                warned = internalUtil.printDeprecationMessage(
	                    'warning: require(\'.\') resolved outside the package ' +
	                    'directory. This functionality is deprecated and will be removed ' +
	                    'soon.', warned);
	            }

	            Module._pathCache[cacheKey] = filename;
	            return filename;
	        }
	    }

	    return false;
	};

	// 'node_modules' character codes reversed
	var nmChars = [ 115, 101, 108, 117, 100, 111, 109, 95, 101, 100, 111, 110 ];
	var nmLen = nmChars.length;
	if (process.platform === 'win32') {
	    // 'from' is the __dirname of the module.
	    Module._nodeModulePaths = function(from) {
	        // guarantee that 'from' is absolute.
	        from = path.resolve(from);

	        // note: this approach *only* works when the path is guaranteed
	        // to be absolute.  Doing a fully-edge-case-correct path.split
	        // that works on both Windows and Posix is non-trivial.
	        var paths = [];
	        var p = 0;
	        var last = from.length;
	        for (var i = from.length - 1; i >= 0; --i) {
	            var code = from.charCodeAt(i);
	            if (code === 92/*\*/ || code === 47/*/*/) {
	                if (p !== nmLen)
	                    paths.push(from.slice(0, last) + '\\node_modules');
	                last = i;
	                p = 0;
	            } else if (p !== -1 && p < nmLen) {
	                if (nmChars[p] === code) {
	                    ++p;
	                } else {
	                    p = -1;
	                }
	            }
	        }

	        return paths;
	    };
	} else { // posix
	         // 'from' is the __dirname of the module.
	    Module._nodeModulePaths = function(from) {
	        // guarantee that 'from' is absolute.
	        from = path.resolve(from);
	        // Return early not only to avoid unnecessary work, but to *avoid* returning
	        // an array of two items for a root: [ '//node_modules', '/node_modules' ]
	        if (from === '/')
	            return ['/node_modules'];

	        // note: this approach *only* works when the path is guaranteed
	        // to be absolute.  Doing a fully-edge-case-correct path.split
	        // that works on both Windows and Posix is non-trivial.
	        var paths = [];
	        var p = 0;
	        var last = from.length;
	        for (var i = from.length - 1; i >= 0; --i) {
	            var code = from.charCodeAt(i);
	            if (code === 47/*/*/) {
	                if (p !== nmLen)
	                    paths.push(from.slice(0, last) + '/node_modules');
	                last = i;
	                p = 0;
	            } else if (p !== -1 && p < nmLen) {
	                if (nmChars[p] === code) {
	                    ++p;
	                } else {
	                    p = -1;
	                }
	            }
	        }

	        return paths;
	    };
	}


	// 'index.' character codes
	var indexChars = [ 105, 110, 100, 101, 120, 46 ];
	var indexLen = indexChars.length;
	Module._resolveLookupPaths = function(request, parent) {
	    if (NativeModule.nonInternalExists(request)) {
	        return [request, []];
	    }

	    var reqLen = request.length;
	    // Check for relative path
	    if (reqLen < 2 ||
	        request.charCodeAt(0) !== 46/*.*/ ||
	        (request.charCodeAt(1) !== 46/*.*/ &&
	        request.charCodeAt(1) !== 47/*/*/)) {
	        var paths = modulePaths;
	        if (parent) {
	            if (!parent.paths)
	                paths = parent.paths = [];
	            else
	                paths = parent.paths.concat(paths);
	        }

	        // Maintain backwards compat with certain broken uses of require('.')
	        // by putting the module's directory in front of the lookup paths.
	        if (request === '.') {
	            if (parent && parent.filename) {
	                paths.unshift(path.dirname(parent.filename));
	            } else {
	                paths.unshift(path.resolve(request));
	            }
	        }
	        return [request, paths];
	    }

	    // with --eval, parent.id is not set and parent.filename is null
	    if (!parent || !parent.id || !parent.filename) {
	        // make require('./path/to/foo') work - normally the path is taken
	        // from realpath(__filename) but with eval there is no filename
	        var mainPaths = ['.'].concat(Module._nodeModulePaths('.'), modulePaths);
	        return [request, mainPaths];
	    }

	    // Is the parent an index module?
	    // We can assume the parent has a valid extension,
	    // as it already has been accepted as a module.
	    const base = path.basename(parent.filename);
	    var parentIdPath;
	    if (base.length > indexLen) {
	        var i = 0;
	        for (; i < indexLen; ++i) {
	            if (indexChars[i] !== base.charCodeAt(i))
	                break;
	        }
	        if (i === indexLen) {
	            // We matched 'index.', let's validate the rest
	            for (; i < base.length; ++i) {
	                const code = base.charCodeAt(i);
	                if (code !== 95/*_*/ &&
	                    (code < 48/*0*/ || code > 57/*9*/) &&
	                    (code < 65/*A*/ || code > 90/*Z*/) &&
	                    (code < 97/*a*/ || code > 122/*z*/))
	                    break;
	            }
	            if (i === base.length) {
	                // Is an index module
	                parentIdPath = parent.id;
	            } else {
	                // Not an index module
	                parentIdPath = path.dirname(parent.id);
	            }
	        } else {
	            // Not an index module
	            parentIdPath = path.dirname(parent.id);
	        }
	    } else {
	        // Not an index module
	        parentIdPath = path.dirname(parent.id);
	    }
	    var id = path.resolve(parentIdPath, request);

	    // make sure require('./path') and require('path') get distinct ids, even
	    // when called from the toplevel js file
	    if (parentIdPath === '.' && id.indexOf('/') === -1) {
	        id = './' + id;
	    }

	    debug('RELATIVE: requested: %s set ID to: %s from %s', request, id,
	        parent.id);


	    return [id, [path.dirname(parent.filename)]];
	};


	// Check the cache for the requested file.
	// 1. If a module already exists in the cache: return its exports object.
	// 2. If the module is native: call `NativeModule.require()` with the
	//    filename and return the result.
	// 3. Otherwise, create a new module for the file and save it to the cache.
	//    Then have it load  the file contents before returning its exports
	//    object.
	Module._load = function(request, parent, isMain) {

	    if(true) {
	        if (parent) {
	            debug('Module._load REQUEST %s parent: %s', request, parent.id);
	        }
	    }

	    var filename = Module._resolveFilename(request, parent, isMain);

	    var cachedModule = Module._cache[filename];
	    if (cachedModule) {
	        return cachedModule.exports;
	    }

	    if (NativeModule.nonInternalExists(filename)) {
	        if(true) {
	            debug('load native module %s', request);
	        }
	        return NativeModule.require(filename);
	    }

	    var module = new Module(filename, parent);

	    if (isMain) {
	        process.mainModule = module;
	        module.id = '.';
	    }

	    Module._cache[filename] = module;

	    tryModuleLoad(module, filename);

	    return module.exports;
	};

	function tryModuleLoad(module, filename) {
	    var threw = true;
	    try {
	        module.load(filename);
	        threw = false;
	    } finally {
	        if (threw) {
	            delete Module._cache[filename];
	        }
	    }
	}

	Module._resolveFilename = function(request, parent, isMain) {

	    if (NativeModule.nonInternalExists(request)) {
	        return request;
	    }

	    var resolvedModule = Module._resolveLookupPaths(request, parent);

	    var id = resolvedModule[0];
	    var paths = resolvedModule[1];

	    // look up the filename first, since that's the cache key.
	    if(true) {
	        debug('looking for %j in %j', id, paths);
	    }

	    var filename = Module._findPath(request, paths, isMain);

	    // console.log(filename);
	    if (!filename) {
	        var err = new Error("Cannot find module '" + request + "'");
	        err.code = 'MODULE_NOT_FOUND';
	        throw err;
	    }

	    return filename;
	};


	// Given a file name, pass it to the proper extension handler.
	Module.prototype.load = function(filename) {
	    // console.log('f', filename);
	    if(true) {
	        debug('load %j for module %j', filename, this.id);
	    }

	    assert(!this.loaded);
	    this.filename = filename;
	    this.paths = Module._nodeModulePaths(path.dirname(filename));

	    var extension = path.extname(filename) || '.js';
	    if (!Module._extensions[extension]) extension = '.js';
	    Module._extensions[extension](this, filename);
	    this.loaded = true;
	};


	// Loads a module at the given file path. Returns that module's
	// `exports` property.
	Module.prototype.require = function(path) {
	    if(true) {
	        assert(path, 'missing path');
	        assert(typeof path === 'string', 'path must be a string');
	    }
	    return Module._load(path, this, /* isMain */ false);
	};


	// Resolved path to process.argv[1] will be lazily placed here
	// (needed for setting breakpoint when called with --debug-brk)
	var resolvedArgv;


	// Run the file contents in the correct scope or sandbox. Expose
	// the correct helper variables (require, module, exports) to
	// the file.
	// Returns exception, if any.
	Module.prototype._compile = function(content, filename) {
	    // Remove shebang
	    var contLen = content.length;
	    if (contLen >= 2) {
	        if (content.charCodeAt(0) === 35/*#*/ &&
	            content.charCodeAt(1) === 33/*!*/) {
	            if (contLen === 2) {
	                // Exact match
	                content = '';
	            } else {
	                // Find end of shebang line and slice it off
	                var i = 2;
	                for (; i < contLen; ++i) {
	                    var code = content.charCodeAt(i);
	                    if (code === 10/*\n*/ || code === 13/*\r*/)
	                        break;
	                }
	                if (i === contLen)
	                    content = '';
	                else {
	                    // Note that this actually includes the newline character(s) in the
	                    // new output. This duplicates the behavior of the regular expression
	                    // that was previously used to replace the shebang line
	                    content = content.slice(i);
	                }
	            }
	        }
	    }

	    // create wrapper function
	    var wrapper = Module.wrap(content);


	    var compiledWrapper = eval(wrapper);
	    // var compiledWrapper = vm.runInThisContext(wrapper, {
	    //     filename: filename,
	    //     lineOffset: 0,
	    //     displayErrors: true
	    // });

	    /*if (process._debugWaitConnect) {
	        if (!resolvedArgv) {
	            // we enter the repl if we're not given a filename argument.
	            if (process.argv[1]) {
	                resolvedArgv = Module._resolveFilename(process.argv[1], null);
	            } else {
	                resolvedArgv = 'repl';
	            }
	        }

	        // Set breakpoint on module start
	        if (filename === resolvedArgv) {
	            delete process._debugWaitConnect;
	            const Debug = vm.runInDebugContext('Debug');
	            Debug.setBreakPoint(compiledWrapper, 0, 0);
	        }
	    }*/
	    var dirname = path.dirname(filename);
	    var require = internalModule.makeRequireFunction.call(this);
	    var args = [this.exports, require, this, filename, dirname];
	    var depth = internalModule.requireDepth;
	    if (depth === 0) stat.cache = {};
	    var result = compiledWrapper.apply(this.exports, args);
	    if (depth === 0) stat.cache = null;
	    return result;
	};


	// Native extension for .js
	Module._extensions['.js'] = function(module, filename) {
	    var content = fs.readFileSync(filename, 'utf8');
	    module._compile(internalModule.stripBOM(content), filename);
	};


	// Native extension for .json
	Module._extensions['.json'] = function(module, filename) {
	    var content = fs.readFileSync(filename, 'utf8');
	    try {
	        module.exports = JSON.parse(internalModule.stripBOM(content));
	    } catch (err) {
	        err.message = filename + ': ' + err.message;
	        throw err;
	    }
	};


	//Native extension for .node
	// Module._extensions['.node'] = function(module, filename) {
	//     return process.dlopen(module, path._makeLong(filename));
	// };


	// bootstrap main module.
	Module.runMain = function() {
	    // Load the main module--the command line argument.
	    Module._load(process.argv[1], null, true);

	    // Handle any nextTicks added in the first tick of the program
	    // process._tickCallback();
	};

	Module._initPaths = function() {
	    const isWindows = process.platform === 'win32';

	    var homeDir;
	    if (isWindows) {
	        homeDir = process.env.USERPROFILE;
	    } else {
	        homeDir = process.env.HOME;
	    }

	    var paths = [path.resolve(process.execPath, '..', '..', 'lib', 'node')];

	    if (homeDir) {
	        paths.unshift(path.resolve(homeDir, '.node_libraries'));
	        paths.unshift(path.resolve(homeDir, '.node_modules'));
	    }

	    var nodePath = process.env['NODE_PATH'];
	    if (nodePath) {
	        paths = nodePath.split(path.delimiter).filter(function(path) {
	            return !!path;
	        }).concat(paths);
	    }

	    modulePaths = paths;

	    // clone as a read-only copy, for introspection.
	    Module.globalPaths = modulePaths.slice(0);
	};

	// TODO(bnoordhuis) Unused, remove in the future.
	// Module.requireRepl = internalUtil.deprecate(function() {
	//     return NativeModule.require('internal/repl');
	// }, 'Module.requireRepl is deprecated.');

	Module._preloadModules = function(requests) {
	    if (!Array.isArray(requests))
	        return;

	    // Preloaded modules have a dummy parent module which is deemed to exist
	    // in the current working directory. This seeds the search path for
	    // preloaded modules.
	    var parent = new Module('internal/preload', null);
	    try {
	        parent.paths = Module._nodeModulePaths(process.cwd());
	    } catch (e) {
	        if (e.code !== 'ENOENT') {
	            throw e;
	        }
	    }
	    requests.forEach(function(request) {
	        parent.require(request);
	    });
	};

	Module._initPaths();

	// backwards compatibility
	Module.Module = Module;


/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	function NativeModule(id) {
	    this.filename = id + '.js';
	    this.id = id;
	    this.exports = {};
	    this.loaded = false;
	    this.loading = false;
	}

	// NativeModule._source = process.binding('natives');
	NativeModule._cache = {
	    assert: null,
	    buffer: null,
	    console: null,
	    eloop: null,
	    events: null,
	    fs: null,
	    module: null,
	    path: null,
	    'static-arraybuffer': null,
	    'static-buffer': null,
	    stream: null,
	    timers: null,
	    util: null,
	    url: null,
	    querystring: null,
	    punycode: null,
	    vm: null,
	    dgram: null,
	    dns: null,
	    net: null,
	    http: null,
	    tls: null,
	    https: null,
	    string_decoder: null,
	    readline: null,
	    repl: null,
	};

	NativeModule.require = function(id) {
	    if (id == 'native_module') {
	        return NativeModule;
	    }

	    var cached = NativeModule.getCached(id);
	    if (cached && (cached.loaded || cached.loading)) {
	        return cached.exports;
	    }

	    if (!NativeModule.exists(id)) {
	        throw new Error('No such native module '+ id);
	    }

	    process.moduleLoadList.push('NativeModule ' + id);

	    var nativeModule = new NativeModule(id);

	    nativeModule.cache();
	    nativeModule.compile();

	    return nativeModule.exports;
	};

	NativeModule.getCached = function(id) {
	    return NativeModule._cache[id];
	};

	NativeModule.exists = function(id) {
	    // return typeof NativeModule._cache[id] !== 'undefined';
	    return NativeModule._cache.hasOwnProperty(id);
	};

	const EXPOSE_INTERNALS = process.execArgv.some(function(arg) {
	    return arg.match(/^--expose[-_]internals$/);
	});

	if (EXPOSE_INTERNALS) {
	    NativeModule.nonInternalExists = NativeModule.exists;

	    NativeModule.isInternal = function(id) {
	        return false;
	    };
	} else {
	    NativeModule.nonInternalExists = function(id) {
	        return NativeModule.exists(id) && !NativeModule.isInternal(id);
	    };

	    NativeModule.isInternal = function(id) {
	        // return id.startsWith('internal/');
	        var what = 'internal/';
	        return id.substr(0, what.length) === what;
	    };
	}


	NativeModule.getSource = function(id) {
	    // return require('./' + id);
	    // return NativeModule._source[id];
	};

	NativeModule.wrap = function(script) {
	    return NativeModule.wrapper[0] + script + NativeModule.wrapper[1];
	};

	NativeModule.wrapper = [
	    '(function (exports, require, module, __filename, __dirname) { ',
	    '\n});'
	];

	NativeModule.prototype.compile = function() {
	    var source = NativeModule.getSource(this.id);
	    source = NativeModule.wrap(source);

	    this.loading = true;

	    try {
	        // var fn = eval(source);
	        // var fn = runInThisContext(source, {
	        //     filename: this.filename,
	        //     lineOffset: 0,
	        //     displayErrors: true
	        // });
	        // fn(this.exports, NativeModule.require, this, this.filename);

	        // var exports;
	        // switch(this.id) {
	        //     case 'assert': exports = require('./assert'); break;
	        //     case 'buffer': exports = require('./buffer'); break;
	        //     case 'console': exports = require('./console'); break;
	        //     case 'eloop': exports = require('./eloop'); break;
	        //     case 'events': exports = require('./events'); break;
	        //     case 'fs': exports = require('./fs'); break;
	        //     case 'module': exports = require('./module'); break;
	        //     case 'path': exports = require('./path'); break;
	        //     case 'static-arraybuffer': exports = require('./static-arraybuffer'); break;
	        //     case 'static-buffer': exports = require('./static-buffer'); break;
	        //     case 'stream': exports = require('./stream'); break;
	        //     case 'timers': exports = require('./timers'); break;
	        //     case 'util': exports = require('./util'); break;
	        //     case 'url': exports = require('./url'); break;
	        //     case 'querystring': exports = require('./querystring'); break;
	        //     case 'punycode': exports = require('./punycode'); break;
	        //     case 'vm': exports = require('./vm'); break;
	        //     case 'dgram': exports = require('./dgram'); break;
	        //     case 'dns': exports = require('./dns'); break;
	        //     case 'net': exports = require('./net'); break;
	        //     case 'http': exports = require('./http'); break;
	        //     case 'tls': exports = require('./tls'); break;
	        //     case 'https': exports = require('./https'); break;
	        //     case 'string_decoder': exports = require('./string_decoder'); break;
	        //     case 'readline': exports = require('./readline'); break;
	        //     case 'repl': exports = require('./repl'); break;
	        // }
	        // this.exports = exports;
	        this.exports = __webpack_require__(43)("./" + this.id);

	        this.loaded = true;
	    } finally {
	        this.loading = false;
	    }
	};

	NativeModule.prototype.cache = function() {
	    NativeModule._cache[this.id] = this;
	};

	exports.NativeModule = NativeModule;


/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./_stream_duplex": 32,
		"./_stream_passthrough": 34,
		"./_stream_readable": 27,
		"./_stream_transform": 33,
		"./_stream_writable": 30,
		"./assert": 36,
		"./boot": 1,
		"./buffer": 7,
		"./console": 35,
		"./dgram": 44,
		"./dgram-reference": 45,
		"./dns": 46,
		"./eloop": 20,
		"./events": 18,
		"./fs": 23,
		"./index": 47,
		"./internal/module": 48,
		"./internal/streams/BufferList": 28,
		"./internal/streams/lazy_transform": 51,
		"./internal/util": 31,
		"./module": 41,
		"./native_module": 42,
		"./net": 52,
		"./path": 25,
		"./process": 17,
		"./punycode": 53,
		"./querystring": 54,
		"./readline": 55,
		"./static-arraybuffer": 11,
		"./static-buffer": 13,
		"./stream": 26,
		"./string_decoder": 62,
		"./timers": 37,
		"./tty": 63,
		"./url": 60,
		"./util": 6,
		"./vm": 61
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 43;


/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var events_1 = __webpack_require__(18);
	var buffer_1 = __webpack_require__(7);
	var util = __webpack_require__(6);
	var errnoException = util._errnoException;
	var exceptionWithHostPort = util._exceptionWithHostPort;
	function lookup4(address, callback) {
	    callback();
	}
	function lookup6(address, callback) {
	    callback();
	}
	function sliceBuffer(buffer, offset, length) {
	    if (typeof buffer === 'string')
	        buffer = buffer_1.Buffer.from(buffer);
	    else if (!(buffer instanceof buffer_1.Buffer))
	        throw new TypeError('First argument must be a buffer or string');
	    offset = offset >>> 0;
	    length = length >>> 0;
	    return buffer.slice(offset, offset + length);
	}
	function fixBufferList(list) {
	    var newlist = new Array(list.length);
	    for (var i = 0, l = list.length; i < l; i++) {
	        var buf = list[i];
	        if (typeof buf === 'string')
	            newlist[i] = buffer_1.Buffer.from(buf);
	        else if (!(buf instanceof buffer_1.Buffer))
	            return null;
	        else
	            newlist[i] = buf;
	    }
	    return newlist;
	}
	var Socket = (function (_super) {
	    __extends(Socket, _super);
	    function Socket(type, listener) {
	        var _this = this;
	        _super.call(this);
	        this.bindState = 0;
	        this.reuseAddr = false;
	        var isIP6 = type === 'udp6';
	        this.sock = process.loop.poll.createUdpSocket(isIP6);
	        this.lookup = isIP6 ? lookup6 : lookup4;
	        if (listener)
	            this.on('message', listener);
	        this.sock.ondata = function (msg, from) {
	            _this.emit('message', msg, from);
	        };
	        this.sock.onstart = function () {
	        };
	        this.sock.onstop = function () {
	        };
	        this.sock.onerror = function () {
	        };
	    }
	    Socket.prototype.send = function (msg, a, b, c, d, e) {
	        var _this = this;
	        var port;
	        var address;
	        var callback;
	        var typeofb = typeof b;
	        if (typeofb[0] === 'n') {
	            var offset = a;
	            var length = b;
	            msg = sliceBuffer(msg, offset, length);
	            port = c;
	            address = d;
	            callback = e;
	        }
	        else if (typeofb[1] === 't') {
	            port = a;
	            address = b;
	            callback = c;
	        }
	        else
	            throw TypeError('3rd arguments must be length or address');
	        var list;
	        if (!Array.isArray(msg)) {
	            if (typeof msg === 'string') {
	                list = [buffer_1.Buffer.from(msg)];
	            }
	            else if (!(msg instanceof buffer_1.Buffer)) {
	                throw new TypeError('First argument must be a buffer or a string');
	            }
	            else {
	                list = [msg];
	            }
	        }
	        else if (!(list = fixBufferList(msg))) {
	            throw new TypeError('Buffer list arguments must be buffers or strings');
	        }
	        port = port >>> 0;
	        if (port === 0 || port > 65535)
	            throw new RangeError('Port should be > 0 and < 65536');
	        if (typeof callback !== 'function')
	            callback = undefined;
	        if (list.length === 0)
	            list.push(new buffer_1.Buffer(0));
	        this.lookup(address, function (err, ip) {
	            var err = _this.sock.send(list[0], address, port);
	            if (callback)
	                callback(err);
	        });
	    };
	    Socket.prototype.address = function () {
	    };
	    Socket.prototype.bind = function (a, b, c) {
	        var _this = this;
	        var port;
	        var address;
	        var exclusive = false;
	        var callback;
	        if (typeof a === 'number') {
	            port = a;
	            if (typeof address === 'string') {
	                address = b;
	                callback = c;
	            }
	            else {
	                callback = b;
	            }
	        }
	        else if ((a !== null) && (typeof a === 'object')) {
	            port = a.port;
	            address = a.address || '';
	            exclusive = !!a.exclusive;
	            callback = b;
	        }
	        else
	            throw TypeError('Invalid bind() arguments.');
	        if (this.bindState !== 0)
	            throw Error('Socket is already bound');
	        this.bindState = 1;
	        if (!address) {
	            if (this.lookup === lookup4)
	                address = '0.0.0.0';
	            else
	                address = '::';
	        }
	        this.lookup(address, function (lookup_err, ip) {
	            if (lookup_err) {
	                _this.bindState = 0;
	                _this.emit('error', lookup_err);
	                return;
	            }
	            if (!_this.sock)
	                return;
	            var err = _this.sock.bind(port || 0, ip);
	            if (err) {
	                var ex = exceptionWithHostPort(err, 'bind', ip, port);
	                _this.emit('error', ex);
	                _this.bindState = 0;
	                return;
	            }
	            _this.bindState = 2;
	            _this.emit('listening');
	            if (typeof callback === 'function')
	                callback();
	        });
	        return this;
	    };
	    Socket.prototype.close = function (callback) {
	        this.sock.stop();
	    };
	    Socket.prototype.addMembership = function (multicastAddress, multicastInterface) {
	    };
	    Socket.prototype.dropMembership = function (multicastAddress, multicastInterface) {
	    };
	    Socket.prototype.setBroadcast = function (flag) {
	        var res = this.sock.setBroadcast(flag);
	        if (res < 0)
	            throw errnoException(res, 'setBroadcast');
	    };
	    Socket.prototype.setMulticastLoopback = function (flag) {
	        var res = this.sock.setMulticastLoop(flag);
	        if (res < 0)
	            throw errnoException(res, 'setMulticastLoopback');
	        return flag;
	    };
	    Socket.prototype.setTTL = function (ttl) {
	        if (typeof ttl !== 'number')
	            throw TypeError('Argument must be a number');
	        var res = this.sock.setTtl(ttl);
	        if (res < 0)
	            throw errnoException(res, 'setTTL');
	        return ttl;
	    };
	    Socket.prototype.setMulticastTTL = function (ttl) {
	        if (typeof ttl !== 'number')
	            throw new TypeError('Argument must be a number');
	        var err = this.sock.setMulticastTtl(ttl);
	        if (err < 0)
	            throw errnoException(err, 'setMulticastTTL');
	        return ttl;
	    };
	    Socket.prototype.ref = function () {
	        this.sock.ref();
	    };
	    Socket.prototype.unref = function () {
	        this.sock.unref();
	    };
	    return Socket;
	}(events_1.EventEmitter));
	exports.Socket = Socket;
	function createSocket(type, callback) {
	    var socket;
	    if (typeof type === 'string')
	        socket = new Socket(type, callback);
	    else if ((type !== null) && (typeof type === 'object')) {
	        socket = new Socket(type.type, callback);
	        socket.reuseAddr = !!type.reuseAddr;
	    }
	    else
	        throw TypeError('Invalid type argument.');
	    return socket;
	}
	exports.createSocket = createSocket;


/***/ },
/* 45 */
/***/ function(module, exports) {

	/*
	'use strict';

	const assert = require('assert');
	const Buffer = require('buffer').Buffer;
	const util = require('util');
	const EventEmitter = require('events');
	const UV_UDP_REUSEADDR = process.binding('constants').os.UV_UDP_REUSEADDR;

	const UDP = process.binding('udp_wrap').UDP;
	const SendWrap = process.binding('udp_wrap').SendWrap;

	const BIND_STATE_UNBOUND = 0;
	const BIND_STATE_BINDING = 1;
	const BIND_STATE_BOUND = 2;

	// lazily loaded
	var cluster = null;
	var dns = null;

	const errnoException = util._errnoException;
	const exceptionWithHostPort = util._exceptionWithHostPort;

	function lookup(address, family, callback) {
	    if (!dns)
	        dns = require('dns');

	    return dns.lookup(address, family, callback);
	}


	function lookup4(address, callback) {
	    return lookup(address || '127.0.0.1', 4, callback);
	}


	function lookup6(address, callback) {
	    return lookup(address || '::1', 6, callback);
	}


	function newHandle(type) {
	    if (type == 'udp4') {
	        const handle = new UDP();
	        handle.lookup = lookup4;
	        return handle;
	    }

	    if (type == 'udp6') {
	        const handle = new UDP();
	        handle.lookup = lookup6;
	        handle.bind = handle.bind6;
	        handle.send = handle.send6;
	        return handle;
	    }

	    if (type == 'unix_dgram')
	        throw new Error('"unix_dgram" type sockets are not supported any more');

	    throw new Error('Bad socket type specified. Valid types are: udp4, udp6');
	}


	exports._createSocketHandle = function(address, port, addressType, fd, flags) {
	    // Opening an existing fd is not supported for UDP handles.
	    assert(typeof fd !== 'number' || fd < 0);

	    var handle = newHandle(addressType);

	    if (port || address) {
	        var err = handle.bind(address, port || 0, flags);
	        if (err) {
	            handle.close();
	            return err;
	        }
	    }

	    return handle;
	};


	function Socket(type, listener) {
	    EventEmitter.call(this);

	    if (typeof type === 'object') {
	        var options = type;
	        type = options.type;
	    }

	    var handle = newHandle(type);
	    handle.owner = this;

	    this._handle = handle;
	    this._receiving = false;
	    this._bindState = BIND_STATE_UNBOUND;
	    this.type = type;
	    this.fd = null; // compatibility hack

	    // If true - UV_UDP_REUSEADDR flag will be set
	    this._reuseAddr = options && options.reuseAddr;

	    if (typeof listener === 'function')
	        this.on('message', listener);
	}
	util.inherits(Socket, EventEmitter);
	exports.Socket = Socket;


	exports.createSocket = function(type, listener) {
	    return new Socket(type, listener);
	};


	function startListening(socket) {
	    socket._handle.onmessage = onMessage;
	    // Todo: handle errors
	    socket._handle.recvStart();
	    socket._receiving = true;
	    socket._bindState = BIND_STATE_BOUND;
	    socket.fd = -42; // compatibility hack

	    socket.emit('listening');
	}

	function replaceHandle(self, newHandle) {

	    // Set up the handle that we got from master.
	    newHandle.lookup = self._handle.lookup;
	    newHandle.bind = self._handle.bind;
	    newHandle.send = self._handle.send;
	    newHandle.owner = self;

	    // Replace the existing handle by the handle we got from master.
	    self._handle.close();
	    self._handle = newHandle;
	}

	Socket.prototype.bind = function(port_ /!*, address, callback*!/) {
	    var self = this;
	    let port = port_;

	    self._healthCheck();

	    if (this._bindState != BIND_STATE_UNBOUND)
	        throw new Error('Socket is already bound');

	    this._bindState = BIND_STATE_BINDING;

	    if (typeof arguments[arguments.length - 1] === 'function')
	        self.once('listening', arguments[arguments.length - 1]);

	    if (port instanceof UDP) {
	        replaceHandle(self, port);
	        startListening(self);
	        return self;
	    }

	    var address;
	    var exclusive;

	    if (port !== null && typeof port === 'object') {
	        address = port.address || '';
	        exclusive = !!port.exclusive;
	        port = port.port;
	    } else {
	        address = typeof arguments[1] === 'function' ? '' : arguments[1];
	        exclusive = false;
	    }

	    // defaulting address for bind to all interfaces
	    if (!address && self._handle.lookup === lookup4) {
	        address = '0.0.0.0';
	    } else if (!address && self._handle.lookup === lookup6) {
	        address = '::';
	    }

	    // resolve address first
	    self._handle.lookup(address, function(err, ip) {
	        if (err) {
	            self._bindState = BIND_STATE_UNBOUND;
	            self.emit('error', err);
	            return;
	        }

	        if (!cluster)
	            cluster = require('cluster');

	        var flags = 0;
	        if (self._reuseAddr)
	            flags |= UV_UDP_REUSEADDR;

	        if (cluster.isWorker && !exclusive) {
	            function onHandle(err, handle) {
	                if (err) {
	                    var ex = exceptionWithHostPort(err, 'bind', ip, port);
	                    self.emit('error', ex);
	                    self._bindState = BIND_STATE_UNBOUND;
	                    return;
	                }

	                if (!self._handle)
	                // handle has been closed in the mean time.
	                    return handle.close();

	                replaceHandle(self, handle);
	                startListening(self);
	            }
	            cluster._getServer(self, {
	                address: ip,
	                port: port,
	                addressType: self.type,
	                fd: -1,
	                flags: flags
	            }, onHandle);

	        } else {
	            if (!self._handle)
	                return; // handle has been closed in the mean time

	            const err = self._handle.bind(ip, port || 0, flags);
	            if (err) {
	                var ex = exceptionWithHostPort(err, 'bind', ip, port);
	                self.emit('error', ex);
	                self._bindState = BIND_STATE_UNBOUND;
	                // Todo: close?
	                return;
	            }

	            startListening(self);
	        }
	    });

	    return self;
	};


	// thin wrapper around `send`, here for compatibility with dgram_legacy.js
	Socket.prototype.sendto = function(buffer,
	                                   offset,
	                                   length,
	                                   port,
	                                   address,
	                                   callback) {
	    if (typeof offset !== 'number' || typeof length !== 'number')
	        throw new Error('Send takes "offset" and "length" as args 2 and 3');

	    if (typeof address !== 'string')
	        throw new Error(this.type + ' sockets must send to port, address');

	    this.send(buffer, offset, length, port, address, callback);
	};


	function sliceBuffer(buffer, offset, length) {
	    if (typeof buffer === 'string')
	        buffer = Buffer.from(buffer);
	    else if (!(buffer instanceof Buffer))
	        throw new TypeError('First argument must be a buffer or string');

	    offset = offset >>> 0;
	    length = length >>> 0;

	    return buffer.slice(offset, offset + length);
	}


	function fixBufferList(list) {
	    const newlist = new Array(list.length);

	    for (var i = 0, l = list.length; i < l; i++) {
	        var buf = list[i];
	        if (typeof buf === 'string')
	            newlist[i] = Buffer.from(buf);
	        else if (!(buf instanceof Buffer))
	            return null;
	        else
	            newlist[i] = buf;
	    }

	    return newlist;
	}


	function enqueue(self, toEnqueue) {
	    // If the send queue hasn't been initialized yet, do it, and install an
	    // event handler that flushes the send queue after binding is done.
	    if (!self._queue) {
	        self._queue = [];
	        self.once('listening', clearQueue);
	    }
	    self._queue.push(toEnqueue);
	    return;
	}


	function clearQueue() {
	    const queue = this._queue;
	    this._queue = undefined;

	    // Flush the send queue.
	    for (var i = 0; i < queue.length; i++)
	        queue[i]();
	}


	// valid combinations
	// send(buffer, offset, length, port, address, callback)
	// send(buffer, offset, length, port, address)
	// send(buffer, offset, length, port)
	// send(bufferOrList, port, address, callback)
	// send(bufferOrList, port, address)
	// send(bufferOrList, port)
	Socket.prototype.send = function(buffer,
	                                 offset,
	                                 length,
	                                 port,
	                                 address,
	                                 callback) {
	    const self = this;
	    let list;

	    if (address || (port && typeof port !== 'function')) {
	        buffer = sliceBuffer(buffer, offset, length);
	    } else {
	        callback = port;
	        port = offset;
	        address = length;
	    }

	    if (!Array.isArray(buffer)) {
	        if (typeof buffer === 'string') {
	            list = [ Buffer.from(buffer) ];
	        } else if (!(buffer instanceof Buffer)) {
	            throw new TypeError('First argument must be a buffer or a string');
	        } else {
	            list = [ buffer ];
	        }
	    } else if (!(list = fixBufferList(buffer))) {
	        throw new TypeError('Buffer list arguments must be buffers or strings');
	    }

	    port = port >>> 0;
	    if (port === 0 || port > 65535)
	        throw new RangeError('Port should be > 0 and < 65536');

	    // Normalize callback so it's either a function or undefined but not anything
	    // else.
	    if (typeof callback !== 'function')
	        callback = undefined;

	    self._healthCheck();

	    if (self._bindState == BIND_STATE_UNBOUND)
	        self.bind({port: 0, exclusive: true}, null);

	    if (list.length === 0)
	        list.push(Buffer.allocUnsafe(0));

	    // If the socket hasn't been bound yet, push the outbound packet onto the
	    // send queue and send after binding is complete.
	    if (self._bindState != BIND_STATE_BOUND) {
	        enqueue(self, self.send.bind(self, list, port, address, callback));
	        return;
	    }

	    self._handle.lookup(address, function afterDns(ex, ip) {
	        doSend(ex, self, ip, list, address, port, callback);
	    });
	};


	function doSend(ex, self, ip, list, address, port, callback) {
	    if (ex) {
	        if (typeof callback === 'function') {
	            callback(ex);
	            return;
	        }

	        self.emit('error', ex);
	        return;
	    } else if (!self._handle) {
	        return;
	    }

	    var req = new SendWrap();
	    req.list = list;  // Keep reference alive.
	    req.address = address;
	    req.port = port;
	    if (callback) {
	        req.callback = callback;
	        req.oncomplete = afterSend;
	    }
	    var err = self._handle.send(req,
	        list,
	        list.length,
	        port,
	        ip,
	        !!callback);
	    if (err && callback) {
	        // don't emit as error, dgram_legacy.js compatibility
	        const ex = exceptionWithHostPort(err, 'send', address, port);
	        process.nextTick(callback, ex);
	    }
	}

	function afterSend(err, sent) {
	    if (err) {
	        err = exceptionWithHostPort(err, 'send', this.address, this.port);
	    } else {
	        err = null;
	    }

	    this.callback(err, sent);
	}

	Socket.prototype.close = function(callback) {
	    if (typeof callback === 'function')
	        this.on('close', callback);

	    if (this._queue) {
	        this._queue.push(this.close.bind(this));
	        return this;
	    }

	    this._healthCheck();
	    this._stopReceiving();
	    this._handle.close();
	    this._handle = null;
	    process.nextTick(socketCloseNT, this);

	    return this;
	};


	function socketCloseNT(self) {
	    self.emit('close');
	}


	Socket.prototype.address = function() {
	    this._healthCheck();

	    var out = {};
	    var err = this._handle.getsockname(out);
	    if (err) {
	        throw errnoException(err, 'getsockname');
	    }

	    return out;
	};

	Socket.prototype.setBroadcast = function(arg) {
	    var err = this._handle.setBroadcast(arg ? 1 : 0);
	    if (err) {
	        throw errnoException(err, 'setBroadcast');
	    }
	};


	Socket.prototype.setTTL = function(arg) {
	    if (typeof arg !== 'number') {
	        throw new TypeError('Argument must be a number');
	    }

	    var err = this._handle.setTTL(arg);
	    if (err) {
	        throw errnoException(err, 'setTTL');
	    }

	    return arg;
	};


	Socket.prototype.setMulticastTTL = function(arg) {
	    if (typeof arg !== 'number') {
	        throw new TypeError('Argument must be a number');
	    }

	    var err = this._handle.setMulticastTTL(arg);
	    if (err) {
	        throw errnoException(err, 'setMulticastTTL');
	    }

	    return arg;
	};


	Socket.prototype.setMulticastLoopback = function(arg) {
	    var err = this._handle.setMulticastLoopback(arg ? 1 : 0);
	    if (err) {
	        throw errnoException(err, 'setMulticastLoopback');
	    }

	    return arg; // 0.4 compatibility
	};


	Socket.prototype.addMembership = function(multicastAddress,
	                                          interfaceAddress) {
	    this._healthCheck();

	    if (!multicastAddress) {
	        throw new Error('multicast address must be specified');
	    }

	    var err = this._handle.addMembership(multicastAddress, interfaceAddress);
	    if (err) {
	        throw errnoException(err, 'addMembership');
	    }
	};


	Socket.prototype.dropMembership = function(multicastAddress,
	                                           interfaceAddress) {
	    this._healthCheck();

	    if (!multicastAddress) {
	        throw new Error('multicast address must be specified');
	    }

	    var err = this._handle.dropMembership(multicastAddress, interfaceAddress);
	    if (err) {
	        throw errnoException(err, 'dropMembership');
	    }
	};


	Socket.prototype._healthCheck = function() {
	    if (!this._handle)
	        throw new Error('Not running'); // error message from dgram_legacy.js
	};


	Socket.prototype._stopReceiving = function() {
	    if (!this._receiving)
	        return;

	    this._handle.recvStop();
	    this._receiving = false;
	    this.fd = null; // compatibility hack
	};


	function onMessage(nread, handle, buf, rinfo) {
	    var self = handle.owner;
	    if (nread < 0) {
	        return self.emit('error', errnoException(nread, 'recvmsg'));
	    }
	    rinfo.size = buf.length; // compatibility
	    self.emit('message', buf, rinfo);
	}


	Socket.prototype.ref = function() {
	    if (this._handle)
	        this._handle.ref();

	    return this;
	};


	Socket.prototype.unref = function() {
	    if (this._handle)
	        this._handle.unref();

	    return this;
	};*/


/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var util = __webpack_require__(6);


	// ERROR CODES
	exports.NODATA = 'ENODATA';
	exports.FORMERR = 'EFORMERR';
	exports.SERVFAIL = 'ESERVFAIL';
	exports.NOTFOUND = 'ENOTFOUND';
	exports.NOTIMP = 'ENOTIMP';
	exports.REFUSED = 'EREFUSED';
	exports.BADQUERY = 'EBADQUERY';
	exports.BADNAME = 'EBADNAME';
	exports.BADFAMILY = 'EBADFAMILY';
	exports.BADRESP = 'EBADRESP';
	exports.CONNREFUSED = 'ECONNREFUSED';
	exports.TIMEOUT = 'ETIMEOUT';
	exports.EOF = 'EOF';
	exports.FILE = 'EFILE';
	exports.NOMEM = 'ENOMEM';
	exports.DESTRUCTION = 'EDESTRUCTION';
	exports.BADSTR = 'EBADSTR';
	exports.BADFLAGS = 'EBADFLAGS';
	exports.NONAME = 'ENONAME';
	exports.BADHINTS = 'EBADHINTS';
	exports.NOTINITIALIZED = 'ENOTINITIALIZED';
	exports.LOADIPHLPAPI = 'ELOADIPHLPAPI';
	exports.ADDRGETNETWORKPARAMS = 'EADDRGETNETWORKPARAMS';
	exports.CANCELLED = 'ECANCELLED';


/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var libjs = __webpack_require__(12);
	var inotify_1 = __webpack_require__(24);
	var extend = __webpack_require__(6).extend;
	var pathModule = __webpack_require__(25);
	var buffer_1 = __webpack_require__(7);
	var static_buffer_1 = __webpack_require__(13);
	if (true) {
	    exports.isFULLjs = true;
	}
	function noop() { }
	var isSB = static_buffer_1.StaticBuffer.isStaticBuffer;
	var ERRSTR = {
	    PATH_STR: 'path must be a string',
	    FD: 'fd must be a file descriptor',
	    MODE_INT: 'mode must be an integer',
	    CB: 'callback must be a function',
	    UID: 'uid must be an unsigned int',
	    GID: 'gid must be an unsigned int',
	    LEN: 'len must be an integer',
	    ATIME: 'atime must be an integer',
	    MTIME: 'mtime must be an integer',
	    PREFIX: 'filename prefix is required',
	    BUFFER: 'buffer must be an instance of Buffer or StaticBuffer',
	    OFFSET: 'offset must be an integer',
	    LENGTH: 'length must be an integer',
	    POSITION: 'position must be an integer'
	};
	var ERRSTR_OPTS = function (tipeof) { return ("Expected options to be either an object or a string, but got " + tipeof + " instead"); };
	function formatError(errno, func, path, path2) {
	    if (func === void 0) { func = ''; }
	    if (path === void 0) { path = ''; }
	    if (path2 === void 0) { path2 = ''; }
	    switch (-errno) {
	        case 2: return "ENOENT: no such file or directory, " + func + " '" + path + "'";
	        case 9: return "EBADF: bad file descriptor, " + func;
	        case 22: return "EINVAL: invalid argument, " + func;
	        case 1: return "EPERM: operation not permitted, " + func + " '" + path + "' -> '" + path2 + "'";
	        case 71: return "EPROTO: protocol error, " + func + " '" + path + "' -> '" + path2 + "'";
	        case 17: return "EEXIST: file already exists, " + func + " '" + path + "' -> '" + path2 + "'";
	        default: return "Error occurred in " + func + ": errno = " + errno;
	    }
	}
	function throwError(errno, func, path, path2) {
	    if (func === void 0) { func = ''; }
	    if (path === void 0) { path = ''; }
	    if (path2 === void 0) { path2 = ''; }
	    throw Error(formatError(errno, func, path, path2));
	}
	function pathOrError(path, encoding) {
	    if (path instanceof buffer_1.Buffer)
	        path = path.toString(encoding);
	    if (typeof path !== 'string')
	        return TypeError(ERRSTR.PATH_STR);
	    return path;
	}
	function validPathOrThrow(path, encoding) {
	    var p = pathOrError(path, encoding);
	    if (p instanceof TypeError)
	        throw p;
	    else
	        return p;
	}
	function validateFd(fd) {
	    if (typeof fd !== 'number')
	        throw TypeError(ERRSTR.FD);
	}
	function getOptions(defaults, options) {
	    if (!options)
	        return defaults;
	    else {
	        var tipeof = typeof options;
	        switch (tipeof) {
	            case 'string': return extend({}, defaults, { encoding: options });
	            case 'object': return extend({}, defaults, options);
	            default: throw TypeError(ERRSTR_OPTS(tipeof));
	        }
	    }
	}
	var optionGenerator = function (defaults) { return function (options) { return getOptions(defaults, options); }; };
	function validateCallback(callback) {
	    if (typeof callback !== 'function')
	        throw TypeError(ERRSTR.CB);
	    return callback;
	}
	var optionAndCallbackGenerator = function (getOpts) {
	    return function (options, callback) { return typeof options === 'function'
	        ? [getOpts(), options]
	        : [getOpts(options), validateCallback(callback)]; };
	};
	(function (flags) {
	    flags[flags["r"] = 0] = "r";
	    flags[flags['r+'] = 2] = 'r+';
	    flags[flags["rs"] = 1069056] = "rs";
	    flags[flags['rs+'] = 1069058] = 'rs+';
	    flags[flags["w"] = 577] = "w";
	    flags[flags["wx"] = 705] = "wx";
	    flags[flags['w+'] = 578] = 'w+';
	    flags[flags['wx+'] = 706] = 'wx+';
	    flags[flags["a"] = 1089] = "a";
	    flags[flags["ax"] = 1217] = "ax";
	    flags[flags['a+'] = 1090] = 'a+';
	    flags[flags['ax+'] = 1218] = 'ax+';
	})(exports.flags || (exports.flags = {}));
	var flags = exports.flags;
	var CHUNK = 4096;
	var F_OK = 0;
	var R_OK = 4;
	var W_OK = 2;
	var X_OK = 1;
	var appendFileDefaults = {
	    encoding: 'utf8',
	    mode: 438,
	    flag: 'a'
	};
	var writeFileDefaults = {
	    encoding: 'utf8',
	    mode: 438,
	    flag: 'w'
	};
	function flagsToFlagsValue(f) {
	    if (typeof f === 'number')
	        return flags;
	    if (typeof f !== 'string')
	        throw TypeError("flags must be string or number");
	    var flagsval = flags[f];
	    if (typeof flagsval !== 'number')
	        throw TypeError("Invalid flags string value '" + f + "'");
	    return flagsval;
	}
	var optionsDefaults = {
	    encoding: 'utf8'
	};
	var readFileOptionsDefaults = {
	    flag: 'r'
	};
	var Stats = (function () {
	    function Stats() {
	    }
	    Stats.prototype.isFile = function () {
	        return (this.mode & 32768) == 32768;
	    };
	    Stats.prototype.isDirectory = function () {
	        return (this.mode & 16384) == 16384;
	    };
	    Stats.prototype.isBlockDevice = function () {
	        return (this.mode & 24576) == 24576;
	    };
	    Stats.prototype.isCharacterDevice = function () {
	        return (this.mode & 8192) == 8192;
	    };
	    Stats.prototype.isSymbolicLink = function () {
	        return (this.mode & 40960) == 40960;
	    };
	    Stats.prototype.isFIFO = function () {
	        return (this.mode & 4096) == 4096;
	    };
	    Stats.prototype.isSocket = function () {
	        return (this.mode & 49152) == 49152;
	    };
	    return Stats;
	}());
	exports.Stats = Stats;
	function accessSync(path, mode) {
	    if (mode === void 0) { mode = F_OK; }
	    var vpath = validPathOrThrow(path);
	    var res = libjs.access(vpath, mode);
	    if (res < 0)
	        throwError(res, 'access', vpath);
	}
	function access(path, a, b) {
	    var mode, callback;
	    if (typeof a === 'function') {
	        callback = a;
	        mode = F_OK;
	    }
	    else {
	        mode = a;
	        callback = b;
	        validateCallback(callback);
	    }
	    var vpath = pathOrError(path);
	    if (vpath instanceof TypeError)
	        return callback(vpath);
	    libjs.accessAsync(vpath, mode, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'access', vpath)));
	        else
	            callback(null);
	    });
	}
	function appendFileSync(file, data, options) {
	    if (!options)
	        options = appendFileDefaults;
	    else {
	        var tipof = typeof options;
	        switch (tipof) {
	            case 'object':
	                options = extend({}, appendFileDefaults, options);
	                break;
	            case 'string':
	                options = extend({ encoding: options }, appendFileDefaults);
	                break;
	            default:
	                throw TypeError(ERRSTR_OPTS(tipof));
	        }
	    }
	    var b;
	    if (buffer_1.Buffer.isBuffer(data))
	        b = data;
	    else
	        b = new buffer_1.Buffer(String(data), options.encoding);
	    var sb = static_buffer_1.StaticBuffer.isStaticBuffer(b) ? b : static_buffer_1.StaticBuffer.from(b);
	    var fd;
	    var is_fd = typeof file === 'number';
	    if (is_fd) {
	        fd = file;
	    }
	    else {
	        var filename;
	        if (buffer_1.Buffer.isBuffer(file))
	            filename = file.toString();
	        else if (typeof file === 'string')
	            filename = file;
	        else
	            throw TypeError(ERRSTR.PATH_STR);
	        var flags = flagsToFlagsValue(options.flag);
	        if (typeof options.mode !== 'number')
	            throw TypeError(ERRSTR.MODE_INT);
	        fd = libjs.open(filename, flags, options.mode);
	        if (fd < 0)
	            throwError(fd, 'appendFile', filename);
	    }
	    var res = libjs.write(fd, sb);
	    if (res < 0)
	        throwError(res, 'appendFile', String(file));
	    if (!is_fd)
	        libjs.close(fd);
	}
	function appendFile(file, data, options, callback) {
	    var opts;
	    if (typeof options === 'function') {
	        callback = options;
	        opts = appendFileDefaults;
	    }
	    else {
	        var tipof = typeof options;
	        switch (tipof) {
	            case 'object':
	                opts = extend({}, appendFileDefaults, options);
	                break;
	            case 'string':
	                opts = extend({ encoding: options }, appendFileDefaults);
	                break;
	            default:
	                throw TypeError(ERRSTR_OPTS(tipof));
	        }
	        validateCallback(callback);
	    }
	    var b;
	    if (buffer_1.Buffer.isBuffer(data))
	        b = data;
	    else
	        b = new buffer_1.Buffer(String(data), opts.encoding);
	    var sb = static_buffer_1.StaticBuffer.isStaticBuffer(b) ? b : static_buffer_1.StaticBuffer.from(b);
	    function on_open(fd, is_fd) {
	        var res = libjs.write(fd, sb);
	        if (res < 0)
	            throwError(res, 'appendFile', String(file));
	        if (!is_fd)
	            libjs.closeAsync(fd, noop);
	    }
	    var fd;
	    var is_fd = typeof file === 'number';
	    if (is_fd) {
	        fd = file;
	        on_open(fd, is_fd);
	    }
	    else {
	        var filename;
	        if (buffer_1.Buffer.isBuffer(file))
	            filename = file.toString();
	        else if (typeof file === 'string')
	            filename = file;
	        else
	            throw TypeError(ERRSTR.PATH_STR);
	        var flags = flagsToFlagsValue(opts.flag);
	        if (typeof opts.mode !== 'number')
	            throw TypeError(ERRSTR.MODE_INT);
	        libjs.openAsync(filename, flags, opts.mode, function (fd) {
	            if (fd < 0)
	                return callback(Error(formatError(fd, 'appendFile', filename)));
	            on_open(fd, is_fd);
	        });
	    }
	}
	function chmodSync(path, mode) {
	    var vpath = validPathOrThrow(path);
	    if (typeof mode !== 'number')
	        throw TypeError(ERRSTR.MODE_INT);
	    var result = libjs.chmod(vpath, mode);
	    if (result < 0)
	        throwError(result, 'chmod', vpath);
	}
	function chmod(path, mode, callback) {
	    var vpath = validPathOrThrow(path);
	    if (typeof mode !== 'number')
	        throw TypeError(ERRSTR.MODE_INT);
	    libjs.chmodAsync(vpath, mode, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'chmod', vpath)));
	        else
	            callback(null);
	    });
	}
	function fchmodSync(fd, mode) {
	    validateFd(fd);
	    if (typeof mode !== 'number')
	        throw TypeError(ERRSTR.MODE_INT);
	    var result = libjs.fchmod(fd, mode);
	    if (result < 0)
	        throwError(result, 'chmod');
	}
	function fchmod(fd, mode, callback) {
	    validateFd(fd);
	    if (typeof mode !== 'number')
	        throw TypeError(ERRSTR.MODE_INT);
	    libjs.fchmodAsync(fd, mode, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'chmod')));
	        else
	            callback(null);
	    });
	}
	function chownSync(path, uid, gid) {
	    var vpath = validPathOrThrow(path);
	    if (typeof uid !== 'number')
	        throw TypeError(ERRSTR.UID);
	    if (typeof gid !== 'number')
	        throw TypeError(ERRSTR.GID);
	    var result = libjs.chown(vpath, uid, gid);
	    if (result < 0)
	        throwError(result, 'chown', vpath);
	}
	function chown(path, uid, gid, callback) {
	    var vpath = validPathOrThrow(path);
	    if (typeof uid !== 'number')
	        throw TypeError(ERRSTR.UID);
	    if (typeof gid !== 'number')
	        throw TypeError(ERRSTR.GID);
	    libjs.chownAsync(vpath, uid, gid, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'chown', vpath)));
	        else
	            callback(null);
	    });
	}
	function fchownSync(fd, uid, gid) {
	    validateFd(fd);
	    if (typeof uid !== 'number')
	        throw TypeError(ERRSTR.UID);
	    if (typeof gid !== 'number')
	        throw TypeError(ERRSTR.GID);
	    var result = libjs.fchown(fd, uid, gid);
	    if (result < 0)
	        throwError(result, 'fchown');
	}
	function fchown(fd, uid, gid, callback) {
	    validateFd(fd);
	    if (typeof uid !== 'number')
	        throw TypeError(ERRSTR.UID);
	    if (typeof gid !== 'number')
	        throw TypeError(ERRSTR.GID);
	    libjs.fchownAsync(fd, uid, gid, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'fchown')));
	        else
	            callback(null);
	    });
	}
	function lchownSync(path, uid, gid) {
	    var vpath = validPathOrThrow(path);
	    if (typeof uid !== 'number')
	        throw TypeError(ERRSTR.UID);
	    if (typeof gid !== 'number')
	        throw TypeError(ERRSTR.GID);
	    var result = libjs.lchown(vpath, uid, gid);
	    if (result < 0)
	        throwError(result, 'lchown', vpath);
	}
	function lchown(path, uid, gid, callback) {
	    var vpath = validPathOrThrow(path);
	    if (typeof uid !== 'number')
	        throw TypeError(ERRSTR.UID);
	    if (typeof gid !== 'number')
	        throw TypeError(ERRSTR.GID);
	    libjs.lchownAsync(vpath, uid, gid, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'lchown', vpath)));
	        else
	            callback(null);
	    });
	}
	function closeSync(fd) {
	    if (typeof fd !== 'number')
	        throw TypeError(ERRSTR.FD);
	    var result = libjs.close(fd);
	    if (result < 0)
	        throwError(result, 'close');
	}
	function close(fd, callback) {
	    if (typeof fd !== 'number')
	        throw TypeError(ERRSTR.FD);
	    libjs.closeAsync(fd, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'close')));
	        else
	            callback(null);
	    });
	}
	function existsSync(path) {
	    try {
	        accessSync(path);
	        return true;
	    }
	    catch (e) {
	        return false;
	    }
	}
	function exists(path, callback) {
	    access(path, function (err) { callback(!err); });
	}
	function fsyncSync(fd) {
	    if (typeof fd !== 'number')
	        throw TypeError(ERRSTR.FD);
	    var result = libjs.fsync(fd);
	    if (result < 0)
	        throwError(result, 'fsync');
	}
	function fsync(fd, callback) {
	    if (typeof fd !== 'number')
	        throw TypeError(ERRSTR.FD);
	    libjs.fsyncAsync(fd, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'fsync')));
	        else
	            callback(null);
	    });
	}
	function fdatasyncSync(fd) {
	    if (typeof fd !== 'number')
	        throw TypeError(ERRSTR.FD);
	    var result = libjs.fdatasync(fd);
	    if (result < 0)
	        throwError(result, 'fdatasync');
	}
	function fdatasync(fd, callback) {
	    if (typeof fd !== 'number')
	        throw TypeError(ERRSTR.FD);
	    libjs.fdatasyncAsync(fd, function (result) {
	        if (result < 0)
	            callback(Error(formatError(result, 'fdatasync')));
	        else
	            callback(null);
	    });
	}
	function createStatsObject(res) {
	    var stats = new Stats;
	    stats.dev = res.dev;
	    stats.mode = res.mode;
	    stats.nlink = res.nlink;
	    stats.uid = res.uid;
	    stats.gid = res.gid;
	    stats.rdev = res.rdev;
	    stats.blksize = res.blksize;
	    stats.ino = res.ino;
	    stats.size = res.size;
	    stats.blocks = res.blocks;
	    stats.atime = new Date((res.atime * 1000) + Math.floor(res.atime_nsec / 1000000));
	    stats.mtime = new Date((res.mtime * 1000) + Math.floor(res.mtime_nsec / 1000000));
	    stats.ctime = new Date((res.ctime * 1000) + Math.floor(res.ctime_nsec / 1000000));
	    stats.birthtime = stats.ctime;
	    return stats;
	}
	function statSync(path) {
	    var vpath = validPathOrThrow(path);
	    try {
	        var res = libjs.stat(vpath);
	        return createStatsObject(res);
	    }
	    catch (errno) {
	        throwError(errno, 'stat', vpath);
	    }
	}
	function stat(path, callback) {
	    var vpath = validPathOrThrow(path);
	    libjs.statAsync(vpath, function (err, res) {
	        if (err)
	            callback(Error(formatError(err, 'stat', vpath)));
	        else
	            callback(null, createStatsObject(res));
	    });
	}
	function fstatSync(fd) {
	    validateFd(fd);
	    try {
	        var res = libjs.fstat(fd);
	        return createStatsObject(res);
	    }
	    catch (errno) {
	        throwError(errno, 'fstat');
	    }
	}
	function fstat(fd, callback) {
	    validateFd(fd);
	    libjs.fstatAsync(fd, function (err, res) {
	        if (err)
	            callback(Error(formatError(err, 'fstat')));
	        else
	            callback(null, createStatsObject(res));
	    });
	}
	function lstatSync(path) {
	    var vpath = validPathOrThrow(path);
	    try {
	        var res = libjs.lstat(vpath);
	        return createStatsObject(res);
	    }
	    catch (errno) {
	        throwError(errno, 'lstat', vpath);
	    }
	}
	function lstat(path, callback) {
	    var vpath = validPathOrThrow(path);
	    libjs.lstatAsync(vpath, function (err, res) {
	        if (err)
	            callback(Error(formatError(err, 'lstat', vpath)));
	        else
	            callback(null, createStatsObject(res));
	    });
	}
	function truncateSync(path, len) {
	    var vpath = validPathOrThrow(path);
	    if (typeof len !== 'number')
	        throw TypeError(ERRSTR.LEN);
	    var res = libjs.truncate(vpath, len);
	    if (res < 0)
	        throwError(res, 'truncate', vpath);
	}
	function truncate(path, len, callback) {
	    var vpath = validPathOrThrow(path);
	    if (typeof len !== 'number')
	        throw TypeError(ERRSTR.LEN);
	    libjs.truncateAsync(vpath, len, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'truncate', vpath)));
	        else
	            callback(null);
	    });
	}
	function ftruncateSync(fd, len) {
	    validateFd(fd);
	    if (typeof len !== 'number')
	        throw TypeError(ERRSTR.LEN);
	    var res = libjs.ftruncate(fd, len);
	    if (res < 0)
	        throwError(res, 'ftruncate');
	}
	function ftruncate(fd, len, callback) {
	    validateFd(fd);
	    if (typeof len !== 'number')
	        throw TypeError(ERRSTR.LEN);
	    libjs.ftruncateAsync(fd, len, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'ftruncate')));
	        else
	            callback(null);
	    });
	}
	function utimesSync(path, atime, mtime) {
	    var vpath = validPathOrThrow(path);
	    if (typeof atime !== 'number')
	        throw TypeError(ERRSTR.ATIME);
	    if (typeof mtime !== 'number')
	        throw TypeError(ERRSTR.MTIME);
	    var vatime = atime;
	    var vmtime = mtime;
	    if (!isFinite(vatime))
	        vatime = Date.now();
	    if (!isFinite(vmtime))
	        vmtime = Date.now();
	    vatime = Math.round(vatime / 1000);
	    vmtime = Math.round(vmtime / 1000);
	    var times = {
	        actime: [libjs.UInt64.lo(vatime), libjs.UInt64.hi(vatime)],
	        modtime: [libjs.UInt64.lo(vmtime), libjs.UInt64.hi(vmtime)]
	    };
	    var res = libjs.utime(vpath, times);
	    if (res < 0)
	        throwError(res, 'utimes', vpath);
	}
	function utimes(path, atime, mtime, callback) {
	    var vpath = validPathOrThrow(path);
	    if (typeof atime !== 'number')
	        throw TypeError(ERRSTR.ATIME);
	    if (typeof mtime !== 'number')
	        throw TypeError(ERRSTR.MTIME);
	    var vatime = atime;
	    var vmtime = mtime;
	    if (!isFinite(vatime))
	        vatime = Date.now();
	    if (!isFinite(vmtime))
	        vmtime = Date.now();
	    vatime = Math.round(vatime / 1000);
	    vmtime = Math.round(vmtime / 1000);
	    var times = {
	        actime: [libjs.UInt64.lo(vatime), libjs.UInt64.hi(vatime)],
	        modtime: [libjs.UInt64.lo(vmtime), libjs.UInt64.hi(vmtime)]
	    };
	    libjs.utimeAsync(vpath, times, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'utimes', vpath)));
	        else
	            callback(null);
	    });
	}
	function linkSync(srcpath, dstpath) {
	    var vsrcpath = validPathOrThrow(srcpath);
	    var vdstpath = validPathOrThrow(dstpath);
	    var res = libjs.link(vsrcpath, vdstpath);
	    if (res < 0)
	        throwError(res, 'link', vsrcpath, vdstpath);
	}
	function link(srcpath, dstpath, callback) {
	    var vsrcpath = validPathOrThrow(srcpath);
	    var vdstpath = validPathOrThrow(dstpath);
	    libjs.linkAsync(vsrcpath, vdstpath, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'link', vsrcpath, vdstpath)));
	        else
	            callback(null);
	    });
	}
	function mkdirSync(path, mode) {
	    if (mode === void 0) { mode = 511; }
	    var vpath = validPathOrThrow(path);
	    if (typeof mode !== 'number')
	        throw TypeError(ERRSTR.MODE_INT);
	    var res = libjs.mkdir(vpath, mode);
	    if (res < 0)
	        throwError(res, 'mkdir', vpath);
	}
	function mkdir(path, mode, callback) {
	    if (mode === void 0) { mode = 511; }
	    var vpath = validPathOrThrow(path);
	    if (typeof mode === 'function') {
	        callback = mode;
	        mode = 511;
	    }
	    else {
	        if (typeof mode !== 'number')
	            throw TypeError(ERRSTR.MODE_INT);
	        if (typeof callback !== 'function')
	            throw TypeError(ERRSTR.CB);
	    }
	    libjs.mkdirAsync(vpath, mode, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'mkdir', vpath)));
	        else
	            callback(null);
	    });
	}
	function rndStr6() {
	    return (+new Date).toString(36).slice(-6);
	}
	function mkdtempSync(prefix) {
	    if (!prefix || typeof prefix !== 'string')
	        throw new TypeError(ERRSTR.PREFIX);
	    var retries = 10;
	    var fullname;
	    var found_tmp_name = false;
	    for (var i = 0; i < retries; i++) {
	        fullname = prefix + rndStr6();
	        try {
	            accessSync(fullname);
	        }
	        catch (e) {
	            found_tmp_name = true;
	            break;
	        }
	    }
	    if (found_tmp_name) {
	        mkdirSync(fullname);
	        return fullname;
	    }
	    else {
	        throw Error("Could not find a new name, mkdtemp");
	    }
	}
	function mkdtemp(prefix, callback) {
	    if (!prefix || typeof prefix !== 'string')
	        throw new TypeError(ERRSTR.PREFIX);
	    var retries = 10;
	    var fullname;
	    function mk_dir() {
	        mkdir(fullname, function (err) {
	            if (err)
	                callback(err);
	            else
	                callback(null, fullname);
	        });
	    }
	    function name_loop() {
	        if (retries < 1) {
	            callback(Error('Could not find a new name, mkdtemp'));
	            return;
	        }
	        retries--;
	        fullname = prefix + rndStr6();
	        access(fullname, function (err) {
	            if (err)
	                mk_dir();
	            else
	                name_loop();
	        });
	    }
	    name_loop();
	}
	function openSync(path, flags, mode) {
	    if (mode === void 0) { mode = 438; }
	    var vpath = validPathOrThrow(path);
	    var flagsval = flagsToFlagsValue(flags);
	    if (typeof mode !== 'number')
	        throw TypeError(ERRSTR.MODE_INT);
	    var res = libjs.open(vpath, flagsval, mode);
	    if (res < 0)
	        throwError(res, 'open', vpath);
	    return res;
	}
	function open(path, flags, mode, callback) {
	    if (typeof mode === 'function') {
	        callback = mode;
	        mode = 438;
	    }
	    var vpath = validPathOrThrow(path);
	    var flagsval = flagsToFlagsValue(flags);
	    if (typeof mode !== 'number')
	        throw TypeError(ERRSTR.MODE_INT);
	    libjs.openAsync(vpath, flagsval, mode, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'open', vpath)));
	        return callback(null, res);
	    });
	}
	function readSync(fd, buffer, offset, length, position) {
	    validateFd(fd);
	    if (!(buffer instanceof buffer_1.Buffer))
	        throw TypeError(ERRSTR.BUFFER);
	    if (typeof offset !== 'number')
	        throw TypeError(ERRSTR.OFFSET);
	    if (typeof length !== 'number')
	        throw TypeError(ERRSTR.LENGTH);
	    if (position !== null) {
	        if (typeof position !== 'number')
	            throw TypeError(ERRSTR.POSITION);
	        var seekres = libjs.lseek(fd, position, 0);
	        if (seekres < 0)
	            throwError(seekres, 'read');
	    }
	    var buf = buffer.slice(offset, offset + length);
	    var res = libjs.read(fd, buf);
	    if (res < 0)
	        throwError(res, 'read');
	    return res;
	}
	function read(fd, buffer, offset, length, position, callback) {
	    validateFd(fd);
	    if (!(buffer instanceof buffer_1.Buffer))
	        throw TypeError(ERRSTR.BUFFER);
	    if (typeof offset !== 'number')
	        throw TypeError(ERRSTR.OFFSET);
	    if (typeof length !== 'number')
	        throw TypeError(ERRSTR.LENGTH);
	    function do_read() {
	        var buf = buffer.slice(offset, offset + length);
	        libjs.readAsync(fd, buf, function (res) {
	            if (res < 0)
	                callback(Error(formatError(res, 'read')));
	            else
	                callback(null, res, buffer);
	        });
	    }
	    if (position !== null) {
	        if (typeof position !== 'number')
	            throw TypeError(ERRSTR.POSITION);
	        libjs.lseekAsync(fd, position, 0, function (seekres) {
	            if (seekres < 0)
	                callback(Error(formatError(seekres, 'read')));
	            else
	                do_read();
	        });
	    }
	    else {
	        do_read();
	    }
	}
	function optsEncoding(options) {
	    if (!options)
	        return optionsDefaults.encoding;
	    else {
	        var typeofopt = typeof options;
	        switch (typeofopt) {
	            case 'string': return options;
	            case 'object':
	                return options.encoding
	                    ? options.encoding : optionsDefaults.encoding;
	            default: throw TypeError(ERRSTR_OPTS(typeofopt));
	        }
	    }
	}
	function readdirSync(path, options) {
	    var vpath = validPathOrThrow(path);
	    var encoding = optsEncoding(options);
	    return libjs.readdirList(vpath, encoding);
	}
	function readdir(path, options, callback) {
	    var vpath = validPathOrThrow(path);
	    var encoding;
	    if (typeof options === 'function') {
	        callback = options;
	        encoding = optionsDefaults.encoding;
	    }
	    else {
	        encoding = optsEncoding(options);
	        validateCallback(callback);
	    }
	    options = extend(options, optionsDefaults);
	    libjs.readdirListAsync(vpath, encoding, function (errno, list) {
	        if (errno < 0)
	            callback(Error(formatError(errno, 'readdir', vpath)));
	        else
	            callback(null, list);
	    });
	}
	var getReadFileOptions = optionGenerator(readFileOptionsDefaults);
	function readFileSync(file, options) {
	    var opts = getReadFileOptions(options);
	    var fd;
	    var is_fd = typeof file === 'number';
	    if (is_fd)
	        fd = file;
	    else {
	        var vfile = validPathOrThrow(file);
	        var flag = flagsToFlagsValue(opts.flag);
	        fd = libjs.open(vfile, flag, 438);
	        if (fd < 0)
	            throwError(fd, 'readFile', vfile);
	    }
	    var list = [];
	    do {
	        var buf = new buffer_1.Buffer(CHUNK);
	        var res = libjs.read(fd, buf);
	        if (res < 0)
	            throwError(res, 'readFile');
	        if (res < CHUNK)
	            buf = buf.slice(0, res);
	        list.push(buf);
	    } while (res > 0);
	    if (!is_fd)
	        libjs.close(fd);
	    var buffer = buffer_1.Buffer.concat(list);
	    if (opts.encoding)
	        return buffer.toString(opts.encoding);
	    else
	        return buffer;
	}
	var getReadFileOptionsAndCallback = optionAndCallbackGenerator(getReadFileOptions);
	function readFile(file, options, cb) {
	    if (options === void 0) { options = {}; }
	    var _a = getReadFileOptionsAndCallback(options, cb), opts = _a[0], callback = _a[1];
	    var is_fd = typeof file === 'number';
	    function on_open(fd) {
	        var list = [];
	        function done() {
	            var buffer = buffer_1.Buffer.concat(list);
	            if (opts.encoding)
	                callback(null, buffer.toString(opts.encoding));
	            else
	                callback(null, buffer);
	            if (!is_fd)
	                libjs.closeAsync(fd, noop);
	        }
	        function loop() {
	            var buf = new static_buffer_1.StaticBuffer(CHUNK);
	            libjs.readAsync(fd, buf, function (res) {
	                if (res < 0)
	                    return callback(Error(formatError(res, 'readFile')));
	                if (res < CHUNK)
	                    buf = buf.slice(0, res);
	                list.push(buf);
	                if (res > 0)
	                    loop();
	                else
	                    done();
	            });
	        }
	        loop();
	    }
	    if (is_fd)
	        on_open(file);
	    else {
	        var vfile = validPathOrThrow(file);
	        var flag = flagsToFlagsValue(opts.flag);
	        libjs.openAsync(vfile, flag, 438, function (fd) {
	            if (fd < 0)
	                callback(Error(formatError(fd, 'readFile', vfile)));
	            else
	                on_open(fd);
	        });
	    }
	}
	function readlinkSync(path, options) {
	    if (options === void 0) { options = null; }
	    var vpath = validPathOrThrow(path);
	    var encBuffer = false;
	    var filename;
	    if (typeof path === 'string') {
	        filename = path;
	    }
	    else if (buffer_1.Buffer.isBuffer(path)) {
	        var encoding = optsEncoding(options);
	        if (encoding === 'buffer') {
	            filename = path.toString();
	            encBuffer = true;
	        }
	        else {
	            filename = path.toString(encoding);
	        }
	    }
	    else
	        throw TypeError(ERRSTR.PATH_STR);
	    try {
	        var res = libjs.readlink(filename);
	    }
	    catch (errno) {
	        throwError(errno, 'readlink', vpath);
	    }
	    return !encBuffer ? res : new buffer_1.Buffer(res);
	}
	function renameSync(oldPath, newPath) {
	    var voldPath = validPathOrThrow(oldPath);
	    var vnewPath = validPathOrThrow(newPath);
	    var res = libjs.rename(voldPath, vnewPath);
	    if (res < 0)
	        throwError(res, 'rename', voldPath, vnewPath);
	}
	function rename(oldPath, newPath, callback) {
	    var voldPath = validPathOrThrow(oldPath);
	    var vnewPath = validPathOrThrow(newPath);
	    libjs.renameAsync(voldPath, vnewPath, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'rename', voldPath, vnewPath)));
	        else
	            callback(null);
	    });
	}
	function rmdirSync(path) {
	    var vpath = validPathOrThrow(path);
	    var res = libjs.rmdir(vpath);
	    if (res < 0)
	        throwError(res, 'rmdir', vpath);
	}
	function rmdir(path, callback) {
	    var vpath = validPathOrThrow(path);
	    libjs.rmdirAsync(vpath, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'rmdir', vpath)));
	        else
	            callback(null);
	    });
	}
	function symlinkSync(target, path) {
	    var vtarget = validPathOrThrow(target);
	    var vpath = validPathOrThrow(path);
	    var res = libjs.symlink(vtarget, vpath);
	    if (res < 0)
	        throwError(res, 'symlink', vtarget, vpath);
	}
	function symlink(target, path, type, callback) {
	    var vtarget = validPathOrThrow(target);
	    var vpath = validPathOrThrow(path);
	    if (typeof type === 'function') {
	        callback = type;
	    }
	    validateCallback(callback);
	    libjs.symlinkAsync(vtarget, vpath, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'symlink', vtarget, vpath)));
	        else
	            callback(null);
	    });
	}
	function unlinkSync(path) {
	    var vpath = validPathOrThrow(path);
	    var res = libjs.unlink(vpath);
	    if (res < 0)
	        throwError(res, 'unlink', vpath);
	}
	function unlink(path, callback) {
	    var vpath = validPathOrThrow(path);
	    libjs.unlinkAsync(vpath, function (res) {
	        if (res < 0)
	            callback(Error(formatError(res, 'unlink', vpath)));
	        else
	            callback(null);
	    });
	}
	function createWriteStream(path, options) { }
	var FSWatcher = (function (_super) {
	    __extends(FSWatcher, _super);
	    function FSWatcher() {
	        _super.apply(this, arguments);
	        this.inotify = new inotify_1.Inotify;
	    }
	    FSWatcher.prototype.start = function (filename, persistent, recursive, encoding) {
	        var _this = this;
	        this.inotify.encoding = encoding;
	        this.inotify.onerror = noop;
	        this.inotify.onevent = function (event) {
	            var is_rename = (event.mask & 192) || (event.mask & 256);
	            if (is_rename) {
	                _this.emit('change', 'rename', event.name);
	            }
	            else {
	                _this.emit('change', 'change', event.name);
	            }
	        };
	        this.inotify.start();
	        this.inotify.addPath(filename);
	    };
	    FSWatcher.prototype.close = function () {
	        this.inotify.stop();
	        this.inotify = null;
	    };
	    return FSWatcher;
	}(EE));
	var watchOptionsDefaults = {
	    encoding: 'utf8',
	    persistent: true,
	    recursive: false
	};
	var StatWatcher = (function (_super) {
	    __extends(StatWatcher, _super);
	    function StatWatcher() {
	        _super.apply(this, arguments);
	        this.last = null;
	    }
	    StatWatcher.prototype.loop = function () {
	        var _this = this;
	        stat(this.filename, function (err, stats) {
	            if (err)
	                return _this.emit('error', err);
	            if (_this.last instanceof Stats) {
	                if (_this.last.atime.getTime() != stats.atime.getTime()) {
	                    _this.emit('change', stats, _this.last);
	                }
	            }
	            _this.last = stats;
	        });
	    };
	    StatWatcher.prototype.start = function (filename, persistent, interval) {
	        var _this = this;
	        this.filename = filename;
	        stat(filename, function (err, stats) {
	            if (err)
	                return _this.emit('error', err);
	            _this.last = stats;
	            _this.interval = setInterval(_this.loop.bind(_this), interval);
	        });
	    };
	    StatWatcher.prototype.stop = function () {
	        clearInterval(this.interval);
	        this.last = null;
	    };
	    StatWatcher.map = {};
	    return StatWatcher;
	}(EventEmitter));
	var watchFileOptionDefaults = {
	    persistent: true,
	    interval: 5007
	};
	function watchFile(filename, a, b) {
	    if (a === void 0) { a = {}; }
	    var vfilename = validPathOrThrow(filename);
	    vfilename = pathModule.resolve(vfilename);
	    var opts;
	    var listener;
	    if (typeof a !== 'object') {
	        opts = watchFileOptionDefaults;
	        listener = a;
	    }
	    else {
	        opts = extend(a, watchFileOptionDefaults);
	        listener = b;
	    }
	    if (typeof listener !== 'function')
	        throw new Error('"watchFile()" requires a listener function');
	    var watcher = StatWatcher.map[vfilename];
	    if (!watcher) {
	        watcher = new StatWatcher;
	        watcher.start(vfilename, opts.persistent, opts.interval);
	        StatWatcher.map[vfilename] = watcher;
	    }
	    watcher.on('change', listener);
	    return watcher;
	}
	function unwatchFile(filename, listener) {
	    var vfilename = validPathOrThrow(filename);
	    vfilename = pathModule.resolve(vfilename);
	    var watcher = StatWatcher.map[vfilename];
	    if (!watcher)
	        return;
	    if (typeof listener === 'function')
	        watcher.removeListener('change', listener);
	    else
	        watcher.removeAllListeners('change');
	    if (watcher.listenerCount('change') === 0) {
	        watcher.stop();
	        delete StatWatcher.map[vfilename];
	    }
	}
	function writeSync(fd, data, a, b, c) {
	    validateFd(fd);
	    var buf;
	    var position;
	    if (typeof b === 'number') {
	        if (!(data instanceof buffer_1.Buffer))
	            throw TypeError('buffer must be instance of Buffer.');
	        var offset = a;
	        if (typeof offset !== 'number')
	            throw TypeError('offset must be an integer');
	        var length = b;
	        buf = data.slice(offset, offset + length);
	        position = c;
	    }
	    else {
	        var encoding = 'utf8';
	        if (b) {
	            if (typeof b !== 'string')
	                throw TypeError('encoding must be a string');
	            encoding = b;
	        }
	        if (data instanceof buffer_1.Buffer)
	            buf = data;
	        else if (typeof data === 'string') {
	            buf = new buffer_1.Buffer(data, encoding);
	        }
	        else
	            throw TypeError('data must be a Buffer or a string.');
	        position = a;
	    }
	    if (typeof position === 'number') {
	        var sres = libjs.lseek(fd, position, 0);
	        if (sres < 0)
	            throwError(sres, 'write:lseek');
	    }
	    var sb = static_buffer_1.StaticBuffer.isStaticBuffer(buf)
	        ? buf : static_buffer_1.StaticBuffer.from(buf);
	    var res = libjs.write(fd, sb);
	    if (res < 0)
	        throwError(res, 'write');
	}
	var getWriteFileOptions = optionGenerator(writeFileDefaults);
	function writeFileSync(file, data, options) {
	    var opts = getWriteFileOptions(options);
	    var fd;
	    var vpath;
	    var is_fd = typeof file === 'number';
	    if (is_fd) {
	        fd = file;
	    }
	    else {
	        vpath = validPathOrThrow(file);
	        var flags = flagsToFlagsValue(opts.flag);
	        fd = libjs.open(vpath, flags, opts.mode);
	        if (fd < 0)
	            throwError(fd, 'writeFile', vpath);
	    }
	    var sb = static_buffer_1.StaticBuffer.isStaticBuffer(data) ? data : static_buffer_1.StaticBuffer.from(data);
	    var res = libjs.write(fd, sb);
	    if (res < 0)
	        throwError(res, 'writeFile', is_fd ? String(fd) : vpath);
	    if (!is_fd)
	        libjs.close(fd);
	}
	var getWriteFileOptionsAndCallback = optionAndCallbackGenerator(getWriteFileOptions);
	function writeFile(file, data, options, cb) {
	    var _a = getWriteFileOptionsAndCallback(options, cb), opts = _a[0], callback = _a[1];
	    var is_fd = typeof file === 'number';
	    function on_write(fd) {
	        var sb = isSB(data) ? data : static_buffer_1.StaticBuffer.from(data);
	        libjs.writeAsync(fd, sb, function (res) {
	            if (res < 0)
	                callback(Error(formatError(res, 'writeFile', is_fd ? String(fd) : vpath)));
	            else
	                callback(null, sb);
	            setTimeout(function () {
	                sb.print();
	            }, 100);
	            if (!is_fd)
	                libjs.closeAsync(fd, noop);
	        });
	    }
	    if (is_fd)
	        on_write(file);
	    else {
	        var vpath = validPathOrThrow(file);
	        var flags = flagsToFlagsValue(opts.flag);
	        libjs.openAsync(vpath, flags, opts.mode, function (fd) {
	            if (fd < 0)
	                callback(Error(formatError(fd, 'writeFile', vpath)));
	            else
	                on_write(fd);
	        });
	    }
	}


/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	var require;'use strict';

	exports = module.exports = {
	    makeRequireFunction: makeRequireFunction,
	    stripBOM: stripBOM,
	    addBuiltinLibsToObject: addBuiltinLibsToObject
	};

	exports.requireDepth = 0;

	// Invoke with makeRequireFunction.call(module) where |module| is the
	// Module object to use as the context for the require() function.
	function makeRequireFunction() {
	    var Module = this.constructor;
	    var self = this;

	    function require(path) {
	        try {
	            exports.requireDepth += 1;
	            return self.require(path);
	        } finally {
	            exports.requireDepth -= 1;
	        }
	    }

	    function resolve(request) {
	        return Module._resolveFilename(request, self);
	    }

	    require.resolve = resolve;

	    require.main = process.mainModule;

	    // Enable support to add extra extension types.
	    require.extensions = Module._extensions;

	    require.cache = Module._cache;

	    return require;
	}

	/**
	 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
	 * because the buffer-to-string conversion in `fs.readFileSync()`
	 * translates it to FEFF, the UTF-16 BOM.
	 */
	function stripBOM(content) {
	    if (content.charCodeAt(0) === 0xFEFF) {
	        content = content.slice(1);
	    }
	    return content;
	}

	exports.builtinLibs = ['assert', 'buffer', 'child_process', 'cluster',
	    'crypto', 'dgram', 'dns', 'domain', 'events', 'fs', 'http', 'https', 'net',
	    'os', 'path', 'punycode', 'querystring', 'readline', 'repl', 'stream',
	    'string_decoder', 'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib'];

	function addBuiltinLibsToObject(object) {
	    // Make built-in modules available directly (loaded lazily).
	    exports.builtinLibs.forEach(function (name) {
	        // Goals of this mechanism are:
	        // - Lazy loading of built-in modules
	        // - Having all built-in modules available as non-enumerable properties
	        // - Allowing the user to re-assign these variables as if there were no
	        //   pre-existing globals with the same name.

	        var setReal = function(val) {
	        // Deleting the property before re-assigning it disables the
	        // getter/setter mechanism.
	        delete object[name];
	    object[name] = val;
	};

	    Object.defineProperty(object, name, {
	            get: function() {
	                var r = require;
	            var lib = __webpack_require__(49)(name);

	    // Disable the current getter/setter and set up a new
	    // non-enumerable property.
	    delete object[name];
	    Object.defineProperty(object, name, {
	            get: function() { return lib; },
	        set: setReal,
	        configurable: true,
	        enumerable: false
	});

	    return lib;
	},
	    set: setReal,
	        configurable: true,
	        enumerable: false
	});
	});
	}


/***/ },
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./module": 48,
		"./streams/BufferList": 28,
		"./streams/lazy_transform": 51,
		"./util": 31
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 49;


/***/ },
/* 50 */,
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	// LazyTransform is a special type of Transform stream that is lazily loaded.
	// This is used for performance with bi-API-ship: when two APIs are available
	// for the stream, one conventional and one non-conventional.
	'use strict';

	const stream = __webpack_require__(26);
	const util = __webpack_require__(6);

	module.exports = LazyTransform;

	function LazyTransform(options) {
	    this._options = options;
	}
	util.inherits(LazyTransform, stream.Transform);

	[
	    '_readableState',
	    '_writableState',
	    '_transformState'
	].forEach(function(prop, i, props) {
	    Object.defineProperty(LazyTransform.prototype, prop, {
	        get: function() {
	            stream.Transform.call(this, this._options);
	            this._writableState.decodeStrings = false;
	            this._writableState.defaultEncoding = 'latin1';
	            return this[prop];
	        },
	        set: function(val) {
	            Object.defineProperty(this, prop, {
	                value: val,
	                enumerable: true,
	                configurable: true,
	                writable: true
	            });
	        },
	        configurable: true,
	        enumerable: true
	    });
	});


/***/ },
/* 52 */
/***/ function(module, exports) {

	var Server = (function () {
	    function Server() {
	    }
	    Server.prototype.address = function () {
	    };
	    Server.prototype.close = function (callback) {
	    };
	    Server.prototype.getConnections = function (callback) {
	    };
	    Server.prototype.listen = function (handle, backlog, callback) {
	    };
	    Server.prototype.ref = function () {
	    };
	    Server.prototype.unref = function () {
	    };
	    return Server;
	}());


/***/ },
/* 53 */
/***/ function(module, exports) {

	'use strict';

	/** Highest positive signed 32-bit float value */
	var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128; // 0x80
	var delimiter = '-'; // '\x2D'

	/** Regular expressions */
	var regexPunycode = /^xn--/;
	var regexNonASCII = /[^\x20-\x7E]/; // unprintable ASCII chars + non-ASCII chars
	var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

	/** Error messages */
	var errors = {
	    'overflow': 'Overflow: input needs wider integers to process',
	    'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
	    'invalid-input': 'Invalid input'
	};

	/** Convenience shortcuts */
	var baseMinusTMin = base - tMin;
	var floor = Math.floor;
	var stringFromCharCode = String.fromCharCode;


	// `.fromCodePoint` shim
	if (!String.fromCodePoint) {
	    (function() {
	        var defineProperty = (function() {
	            // IE 8 only supports `Object.defineProperty` on DOM elements
	            try {
	                var object = {};
	                var $defineProperty = Object.defineProperty;
	                var result = $defineProperty(object, object, object) && $defineProperty;
	            } catch(error) {}
	            return result;
	        }());
	        var stringFromCharCode = String.fromCharCode;
	        var floor = Math.floor;
	        var fromCodePoint = function() {
	            var MAX_SIZE = 0x4000;
	            var codeUnits = [];
	            var highSurrogate;
	            var lowSurrogate;
	            var index = -1;
	            var length = arguments.length;
	            if (!length) {
	                return '';
	            }
	            var result = '';
	            while (++index < length) {
	                var codePoint = Number(arguments[index]);
	                if (
	                    !isFinite(codePoint) ||       // `NaN`, `+Infinity`, or `-Infinity`
	                    codePoint < 0 ||              // not a valid Unicode code point
	                    codePoint > 0x10FFFF ||       // not a valid Unicode code point
	                    floor(codePoint) != codePoint // not an integer
	                ) {
	                    throw RangeError('Invalid code point: ' + codePoint);
	                }
	                if (codePoint <= 0xFFFF) { // BMP code point
	                    codeUnits.push(codePoint);
	                } else { // Astral code point; split in surrogate halves
	                    // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
	                    codePoint -= 0x10000;
	                    highSurrogate = (codePoint >> 10) + 0xD800;
	                    lowSurrogate = (codePoint % 0x400) + 0xDC00;
	                    codeUnits.push(highSurrogate, lowSurrogate);
	                }
	                if (index + 1 == length || codeUnits.length > MAX_SIZE) {
	                    result += stringFromCharCode.apply(null, codeUnits);
	                    codeUnits.length = 0;
	                }
	            }
	            return result;
	        };
	        if (defineProperty) {
	            defineProperty(String, 'fromCodePoint', {
	                'value': fromCodePoint,
	                'configurable': true,
	                'writable': true
	            });
	        } else {
	            String.fromCodePoint = fromCodePoint;
	        }
	    }());
	}




	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
	    throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
	    var result = [];
	    var length = array.length;
	    while (length--) {
	        result[length] = fn(array[length]);
	    }
	    return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
	    var parts = string.split('@');
	    var result = '';
	    if (parts.length > 1) {
	        // In email addresses, only the domain name should be punycoded. Leave
	        // the local part (i.e. everything up to `@`) intact.
	        result = parts[0] + '@';
	        string = parts[1];
	    }
	    // Avoid `split(regex)` for IE8 compatibility. See #17.
	    string = string.replace(regexSeparators, '\x2E');
	    var labels = string.split('.');
	    var encoded = map(labels, fn).join('.');
	    return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
	    var output = [];
	    var counter = 0;
	    var length = string.length;
	    while (counter < length) {
	        var value = string.charCodeAt(counter++);
	        if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	            // It's a high surrogate, and there is a next character.
	            var extra = string.charCodeAt(counter++);
	            if ((extra & 0xFC00) == 0xDC00) { // Low surrogate.
	                output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	            } else {
	                // It's an unmatched surrogate; only append this code unit, in case the
	                // next code unit is the high surrogate of a surrogate pair.
	                output.push(value);
	                counter--;
	            }
	        } else {
	            output.push(value);
	        }
	    }
	    return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	var ucs2encode = function(array) { String.fromCodePoint.apply(null, array); }

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	var basicToDigit = function(codePoint) {
	    if (codePoint - 0x30 < 0x0A) {
	        return codePoint - 0x16;
	    }
	    if (codePoint - 0x41 < 0x1A) {
	        return codePoint - 0x41;
	    }
	    if (codePoint - 0x61 < 0x1A) {
	        return codePoint - 0x61;
	    }
	    return base;
	};

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	var digitToBasic = function(digit, flag) {
	    //  0..25 map to ASCII a..z or A..Z
	    // 26..35 map to ASCII 0..9
	    return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	};

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	var adapt = function(delta, numPoints, firstTime) {
	    var k = 0;
	    delta = firstTime ? floor(delta / damp) : delta >> 1;
	    delta += floor(delta / numPoints);
	    for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
	        delta = floor(delta / baseMinusTMin);
	    }
	    return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	};


	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	var decode = function(input) {
	    // Don't use UCS-2.
	    var output = [];
	    var inputLength = input.length;
	    var i = 0;
	    var n = initialN;
	    var bias = initialBias;

	    // Handle the basic code points: var `basic` be the number of input code
	    // points before the last delimiter, or `0` if there is none, then copy
	    // the first basic code points to the output.

	    var basic = input.lastIndexOf(delimiter);
	    if (basic < 0) {
	        basic = 0;
	    }

	    for (var j = 0; j < basic; ++j) {
	        // if it's not a basic code point
	        if (input.charCodeAt(j) >= 0x80) {
	            error('not-basic');
	        }
	        output.push(input.charCodeAt(j));
	    }

	    // Main decoding loop: start just after the last delimiter if any basic code
	    // points were copied; start at the beginning otherwise.

	    for (var index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

	        // `index` is the index of the next character to be consumed.
	        // Decode a generalized variable-length integer into `delta`,
	        // which gets added to `i`. The overflow checking is easier
	        // if we increase `i` as we go, then subtract off its starting
	        // value at the end to obtain `delta`.
	        var oldi = i;
	        for (var w = 1, k = base; /* no condition */; k += base) {

	            if (index >= inputLength) {
	                error('invalid-input');
	            }

	            var digit = basicToDigit(input.charCodeAt(index++));

	            if (digit >= base || digit > floor((maxInt - i) / w)) {
	                error('overflow');
	            }

	            i += digit * w;
	            var t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

	            if (digit < t) {
	                break;
	            }

	            var baseMinusT = base - t;
	            if (w > floor(maxInt / baseMinusT)) {
	                error('overflow');
	            }

	            w *= baseMinusT;

	        }

	        var out = output.length + 1;
	        bias = adapt(i - oldi, out, oldi == 0);

	        // `i` was supposed to wrap around from `out` to `0`,
	        // incrementing `n` each time, so we'll fix that now:
	        if (floor(i / out) > maxInt - n) {
	            error('overflow');
	        }

	        n += floor(i / out);
	        i %= out;

	        // Insert `n` at position `i` of the output.
	        output.splice(i++, 0, n);

	    }

	    return String.fromCodePoint.apply(null, output);
	};

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	var encode = function(input) {
	    var output = [];

	    // Convert the input in UCS-2 to an array of Unicode code points.
	    input = ucs2decode(input);

	    // Cache the length.
	    var inputLength = input.length;

	    // Initialize the state.
	    var n = initialN;
	    var delta = 0;
	    var bias = initialBias;

	    // Handle the basic code points.
	    for (var i = 0; i < input.length; i++) {
	        var currentValue = input[i];
	        if (currentValue < 0x80) {
	            output.push(stringFromCharCode(currentValue));
	        }
	    }

	    var basicLength = output.length;
	    var handledCPCount = basicLength;

	    // `handledCPCount` is the number of code points that have been handled;
	    // `basicLength` is the number of basic code points.

	    // Finish the basic string with a delimiter unless it's empty.
	    if (basicLength) {
	        output.push(delimiter);
	    }

	    // Main encoding loop:
	    while (handledCPCount < inputLength) {

	        // All non-basic code points < n have been handled already. Find the next
	        // larger one:
	        var m = maxInt;
	        for (var i = 0; i < input.length; i++) {
	            var currentValue = input[i];
	            if (currentValue >= n && currentValue < m) {
	                m = currentValue;
	            }
	        }

	        // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
	        // but guard against overflow.
	        var handledCPCountPlusOne = handledCPCount + 1;
	        if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
	            error('overflow');
	        }

	        delta += (m - n) * handledCPCountPlusOne;
	        n = m;

	        for (var i = 0; i < input.length; i++) {
	            var currentValue = input[i];
	            if (currentValue < n && ++delta > maxInt) {
	                error('overflow');
	            }
	            if (currentValue == n) {
	                // Represent delta as a generalized variable-length integer.
	                var q = delta;
	                for (var k = base; /* no condition */; k += base) {
	                    var t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	                    if (q < t) {
	                        break;
	                    }
	                    var qMinusT = q - t;
	                    var baseMinusT = base - t;
	                    output.push(
	                        stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
	                    );
	                    q = floor(qMinusT / baseMinusT);
	                }

	                output.push(stringFromCharCode(digitToBasic(q, 0)));
	                bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
	                delta = 0;
	                ++handledCPCount;
	            }
	        }

	        ++delta;
	        ++n;

	    }
	    return output.join('');
	};

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	var toUnicode = function(input) {
	    return mapDomain(input, function(string) {
	        return regexPunycode.test(string)
	            ? decode(string.slice(4).toLowerCase())
	            : string;
	    });
	};

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	var toASCII = function(input) {
	    return mapDomain(input, function(string) {
	        return regexNonASCII.test(string)
	            ? 'xn--' + encode(string)
	            : string;
	    });
	};

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	var punycode = {
	    /**
	     * A string representing the current Punycode.js version number.
	     * @memberOf punycode
	     * @type String
	     */
	    'version': '2.0.0',
	    /**
	     * An object of methods to convert from JavaScript's internal character
	     * representation (UCS-2) to Unicode code points, and back.
	     * @see <https://mathiasbynens.be/notes/javascript-encoding>
	     * @memberOf punycode
	     * @type Object
	     */
	    'ucs2': {
	        'decode': ucs2decode,
	        'encode': ucs2encode
	    },
	    'decode': decode,
	    'encode': encode,
	    'toASCII': toASCII,
	    'toUnicode': toUnicode
	};

	module.exports = punycode;


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	// Query String Utilities

	'use strict';

	const QueryString = exports;
	const Buffer = __webpack_require__(7).Buffer;

	// This constructor is used to store parsed query string values. Instantiating
	// this is faster than explicitly calling `Object.create(null)` to get a
	// "clean" empty object (tested with v8 v4.9).
	function ParsedQueryString() {}
	ParsedQueryString.prototype = Object.create(null);


	// a safe fast alternative to decodeURIComponent
	QueryString.unescapeBuffer = function(s, decodeSpaces) {
	    var out = Buffer.allocUnsafe(s.length);
	    var state = 0;
	    var n, m, hexchar;

	    for (var inIndex = 0, outIndex = 0; inIndex <= s.length; inIndex++) {
	        var c = inIndex < s.length ? s.charCodeAt(inIndex) : NaN;
	        switch (state) {
	            case 0: // Any character
	                switch (c) {
	                    case 37: // '%'
	                        n = 0;
	                        m = 0;
	                        state = 1;
	                        break;
	                    case 43: // '+'
	                        if (decodeSpaces)
	                            c = 32; // ' '
	                    // falls through
	                    default:
	                        out[outIndex++] = c;
	                        break;
	                }
	                break;

	            case 1: // First hex digit
	                hexchar = c;
	                if (c >= 48/*0*/ && c <= 57/*9*/) {
	                    n = c - 48/*0*/;
	                } else if (c >= 65/*A*/ && c <= 70/*F*/) {
	                    n = c - 65/*A*/ + 10;
	                } else if (c >= 97/*a*/ && c <= 102/*f*/) {
	                    n = c - 97/*a*/ + 10;
	                } else {
	                    out[outIndex++] = 37/*%*/;
	                    out[outIndex++] = c;
	                    state = 0;
	                    break;
	                }
	                state = 2;
	                break;

	            case 2: // Second hex digit
	                state = 0;
	                if (c >= 48/*0*/ && c <= 57/*9*/) {
	                    m = c - 48/*0*/;
	                } else if (c >= 65/*A*/ && c <= 70/*F*/) {
	                    m = c - 65/*A*/ + 10;
	                } else if (c >= 97/*a*/ && c <= 102/*f*/) {
	                    m = c - 97/*a*/ + 10;
	                } else {
	                    out[outIndex++] = 37/*%*/;
	                    out[outIndex++] = hexchar;
	                    out[outIndex++] = c;
	                    break;
	                }
	                out[outIndex++] = 16 * n + m;
	                break;
	        }
	    }

	    // TODO support returning arbitrary buffers.

	    return out.slice(0, outIndex - 1);
	};


	function qsUnescape(s, decodeSpaces) {
	    try {
	        return decodeURIComponent(s);
	    } catch (e) {
	        return QueryString.unescapeBuffer(s, decodeSpaces).toString();
	    }
	}
	QueryString.unescape = qsUnescape;


	var hexTable = new Array(256);
	for (var i = 0; i < 256; ++i)
	    hexTable[i] = '%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase();
	QueryString.escape = function(str) {
	    // replaces encodeURIComponent
	    // http://www.ecma-international.org/ecma-262/5.1/#sec-15.1.3.4
	    if (typeof str !== 'string') {
	        if (typeof str === 'object')
	            str = String(str);
	        else
	            str += '';
	    }
	    var out = '';
	    var lastPos = 0;

	    for (var i = 0; i < str.length; ++i) {
	        var c = str.charCodeAt(i);

	        // These characters do not need escaping (in order):
	        // ! - . _ ~
	        // ' ( ) *
	        // digits
	        // alpha (uppercase)
	        // alpha (lowercase)
	        if (c === 0x21 || c === 0x2D || c === 0x2E || c === 0x5F || c === 0x7E ||
	            (c >= 0x27 && c <= 0x2A) ||
	            (c >= 0x30 && c <= 0x39) ||
	            (c >= 0x41 && c <= 0x5A) ||
	            (c >= 0x61 && c <= 0x7A)) {
	            continue;
	        }

	        if (i - lastPos > 0)
	            out += str.slice(lastPos, i);

	        // Other ASCII characters
	        if (c < 0x80) {
	            lastPos = i + 1;
	            out += hexTable[c];
	            continue;
	        }

	        // Multi-byte characters ...
	        if (c < 0x800) {
	            lastPos = i + 1;
	            out += hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)];
	            continue;
	        }
	        if (c < 0xD800 || c >= 0xE000) {
	            lastPos = i + 1;
	            out += hexTable[0xE0 | (c >> 12)] +
	                hexTable[0x80 | ((c >> 6) & 0x3F)] +
	                hexTable[0x80 | (c & 0x3F)];
	            continue;
	        }
	        // Surrogate pair
	        ++i;
	        var c2;
	        if (i < str.length)
	            c2 = str.charCodeAt(i) & 0x3FF;
	        else
	            throw new URIError('URI malformed');
	        lastPos = i + 1;
	        c = 0x10000 + (((c & 0x3FF) << 10) | c2);
	        out += hexTable[0xF0 | (c >> 18)] +
	            hexTable[0x80 | ((c >> 12) & 0x3F)] +
	            hexTable[0x80 | ((c >> 6) & 0x3F)] +
	            hexTable[0x80 | (c & 0x3F)];
	    }
	    if (lastPos === 0)
	        return str;
	    if (lastPos < str.length)
	        return out + str.slice(lastPos);
	    return out;
	};

	var stringifyPrimitive = function(v) {
	    if (typeof v === 'string')
	        return v;
	    if (typeof v === 'number' && isFinite(v))
	        return '' + v;
	    if (typeof v === 'boolean')
	        return v ? 'true' : 'false';
	    return '';
	};


	QueryString.stringify = QueryString.encode = function(obj, sep, eq, options) {
	    sep = sep || '&';
	    eq = eq || '=';

	    var encode = QueryString.escape;
	    if (options && typeof options.encodeURIComponent === 'function') {
	        encode = options.encodeURIComponent;
	    }

	    if (obj !== null && typeof obj === 'object') {
	        var keys = Object.keys(obj);
	        var len = keys.length;
	        var flast = len - 1;
	        var fields = '';
	        for (var i = 0; i < len; ++i) {
	            var k = keys[i];
	            var v = obj[k];
	            var ks = encode(stringifyPrimitive(k)) + eq;

	            if (Array.isArray(v)) {
	                var vlen = v.length;
	                var vlast = vlen - 1;
	                for (var j = 0; j < vlen; ++j) {
	                    fields += ks + encode(stringifyPrimitive(v[j]));
	                    if (j < vlast)
	                        fields += sep;
	                }
	                if (vlen && i < flast)
	                    fields += sep;
	            } else {
	                fields += ks + encode(stringifyPrimitive(v));
	                if (i < flast)
	                    fields += sep;
	            }
	        }
	        return fields;
	    }
	    return '';
	};

	// Parse a key/val string.
	QueryString.parse = QueryString.decode = function(qs, sep, eq, options) {
	    sep = sep || '&';
	    eq = eq || '=';

	    const obj = new ParsedQueryString();

	    if (typeof qs !== 'string' || qs.length === 0) {
	        return obj;
	    }

	    if (typeof sep !== 'string')
	        sep += '';

	    const eqLen = eq.length;
	    const sepLen = sep.length;

	    var maxKeys = 1000;
	    if (options && typeof options.maxKeys === 'number') {
	        maxKeys = options.maxKeys;
	    }

	    var pairs = Infinity;
	    if (maxKeys > 0)
	        pairs = maxKeys;

	    var decode = QueryString.unescape;
	    if (options && typeof options.decodeURIComponent === 'function') {
	        decode = options.decodeURIComponent;
	    }
	    const customDecode = (decode !== qsUnescape);

	    const keys = [];
	    var lastPos = 0;
	    var sepIdx = 0;
	    var eqIdx = 0;
	    var key = '';
	    var value = '';
	    var keyEncoded = customDecode;
	    var valEncoded = customDecode;
	    var encodeCheck = 0;
	    for (var i = 0; i < qs.length; ++i) {
	        const code = qs.charCodeAt(i);

	        // Try matching key/value pair separator (e.g. '&')
	        if (code === sep.charCodeAt(sepIdx)) {
	            if (++sepIdx === sepLen) {
	                // Key/value pair separator match!
	                const end = i - sepIdx + 1;
	                if (eqIdx < eqLen) {
	                    // If we didn't find the key/value separator, treat the substring as
	                    // part of the key instead of the value
	                    if (lastPos < end)
	                        key += qs.slice(lastPos, end);
	                } else if (lastPos < end)
	                    value += qs.slice(lastPos, end);
	                if (keyEncoded)
	                    key = decodeStr(key, decode);
	                if (valEncoded)
	                    value = decodeStr(value, decode);
	                // Use a key array lookup instead of using hasOwnProperty(), which is
	                // slower
	                if (keys.indexOf(key) === -1) {
	                    obj[key] = value;
	                    keys[keys.length] = key;
	                } else {
	                    const curValue = obj[key];
	                    // `instanceof Array` is used instead of Array.isArray() because it
	                    // is ~15-20% faster with v8 4.7 and is safe to use because we are
	                    // using it with values being created within this function
	                    if (curValue instanceof Array)
	                        curValue[curValue.length] = value;
	                    else
	                        obj[key] = [curValue, value];
	                }
	                if (--pairs === 0)
	                    break;
	                keyEncoded = valEncoded = customDecode;
	                encodeCheck = 0;
	                key = value = '';
	                lastPos = i + 1;
	                sepIdx = eqIdx = 0;
	            }
	            continue;
	        } else {
	            sepIdx = 0;
	            if (!valEncoded) {
	                // Try to match an (valid) encoded byte (once) to minimize unnecessary
	                // calls to string decoding functions
	                if (code === 37/*%*/) {
	                    encodeCheck = 1;
	                } else if (encodeCheck > 0 &&
	                    ((code >= 48/*0*/ && code <= 57/*9*/) ||
	                    (code >= 65/*A*/ && code <= 70/*F*/) ||
	                    (code >= 97/*a*/ && code <= 102/*f*/))) {
	                    if (++encodeCheck === 3)
	                        valEncoded = true;
	                } else {
	                    encodeCheck = 0;
	                }
	            }
	        }

	        // Try matching key/value separator (e.g. '=') if we haven't already
	        if (eqIdx < eqLen) {
	            if (code === eq.charCodeAt(eqIdx)) {
	                if (++eqIdx === eqLen) {
	                    // Key/value separator match!
	                    const end = i - eqIdx + 1;
	                    if (lastPos < end)
	                        key += qs.slice(lastPos, end);
	                    encodeCheck = 0;
	                    lastPos = i + 1;
	                }
	                continue;
	            } else {
	                eqIdx = 0;
	                if (!keyEncoded) {
	                    // Try to match an (valid) encoded byte once to minimize unnecessary
	                    // calls to string decoding functions
	                    if (code === 37/*%*/) {
	                        encodeCheck = 1;
	                    } else if (encodeCheck > 0 &&
	                        ((code >= 48/*0*/ && code <= 57/*9*/) ||
	                        (code >= 65/*A*/ && code <= 70/*F*/) ||
	                        (code >= 97/*a*/ && code <= 102/*f*/))) {
	                        if (++encodeCheck === 3)
	                            keyEncoded = true;
	                    } else {
	                        encodeCheck = 0;
	                    }
	                }
	            }
	        }

	        if (code === 43/*+*/) {
	            if (eqIdx < eqLen) {
	                if (i - lastPos > 0)
	                    key += qs.slice(lastPos, i);
	                key += '%20';
	                keyEncoded = true;
	            } else {
	                if (i - lastPos > 0)
	                    value += qs.slice(lastPos, i);
	                value += '%20';
	                valEncoded = true;
	            }
	            lastPos = i + 1;
	        }
	    }

	    // Check if we have leftover key or value data
	    if (pairs > 0 && (lastPos < qs.length || eqIdx > 0)) {
	        if (lastPos < qs.length) {
	            if (eqIdx < eqLen)
	                key += qs.slice(lastPos);
	            else if (sepIdx < sepLen)
	                value += qs.slice(lastPos);
	        }
	        if (keyEncoded)
	            key = decodeStr(key, decode);
	        if (valEncoded)
	            value = decodeStr(value, decode);
	        // Use a key array lookup instead of using hasOwnProperty(), which is
	        // slower
	        if (keys.indexOf(key) === -1) {
	            obj[key] = value;
	            keys[keys.length] = key;
	        } else {
	            const curValue = obj[key];
	            // `instanceof Array` is used instead of Array.isArray() because it
	            // is ~15-20% faster with v8 4.7 and is safe to use because we are
	            // using it with values being created within this function
	            if (curValue instanceof Array)
	                curValue[curValue.length] = value;
	            else
	                obj[key] = [curValue, value];
	        }
	    }

	    return obj;
	};


	// v8 does not optimize functions with try-catch blocks, so we isolate them here
	// to minimize the damage
	function decodeStr(s, decoder) {
	    try {
	        return decoder(s);
	    } catch (e) {
	        return QueryString.unescape(s, true);
	    }
	}


/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	// Inspiration for this code comes from Salvatore Sanfilippo's linenoise.
	// https://github.com/antirez/linenoise
	// Reference:
	// * http://invisible-island.net/xterm/ctlseqs/ctlseqs.html
	// * http://www.3waylabs.com/nw/WWW/products/wizcon/vt220.html

	'use strict';

	var kHistorySize = 30;

	var util = __webpack_require__(6);
	var inherits = util.inherits;
	var EventEmitter = __webpack_require__(18).EventEmitter;


	exports.createInterface = function(input, output, completer, terminal) {
	    var rl;
	    if (arguments.length === 1) {
	        rl = new Interface(input);
	    } else {
	        rl = new Interface(input, output, completer, terminal);
	    }
	    return rl;
	};


	function Interface(input, output, completer, terminal) {
	    if (!(this instanceof Interface)) {
	        // call the constructor preserving original number of arguments
	        var self = Object.create(Interface.prototype);
	        Interface.apply(self, arguments);
	        return self;
	    }

	    this._sawReturn = false;

	    EventEmitter.call(this);

	    if (arguments.length === 1) {
	        // an options object was given
	        output = input.output;
	        completer = input.completer;
	        terminal = input.terminal;
	        input = input.input;
	    }

	    completer = completer || function() { return []; };

	    if (typeof completer !== 'function') {
	        throw new TypeError('Argument \'completer\' must be a function');
	    }

	    // backwards compat; check the isTTY prop of the output stream
	    //  when `terminal` was not specified
	    if (terminal === undefined && !(output === null || output === undefined)) {
	        terminal = !!output.isTTY;
	    }

	    var self = this;

	    this.output = output;
	    this.input = input;

	    // Check arity, 2 - for async, 1 for sync
	    this.completer = completer.length === 2 ? completer : function(v, callback) {
	        callback(null, completer(v));
	    };

	    this.setPrompt('> ');

	    this.terminal = !!terminal;

	    function ondata(data) {
	        self._normalWrite(data);
	    }

	    function onend() {
	        if (typeof self._line_buffer === 'string' &&
	            self._line_buffer.length > 0) {
	            self.emit('line', self._line_buffer);
	        }
	        self.close();
	    }

	    function ontermend() {
	        if (typeof self.line === 'string' && self.line.length > 0) {
	            self.emit('line', self.line);
	        }
	        self.close();
	    }

	    function onkeypress(s, key) {
	        self._ttyWrite(s, key);
	    }

	    function onresize() {
	        self._refreshLine();
	    }

	    if (!this.terminal) {
	        input.on('data', ondata);
	        input.on('end', onend);
	        self.once('close', function() {
	            input.removeListener('data', ondata);
	            input.removeListener('end', onend);
	        });
	        var StringDecoder = __webpack_require__(62).StringDecoder; // lazy load
	        this._decoder = new StringDecoder('utf8');

	    } else {

	        exports.emitKeypressEvents(input);

	        // input usually refers to stdin
	        input.on('keypress', onkeypress);
	        input.on('end', ontermend);

	        // Current line
	        this.line = '';

	        this._setRawMode(true);
	        this.terminal = true;

	        // Cursor position on the line.
	        this.cursor = 0;

	        this.history = [];
	        this.historyIndex = -1;

	        if (output !== null && output !== undefined)
	            output.on('resize', onresize);

	        self.once('close', function() {
	            input.removeListener('keypress', onkeypress);
	            input.removeListener('end', ontermend);
	            if (output !== null && output !== undefined) {
	                output.removeListener('resize', onresize);
	            }
	        });
	    }

	    input.resume();
	}

	inherits(Interface, EventEmitter);

	Interface.prototype.getColumns = function() {
	    var columns = Infinity;
	    if (this.output && this.output.columns)
	        columns = this.output.columns;
	    return columns;
	};


	Interface.prototype.setPrompt = function(prompt) {
	    this._prompt = prompt;
	};


	Interface.prototype._setRawMode = function(mode) {
	    if (typeof this.input.setRawMode === 'function') {
	        return this.input.setRawMode(mode);
	    }
	};


	Interface.prototype.prompt = function(preserveCursor) {
	    if (this.paused) this.resume();
	    if (this.terminal) {
	        if (!preserveCursor) this.cursor = 0;
	        this._refreshLine();
	    } else {
	        this._writeToOutput(this._prompt);
	    }
	};


	Interface.prototype.question = function(query, cb) {
	    if (typeof cb === 'function') {
	        if (this._questionCallback) {
	            this.prompt();
	        } else {
	            this._oldPrompt = this._prompt;
	            this.setPrompt(query);
	            this._questionCallback = cb;
	            this.prompt();
	        }
	    }
	};


	Interface.prototype._onLine = function(line) {
	    if (this._questionCallback) {
	        var cb = this._questionCallback;
	        this._questionCallback = null;
	        this.setPrompt(this._oldPrompt);
	        cb(line);
	    } else {
	        this.emit('line', line);
	    }
	};

	Interface.prototype._writeToOutput = function _writeToOutput(stringToWrite) {
	    if (typeof stringToWrite !== 'string')
	        throw new TypeError('stringToWrite must be a string');

	    if (this.output !== null && this.output !== undefined)
	        this.output.write(stringToWrite);
	};

	Interface.prototype._addHistory = function() {
	    if (this.line.length === 0) return '';

	    if (this.history.length === 0 || this.history[0] !== this.line) {
	        this.history.unshift(this.line);

	        // Only store so many
	        if (this.history.length > kHistorySize) this.history.pop();
	    }

	    this.historyIndex = -1;
	    return this.history[0];
	};


	Interface.prototype._refreshLine = function() {
	    // line length
	    var line = this._prompt + this.line;
	    var dispPos = this._getDisplayPos(line);
	    var lineCols = dispPos.cols;
	    var lineRows = dispPos.rows;

	    // cursor position
	    var cursorPos = this._getCursorPos();

	    // first move to the bottom of the current line, based on cursor pos
	    var prevRows = this.prevRows || 0;
	    if (prevRows > 0) {
	        exports.moveCursor(this.output, 0, -prevRows);
	    }

	    // Cursor to left edge.
	    exports.cursorTo(this.output, 0);
	    // erase data
	    exports.clearScreenDown(this.output);

	    // Write the prompt and the current buffer content.
	    this._writeToOutput(line);

	    // Force terminal to allocate a new line
	    if (lineCols === 0) {
	        this._writeToOutput(' ');
	    }

	    // Move cursor to original position.
	    exports.cursorTo(this.output, cursorPos.cols);

	    var diff = lineRows - cursorPos.rows;
	    if (diff > 0) {
	        exports.moveCursor(this.output, 0, -diff);
	    }

	    this.prevRows = cursorPos.rows;
	};


	Interface.prototype.close = function() {
	    if (this.closed) return;
	    this.pause();
	    if (this.terminal) {
	        this._setRawMode(false);
	    }
	    this.closed = true;
	    this.emit('close');
	};


	Interface.prototype.pause = function() {
	    if (this.paused) return;
	    this.input.pause();
	    this.paused = true;
	    this.emit('pause');
	    return this;
	};


	Interface.prototype.resume = function() {
	    if (!this.paused) return;
	    this.input.resume();
	    this.paused = false;
	    this.emit('resume');
	    return this;
	};


	Interface.prototype.write = function(d, key) {
	    if (this.paused) this.resume();
	    this.terminal ? this._ttyWrite(d, key) : this._normalWrite(d);
	};

	// \r\n, \n, or \r followed by something other than \n
	var lineEnding = /\r?\n|\r(?!\n)/;
	Interface.prototype._normalWrite = function(b) {
	    if (b === undefined) {
	        return;
	    }
	    var string = this._decoder.write(b);
	    if (this._sawReturn) {
	        string = string.replace(/^\n/, '');
	        this._sawReturn = false;
	    }

	    // Run test() on the new string chunk, not on the entire line buffer.
	    var newPartContainsEnding = lineEnding.test(string);

	    if (this._line_buffer) {
	        string = this._line_buffer + string;
	        this._line_buffer = null;
	    }
	    if (newPartContainsEnding) {
	        this._sawReturn = /\r$/.test(string);

	        // got one or more newlines; process into "line" events
	        var lines = string.split(lineEnding);
	        // either '' or (concievably) the unfinished portion of the next line
	        string = lines.pop();
	        this._line_buffer = string;
	        lines.forEach(function(line) {
	            this._onLine(line);
	        }, this);
	    } else if (string) {
	        // no newlines this time, save what we have for next time
	        this._line_buffer = string;
	    }
	};


	Interface.prototype._insertString = function(c) {
	    //BUG: Problem when adding tabs with following content.
	    //     Perhaps the bug is in _refreshLine(). Not sure.
	    //     A hack would be to insert spaces instead of literal '\t'.
	    if (this.cursor < this.line.length) {
	        var beg = this.line.slice(0, this.cursor);
	        var end = this.line.slice(this.cursor, this.line.length);
	        this.line = beg + c + end;
	        this.cursor += c.length;
	        this._refreshLine();
	    } else {
	        this.line += c;
	        this.cursor += c.length;

	        if (this._getCursorPos().cols === 0) {
	            this._refreshLine();
	        } else {
	            this._writeToOutput(c);
	        }

	        // a hack to get the line refreshed if it's needed
	        this._moveCursor(0);
	    }
	};

	Interface.prototype._tabComplete = function() {
	    var self = this;

	    self.pause();
	    self.completer(self.line.slice(0, self.cursor), function(err, rv) {
	        self.resume();

	        if (err) {
	            // XXX Log it somewhere?
	            return;
	        }

	        var completions = rv[0],
	            completeOn = rv[1];  // the text that was completed
	        if (completions && completions.length) {
	            // Apply/show completions.
	            if (completions.length === 1) {
	                self._insertString(completions[0].slice(completeOn.length));
	            } else {
	                self._writeToOutput('\r\n');
	                var width = completions.reduce(function(a, b) {
	                        return a.length > b.length ? a : b;
	                    }).length + 2;  // 2 space padding
	                var maxColumns = Math.floor(self.getColumns() / width) || 1;
	                var group = [], c;
	                for (var i = 0, compLen = completions.length; i < compLen; i++) {
	                    c = completions[i];
	                    if (c === '') {
	                        handleGroup(self, group, width, maxColumns);
	                        group = [];
	                    } else {
	                        group.push(c);
	                    }
	                }
	                handleGroup(self, group, width, maxColumns);

	                // If there is a common prefix to all matches, then apply that
	                // portion.
	                var f = completions.filter(function(e) { if (e) return e; });
	                var prefix = commonPrefix(f);
	                if (prefix.length > completeOn.length) {
	                    self._insertString(prefix.slice(completeOn.length));
	                }

	            }
	            self._refreshLine();
	        }
	    });
	};

	// this = Interface instance
	function handleGroup(self, group, width, maxColumns) {
	    if (group.length == 0) {
	        return;
	    }
	    var minRows = Math.ceil(group.length / maxColumns);
	    for (var row = 0; row < minRows; row++) {
	        for (var col = 0; col < maxColumns; col++) {
	            var idx = row * maxColumns + col;
	            if (idx >= group.length) {
	                break;
	            }
	            var item = group[idx];
	            self._writeToOutput(item);
	            if (col < maxColumns - 1) {
	                for (var s = 0, itemLen = item.length; s < width - itemLen;
	                     s++) {
	                    self._writeToOutput(' ');
	                }
	            }
	        }
	        self._writeToOutput('\r\n');
	    }
	    self._writeToOutput('\r\n');
	}

	function commonPrefix(strings) {
	    if (!strings || strings.length == 0) {
	        return '';
	    }
	    var sorted = strings.slice().sort();
	    var min = sorted[0];
	    var max = sorted[sorted.length - 1];
	    for (var i = 0, len = min.length; i < len; i++) {
	        if (min[i] != max[i]) {
	            return min.slice(0, i);
	        }
	    }
	    return min;
	}


	Interface.prototype._wordLeft = function() {
	    if (this.cursor > 0) {
	        var leading = this.line.slice(0, this.cursor);
	        var match = leading.match(/([^\w\s]+|\w+|)\s*$/);
	        this._moveCursor(-match[0].length);
	    }
	};


	Interface.prototype._wordRight = function() {
	    if (this.cursor < this.line.length) {
	        var trailing = this.line.slice(this.cursor);
	        var match = trailing.match(/^(\s+|\W+|\w+)\s*!/);
	        this._moveCursor(match[0].length);
	    }
	};


	Interface.prototype._deleteLeft = function() {
	    if (this.cursor > 0 && this.line.length > 0) {
	        this.line = this.line.slice(0, this.cursor - 1) +
	            this.line.slice(this.cursor, this.line.length);

	        this.cursor--;
	        this._refreshLine();
	    }
	};


	Interface.prototype._deleteRight = function() {
	    this.line = this.line.slice(0, this.cursor) +
	        this.line.slice(this.cursor + 1, this.line.length);
	    this._refreshLine();
	};


	Interface.prototype._deleteWordLeft = function() {
	    if (this.cursor > 0) {
	        var leading = this.line.slice(0, this.cursor);
	        var match = leading.match(/([^\w\s]+|\w+|)\s*$/);
	        leading = leading.slice(0, leading.length - match[0].length);
	        this.line = leading + this.line.slice(this.cursor, this.line.length);
	        this.cursor = leading.length;
	        this._refreshLine();
	    }
	};


	Interface.prototype._deleteWordRight = function() {
	    if (this.cursor < this.line.length) {
	        var trailing = this.line.slice(this.cursor);
	        var match = trailing.match(/^(\s+|\W+|\w+)\s*!/);
	        this.line = this.line.slice(0, this.cursor) +
	            trailing.slice(match[0].length);
	        this._refreshLine();
	    }
	};


	Interface.prototype._deleteLineLeft = function() {
	    this.line = this.line.slice(this.cursor);
	    this.cursor = 0;
	    this._refreshLine();
	};


	Interface.prototype._deleteLineRight = function() {
	    this.line = this.line.slice(0, this.cursor);
	    this._refreshLine();
	};


	Interface.prototype.clearLine = function() {
	    this._moveCursor(+Infinity);
	    this._writeToOutput('\r\n');
	    this.line = '';
	    this.cursor = 0;
	    this.prevRows = 0;
	};


	Interface.prototype._line = function() {
	    var line = this._addHistory();
	    this.clearLine();
	    this._onLine(line);
	};


	Interface.prototype._historyNext = function() {
	    if (this.historyIndex > 0) {
	        this.historyIndex--;
	        this.line = this.history[this.historyIndex];
	        this.cursor = this.line.length; // set cursor to end of line.
	        this._refreshLine();

	    } else if (this.historyIndex === 0) {
	        this.historyIndex = -1;
	        this.cursor = 0;
	        this.line = '';
	        this._refreshLine();
	    }
	};


	Interface.prototype._historyPrev = function() {
	    if (this.historyIndex + 1 < this.history.length) {
	        this.historyIndex++;
	        this.line = this.history[this.historyIndex];
	        this.cursor = this.line.length; // set cursor to end of line.

	        this._refreshLine();
	    }
	};


	// Returns the last character's display position of the given string
	Interface.prototype._getDisplayPos = function(str) {
	    var offset = 0;
	    var col = this.getColumns();
	    var row = 0;
	    var code;
	    str = stripVTControlCharacters(str);
	    for (var i = 0, len = str.length; i < len; i++) {
	        code = str.codePointAt(i);
	        if (code >= 0x10000) { // surrogates
	            i++;
	        }
	        if (code === 0x0a) { // new line \n
	            offset = 0;
	            row += 1;
	            continue;
	        }
	        if (isFullWidthCodePoint(code)) {
	            if ((offset + 1) % col === 0) {
	                offset++;
	            }
	            offset += 2;
	        } else {
	            offset++;
	        }
	    }
	    var cols = offset % col;
	    var rows = row + (offset - cols) / col;
	    return {cols: cols, rows: rows};
	};


	// Returns current cursor's position and line
	Interface.prototype._getCursorPos = function() {
	    var columns = this.getColumns();
	    var strBeforeCursor = this._prompt + this.line.substring(0, this.cursor);
	    var dispPos = this._getDisplayPos(stripVTControlCharacters(strBeforeCursor));
	    var cols = dispPos.cols;
	    var rows = dispPos.rows;
	    // If the cursor is on a full-width character which steps over the line,
	    // move the cursor to the beginning of the next line.
	    if (cols + 1 === columns &&
	        this.cursor < this.line.length &&
	        isFullWidthCodePoint(this.line.codePointAt(this.cursor))) {
	        rows++;
	        cols = 0;
	    }
	    return {cols: cols, rows: rows};
	};


	// This function moves cursor dx places to the right
	// (-dx for left) and refreshes the line if it is needed
	Interface.prototype._moveCursor = function(dx) {
	    var oldcursor = this.cursor;
	    var oldPos = this._getCursorPos();
	    this.cursor += dx;

	    // bounds check
	    if (this.cursor < 0) this.cursor = 0;
	    else if (this.cursor > this.line.length) this.cursor = this.line.length;

	    var newPos = this._getCursorPos();

	    // check if cursors are in the same line
	    if (oldPos.rows === newPos.rows) {
	        var diffCursor = this.cursor - oldcursor;
	        var diffWidth;
	        if (diffCursor < 0) {
	            diffWidth = -getStringWidth(
	                this.line.substring(this.cursor, oldcursor)
	            );
	        } else if (diffCursor > 0) {
	            diffWidth = getStringWidth(
	                this.line.substring(this.cursor, oldcursor)
	            );
	        }
	        exports.moveCursor(this.output, diffWidth, 0);
	        this.prevRows = newPos.rows;
	    } else {
	        this._refreshLine();
	    }
	};


	// handle a write from the tty
	Interface.prototype._ttyWrite = function(s, key) {
	    key = key || {};

	    // Ignore escape key - Fixes #2876
	    if (key.name == 'escape') return;

	    if (key.ctrl && key.shift) {
	        /* Control and shift pressed */
	        switch (key.name) {
	            case 'backspace':
	                this._deleteLineLeft();
	                break;

	            case 'delete':
	                this._deleteLineRight();
	                break;
	        }

	    } else if (key.ctrl) {
	        /* Control key pressed */

	        switch (key.name) {
	            case 'c':
	                if (EventEmitter.listenerCount(this, 'SIGINT') > 0) {
	                    this.emit('SIGINT');
	                } else {
	                    // This readline instance is finished
	                    this.close();
	                }
	                break;

	            case 'h': // delete left
	                this._deleteLeft();
	                break;

	            case 'd': // delete right or EOF
	                if (this.cursor === 0 && this.line.length === 0) {
	                    // This readline instance is finished
	                    this.close();
	                } else if (this.cursor < this.line.length) {
	                    this._deleteRight();
	                }
	                break;

	            case 'u': // delete the whole line
	                this.cursor = 0;
	                this.line = '';
	                this._refreshLine();
	                break;

	            case 'k': // delete from current to end of line
	                this._deleteLineRight();
	                break;

	            case 'a': // go to the start of the line
	                this._moveCursor(-Infinity);
	                break;

	            case 'e': // go to the end of the line
	                this._moveCursor(+Infinity);
	                break;

	            case 'b': // back one character
	                this._moveCursor(-1);
	                break;

	            case 'f': // forward one character
	                this._moveCursor(+1);
	                break;

	            case 'l': // clear the whole screen
	                exports.cursorTo(this.output, 0, 0);
	                exports.clearScreenDown(this.output);
	                this._refreshLine();
	                break;

	            case 'n': // next history item
	                this._historyNext();
	                break;

	            case 'p': // previous history item
	                this._historyPrev();
	                break;

	            case 'z':
	                if (process.platform == 'win32') break;
	                if (EventEmitter.listenerCount(this, 'SIGTSTP') > 0) {
	                    this.emit('SIGTSTP');
	                } else {
	                    process.once('SIGCONT', (function(self) {
	                        return function() {
	                            // Don't raise events if stream has already been abandoned.
	                            if (!self.paused) {
	                                // Stream must be paused and resumed after SIGCONT to catch
	                                // SIGINT, SIGTSTP, and EOF.
	                                self.pause();
	                                self.emit('SIGCONT');
	                            }
	                            // explicitly re-enable "raw mode" and move the cursor to
	                            // the correct position.
	                            // See https://github.com/joyent/node/issues/3295.
	                            self._setRawMode(true);
	                            self._refreshLine();
	                        };
	                    })(this));
	                    this._setRawMode(false);
	                    process.kill(process.pid, 'SIGTSTP');
	                }
	                break;

	            case 'w': // delete backwards to a word boundary
	            case 'backspace':
	                this._deleteWordLeft();
	                break;

	            case 'delete': // delete forward to a word boundary
	                this._deleteWordRight();
	                break;

	            case 'left':
	                this._wordLeft();
	                break;

	            case 'right':
	                this._wordRight();
	                break;
	        }

	    } else if (key.meta) {
	        /* Meta key pressed */

	        switch (key.name) {
	            case 'b': // backward word
	                this._wordLeft();
	                break;

	            case 'f': // forward word
	                this._wordRight();
	                break;

	            case 'd': // delete forward word
	            case 'delete':
	                this._deleteWordRight();
	                break;

	            case 'backspace': // delete backwards to a word boundary
	                this._deleteWordLeft();
	                break;
	        }

	    } else {
	        /* No modifier keys used */

	        // \r bookkeeping is only relevant if a \n comes right after.
	        if (this._sawReturn && key.name !== 'enter')
	            this._sawReturn = false;

	        switch (key.name) {
	            case 'return':  // carriage return, i.e. \r
	                this._sawReturn = true;
	                this._line();
	                break;

	            case 'enter':
	                if (this._sawReturn)
	                    this._sawReturn = false;
	                else
	                    this._line();
	                break;

	            case 'backspace':
	                this._deleteLeft();
	                break;

	            case 'delete':
	                this._deleteRight();
	                break;

	            case 'tab': // tab completion
	                this._tabComplete();
	                break;

	            case 'left':
	                this._moveCursor(-1);
	                break;

	            case 'right':
	                this._moveCursor(+1);
	                break;

	            case 'home':
	                this._moveCursor(-Infinity);
	                break;

	            case 'end':
	                this._moveCursor(+Infinity);
	                break;

	            case 'up':
	                this._historyPrev();
	                break;

	            case 'down':
	                this._historyNext();
	                break;

	            default:
	                if (s instanceof Buffer)
	                    s = s.toString('utf-8');

	                if (s) {
	                    var lines = s.split(/\r\n|\n|\r/);
	                    for (var i = 0, len = lines.length; i < len; i++) {
	                        if (i > 0) {
	                            this._line();
	                        }
	                        this._insertString(lines[i]);
	                    }
	                }
	        }
	    }
	};


	exports.Interface = Interface;



	/**
	 * accepts a readable Stream instance and makes it emit "keypress" events
	 */

	function emitKeypressEvents(stream) {
	    if (stream._keypressDecoder) return;
	    var StringDecoder = __webpack_require__(62).StringDecoder; // lazy load
	    stream._keypressDecoder = new StringDecoder('utf8');

	    function onData(b) {
	        if (EventEmitter.listenerCount(stream, 'keypress') > 0) {
	            var r = stream._keypressDecoder.write(b);
	            if (r) emitKeys(stream, r);
	        } else {
	            // Nobody's watching anyway
	            stream.removeListener('data', onData);
	            stream.on('newListener', onNewListener);
	        }
	    }

	    function onNewListener(event) {
	        if (event == 'keypress') {
	            stream.on('data', onData);
	            stream.removeListener('newListener', onNewListener);
	        }
	    }

	    if (EventEmitter.listenerCount(stream, 'keypress') > 0) {
	        stream.on('data', onData);
	    } else {
	        stream.on('newListener', onNewListener);
	    }
	}
	exports.emitKeypressEvents = emitKeypressEvents;

	// Regexes used for ansi escape code splitting
	var metaKeyCodeReAnywhere = /(?:\x1b)([a-zA-Z0-9])/;
	var metaKeyCodeRe = new RegExp('^' + metaKeyCodeReAnywhere.source + '$');
	var functionKeyCodeReAnywhere = new RegExp('(?:\x1b+)(O|N|\\[|\\[\\[)(?:' + [
	        '(\\d+)(?:;(\\d+))?([~^$])',
	        '(?:M([@ #!a`])(.)(.))', // mouse
	        '(?:1;)?(\\d+)?([a-zA-Z])'
	    ].join('|') + ')');
	var functionKeyCodeRe = new RegExp('^' + functionKeyCodeReAnywhere.source);
	var escapeCodeReAnywhere = new RegExp([
	    functionKeyCodeReAnywhere.source, metaKeyCodeReAnywhere.source, /\x1b./.source
	].join('|'));

	function emitKeys(stream, s) {
	    if (s instanceof Buffer) {
	        if (s[0] > 127 && s[1] === undefined) {
	            s[0] -= 128;
	            s = '\x1b' + s.toString(stream.encoding || 'utf-8');
	        } else {
	            s = s.toString(stream.encoding || 'utf-8');
	        }
	    }

	    var buffer = [];
	    var match;
	    while (match = escapeCodeReAnywhere.exec(s)) {
	        buffer = buffer.concat(s.slice(0, match.index).split(''));
	        buffer.push(match[0]);
	        s = s.slice(match.index + match[0].length);
	    }
	    buffer = buffer.concat(s.split(''));

	    buffer.forEach(function(s) {
	        var ch,
	            key = {
	                sequence: s,
	                name: undefined,
	                ctrl: false,
	                meta: false,
	                shift: false
	            },
	            parts;

	        if (s === '\r') {
	            // carriage return
	            key.name = 'return';

	        } else if (s === '\n') {
	            // enter, should have been called linefeed
	            key.name = 'enter';

	        } else if (s === '\t') {
	            // tab
	            key.name = 'tab';

	        } else if (s === '\b' || s === '\x7f' ||
	            s === '\x1b\x7f' || s === '\x1b\b') {
	            // backspace or ctrl+h
	            key.name = 'backspace';
	            key.meta = (s.charAt(0) === '\x1b');

	        } else if (s === '\x1b' || s === '\x1b\x1b') {
	            // escape key
	            key.name = 'escape';
	            key.meta = (s.length === 2);

	        } else if (s === ' ' || s === '\x1b ') {
	            key.name = 'space';
	            key.meta = (s.length === 2);

	        } else if (s.length === 1 && s <= '\x1a') {
	            // ctrl+letter
	            key.name = String.fromCharCode(s.charCodeAt(0) + 'a'.charCodeAt(0) - 1);
	            key.ctrl = true;

	        } else if (s.length === 1 && s >= 'a' && s <= 'z') {
	            // lowercase letter
	            key.name = s;

	        } else if (s.length === 1 && s >= 'A' && s <= 'Z') {
	            // shift+letter
	            key.name = s.toLowerCase();
	            key.shift = true;

	        } else if (parts = metaKeyCodeRe.exec(s)) {
	            // meta+character key
	            key.name = parts[1].toLowerCase();
	            key.meta = true;
	            key.shift = /^[A-Z]$/.test(parts[1]);

	        } else if (parts = functionKeyCodeRe.exec(s)) {
	            // ansi escape sequence

	            // reassemble the key code leaving out leading \x1b's,
	            // the modifier key bitflag and any meaningless "1;" sequence
	            var code = (parts[1] || '') + (parts[2] || '') +
	                    (parts[4] || '') + (parts[9] || ''),
	                modifier = (parts[3] || parts[8] || 1) - 1;

	            // Parse the key modifier
	            key.ctrl = !!(modifier & 4);
	            key.meta = !!(modifier & 10);
	            key.shift = !!(modifier & 1);
	            key.code = code;

	            // Parse the key itself
	            switch (code) {
	                /* xterm/gnome ESC O letter */
	                case 'OP': key.name = 'f1'; break;
	                case 'OQ': key.name = 'f2'; break;
	                case 'OR': key.name = 'f3'; break;
	                case 'OS': key.name = 'f4'; break;

	                /* xterm/rxvt ESC [ number ~ */
	                case '[11~': key.name = 'f1'; break;
	                case '[12~': key.name = 'f2'; break;
	                case '[13~': key.name = 'f3'; break;
	                case '[14~': key.name = 'f4'; break;

	                /* from Cygwin and used in libuv */
	                case '[[A': key.name = 'f1'; break;
	                case '[[B': key.name = 'f2'; break;
	                case '[[C': key.name = 'f3'; break;
	                case '[[D': key.name = 'f4'; break;
	                case '[[E': key.name = 'f5'; break;

	                /* common */
	                case '[15~': key.name = 'f5'; break;
	                case '[17~': key.name = 'f6'; break;
	                case '[18~': key.name = 'f7'; break;
	                case '[19~': key.name = 'f8'; break;
	                case '[20~': key.name = 'f9'; break;
	                case '[21~': key.name = 'f10'; break;
	                case '[23~': key.name = 'f11'; break;
	                case '[24~': key.name = 'f12'; break;

	                /* xterm ESC [ letter */
	                case '[A': key.name = 'up'; break;
	                case '[B': key.name = 'down'; break;
	                case '[C': key.name = 'right'; break;
	                case '[D': key.name = 'left'; break;
	                case '[E': key.name = 'clear'; break;
	                case '[F': key.name = 'end'; break;
	                case '[H': key.name = 'home'; break;

	                /* xterm/gnome ESC O letter */
	                case 'OA': key.name = 'up'; break;
	                case 'OB': key.name = 'down'; break;
	                case 'OC': key.name = 'right'; break;
	                case 'OD': key.name = 'left'; break;
	                case 'OE': key.name = 'clear'; break;
	                case 'OF': key.name = 'end'; break;
	                case 'OH': key.name = 'home'; break;

	                /* xterm/rxvt ESC [ number ~ */
	                case '[1~': key.name = 'home'; break;
	                case '[2~': key.name = 'insert'; break;
	                case '[3~': key.name = 'delete'; break;
	                case '[4~': key.name = 'end'; break;
	                case '[5~': key.name = 'pageup'; break;
	                case '[6~': key.name = 'pagedown'; break;

	                /* putty */
	                case '[[5~': key.name = 'pageup'; break;
	                case '[[6~': key.name = 'pagedown'; break;

	                /* rxvt */
	                case '[7~': key.name = 'home'; break;
	                case '[8~': key.name = 'end'; break;

	                /* rxvt keys with modifiers */
	                case '[a': key.name = 'up'; key.shift = true; break;
	                case '[b': key.name = 'down'; key.shift = true; break;
	                case '[c': key.name = 'right'; key.shift = true; break;
	                case '[d': key.name = 'left'; key.shift = true; break;
	                case '[e': key.name = 'clear'; key.shift = true; break;

	                case '[2$': key.name = 'insert'; key.shift = true; break;
	                case '[3$': key.name = 'delete'; key.shift = true; break;
	                case '[5$': key.name = 'pageup'; key.shift = true; break;
	                case '[6$': key.name = 'pagedown'; key.shift = true; break;
	                case '[7$': key.name = 'home'; key.shift = true; break;
	                case '[8$': key.name = 'end'; key.shift = true; break;

	                case 'Oa': key.name = 'up'; key.ctrl = true; break;
	                case 'Ob': key.name = 'down'; key.ctrl = true; break;
	                case 'Oc': key.name = 'right'; key.ctrl = true; break;
	                case 'Od': key.name = 'left'; key.ctrl = true; break;
	                case 'Oe': key.name = 'clear'; key.ctrl = true; break;

	                case '[2^': key.name = 'insert'; key.ctrl = true; break;
	                case '[3^': key.name = 'delete'; key.ctrl = true; break;
	                case '[5^': key.name = 'pageup'; key.ctrl = true; break;
	                case '[6^': key.name = 'pagedown'; key.ctrl = true; break;
	                case '[7^': key.name = 'home'; key.ctrl = true; break;
	                case '[8^': key.name = 'end'; key.ctrl = true; break;

	                /* misc. */
	                case '[Z': key.name = 'tab'; key.shift = true; break;
	                default: key.name = 'undefined'; break;

	            }
	        }

	        // Don't emit a key if no name was found
	        if (key.name === undefined) {
	            key = undefined;
	        }

	        if (s.length === 1) {
	            ch = s;
	        }

	        if (key || ch) {
	            stream.emit('keypress', ch, key);
	        }
	    });
	}


	/**
	 * moves the cursor to the x and y coordinate on the given stream
	 */

	function cursorTo(stream, x, y) {
	    if (stream === null || stream === undefined)
	        return;

	    if (typeof x !== 'number' && typeof y !== 'number')
	        return;

	    if (typeof x !== 'number')
	        throw new Error("Can't set cursor row without also setting it's column");

	    if (typeof y !== 'number') {
	        stream.write('\x1b[' + (x + 1) + 'G');
	    } else {
	        stream.write('\x1b[' + (y + 1) + ';' + (x + 1) + 'H');
	    }
	}
	exports.cursorTo = cursorTo;


	/**
	 * moves the cursor relative to its current location
	 */

	function moveCursor(stream, dx, dy) {
	    if (stream === null || stream === undefined)
	        return;

	    if (dx < 0) {
	        stream.write('\x1b[' + (-dx) + 'D');
	    } else if (dx > 0) {
	        stream.write('\x1b[' + dx + 'C');
	    }

	    if (dy < 0) {
	        stream.write('\x1b[' + (-dy) + 'A');
	    } else if (dy > 0) {
	        stream.write('\x1b[' + dy + 'B');
	    }
	}
	exports.moveCursor = moveCursor;


	/**
	 * clears the current line the cursor is on:
	 *   -1 for left of the cursor
	 *   +1 for right of the cursor
	 *    0 for the entire line
	 */

	function clearLine(stream, dir) {
	    if (stream === null || stream === undefined)
	        return;

	    if (dir < 0) {
	        // to the beginning
	        stream.write('\x1b[1K');
	    } else if (dir > 0) {
	        // to the end
	        stream.write('\x1b[0K');
	    } else {
	        // entire line
	        stream.write('\x1b[2K');
	    }
	}
	exports.clearLine = clearLine;


	/**
	 * clears the screen from the current position of the cursor down
	 */

	function clearScreenDown(stream) {
	    if (stream === null || stream === undefined)
	        return;

	    stream.write('\x1b[0J');
	}
	exports.clearScreenDown = clearScreenDown;


	/**
	 * Returns the number of columns required to display the given string.
	 */

	function getStringWidth(str) {
	    var width = 0;
	    str = stripVTControlCharacters(str);
	    for (var i = 0, len = str.length; i < len; i++) {
	        var code = str.codePointAt(i);
	        if (code >= 0x10000) { // surrogates
	            i++;
	        }
	        if (isFullWidthCodePoint(code)) {
	            width += 2;
	        } else {
	            width++;
	        }
	    }
	    return width;
	}
	exports.getStringWidth = getStringWidth;


	/**
	 * Returns true if the character represented by a given
	 * Unicode code point is full-width. Otherwise returns false.
	 */

	function isFullWidthCodePoint(code) {
	    if (isNaN(code)) {
	        return false;
	    }

	    // Code points are derived from:
	    // http://www.unicode.org/Public/UNIDATA/EastAsianWidth.txt
	    if (code >= 0x1100 && (
	        code <= 0x115f ||  // Hangul Jamo
	        0x2329 === code || // LEFT-POINTING ANGLE BRACKET
	        0x232a === code || // RIGHT-POINTING ANGLE BRACKET
	        // CJK Radicals Supplement .. Enclosed CJK Letters and Months
	        (0x2e80 <= code && code <= 0x3247 && code !== 0x303f) ||
	        // Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
	        0x3250 <= code && code <= 0x4dbf ||
	        // CJK Unified Ideographs .. Yi Radicals
	        0x4e00 <= code && code <= 0xa4c6 ||
	        // Hangul Jamo Extended-A
	        0xa960 <= code && code <= 0xa97c ||
	        // Hangul Syllables
	        0xac00 <= code && code <= 0xd7a3 ||
	        // CJK Compatibility Ideographs
	        0xf900 <= code && code <= 0xfaff ||
	        // Vertical Forms
	        0xfe10 <= code && code <= 0xfe19 ||
	        // CJK Compatibility Forms .. Small Form Variants
	        0xfe30 <= code && code <= 0xfe6b ||
	        // Halfwidth and Fullwidth Forms
	        0xff01 <= code && code <= 0xff60 ||
	        0xffe0 <= code && code <= 0xffe6 ||
	        // Kana Supplement
	        0x1b000 <= code && code <= 0x1b001 ||
	        // Enclosed Ideographic Supplement
	        0x1f200 <= code && code <= 0x1f251 ||
	        // CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
	        0x20000 <= code && code <= 0x3fffd)) {
	        return true;
	    }
	    return false;
	}
	exports.isFullWidthCodePoint = isFullWidthCodePoint;


	/**
	 * Returns the Unicode code point for the character at the
	 * given index in the given string. Similar to String.charCodeAt(),
	 * but this function handles surrogates (code point >= 0x10000).
	 */

	function codePointAt(str, index) {
	    var code = str.charCodeAt(index);
	    var low;
	    if (0xd800 <= code && code <= 0xdbff) { // High surrogate
	        low = str.charCodeAt(index + 1);
	        if (!isNaN(low)) {
	            code = 0x10000 + (code - 0xd800) * 0x400 + (low - 0xdc00);
	        }
	    }
	    return code;
	}
	exports.codePointAt = util.deprecate(codePointAt,
	    'codePointAt() is deprecated. Use String.prototype.codePointAt');


	/**
	 * Tries to remove all VT control characters. Use to estimate displayed
	 * string width. May be buggy due to not running a real state machine
	 */
	function stripVTControlCharacters(str) {
	    str = str.replace(new RegExp(functionKeyCodeReAnywhere.source, 'g'), '');
	    return str.replace(new RegExp(metaKeyCodeReAnywhere.source, 'g'), '');
	}
	exports.stripVTControlCharacters = stripVTControlCharacters;


/***/ },
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	// 'use strict';


	var toASCII = __webpack_require__(53).toASCII;

	exports.parse = urlParse;
	exports.resolve = urlResolve;
	exports.resolveObject = urlResolveObject;
	exports.format = urlFormat;

	exports.Url = Url;

	function Url() {
	    this.protocol = null;
	    this.slashes = null;
	    this.auth = null;
	    this.host = null;
	    this.port = null;
	    this.hostname = null;
	    this.hash = null;
	    this.search = null;
	    this.query = null;
	    this.pathname = null;
	    this.path = null;
	    this.href = null;
	}

	// Reference: RFC 3986, RFC 1808, RFC 2396

	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i;
	var portPattern = /:[0-9]*$/;

	// Special case for a simple path URL
	var simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/;

	var hostnameMaxLen = 255;
	// protocols that can allow "unsafe" and "unwise" chars.
	var unsafeProtocol = {
	    'javascript': true,
	    'javascript:': true
	};
	// protocols that never have a hostname.
	var hostlessProtocol = {
	    'javascript': true,
	    'javascript:': true
	};
	// protocols that always contain a // bit.
	var slashedProtocol = {
	    'http': true,
	    'http:': true,
	    'https': true,
	    'https:': true,
	    'ftp': true,
	    'ftp:': true,
	    'gopher': true,
	    'gopher:': true,
	    'file': true,
	    'file:': true
	};

	var querystring = __webpack_require__(54);

	// This constructor is used to store parsed query string values. Instantiating
	// this is faster than explicitly calling `Object.create(null)` to get a
	// "clean" empty object (tested with v8 v4.9).
	function ParsedQueryString() {}
	ParsedQueryString.prototype = Object.create(null);

	function urlParse(url, parseQueryString, slashesDenoteHost) {
	    if (url instanceof Url) return url;

	    var u = new Url();
	    u.parse(url, parseQueryString, slashesDenoteHost);
	    return u;
	}

	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
	    if (typeof url !== 'string') {
	        throw new TypeError('Parameter "url" must be a string, not ' + typeof url);
	    }

	    // Copy chrome, IE, opera backslash-handling behavior.
	    // Back slashes before the query string get converted to forward slashes
	    // See: https://code.google.com/p/chromium/issues/detail?id=25916
	    var hasHash = false;
	    var start = -1;
	    var end = -1;
	    var rest = '';
	    var lastPos = 0;
	    var i = 0;
	    for (var inWs = false, split = false; i < url.length; ++i) {
	        const code = url.charCodeAt(i);

	        // Find first and last non-whitespace characters for trimming
	        const isWs = code === 32/* */ ||
	            code === 9/*\t*/ ||
	            code === 13/*\r*/ ||
	            code === 10/*\n*/ ||
	            code === 12/*\f*/ ||
	            code === 160/*\u00A0*/ ||
	            code === 65279/*\uFEFF*/;
	        if (start === -1) {
	            if (isWs)
	                continue;
	            lastPos = start = i;
	        } else {
	            if (inWs) {
	                if (!isWs) {
	                    end = -1;
	                    inWs = false;
	                }
	            } else if (isWs) {
	                end = i;
	                inWs = true;
	            }
	        }

	        // Only convert backslashes while we haven't seen a split character
	        if (!split) {
	            switch (code) {
	                case 35: // '#'
	                    hasHash = true;
	                // Fall through
	                case 63: // '?'
	                    split = true;
	                    break;
	                case 92: // '\\'
	                    if (i - lastPos > 0)
	                        rest += url.slice(lastPos, i);
	                    rest += '/';
	                    lastPos = i + 1;
	                    break;
	            }
	        } else if (!hasHash && code === 35/*#*/) {
	            hasHash = true;
	        }
	    }

	    // Check if string was non-empty (including strings with only whitespace)
	    if (start !== -1) {
	        if (lastPos === start) {
	            // We didn't convert any backslashes

	            if (end === -1) {
	                if (start === 0)
	                    rest = url;
	                else
	                    rest = url.slice(start);
	            } else {
	                rest = url.slice(start, end);
	            }
	        } else if (end === -1 && lastPos < url.length) {
	            // We converted some backslashes and have only part of the entire string
	            rest += url.slice(lastPos);
	        } else if (end !== -1 && lastPos < end) {
	            // We converted some backslashes and have only part of the entire string
	            rest += url.slice(lastPos, end);
	        }
	    }

	    if (!slashesDenoteHost && !hasHash) {
	        // Try fast path regexp
	        const simplePath = simplePathPattern.exec(rest);
	        if (simplePath) {
	            this.path = rest;
	            this.href = rest;
	            this.pathname = simplePath[1];
	            if (simplePath[2]) {
	                this.search = simplePath[2];
	                if (parseQueryString) {
	                    this.query = querystring.parse(this.search.slice(1));
	                } else {
	                    this.query = this.search.slice(1);
	                }
	            } else if (parseQueryString) {
	                this.search = '';
	                this.query = new ParsedQueryString();
	            }
	            return this;
	        }
	    }

	    var proto = protocolPattern.exec(rest);
	    if (proto) {
	        proto = proto[0];
	        var lowerProto = proto.toLowerCase();
	        this.protocol = lowerProto;
	        rest = rest.slice(proto.length);
	    }

	    // figure out if it's got a host
	    // user@server is *always* interpreted as a hostname, and url
	    // resolution will treat //foo/bar as host=foo,path=bar because that's
	    // how the browser resolves relative URLs.
	    if (slashesDenoteHost || proto || /^\/\/[^@\/]+@[^@\/]+/.test(rest)) {
	        var slashes = rest.charCodeAt(0) === 47/*/*/ &&
	            rest.charCodeAt(1) === 47/*/*/;
	        if (slashes && !(proto && hostlessProtocol[proto])) {
	            rest = rest.slice(2);
	            this.slashes = true;
	        }
	    }

	    if (!hostlessProtocol[proto] &&
	        (slashes || (proto && !slashedProtocol[proto]))) {

	        // there's a hostname.
	        // the first instance of /, ?, ;, or # ends the host.
	        //
	        // If there is an @ in the hostname, then non-host chars *are* allowed
	        // to the left of the last @ sign, unless some host-ending character
	        // comes *before* the @-sign.
	        // URLs are obnoxious.
	        //
	        // ex:
	        // http://a@b@c/ => user:a@b host:c
	        // http://a@b?@c => user:a host:b path:/?@c

	        // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	        // Review our test case against browsers more comprehensively.

	        var hostEnd = -1;
	        var atSign = -1;
	        var nonHost = -1;
	        for (i = 0; i < rest.length; ++i) {
	            switch (rest.charCodeAt(i)) {
	                case 9:   // '\t'
	                case 10:  // '\n'
	                case 13:  // '\r'
	                case 32:  // ' '
	                case 34:  // '"'
	                case 37:  // '%'
	                case 39:  // '\''
	                case 59:  // ';'
	                case 60:  // '<'
	                case 62:  // '>'
	                case 92:  // '\\'
	                case 94:  // '^'
	                case 96:  // '`'
	                case 123: // '{'
	                case 124: // '|'
	                case 125: // '}'
	                          // Characters that are never ever allowed in a hostname from RFC 2396
	                    if (nonHost === -1)
	                        nonHost = i;
	                    break;
	                case 35: // '#'
	                case 47: // '/'
	                case 63: // '?'
	                    // Find the first instance of any host-ending characters
	                    if (nonHost === -1)
	                        nonHost = i;
	                    hostEnd = i;
	                    break;
	                case 64: // '@'
	                    // At this point, either we have an explicit point where the
	                    // auth portion cannot go past, or the last @ char is the decider.
	                    atSign = i;
	                    nonHost = -1;
	                    break;
	            }
	            if (hostEnd !== -1)
	                break;
	        }
	        start = 0;
	        if (atSign !== -1) {
	            this.auth = decodeURIComponent(rest.slice(0, atSign));
	            start = atSign + 1;
	        }
	        if (nonHost === -1) {
	            this.host = rest.slice(start);
	            rest = '';
	        } else {
	            this.host = rest.slice(start, nonHost);
	            rest = rest.slice(nonHost);
	        }

	        // pull out port.
	        this.parseHost();

	        // we've indicated that there is a hostname,
	        // so even if it's empty, it has to be present.
	        if (typeof this.hostname !== 'string')
	            this.hostname = '';

	        var hostname = this.hostname;

	        // if hostname begins with [ and ends with ]
	        // assume that it's an IPv6 address.
	        var ipv6Hostname = hostname.charCodeAt(0) === 91/*[*/ &&
	            hostname.charCodeAt(hostname.length - 1) === 93/*]*/;

	        // validate a little.
	        if (!ipv6Hostname) {
	            const result = validateHostname(this, rest, hostname);
	            if (result !== undefined)
	                rest = result;
	        }

	        if (this.hostname.length > hostnameMaxLen) {
	            this.hostname = '';
	        } else {
	            // hostnames are always lower case.
	            this.hostname = this.hostname.toLowerCase();
	        }

	        if (!ipv6Hostname) {
	            // IDNA Support: Returns a punycoded representation of "domain".
	            // It only converts parts of the domain name that
	            // have non-ASCII characters, i.e. it doesn't matter if
	            // you call it with a domain that already is ASCII-only.
	            this.hostname = toASCII(this.hostname);
	        }

	        var p = this.port ? ':' + this.port : '';
	        var h = this.hostname || '';
	        this.host = h + p;

	        // strip [ and ] from the hostname
	        // the host field still retains them, though
	        if (ipv6Hostname) {
	            this.hostname = this.hostname.slice(1, -1);
	            if (rest[0] !== '/') {
	                rest = '/' + rest;
	            }
	        }
	    }

	    // now rest is set to the post-host stuff.
	    // chop off any delim chars.
	    if (!unsafeProtocol[lowerProto]) {
	        // First, make 100% sure that any "autoEscape" chars get
	        // escaped, even if encodeURIComponent doesn't think they
	        // need to be.
	        const result = autoEscapeStr(rest);
	        if (result !== undefined)
	            rest = result;
	    }

	    var questionIdx = -1;
	    var hashIdx = -1;
	    for (i = 0; i < rest.length; ++i) {
	        const code = rest.charCodeAt(i);
	        if (code === 35/*#*/) {
	            this.hash = rest.slice(i);
	            hashIdx = i;
	            break;
	        } else if (code === 63/*?*/ && questionIdx === -1) {
	            questionIdx = i;
	        }
	    }

	    if (questionIdx !== -1) {
	        if (hashIdx === -1) {
	            this.search = rest.slice(questionIdx);
	            this.query = rest.slice(questionIdx + 1);
	        } else {
	            this.search = rest.slice(questionIdx, hashIdx);
	            this.query = rest.slice(questionIdx + 1, hashIdx);
	        }
	        if (parseQueryString) {
	            this.query = querystring.parse(this.query);
	        }
	    } else if (parseQueryString) {
	        // no query string, but parseQueryString still requested
	        this.search = '';
	        this.query = new ParsedQueryString();
	    }

	    var firstIdx = (questionIdx !== -1 &&
	    (hashIdx === -1 || questionIdx < hashIdx)
	        ? questionIdx
	        : hashIdx);
	    if (firstIdx === -1) {
	        if (rest.length > 0)
	            this.pathname = rest;
	    } else if (firstIdx > 0) {
	        this.pathname = rest.slice(0, firstIdx);
	    }
	    if (slashedProtocol[lowerProto] &&
	        this.hostname && !this.pathname) {
	        this.pathname = '/';
	    }

	    // to support http.request
	    if (this.pathname || this.search) {
	        const p = this.pathname || '';
	        const s = this.search || '';
	        this.path = p + s;
	    }

	    // finally, reconstruct the href based on what has been validated.
	    this.href = this.format();
	    return this;
	};

	function validateHostname(self, rest, hostname) {
	    for (var i = 0, lastPos; i <= hostname.length; ++i) {
	        var code;
	        if (i < hostname.length)
	            code = hostname.charCodeAt(i);
	        if (code === 46/*.*/ || i === hostname.length) {
	            if (i - lastPos > 0) {
	                if (i - lastPos > 63) {
	                    self.hostname = hostname.slice(0, lastPos + 63);
	                    return '/' + hostname.slice(lastPos + 63) + rest;
	                }
	            }
	            lastPos = i + 1;
	            continue;
	        } else if ((code >= 48/*0*/ && code <= 57/*9*/) ||
	            (code >= 97/*a*/ && code <= 122/*z*/) ||
	            code === 45/*-*/ ||
	            (code >= 65/*A*/ && code <= 90/*Z*/) ||
	            code === 43/*+*/ ||
	            code === 95/*_*/ ||
	            code > 127) {
	            continue;
	        }
	        // Invalid host character
	        self.hostname = hostname.slice(0, i);
	        if (i < hostname.length)
	            return '/' + hostname.slice(i) + rest;
	        break;
	    }
	}

	function autoEscapeStr(rest) {
	    var newRest = '';
	    var lastPos = 0;
	    for (var i = 0; i < rest.length; ++i) {
	        // Automatically escape all delimiters and unwise characters from RFC 2396
	        // Also escape single quotes in case of an XSS attack
	        switch (rest.charCodeAt(i)) {
	            case 9:   // '\t'
	                if (i - lastPos > 0)
	                    newRest += rest.slice(lastPos, i);
	                newRest += '%09';
	                lastPos = i + 1;
	                break;
	            case 10:  // '\n'
	                if (i - lastPos > 0)
	                    newRest += rest.slice(lastPos, i);
	                newRest += '%0A';
	                lastPos = i + 1;
	                break;
	            case 13:  // '\r'
	                if (i - lastPos > 0)
	                    newRest += rest.slice(lastPos, i);
	                newRest += '%0D';
	                lastPos = i + 1;
	                break;
	            case 32:  // ' '
	                if (i - lastPos > 0)
	                    newRest += rest.slice(lastPos, i);
	                newRest += '%20';
	                lastPos = i + 1;
	                break;
	            case 34:  // '"'
	                if (i - lastPos > 0)
	                    newRest += rest.slice(lastPos, i);
	                newRest += '%22';
	                lastPos = i + 1;
	                break;
	            case 39:  // '\''
	                if (i - lastPos > 0)
	                    newRest += rest.slice(lastPos, i);
	                newRest += '%27';
	                lastPos = i + 1;
	                break;
	            case 60:  // '<'
	                if (i - lastPos > 0)
	                    newRest += rest.slice(lastPos, i);
	                newRest += '%3C';
	                lastPos = i + 1;
	                break;
	            case 62:  // '>'
	                if (i - lastPos > 0)
	                    newRest += rest.slice(lastPos, i);
	                newRest += '%3E';
	                lastPos = i + 1;
	                break;
	            case 92:  // '\\'
	                if (i - lastPos > 0)
	                    newRest += rest.slice(lastPos, i);
	                newRest += '%5C';
	                lastPos = i + 1;
	                break;
	            case 94:  // '^'
	                if (i - lastPos > 0)
	                    newRest += rest.slice(lastPos, i);
	                newRest += '%5E';
	                lastPos = i + 1;
	                break;
	            case 96:  // '`'
	                if (i - lastPos > 0)
	                    newRest += rest.slice(lastPos, i);
	                newRest += '%60';
	                lastPos = i + 1;
	                break;
	            case 123: // '{'
	                if (i - lastPos > 0)
	                    newRest += rest.slice(lastPos, i);
	                newRest += '%7B';
	                lastPos = i + 1;
	                break;
	            case 124: // '|'
	                if (i - lastPos > 0)
	                    newRest += rest.slice(lastPos, i);
	                newRest += '%7C';
	                lastPos = i + 1;
	                break;
	            case 125: // '}'
	                if (i - lastPos > 0)
	                    newRest += rest.slice(lastPos, i);
	                newRest += '%7D';
	                lastPos = i + 1;
	                break;
	        }
	    }
	    if (lastPos === 0)
	        return;
	    if (lastPos < rest.length)
	        return newRest + rest.slice(lastPos);
	    else
	        return newRest;
	}

	// format a parsed object into a url string
	function urlFormat(obj) {
	    // ensure it's an object, and not a string url.
	    // If it's an obj, this is a no-op.
	    // this way, you can call url_format() on strings
	    // to clean up potentially wonky urls.
	    if (typeof obj === 'string') obj = urlParse(obj);

	    else if (typeof obj !== 'object' || obj === null)
	        throw new TypeError('Parameter "urlObj" must be an object, not ' +
	        obj === null ? 'null' : typeof obj);

	    else if (!(obj instanceof Url)) return Url.prototype.format.call(obj);

	    return obj.format();
	}

	Url.prototype.format = function() {
	    var auth = this.auth || '';
	    if (auth) {
	        auth = encodeAuth(auth);
	        auth += '@';
	    }

	    var protocol = this.protocol || '';
	    var pathname = this.pathname || '';
	    var hash = this.hash || '';
	    var host = '';
	    var query = '';

	    if (this.host) {
	        host = auth + this.host;
	    } else if (this.hostname) {
	        host = auth + (this.hostname.indexOf(':') === -1 ?
	                this.hostname :
	            '[' + this.hostname + ']');
	        if (this.port) {
	            host += ':' + this.port;
	        }
	    }

	    if (this.query !== null && typeof this.query === 'object')
	        query = querystring.stringify(this.query);

	    var search = this.search || (query && ('?' + query)) || '';

	    if (protocol && protocol.charCodeAt(protocol.length - 1) !== 58/*:*/)
	        protocol += ':';

	    var newPathname = '';
	    var lastPos = 0;
	    for (var i = 0; i < pathname.length; ++i) {
	        switch (pathname.charCodeAt(i)) {
	            case 35: // '#'
	                if (i - lastPos > 0)
	                    newPathname += pathname.slice(lastPos, i);
	                newPathname += '%23';
	                lastPos = i + 1;
	                break;
	            case 63: // '?'
	                if (i - lastPos > 0)
	                    newPathname += pathname.slice(lastPos, i);
	                newPathname += '%3F';
	                lastPos = i + 1;
	                break;
	        }
	    }
	    if (lastPos > 0) {
	        if (lastPos !== pathname.length)
	            pathname = newPathname + pathname.slice(lastPos);
	        else
	            pathname = newPathname;
	    }

	    // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
	    // unless they had them to begin with.
	    if (this.slashes || slashedProtocol[protocol]) {
	        if (this.slashes || host) {
	            if (pathname && pathname.charCodeAt(0) !== 47/*/*/)
	                pathname = '/' + pathname;
	            host = '//' + host;
	        } else if (protocol.length >= 4 &&
	            protocol.charCodeAt(0) === 102/*f*/ &&
	            protocol.charCodeAt(1) === 105/*i*/ &&
	            protocol.charCodeAt(2) === 108/*l*/ &&
	            protocol.charCodeAt(3) === 101/*e*/) {
	            host = '//';
	        }
	    }

	    search = search.replace('#', '%23');

	    if (hash && hash.charCodeAt(0) !== 35/*#*/) hash = '#' + hash;
	    if (search && search.charCodeAt(0) !== 63/*?*/) search = '?' + search;

	    return protocol + host + pathname + search + hash;
	};

	function urlResolve(source, relative) {
	    return urlParse(source, false, true).resolve(relative);
	}

	Url.prototype.resolve = function(relative) {
	    return this.resolveObject(urlParse(relative, false, true)).format();
	};

	function urlResolveObject(source, relative) {
	    if (!source) return relative;
	    return urlParse(source, false, true).resolveObject(relative);
	}

	Url.prototype.resolveObject = function(relative) {
	    if (typeof relative === 'string') {
	        var rel = new Url();
	        rel.parse(relative, false, true);
	        relative = rel;
	    }

	    var result = new Url();
	    var tkeys = Object.keys(this);
	    for (var tk = 0; tk < tkeys.length; tk++) {
	        var tkey = tkeys[tk];
	        result[tkey] = this[tkey];
	    }

	    // hash is always overridden, no matter what.
	    // even href="" will remove it.
	    result.hash = relative.hash;

	    // if the relative url is empty, then there's nothing left to do here.
	    if (relative.href === '') {
	        result.href = result.format();
	        return result;
	    }

	    // hrefs like //foo/bar always cut to the protocol.
	    if (relative.slashes && !relative.protocol) {
	        // take everything except the protocol from relative
	        var rkeys = Object.keys(relative);
	        for (var rk = 0; rk < rkeys.length; rk++) {
	            var rkey = rkeys[rk];
	            if (rkey !== 'protocol')
	                result[rkey] = relative[rkey];
	        }

	        //urlParse appends trailing / to urls like http://www.example.com
	        if (slashedProtocol[result.protocol] &&
	            result.hostname && !result.pathname) {
	            result.path = result.pathname = '/';
	        }

	        result.href = result.format();
	        return result;
	    }

	    if (relative.protocol && relative.protocol !== result.protocol) {
	        // if it's a known url protocol, then changing
	        // the protocol does weird things
	        // first, if it's not file:, then we MUST have a host,
	        // and if there was a path
	        // to begin with, then we MUST have a path.
	        // if it is file:, then the host is dropped,
	        // because that's known to be hostless.
	        // anything else is assumed to be absolute.
	        if (!slashedProtocol[relative.protocol]) {
	            var keys = Object.keys(relative);
	            for (var v = 0; v < keys.length; v++) {
	                var k = keys[v];
	                result[k] = relative[k];
	            }
	            result.href = result.format();
	            return result;
	        }

	        result.protocol = relative.protocol;
	        if (!relative.host &&
	            !/^file:?$/.test(relative.protocol) &&
	            !hostlessProtocol[relative.protocol]) {
	            const relPath = (relative.pathname || '').split('/');
	            while (relPath.length && !(relative.host = relPath.shift()));
	            if (!relative.host) relative.host = '';
	            if (!relative.hostname) relative.hostname = '';
	            if (relPath[0] !== '') relPath.unshift('');
	            if (relPath.length < 2) relPath.unshift('');
	            result.pathname = relPath.join('/');
	        } else {
	            result.pathname = relative.pathname;
	        }
	        result.search = relative.search;
	        result.query = relative.query;
	        result.host = relative.host || '';
	        result.auth = relative.auth;
	        result.hostname = relative.hostname || relative.host;
	        result.port = relative.port;
	        // to support http.request
	        if (result.pathname || result.search) {
	            var p = result.pathname || '';
	            var s = result.search || '';
	            result.path = p + s;
	        }
	        result.slashes = result.slashes || relative.slashes;
	        result.href = result.format();
	        return result;
	    }

	    var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/');
	    var isRelAbs = (
	        relative.host ||
	        relative.pathname && relative.pathname.charAt(0) === '/'
	    );
	    var mustEndAbs = (isRelAbs || isSourceAbs ||
	    (result.host && relative.pathname));
	    var removeAllDots = mustEndAbs;
	    var srcPath = result.pathname && result.pathname.split('/') || [];
	    var relPath = relative.pathname && relative.pathname.split('/') || [];
	    var psychotic = result.protocol && !slashedProtocol[result.protocol];

	    // if the url is a non-slashed url, then relative
	    // links like ../.. should be able
	    // to crawl up to the hostname, as well.  This is strange.
	    // result.protocol has already been set by now.
	    // Later on, put the first path part into the host field.
	    if (psychotic) {
	        result.hostname = '';
	        result.port = null;
	        if (result.host) {
	            if (srcPath[0] === '') srcPath[0] = result.host;
	            else srcPath.unshift(result.host);
	        }
	        result.host = '';
	        if (relative.protocol) {
	            relative.hostname = null;
	            relative.port = null;
	            result.auth = null;
	            if (relative.host) {
	                if (relPath[0] === '') relPath[0] = relative.host;
	                else relPath.unshift(relative.host);
	            }
	            relative.host = null;
	        }
	        mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
	    }

	    if (isRelAbs) {
	        // it's absolute.
	        if (relative.host || relative.host === '') {
	            result.host = relative.host;
	            result.auth = null;
	        }
	        if (relative.hostname || relative.hostname === '') {
	            result.hostname = relative.hostname;
	            result.auth = null;
	        }
	        result.search = relative.search;
	        result.query = relative.query;
	        srcPath = relPath;
	        // fall through to the dot-handling below.
	    } else if (relPath.length) {
	        // it's relative
	        // throw away the existing file, and take the new path instead.
	        if (!srcPath) srcPath = [];
	        srcPath.pop();
	        srcPath = srcPath.concat(relPath);
	        result.search = relative.search;
	        result.query = relative.query;
	    } else if (relative.search !== null && relative.search !== undefined) {
	        // just pull out the search.
	        // like href='?foo'.
	        // Put this after the other two cases because it simplifies the booleans
	        if (psychotic) {
	            result.hostname = result.host = srcPath.shift();
	            //occasionally the auth can get stuck only in host
	            //this especially happens in cases like
	            //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	            const authInHost = result.host && result.host.indexOf('@') > 0 ?
	                result.host.split('@') : false;
	            if (authInHost) {
	                result.auth = authInHost.shift();
	                result.host = result.hostname = authInHost.shift();
	            }
	        }
	        result.search = relative.search;
	        result.query = relative.query;
	        //to support http.request
	        if (result.pathname !== null || result.search !== null) {
	            result.path = (result.pathname ? result.pathname : '') +
	                (result.search ? result.search : '');
	        }
	        result.href = result.format();
	        return result;
	    }

	    if (!srcPath.length) {
	        // no path at all.  easy.
	        // we've already handled the other stuff above.
	        result.pathname = null;
	        //to support http.request
	        if (result.search) {
	            result.path = '/' + result.search;
	        } else {
	            result.path = null;
	        }
	        result.href = result.format();
	        return result;
	    }

	    // if a url ENDs in . or .., then it must get a trailing slash.
	    // however, if it ends in anything else non-slashy,
	    // then it must NOT get a trailing slash.
	    var last = srcPath.slice(-1)[0];
	    var hasTrailingSlash = (
	    (result.host || relative.host || srcPath.length > 1) &&
	    (last === '.' || last === '..') || last === '');

	    // strip single dots, resolve double dots to parent dir
	    // if the path tries to go above the root, `up` ends up > 0
	    var up = 0;
	    for (var i = srcPath.length; i >= 0; i--) {
	        last = srcPath[i];
	        if (last === '.') {
	            spliceOne(srcPath, i);
	        } else if (last === '..') {
	            spliceOne(srcPath, i);
	            up++;
	        } else if (up) {
	            spliceOne(srcPath, i);
	            up--;
	        }
	    }

	    // if the path is allowed to go above the root, restore leading ..s
	    if (!mustEndAbs && !removeAllDots) {
	        for (; up--; up) {
	            srcPath.unshift('..');
	        }
	    }

	    if (mustEndAbs && srcPath[0] !== '' &&
	        (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
	        srcPath.unshift('');
	    }

	    if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
	        srcPath.push('');
	    }

	    var isAbsolute = srcPath[0] === '' ||
	        (srcPath[0] && srcPath[0].charAt(0) === '/');

	    // put the host back
	    if (psychotic) {
	        result.hostname = result.host = isAbsolute ? '' :
	            srcPath.length ? srcPath.shift() : '';
	        //occasionally the auth can get stuck only in host
	        //this especially happens in cases like
	        //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	        const authInHost = result.host && result.host.indexOf('@') > 0 ?
	            result.host.split('@') : false;
	        if (authInHost) {
	            result.auth = authInHost.shift();
	            result.host = result.hostname = authInHost.shift();
	        }
	    }

	    mustEndAbs = mustEndAbs || (result.host && srcPath.length);

	    if (mustEndAbs && !isAbsolute) {
	        srcPath.unshift('');
	    }

	    if (!srcPath.length) {
	        result.pathname = null;
	        result.path = null;
	    } else {
	        result.pathname = srcPath.join('/');
	    }

	    //to support request.http
	    if (result.pathname !== null || result.search !== null) {
	        result.path = (result.pathname ? result.pathname : '') +
	            (result.search ? result.search : '');
	    }
	    result.auth = relative.auth || result.auth;
	    result.slashes = result.slashes || relative.slashes;
	    result.href = result.format();
	    return result;
	};

	Url.prototype.parseHost = function() {
	    var host = this.host;
	    var port = portPattern.exec(host);
	    if (port) {
	        port = port[0];
	        if (port !== ':') {
	            this.port = port.slice(1);
	        }
	        host = host.slice(0, host.length - port.length);
	    }
	    if (host) this.hostname = host;
	};

	// About 1.5x faster than the two-arg version of Array#splice().
	function spliceOne(list, index) {
	    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
	        list[i] = list[k];
	    list.pop();
	}

	var hexTable = new Array(256);
	for (var i = 0; i < 256; ++i)
	    hexTable[i] = '%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase();
	function encodeAuth(str) {
	    // faster encodeURIComponent alternative for encoding auth uri components
	    var out = '';
	    var lastPos = 0;
	    for (var i = 0; i < str.length; ++i) {
	        var c = str.charCodeAt(i);

	        // These characters do not need escaping:
	        // ! - . _ ~
	        // ' ( ) * :
	        // digits
	        // alpha (uppercase)
	        // alpha (lowercase)
	        if (c === 0x21 || c === 0x2D || c === 0x2E || c === 0x5F || c === 0x7E ||
	            (c >= 0x27 && c <= 0x2A) ||
	            (c >= 0x30 && c <= 0x3A) ||
	            (c >= 0x41 && c <= 0x5A) ||
	            (c >= 0x61 && c <= 0x7A)) {
	            continue;
	        }

	        if (i - lastPos > 0)
	            out += str.slice(lastPos, i);

	        lastPos = i + 1;

	        // Other ASCII characters
	        if (c < 0x80) {
	            out += hexTable[c];
	            continue;
	        }

	        // Multi-byte characters ...
	        if (c < 0x800) {
	            out += hexTable[0xC0 | (c >> 6)] + hexTable[0x80 | (c & 0x3F)];
	            continue;
	        }
	        if (c < 0xD800 || c >= 0xE000) {
	            out += hexTable[0xE0 | (c >> 12)] +
	                hexTable[0x80 | ((c >> 6) & 0x3F)] +
	                hexTable[0x80 | (c & 0x3F)];
	            continue;
	        }
	        // Surrogate pair
	        ++i;
	        var c2;
	        if (i < str.length)
	            c2 = str.charCodeAt(i) & 0x3FF;
	        else
	            c2 = 0;
	        c = 0x10000 + (((c & 0x3FF) << 10) | c2);
	        out += hexTable[0xF0 | (c >> 18)] +
	            hexTable[0x80 | ((c >> 12) & 0x3F)] +
	            hexTable[0x80 | ((c >> 6) & 0x3F)] +
	            hexTable[0x80 | (c & 0x3F)];
	    }
	    if (lastPos === 0)
	        return str;
	    if (lastPos < str.length)
	        return out + str.slice(lastPos);
	    return out;
	}


/***/ },
/* 61 */
/***/ function(module, exports) {

	// Taken from https://github.com/substack/vm-browserify

	var indexOf = (function() {
	    var indexOf = [].indexOf;

	    return function (arr, obj) {
	        if (indexOf) return arr.indexOf(obj);
	        for (var i = 0; i < arr.length; ++i) {
	            if (arr[i] === obj) return i;
	        }
	        return -1;
	    };
	})();

	var Object_keys = function (obj) {
	    if (Object.keys) return Object.keys(obj)
	    else {
	        var res = [];
	        for (var key in obj) res.push(key)
	        return res;
	    }
	};

	var forEach = function (xs, fn) {
	    if (xs.forEach) return xs.forEach(fn)
	    else for (var i = 0; i < xs.length; i++) {
	        fn(xs[i], i, xs);
	    }
	};

	var defineProp = (function() {
	    try {
	        Object.defineProperty({}, '_', {});
	        return function(obj, name, value) {
	            Object.defineProperty(obj, name, {
	                writable: true,
	                enumerable: false,
	                configurable: true,
	                value: value
	            })
	        };
	    } catch(e) {
	        return function(obj, name, value) {
	            obj[name] = value;
	        };
	    }
	}());

	var globals = ['Array', 'Boolean', 'Date', 'Error', 'EvalError', 'Function',
	    'Infinity', 'JSON', 'Math', 'NaN', 'Number', 'Object', 'RangeError',
	    'ReferenceError', 'RegExp', 'String', 'SyntaxError', 'TypeError', 'URIError',
	    'decodeURI', 'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
	    'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'undefined', 'unescape'];

	var Script = exports.Script = function NodeScript (code) {
	    if (!(this instanceof Script)) return new Script(code);
	    this.code = code;
	};

	Script.prototype.runInContext = function (context) {
	    //if (!(context instanceof Context)) {
	    //    throw new TypeError("needs a 'context' argument.");
	    //}
	    if (typeof context != 'object') {
	        throw new TypeError("needs a 'context' argument.");
	    }

	    var iframe = document.createElement('iframe');
	    if (!iframe.style) iframe.style = {};
	    iframe.style.display = 'none';

	    document.body.appendChild(iframe);

	    var win = iframe.contentWindow;
	    var wEval = win.eval, wExecScript = win.execScript;

	    if (!wEval && wExecScript) {
	        // win.eval() magically appears when this is called in IE:
	        wExecScript.call(win, 'null');
	        wEval = win.eval;
	    }

	    forEach(Object_keys(context), function (key) {
	        win[key] = context[key];
	    });
	    forEach(globals, function (key) {
	        if (context[key]) {
	            win[key] = context[key];
	        }
	    });

	    var winKeys = Object_keys(win);

	    var res = wEval.call(win, this.code);

	    forEach(Object_keys(win), function (key) {
	        // Avoid copying circular objects like `top` and `window` by only
	        // updating existing context properties or new properties in the `win`
	        // that was only introduced after the eval.
	        if (key in context || indexOf(winKeys, key) === -1) {
	            context[key] = win[key];
	        }
	    });

	    forEach(globals, function (key) {
	        if (!(key in context)) {
	            defineProp(context, key, win[key]);
	        }
	    });

	    document.body.removeChild(iframe);

	    return res;
	};

	Script.prototype.runInThisContext = function () {
	    return eval(this.code); // maybe...
	};

	Script.prototype.runInNewContext = function (context) {
	    var ctx = Script.createContext(context);
	    var res = this.runInContext(ctx);

	    forEach(Object_keys(ctx), function (key) {
	        context[key] = ctx[key];
	    });

	    return res;
	};

	forEach(Object_keys(Script.prototype), function (name) {
	    exports[name] = Script[name] = function (code) {
	        var s = Script(code);
	        return s[name].apply(s, [].slice.call(arguments, 1));
	    };
	});

	exports.createScript = function (code) {
	    return exports.Script(code);
	};

	//exports.createContext = Script.createContext = function (context) {
	exports.createContext = function (context) {
	    return context;
	    //var copy = new Context();
	    //if(typeof context === 'object') {
	    //    forEach(Object_keys(context), function (key) {
	    //        copy[key] = context[key];
	    //    });
	    //}
	    //return copy;
	};

	exports.runInThisContext = function(code) {
	    var script = new Script(code);
	    script.runInThisContext();
	};


/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Buffer = __webpack_require__(7).Buffer;

	function assertEncoding(encoding) {
	    // Do not cache `Buffer.isEncoding`, some modules monkey-patch it to support
	    // additional encodings
	    if (encoding && !Buffer.isEncoding(encoding)) {
	        throw new Error('Unknown encoding: ' + encoding);
	    }
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters. CESU-8 is handled as part of the UTF-8 encoding.
	//
	// @TODO Handling all encodings inside a single object makes it very difficult
	// to reason about this code, so it should be split up in the future.
	// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
	// points as used by CESU-8.
	var StringDecoder = exports.StringDecoder = function(encoding) {
	    this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
	    assertEncoding(encoding);
	    switch (this.encoding) {
	        case 'utf8':
	            // CESU-8 represents each of Surrogate Pair by 3-bytes
	            this.surrogateSize = 3;
	            break;
	        case 'ucs2':
	        case 'utf16le':
	            // UTF-16 represents each of Surrogate Pair by 2-bytes
	            this.surrogateSize = 2;
	            this.detectIncompleteChar = utf16DetectIncompleteChar;
	            break;
	        case 'base64':
	            // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
	            this.surrogateSize = 3;
	            this.detectIncompleteChar = base64DetectIncompleteChar;
	            break;
	        default:
	            this.write = passThroughWrite;
	            return;
	    }

	    // Enough space to store all bytes of a single character. UTF-8 needs 4
	    // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
	    this.charBuffer = new Buffer(6);
	    // Number of bytes received for the current incomplete multi-byte character.
	    this.charReceived = 0;
	    // Number of bytes expected for the current incomplete multi-byte character.
	    this.charLength = 0;
	};


	// write decodes the given buffer and returns it as JS string that is
	// guaranteed to not contain any partial multi-byte characters. Any partial
	// character found at the end of the buffer is buffered up, and will be
	// returned when calling write again with the remaining bytes.
	//
	// Note: Converting a Buffer containing an orphan surrogate to a String
	// currently works, but converting a String to a Buffer (via `new Buffer`, or
	// Buffer#write) will replace incomplete surrogates with the unicode
	// replacement character. See https://codereview.chromium.org/121173009/ .
	StringDecoder.prototype.write = function(buffer) {
	    var charStr = '';
	    var buflen = buffer.length;
	    var charBuffer = this.charBuffer;
	    var charLength = this.charLength;
	    var charReceived = this.charReceived;
	    var surrogateSize = this.surrogateSize;
	    var encoding = this.encoding;
	    var charCode;
	    // if our last write ended with an incomplete multibyte character
	    while (charLength) {
	        // determine how many remaining bytes this buffer has to offer for this char
	        var diff = charLength - charReceived;
	        var available = (buflen >= diff) ? diff : buflen;

	        // add the new bytes to the char buffer
	        buffer.copy(charBuffer, charReceived, 0, available);
	        charReceived += available;

	        if (charReceived < charLength) {
	            // still not enough chars in this buffer? wait for more ...

	            this.charLength = charLength;
	            this.charReceived = charReceived;

	            return '';
	        }

	        // remove bytes belonging to the current character from the buffer
	        buffer = buffer.slice(available, buflen);
	        buflen = buffer.length;

	        // get the character that was split
	        charStr = charBuffer.toString(encoding, 0, charLength);

	        // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	        charCode = charStr.charCodeAt(charStr.length - 1);
	        if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	            charLength += surrogateSize;
	            charStr = '';
	            continue;
	        }
	        charReceived = charLength = 0;

	        // if there are no more bytes in this buffer, just emit our char
	        if (buflen === 0) {
	            this.charLength = charLength;
	            this.charReceived = charReceived;

	            return charStr;
	        }
	    }

	    // determine and set charLength / charReceived
	    if (this.detectIncompleteChar(buffer))
	        charLength = this.charLength;
	    charReceived = this.charReceived;

	    var end = buflen;
	    if (charLength) {
	        // buffer the incomplete character bytes we got
	        buffer.copy(charBuffer, 0, buflen - charReceived, end);
	        end -= charReceived;
	    }

	    this.charLength = charLength;
	    charStr += buffer.toString(encoding, 0, end);

	    end = charStr.length - 1;
	    charCode = charStr.charCodeAt(end);
	    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	        charLength += surrogateSize;
	        charReceived += surrogateSize;
	        charBuffer.copy(charBuffer, surrogateSize, 0, surrogateSize);
	        buffer.copy(charBuffer, 0, 0, surrogateSize);

	        this.charLength = charLength;
	        this.charReceived = charReceived;

	        return charStr.substring(0, end);
	    }

	    // or just emit the charStr
	    return charStr;
	};

	// detectIncompleteChar determines if there is an incomplete UTF-8 character at
	// the end of the given buffer. If so, it sets this.charLength to the byte
	// length that character, and sets this.charReceived to the number of bytes
	// that are available for this character.
	StringDecoder.prototype.detectIncompleteChar = function(buffer) {
	    var buflen = buffer.length;
	    // determine how many bytes we have to check at the end of this buffer
	    var i = (buflen >= 3) ? 3 : buflen;
	    var newlen = false;

	    // Figure out if one of the last i bytes of our buffer announces an
	    // incomplete char.
	    for (; i > 0; i--) {
	        var c = buffer[buflen - i];

	        // See http://en.wikipedia.org/wiki/UTF-8#Description

	        // 110XXXXX
	        if (i === 1 && c >> 5 === 0x06) {
	            this.charLength = 2;
	            newlen = true;
	            break;
	        }

	        // 1110XXXX
	        if (i <= 2 && c >> 4 === 0x0E) {
	            this.charLength = 3;
	            newlen = true;
	            break;
	        }

	        // 11110XXX
	        if (i <= 3 && c >> 3 === 0x1E) {
	            this.charLength = 4;
	            newlen = true;
	            break;
	        }
	    }

	    this.charReceived = i;

	    return newlen;
	};

	StringDecoder.prototype.end = function(buffer) {
	    var res = '';
	    if (buffer && buffer.length)
	        res = this.write(buffer);

	    var charReceived = this.charReceived;
	    if (charReceived) {
	        var cr = charReceived;
	        var buf = this.charBuffer;
	        var enc = this.encoding;
	        res += buf.toString(enc, 0, cr);
	    }

	    return res;
	};

	function passThroughWrite(buffer) {
	    return buffer.toString(this.encoding);
	}

	function utf16DetectIncompleteChar(buffer) {
	    var charReceived = this.charReceived = buffer.length % 2;
	    this.charLength = charReceived ? 2 : 0;
	    return true;
	}

	function base64DetectIncompleteChar(buffer) {
	    var charReceived = this.charReceived = buffer.length % 3;
	    this.charLength = charReceived ? 3 : 0;
	    return true;
	}


/***/ },
/* 63 */
/***/ function(module, exports) {

	





/***/ }
/******/ ]);
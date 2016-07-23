"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="typing.d.ts" />
var events_1 = require('./events');
var process = global.process;
if (!process)
    throw Error('`process` global not defined.');
var Process = (function (_super) {
    __extends(Process, _super);
    function Process() {
        _super.apply(this, arguments);
    }
    return Process;
}(events_1["default"]));
exports.title = 'full.js';
exports.version = 'v1.0.0';
exports.moduleLoadList = []; // For compatibility with node.
exports.versions = {
    full: '1.0.0'
};
exports.arch = process.arch;
exports.platform = process.platform;
exports.release = process.release;
exports.argv = process.argv || [];
exports.execArgv = [];
exports.env = process.env || {};
exports.features = {};
exports.execPath = process.execPath || {};
exports.config = {};
// reallyExit: [Function: reallyExit],
exports.syscall = null;
exports.syscall64 = null;
if (process.syscall) {
    exports.syscall = process.syscall;
    exports.syscall64 = process.syscall64;
}
else {
    var libsys = require('libsys');
    exports.syscall = libsys.syscall;
    exports.syscall64 = libsys.syscall64;
}
var libjs = require('../../libjs/libjs');
exports.pid = libjs.getpid();
function getgid() {
    return libjs.getgid();
}
exports.getgid = getgid;
function cwd() {
    try {
        return libjs.getcwd();
    }
    catch (e) {
        return '.';
    }
}
exports.cwd = cwd;
exports.nextTick = setImmediate;
// abort: [Function: abort],
// chdir: [Function: chdir],
// cwd: [Function: cwd],
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

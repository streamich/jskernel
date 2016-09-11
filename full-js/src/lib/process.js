var EventEmitter = require('./events').EventEmitter;
var eloop = require('./eloop');


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


var libjs = require('../libjs/index');

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


var fs = require('./fs');
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


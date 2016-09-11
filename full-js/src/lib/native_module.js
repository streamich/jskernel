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
        this.exports = require('./' + this.id);

        this.loaded = true;
    } finally {
        this.loading = false;
    }
};

NativeModule.prototype.cache = function() {
    NativeModule._cache[this.id] = this;
};

exports.NativeModule = NativeModule;

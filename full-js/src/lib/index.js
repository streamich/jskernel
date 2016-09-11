"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var libjs = require('../libjs/index');
var inotify_1 = require('../libaio/inotify');
var extend = require('../lib/util').extend;
var pathModule = require('../lib/path');
var buffer_1 = require('../lib/buffer');
var static_buffer_1 = require('../lib/static-buffer');
if (__DEBUG__) {
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

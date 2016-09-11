"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var libjs = require('../libjs/index');
var inotify_1 = require('../libaio/inotify');
var util = require('./util');
var pathModule = require('./path');
var events_1 = require('./events');
var buffer_1 = require('./buffer');
var static_buffer_1 = require('./static-buffer');
var stream_1 = require('./stream');
if (__DEBUG__) {
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
        case 2 /* ENOENT */: return "ENOENT: no such file or directory, " + func + " '" + path + "'";
        case 9 /* EBADF */: return "EBADF: bad file descriptor, " + func;
        case 22 /* EINVAL */: return "EINVAL: invalid argument, " + func;
        case 1 /* EPERM */: return "EPERM: operation not permitted, " + func + " '" + path + "' -> '" + path2 + "'";
        case 71 /* EPROTO */: return "EPROTO: protocol error, " + func + " '" + path + "' -> '" + path2 + "'";
        case 17 /* EEXIST */: return "EEXIST: file already exists, " + func + " '" + path + "' -> '" + path2 + "'";
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
// List of file `flags` as defined by node.
(function (flags) {
    // Open file for reading. An exception occurs if the file does not exist.
    flags[flags["r"] = 0] = "r";
    // Open file for reading and writing. An exception occurs if the file does not exist.
    flags[flags['r+'] = 2] = 'r+';
    // Open file for reading in synchronous mode. Instructs the operating system to bypass the local file system cache.
    flags[flags["rs"] = 1069056] = "rs";
    // Open file for reading and writing, telling the OS to open it synchronously. See notes for 'rs' about using this with caution.
    flags[flags['rs+'] = 1069058] = 'rs+';
    // Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
    flags[flags["w"] = 577] = "w";
    // Like 'w' but fails if path exists.
    flags[flags["wx"] = 705] = "wx";
    // Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).
    flags[flags['w+'] = 578] = 'w+';
    // Like 'w+' but fails if path exists.
    flags[flags['wx+'] = 706] = 'wx+';
    // Open file for appending. The file is created if it does not exist.
    flags[flags["a"] = 1089] = "a";
    // Like 'a' but fails if path exists.
    flags[flags["ax"] = 1217] = "ax";
    // Open file for reading and appending. The file is created if it does not exist.
    flags[flags['a+'] = 1090] = 'a+';
    // Like 'a+' but fails if path exists.
    flags[flags['ax+'] = 1218] = 'ax+';
})(exports.flags || (exports.flags = {}));
var flags = exports.flags;
// Chunk size for reading files.
var CHUNK = 4096;
exports.F_OK = 0 /* F_OK */;
exports.R_OK = 4 /* R_OK */;
exports.W_OK = 2 /* W_OK */;
exports.X_OK = 1 /* X_OK */;
var appendFileDefaults = {
    encoding: 'utf8',
    mode: 438 /* FILE */,
    flag: 'a'
};
var writeFileDefaults = {
    encoding: 'utf8',
    mode: 438 /* FILE */,
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
        return (this.mode & 32768 /* IFREG */) == 32768 /* IFREG */;
    };
    Stats.prototype.isDirectory = function () {
        return (this.mode & 16384 /* IFDIR */) == 16384 /* IFDIR */;
    };
    Stats.prototype.isBlockDevice = function () {
        return (this.mode & 24576 /* IFBLK */) == 24576 /* IFBLK */;
    };
    Stats.prototype.isCharacterDevice = function () {
        return (this.mode & 8192 /* IFCHR */) == 8192 /* IFCHR */;
    };
    Stats.prototype.isSymbolicLink = function () {
        return (this.mode & 40960 /* IFLNK */) == 40960 /* IFLNK */;
    };
    Stats.prototype.isFIFO = function () {
        return (this.mode & 4096 /* IFIFO */) == 4096 /* IFIFO */;
    };
    Stats.prototype.isSocket = function () {
        return (this.mode & 49152 /* IFSOCK */) == 49152 /* IFSOCK */;
    };
    return Stats;
}());
exports.Stats = Stats;
// class WriteStream extends Writable {
//     bytesWritten: number = 0;
//     path: string|Buffer|StaticBuffer = null;
// Event: 'open'
// Event: 'close'
// }
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
        // TODO: If user provides file descriptor that is read-only, what do we do?
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
    // Close fd only if WE opened it.
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
        // Close fd only if WE opened it.
        if (!is_fd)
            libjs.closeAsync(fd, noop);
    }
    var fd;
    var is_fd = typeof file === 'number';
    if (is_fd) {
        // TODO: If user provides file descriptor that is read-only, what do we do?
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
// Mac OS only:
//     function lchmodSync(path: string|Buffer, mode: number) {}
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
    // console.log('Deprecated fs.existsSync(): Use fs.statSync() or fs.accessSync() instead.');
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
//     TODO: Make this work with `utimes` instead of `utime`, also figure out a way
//     TODO: how to set time using file descriptor, possibly use `utimensat` system call.
function utimesSync(path, atime, mtime) {
    var vpath = validPathOrThrow(path);
    // if(typeof atime === 'string') atime = parseInt(atime as string);
    // if(typeof mtime === 'string') mtime = parseInt(mtime as string);
    if (typeof atime !== 'number')
        throw TypeError(ERRSTR.ATIME);
    if (typeof mtime !== 'number')
        throw TypeError(ERRSTR.MTIME);
    var vatime = atime;
    var vmtime = mtime;
    // if(!Number.isFinite(atime)) atime = Date.now();
    // if(!Number.isFinite(mtime)) mtime = Date.now();
    if (!isFinite(vatime))
        vatime = Date.now();
    if (!isFinite(vmtime))
        vmtime = Date.now();
    // `libjs.utime` works with 1 sec precision.
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
    // if(typeof atime === 'string') atime = parseInt(atime as string);
    // if(typeof mtime === 'string') mtime = parseInt(mtime as string);
    if (typeof atime !== 'number')
        throw TypeError(ERRSTR.ATIME);
    if (typeof mtime !== 'number')
        throw TypeError(ERRSTR.MTIME);
    var vatime = atime;
    var vmtime = mtime;
    // if(!Number.isFinite(atime)) atime = Date.now();
    // if(!Number.isFinite(mtime)) mtime = Date.now();
    if (!isFinite(vatime))
        vatime = Date.now();
    if (!isFinite(vmtime))
        vmtime = Date.now();
    // `libjs.utime` works with 1 sec precision.
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
// function futimesSync(fd: number, atime: number|string, mtime: number|string) {}
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
    if (mode === void 0) { mode = 511 /* DIR */; }
    var vpath = validPathOrThrow(path);
    if (typeof mode !== 'number')
        throw TypeError(ERRSTR.MODE_INT);
    var res = libjs.mkdir(vpath, mode);
    if (res < 0)
        throwError(res, 'mkdir', vpath);
}
exports.mkdirSync = mkdirSync;
function mkdir(path, mode, callback) {
    if (mode === void 0) { mode = 511 /* DIR */; }
    var vpath = validPathOrThrow(path);
    if (typeof mode === 'function') {
        callback = mode;
        mode = 511 /* DIR */;
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
    if (mode === void 0) { mode = 438 /* FILE */; }
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
        mode = 438 /* FILE */;
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
// TODO: Currently it works on `Buffer`, must change to `StaticBuffer` so that garbage
// collector cannot move it.
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
        var seekres = libjs.lseek(fd, position, 0 /* SET */);
        if (seekres < 0)
            throwError(seekres, 'read');
    }
    var buf = buffer.slice(offset, offset + length);
    // var sb = StaticBuffer.isStaticBuffer(buf)
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
    // TODO: Make sure `buffer` is `StaticBuffer`.
    // StaticBuffer.isStaticBuffer(buf)
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
        libjs.lseekAsync(fd, position, 0 /* SET */, function (seekres) {
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
// TODO: `readdir` (unlike `readdirSync`) often returns `-71 = EPROTO` (Invalid protocol) when
// TODO: opening a directory, but directory clearly exists.
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
        fd = libjs.open(vfile, flag, 438 /* FILE */);
        if (fd < 0)
            throwError(fd, 'readFile', vfile);
    }
    var list = [];
    do {
        // TODO: Change this to `StaticBuffer`, there is some bug in `.slice()` method.
        // var buf = new StaticBuffer(CHUNK);
        var buf = new buffer_1.Buffer(CHUNK);
        var res = libjs.read(fd, buf); // TODO: -> StaticBuffer
        if (res < 0)
            throwError(res, 'readFile');
        if (res < CHUNK)
            buf = buf.slice(0, res);
        list.push(buf);
    } while (res > 0);
    if (!is_fd)
        libjs.close(fd);
    var buffer = buffer_1.Buffer.concat(list);
    // buffer.print();
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
        libjs.openAsync(vfile, flag, 438 /* FILE */, function (fd) {
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
function symlinkSync(target, path /*, type?: string*/) {
    var vtarget = validPathOrThrow(target);
    var vpath = validPathOrThrow(path);
    // > The type argument [..] is only available on Windows (ignored on other platforms)
    /* type = typeof type === 'string' ? type : null; */
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
    // > The type argument [..] is only available on Windows (ignored on other platforms)
    /* type = typeof type === 'string' ? type : null; */
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
    // Check which function definition we are working with.
    if (typeof b === 'number') {
        // writeSync(fd: number, buffer: Buffer, offset: number, length: number, position?: number);
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
        // writeSync(fd: number, data: string|Buffer, position?: number, encoding: string = 'utf8');
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
        var sres = libjs.lseek(fd, position, 0 /* SET */);
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
            var is_rename = (event.mask & 192 /* MOVE */) || (event.mask & 256 /* CREATE */);
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
// Phew, lucky us:
//
// > The recursive option is only supported on OS X and Windows.
/*    function watch(filename: string|Buffer, options: string|IWatchOptions, listener?: CwatchListener) {
 var vfilename = validPathOrThrow(filename);
 vfilename = pathModule.resolve(vfilename);

 var otps: IWatchOptions;
 if(options) {
 if(typeof options === 'function') {
 listener = options as any as CwatchListener;
 otps = watchOptionsDefaults;
 } else if (typeof options === 'string') {
 otps = extend({encoding: options}, watchOptionsDefaults) as IWatchOptions;
 } else if(typeof options === 'object') {
 otps = extend(options, watchOptionsDefaults) as IWatchOptions;
 } else
 throw TypeError('"options" must be a string or an object');
 } else otps = watchOptionsDefaults;

 const watcher = new FSWatcher;
 watcher.start(vfilename, otps.persistent, otps.recursive, otps.encoding);

 if (listener) {
 if(typeof listener !== 'function')
 throw TypeError('"listener" must be a callback');
 watcher.on('change', listener);
 }

 return watcher;
 }*/
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
                // > The callback listener will be called each time the file is accessed.
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
// ReadStream ans WriteStream ------------------------------------------------------------------------------------------
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
    // a little bit bigger buffer and water marks by default
    options = util._extend({
        highWaterMark: 64 * 1024
    }, options || {});
    stream_1.Readable.call(this, options);
    this.path = path;
    this.fd = options.hasOwnProperty('fd') ? options.fd : null;
    this.flags = options.hasOwnProperty('flags') ? options.flags : 'r';
    this.mode = options.hasOwnProperty('mode') ? options.mode : 438; /*=0666*/
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
        // start the flow of data.
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
        // discard the old pool.
        pool = null;
        allocNewPool(this._readableState.highWaterMark);
    }
    // Grab another reference to the pool in the case that while we're
    // in the thread pool another read() finishes up the pool, and
    // allocates a new one.
    var thisPool = pool;
    var toRead = Math.min(pool.length - pool.used, n);
    var start = pool.used;
    if (!util.isUndefined(this.pos))
        toRead = Math.min(this.end - this.pos + 1, toRead);
    // already read everything we were supposed to read!
    // treat as EOF.
    if (toRead <= 0)
        return this.push(null);
    // the actual read.
    var self = this;
    console.log('reading...', n);
    read(this.fd, pool, pool.used, toRead, this.pos, onread);
    // move the pool positions, and internal position for reading.
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
    this.mode = options.hasOwnProperty('mode') ? options.mode : 438; /*=0666*/
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
    // dispose on finish.
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
// SyncWriteStream is internal. DO NOT USE. ----------------------------------------------------------------------------
// Temporary hack for process.stdout and process.stderr when piped to files.
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
    // parse arguments
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
    // Change strings to buffers. SLOW
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

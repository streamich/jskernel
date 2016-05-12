"use strict";
var libjs = require('../libjs/libjs');
function noop() { }
function throwError(errno, func, path, path2) {
    if (func === void 0) { func = ''; }
    if (path === void 0) { path = ''; }
    if (path2 === void 0) { path2 = ''; }
    // console.log(-errno, libjs.ERROR.EBADF);
    switch (-errno) {
        case 2 /* ENOENT */: throw Error("ENOENT: no such file or directory, " + func + " '" + path + "'");
        case 9 /* EBADF */: throw Error("EBADF: bad file descriptor, " + func);
        case 22 /* EINVAL */: throw Error("EINVAL: invalid argument, " + func);
        case 1 /* EPERM */: throw Error("EPERM: operation not permitted, " + func + " '" + path + "' -> '" + path2 + "'");
        default: throw Error("Error occurred in " + func + ": errno = " + errno);
    }
}
function validPathOrThrow(path) {
    if (path instanceof Buffer)
        path = path.toString();
    if (typeof path !== 'string')
        throw TypeError('path must be a string');
    return path;
}
function validateFd(fd) {
    if (typeof fd !== 'number')
        throw TypeError('fd must be a file descriptor');
}
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
var MODE_DEFAULT = 438;
exports.F_OK = 0 /* F_OK */;
exports.R_OK = 4 /* R_OK */;
exports.W_OK = 2 /* W_OK */;
exports.X_OK = 1 /* X_OK */;
function accessSync(path, mode) {
    if (mode === void 0) { mode = exports.F_OK; }
    var result = libjs.access(path, mode);
    if (result < 0)
        throw Error("Access to file denied [" + result + "]: " + path);
}
exports.accessSync = accessSync;
var appendFileDefaults = {
    encoding: 'utf8',
    mode: MODE_DEFAULT,
    flag: flags.a
};
function appendFileSync(file, data, options) {
    if (options === void 0) { options = {}; }
    options = Object.assign(options, appendFileDefaults);
}
exports.appendFileSync = appendFileSync;
function chmodSync(path, mode) {
    path = validPathOrThrow(path);
    if (typeof mode !== 'number')
        throw TypeError('mode must be an integer');
    var result = libjs.chmod(path, mode);
    if (result < 0)
        throwError(result, 'chmod', path);
}
exports.chmodSync = chmodSync;
function fchmodSync(fd, mode) {
    validateFd(fd);
    if (typeof mode !== 'number')
        throw TypeError('mode must be an integer');
    var result = libjs.fchmod(fd, mode);
    if (result < 0)
        throwError(result, 'chmod');
}
exports.fchmodSync = fchmodSync;
// Mac OS only:
//     export function lchmodSync(path: string|Buffer, mode: number) {}
function chownSync(path, uid, gid) {
    path = validPathOrThrow(path);
    if (typeof uid !== 'number')
        throw TypeError('uid must be an unsigned int');
    if (typeof gid !== 'number')
        throw TypeError('gid must be an unsigned int');
    var result = libjs.chown(path, uid, gid);
    if (result < 0)
        throwError(result, 'chown', path);
}
exports.chownSync = chownSync;
function fchownSync(fd, uid, gid) {
    validateFd(fd);
    if (typeof uid !== 'number')
        throw TypeError('uid must be an unsigned int');
    if (typeof gid !== 'number')
        throw TypeError('gid must be an unsigned int');
    var result = libjs.fchown(fd, uid, gid);
    if (result < 0)
        throwError(result, 'fchown');
}
exports.fchownSync = fchownSync;
function lchownSync(path, uid, gid) {
    path = validPathOrThrow(path);
    if (typeof uid !== 'number')
        throw TypeError('uid must be an unsigned int');
    if (typeof gid !== 'number')
        throw TypeError('gid must be an unsigned int');
    var result = libjs.lchown(path, uid, gid);
    if (result < 0)
        throwError(result, 'lchown', path);
}
exports.lchownSync = lchownSync;
function closeSync(fd) {
    if (typeof fd !== 'number')
        throw TypeError('fd must be a file descriptor');
    var result = libjs.close(fd);
    if (result < 0)
        throwError(result, 'close');
}
exports.closeSync = closeSync;
var readStreamOptionsDefaults = {
    flags: 'r',
    encoding: null,
    fd: null,
    mode: MODE_DEFAULT,
    autoClose: true
};
function createReadStream(path, options) {
    if (options === void 0) { options = {}; }
    options = Object.assign(options, readStreamOptionsDefaults);
}
exports.createReadStream = createReadStream;
function createWriteStream(path, options) { }
exports.createWriteStream = createWriteStream;
function existsSync(path) {
    console.log('Deprecated fs.existsSync(): Use fs.statSync() or fs.accessSync() instead.');
    try {
        access(path);
        return true;
    }
    catch (e) {
        return false;
    }
}
exports.existsSync = existsSync;
function fsyncSync(fd) {
    if (typeof fd !== 'number')
        throw TypeError('fd must be a file descriptor');
    var result = libjs.fsync(fd);
    if (result < 0)
        throwError(result, 'fsync');
}
exports.fsyncSync = fsyncSync;
function fdatasyncSync(fd) {
    if (typeof fd !== 'number')
        throw TypeError('fd must be a file descriptor');
    var result = libjs.fdatasync(fd);
    if (result < 0)
        throwError(result, 'fdatasync');
}
exports.fdatasyncSync = fdatasyncSync;
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
    stats.atime = new Date(res.atime * 1000);
    stats.mtime = new Date(res.mtime * 1000);
    stats.ctime = new Date(res.ctime * 1000);
    stats.birthtime = stats.ctime;
    return stats;
}
function statSync(path) {
    path = validPathOrThrow(path);
    try {
        var res = libjs.stat(path);
        return createStatsObject(res);
    }
    catch (errno) {
        throwError(errno, 'stat', path);
    }
}
exports.statSync = statSync;
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
function lstatSync(path) {
    path = validPathOrThrow(path);
    try {
        var res = libjs.lstat(path);
        return createStatsObject(res);
    }
    catch (errno) {
        throwError(errno, 'lstat', path);
    }
}
exports.lstatSync = lstatSync;
function truncateSync(path, len) {
    path = validPathOrThrow(path);
    if (typeof len !== 'number')
        throw TypeError('len must be an integer');
    var res = libjs.truncate(path, len);
    if (res < 0)
        throwError(res, 'truncate', path);
}
exports.truncateSync = truncateSync;
function ftruncateSync(fd, len) {
    validateFd(fd);
    if (typeof len !== 'number')
        throw TypeError('len must be an integer');
    var res = libjs.ftruncate(fd, len);
    if (res < 0)
        throwError(res, 'ftruncate');
}
exports.ftruncateSync = ftruncateSync;
//     TODO: Make this work with `utimes` instead of `utime`, also figure out a way
//     TODO: how to set time using file descriptor, possibly use `utimensat` system call.
function utimesSync(path, atime, mtime) {
    path = validPathOrThrow(path);
    if (typeof atime === 'string')
        atime = parseInt(atime);
    if (typeof mtime === 'string')
        mtime = parseInt(mtime);
    if (typeof atime !== 'number')
        throw TypeError('atime must be an integer');
    if (typeof mtime !== 'number')
        throw TypeError('mtime must be an integer');
    if (!Number.isFinite(atime))
        atime = Date.now();
    if (!Number.isFinite(mtime))
        mtime = Date.now();
    // `libjs.utime` works with 1 sec precision.
    atime = Math.round(atime / 1000);
    mtime = Math.round(mtime / 1000);
    var times = {
        actime: [libjs.UInt64.lo(atime), libjs.UInt64.hi(atime)],
        modtime: [libjs.UInt64.lo(mtime), libjs.UInt64.hi(mtime)]
    };
    var res = libjs.utime(path, times);
    console.log(res);
    if (res < 0)
        throwError(res, 'utimes', path);
}
exports.utimesSync = utimesSync;
// export function futimesSync(fd: number, atime: number|string, mtime: number|string) {}
function linkSync(srcpath, dstpath) {
    srcpath = validPathOrThrow(srcpath);
    dstpath = validPathOrThrow(dstpath);
    var res = libjs.link(srcpath, dstpath);
    if (res < 0)
        throwError(res, 'link', srcpath, dstpath);
}
exports.linkSync = linkSync;
function mkdirSync(path, mode) {
    if (mode === void 0) { mode = MODE_DEFAULT; }
    path = validPathOrThrow(path);
    if (typeof mode !== 'number')
        throw TypeError('mode must be an integer');
    var res = libjs.mkdir(path, mode);
    if (res < 0)
        throwError(res, 'mkdir', path);
}
exports.mkdirSync = mkdirSync;
function randomString6() {
    return (+new Date).toString(36).slice(-6);
}
function mkdtempSync(prefix, options) {
    if (options === void 0) { options = {}; }
    if (!prefix || typeof prefix !== 'string')
        throw new TypeError('filename prefix is required');
    var retries = 10;
    var fullname;
    var found_tmp_name = false;
    for (var i = 0; i < retries; i++) {
        fullname = prefix + randomString6();
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
function openSync(path, flags, mode) {
    if (mode === void 0) { mode = MODE_DEFAULT; }
    path = validPathOrThrow(path);
    var flagsval = flagsToFlagsValue(flags);
    if (typeof mode !== 'number')
        throw TypeError('mode must be an integer');
    var res = libjs.open(path, flagsval, mode);
    if (res < 0)
        throwError(res, 'open', path);
    return res;
}
exports.openSync = openSync;
function readSync(fd, buffer, offset, length, position) {
    validateFd(fd);
    if (!(buffer instanceof Buffer))
        throw TypeError('buffer must be an instance of Buffer');
    if (typeof offset !== 'number')
        throw TypeError('offset must be an integer');
    if (typeof length !== 'number')
        throw TypeError('length must be an integer');
    if (position !== null) {
        if (typeof position !== 'number')
            throw TypeError('position must be an integer');
        var seekres = libjs.lseek(fd, position, 0 /* SET */);
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
var readdirOptionsDefaults = {
    encoding: 'utf8'
};
function readdirSync(path, options) {
    if (options === void 0) { options = {}; }
    path = validPathOrThrow(path);
    options = Object.assign(options, readdirOptionsDefaults);
}
exports.readdirSync = readdirSync;
function createFakeAsyncs() {
    function createFakeAsyncFunction(name) {
        exports[name] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            var callback = noop();
            if (args.length && (typeof args[args.length - 1] === 'function')) {
                callback = args[args.length - 1];
                args = args.splice(0, args.length - 1);
            }
            process.nextTick(function () {
                try {
                    var result = exports[name + 'Sync'].apply(null, args);
                    callback(null, result);
                }
                catch (err) {
                    callback(err);
                }
            });
        };
    }
    for (var _i = 0, _a = [
        'appendFile',
        'chmod',
        'fchmod',
        'chown',
        'fchown',
        'close',
        'exists',
        'fsync',
        'fdatasync',
        'stat',
        'fstat',
        'lstat',
        'truncate',
        'ftruncate',
        'utimes',
        'link',
        'mkdir',
        'mkdtemp',
        'open',
        'read',
    ]; _i < _a.length; _i++) {
        var func = _a[_i];
        createFakeAsyncFunction(func);
    }
}
createFakeAsyncs();

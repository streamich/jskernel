"use strict";
var libjs = require('../libjs/libjs');
function noop() { }
function throwError(errno, func, path) {
    if (func === void 0) { func = ''; }
    if (path === void 0) { path = ''; }
    // console.log(-errno, libjs.ERROR.EBADF);
    switch (-errno) {
        case 2 /* ENOENT */: throw Error("ENOENT: no such file or directory, " + func + " '" + path + "'");
        case 9 /* EBADF */: throw Error("EBADF: bad file descriptor, " + func);
        case 22 /* EINVAL */: throw Error("EINVAL: invalid argument, " + func);
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
    flags[flags["r"] = 'r'] = "r";
    flags[flags["rw"] = 'r+'] = "rw";
    flags[flags["rs"] = 'rs'] = "rs";
    flags[flags["rsw"] = 'rs+'] = "rsw";
    flags[flags["w"] = 'w'] = "w";
    flags[flags["wx"] = 'wx'] = "wx";
    flags[flags["ww"] = 'w+'] = "ww";
    flags[flags["wxw"] = 'wx+'] = "wxw";
    flags[flags["a"] = 'a'] = "a";
    flags[flags["ax"] = 'ax'] = "ax";
    flags[flags["aw"] = 'a+'] = "aw";
    flags[flags["axw"] = 'ax+'] = "axw";
})(exports.flags || (exports.flags = {}));
var flags = exports.flags;
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
    mode: 438,
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
    if (typeof fd !== 'number')
        throw TypeError('fd must be a file descriptor');
    if (typeof mode !== 'number')
        throw TypeError('mode must be an integer');
    var result = libjs.fchmod(fd, mode);
    if (result < 0)
        throwError(result, 'chmod');
}
exports.fchmodSync = fchmodSync;
function chownSync(path, uid, gid) {
    if (path instanceof Buffer)
        path = path.toString();
    if (typeof path !== 'string')
        throw TypeError('path must be a string');
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
    if (typeof fd !== 'number')
        throw TypeError('fd must be a file descriptor');
    if (typeof uid !== 'number')
        throw TypeError('uid must be an unsigned int');
    if (typeof gid !== 'number')
        throw TypeError('gid must be an unsigned int');
    var result = libjs.fchown(fd, uid, gid);
    if (result < 0)
        throwError(result, 'fchown');
}
exports.fchownSync = fchownSync;
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
    mode: 438,
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
        return this.mode & 32768 /* IFREG */;
    };
    Stats.prototype.isDirectory = function () {
        return this.mode & 16384 /* IFDIR */;
    };
    Stats.prototype.isBlockDevice = function () {
        return this.mode & 24576 /* IFBLK */;
    };
    Stats.prototype.isCharacterDevice = function () {
        return this.mode & 8192 /* IFCHR */;
    };
    Stats.prototype.isSymbolicLink = function () {
        return this.mode & 40960 /* IFLNK */;
    };
    Stats.prototype.isFIFO = function () {
        return this.mode & 4096 /* IFIFO */;
    };
    Stats.prototype.isSocket = function () {
        return this.mode & 49152 /* IFSOCK */;
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
]; _i < _a.length; _i++) {
    var func = _a[_i];
    createFakeAsyncFunction(func);
}

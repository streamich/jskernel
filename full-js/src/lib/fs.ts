import * as libjs from '../libjs/index';
import {Inotify, IInotifyEvent} from '../libaio/inotify';
var util = require('./util');
var pathModule = require('./path');
import {EventEmitter} from './events';
import {Buffer} from './buffer';
import {StaticBuffer} from './static-buffer';
import {Writable, Readable, Stream} from './stream';


if(__DEBUG__) {
    exports.isFULLjs = true;
}


function noop(...args: any[]): any;
function noop() {}

const isSB = StaticBuffer.isStaticBuffer;

export type Tfile = number|string|Buffer|StaticBuffer;
export type Tpath = string|Buffer|StaticBuffer;
export type Tdata = string|Buffer|StaticBuffer;


const ERRSTR = {
    PATH_STR:       'path must be a string',
    FD:             'file descriptor must be a unsigned 32-bit integer',
    MODE_INT:       'mode must be an integer',
    CB:             'callback must be a function',
    UID:            'uid must be an unsigned int',
    GID:            'gid must be an unsigned int',
    LEN:            'len must be an integer',
    ATIME:          'atime must be an integer',
    MTIME:          'mtime must be an integer',
    PREFIX:         'filename prefix is required',
    BUFFER:         'buffer must be an instance of Buffer or StaticBuffer',
    OFFSET:         'offset must be an integer',
    LENGTH:         'length must be an integer',
    POSITION:       'position must be an integer',
};
const ERRSTR_OPTS = tipeof => `Expected options to be either an object or a string, but got ${tipeof} instead`;


function formatError(errno, func = '', path = '', path2 = '') {
    switch(-errno) {
        case libjs.ERROR.ENOENT:    return `ENOENT: no such file or directory, ${func} '${path}'`;
        case libjs.ERROR.EBADF:     return `EBADF: bad file descriptor, ${func}`;
        case libjs.ERROR.EINVAL:    return `EINVAL: invalid argument, ${func}`;
        case libjs.ERROR.EPERM:     return `EPERM: operation not permitted, ${func} '${path}' -> '${path2}'`;
        case libjs.ERROR.EPROTO:    return `EPROTO: protocol error, ${func} '${path}' -> '${path2}'`;
        case libjs.ERROR.EEXIST:    return `EEXIST: file already exists, ${func} '${path}' -> '${path2}'`;
        default:                    return `Error occurred in ${func}: errno = ${errno}`;
    }
}

function throwError(errno, func = '', path = '', path2 = '') {
    throw Error(formatError(errno, func, path, path2));
}

function pathOrError(path: Tpath, encoding?): string|TypeError {
    if(path instanceof Buffer) path = (path as Buffer).toString(encoding);
    if(typeof path !== 'string') return TypeError(ERRSTR.PATH_STR);
    return path as string;
}

function validPathOrThrow(path: Tpath, encoding?): string {
    var p = pathOrError(path, encoding);
    if(p instanceof TypeError) throw p;
    else return p;
}

function assertEncoding(encoding) {
    if(encoding && !Buffer.isEncoding(encoding))
        throw Error('Unknown encoding: ' + encoding);
}

function validateFd(fd: number) {
    if(typeof fd !== 'number') throw TypeError(ERRSTR.FD);
}

function getOptions <T> (defaults: T, options?: T|string): T {
    if(!options) return defaults;
    else {
        var tipeof = typeof options;
        switch(tipeof) {
            case 'string': return util.extend({}, defaults, {encoding: options as string});
            case 'object': return util.extend({}, defaults, options);
            default: throw TypeError(ERRSTR_OPTS(tipeof));
        }
    }
}

const optionGenerator = defaults => options => getOptions(defaults, options);

function validateCallback(callback) {
    if(typeof callback !== 'function')
        throw TypeError(ERRSTR.CB);
    return callback;
}

const optionAndCallbackGenerator = getOpts =>
    (options, callback?) => typeof options === 'function'
        ? [getOpts(), options]
        : [getOpts(options), validateCallback(callback)];


// List of file `flags` as defined by node.
export enum flags {
    // Open file for reading. An exception occurs if the file does not exist.
    r       = libjs.FLAG.O_RDONLY | 0,
    // Open file for reading and writing. An exception occurs if the file does not exist.
    'r+'    = libjs.FLAG.O_RDWR | 0,
    // Open file for reading in synchronous mode. Instructs the operating system to bypass the local file system cache.
    rs      = libjs.FLAG.O_RDONLY | libjs.FLAG.O_DIRECT | libjs.FLAG.O_SYNC,
    // Open file for reading and writing, telling the OS to open it synchronously. See notes for 'rs' about using this with caution.
    'rs+'   = libjs.FLAG.O_RDWR | libjs.FLAG.O_DIRECT | libjs.FLAG.O_SYNC,
    // Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
    w       = libjs.FLAG.O_WRONLY | libjs.FLAG.O_CREAT | libjs.FLAG.O_TRUNC,
    // Like 'w' but fails if path exists.
    wx      = libjs.FLAG.O_WRONLY | libjs.FLAG.O_CREAT | libjs.FLAG.O_TRUNC | libjs.FLAG.O_EXCL,
    // Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).
    'w+'    = libjs.FLAG.O_RDWR | libjs.FLAG.O_CREAT | libjs.FLAG.O_TRUNC,
    // Like 'w+' but fails if path exists.
    'wx+'   = libjs.FLAG.O_RDWR | libjs.FLAG.O_CREAT | libjs.FLAG.O_TRUNC | libjs.FLAG.O_EXCL,
    // Open file for appending. The file is created if it does not exist.
    a       = libjs.FLAG.O_WRONLY | libjs.FLAG.O_APPEND | libjs.FLAG.O_CREAT,
    // Like 'a' but fails if path exists.
    ax      = libjs.FLAG.O_WRONLY | libjs.FLAG.O_APPEND | libjs.FLAG.O_CREAT | libjs.FLAG.O_EXCL,
    // Open file for reading and appending. The file is created if it does not exist.
    'a+'    = libjs.FLAG.O_RDWR | libjs.FLAG.O_APPEND | libjs.FLAG.O_CREAT,
    // Like 'a+' but fails if path exists.
    'ax+'   = libjs.FLAG.O_RDWR | libjs.FLAG.O_APPEND | libjs.FLAG.O_CREAT | libjs.FLAG.O_EXCL,
}

// Default mode for opening files.
const enum MODE {
    FILE = 0o666,
    DIR  = 0o777,
}

// Chunk size for reading files.
const CHUNK = 4096;


export const F_OK = libjs.AMODE.F_OK;
export const R_OK = libjs.AMODE.R_OK;
export const W_OK = libjs.AMODE.W_OK;
export const X_OK = libjs.AMODE.X_OK;


export interface IFileOptions {
    encoding?: string;
    mode?: number;
    flag?: string;
}

var appendFileDefaults: IFileOptions = {
    encoding: 'utf8',
    mode: MODE.FILE,
    flag: 'a',
};

var writeFileDefaults: IFileOptions = {
    encoding: 'utf8',
    mode: MODE.FILE,
    flag: 'w',
};


function flagsToFlagsValue(f: string|number): number {
    if(typeof f === 'number') return f;
    if(typeof f !== 'string') throw TypeError(`flags must be string or number`);
    var flagsval = flags[f] as any as number;
    if(typeof flagsval !== 'number') throw TypeError(`Invalid flags string value '${f}'`);
    return flagsval;
}


export interface IReadStreamOptions {
    flags: string;
    encoding: string;
    fd: number;
    mode: number;
    autoClose: boolean;
    start: number;
    end: number;
}


export interface IOptions {
    encoding?: string;
}

const optionsDefaults: IOptions = {
    encoding: 'utf8',
};


export interface IReadFileOptions extends IOptions {
    flag?: string;
}

var readFileOptionsDefaults: IReadFileOptions = {
    flag: 'r',
};


export interface IWatchOptions extends IOptions {
    /* Both of these options are actually redundant, as `inotify(7)` on Linux
     * does not support recursive watching and we cannot implement `persistent=false`
     * from JavaScript as we don't know how many callbacks are the in the event loop. */
    persistent?: boolean;
    recursive?: boolean;
}

export interface IWatchFileOptions {

    // TODO: `persistent` option is not supported yet, always `true`, any
    // TODO: idea how to make it work in Node.js in pure JavaScript?
    persistent?: boolean;
    interval?: number;
}

export class Stats {
    dev: number;
    ino: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    size: number;
    blksize: number;
    blocks: number;
    atime: Date;
    mtime: Date;
    ctime: Date;
    birthtime: Date;

    isFile(): boolean {
        return (this.mode & libjs.S.IFREG) == libjs.S.IFREG;
    }
    isDirectory(): boolean {
        return (this.mode & libjs.S.IFDIR) == libjs.S.IFDIR;
    }
    isBlockDevice(): boolean {
        return (this.mode & libjs.S.IFBLK) == libjs.S.IFBLK;
    }
    isCharacterDevice(): boolean {
        return (this.mode & libjs.S.IFCHR) == libjs.S.IFCHR;
    }
    isSymbolicLink(): boolean {
        return (this.mode & libjs.S.IFLNK) == libjs.S.IFLNK;
    }
    isFIFO(): boolean {
        return (this.mode & libjs.S.IFIFO) == libjs.S.IFIFO;
    }
    isSocket(): boolean {
        return (this.mode & libjs.S.IFSOCK) == libjs.S.IFSOCK;
    }
}


// class WriteStream extends Writable {
//     bytesWritten: number = 0;
//     path: string|Buffer|StaticBuffer = null;
    // Event: 'open'
    // Event: 'close'
// }


export function accessSync(path: Tpath, mode: number = F_OK): void {
    var vpath = validPathOrThrow(path);
    var res = libjs.access(vpath, mode);
    if(res < 0) throwError(res, 'access', vpath);
}
export function access(path: string|Buffer, callback: TcallbackData <void>);
export function access(path: string|Buffer, mode: number, callback: TcallbackData <void>);
export function access(path: string|Buffer, a: number|TcallbackData <void>, b?: TcallbackData <void>) {
    var mode: number, callback: TcallbackData <void>;

    if(typeof a === 'function') {
        callback = a as TcallbackData <void>;
        mode = F_OK;
    } else {
        mode = a as number;
        callback = b;
        validateCallback(callback);
    }

    var vpath = pathOrError(path);
    if(vpath instanceof TypeError)
        return callback(vpath);

    libjs.accessAsync(vpath as string, mode, function(res) {
        if(res < 0) callback(Error(formatError(res, 'access', vpath as string)));
        else callback(null);
    });
}


export function appendFileSync(file: Tfile, data: Tdata, options?: IFileOptions) {
    if(!options) options = appendFileDefaults;
    else {
        var tipof = typeof options;
        switch(tipof) {
            case 'object':
                options = util.extend({}, appendFileDefaults, options);
                break;
            case 'string':
                options = util.extend({encoding: options as string}, appendFileDefaults);
                break;
            default:
                throw TypeError(ERRSTR_OPTS(tipof));
        }
    }

    var b: Buffer;
    if(Buffer.isBuffer(data)) b = data as Buffer;
    else b = new Buffer(String(data), options.encoding);
    var sb: StaticBuffer = StaticBuffer.isStaticBuffer(b) ? b as StaticBuffer : StaticBuffer.from(b);

    var fd: number;
    var is_fd = typeof file === 'number';
    if(is_fd) {
        // TODO: If user provides file descriptor that is read-only, what do we do?
        fd = file as number;
    } else {
        var filename: string;
        if(Buffer.isBuffer(file)) filename = file.toString();
        else if(typeof file === 'string') filename = file as string;
        else throw TypeError(ERRSTR.PATH_STR);

        var flags = flagsToFlagsValue(options.flag);
        if(typeof options.mode !== 'number')
            throw TypeError(ERRSTR.MODE_INT);

        fd = libjs.open(filename, flags, options.mode);
        if(fd < 0) throwError(fd, 'appendFile', filename);
    }

    var res = libjs.write(fd, sb);
    if(res < 0) throwError(res, 'appendFile', String(file));

    // Close fd only if WE opened it.
    if(!is_fd) libjs.close(fd);
}
export function appendFile(file: Tfile, data: Tdata, callback: TcallbackData <void>);
export function appendFile(file: Tfile, data: Tdata, options: IFileOptions, callback: TcallbackData <void>);
export function appendFile(file: Tfile, data: Tdata, options: IFileOptions|TcallbackData <void>, callback?: TcallbackData <void>) {
    var opts: IFileOptions;
    if(typeof options === 'function') {
        callback = options as any as TcallbackData <void>;
        opts = appendFileDefaults;
    } else {
        var tipof = typeof options;
        switch(tipof) {
            case 'object':
                opts = util.extend({}, appendFileDefaults, options);
                break;
            case 'string':
                opts = util.extend({encoding: options as string}, appendFileDefaults);
                break;
            default:
                throw TypeError(ERRSTR_OPTS(tipof));
        }

        validateCallback(callback);
    }

    var b: Buffer;
    if(Buffer.isBuffer(data)) b = data as Buffer;
    else b = new Buffer(String(data), opts.encoding);
    var sb: StaticBuffer = StaticBuffer.isStaticBuffer(b) ? b as StaticBuffer : StaticBuffer.from(b);

    function on_open(fd, is_fd) {
        var res = libjs.write(fd, sb);
        if(res < 0) throwError(res, 'appendFile', String(file));

        // Close fd only if WE opened it.
        if(!is_fd) libjs.closeAsync(fd, noop);
    }

    var fd: number;
    var is_fd = typeof file === 'number';
    if(is_fd) {
        // TODO: If user provides file descriptor that is read-only, what do we do?
        fd = file as number;
        on_open(fd, is_fd);
    } else {
        var filename: string;
        if(Buffer.isBuffer(file)) filename = file.toString();
        else if(typeof file === 'string') filename = file as string;
        else throw TypeError(ERRSTR.PATH_STR);

        var flags = flagsToFlagsValue(opts.flag);
        if(typeof opts.mode !== 'number')
            throw TypeError(ERRSTR.MODE_INT);

        libjs.openAsync(filename, flags, opts.mode, (fd) => {
            if(fd < 0) return callback(Error(formatError(fd, 'appendFile', filename)));
            on_open(fd, is_fd);
        });
    }
}


export function chmodSync(path: Tpath, mode: number) {
    var vpath = validPathOrThrow(path);
    if(typeof mode !== 'number') throw TypeError(ERRSTR.MODE_INT);
    var result = libjs.chmod(vpath, mode);
    if(result < 0) throwError(result, 'chmod', vpath);
}
export function chmod(path: Tpath, mode: number, callback: TcallbackData <void>) {
    var vpath = validPathOrThrow(path);
    if(typeof mode !== 'number') throw TypeError(ERRSTR.MODE_INT);
    libjs.chmodAsync(vpath, mode, (result) => {
        if(result < 0) callback(Error(formatError(result, 'chmod', vpath)));
        else callback(null);
    });
}


export function fchmodSync(fd: number, mode: number) {
    validateFd(fd);
    if(typeof mode !== 'number') throw TypeError(ERRSTR.MODE_INT);
    var result = libjs.fchmod(fd, mode);
    if(result < 0) throwError(result, 'chmod');
}
export function fchmod(fd: number, mode: number, callback: TcallbackData <void>) {
    validateFd(fd);
    if(typeof mode !== 'number') throw TypeError(ERRSTR.MODE_INT);
    libjs.fchmodAsync(fd, mode, (result) => {
        if(result < 0) callback(Error(formatError(result, 'chmod')));
        else callback(null);
    });
}


// Mac OS only:
//     function lchmodSync(path: string|Buffer, mode: number) {}


export function chownSync(path: Tpath, uid: number, gid: number) {
    var vpath = validPathOrThrow(path);
    if(typeof uid !== 'number') throw TypeError(ERRSTR.UID);
    if(typeof gid !== 'number') throw TypeError(ERRSTR.GID);
    var result = libjs.chown(vpath, uid, gid);
    if(result < 0) throwError(result, 'chown', vpath);
}
export function chown(path: Tpath, uid: number, gid: number, callback: TcallbackData <void>) {
    var vpath = validPathOrThrow(path);
    if(typeof uid !== 'number') throw TypeError(ERRSTR.UID);
    if(typeof gid !== 'number') throw TypeError(ERRSTR.GID);
    libjs.chownAsync(vpath, uid, gid, result => {
        if(result < 0) callback(Error(formatError(result, 'chown', vpath)));
        else callback(null);
    });
}

export function fchownSync(fd: number, uid: number, gid: number) {
    validateFd(fd);
    if(typeof uid !== 'number') throw TypeError(ERRSTR.UID);
    if(typeof gid !== 'number') throw TypeError(ERRSTR.GID);
    var result = libjs.fchown(fd, uid, gid);
    if(result < 0) throwError(result, 'fchown');
}
export function fchown(fd: number, uid: number, gid: number, callback: TcallbackData <void>) {
    validateFd(fd);
    if(typeof uid !== 'number') throw TypeError(ERRSTR.UID);
    if(typeof gid !== 'number') throw TypeError(ERRSTR.GID);
    libjs.fchownAsync(fd, uid, gid, result => {
        if(result < 0) callback(Error(formatError(result, 'fchown')));
        else callback(null);
    });
}

export function lchownSync(path: Tpath, uid: number, gid: number) {
    var vpath = validPathOrThrow(path);
    if(typeof uid !== 'number') throw TypeError(ERRSTR.UID);
    if(typeof gid !== 'number') throw TypeError(ERRSTR.GID);
    var result = libjs.lchown(vpath, uid, gid);
    if(result < 0) throwError(result, 'lchown', vpath);
}
export function lchown(path: Tpath, uid: number, gid: number, callback: TcallbackData <void>) {
    var vpath = validPathOrThrow(path);
    if(typeof uid !== 'number') throw TypeError(ERRSTR.UID);
    if(typeof gid !== 'number') throw TypeError(ERRSTR.GID);
    libjs.lchownAsync(vpath, uid, gid, result => {
        if(result < 0) callback(Error(formatError(result, 'lchown', vpath)));
        else callback(null);
    });
}


export function closeSync(fd: number) {
    if(typeof fd !== 'number') throw TypeError(ERRSTR.FD);
    var result = libjs.close(fd);
    if(result < 0) throwError(result, 'close');
}
export function close(fd: number, callback: TcallbackData <void>) {
    if(typeof fd !== 'number') throw TypeError(ERRSTR.FD);
    libjs.closeAsync(fd, result => {
        if(result < 0) callback(Error(formatError(result, 'close')));
        else callback(null);
    });
}


export function existsSync(path: Tpath): boolean {
    // console.log('Deprecated fs.existsSync(): Use fs.statSync() or fs.accessSync() instead.');
    try {
        accessSync(path);
        return true;
    } catch(e) {
        return false;
    }
}
export function exists(path: Tpath, callback: (exists: boolean) => void) {
    access(path, err => { callback(!err); });
}


export function fsyncSync(fd: number) {
    if(typeof fd !== 'number') throw TypeError(ERRSTR.FD);
    var result = libjs.fsync(fd);
    if(result < 0) throwError(result, 'fsync');
}
export function fsync(fd: number, callback: TcallbackData <void>) {
    if(typeof fd !== 'number') throw TypeError(ERRSTR.FD);
    libjs.fsyncAsync(fd, result => {
        if(result < 0) callback(Error(formatError(result, 'fsync')));
        else callback(null);
    });
}


export function fdatasyncSync(fd: number) {
    if(typeof fd !== 'number') throw TypeError(ERRSTR.FD);
    var result = libjs.fdatasync(fd);
    if(result < 0) throwError(result, 'fdatasync');
}
export function fdatasync(fd: number, callback: TcallbackData <void>) {
    if(typeof fd !== 'number') throw TypeError(ERRSTR.FD);
    libjs.fdatasyncAsync(fd, result => {
        if(result < 0) callback(Error(formatError(result, 'fdatasync')));
        else callback(null);
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


export function statSync(path: Tpath): Stats {
    var vpath = validPathOrThrow(path);
    try {
        var res = libjs.stat(vpath);
        return createStatsObject(res);
    } catch(errno) {
        throwError(errno, 'stat', vpath);
    }
}
export function stat(path: string|Buffer, callback: TcallbackData <Stats>) {
    var vpath = validPathOrThrow(path);
    libjs.statAsync(vpath, (err, res) => {
        if(err) callback(Error(formatError(err, 'stat', vpath)));
        else callback(null, createStatsObject(res));
    });
}

export function fstatSync(fd: number): Stats {
    validateFd(fd);
    try {
        var res = libjs.fstat(fd);
        return createStatsObject(res);
    } catch(errno) {
        throwError(errno, 'fstat');
    }
}
export function fstat(fd: number, callback: TcallbackData <Stats>) {
    validateFd(fd);
    libjs.fstatAsync(fd, (err, res) => {
        if(err) callback(Error(formatError(err, 'fstat')));
        else callback(null, createStatsObject(res));
    });
}

export function lstatSync(path: Tpath): Stats {
    var vpath = validPathOrThrow(path);
    try {
        var res = libjs.lstat(vpath);
        return createStatsObject(res);
    } catch(errno) {
        throwError(errno, 'lstat', vpath);
    }
}
export function lstat(path: Tpath, callback: TcallbackData <Stats>) {
    var vpath = validPathOrThrow(path);
    libjs.lstatAsync(vpath, (err, res) => {
        if(err) callback(Error(formatError(err, 'lstat', vpath)));
        else callback(null, createStatsObject(res));
    });
}


export function truncateSync(path: Tpath, len: number) {
    var vpath = validPathOrThrow(path);
    if(typeof len !== 'number') throw TypeError(ERRSTR.LEN);
    var res = libjs.truncate(vpath, len);
    if(res < 0) throwError(res, 'truncate', vpath);
}
export function truncate(path: Tpath, len: number, callback: TcallbackData <void>) {
    var vpath = validPathOrThrow(path);
    if(typeof len !== 'number') throw TypeError(ERRSTR.LEN);
    libjs.truncateAsync(vpath, len, res => {
        if(res < 0) callback(Error(formatError(res, 'truncate', vpath)));
        else callback(null);
    });
}

export function ftruncateSync(fd: number, len: number) {
    validateFd(fd);
    if(typeof len !== 'number') throw TypeError(ERRSTR.LEN);
    var res = libjs.ftruncate(fd, len);
    if(res < 0) throwError(res, 'ftruncate');
}
export function ftruncate(fd: number, len: number, callback: TcallbackData <void>) {
    validateFd(fd);
    if(typeof len !== 'number') throw TypeError(ERRSTR.LEN);
    libjs.ftruncateAsync(fd, len, res => {
        if(res < 0) callback(Error(formatError(res, 'ftruncate')));
        else callback(null);
    });
}


//     TODO: Make this work with `utimes` instead of `utime`, also figure out a way
//     TODO: how to set time using file descriptor, possibly use `utimensat` system call.
export function utimesSync(path: Tpath, atime: number, mtime: number) {
    var vpath = validPathOrThrow(path);
    // if(typeof atime === 'string') atime = parseInt(atime as string);
    // if(typeof mtime === 'string') mtime = parseInt(mtime as string);
    if(typeof atime !== 'number') throw TypeError(ERRSTR.ATIME);
    if(typeof mtime !== 'number') throw TypeError(ERRSTR.MTIME);

    var vatime = atime as number;
    var vmtime = mtime as number;

    // if(!Number.isFinite(atime)) atime = Date.now();
    // if(!Number.isFinite(mtime)) mtime = Date.now();
    if(!isFinite(vatime)) vatime = Date.now();
    if(!isFinite(vmtime)) vmtime = Date.now();

    // `libjs.utime` works with 1 sec precision.
    vatime = Math.round(vatime as number / 1000);
    vmtime = Math.round(vmtime as number / 1000);

    var times: libjs.utimbuf = {
        actime:     [libjs.UInt64.lo(vatime), libjs.UInt64.hi(vatime)],
        modtime:    [libjs.UInt64.lo(vmtime), libjs.UInt64.hi(vmtime)],
    };
    var res = libjs.utime(vpath, times);
    if(res < 0) throwError(res, 'utimes', vpath);
}
export function utimes(path: Tpath, atime: number, mtime: number, callback: TcallbackData <void>) {
    var vpath = validPathOrThrow(path);
    // if(typeof atime === 'string') atime = parseInt(atime as string);
    // if(typeof mtime === 'string') mtime = parseInt(mtime as string);
    if(typeof atime !== 'number') throw TypeError(ERRSTR.ATIME);
    if(typeof mtime !== 'number') throw TypeError(ERRSTR.MTIME);

    var vatime = atime as number;
    var vmtime = mtime as number;

    // if(!Number.isFinite(atime)) atime = Date.now();
    // if(!Number.isFinite(mtime)) mtime = Date.now();
    if(!isFinite(vatime)) vatime = Date.now();
    if(!isFinite(vmtime)) vmtime = Date.now();

    // `libjs.utime` works with 1 sec precision.
    vatime = Math.round(vatime as number / 1000);
    vmtime = Math.round(vmtime as number / 1000);

    var times: libjs.utimbuf = {
        actime:     [libjs.UInt64.lo(vatime), libjs.UInt64.hi(vatime)],
        modtime:    [libjs.UInt64.lo(vmtime), libjs.UInt64.hi(vmtime)],
    };
    libjs.utimeAsync(vpath, times, res => {
        if(res < 0) callback(Error(formatError(res, 'utimes', vpath)));
        else callback(null);
    });
}

// function futimesSync(fd: number, atime: number|string, mtime: number|string) {}


export function linkSync(srcpath: Tpath, dstpath: Tpath) {
    var vsrcpath = validPathOrThrow(srcpath);
    var vdstpath = validPathOrThrow(dstpath);
    var res = libjs.link(vsrcpath, vdstpath);
    if(res < 0) throwError(res, 'link', vsrcpath, vdstpath);
}
export function link(srcpath: Tpath, dstpath: Tpath, callback: TcallbackData <void>) {
    var vsrcpath = validPathOrThrow(srcpath);
    var vdstpath = validPathOrThrow(dstpath);
    libjs.linkAsync(vsrcpath, vdstpath, res => {
        if(res < 0) callback(Error(formatError(res, 'link', vsrcpath, vdstpath)));
        else callback(null);
    });
}


export function mkdirSync(path: Tpath, mode: number = MODE.DIR) {
    var vpath = validPathOrThrow(path);
    if(typeof mode !== 'number') throw TypeError(ERRSTR.MODE_INT);
    var res = libjs.mkdir(vpath, mode);
    if(res < 0) throwError(res, 'mkdir', vpath);
}
export function mkdir(path: Tpath, mode: number|TcallbackData <void> = MODE.DIR, callback?: TcallbackData <void>) {
    var vpath = validPathOrThrow(path);

    if(typeof mode === 'function') {
        callback = mode as any as TcallbackData <void>;
        mode = MODE.DIR;
    } else {
        if(typeof mode !== 'number') throw TypeError(ERRSTR.MODE_INT);
        if(typeof callback !== 'function') throw TypeError(ERRSTR.CB);
    }

    libjs.mkdirAsync(vpath, mode as number, res => {
        if(res < 0) callback(Error(formatError(res, 'mkdir', vpath)));
        else callback(null);
    });
}


function rndStr6() {
    return (+new Date).toString(36).slice(-6);
}

export function mkdtempSync(prefix: string): string {
    if (!prefix || typeof prefix !== 'string')
        throw new TypeError(ERRSTR.PREFIX);

    var retries = 10;
    var fullname: string;
    var found_tmp_name = false;
    for(var i = 0; i < retries; i++) {
        fullname = prefix + rndStr6();
        try {
            accessSync(fullname);
        } catch(e) {
            found_tmp_name = true;
            break;
        }
    }

    if(found_tmp_name) {
        mkdirSync(fullname);
        return fullname;
    } else {
        throw Error(`Could not find a new name, mkdtemp`);
    }
}
export function mkdtemp(prefix: string, callback: TcallbackData <string>) {
    if (!prefix || typeof prefix !== 'string')
        throw new TypeError(ERRSTR.PREFIX);

    var retries = 10;
    var fullname: string;

    function mk_dir() {
        mkdir(fullname, err => {
            if(err) callback(err);
            else callback(null, fullname);
        });
    }

    function name_loop() {
        if(retries < 1) {
            callback(Error('Could not find a new name, mkdtemp'));
            return;
        }

        retries--;
        fullname = prefix + rndStr6();

        access(fullname, err => {
            if(err) mk_dir();
            else name_loop();
        });
    }
    name_loop();
}


export function openSync(path: string|Buffer, flags: string|number, mode: number = MODE.FILE): number {
    var vpath = validPathOrThrow(path);
    var flagsval = flagsToFlagsValue(flags);
    if(typeof mode !== 'number') throw TypeError(ERRSTR.MODE_INT);
    var res = libjs.open(vpath, flagsval, mode);
    if(res < 0) throwError(res, 'open', vpath);
    return res;
}
export function open(path: string|Buffer, flags: string|number, mode: number, callback?: TcallbackData <number>) {
    if(typeof mode === 'function') {
        callback = mode as any as TcallbackData <number>;
        mode = MODE.FILE;
    }

    var vpath = validPathOrThrow(path);
    var flagsval = flagsToFlagsValue(flags);

    if(typeof mode !== 'number')
        throw TypeError(ERRSTR.MODE_INT);

    libjs.openAsync(vpath, flagsval, mode, function(res) {
        if(res < 0) callback(Error(formatError(res, 'open', vpath)));
        return callback(null, res);
    });
}


// TODO: Currently it works on `Buffer`, must change to `StaticBuffer` so that garbage
// collector cannot move it.
export function readSync(fd: number, buffer: Buffer|StaticBuffer, offset: number, length: number, position: number): number {
    validateFd(fd);
    if(!(buffer instanceof Buffer)) throw TypeError(ERRSTR.BUFFER);
    if(typeof offset !== 'number') throw TypeError(ERRSTR.OFFSET);
    if(typeof length !== 'number') throw TypeError(ERRSTR.LENGTH);

    if(position)  {
        if(typeof position !== 'number') throw TypeError(ERRSTR.POSITION);
        var seekres = libjs.lseek(fd, position, libjs.SEEK.SET);
        if(seekres < 0) throwError(seekres, 'read');
    }

    var buf = buffer.slice(offset, offset + length);

    // var sb = StaticBuffer.isStaticBuffer(buf)

    var res = libjs.read(fd, buf as StaticBuffer);
    if(res < 0) throwError(res, 'read');
    return res;
}
export function read(fd: number, buffer: Buffer|StaticBuffer, offset: number, length: number, position: number, callback: (err: Error, bytesRead?: number, buffer?: Buffer|StaticBuffer) => void) {
    validateFd(fd);
    if(!(buffer instanceof Buffer)) throw TypeError(ERRSTR.BUFFER);
    if(typeof offset !== 'number') throw TypeError(ERRSTR.OFFSET);
    if(typeof length !== 'number') throw TypeError(ERRSTR.LENGTH);

    // TODO: Make sure `buffer` is `StaticBuffer`.
    // StaticBuffer.isStaticBuffer(buf)

    function do_read() {
        var buf = buffer.slice(offset, offset + length);
        libjs.readAsync(fd, buf as StaticBuffer, res => {
            if(res < 0) callback(Error(formatError(res, 'read')));
            else callback(null, res, buffer);
        });
    }

    if(position)  {
        if(typeof position !== 'number') throw TypeError(ERRSTR.POSITION);
        libjs.lseekAsync(fd, position, libjs.SEEK.SET, seekres => {
            if(seekres < 0) callback(Error(formatError(seekres, 'read')));
            else do_read();
        });
    } else {
        do_read();
    }
}


function optsEncoding(options: IOptions|string): string {
    if(!options) return optionsDefaults.encoding;
    else {
        var typeofopt = typeof options;
        switch(typeofopt) {
            case 'string': return options as string;
            case 'object':
                return (options as IOptions).encoding
                    ? (options as IOptions).encoding : optionsDefaults.encoding;
            default: throw TypeError(ERRSTR_OPTS(typeofopt));
        }
    }
}

export function readdirSync(path: string|Buffer, options?: string|IOptions): string[] {
    var vpath = validPathOrThrow(path);
    var encoding = optsEncoding(options);
    return libjs.readdirList(vpath, encoding);
}
// TODO: `readdir` (unlike `readdirSync`) often returns `-71 = EPROTO` (Invalid protocol) when
// TODO: opening a directory, but directory clearly exists.
export function readdir(path: string|Buffer, options: string|IOptions|TcallbackData <string[]>, callback?: TcallbackData <string[]>) {
    var vpath = validPathOrThrow(path);

    var encoding: string;
    if(typeof options === 'function') {
        callback = options as TcallbackData <string[]>;
        encoding = optionsDefaults.encoding;
    } else {
        encoding = optsEncoding(options);
        validateCallback(callback);
    }

    options = util.extend(options, optionsDefaults);
    libjs.readdirListAsync(vpath, encoding, (errno: number, list: string[]) => {
        if(errno < 0) callback(Error(formatError(errno, 'readdir', vpath)));
        else callback(null, list);
    });
}


const getReadFileOptions = optionGenerator(readFileOptionsDefaults);

export function readFileSync(file: string|Buffer|number, options?: IReadFileOptions|string): string|Buffer {
    var opts = getReadFileOptions(options);

    var fd: number;
    var is_fd = typeof file === 'number';
    if(is_fd) fd = file as number;
    else {
        var vfile = validPathOrThrow(file as string|Buffer);
        var flag = flagsToFlagsValue(opts.flag);
        fd = libjs.open(vfile, flag, MODE.FILE);
        if(fd < 0) throwError(fd, 'readFile', vfile);
    }

    var list: Buffer[] = [];

    do {
        // TODO: Change this to `StaticBuffer`, there is some bug in `.slice()` method.
        // var buf = new StaticBuffer(CHUNK);
        var buf = new Buffer(CHUNK);
        var res = libjs.read(fd, buf as any as StaticBuffer); // TODO: -> StaticBuffer
        if (res < 0) throwError(res, 'readFile');

        if(res < CHUNK) buf = buf.slice(0, res);
        list.push(buf);
    } while(res > 0);

    if(!is_fd) libjs.close(fd);

    var buffer = Buffer.concat(list as any);
    // buffer.print();
    if(opts.encoding) return buffer.toString(opts.encoding);
    else return buffer;
}

const getReadFileOptionsAndCallback = optionAndCallbackGenerator(getReadFileOptions);

export function readFile(file: string|Buffer|number, options: IReadFileOptions|string = {}, cb?: TcallbackData <string|Buffer>) {
    var [opts, callback] = getReadFileOptionsAndCallback(options, cb);
    var is_fd = typeof file === 'number';

    function on_open(fd: number) {
        var list: StaticBuffer[] = [];

        function done() {
            var buffer = Buffer.concat(list as any);
            if(opts.encoding) callback(null, buffer.toString(opts.encoding));
            else callback(null, buffer);
            if(!is_fd) libjs.closeAsync(fd, noop);
        }

        function loop() {
            var buf = new StaticBuffer(CHUNK);
            libjs.readAsync(fd, buf, function(res) {
                if(res < 0) return callback(Error(formatError(res, 'readFile')));

                if(res < CHUNK) buf = buf.slice(0, res);
                list.push(buf);

                if(res > 0) loop();
                else done();
            });
        }
        loop();
    }

    if(is_fd) on_open(file as number);
    else {
        var vfile = validPathOrThrow(file as string|Buffer);
        var flag = flagsToFlagsValue(opts.flag);
        libjs.openAsync(vfile as string, flag, MODE.FILE, function (fd) {
            if (fd < 0) callback(Error(formatError(fd, 'readFile', vfile as string)));
            else on_open(fd);
        });
    }
}


export function readlinkSync(path: Tpath, options: IOptions|string = null): string|Buffer {
    var vpath = validPathOrThrow(path);

    var encBuffer = false;

    var filename: string;
    if(typeof path === 'string') {
        filename = path as string;
    } else if(Buffer.isBuffer(path)) {
        var encoding = optsEncoding(options);
        if(encoding === 'buffer') {
            filename = path.toString();
            encBuffer = true;
        } else {
            filename = path.toString(encoding);
        }
    } else
        throw TypeError(ERRSTR.PATH_STR);

    try {
        var res = libjs.readlink(filename);
    } catch(errno) {
        throwError(errno, 'readlink', vpath);
    }

    return !encBuffer ? res : new Buffer(res);
}


export function renameSync(oldPath: Tpath, newPath: Tpath) {
    var voldPath = validPathOrThrow(oldPath);
    var vnewPath = validPathOrThrow(newPath);
    var res = libjs.rename(voldPath, vnewPath);
    if(res < 0) throwError(res, 'rename', voldPath, vnewPath);
}
export function rename(oldPath: Tpath, newPath: Tpath, callback: TcallbackData <void>) {
    var voldPath = validPathOrThrow(oldPath);
    var vnewPath = validPathOrThrow(newPath);
    libjs.renameAsync(voldPath, vnewPath, res => {
        if(res < 0) callback(Error(formatError(res, 'rename', voldPath, vnewPath)));
        else callback(null);
    });
}


export function rmdirSync(path: Tpath) {
    var vpath = validPathOrThrow(path);
    var res = libjs.rmdir(vpath);
    if(res < 0) throwError(res, 'rmdir', vpath);
}
export function rmdir(path: Tpath, callback: TcallbackData <void>) {
    var vpath = validPathOrThrow(path);
    libjs.rmdirAsync(vpath, res => {
        if(res < 0) callback(Error(formatError(res, 'rmdir', vpath)));
        else callback(null);
    });
}


export function symlinkSync(target: Tpath, path: Tpath/*, type?: string*/) {
    var vtarget = validPathOrThrow(target);
    var vpath = validPathOrThrow(path);
    // > The type argument [..] is only available on Windows (ignored on other platforms)
    /* type = typeof type === 'string' ? type : null; */
    var res = libjs.symlink(vtarget, vpath);
    if(res < 0) throwError(res, 'symlink', vtarget, vpath);
}
export function symlink(target: Tpath, path: Tpath, type, callback?: TcallbackData <void>) {
    var vtarget = validPathOrThrow(target);
    var vpath = validPathOrThrow(path);
    if(typeof type === 'function') {
        callback = type;
    }

    validateCallback(callback);

    // > The type argument [..] is only available on Windows (ignored on other platforms)
    /* type = typeof type === 'string' ? type : null; */
    libjs.symlinkAsync(vtarget, vpath, res => {
        if(res < 0) callback(Error(formatError(res, 'symlink', vtarget, vpath)));
        else callback(null);
    });
}


export function unlinkSync(path: Tpath) {
    var vpath = validPathOrThrow(path);
    var res = libjs.unlink(vpath);
    if(res < 0) throwError(res, 'unlink', vpath);
}
export function unlink(path: Tpath, callback: TcallbackData <void>) {
    var vpath = validPathOrThrow(path);
    libjs.unlinkAsync(vpath, res => {
        if(res < 0) callback(Error(formatError(res, 'unlink', vpath)));
        else callback(null);
    });
}

export function watchFile(filename: string|Buffer, listener: TwatchListener);
export function watchFile(filename: string|Buffer, options: IWatchFileOptions, listener: TwatchListener);
export function watchFile(filename: string|Buffer, a: TwatchListener|IWatchFileOptions = {}, b?: TwatchListener) {
    var vfilename = validPathOrThrow(filename);
    vfilename = pathModule.resolve(vfilename);

    var opts: IWatchFileOptions;
    var listener: TwatchListener;

    if(typeof a !== 'object') {
        opts = watchFileOptionDefaults;
        listener = a as TwatchListener;
    } else {
        opts = util.extend(a, watchFileOptionDefaults);
        listener = b;
    }

    if(typeof listener !== 'function')
        throw new Error('"watchFile()" requires a listener function');

    var watcher = StatWatcher.map[vfilename];
    if(!watcher) {
        watcher = new StatWatcher;
        watcher.start(vfilename, opts.persistent, opts.interval);
        StatWatcher.map[vfilename] = watcher;
    }

    watcher.on('change', listener);
    return watcher;
}


export function writeSync(fd: number, buffer: Buffer,       offset: number,     length: number,     position?: number);
export function writeSync(fd: number, data: string|Buffer,  position?: number,  encoding?: string);
export function writeSync(fd: number, data: string|Buffer,  a: number,          b:number|string,    c?: number) {
    validateFd(fd);

    var buf: Buffer;
    var position: number;

    // Check which function definition we are working with.
    if(typeof b === 'number') {
        // writeSync(fd: number, buffer: Buffer, offset: number, length: number, position?: number);
        if(!(data instanceof Buffer)) throw TypeError('buffer must be instance of Buffer.');

        var offset = a;
        if(typeof offset !== 'number') throw TypeError('offset must be an integer');
        var length = b;
        buf = data.slice(offset, offset + length) as Buffer;

        position = c;
    } else {
        // writeSync(fd: number, data: string|Buffer, position?: number, encoding: string = 'utf8');
        var encoding: string = 'utf8';
        if(b) {
            if(typeof b !== 'string') throw TypeError('encoding must be a string');
            encoding = b;
        }

        if(data instanceof Buffer) buf = data as Buffer;
        else if(typeof data === 'string') {
            buf = new Buffer(data, encoding);
        } else throw TypeError('data must be a Buffer or a string.');

        position = a;
    }

    if(typeof position === 'number') {
        var sres = libjs.lseek(fd, position, libjs.SEEK.SET);
        if(sres < 0) throwError(sres, 'write:lseek');
    }

    var sb: StaticBuffer = StaticBuffer.isStaticBuffer(buf)
        ? (buf as StaticBuffer) : StaticBuffer.from(buf);
    var res = libjs.write(fd, sb);
    if(res < 0) throwError(res, 'write');
}


const getWriteFileOptions = optionGenerator(writeFileDefaults);

export function writeFileSync(file: Tfile, data: Tdata, options?: IFileOptions|string) {
    var opts = getWriteFileOptions(options);

    var fd: number;
    var vpath: string;
    var is_fd = typeof file === 'number';
    if(is_fd) {
        fd = file as number;
    } else {
        vpath = validPathOrThrow(file as Tpath);
        var flags = flagsToFlagsValue(opts.flag);
        fd = libjs.open(vpath, flags, opts.mode);
        if(fd < 0) throwError(fd, 'writeFile', vpath);
    }

    var sb: StaticBuffer = StaticBuffer.isStaticBuffer(data) ? data as StaticBuffer : StaticBuffer.from(data);
    var res = libjs.write(fd, sb);
    if(res < 0) throwError(res, 'writeFile', is_fd ? String(fd) : vpath);
    if(!is_fd) libjs.close(fd);
}

const getWriteFileOptionsAndCallback = optionAndCallbackGenerator(getWriteFileOptions);

export function writeFile(file: Tfile, data: Tdata, callback: TcallbackData <void>);
export function writeFile(file: Tfile, data: Tdata, options: IFileOptions|string|TcallbackData <void>, cb?: TcallbackData <void>) {
    var [opts, callback] = getWriteFileOptionsAndCallback(options, cb);
    var is_fd = typeof file === 'number';

    function on_write(fd: number) {
        var sb: StaticBuffer = isSB(data) ? data as StaticBuffer : StaticBuffer.from(data);
        libjs.writeAsync(fd, sb, res => {
            if(res < 0) callback(Error(formatError(res, 'writeFile', is_fd ? String(fd) : vpath)));
            else callback(null, sb);
            setTimeout(() => {
                sb.print();
            }, 100);
            if(!is_fd) libjs.closeAsync(fd, noop);
        });
    }

    if(is_fd) on_write(file as number);
    else {
        var vpath = validPathOrThrow(file as Tpath);
        var flags = flagsToFlagsValue(opts.flag);
        libjs.openAsync(vpath, flags, opts.mode, fd => {
            if(fd < 0) callback(Error(formatError(fd, 'writeFile', vpath)));
            else on_write(fd);
        });
    }
}


export class FSWatcher extends EventEmitter {

    inotify = new Inotify;

    start(filename: string, persistent: boolean, recursive: boolean, encoding: string) {
        this.inotify.encoding = encoding;
        this.inotify.onerror = noop;
        this.inotify.onevent = (event: IInotifyEvent) => {
            var is_rename = (event.mask & libjs.IN.MOVE) || (event.mask & libjs.IN.CREATE);
            if(is_rename) {
                this.emit('change', 'rename', event.name);
            } else {
                this.emit('change', 'change', event.name);
            }
        };
        this.inotify.start();
        this.inotify.addPath(filename);
    }

    close() {
        this.inotify.stop();
        this.inotify = null;
    }
}

type CwatchListener = (event: string, filename: string) => void;

var watchOptionsDefaults = {
    encoding: 'utf8',
    persistent: true,
    recursive: false,
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


export class StatWatcher extends EventEmitter {

    static map = {};

    filename: string;

    interval;

    last: Stats = null;

    protected loop() {
        stat(this.filename, (err, stats) => {
            if(err) return this.emit('error', err);
            if(this.last instanceof Stats) {
                // > The callback listener will be called each time the file is accessed.
                if(this.last.atime.getTime() != stats.atime.getTime()) {
                    this.emit('change', stats, this.last);
                }
            }
            this.last = stats;
        });
    }

    start(filename: string, persistent: boolean, interval: number) {
        this.filename = filename;
        stat(filename, (err, stats) => {
            if(err) return this.emit('error', err);
            this.last = stats;
            this.interval = setInterval(this.loop.bind(this), interval);
        });
    }

    stop() {
        clearInterval(this.interval);
        this.last = null;
    }
}

const watchFileOptionDefaults: IWatchFileOptions = {
    persistent: true,
    interval: 5007,
};

type TwatchListener = (curr: Stats, prev: Stats) => void;

export function unwatchFile(filename: string|Buffer, listener?: TwatchListener) {
    var vfilename = validPathOrThrow(filename);
    vfilename = pathModule.resolve(vfilename);

    var watcher = StatWatcher.map[vfilename];
    if(!watcher) return;

    if(typeof listener === 'function') watcher.removeListener('change', listener);
    else watcher.removeAllListeners('change');

    if(watcher.listenerCount('change') === 0) {
        watcher.stop();
        delete StatWatcher.map[vfilename];
    }
}



// ReadStream ans WriteStream ------------------------------------------------------------------------------------------


export function createReadStream(path, options) {
    return new (ReadStream as any)(path, options);
}

export function createWriteStream(path, options) {
    return new (WriteStream as any)(path, options);
}


var kMinPoolSpace = 128;
var pool;

function allocNewPool(poolSize) {
    pool = new Buffer(poolSize);
    pool.used = 0;
}


export function ReadStream(path, options) {
    if (!(this instanceof ReadStream))
        return new (ReadStream as any)(path, options);

    // a little bit bigger buffer and water marks by default
    options = util._extend({
        highWaterMark: 64 * 1024
    }, options || {});

    Readable.call(this, options);

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
        } else if (!util.isNumber(this.end)) {
            throw TypeError('end must be a Number');
        }

        if (this.start > this.end) {
            throw new Error('start must be <= end');
        }

        this.pos = this.start;
    }

    if (!util.isNumber(this.fd))
        this.open();

    this.on('end', function() {
        if (this.autoClose) {
            this.destroy();
        }
    });
}
util.inherits(ReadStream, Readable);


ReadStream.prototype.open = function() {
    var self = this;
    open(this.path, this.flags, this.mode, function(er, fd) {
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


ReadStream.prototype._read = function(n) {
    if (!util.isNumber(this.fd))
        return this.once('open', function() {
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
        } else {
            var b = null;
            if (bytesRead > 0)
                b = thisPool.slice(start, start + bytesRead);

            self.push(b);
        }
    }
};


ReadStream.prototype.destroy = function() {
    if (this.destroyed)
        return;
    this.destroyed = true;

    if (util.isNumber(this.fd))
        this.close();
};


ReadStream.prototype.close = function(cb) {
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

    function _close(fd?) {
        close(fd || self.fd, function(er) {
            if (er)
                self.emit('error', er);
            else
                self.emit('close');
        });
        self.fd = null;
    }
};



export function WriteStream(path, options) {
    if (!(this instanceof WriteStream))
        return new (WriteStream as any)(path, options);

    options = options || {};

    Writable.call(this, options);

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
util.inherits(WriteStream, Writable);


WriteStream.prototype.open = function() {
    open(this.path, this.flags, this.mode, function(er, fd) {
        if (er) {
            this.destroy();
            this.emit('error', er);
            return;
        }

        this.fd = fd;
        this.emit('open', fd);
    }.bind(this));
};


WriteStream.prototype._write = function(data, encoding, cb) {
    if (!util.isBuffer(data))
        return this.emit('error', new Error('Invalid data'));

    if (!util.isNumber(this.fd))
        return this.once('open', function() {
            this._write(data, encoding, cb);
        });

    var self = this;
    write(this.fd, data, 0, data.length, this.pos, function(er, bytes) {
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
export function SyncWriteStream(fd, options) {
    Stream.call(this);

    options = options || {};

    validateFd(fd);
    this.fd = fd;
    this.writable = true;
    this.readable = false;
    this.autoClose = options.autoClose === undefined ? true : options.autoClose;
}

util.inherits(SyncWriteStream, Stream);

SyncWriteStream.prototype.write = function(data, arg1, arg2) {
    var encoding, cb;

    // parse arguments
    if (arg1) {
        if (typeof arg1 === 'string') {
            encoding = arg1;
            cb = arg2;
        } else if (typeof arg1 === 'function') {
            cb = arg1;
        } else {
            throw Error('Bad arguments');
        }
    }
    assertEncoding(encoding);

    // Change strings to buffers. SLOW
    if(typeof data === 'string') {
        data = Buffer.from(data, encoding);
    }
    
    writeSync(this.fd, data, 0, data.length);

    if(cb) process.nextTick(cb);
    return true;
};


SyncWriteStream.prototype.end = function(data, arg1, arg2) {
    if (data) {
        this.write(data, arg1, arg2);
    }
    this.destroy();
};


SyncWriteStream.prototype.destroy = function() {
    if (this.autoClose) closeSync(this.fd);
    this.fd = null;
    this.emit('close');
    return true;
};

SyncWriteStream.prototype.destroySoon = SyncWriteStream.prototype.destroy;

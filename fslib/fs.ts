import * as libjs from '../libjs/libjs';
import * as libaio from '../libaio/libaio';
import * as pathModule from 'path';
import {EventEmitter} from 'events';
import {Buffer} from 'buffer';
import {Readable, Writable} from 'stream';


//     interface ObjectConstructor {
//         assign(...args: any[]): any;
//     }
//
//      extend = Object.assign;

function extend(a, b) {
    for(var i in b) a[i] = b[i];
    return a;
}

var fs = exports;

function noop(...args: any[]);
function noop() {}

export type Tcallback = (err?: Error, data?: any) => void;


function throwError(errno, func = '', path = '', path2 = '') {
    // console.log(-errno, libjs.ERROR.EBADF);
    switch(-errno) {
        case libjs.ERROR.ENOENT:    throw Error(`ENOENT: no such file or directory, ${func} '${path}'`);
        case libjs.ERROR.EBADF:     throw Error(`EBADF: bad file descriptor, ${func}`);
        case libjs.ERROR.EINVAL:    throw Error(`EINVAL: invalid argument, ${func}`);
        case libjs.ERROR.EPERM:     throw Error(`EPERM: operation not permitted, ${func} '${path}' -> '${path2}'`);
        case libjs.ERROR.EPROTO:    throw Error(`EPROTO: protocol error, ${func} '${path}' -> '${path2}'`);
        case libjs.ERROR.EEXIST:    throw Error(`EEXIST: file already exists, ${func} '${path}' -> '${path2}'`);
        default:                    throw Error(`Error occurred in ${func}: errno = ${errno}`);
    }
}

function validPathOrThrow(path: string|Buffer): string {
    if(path instanceof Buffer) path = path.toString();
    if(typeof path !== 'string') throw TypeError('path must be a string');
    return path as string;
}

function validateFd(fd: number) {
    if(typeof fd !== 'number') throw TypeError('fd must be a file descriptor');
}


// List of file `flags` as defined by node.
export enum flags {
    // Open file for reading. An exception occurs if the file does not exist.
    r       = libjs.FLAG.O_RDONLY,
    // Open file for reading and writing. An exception occurs if the file does not exist.
    'r+'    = libjs.FLAG.O_RDWR,
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

const MODE_DEFAULT = 0o666;


export var F_OK = libjs.AMODE.F_OK;
export var R_OK = libjs.AMODE.R_OK;
export var W_OK = libjs.AMODE.W_OK;
export var X_OK = libjs.AMODE.X_OK;

export function accessSync(path: string|Buffer, mode: number = F_OK) {
    var vpath = validPathOrThrow(path);
    var res = libjs.access(vpath, mode);
    if(res < 0) throwError(res, 'access', vpath);
}


export interface IFileOptions {
    encoding?: string;
    mode?: number;
    flag?: string;
}

var appendFileDefaults: IFileOptions = {
    encoding: 'utf8',
    mode: MODE_DEFAULT,
    flag: 'a',
};

export function appendFile(file: string|number, data: string|Buffer, options: IFileOptions, callback: Tcallback) {}
export function appendFileSync(file: string|number, data: string|Buffer, options: IFileOptions = {}) {
    options = extend(options, appendFileDefaults);

}


export function chmod(path: string|Buffer, mode: number, callback: Tcallback) {}
export function chmodSync(path: string|Buffer, mode: number) {
    var vpath = validPathOrThrow(path);
    if(typeof mode !== 'number') throw TypeError('mode must be an integer');
    var result = libjs.chmod(vpath, mode);
    if(result < 0) throwError(result, 'chmod', vpath);
}

export function fchmod(fd: number, mode: number, callback: Tcallback) {}
export function fchmodSync(fd: number, mode: number) {
    validateFd(fd);
    if(typeof mode !== 'number') throw TypeError('mode must be an integer');
    var result = libjs.fchmod(fd, mode);
    if(result < 0) throwError(result, 'chmod');
}

// Mac OS only:
//     export function lchmodSync(path: string|Buffer, mode: number) {}


export function chown(path: string|Buffer, uid: number, gid: number, callback: Tcallback) {}
export function chownSync(path: string|Buffer, uid: number, gid: number) {
    var vpath = validPathOrThrow(path);
    if(typeof uid !== 'number') throw TypeError('uid must be an unsigned int');
    if(typeof gid !== 'number') throw TypeError('gid must be an unsigned int');
    var result = libjs.chown(vpath, uid, gid);
    if(result < 0) throwError(result, 'chown', vpath);
}

export function fchown(fd: number, uid: number, gid: number, callback: Tcallback) {}
export function fchownSync(fd: number, uid: number, gid: number) {
    validateFd(fd);
    if(typeof uid !== 'number') throw TypeError('uid must be an unsigned int');
    if(typeof gid !== 'number') throw TypeError('gid must be an unsigned int');
    var result = libjs.fchown(fd, uid, gid);
    if(result < 0) throwError(result, 'fchown');
}

export function lchown(path: string|Buffer, uid: number, gid: number, callback: Tcallback) {}
export function lchownSync(path: string|Buffer, uid: number, gid: number) {
    var vpath = validPathOrThrow(path);
    if(typeof uid !== 'number') throw TypeError('uid must be an unsigned int');
    if(typeof gid !== 'number') throw TypeError('gid must be an unsigned int');
    var result = libjs.lchown(vpath, uid, gid);
    if(result < 0) throwError(result, 'lchown', vpath);
}


export function closeSync(fd: number) {
    if(typeof fd !== 'number') throw TypeError('fd must be a file descriptor');
    var result = libjs.close(fd);
    if(result < 0) throwError(result, 'close');
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

// var readStreamOptionsDefaults: IReadStreamOptions = {
//     flags: 'r',
//     encoding: null,
//     fd: null,
//     mode: MODE_DEFAULT,
//     autoClose: true,
// };

// export function createReadStream(path: string|Buffer, options: IReadStreamOptions|string = {}) {
//     options = extend(options, readStreamOptionsDefaults);
// }


export function createWriteStream(path, options) {}


export function existsSync(path: string|Buffer): boolean {
    console.log('Deprecated fs.existsSync(): Use fs.statSync() or fs.accessSync() instead.');
    try {
        accessSync(path);
        return true;
    } catch(e) {
        return false;
    }
}


export function fsyncSync(fd: number) {
    if(typeof fd !== 'number') throw TypeError('fd must be a file descriptor');
    var result = libjs.fsync(fd);
    if(result < 0) throwError(result, 'fsync');
}

export function fdatasyncSync(fd: number) {
    if(typeof fd !== 'number') throw TypeError('fd must be a file descriptor');
    var result = libjs.fdatasync(fd);
    if(result < 0) throwError(result, 'fdatasync');
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

export function statSync(path: string|Buffer): Stats {
    var vpath = validPathOrThrow(path);
    try {
        var res = libjs.stat(vpath);
        return createStatsObject(res);
    } catch(errno) {
        throwError(errno, 'stat', vpath);
    }
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

export function lstatSync(path: string|Buffer): Stats {
    var vpath = validPathOrThrow(path);
    try {
        var res = libjs.lstat(vpath);
        return createStatsObject(res);
    } catch(errno) {
        throwError(errno, 'lstat', vpath);
    }
}


export function truncateSync(path: string, len: number) {
    var vpath = validPathOrThrow(path);
    if(typeof len !== 'number') throw TypeError('len must be an integer');
    var res = libjs.truncate(vpath, len);
    if(res < 0) throwError(res, 'truncate', vpath);
}

export function ftruncateSync(fd: number, len: number) {
    validateFd(fd);
    if(typeof len !== 'number') throw TypeError('len must be an integer');
    var res = libjs.ftruncate(fd, len);
    if(res < 0) throwError(res, 'ftruncate');
}


//     TODO: Make this work with `utimes` instead of `utime`, also figure out a way
//     TODO: how to set time using file descriptor, possibly use `utimensat` system call.
export function utimesSync(path: string, atime: number|string, mtime: number|string) {
    path = validPathOrThrow(path);
    if(typeof atime === 'string') atime = parseInt(atime as string);
    if(typeof mtime === 'string') mtime = parseInt(mtime as string);
    if(typeof atime !== 'number') throw TypeError('atime must be an integer');
    if(typeof mtime !== 'number') throw TypeError('mtime must be an integer');

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
    var res = libjs.utime(path, times);
    console.log(res);
    if(res < 0) throwError(res, 'utimes', path);
}

// export function futimesSync(fd: number, atime: number|string, mtime: number|string) {}


export function linkSync(srcpath: string|Buffer, dstpath: string|Buffer) {
    var vsrcpath = validPathOrThrow(srcpath);
    var vdstpath = validPathOrThrow(dstpath);
    var res = libjs.link(vsrcpath, vdstpath);
    if(res < 0) throwError(res, 'link', vsrcpath, vdstpath);
}


export function mkdirSync(path: string|Buffer, mode: number = MODE_DEFAULT) {
    var vpath = validPathOrThrow(path);
    if(typeof mode !== 'number') throw TypeError('mode must be an integer');
    var res = libjs.mkdir(vpath, mode);
    if(res < 0) throwError(res, 'mkdir', vpath);
}

function randomString6() {
    return (+new Date).toString(36).slice(-6);
}

export function mkdtempSync(prefix: string, options = {}) {
    if (!prefix || typeof prefix !== 'string')
        throw new TypeError('filename prefix is required');

    var retries = 10;
    var fullname: string;
    var found_tmp_name = false;
    for(var i = 0; i < retries; i++) {
        fullname = prefix + randomString6();
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


function flagsToFlagsValue(f: string|number) {
    if(typeof f === 'number') return flags;
    if(typeof f !== 'string') throw TypeError(`flags must be string or number`);
    var flagsval = flags[f];
    if(typeof flagsval !== 'number') throw TypeError(`Invalid flags string value '${f}'`);
    return flagsval;
}

export function openSync(path: string|Buffer, flags: string|number, mode: number = MODE_DEFAULT): number {
    var vpath = validPathOrThrow(path);
    var flagsval = flagsToFlagsValue(flags);
    if(typeof mode !== 'number') throw TypeError('mode must be an integer');
    var res = libjs.open(vpath, flagsval, mode);
    if(res < 0) throwError(res, 'open', vpath);
    return res;
}


export function readSync(fd: number, buffer: Buffer, offset: number, length: number, position: number) {
    validateFd(fd);
    if(!(buffer instanceof Buffer)) throw TypeError('buffer must be an instance of Buffer');
    if(typeof offset !== 'number') throw TypeError('offset must be an integer');
    if(typeof length !== 'number') throw TypeError('length must be an integer');

    if(position !== null)  {
        if(typeof position !== 'number') throw TypeError('position must be an integer');
        var seekres = libjs.lseek(fd, position, libjs.SEEK.SET);
        if(seekres < 0) throwError(seekres, 'read');
    }

    var buf = buffer.slice(offset, offset + length);
    var res = libjs.read(fd, buf);
    if(res < 0) throwError(res, 'read');
    return res;
}


export interface IOptions {
    encoding?: string;
}

var optionsDefaults: IOptions = {
    encoding: 'utf8',
};


export function readdirSync(path: string|Buffer, options: IOptions = {}) {
    var vpath = validPathOrThrow(path);
    options = extend(options, optionsDefaults);
    return libjs.readdirList(vpath, options.encoding);
}


export interface IReadFileOptions extends IOptions {
    flag?: string;
}

var readFileOptionsDefaults: IReadFileOptions = {
    flag: 'r',
};

export function readFileSync(file: string|Buffer|number, options: IReadFileOptions|string = {}): string|Buffer {
    var opts: IReadFileOptions;
    if(typeof options === 'string') opts = extend({encoding: options}, readFileOptionsDefaults);
    else if(typeof options !== 'object') throw TypeError('Invalid options');
    else opts = extend(options, readFileOptionsDefaults);
    if(opts.encoding && (typeof opts.encoding != 'string')) throw TypeError('Invalid encoding');

    var fd: number;
    if(typeof file === 'number') fd = file as number;
    else {
        var vfile = validPathOrThrow(file as string|Buffer);
        var flag = flags[opts.flag];
        fd = libjs.open(vfile, flag, MODE_DEFAULT);
        if(fd < 0) throwError(fd, 'readFile', vfile);
    }

    var CHUNK = 4096;
    var list: Buffer[] = [];

    do {
        var buf = new Buffer(CHUNK);
        var res = libjs.read(fd, buf);
        if(res < CHUNK) buf = buf.slice(0, res);
        list.push(buf);
        if (res < 0) throwError(res, 'readFile');
    } while(res > 0);

    libjs.close(fd);

    var buffer = Buffer.concat(list);
    if(opts.encoding) return buffer.toString(opts.encoding);
    else return buffer;
}


export function readlinkSync(path: string, options: IOptions|string = null): string|Buffer {
    path = validPathOrThrow(path);
    var buf = new Buffer(64);
    var res = libjs.readlink(path, buf);
    if(res < 0) throwError(res, 'readlink', path);

    var encoding = 'buffer';
    if(options) {
        if(typeof options === 'string') encoding = options;
        else if(typeof options === 'object') {
            if(typeof options.encoding != 'string') throw TypeError('Encoding must be string.');
            else encoding = options.encoding;
        } else throw TypeError('Invalid options.');
    }

    buf = buf.slice(0, res);
    return encoding == 'buffer' ? buf : buf.toString(encoding);
}


export function renameSync(oldPath: string|Buffer, newPath: string|Buffer) {
    var voldPath = validPathOrThrow(oldPath);
    var vnewPath = validPathOrThrow(newPath);
    var res = libjs.rename(voldPath, vnewPath);
    if(res < 0) throwError(res, 'rename', voldPath, vnewPath);
}


export function rmdirSync(path: string|Buffer) {
    var vpath = validPathOrThrow(path);
    var res = libjs.rmdir(vpath);
    if(res < 0) throwError(res, 'rmdir', vpath);
}


export function symlinkSync(target: string|Buffer, path: string|Buffer/*, type?: string*/) {
    var vtarget = validPathOrThrow(target);
    var vpath = validPathOrThrow(path);
    // > The type argument [..] is only available on Windows (ignored on other platforms)
    /* type = typeof type === 'string' ? type : null; */
    var res = libjs.symlink(vtarget, vpath);
    if(res < 0) throwError(res, 'symlink', vtarget, vpath);
}


export function unlinkSync(path: string|Buffer) {
    var vpath = validPathOrThrow(path);
    var res = libjs.unlink(vpath);
    if(res < 0) throwError(res, 'unlink', vpath);
}


export class FSWatcher extends EventEmitter {

    inotify = new libaio.Inotify;

    start(filename: string, persistent: boolean, recursive: boolean, encoding: string) {
        this.inotify.encoding = encoding;
        this.inotify.onerror = noop;
        this.inotify.onevent = (event: libaio.IInotifyEvent) => {
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

export interface IWatchOptions extends IOptions {
    /* Both of these options are actually redundant, as `inotify(7)` on Linux
     * does not support recursive watching and we cannot implement `persistent=false`
     * from JavaScript as we don't know how many callbacks are the in the event loop. */
    persistent?: boolean;
    recursive?: boolean;
}

export type CwatchListener = (event: string, filename: string) => void;

var watchOptionsDefaults = {
    encoding: 'utf8',
    persistent: true,
    recursive: false,
};

// Phew, lucky us:
//
// > The recursive option is only supported on OS X and Windows.

export function watch(filename: string|Buffer, options: string|IWatchOptions, listener?: CwatchListener) {
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
}


class StatWatcher extends EventEmitter {

    static map = {};

    filename: string;

    interval;

    last: Stats = null;

    protected loop() {
        fs.stat(this.filename, (err, stats) => {
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
        fs.stat(filename, (err, stats) => {
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

export interface IWatchFileOptions {

    // TODO: `persistent` option is not supported yet, always `true`, any
    // TODO: idea how to make it work in Node.js in pure JavaScript?
    persistent?: boolean;
    interval?: number;
}

const watchFileOptionDefaults: IWatchFileOptions = {
    persistent: true,
    interval: 5007,
};

export type TwatchListener = (curr: Stats, prev: Stats) => void;

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
        opts = extend(a, watchFileOptionDefaults);
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


export function writeSync(fd: number, buffer: Buffer,       offset: number,     length: number,     position?: number);
export function writeSync(fd: number, data: string|Buffer,  position?: number,  encoding?: string);
export function writeSync(fd: number, data: string|Buffer,  a: number,          b:number|string,    c?: number) {
    validateFd(fd);

    var buf: Buffer;
    var position: number;

    // Check which function definition we are working with.
    if(typeof b === 'number') {
        //     writeSync(fd: number, buffer: Buffer, offset: number, length: number, position?: number);
        if(!(data instanceof Buffer)) throw TypeError('buffer must be instance of Buffer.');

        var offset = a;
        if(typeof offset !== 'number') throw TypeError('offset must be an integer');
        var length = b;
        buf = data.slice(offset, offset + length) as Buffer;

        position = c;
    } else {
        //     writeSync(fd: number, data: string|Buffer, position?: number, encoding: string = 'utf8');
        var encoding: string = 'utf8';
        if(b) {
            if(typeof b !== 'string') throw TypeError('encoding must be a string');
            encoding = b;
        }

        if(data instanceof Buffer) buf = data;
        else if(typeof data === 'string') {
            buf = new Buffer(data, encoding);
        } else throw TypeError('data must be a Buffer or a string.');

        position = a;
    }

    if(typeof position === 'number') {
        var sres = libjs.lseek(fd, position, libjs.SEEK.SET);
        if(sres < 0) throwError(sres, 'write:lseek');
    }

    var res = libjs.write(fd, buf);
    if(res < 0) throwError(res, 'write');
}



// Wrap synchronous/blocking functions into async ones just to confirm to Node's API.
export function useFake(fs) {
    require('./afs-fake')(fs);
}

export function useTagg(fs) {
    require('./afs-tagg')(fs);
}

export function useLibaio(fs) {
    require('./afs-libaio')(fs);
}

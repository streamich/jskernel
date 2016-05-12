import * as libjs from '../libjs/libjs';


function noop() {}

function throwError(errno, func = '', path = '', path2 = '') {
    // console.log(-errno, libjs.ERROR.EBADF);
    switch(-errno) {
        case libjs.ERROR.ENOENT:    throw Error(`ENOENT: no such file or directory, ${func} '${path}'`);
        case libjs.ERROR.EBADF:     throw Error(`EBADF: bad file descriptor, ${func}`);
        case libjs.ERROR.EINVAL:    throw Error(`EINVAL: invalid argument, ${func}`);
        case libjs.ERROR.EPERM:     throw Error(`EPERM: operation not permitted, ${func} '${path}' -> '${path2}'`);
        default:                    throw Error(`Error occurred in ${func}: errno = ${errno}`);
    }
}

function validPathOrThrow(path: string|Buffer): string {
    if(path instanceof Buffer) path = path.toString();
    if(typeof path !== 'string') throw TypeError('path must be a string');
    return path;
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

export function accessSync(path: string, mode: number = F_OK) {
    var result = libjs.access(path, mode);
    if(result < 0) throw Error(`Access to file denied [${result}]: ${path}`);
}


export interface IFileOptions {
    encoding?: string;
    mode?: number;
    flag?: string;
}

var appendFileDefaults: IFileOptions = {
    encoding: 'utf8',
    mode: MODE_DEFAULT,
    flag: flags.a,
};

export function appendFileSync(file: string|number, data: string|Buffer, options = {}) {
    options = Object.assign(options, appendFileDefaults);

}


export function chmodSync(path: string|Buffer, mode: number) {
    path = validPathOrThrow(path);
    if(typeof mode !== 'number') throw TypeError('mode must be an integer');
    var result = libjs.chmod(path, mode);
    if(result < 0) throwError(result, 'chmod', path);
}

export function fchmodSync(fd: number, mode: number) {
    validateFd(fd);
    if(typeof mode !== 'number') throw TypeError('mode must be an integer');
    var result = libjs.fchmod(fd, mode);
    if(result < 0) throwError(result, 'chmod');
}

// Mac OS only:
//     export function lchmodSync(path: string|Buffer, mode: number) {}


export function chownSync(path: string|Buffer, uid: number, gid: number) {
    path = validPathOrThrow(path);
    if(typeof uid !== 'number') throw TypeError('uid must be an unsigned int');
    if(typeof gid !== 'number') throw TypeError('gid must be an unsigned int');
    var result = libjs.chown(path, uid, gid);
    if(result < 0) throwError(result, 'chown', path);
}

export function fchownSync(fd: number, uid: number, gid: number) {
    validateFd(fd);
    if(typeof uid !== 'number') throw TypeError('uid must be an unsigned int');
    if(typeof gid !== 'number') throw TypeError('gid must be an unsigned int');
    var result = libjs.fchown(fd, uid, gid);
    if(result < 0) throwError(result, 'fchown');
}

export function lchownSync(path: string|Buffer, uid: number, gid: number) {
    path = validPathOrThrow(path);
    if(typeof uid !== 'number') throw TypeError('uid must be an unsigned int');
    if(typeof gid !== 'number') throw TypeError('gid must be an unsigned int');
    var result = libjs.lchown(path, uid, gid);
    if(result < 0) throwError(result, 'lchown', path);
}


export function closeSync(fd: number) {
    if(typeof fd !== 'number') throw TypeError('fd must be a file descriptor');
    var result = libjs.close(fd);
    if(result < 0) throwError(result, 'close');
}


export interface IReadStreamOptions {
    flags: flags;
    encoding: string;
    fd: number;
    mode: number;
    autoClose: boolean;
    start: number;
    end: number;
}

var readStreamOptionsDefaults: IReadStreamOptions = {
    flags: 'r',
    encoding: null,
    fd: null,
    mode: MODE_DEFAULT,
    autoClose: true,
};

export function createReadStream(path: string|Buffer, options: IReadStreamOptions|string = {}) {
    options = Object.assign(options, readStreamOptionsDefaults);
}


export function createWriteStream(path, options) {}


export function existsSync(path: string|Buffer): boolean {
    console.log('Deprecated fs.existsSync(): Use fs.statSync() or fs.accessSync() instead.');
    try {
        access(path);
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
    atime: string;
    mtime: string;
    ctime: string;
    birthtime: string;

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
    path = validPathOrThrow(path);
    try {
        var res = libjs.stat(path);
        return createStatsObject(res);
    } catch(errno) {
        throwError(errno, 'stat', path);
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
    path = validPathOrThrow(path);
    try {
        var res = libjs.lstat(path);
        return createStatsObject(res);
    } catch(errno) {
        throwError(errno, 'lstat', path);
    }
}


export function truncateSync(path: string, len: number) {
    path = validPathOrThrow(path);
    if(typeof len !== 'number') throw TypeError('len must be an integer');
    var res = libjs.truncate(path, len);
    if(res < 0) throwError(res, 'truncate', path);
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
    if(typeof atime === 'string') atime = parseInt(atime);
    if(typeof mtime === 'string') mtime = parseInt(mtime);
    if(typeof atime !== 'number') throw TypeError('atime must be an integer');
    if(typeof mtime !== 'number') throw TypeError('mtime must be an integer');
    if(!Number.isFinite(atime)) atime = Date.now();
    if(!Number.isFinite(mtime)) mtime = Date.now();

    // `libjs.utime` works with 1 sec precision.
    atime = Math.round(atime / 1000);
    mtime = Math.round(mtime / 1000);

    var times: libjs.utimbuf = {
        actime:     [libjs.UInt64.lo(atime), libjs.UInt64.hi(atime)],
        modtime:    [libjs.UInt64.lo(mtime), libjs.UInt64.hi(mtime)],
    };
    var res = libjs.utime(path, times);
    console.log(res);
    if(res < 0) throwError(res, 'utimes', path);
}

// export function futimesSync(fd: number, atime: number|string, mtime: number|string) {}


export function linkSync(srcpath: string|Buffer, dstpath: string|Buffer) {
    srcpath = validPathOrThrow(srcpath);
    dstpath = validPathOrThrow(dstpath);
    var res = libjs.link(srcpath, dstpath);
    if(res < 0) throwError(res, 'link', srcpath, dstpath);
}


export function mkdirSync(path: string|Buffer, mode: number = MODE_DEFAULT) {
    path = validPathOrThrow(path);
    if(typeof mode !== 'number') throw TypeError('mode must be an integer');
    var res = libjs.mkdir(path, mode);
    if(res < 0) throwError(res, 'mkdir', path);
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
    path = validPathOrThrow(path);
    var flagsval = flagsToFlagsValue(flags);
    if(typeof mode !== 'number') throw TypeError('mode must be an integer');
    var res = libjs.open(path, flagsval, mode);
    if(res < 0) throwError(res, 'open', path);
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


export interface IReaddirOptions {
    encoding: string;
}

var readdirOptionsDefaults: IReaddirOptions = {
    encoding: 'utf8',
};

export function readdirSync(path: string|Buffer, options: IReaddirOptions = {}) {
    path = validPathOrThrow(path);
    options = Object.assign(options, readdirOptionsDefaults);

}



function createFakeAsyncs() {
    function createFakeAsyncFunction(name) {
        exports[name] = (...args:any[]) => {
            var callback = noop();
            if (args.length && (typeof args[args.length - 1] === 'function')) {
                callback = args[args.length - 1];
                args = args.splice(0, args.length - 1);
            }
            process.nextTick(() => {
                try {
                    var result = exports[name + 'Sync'].apply(null, args);
                    callback(null, result);
                } catch (err) {
                    callback(err);
                }
            });
        }
    }

    for (var func of [
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
    ]) createFakeAsyncFunction(func);
}

createFakeAsyncs();

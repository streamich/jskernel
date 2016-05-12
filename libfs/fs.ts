import * as libjs from '../libjs/libjs';


function noop() {}

function throwError(errno, func = '', path = '') {
    // console.log(-errno, libjs.ERROR.EBADF);
    switch(-errno) {
        case libjs.ERROR.ENOENT:    throw Error(`ENOENT: no such file or directory, ${func} '${path}'`);
        case libjs.ERROR.EBADF:     throw Error(`EBADF: bad file descriptor, ${func}`);
        case libjs.ERROR.EINVAL:    throw Error(`EINVAL: invalid argument, ${func}`);
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
    r = 'r',        // Open file for reading. An exception occurs if the file does not exist.
    rw = 'r+',      // Open file for reading and writing. An exception occurs if the file does not exist.
    rs = 'rs',      // Open file for reading in synchronous mode. Instructs the operating system to bypass the local file system cache.
    rsw = 'rs+',    // Open file for reading and writing, telling the OS to open it synchronously. See notes for 'rs' about using this with caution.
    w = 'w',        // Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
    wx = 'wx',      // Like 'w' but fails if path exists.
    ww = 'w+',      // Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).
    wxw = 'wx+',    // Like 'w+' but fails if path exists.
    a = 'a',        // Open file for appending. The file is created if it does not exist.
    ax = 'ax',      // Like 'a' but fails if path exists.
    aw = 'a+',      // Open file for reading and appending. The file is created if it does not exist.
    axw = 'ax+',    // Like 'a+' but fails if path exists.
}


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
    mode: 0o666,
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
    if(typeof fd !== 'number') throw TypeError('fd must be a file descriptor');
    if(typeof mode !== 'number') throw TypeError('mode must be an integer');
    var result = libjs.fchmod(fd, mode);
    if(result < 0) throwError(result, 'chmod');
}


export function chownSync(path: string|Buffer, uid: number, gid: number) {
    if(path instanceof Buffer) path = path.toString();
    if(typeof path !== 'string') throw TypeError('path must be a string');
    if(typeof uid !== 'number') throw TypeError('uid must be an unsigned int');
    if(typeof gid !== 'number') throw TypeError('gid must be an unsigned int');
    var result = libjs.chown(path, uid, gid);
    if(result < 0) throwError(result, 'chown', path);
}

export function fchownSync(fd: number, uid: number, gid: number) {
    if(typeof fd !== 'number') throw TypeError('fd must be a file descriptor');
    if(typeof uid !== 'number') throw TypeError('uid must be an unsigned int');
    if(typeof gid !== 'number') throw TypeError('gid must be an unsigned int');
    var result = libjs.fchown(fd, uid, gid);
    if(result < 0) throwError(result, 'fchown');
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
    mode: 0o666,
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
        return this.mode & libjs.S.IFREG;
    }
    isDirectory(): boolean {
        return this.mode & libjs.S.IFDIR;
    }
    isBlockDevice(): boolean {
        return this.mode & libjs.S.IFBLK;
    }
    isCharacterDevice(): boolean {
        return this.mode & libjs.S.IFCHR;
    }
    isSymbolicLink(): boolean {
        return this.mode & libjs.S.IFLNK;
    }
    isFIFO(): boolean {
        return this.mode & libjs.S.IFIFO;
    }
    isSocket(): boolean {
        return this.mode & libjs.S.IFSOCK;
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


function createFakeAsyncFunction(name) {
    exports[name] = (...args: any[]) => {
        var callback = noop();
        if(args.length && (typeof args[args.length - 1] === 'function')) {
            callback = args[args.length - 1];
            args = args.splice(0, args.length - 1);
        }
        process.nextTick(() => {
            try {
                var result = exports[name + 'Sync'].apply(null, args);
                callback(null, result);
            } catch(err) {
                callback(err);
            }
        });
    }
}

for(var func of [
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
]) createFakeAsyncFunction(func);

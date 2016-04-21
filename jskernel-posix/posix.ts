import * as util from './util';
import syscall = require('./syscall');
import * as defs from './definitions';
var N = defs.syscalls;



export type TFlagList = {[name: string]: number};


export function read(fd: number, buf: Buffer): number {
    return syscall(N.read, fd, buf, buf.length);
}


export function write(fd: number, str: string): number {
    var buf = new Buffer(str + '\0');
    return syscall(N.write, fd, buf, buf.length);
}


export interface Iopen {
    (pathname: string, flags: number, mode?: number): number;
    flag?: {
        O_RDONLY:       number;
        O_WRONLY:       number;
        O_RDWR:         number;
        O_ACCMODE:      number;
        O_CREAT:        number;
        O_EXCL:         number;
        O_NOCTTY:       number;
        O_TRUNC:        number;
        O_APPEND:       number;
        O_NONBLOCK:     number;
        O_DSYNC:        number;
        FASYNC:         number;
        O_DIRECT:       number;
        O_LARGEFILE:    number;
        O_DIRECTORY:    number;
        O_NOFOLLOW:     number;
        O_NOATIME:      number;
        O_CLOEXEC:      number;
    };
    mode?: {
        NOOP:       number;
        S_IXOTH:    number;
        S_IWOTH:    number;
        S_IROTH:    number;
        S_IRWXO:    number;
        S_IXGRP:    number;
        S_IWGRP:    number;
        S_IRGRP:    number;
        S_IRWXG:    number;
        S_IXUSR:    number;
        S_IWUSR:    number;
        S_IRUSR:    number;
        S_IRWXU:    number;
        S_ISVTX:    number;
        S_ISGID:    number;
        S_ISUID:    number;
    };
}

export var open: Iopen = (pathname, flags, mode?): number => {
    var args = [N.open, pathname, flags];
    if(typeof mode === 'number') args.push(mode);
    return syscall.apply(null, args);
};

// http://lxr.free-electrons.com/source/include/uapi/asm-generic/fcntl.h#L19
open.flag = {
    O_RDONLY:       0,
    O_WRONLY:       1,
    O_RDWR:         2,
    O_ACCMODE:      3,
    O_CREAT:        64,
    O_EXCL:         128,
    O_NOCTTY:       256,
    O_TRUNC:        512,
    O_APPEND:       1024,
    O_NONBLOCK:     2048,
    O_DSYNC:        4096,
    FASYNC:         8192,
    O_DIRECT:       16384,
    O_LARGEFILE:    0,
    O_DIRECTORY:    65536,
    O_NOFOLLOW:     131072,
    O_NOATIME:      262144,
    O_CLOEXEC:      524288
};

open.mode = {
    NOOP:       0,
    S_IXOTH:    1,
    S_IWOTH:    2,
    S_IROTH:    4,
    S_IRWXO:    7,
    S_IXGRP:    8,
    S_IWGRP:    16,
    S_IRGRP:    32,
    S_IRWXG:    56,
    S_IXUSR:    64,
    S_IWUSR:    128,
    S_IRUSR:    256,
    S_IRWXU:    448,
    S_ISVTX:    512,
    S_ISGID:    1024,
    S_ISUID:    2048
};


export function close(fd: number): number {
    return syscall(N.close, fd);
}


export interface IStat {
    dev: number;
    ino: number;
    nlink: number;
    mode: number;
    uid: number;
    gid: number;
    rdev: number;
    size: number;
    blksize: number;
    blocks: number;
    atime: number;
    atime_nsec: number;
    mtime: number;
    mtime_nsec: number;
    ctime: number;
    ctime_nsec: number;
}

export function stat(filepath: string): IStat { // Throws number
    var buf = new Buffer(defs.struct.statSize);
    var result = syscall(N.stat, filepath, buf);
    if(result == 0) return util.parseStruct(buf, defs.struct.stat);
    throw result;
}

export function lstat(linkpath: string): IStat {
    var buf = new Buffer(defs.struct.statSize);
    var result = syscall(N.lstat, linkpath, buf);
    if(result == 0) return util.parseStruct(buf, defs.struct.stat);
    throw result;
}

export function fstat(fd: number): IStat {
    var buf = new Buffer(defs.struct.statSize);
    var result = syscall(N.fstat, fd, buf);
    if(result == 0) return util.parseStruct(buf, defs.struct.stat);
    throw result;
}


export function lseek(fd: number, offset: number, whence: number): number {
    return syscall(N.lseek, fd, offset, whence);
}


// http://man7.org/linux/man-pages/man2/mmap.2.html
export function mmap() {

}


// getaddrinfo
// freeaddrinfo
// fcntl
// socket
// bind
// epoll_create
// epoll_create1
// epoll_ctl
// epoll_wait


// http://www.skyfree.org/linux/kernel_network/socket.html
// https://github.com/torvalds/linux/blob/master/net/socket.c
// http://www.wangafu.net/~nickm/libevent-book/01_intro.html
// https://banu.com/blog/2/how-to-use-epoll-a-complete-example-in-c/epoll-example.c
export function socket() {

}


// http://davmac.org/davpage/linux/async-io.html#epoll
export function epoll_create() {

}


// typedef union epoll_data {
//     void    *ptr;
//     int      fd;
//     uint32_t u32;
//     uint64_t u64;
// } epoll_data_t;
//
// struct epoll_event {
//     uint32_t     events;    /* Epoll events */
//     epoll_data_t data;      /* User data variable */
// };
// http://man7.org/linux/man-pages/man2/epoll_wait.2.html
// int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);
export function epoll_wait() {

}


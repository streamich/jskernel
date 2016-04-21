"use strict";
var util = require('./util');
var syscall = require('./syscall');
var defs = require('./definitions');
var N = defs.syscalls;
function read(fd, buf) {
    return syscall(N.read, fd, buf, buf.length);
}
exports.read = read;
function write(fd, str) {
    var buf = new Buffer(str + '\0');
    return syscall(N.write, fd, buf, buf.length);
}
exports.write = write;
exports.open = function (pathname, flags, mode) {
    var args = [N.open, pathname, flags];
    if (typeof mode === 'number')
        args.push(mode);
    return syscall.apply(null, args);
};
// http://lxr.free-electrons.com/source/include/uapi/asm-generic/fcntl.h#L19
exports.open.flag = {
    O_RDONLY: 0,
    O_WRONLY: 1,
    O_RDWR: 2,
    O_ACCMODE: 3,
    O_CREAT: 64,
    O_EXCL: 128,
    O_NOCTTY: 256,
    O_TRUNC: 512,
    O_APPEND: 1024,
    O_NONBLOCK: 2048,
    O_DSYNC: 4096,
    FASYNC: 8192,
    O_DIRECT: 16384,
    O_LARGEFILE: 0,
    O_DIRECTORY: 65536,
    O_NOFOLLOW: 131072,
    O_NOATIME: 262144,
    O_CLOEXEC: 524288
};
exports.open.mode = {
    NOOP: 0,
    S_IXOTH: 1,
    S_IWOTH: 2,
    S_IROTH: 4,
    S_IRWXO: 7,
    S_IXGRP: 8,
    S_IWGRP: 16,
    S_IRGRP: 32,
    S_IRWXG: 56,
    S_IXUSR: 64,
    S_IWUSR: 128,
    S_IRUSR: 256,
    S_IRWXU: 448,
    S_ISVTX: 512,
    S_ISGID: 1024,
    S_ISUID: 2048
};
function close(fd) {
    return syscall(N.close, fd);
}
exports.close = close;
function stat(filepath) {
    var buf = new Buffer(defs.struct.statSize);
    var result = syscall(N.stat, filepath, buf);
    if (result == 0)
        return util.parseStruct(buf, defs.struct.stat);
    throw result;
}
exports.stat = stat;
function lstat(linkpath) {
    var buf = new Buffer(defs.struct.statSize);
    var result = syscall(N.lstat, linkpath, buf);
    if (result == 0)
        return util.parseStruct(buf, defs.struct.stat);
    throw result;
}
exports.lstat = lstat;
function fstat(fd) {
    var buf = new Buffer(defs.struct.statSize);
    var result = syscall(N.fstat, fd, buf);
    if (result == 0)
        return util.parseStruct(buf, defs.struct.stat);
    throw result;
}
exports.fstat = fstat;
function lseek(fd, offset, whence) {
    return syscall(N.lseek, fd, offset, whence);
}
exports.lseek = lseek;
// http://man7.org/linux/man-pages/man2/mmap.2.html
function mmap() {
}
exports.mmap = mmap;
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
function socket() {
}
exports.socket = socket;
// http://davmac.org/davpage/linux/async-io.html#epoll
function epoll_create() {
}
exports.epoll_create = epoll_create;
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
function epoll_wait() {
}
exports.epoll_wait = epoll_wait;

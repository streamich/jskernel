"use strict";
var util = require('./util');
var sys = require('./sys');
var defs = require('./definitions');
var N = defs.syscalls;
function read(fd, buf) {
    return sys.syscall(N.read, fd, buf, buf.length);
}
exports.read = read;
function write(fd, str) {
    var buf = new Buffer(str + '\0');
    return sys.syscall(N.write, fd, buf, buf.length);
}
exports.write = write;
exports.open = function (pathname, flags, mode) {
    var args = [N.open, pathname, flags];
    if (typeof mode === 'number')
        args.push(mode);
    return sys.syscall.apply(null, args);
};
function close(fd) {
    return sys.syscall(N.close, fd);
}
exports.close = close;
function stat(filepath) {
    var stat = defs.struct.stat;
    var buf = new Buffer(stat.size);
    var result = sys.syscall(N.stat, filepath, buf);
    if (result == 0)
        return stat.unpack(buf);
    throw result;
}
exports.stat = stat;
function lstat(linkpath) {
    var buf = new Buffer(defs.struct.statSize);
    var result = sys.syscall(N.lstat, linkpath, buf);
    if (result == 0)
        return util.parseStruct(buf, defs.struct.stat);
    throw result;
}
exports.lstat = lstat;
function fstat(fd) {
    var buf = new Buffer(defs.struct.statSize);
    var result = sys.syscall(N.fstat, fd, buf);
    if (result == 0)
        return util.parseStruct(buf, defs.struct.stat);
    throw result;
}
exports.fstat = fstat;
function lseek(fd, offset, whence) {
    return sys.syscall(N.lseek, fd, offset, whence);
}
exports.lseek = lseek;
function mmap(addr, length, prot, flags, fd, offset) {
    return sys.syscall(N.mmap, length, prot, flags, fd, offset);
}
exports.mmap = mmap;
// int munmap(void *addr, size_t length);
function munmap() {
}
exports.munmap = munmap;
// int socket(int domain, int type, int protocol);
function socket(domain, type, protocol) {
    return sys.syscall(N.socket, domain, type, protocol);
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

"use strict";
var sys = require('./sys');
var defs = require('./definitions');
// Files ---------------------------------------------------------------------------------------------------------------
function read(fd, buf) {
    return sys.syscall(defs.syscalls.read, fd, buf, buf.length);
}
exports.read = read;
function write(fd, str) {
    var buf = new Buffer(str + '\0');
    return sys.syscall(defs.syscalls.write, fd, buf, buf.length);
}
exports.write = write;
function open(pathname, flags, mode) {
    var args = [defs.syscalls.open, pathname, flags];
    if (typeof mode === 'number')
        args.push(mode);
    return sys.syscall.apply(null, args);
}
exports.open = open;
function close(fd) {
    return sys.syscall(defs.syscalls.close, fd);
}
exports.close = close;
function stat(filepath) {
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.stat, filepath, buf);
    if (result == 0)
        return defs.stat.unpack(buf);
    throw result;
}
exports.stat = stat;
function lstat(linkpath) {
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.lstat, linkpath, buf);
    if (result == 0)
        return defs.stat.unpack(buf);
    throw result;
}
exports.lstat = lstat;
function fstat(fd) {
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.fstat, fd, buf);
    if (result == 0)
        return defs.stat.unpack(buf);
    throw result;
}
exports.fstat = fstat;
function lseek(fd, offset, whence) {
    return sys.syscall(defs.syscalls.lseek, fd, offset, whence);
}
exports.lseek = lseek;
// Memory --------------------------------------------------------------------------------------------------------------
// TODO: Could not make `mmap` work for some reason.
// void *mmap(void *addr, size_t lengthint " prot ", int " flags, int fd, off_t offset);
function mmap(addr, length, prot, flags, fd, offset) {
    return sys.syscall(defs.syscalls.mmap, length, prot, flags, fd, offset);
}
exports.mmap = mmap;
// int munmap(void *addr, size_t length);
function munmap(addr, length) {
    return sys.syscall(defs.syscalls.munmap, addr, length);
}
exports.munmap = munmap;
// Sockets -------------------------------------------------------------------------------------------------------------
// http://www.skyfree.org/linux/kernel_network/socket.html
// https://github.com/torvalds/linux/blob/master/net/socket.c
// http://www.wangafu.net/~nickm/libevent-book/01_intro.html
// https://banu.com/blog/2/how-to-use-epoll-a-complete-example-in-c/epoll-example.c
// int socket(int domain, int type, int protocol);
function socket(domain, type, protocol) {
    return sys.syscall(defs.syscalls.socket, domain, type, protocol);
}
exports.socket = socket;
// connect(sockfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr))
function connect(fd, sockaddr) {
    var buf = defs.sockaddr_in.pack(sockaddr);
    return sys.syscall(defs.syscalls.connect, fd, buf, buf.length);
}
exports.connect = connect;
function bind(fd, sockaddr) {
    var buf = defs.sockaddr.pack(sockaddr);
    return sys.syscall(defs.syscalls.bind, fd, buf, buf.length);
}
exports.bind = bind;
// TODO: does not work yet...
// ssize_t sendto(int sockfd, const void *buf, size_t len, int flags, const struct sockaddr *dest_addr, socklen_t addrlen);
function sendto(fd, buf, flags, addr) {
    if (flags === void 0) { flags = 0; }
    var params = [defs.syscalls.sendto, fd, buf, buf.length, flags];
    if (addr) {
        var addrbuf = defs.sockaddr.pack(addr);
        params.push(addrbuf);
        params.push(addrbuf.length);
    }
    return sys.syscall.apply(null, params);
}
exports.sendto = sendto;
// ssize_t send(int sockfd, const void *buf, size_t len, int flags);
function send(fd, buf, flags) {
    if (flags === void 0) { flags = 0; }
    return sendto(fd, buf, flags);
}
exports.send = send;
// Process -------------------------------------------------------------------------------------------------------------
function getpid() {
    return sys.syscall(defs.syscalls.getpid);
}
exports.getpid = getpid;
function getppid() {
    return sys.syscall(defs.syscalls.getppid);
}
exports.getppid = getppid;
function getuid() {
    return sys.syscall(defs.syscalls.getuid);
}
exports.getuid = getuid;
function geteuid() {
    return sys.syscall(defs.syscalls.geteuid);
}
exports.geteuid = geteuid;
function getgid() {
    return sys.syscall(defs.syscalls.getgid);
}
exports.getgid = getgid;
function getegid() {
    return sys.syscall(defs.syscalls.getegid);
}
exports.getegid = getegid;
// Events --------------------------------------------------------------------------------------------------------------
function fcntl(fd, cmd, arg) {
    var params = [defs.syscalls, fd, cmd];
    if (typeof arg !== 'undefined')
        params.push(arg);
    return sys.syscall.apply(null, params);
}
exports.fcntl = fcntl;
// getaddrinfo
// freeaddrinfo
// epoll_create
// epoll_create1
// epoll_ctl
// epoll_wait
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

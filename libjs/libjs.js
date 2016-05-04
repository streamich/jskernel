"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var sys = require('./sys');
var defs = require('./definitions');
var debug = require('debug')('jskernel-posix:syscall');
__export(require('./definitions'));
__export(require('./socket'));
// Files ---------------------------------------------------------------------------------------------------------------
function read(fd, buf) {
    debug('read', fd);
    return sys.syscall(defs.syscalls.read, fd, buf, buf.length);
}
exports.read = read;
function write(fd, buf) {
    debug('write', fd);
    if (!(buf instanceof Buffer))
        buf = new Buffer(buf + '\0');
    return sys.syscall(defs.syscalls.write, fd, buf, buf.length);
}
exports.write = write;
function open(pathname, flags, mode) {
    debug('write', pathname, flags, mode);
    var args = [defs.syscalls.open, pathname, flags];
    if (typeof mode === 'number')
        args.push(mode);
    return sys.syscall.apply(null, args);
}
exports.open = open;
function close(fd) {
    debug('close', fd);
    return sys.syscall(defs.syscalls.close, fd);
}
exports.close = close;
function stat(filepath) {
    debug('stat', filepath);
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.stat, filepath, buf);
    if (result == 0)
        return defs.stat.unpack(buf);
    throw result;
}
exports.stat = stat;
function lstat(linkpath) {
    debug('lstat', linkpath);
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.lstat, linkpath, buf);
    if (result == 0)
        return defs.stat.unpack(buf);
    throw result;
}
exports.lstat = lstat;
function fstat(fd) {
    debug('fstat', fd);
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.fstat, fd, buf);
    if (result == 0)
        return defs.stat.unpack(buf);
    throw result;
}
exports.fstat = fstat;
function lseek(fd, offset, whence) {
    debug('lseek', fd, offset, whence);
    return sys.syscall(defs.syscalls.lseek, fd, offset, whence);
}
exports.lseek = lseek;
// Memory --------------------------------------------------------------------------------------------------------------
// TODO: Could not make `mmap` work for some reason.
// void *mmap(void *addr, size_t lengthint " prot ", int " flags, int fd, off_t offset);
function mmap(addr, length, prot, flags, fd, offset) {
    debug('mmap', addr, length, prot, flags, fd, offset);
    return sys.syscall(defs.syscalls.mmap, length, prot, flags, fd, offset);
}
exports.mmap = mmap;
// int munmap(void *addr, size_t length);
function munmap(addr, length) {
    debug('munmap');
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
    debug('socket', domain, type, protocol);
    return sys.syscall(defs.syscalls.socket, domain, type, protocol);
}
exports.socket = socket;
// connect(sockfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr))
function connect(fd, sockaddr) {
    debug('connect', fd, sockaddr.sin_addr.s_addr.toString(), require('./socket').hton16(sockaddr.sin_port));
    var buf = defs.sockaddr_in.pack(sockaddr);
    return sys.syscall(defs.syscalls.connect, fd, buf, buf.length);
}
exports.connect = connect;
function bind(fd, sockaddr) {
    debug('bind', fd, sockaddr.sin_addr.s_addr.toString(), require('./socket').hton16(sockaddr.sin_port));
    var buf = defs.sockaddr_in.pack(sockaddr);
    return sys.syscall(defs.syscalls.bind, fd, buf, buf.length);
}
exports.bind = bind;
// int listen(int sockfd, int backlog);
function listen(fd, backlog) {
    debug('listen', fd, backlog);
    return sys.syscall(defs.syscalls.listen, fd, backlog);
}
exports.listen = listen;
// int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);
function accept(fd, buf) {
    debug('accept', fd);
    var buflen = defs.int32.pack(buf.length);
    return sys.syscall(defs.syscalls.accept, fd, buf, buflen);
}
exports.accept = accept;
// int accept4(int sockfd, struct sockaddr *addr, socklen_t *addrlen, int flags);
function accept4(fd, buf, flags) {
    debug('accept4', fd, flags);
    var buflen = defs.int32.pack(buf.length);
    return sys.syscall(defs.syscalls.accept4, fd, buf, buflen, flags);
}
exports.accept4 = accept4;
function shutdown(fd, how) {
    debug('shutdown', fd, how);
    return sys.syscall(defs.syscalls.shutdown, fd, how);
}
exports.shutdown = shutdown;
// TODO: does not work yet...
// ssize_t sendto(int sockfd, const void *buf, size_t len, int flags, const struct sockaddr *dest_addr, socklen_t addrlen);
function sendto(fd, buf, flags, addr) {
    if (flags === void 0) { flags = 0; }
    debug('sendto', fd);
    var params = [defs.syscalls.sendto, fd, buf, buf.length, flags, 0, 0];
    if (addr) {
        var addrbuf = defs.sockaddr.pack(addr);
        params[5] = addrbuf;
        params[6] = addrbuf.length;
    }
    return sys.syscall.apply(null, params);
}
exports.sendto = sendto;
// ssize_t send(int sockfd, const void *buf, size_t len, int flags);
function send(fd, buf, flags) {
    if (flags === void 0) { flags = 0; }
    debug('send', fd);
    return sendto(fd, buf, flags);
}
exports.send = send;
// Process -------------------------------------------------------------------------------------------------------------
function getpid() {
    debug('getpid');
    return sys.syscall(defs.syscalls.getpid);
}
exports.getpid = getpid;
function getppid() {
    debug('getppid');
    return sys.syscall(defs.syscalls.getppid);
}
exports.getppid = getppid;
function getuid() {
    debug('getuid');
    return sys.syscall(defs.syscalls.getuid);
}
exports.getuid = getuid;
function geteuid() {
    debug('geteuid');
    return sys.syscall(defs.syscalls.geteuid);
}
exports.geteuid = geteuid;
function getgid() {
    debug('getgid');
    return sys.syscall(defs.syscalls.getgid);
}
exports.getgid = getgid;
function getegid() {
    debug('getegid');
    return sys.syscall(defs.syscalls.getegid);
}
exports.getegid = getegid;
// Events --------------------------------------------------------------------------------------------------------------
function fcntl(fd, cmd, arg) {
    debug('fcntl', fd, cmd, arg);
    var params = [defs.syscalls.fcntl, fd, cmd];
    if (typeof arg !== 'undefined')
        params.push(arg);
    return sys.syscall.apply(null, params);
}
exports.fcntl = fcntl;
// getaddrinfo
// freeaddrinfo
// http://davmac.org/davpage/linux/async-io.html#epoll
// int epoll_create(int size);
// Size is ignored, but most be greater than 0.
function epoll_create(size) {
    debug('epoll_create', size);
    return sys.syscall(defs.syscalls.epoll_create, size);
}
exports.epoll_create = epoll_create;
// int epoll_create1(int flags);
function epoll_create1(flags) {
    debug('epoll_create1');
    return sys.syscall(defs.syscalls.epoll_create1, flags);
}
exports.epoll_create1 = epoll_create1;
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
function epoll_wait(epfd, buf, maxevents, timeout) {
    debug('epoll_wait', epfd, maxevents, timeout);
    return sys.syscall(defs.syscalls.epoll_wait, epfd, buf, maxevents, timeout);
}
exports.epoll_wait = epoll_wait;
// int epoll_pwait(int epfd, struct epoll_event *events, int maxevents, int timeout, const sigset_t *sigmask);
// export function epoll_pwait() {
//
// }
// int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
function epoll_ctl(epfd, op, fd, epoll_event) {
    var buf = defs.epoll_event.pack(epoll_event);
    return sys.syscall(defs.syscalls.epoll_ctl, epfd, op, fd, buf);
}
exports.epoll_ctl = epoll_ctl;
// ## Memory
/**
 * Allocates a shared memory segment. shmget() returns the identifier of the shared memory segment associated with the
 * value of the argument key. A new shared memory segment, with size equal to the value of size rounded up to a multiple
 * of PAGE_SIZE, is created if key has the value IPC_PRIVATE or key isn't IPC_PRIVATE, no shared memory segment
 * corresponding to key exists, and IPC_CREAT is specified in shmflg.
 *
 * In `libc`:
 *
 *      int shmget ( key_t key, int size, int shmflg );
 *
 * Reference:
 *
 *  - http://linux.die.net/man/2/shmget
 *
 * @param key {number}
 * @param size {number}
 * @param shmflg {IPC|FLAG} If shmflg specifies both IPC_CREAT and IPC_EXCL and a shared memory segment already exists
 *      for key, then shmget() fails with errno set to EEXIST. (This is analogous to the effect of the combination
 *      O_CREAT | O_EXCL for open(2).)
 * @returns {number} `shmid` -- ID of the allocated memory, if positive.
 *      If negative: errno =
 *          EINVAL (Invalid segment size specified)
 *          EEXIST (Segment exists, cannot create)
 *          EIDRM (Segment is marked for deletion, or was removed)
 *          ENOENT (Segment does not exist)
 *          EACCES (Permission denied)
 *          ENOMEM (Not enough memory to create segment)
 */
function shmget(key, size, shmflg) {
    debug('shmget', key, size, shmflg);
    return sys.syscall(defs.syscalls.shmget, key, size, shmflg);
}
exports.shmget = shmget;
/**
 * Attaches the shared memory segment identified by shmid to the address space of the calling process.
 *
 * In `libc`:
 *
 *      void *shmat(int shmid, const void *shmaddr, int shmflg);
 *
 * Reference:
 *
 *  - http://linux.die.net/man/2/shmat
 *
 * @param shmid {number} ID returned by `shmget`.
 * @param shmaddr {number} Optional approximate address where to allocate memory, or NULL.
 * @param shmflg {SHM}
 * @returns {number} On success shmat() returns the address of the attached shared memory segment; on error (void *) -1
 *      is returned, and errno is set to indicate the cause of the error.
 */
function shmat(shmid, shmaddr, shmflg) {
    if (shmaddr === void 0) { shmaddr = defs.NULL; }
    if (shmflg === void 0) { shmflg = 0; }
    debug('shmat', shmid, shmaddr, shmflg);
    return sys.syscall64(defs.syscalls.shmat, shmid, shmaddr, shmflg);
}
exports.shmat = shmat;
/**
 * Detaches the shared memory segment located at the address specified by shmaddr from the address space of the calling
 * process. The to-be-detached segment must be currently attached with shmaddr equal to the value returned by the
 * attaching shmat() call.
 *
 * In `libc`:
 *
 *      int shmdt(const void *shmaddr);
 *
 * Reference:
 *
 *  - http://linux.die.net/man/2/shmat
 *
 * @param shmaddr {number}
 * @returns {number} On success shmdt() returns 0; on error -1 is returned, and errno is set to indicate the cause of the error.
 */
function shmdt(shmaddr) {
    debug('shmdt', shmaddr);
    return sys.syscall(defs.syscalls.shmdt, shmaddr);
}
exports.shmdt = shmdt;
/**
 * Performs the control operation specified by cmd on the shared memory segment whose identifier is given in shmid.
 *
 * In `libc`:
 *
 *      int shmctl(int shmid, int cmd, struct shmid_ds *buf);
 *
 * Reference:
 *
 *  - http://linux.die.net/man/2/shmctl
 *
 * @param shmid {number}
 * @param cmd {defs.IPC|defs.SHM}
 * @param buf {Buffer|defs.shmid_ds|defs.NULL} Buffer of size `defs.shmid_ds.size` where kernel will write reponse, or
 *      `defs.shmid_ds` structure that will be serialized for kernel to read data from, or 0 if no argument needed.
 * @returns {number} A successful IPC_INFO or SHM_INFO operation returns the index of the highest used entry in the
 *      kernel's internal array recording information about all shared memory segments. (This information can be used
 *      with repeated SHM_STAT operations to obtain information about all shared memory segments on the system.) A
 *      successful SHM_STAT operation returns the identifier of the shared memory segment whose index was given in
 *      shmid. Other operations return 0 on success. On error, -1 is returned, and errno is set appropriately.
 */
function shmctl(shmid, cmd, buf) {
    if (buf === void 0) { buf = defs.NULL; }
    debug('shmctl', shmid, cmd, buf instanceof Buffer ? '[Buffer]' : buf);
    if (buf instanceof Buffer) {
    }
    else if (typeof buf === 'object') {
        // User provided `defs.shmid_ds` object, so we serialize it.
        buf = defs.shmid_ds.pack(buf);
    }
    else {
    }
    return sys.syscall(defs.syscalls.shmctl, shmid, cmd, buf);
}
exports.shmctl = shmctl;

// # libjs
// 
// `libjs` creates wrappers around system calls, similar to what `libc` does for `C` language.


// `libsys` library contains our only native dependency -- the `syscall` function.
// 
//     sys.syscall(cmd: number, ...args): number
import * as util from './util';
import * as sys from './sys';

// `defs` provides platform specific constants and structs, the default one we use is `x86_64`.
import * as defs from './definitions';

// In development mode we use `debug` library to trace all our system calls. To see debug output,
// set `DEBUG` environment variable to `libjs:*`, example:
// 
//     DEBUG=libjs:* node script.js
var debug = require('debug')('libjs:syscall');

// Export definitions and other modules all as part of the library.
export * from './definitions';
export * from './socket';


// ## Files
// 
// Standard file operations.

// ### read
//
//     read(fd: number, buf: Buffer): number
// 
// Read data from file associated with `fd` file descriptor into buffer `buf`.
// Up to size of the `buf.length` will be read or less.
//
// Returns a `number` which is the actual bytes read into the buffer, if negative,
// represents an error.

/**
 * @param fd {number}
 * @param buf {Buffer}
 * @returns {number}
 */
export function read(fd: number, buf: Buffer): number {
    debug('read', fd);
    return sys.syscall(defs.syscalls.read, fd, buf, buf.length);
}

// ### write
//
//     write(fd: number, buf: string|Buffer): number
//
// Write data to a file descriptor. Example, write to console (where `STDOUT` has value `1` as a file descriptor):
//
//     libjs.write(1, 'Hello console\n');

export function write(fd: number, buf: string|Buffer): number {
    debug('write', fd);
    if(!(buf instanceof Buffer)) buf = new Buffer((buf as string) + '\0');
    return sys.syscall(defs.syscalls.write, fd, buf, buf.length);
}

// ### open
// 
//     open(pathname: string, flags: defs.FLAG, mode?: defs.MODE): number
// 
// Opens a file, returns file descriptor on success or a negative number representing an error.
// 
// Read data from a file:
// 
//     var fd = libjs.open('/tmp/data.txt', libjs.FLAG...);
//     var buf = new Buffer(1024);
//     libjs.read(fd, buf);

export function open(pathname: string, flags: defs.FLAG, mode?: defs.MODE): number {
    debug('write', pathname, flags, mode);
    var args = [defs.syscalls.open, pathname, flags];
    if(typeof mode === 'number') args.push(mode);
    return sys.syscall.apply(null, args);
}

export function close(fd: number): number {
    debug('close', fd);
    return sys.syscall(defs.syscalls.close, fd);
}

// ### stat, lstat, fstat
// 
// Fetches and returns statistics about a file.
//
//     stat(filepath: string): defs.stat
//     lstat(linkpath: string): defs.stat
//     fstat(fd: number): defs.stat
// 
// Returns a `stat` object of the form:
//
//     interface stat {
//         dev: number;
//         ino: number;
//         nlink: number;
//         mode: number;
//         uid: number;
//         gid: number;
//         rdev: number;
//         size: number;
//         blksize: number;
//         blocks: number;
//         atime: number;
//         atime_nsec: number;
//         mtime: number;
//         mtime_nsec: number;
//         ctime: number;
//         ctime_nsec: number;
//     }
//
export function stat(filepath: string): defs.stat { // Throws number
    debug('stat', filepath);
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.stat, filepath, buf);
    if(result == 0) return defs.stat.unpack(buf);
    throw result;
}

export function lstat(linkpath: string): defs.stat {
    debug('lstat', linkpath);
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.lstat, linkpath, buf);
    if(result == 0) return defs.stat.unpack(buf);
    throw result;
}

export function fstat(fd: number): defs.stat {
    debug('fstat', fd);
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.fstat, fd, buf);
    if(result == 0) return defs.stat.unpack(buf);
    throw result;
}


export function lseek(fd: number, offset: number, whence: number): number {
    debug('lseek', fd, offset, whence);
    return sys.syscall(defs.syscalls.lseek, fd, offset, whence);
}


// Memory --------------------------------------------------------------------------------------------------------------

// TODO: Could not make `mmap` work for some reason.
// void *mmap(void *addr, size_t lengthint " prot ", int " flags, int fd, off_t offset);
export function mmap(addr: number, length: number, prot: number, flags: number, fd: number, offset: number): number {
    debug('mmap', addr, length, prot, flags, fd, offset);
    return sys.syscall(defs.syscalls.mmap, length, prot, flags, fd, offset);
}

// int munmap(void *addr, size_t length);
export function munmap(addr: Buffer, length: number): number {
    debug('munmap');
    return sys.syscall(defs.syscalls.munmap, addr, length);
}


// Sockets -------------------------------------------------------------------------------------------------------------

// http://www.skyfree.org/linux/kernel_network/socket.html
// https://github.com/torvalds/linux/blob/master/net/socket.c
// http://www.wangafu.net/~nickm/libevent-book/01_intro.html
// https://banu.com/blog/2/how-to-use-epoll-a-complete-example-in-c/epoll-example.c
// int socket(int domain, int type, int protocol);
export function socket(domain: defs.AF, type: defs.SOCK, protocol: number): number {
    debug('socket', domain, type, protocol);
    return sys.syscall(defs.syscalls.socket, domain, type, protocol);
}

// connect(sockfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr))
export function connect(fd: number, sockaddr: defs.sockaddr_in): number {
    debug('connect', fd, sockaddr.sin_addr.s_addr.toString(), require('./socket').hton16(sockaddr.sin_port));
    var buf = defs.sockaddr_in.pack(sockaddr);
    return sys.syscall(defs.syscalls.connect, fd, buf, buf.length);
}

export function bind(fd: number, sockaddr: defs.sockaddr_in): number {
    debug('bind', fd, sockaddr.sin_addr.s_addr.toString(), require('./socket').hton16(sockaddr.sin_port));
    var buf = defs.sockaddr_in.pack(sockaddr);
    return sys.syscall(defs.syscalls.bind, fd, buf, buf.length);
}

// int listen(int sockfd, int backlog);
export function listen(fd: number, backlog: number): number {
    debug('listen', fd, backlog);
    return sys.syscall(defs.syscalls.listen, fd, backlog);
}

// int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);
export function accept(fd: number, buf: Buffer): number {
    debug('accept', fd);
    var buflen = defs.int32.pack(buf.length);
    return sys.syscall(defs.syscalls.accept, fd, buf, buflen);
}

// int accept4(int sockfd, struct sockaddr *addr, socklen_t *addrlen, int flags);
export function accept4(fd: number, buf: Buffer, flags: defs.SOCK) {
    debug('accept4', fd, flags);
    var buflen = defs.int32.pack(buf.length);
    return sys.syscall(defs.syscalls.accept4, fd, buf, buflen, flags);
}

export function shutdown(fd: number, how: defs.SHUT) {
    debug('shutdown', fd, how);
    return sys.syscall(defs.syscalls.shutdown, fd, how);
}

// TODO: does not work yet...
// ssize_t sendto(int sockfd, const void *buf, size_t len, int flags, const struct sockaddr *dest_addr, socklen_t addrlen);
export function sendto(fd: number, buf: Buffer, flags: defs.MSG = 0, addr?: defs.sockaddr): number {
    debug('sendto', fd);
    var params = [defs.syscalls.sendto, fd, buf, buf.length, flags, 0, 0];
    if(addr) {
        var addrbuf = defs.sockaddr.pack(addr);
        params[5] = addrbuf;
        params[6] = addrbuf.length;
    }
    return sys.syscall.apply(null, params);
}

// ssize_t send(int sockfd, const void *buf, size_t len, int flags);
export function send(fd: number, buf: Buffer, flags: defs.MSG = 0): number {
    debug('send', fd);
    return sendto(fd, buf, flags);
}


// Process -------------------------------------------------------------------------------------------------------------

export function getpid() {
    debug('getpid');
    return sys.syscall(defs.syscalls.getpid);
}

export function getppid() {
    debug('getppid');
    return sys.syscall(defs.syscalls.getppid);
}

export function getuid() {
    debug('getuid');
    return sys.syscall(defs.syscalls.getuid);
}

export function geteuid() {
    debug('geteuid');
    return sys.syscall(defs.syscalls.geteuid);
}

export function getgid() {
    debug('getgid');
    return sys.syscall(defs.syscalls.getgid);
}

export function getegid() {
    debug('getegid');
    return sys.syscall(defs.syscalls.getegid);
}


// Events --------------------------------------------------------------------------------------------------------------

export function fcntl(fd: number, cmd: defs.FCNTL, arg?: number): number {
    debug('fcntl', fd, cmd, arg);
    var params = [defs.syscalls.fcntl, fd, cmd];
    if(typeof arg !== 'undefined') params.push(arg);
    return sys.syscall.apply(null, params);
}

// getaddrinfo
// freeaddrinfo
// http://davmac.org/davpage/linux/async-io.html#epoll
// int epoll_create(int size);
// Size is ignored, but most be greater than 0.
export function epoll_create(size: number): number {
    debug('epoll_create', size);
    return sys.syscall(defs.syscalls.epoll_create, size);
}

// int epoll_create1(int flags);
export function epoll_create1(flags: defs.EPOLL): number {
    debug('epoll_create1');
    return sys.syscall(defs.syscalls.epoll_create1, flags);
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
export function epoll_wait(epfd: number, buf: Buffer, maxevents: number, timeout: number): number {
    debug('epoll_wait', epfd, maxevents, timeout);
    return sys.syscall(defs.syscalls.epoll_wait, epfd, buf, maxevents, timeout);
}

// int epoll_pwait(int epfd, struct epoll_event *events, int maxevents, int timeout, const sigset_t *sigmask);
// export function epoll_pwait() {
//
// }

// int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
export function epoll_ctl(epfd: number, op: defs.EPOLL_CTL, fd: number, epoll_event: defs.epoll_event): number {
    var buf = defs.epoll_event.pack(epoll_event);
    return sys.syscall(defs.syscalls.epoll_ctl, epfd, op, fd, buf);
}


// ## Memory


// ### shmget
// 
//     shmget(key: number, size: number, shmflg: defs.IPC|defs.FLAG): number
//
// Allocates a shared memory segment. `shmget()` returns the identifier of the shared memory segment associated with the
// value of the argument key. A new shared memory segment, with size equal to the value of size rounded up to a multiple
// of `PAGE_SIZE`, is created if key has the value `IPC.PRIVATE` or key isn't `IPC.PRIVATE`, no shared memory segment
// corresponding to key exists, and `IPC.CREAT` is specified in `shmflg`.
// 
// In `libc`:
// 
//     int shmget (key_t key, int size, int shmflg);
//
// Reference:
// 
//  - http://linux.die.net/man/2/shmget
// 
// Returns:
// 
//  - If positive: identifier of the shared memory block.
//  - If negative: `errno` =
//    - `EINVAL` -- Invalid segment size specified
//    - `EEXIST` -- Segment exists, cannot create
//    - `EIDRM` -- Segment is marked for deletion, or was removed
//    - `ENOENT` -- Segment does not exist
//    - `EACCES` -- Permission denied
//    - `ENOMEM` -- Not enough memory to create segment
 
 
/**
 * @param key {number}
 * @param size {number}
 * @param shmflg {IPC|FLAG} If shmflg specifies both IPC_CREAT and IPC_EXCL and a shared memory segment already exists
 *      for key, then shmget() fails with errno set to EEXIST. (This is analogous to the effect of the combination
 *      O_CREAT | O_EXCL for open(2).)
 * @returns {number} `shmid` -- ID of the allocated memory, if positive.
 */
export function shmget(key: number, size: number, shmflg: defs.IPC|defs.FLAG): number {
    debug('shmget', key, size, shmflg);
    return sys.syscall(defs.syscalls.shmget, key, size, shmflg);
}


// ### shmat`
//
//     shmat(shmid: number, shmaddr: number = defs.NULL, shmflg: defs.SHM = 0): [number, number]
//
// Attaches the shared memory segment identified by shmid to the address space of the calling process.
// 
// In `libc`:
// 
//     void *shmat(int shmid, const void *shmaddr, int shmflg);
// 
// Reference:
// 
//  - http://linux.die.net/man/2/shmat
//
// Returns:
//
//  - On success shmat() returns the address of the attached shared memory segment; on error (void *) -1
//  is returned, and errno is set to indicate the cause of the error.

/**
 *
 * @param shmid {number} ID returned by `shmget`.
 * @param shmaddr {number} Optional approximate address where to allocate memory, or NULL.
 * @param shmflg {SHM}
 * @returns {number}
 */
export function shmat(shmid: number, shmaddr: number = defs.NULL, shmflg: defs.SHM = 0): [number, number] {
    debug('shmat', shmid, shmaddr, shmflg);
    return sys.syscall64(defs.syscalls.shmat, shmid, shmaddr, shmflg);
}


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
export function shmdt(shmaddr: number): number {
    debug('shmdt', shmaddr);
    return sys.syscall(defs.syscalls.shmdt, shmaddr);
}

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
export function shmctl(shmid: number, cmd: defs.IPC|defs.SHM, buf: Buffer|defs.shmid_ds|number = defs.NULL): number {
    debug('shmctl', shmid, cmd, buf instanceof Buffer ? '[Buffer]' : buf);
    if(buf instanceof Buffer) {
        // User provided us buffer of size `defs.shmid_ds.size` where kernel will write reponse.
    } else if(typeof buf === 'object') {
        // User provided `defs.shmid_ds` object, so we serialize it.
        buf = defs.shmid_ds.pack(buf) as Buffer;
    } else {
        // Third argument is just `defs.NULL`.
    }
    return sys.syscall(defs.syscalls.shmctl, shmid, cmd, buf as Buffer|number);
}

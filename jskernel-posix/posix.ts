import * as util from './util';
import * as sys from './sys';
import * as defs from './definitions';


// Files ---------------------------------------------------------------------------------------------------------------

export function read(fd: number, buf: Buffer): number {
    return sys.syscall(defs.syscalls.read, fd, buf, buf.length);
}

export function write(fd: number, str: string): number {
    var buf = new Buffer(str + '\0');
    return sys.syscall(defs.syscalls.write, fd, buf, buf.length);
}

export function open (pathname: string, flags: defs.FLAG, mode?: defs.MODE): number {
    var args = [defs.syscalls.open, pathname, flags];
    if(typeof mode === 'number') args.push(mode);
    return sys.syscall.apply(null, args);
}

export function close(fd: number): number {
    return sys.syscall(defs.syscalls.close, fd);
}


export function stat(filepath: string): defs.stat { // Throws number
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.stat, filepath, buf);
    if(result == 0) return defs.stat.unpack(buf);
    throw result;
}

export function lstat(linkpath: string): defs.stat {
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.lstat, linkpath, buf);
    if(result == 0) return defs.stat.unpack(buf);
    throw result;
}

export function fstat(fd: number): defs.stat {
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.fstat, fd, buf);
    if(result == 0) return defs.stat.unpack(buf);
    throw result;
}


export function lseek(fd: number, offset: number, whence: number): number {
    return sys.syscall(defs.syscalls.lseek, fd, offset, whence);
}


// Memory --------------------------------------------------------------------------------------------------------------

// TODO: Could not make `mmap` work for some reason.
// void *mmap(void *addr, size_t lengthint " prot ", int " flags, int fd, off_t offset);
export function mmap(addr: number, length: number, prot: number, flags: number, fd: number, offset: number): number {
    return sys.syscall(defs.syscalls.mmap, length, prot, flags, fd, offset);
}

// int munmap(void *addr, size_t length);
export function munmap(addr: Buffer, length: number): number {
    return sys.syscall(defs.syscalls.munmap, addr, length);
}


// Sockets -------------------------------------------------------------------------------------------------------------

// http://www.skyfree.org/linux/kernel_network/socket.html
// https://github.com/torvalds/linux/blob/master/net/socket.c
// http://www.wangafu.net/~nickm/libevent-book/01_intro.html
// https://banu.com/blog/2/how-to-use-epoll-a-complete-example-in-c/epoll-example.c
// int socket(int domain, int type, int protocol);
export function socket(domain: defs.AF, type: defs.SOCK, protocol: number): number {
    return sys.syscall(defs.syscalls.socket, domain, type, protocol);
}

// connect(sockfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr))
export function connect(fd: number, sockaddr: defs.sockaddr_in): number {
    var buf = defs.sockaddr_in.pack(sockaddr);
    return sys.syscall(defs.syscalls.connect, fd, buf, buf.length);
}

export function bind(fd: number, sockaddr: defs.sockaddr): number {
    var buf = defs.sockaddr.pack(sockaddr);
    return sys.syscall(defs.syscalls.bind, fd, buf, buf.length);
}

// TODO: does not work yet...
// ssize_t sendto(int sockfd, const void *buf, size_t len, int flags, const struct sockaddr *dest_addr, socklen_t addrlen);
export function sendto(fd: number, buf: Buffer, flags: defs.MSG = 0, addr?: defs.sockaddr): number {
    var params = [defs.syscalls.sendto, fd, buf, buf.length, flags];
    if(addr) {
        var addrbuf = defs.sockaddr.pack(addr);
        params.push(addrbuf);
        params.push(addrbuf.length);
    }
    return sys.syscall.apply(null, params);
}

// ssize_t send(int sockfd, const void *buf, size_t len, int flags);
export function send(fd: number, buf: Buffer, flags: defs.MSG = 0): number {
    return sendto(fd, buf, flags);
}


// Process -------------------------------------------------------------------------------------------------------------

export function getpid() {
    return sys.syscall(defs.syscalls.getpid);
}

export function getppid() {
    return sys.syscall(defs.syscalls.getppid);
}

export function getuid() {
    return sys.syscall(defs.syscalls.getuid);
}

export function geteuid() {
    return sys.syscall(defs.syscalls.geteuid);
}

export function getgid() {
    return sys.syscall(defs.syscalls.getgid);
}

export function getegid() {
    return sys.syscall(defs.syscalls.getegid);
}


// Events --------------------------------------------------------------------------------------------------------------

export function fcntl(fd: number, cmd: number, arg?: number): number {
    var params = [defs.syscalls, fd, cmd];
    if(typeof arg !== 'undefined') params.push(arg);
    return sys.syscall.apply(null, params);
}

// getaddrinfo
// freeaddrinfo
// epoll_create
// epoll_create1
// epoll_ctl
// epoll_wait
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


import * as util from './util';
import * as sys from './sys';
import * as defs from './definitions';
var N = defs.syscalls;


export function read(fd: number, buf: Buffer): number {
    return sys.syscall(N.read, fd, buf, buf.length);
}


export function write(fd: number, str: string): number {
    var buf = new Buffer(str + '\0');
    return sys.syscall(N.write, fd, buf, buf.length);
}


// http://lxr.free-electrons.com/source/include/uapi/asm-generic/fcntl.h#L19
export const enum OFLAG {
    O_RDONLY        = 0,
    O_WRONLY        = 1,
    O_RDWR          = 2,
    O_ACCMODE       = 3,
    O_CREAT         = 64,
    O_EXCL          = 128,
    O_NOCTTY        = 256,
    O_TRUNC         = 512,
    O_APPEND        = 1024,
    O_NONBLOCK      = 2048,
    O_DSYNC         = 4096,
    FASYNC          = 8192,
    O_DIRECT        = 16384,
    O_LARGEFILE     = 0,
    O_DIRECTORY     = 65536,
    O_NOFOLLOW      = 131072,
    O_NOATIME       = 262144,
    O_CLOEXEC       = 524288,
}

export const enum OMODE {
    S_IXOTH = 1,
    S_IWOTH = 2,
    S_IROTH = 4,
    S_IRWXO = 7,
    S_IXGRP = 8,
    S_IWGRP = 16,
    S_IRGRP = 32,
    S_IRWXG = 56,
    S_IXUSR = 64,
    S_IWUSR = 128,
    S_IRUSR = 256,
    S_IRWXU = 448,
    S_ISVTX = 512,
    S_ISGID = 1024,
    S_ISUID = 2048,
}

export var open = (pathname: string, flags: number, mode?: number): number => {
    var args = [N.open, pathname, flags];
    if(typeof mode === 'number') args.push(mode);
    return sys.syscall.apply(null, args);
};


export function close(fd: number): number {
    return sys.syscall(N.close, fd);
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
    var stat = defs.struct.stat;
    var buf = new Buffer(stat.size);
    var result = sys.syscall(N.stat, filepath, buf);
    if(result == 0) return stat.unpack(buf);
    throw result;
}

export function lstat(linkpath: string): IStat {
    var buf = new Buffer(defs.struct.statSize);
    var result = sys.syscall(N.lstat, linkpath, buf);
    if(result == 0) return util.parseStruct(buf, defs.struct.stat);
    throw result;
}

export function fstat(fd: number): IStat {
    var buf = new Buffer(defs.struct.statSize);
    var result = sys.syscall(N.fstat, fd, buf);
    if(result == 0) return util.parseStruct(buf, defs.struct.stat);
    throw result;
}


export function lseek(fd: number, offset: number, whence: number): number {
    return sys.syscall(N.lseek, fd, offset, whence);
}


// http://man7.org/linux/man-pages/man2/mmap.2.html
// void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);
export const enum PROT {
    NONE    = 0, // Pages may not be accessed.
    READ    = 1, // Pages may be read.
    WRITE   = 2, // Pages may be written.
    EXEC    = 4, // Pages may be executed.
}

export const enum MAP {
    WRITE = 2, // Pages may be written.
    SHARED = 0,
    PRIVATE = 0,
    '32BIT' = 64,
    ANON = 32,
    ANONYMOUS = 32,
    DENYWRITE = 2048,
    EXECUTABLE = 409,
    'FILE' = 0,
    FIXED = 16,
    GROWSDOWN = 256,
    HUGETLB = 262144,
    HUGE_SHIFT = 26,
    LOCKED = 8192,
    NONBLOCK = 65536,
    NORESERVE = 1638,
    POPULATE = 32768,
    STACK = 131072,
}

export function mmap(addr: number, length: number, prot: number, flags: number, fd: number, offset: number): number {
    return sys.syscall(N.mmap, length, prot, flags, fd, offset);
}

// int munmap(void *addr, size_t length);
export function munmap() {

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

/* Protocol families. */
export const enum PF {
    UNSPEC = 0,	/* Unspecified.  */
    LOCAL = 1,	/* Local to host (pipes and file-domain).  */
    UNIX = PF.LOCAL, /* POSIX name for PF_LOCAL.  */
    FILE = PF.LOCAL, /* Another non-standard name for PF_LOCAL.  */
    INET = 2,	/* IP protocol family.  */
    AX25 = 3,	/* Amateur Radio AX.25.  */
    IPX = 4,	/* Novell Internet Protocol.  */
    APPLETALK = 5,	/* Appletalk DDP.  */
    NETROM = 6,	/* Amateur radio NetROM.  */
    BRIDGE = 7,	/* Multiprotocol bridge.  */
    ATMPVC = 8,	/* ATM PVCs.  */
    X25 = 9,	/* Reserved for X.25 project.  */
    INET6 = 10,	/* IP version 6.  */
    ROSE = 11,	/* Amateur Radio X.25 PLP.  */
    DECnet = 12,	/* Reserved for DECnet project.  */
    NETBEUI = 13,	/* Reserved for 802.2LLC project.  */
    SECURITY = 14,	/* Security callback pseudo AF.  */
    KEY = 15,	/* PF_KEY key management API.  */
    NETLINK = 16,
    ROUTE = PF.NETLINK, /* Alias to emulate 4.4BSD.  */
    PACKET = 17,	/* Packet family.  */
    ASH = 18,	/* Ash.  */
    ECONET = 19,	/* Acorn Econet.  */
    ATMSVC = 20,	/* ATM SVCs.  */
    RDS = 21,	/* RDS sockets.  */
    SNA = 22,	/* Linux SNA Project */
    IRDA = 23,	/* IRDA sockets.  */
    PPPOX = 24,	/* PPPoX sockets.  */
    WANPIPE = 25,	/* Wanpipe API sockets.  */
    LLC = 26,	/* Linux LLC.  */
    CAN = 29,	/* Controller Area Network.  */
    TIPC = 30,	/* TIPC sockets.  */
    BLUETOOTH = 31,	/* Bluetooth sockets.  */
    IUCV = 32,	/* IUCV sockets.  */
    RXRPC = 33,	/* RxRPC sockets.  */
    ISDN = 34,	/* mISDN sockets.  */
    PHONET = 35,	/* Phonet sockets.  */
    IEEE802154 = 36,	/* IEEE 802.15.4 sockets.  */
    CAIF = 37,	/* CAIF sockets.  */
    ALG = 38,	/* Algorithm sockets.  */
    NFC = 39,	/* NFC sockets.  */
    VSOCK = 40,	/* vSockets.  */
    MAX = 41,	/* For now..  */
}

/* Address families.  */
export const enum AF {
    UNSPEC = PF.UNSPEC,
    LOCAL = PF.LOCAL,
    UNIX = PF.UNIX,
    FILE = PF.FILE,
    INET = PF.INET,
    AX25 = PF.AX25,
    IPX = PF.IPX,
    APPLETALK = PF.APPLETALK,
    NETROM = PF.NETROM,
    BRIDGE = PF.BRIDGE,
    ATMPVC = PF.ATMPVC,
    X25 = PF.X25,
    INET6 = PF.INET6,
    ROSE = PF.ROSE,
    DECnet = PF.DECnet,
    NETBEUI = PF.NETBEUI,
    SECURITY = PF.SECURITY,
    KEY = PF.KEY,
    NETLINK = PF.NETLINK,
    ROUTE = PF.ROUTE,
    PACKET = PF.PACKET,
    ASH = PF.ASH,
    ECONET = PF.ECONET,
    ATMSVC = PF.ATMSVC,
    RDS = PF.RDS,
    SNA = PF.SNA,
    IRDA = PF.IRDA,
    PPPOX = PF.PPPOX,
    WANPIPE = PF.WANPIPE,
    LLC = PF.LLC,
    CAN = PF.CAN,
    TIPC = PF.TIPC,
    BLUETOOTH = PF.BLUETOOTH,
    IUCV = PF.IUCV,
    RXRPC = PF.RXRPC,
    ISDN = PF.ISDN,
    PHONET = PF.PHONET,
    IEEE802154 = PF.IEEE802154,
    CAIF = PF.CAIF,
    ALG = PF.ALG,
    NFC = PF.NFC,
    VSOCK = PF.VSOCK,
    MAX = PF.MAX
}

export const enum SOCK {
    STREAM = 1,
    DGRAM = 2,
    SEQPACKET = 5,
    RAW = 3,
    RDM = 4,
    PACKET = 10,
    NONBLOCK = 2048,
    CLOEXEC = 524288,
}
// int socket(int domain, int type, int protocol);
export function socket(domain: AF, type: SOCK, protocol: number): number {
    return sys.syscall(N.socket, domain, type, protocol);
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


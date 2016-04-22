import {Type, Arr, Struct} from '../../typebase';
import {Ipv4} from '../../socket';
import * as posix from '../../posix';


var buf = Buffer.prototype;
export var int8    = Type.define(1, buf.readInt8,       buf.writeInt8);
export var uint8   = Type.define(1, buf.readUInt8,      buf.readUInt8);
export var int16   = Type.define(2, buf.readInt16LE,    buf.writeInt16LE);
export var uint16  = Type.define(2, buf.readUInt16LE,   buf.writeUInt16LE);
export var int32   = Type.define(4, buf.readInt32LE,    buf.writeInt32LE);
export var uint32  = Type.define(4, buf.readUInt32LE,   buf.writeUInt32LE);


// http://man7.org/linux/man-pages/man2/mmap.2.html
// void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);
// "Everyone needs protection"
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


// http://lxr.free-electrons.com/source/include/uapi/asm-generic/fcntl.h#L19
export const enum FLAG {
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


export const enum MODE {
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


// <asm/stat.h> line 82:
// struct stat {
//     __kernel_ulong_t	st_dev;
//     __kernel_ulong_t	st_ino;
//     __kernel_ulong_t	st_nlink;
//
//     unsigned int		st_mode;
//     unsigned int		st_uid;
//     unsigned int		st_gid;
//     unsigned int		__pad0;
//     __kernel_ulong_t	st_rdev;
//     __kernel_long_t		st_size;
//     __kernel_long_t		st_blksize;
//     __kernel_long_t		st_blocks;	/* Number 512-byte blocks allocated. */
//
//     __kernel_ulong_t	st_atime;
//     __kernel_ulong_t	st_atime_nsec;
//     __kernel_ulong_t	st_mtime;
//     __kernel_ulong_t	st_mtime_nsec;
//     __kernel_ulong_t	st_ctime;
//     __kernel_ulong_t	st_ctime_nsec;
//     __kernel_long_t		__unused[3];
// };
// __kernel_ulong_t = unsigned long long // 64+ bits
// __kernel_long_t = long long // 64+ bits
// unsigned int // 32+ bits
// Total: 64 * 14 + 32 * 4 = 896 + 128 = 1024
export var stat = Struct.define(31 * 4, [
    [0, uint32, 'dev'],
    // dev_hi:         [1 * 4,     buffer.int32],
    [2 * 4, uint32, 'ino'],
    // ino_hi:         [3 * 4,     buffer.int32],
    [4 * 4, uint32, 'nlink'],
    // nlink_hi:       [5 * 4,     buffer.int32],

    [6 * 4, int32, 'mode'],
    [7 * 4, int32, 'uid'],
    [8 * 4, int32, 'gid'],
    // __pad0:         [9 * 4,     buffer.int32],

    [10 * 4, uint32, 'rdev'],
    // rdev_hi:        [11 * 4,    buffer.int32],
    [12 * 4, uint32, 'size'],
    // size_hi:        [13 * 4,    buffer.int32],
    [14 * 4, uint32, 'blksize'],
    // blksize_hi:     [15 * 4,    buffer.int32],
    [16 * 4, uint32, 'blocks'],
    // blocks_hi:      [17 * 4,    buffer.int32],
    [18 * 4, uint32, 'atime'],
    // atime_hi:       [19 * 4,    buffer.int32],
    [20 * 4, uint32, 'atime_nsec'],
    // atime_nsec_hi:  [21 * 4,    buffer.int32],
    [22 * 4, uint32, 'mtime'],
    // mtime_hi:       [23 * 4,    buffer.int32],
    [24 * 4, uint32, 'mtime_nsec'],
    // mtime_nsec_hi:  [25 * 4,    buffer.int32],
    [26 * 4, uint32, 'ctime'],
    // ctime_hi:       [27 * 4,    buffer.int32],
    [28 * 4, uint32, 'ctime_nsec'],
    // ctime_nsec_hi:  [29 * 4,    buffer.int32],
    // __unused:       [30 * 4,    buffer.int32],
]);

export interface stat {
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


// http://beej.us/guide/bgnet/output/html/multipage/index.html

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

// http://beej.us/guide/bgnet/output/html/multipage/sockaddr_inman.html
// struct sockaddr_in {
//     short            sin_family;   // e.g. AF_INET
//     unsigned short   sin_port;     // e.g. htons(3490)
//     struct in_addr   sin_addr;     // see struct in_addr, below
//     char             sin_zero[8];  // zero this if you want to
// };
//
//     struct in_addr {
//     unsigned long s_addr;  // load with inet_aton()
// };
export var in_addr = Struct.define(4, [
    [0, uint32, 's_addr'], // load with inet_aton()
]);

export interface in_addr {
    s_addr: Ipv4;
}

export var sockaddr_in = Struct.define(16, [
    [0, int16, 'sin_family'], // e.g. AF_INET
    [2, uint16, 'sin_port'], // htons(3490);
    [4, in_addr, 'sin_addr'],
    [8, Arr.define(int8, 8), 'sin_zero'],
]);

export interface sockaddr_in {
    sin_family: AF;
    sin_port: number;
    sin_addr: in_addr;
    sin_zero?: number[];
}
// IPv6 AF_INET6 sockets:
// struct sockaddr_in6 {
//     u_int16_t       sin6_family;   // address family, AF_INET6
//     u_int16_t       sin6_port;     // port number, Network Byte Order
//     u_int32_t       sin6_flowinfo; // IPv6 flow information
//     struct in6_addr sin6_addr;     // IPv6 address
//     u_int32_t       sin6_scope_id; // Scope ID
// };
// struct in6_addr {
//     unsigned char   s6_addr[16];   // load with inet_pton()
// };

// struct sockaddr {
//     sa_family_t sa_family;
//     char        sa_data[14];
// }
export var sockaddr = Struct.define(1, [
    [0, 'sa_family', uint16],
    [2, 'sa_data', Arr.define(int8, 14)],
]);

export interface sockaddr {
    sa_family: AF;      // address family, AF_xxx
    sa_data: number[];  // 14 bytes of protocol address
}

export const enum ERROR {
    EACCES = 13, // The address is protected, and the user is not the superuser.
    EADDRINUSE = 98, // The given address is already in use.
    EBADF = 9, // sockfd is not a valid descriptor.
    EINVAL = 22, // The socket is already bound to an address.
    ENOTSOCK = 88, // `sockfd` is a descriptor for a file, not a socket.

    // The following errors are specific to UNIX domain (AF_UNIX) sockets:
    // EACCES, // Search permission is denied on a component of the path prefix. (See also path_resolution(2).)
    EADDRNOTAVAIL = 99, // A non-existent interface was requested or the requested address was not local.
    EFAULT = 14, // `my_addr` points outside the user’s accessible address space.
    // EINVAL, // The addrlen is wrong, or the socket was not in the AF_UNIX family.
    ELOOP = 40, // Too many symbolic links were encountered in resolving my_addr.
    ENAMETOOLONG = 36, // `my_addr` is too long.
    ENOENT = 2, // The file does not exist.
    ENOMEM = 12, // Insufficient kernel memory was available.
    ENOTDIR = 20, // A component of the path prefix is not a directory.
    EROFS = 30,

    // More socket errors:
    EAGAIN = 11,
    EWOULDBLOCK = 11,
    ECONNREFUSED = 111,
    EINTR = 4,
    ENOTCONN = 107,
}


// See: man recv
export const enum MSG {
    CMSG_CLOEXEC = 1073741824,
    DONTWAIT = 64,
    ERRQUEUE = 8192,
    OOB = 1,
    PEEK = 2,
    TRUNC = 32,
    WAITALL = 256,
}

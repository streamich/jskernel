// # x86_64 Linux

import {Type, Arr, Struct} from '../../typebase';
import {Ipv4} from '../../socket';
import {t_pointer} from "../../../libmem/struct";

// The C `NULL` pointer:
export const NULL = 0;

// Basic types.
var buf = Buffer.prototype;
export var int8    = Type.define(1, buf.readInt8,       buf.writeInt8);
export var uint8   = Type.define(1, buf.readUInt8,      buf.readUInt8);
export var int16   = Type.define(2, buf.readInt16LE,    buf.writeInt16LE);
export var uint16  = Type.define(2, buf.readUInt16LE,   buf.writeUInt16LE);
export var int32   = Type.define(4, buf.readInt32LE,    buf.writeInt32LE);
export var uint32  = Type.define(4, buf.readUInt32LE,   buf.writeUInt32LE);
export var int64   = Arr.define(int32, 2);
export var uint64  = Arr.define(uint32, 2);
export var size_t = uint64;
export var time_t = uint64;
export var pid_t = uint32;
export var ipv4    = Type.define(4,
    function (offset: number = 0) {
        var buf = this as Buffer;
        var socket = require('../../socket');
        var octets = socket.Ipv4.type.unpack(buf, offset);
        return new socket.Ipv4(octets);
    }, function (data: Ipv4, offset: number = 0) {
        var buf = this as Buffer;
        data.toBuffer().copy(buf, offset);
    });

export type uint64 = [number, number];
export var pointer_t = uint64;
export type pointer_t = uint64;


// Constants used in `mmap` system calls, see [mmap(2)](http://man7.org/linux/man-pages/man2/mmap.2.html).

export const enum PROT {
    NONE    = 0, // Pages may not be accessed.
    READ    = 1, // Pages may be read.
    WRITE   = 2, // Pages may be written.
    EXEC    = 4, // Pages may be executed.
}

export const enum MAP {
    'FILE' = 0,
    SHARED = 1,
    PRIVATE = 2,
    '32BIT' = 64,
    ANON = 32,
    ANONYMOUS = 32,
    DENYWRITE = 2048,
    EXECUTABLE = 409,
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


// Constants used in `open` system calls, see [open(2)](http://man7.org/linux/man-pages/man2/open.2.html).

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
    O_SYNC          = 1052672,
    O_NDELAY        = 2048,
}

export const enum S {
    IFMT = 61440,   // type of file
    IFBLK = 24576,  // block special
    IFCHR = 8192,   // character special
    IFIFO = 4096,   // FIFO special
    IFREG = 32768,  // regular
    IFDIR = 16384,  // directory
    IFLNK = 40960,  // symbolic link
    IFSOCK = 49152, // socket

    IRWXU = 448,    // read, write, execute/search by owner
    IRUSR = 256,    // read permission, owner
    IWUSR = 128,    // write permission, owner
    IXUSR = 64,     // execute/search permission, owner
    IRWXG = 56,     // read, write, execute/search by group
    IRGRP = 32,     // read permission, group
    IWGRP = 16,     // write permission, group
    IXGRP = 8,      // execute/search permission, group
    IRWXO = 7,      // read, write, execute/search by others
    IROTH = 4,      // read permission, others
    IWOTH = 2,      // write permission, others
    IXOTH = 1,      // execute/search permission, others
    ISUID = 2048,   // set-user-ID on execution
    ISGID = 1024,   // set-group-ID on execution
    ISVTX = 512,    // on directories, restricted deletion flag
}


// Constants used in `access` system call, see [access(2)](http://man7.org/linux/man-pages/man2/faccessat.2.html).

export const enum AMODE {
    F_OK = 0,
    X_OK = 1,
    W_OK = 2,
    R_OK = 4,
}


// Constants used in `lseek` system calls, see [lseek(2)](http://man7.org/linux/man-pages/man2/lseek.2.html).

export const enum SEEK {
    CUR = 1,
    END = 2,
    SET = 0,
}


// See <asm/stat.h> line 82:
//
//     __kernel_ulong_t = unsigned long long // 64+ bits
//     __kernel_long_t = long long // 64+ bits
//     unsigned int // 32+ bits
//
// In `libc`:
//
//     struct stat {
//         __kernel_ulong_t	st_dev;
//         __kernel_ulong_t	st_ino;
//         __kernel_ulong_t	st_nlink;
//         unsigned int		st_mode;
//         unsigned int		st_uid;
//         unsigned int		st_gid;
//         unsigned int		__pad0;
//         __kernel_ulong_t	st_rdev;
//         __kernel_long_t		st_size;
//         __kernel_long_t		st_blksize;
//         __kernel_long_t		st_blocks;	// Number 512-byte blocks allocated.
//         __kernel_ulong_t	st_atime;
//         __kernel_ulong_t	st_atime_nsec;
//         __kernel_ulong_t	st_mtime;
//         __kernel_ulong_t	st_mtime_nsec;
//         __kernel_ulong_t	st_ctime;
//         __kernel_ulong_t	st_ctime_nsec;
//         __kernel_long_t		__unused[3];
//     };

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


// Protocol families.
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

// Address families.
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

    // accept4
    NONBLOCK = 2048,
    CLOEXEC = 524288,
}


// From http://beej.us/guide/bgnet/output/html/multipage/sockaddr_inman.html
//
//     struct sockaddr_in {
//         short            sin_family;   // e.g. AF_INET
//         unsigned short   sin_port;     // e.g. htons(3490)
//         struct in_addr   sin_addr;     // see struct in_addr, below
//         char             sin_zero[8];  // zero this if you want to
//     };
//     struct in_addr {
//         unsigned long s_addr;  // load with inet_aton()
//     };

export var in_addr = Struct.define(4, [
    [0, ipv4, 's_addr'], // load with inet_aton()
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
//
//     struct sockaddr_in6 {
//         u_int16_t       sin6_family;   // address family, AF_INET6
//         u_int16_t       sin6_port;     // port number, Network Byte Order
//         u_int32_t       sin6_flowinfo; // IPv6 flow information
//         struct in6_addr sin6_addr;     // IPv6 address
//         u_int32_t       sin6_scope_id; // Scope ID
//     };
//     struct in6_addr {
//         unsigned char   s6_addr[16];   // load with inet_pton()
//     };
//     struct sockaddr {
//         sa_family_t sa_family;
//         char        sa_data[14];
//     }

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


    E2BIG = 7,
    EAFNOSUPPORT = 97,
    EBADE = 52,
    EBADFD = 77,
    EBADMSG = 74,
    EBADR = 53,
    EBADRQC = 56,
    EBADSLT = 57,
    EBUSY = 16,
    ECANCELED = 125,
    ECHILD = 10,
    ECHRNG = 44,
    ECOMM = 70,
    ECONNABORTED = 103,
    ECONNRESET = 104,
    EDEADLK = 35,
    EDEADLOCK = 35,
    EDESTADDRREQ = 89,
    EDOM = 33,
    EDQUOT = 122,
    EEXIST = 17,
    EFBIG = 27,
    EHOSTDOWN = 112,
    EHOSTUNREACH = 113,
    EIDRM = 43,
    EILSEQ = 84,
    EINPROGRESS = 115,
    EIO = 5,
    EISCONN = 106,
    EISDIR = 21,
    EISNAM = 120,
    EKEYEXPIRED = 127,
    EKEYREJECTED = 129,
    EKEYREVOKED = 128,
    EL2HLT = 51,
    EL2NSYNC = 45,
    EL3HLT = 46,
    EL3RST = 47,
    ELIBACC = 79,
    ELIBBAD = 80,
    ELIBMAX = 82,
    ELIBSCN = 81,
    ELIBEXEC = 83,
    EMEDIUMTYPE = 124,
    EMFILE = 24,
    EMLINK = 31,
    EMSGSIZE = 90,
    EMULTIHOP = 72,
    ENETDOWN = 100,
    ENETRESET = 102,
    ENETUNREACH = 101,
    ENFILE = 23,
    ENOBUFS = 105,
    ENODATA = 61,
    ENODEV = 19,
    ENOEXEC = 8,
    ENOKEY = 126,
    ENOLCK = 37,
    ENOLINK = 67,
    ENOMEDIUM = 123,
    ENOMSG = 42,
    ENONET = 64,
    ENOPKG = 65,
    ENOPROTOOPT = 92,
    ENOSPC = 28,
    ENOSR = 63,
    ENOSTR = 60,
    ENOSYS = 38,
    ENOTBLK = 15,
    ENOTEMPTY = 39,
    ENOTSUP = 95,
    ENOTTY = 25,
    ENOTUNIQ = 76,
    ENXIO = 6,
    EOPNOTSUPP = 95,
    EOVERFLOW = 75,
    EPERM = 1,
    EPFNOSUPPORT = 96,
    EPIPE = 32,
    EPROTO = 71,
    EPROTONOSUPPORT = 93,
    EPROTOTYPE = 91,
    ERANGE = 34,
    EREMCHG = 78,
    EREMOTE = 66,
    EREMOTEIO = 121,
    ERESTART = 85,
    ESHUTDOWN = 108,
    ESPIPE = 29,
    ESOCKTNOSUPPORT = 94,
    ESRCH = 3,
    ESTALE = 116,
    ESTRPIPE = 86,
    ETIME = 62,
    ETIMEDOUT = 110,
    ETXTBSY = 26,
    EUCLEAN = 117,
    EUNATCH = 49,
    EUSERS = 87,
    EXDEV = 18,
    EXFULL = 54,
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
    NOSIGNAL = 16384,
}

export const enum SHUT {
    RD = 0,		/* No more receptions.  */
    WR,		/* No more transmissions.  */
    RDWR,		/* No more receptions or transmissions.  */
}


export const enum EPOLL_EVENTS {
    EPOLLIN = 1,
    EPOLLOUT = 4,
    EPOLLRDHUP = 8192,
    EPOLLPRI = 2,
    EPOLLERR = 8,
    EPOLLHUP = 16,
    EPOLLET = 2147483648,
    EPOLLONESHOT = 1073741824,
    EPOLLWAKEUP = 536870912,
}




export const enum EPOLL {
    CLOEXEC = 524288, // Set the close-on-exec (FD_CLOEXEC) flag on the new file descriptor.  See the description of the O_CLOEXEC flag in open(2) for reasons why this may be useful.
}

export const enum EPOLL_CTL {
    ADD = 1,
    MOD = 3,
    DEL = 2,
}

//     typedef union epoll_data {
//         void    *ptr;
//         int      fd;
//         uint32_t u32;
//         uint64_t u64;
//     } epoll_data_t;
//
//     struct epoll_event {
//         uint32_t     events;    /* Epoll events */
//         epoll_data_t data;      /* User data variable */
//     };

export var epoll_event = Struct.define(4 + 8, [
    [0, uint32, 'events'],
    [4, uint64, 'data'],
]);

export interface epoll_event {
    events: EPOLL_EVENTS;
    data: [number, number];
}

export const enum FCNTL {
    GETFL = 3,
    SETFL = 4,
}


// Used in shmget, can be bitwise orred with file flags.
export const enum IPC {
    RMID = 0,
    SET = 1,
    STAT = 2,
    INFO = 3,
    CREAT = 512,
    EXCL = 1024,
}

export const enum SHM {
    INFO = 14,
    STAT = 13,
    LOCK = 11,
    UNLOCK = 12,
    R = 256,
    W = 128,
    RDONLY = 4096,
    RND = 8192,
    REMAP = 16384,
    EXEC = 32768,
    DEST = 512,
    LOCKED = 1024,
    HUGETLB = 2048,
    NORESERVE = 4096,
}


export const enum FD {
    CLOEXEC = 1,
}


// In `libc`, <bits/ipc.h> line 42:
//
//     struct ipc_perm {
//         __key_t __key;			// Key.
//         __uid_t uid;			// Owner's user ID.
//         __gid_t gid;			// Owner's group ID.
//         __uid_t cuid;			// Creator's user ID.
//         __gid_t cgid;			// Creator's group ID.
//         unsigned short int mode;		// Read/write permission.
//         unsigned short int __pad1;
//         unsigned short int __seq;		// Sequence number.
//         unsigned short int __pad2;
//         __syscall_ulong_t __glibc_reserved1;
//         __syscall_ulong_t __glibc_reserved2;
//     };
//
// __syscall_ulong_t` is `unsigned long long int`

export var ipc_perm = Struct.define(48, [ // It is 48 for some reason.
    [0, int32, '__key'],
    [4, uint32, 'uid'],
    [8, uint32, 'gid'],
    [12, uint32, 'cuid'],
    [16, uint32, 'cgid'],
    [20, uint16, 'mode'],
    // [22, uint16, '__pad1'],
    [24, uint16, '__seq'],
    // [26, uint16, '__pad2'],
    // [28, uint64, '__glibc_reserved1'],
    // [36, uint64, '__glibc_reserved2'],
]);

export interface ipc_perm {
    __key: number;
    uid: number;
    gid: number;
    cuid: number;
    cgid: number;
    mode: number;
    __seq: number;
}

// In `libc`, <bits/shm.h> line 49:
//
//     struct shmid_ds {
//         struct ipc_perm shm_perm;		// operation permission struct
//         size_t shm_segsz;			// size of segment in bytes
//         __time_t shm_atime;			// time of last shmat()
//     #ifndef __x86_64__
//         unsigned long int __glibc_reserved1;
//     #endif
//         __time_t shm_dtime;			// time of last shmdt()
//     #ifndef __x86_64__
//         unsigned long int __glibc_reserved2;
//     #endif
//         __time_t shm_ctime;			// time of last change by shmctl()
//     #ifndef __x86_64__
//         unsigned long int __glibc_reserved3;
//     #endif
//         __pid_t shm_cpid;			// pid of creator
//         __pid_t shm_lpid;			// pid of last shmop
//         shmatt_t shm_nattch;		// number of current attaches
//         __syscall_ulong_t __glibc_reserved4;
//         __syscall_ulong_t __glibc_reserved5;
//     };
//
// From internet:
//
//     struct shmid_ds {
//         struct ipc_perm shm_perm;    // Ownership and permissions
//         size_t          shm_segsz;   // Size of segment (bytes)
//         time_t          shm_atime;   // Last attach time
//         time_t          shm_dtime;   // Last detach time
//         time_t          shm_ctime;   // Last change time
//         pid_t           shm_cpid;    // PID of creator
//         pid_t           shm_lpid;    // PID of last shmat(2)/shmdt(2)
//         shmatt_t        shm_nattch;  // No. of current attaches
//         // ...
//     };

export var shmid_ds = Struct.define(112, [
    [0, ipc_perm, 'shm_perm'],  // 48
    [48, size_t, 'shm_segsz'],  // 8
    [56, time_t, 'shm_atime'],  // 8
    [64, time_t, 'shm_dtime'], // 8
    [72, time_t, 'shm_ctime'], // 8
    [80, pid_t, 'shm_cpid'], // 4
    [84, pid_t, 'shm_lpid'], // 4
    [88, uint64, 'shm_nattch'], // 8
    // [96, uint64, '__glibc_reserved4'], // 8
    // [104, uint64, '__glibc_reserved5'], // 8 //// 112
]);

export interface shmid_ds {
    shm_perm: ipc_perm;
    shm_segsz: [number, number];
    shm_atime: [number, number];
    shm_dtime: [number, number];
    shm_ctime: [number, number];
    shm_cpid: number;
    shm_lpid: number;
    shm_nattch: [number, number];
}


// ## Time
//
//     struct utimbuf {
//         time_t actime;       /* access time */
//         time_t modtime;      /* modification time */
//     };

export var utimbuf = Struct.define(16, [
    [0, uint64, 'actime'], // access time
    [8, uint64, 'modtime'], // modification time
]);

export type numberLo = number;
export type numberHi = number;

export interface utimbuf {
    actime:     [numberLo, numberHi],
    modtime:    [numberLo, numberHi],
}

export var timeval = Struct.define(16, [
    [0, uint64, 'tv_sec'], // access time
    [8, uint64, 'tv_nsec'], // modification time
]);

export interface timeval {
    tv_sec:     [numberLo, numberHi],
    tv_nsec:    [numberLo, numberHi],
}

export var timevalarr = Arr.define(timeval, 2);

export type timevalarr = [timeval, timeval];

export var timespec = timeval;
export var timespecarr = timevalarr;
export interface timespec extends timeval {}
export type timespecarr = [timespec, timespec];



// ## Directories

export const enum DT {
    BLK = 6,        // This is a block device.
    CHR = 2,        // This is a character device.
    DIR = 4,        // This is a directory.
    FIFO = 1,       // This is a named pipe (FIFO).
    LNK = 10,       // This is a symbolic link.
    REG = 8,        // This is a regular file.
    SOCK = 12,      // This is a UNIX domain socket.
    UNKNOWN = 0,    // The file type is unknown.
}

//     struct linux_dirent64 {
//         ino64_t        d_ino;    /* 64-bit inode number */
//         off64_t        d_off;    /* 64-bit offset to next structure */
//         unsigned short d_reclen; /* Size of this dirent */
//         unsigned char  d_type;   /* File type */
//         char           d_name[]; /* Filename (null-terminated) */
//     };

export var linux_dirent64 = Struct.define(19, [ // 20+ bytes, 19 + null-terminated string.
    [0, uint64, 'ino64_t'],
    [8, uint64, 'off64_t'],
    [16, uint16, 'd_reclen'],
    [18, uint8, 'd_type'],
]);



// ## inotify

// Supported events suitable for MASK parameter of `inotify_init1` and `inotify_add_watch`.
export const enum IN {
    /* Flags set in `inotify_init1`. */
    CLOEXEC             = 524288,
    NONBLOCK            = 2048,

    /* Events set in `inotify_add_watch` */
    ACCESS              = 0x00000001,       /* File was accessed. */
    MODIFY              = 0x00000002,	    /* File was modified. */
    ATTRIB              = 0x00000004,	    /* Metadata changed. */
    CLOSE_WRITE	        = 0x00000008,	    /* Writtable file was closed. */
    CLOSE_NOWRITE       = 0x00000010,	    /* Unwrittable file closed. */
    OPEN                = 0x00000020,	    /* File was opened. */
    MOVED_FROM	        = 0x00000040,	    /* File was moved from X. */
    MOVED_TO            = 0x00000080,	    /* File was moved to Y. */
    CREATE              = 0x00000100,	    /* Subfile was created. */
    DELETE              = 0x00000200,       /* Subfile was deleted. */
    DELETE_SELF         = 0x00000400,       /* Self was deleted. */
    MOVE_SELF           = 0x00000800,       /* Self was moved. */

    /* Events sent by the kernel. */
    UNMOUNT             = 0x00002000,       /* Backing fs was unmounted. */
    Q_OVERFLOW          = 0x00004000,       /* Event queued overflowed. */
    IGNORED             = 0x00008000,       /* File was ignored. */

    /* Helper events. */
    CLOSE	            = IN.CLOSE_WRITE | IN.CLOSE_NOWRITE,    /* Close. */
    MOVE                = IN.MOVED_FROM | IN.MOVED_TO,          /* Moves. */

    /* Special flags. */
    ONLYDIR             = 0x01000000,       /* Only watch path if it is dir. */
    DONT_FOLLOW         = 0x02000000,       /* Do not follow a sym link. */
    EXCL_UNLINK         = 0x04000000,       /* Exclude events on unlinked objects. */
    MASK_ADD            = 0x20000000,       /* Add to mask of an existing watch. */
    ISDIR               = 0x40000000,       /* Event occurred against dir. */
    ONESHOT             = 0x80000000,       /* Only send event once. */

    /* All events which a program can wait on. */
    ALL_EVENTS = IN.ACCESS | IN.MODIFY | IN.ATTRIB | IN.CLOSE_WRITE |
        IN.CLOSE_NOWRITE | IN.OPEN | IN.MOVED_FROM | IN.MOVED_TO |
        IN.CREATE | IN.DELETE	| IN.DELETE_SELF | IN.MOVE_SELF,
}

// Stucture that `inotify` returns when reading from one of its descriptors, in `libc`:
//
//     struct inotify_event {
//         int      wd;       /* Watch descriptor */
//         uint32_t mask;     /* Mask describing event */
//         uint32_t cookie;   /* Unique cookie associating related events (for rename(2)) */
//         uint32_t len;      /* Size of name field */
//         char     name[];   /* Optional null-terminated name */
//     };
//
// We create a representation of this struct in JavaScript:

export var inotify_event = Struct.define(16, [
    [0, int32, 'wd'],
    [4, uint32, 'mask'],
    [8, uint32, 'cookie'],
    [12, uint32, 'len'],
    /* [16, Arr.define(int8, 0), 'name'], */
]);

// And *TypeScript* type definition:

export interface inotify_event {
    wd: number;
    mask: number;
    cookie: number;
    len: number;
    name?: string;
}


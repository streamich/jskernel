import { Type, Arr, Struct } from '../../typebase';
import { Ipv4 } from '../../socket';
export declare const NULL: number;
export declare var int8: Type;
export declare var uint8: Type;
export declare var int16: Type;
export declare var uint16: Type;
export declare var int32: Type;
export declare var uint32: Type;
export declare var int64: Arr;
export declare var uint64: Arr;
export declare var size_t: Arr;
export declare var time_t: Arr;
export declare var pid_t: Type;
export declare var ipv4: Type;
export declare type uint64 = [number, number];
export declare var pointer_t: Arr;
export declare type pointer_t = uint64;
export declare const enum PROT {
    NONE = 0,
    READ = 1,
    WRITE = 2,
    EXEC = 4,
}
export declare const enum MAP {
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
export declare const enum FLAG {
    O_RDONLY = 0,
    O_WRONLY = 1,
    O_RDWR = 2,
    O_ACCMODE = 3,
    O_CREAT = 64,
    O_EXCL = 128,
    O_NOCTTY = 256,
    O_TRUNC = 512,
    O_APPEND = 1024,
    O_NONBLOCK = 2048,
    O_DSYNC = 4096,
    FASYNC = 8192,
    O_DIRECT = 16384,
    O_LARGEFILE = 0,
    O_DIRECTORY = 65536,
    O_NOFOLLOW = 131072,
    O_NOATIME = 262144,
    O_CLOEXEC = 524288,
    O_SYNC = 1052672,
    O_NDELAY = 2048,
}
export declare const enum S {
    IFMT = 61440,
    IFBLK = 24576,
    IFCHR = 8192,
    IFIFO = 4096,
    IFREG = 32768,
    IFDIR = 16384,
    IFLNK = 40960,
    IFSOCK = 49152,
    IRWXU = 448,
    IRUSR = 256,
    IWUSR = 128,
    IXUSR = 64,
    IRWXG = 56,
    IRGRP = 32,
    IWGRP = 16,
    IXGRP = 8,
    IRWXO = 7,
    IROTH = 4,
    IWOTH = 2,
    IXOTH = 1,
    ISUID = 2048,
    ISGID = 1024,
    ISVTX = 512,
}
export declare const enum AMODE {
    F_OK = 0,
    X_OK = 1,
    W_OK = 2,
    R_OK = 4,
}
export declare const enum SEEK {
    CUR = 1,
    END = 2,
    SET = 0,
}
export declare var stat: Struct;
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
export declare const enum PF {
    UNSPEC = 0,
    LOCAL = 1,
    UNIX = 1,
    FILE = 1,
    INET = 2,
    AX25 = 3,
    IPX = 4,
    APPLETALK = 5,
    NETROM = 6,
    BRIDGE = 7,
    ATMPVC = 8,
    X25 = 9,
    INET6 = 10,
    ROSE = 11,
    DECnet = 12,
    NETBEUI = 13,
    SECURITY = 14,
    KEY = 15,
    NETLINK = 16,
    ROUTE = 16,
    PACKET = 17,
    ASH = 18,
    ECONET = 19,
    ATMSVC = 20,
    RDS = 21,
    SNA = 22,
    IRDA = 23,
    PPPOX = 24,
    WANPIPE = 25,
    LLC = 26,
    CAN = 29,
    TIPC = 30,
    BLUETOOTH = 31,
    IUCV = 32,
    RXRPC = 33,
    ISDN = 34,
    PHONET = 35,
    IEEE802154 = 36,
    CAIF = 37,
    ALG = 38,
    NFC = 39,
    VSOCK = 40,
    MAX = 41,
}
export declare const enum AF {
    UNSPEC = 0,
    LOCAL = 1,
    UNIX = 1,
    FILE = 1,
    INET = 2,
    AX25 = 3,
    IPX = 4,
    APPLETALK = 5,
    NETROM = 6,
    BRIDGE = 7,
    ATMPVC = 8,
    X25 = 9,
    INET6 = 10,
    ROSE = 11,
    DECnet = 12,
    NETBEUI = 13,
    SECURITY = 14,
    KEY = 15,
    NETLINK = 16,
    ROUTE = 16,
    PACKET = 17,
    ASH = 18,
    ECONET = 19,
    ATMSVC = 20,
    RDS = 21,
    SNA = 22,
    IRDA = 23,
    PPPOX = 24,
    WANPIPE = 25,
    LLC = 26,
    CAN = 29,
    TIPC = 30,
    BLUETOOTH = 31,
    IUCV = 32,
    RXRPC = 33,
    ISDN = 34,
    PHONET = 35,
    IEEE802154 = 36,
    CAIF = 37,
    ALG = 38,
    NFC = 39,
    VSOCK = 40,
    MAX = 41,
}
export declare const enum SOCK {
    STREAM = 1,
    DGRAM = 2,
    SEQPACKET = 5,
    RAW = 3,
    RDM = 4,
    PACKET = 10,
    NONBLOCK = 2048,
    CLOEXEC = 524288,
}
export declare var in_addr: Struct;
export interface in_addr {
    s_addr: Ipv4;
}
export declare var sockaddr_in: Struct;
export interface sockaddr_in {
    sin_family: AF;
    sin_port: number;
    sin_addr: in_addr;
    sin_zero?: number[];
}
export declare var sockaddr: Struct;
export interface sockaddr {
    sa_family: AF;
    sa_data: number[];
}
export declare const enum ERROR {
    EACCES = 13,
    EADDRINUSE = 98,
    EBADF = 9,
    EINVAL = 22,
    ENOTSOCK = 88,
    EADDRNOTAVAIL = 99,
    EFAULT = 14,
    ELOOP = 40,
    ENAMETOOLONG = 36,
    ENOENT = 2,
    ENOMEM = 12,
    ENOTDIR = 20,
    EROFS = 30,
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
export declare const enum MSG {
    CMSG_CLOEXEC = 1073741824,
    DONTWAIT = 64,
    ERRQUEUE = 8192,
    OOB = 1,
    PEEK = 2,
    TRUNC = 32,
    WAITALL = 256,
    NOSIGNAL = 16384,
}
export declare const enum SHUT {
    RD = 0,
    WR = 1,
    RDWR = 2,
}
export declare const enum EPOLL_EVENTS {
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
export declare const enum EPOLL {
    CLOEXEC = 524288,
}
export declare const enum EPOLL_CTL {
    ADD = 1,
    MOD = 3,
    DEL = 2,
}
export declare var epoll_event: Struct;
export interface epoll_event {
    events: EPOLL_EVENTS;
    data: [number, number];
}
export declare const enum FCNTL {
    GETFL = 3,
    SETFL = 4,
}
export declare const enum IPC {
    RMID = 0,
    SET = 1,
    STAT = 2,
    INFO = 3,
    CREAT = 512,
    EXCL = 1024,
}
export declare const enum SHM {
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
export declare const enum FD {
    CLOEXEC = 1,
}
export declare var ipc_perm: Struct;
export interface ipc_perm {
    __key: number;
    uid: number;
    gid: number;
    cuid: number;
    cgid: number;
    mode: number;
    __seq: number;
}
export declare var shmid_ds: Struct;
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
export declare var utimbuf: Struct;
export declare type numberLo = number;
export declare type numberHi = number;
export declare type number64 = [numberLo, numberHi];
export interface utimbuf {
    actime: [numberLo, numberHi];
    modtime: [numberLo, numberHi];
}
export declare var timeval: Struct;
export interface timeval {
    tv_sec: [numberLo, numberHi];
    tv_nsec: [numberLo, numberHi];
}
export declare var timevalarr: Arr;
export declare type timevalarr = [timeval, timeval];
export declare var timespec: Struct;
export declare var timespecarr: Arr;
export interface timespec extends timeval {
}
export declare type timespecarr = [timespec, timespec];
export declare const enum DT {
    BLK = 6,
    CHR = 2,
    DIR = 4,
    FIFO = 1,
    LNK = 10,
    REG = 8,
    SOCK = 12,
    UNKNOWN = 0,
}
export declare var linux_dirent64: Struct;
export declare const enum IN {
    CLOEXEC = 524288,
    NONBLOCK = 2048,
    ACCESS = 1,
    MODIFY = 2,
    ATTRIB = 4,
    CLOSE_WRITE = 8,
    CLOSE_NOWRITE = 16,
    OPEN = 32,
    MOVED_FROM = 64,
    MOVED_TO = 128,
    CREATE = 256,
    DELETE = 512,
    DELETE_SELF = 1024,
    MOVE_SELF = 2048,
    UNMOUNT = 8192,
    Q_OVERFLOW = 16384,
    IGNORED = 32768,
    CLOSE = 24,
    MOVE = 192,
    ONLYDIR = 16777216,
    DONT_FOLLOW = 33554432,
    EXCL_UNLINK = 67108864,
    MASK_ADD = 536870912,
    ISDIR = 1073741824,
    ONESHOT = 2147483648,
    ALL_EVENTS = 4095,
}
export declare var inotify_event: Struct;
export interface inotify_event {
    wd: number;
    mask: number;
    cookie: number;
    len: number;
    name?: string;
}

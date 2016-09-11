// # x86_64 Linux

import {Type, Arr, Struct} from '../typebase';
import {Ipv4} from '../socket';


export const PATH_MAX = 4096;

export const isLE = true;

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
export const optval_t = int32;
export var ipv4    = Type.define(4,
    function (offset: number = 0) {
        var buf = this as Buffer;
        var socket = require('../socket');
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

export var stat = Struct.define(32 * 4, [ // TODO: Check the correct size for this struct, this may be wrong.
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


export const enum IP {
    OPTIONS = 4, /* ip_opts; IP per-packet options.  */
    HDRINCL = 3, /* int; Header is included with data.  */
    TOS = 1, /* int; IP type of service and precedence.  */
    TTL = 2, /* int; IP time to live.  */
    RECVOPTS = 6, /* bool; Receive all IP options w/datagram.  */
    /* For BSD compatibility.  */
    RETOPTS = 7, /* ip_opts; Set/get IP per-packet options.  */
    RECVRETOPTS = IP.RETOPTS, /* bool; Receive IP options for response.  */
    MULTICAST_IF = 32, /* in_addr; set/get IP multicast i/f */
    MULTICAST_TTL = 33, /* u_char; set/get IP multicast ttl */
    MULTICAST_LOOP = 34, /* i_char; set/get IP multicast loopback */
    ADD_MEMBERSHIP = 35, /* ip_mreq; add an IP group membership */
    DROP_MEMBERSHIP = 36, /* ip_mreq; drop an IP group membership */
    UNBLOCK_SOURCE = 37, /* ip_mreq_source: unblock data from source */
    BLOCK_SOURCE = 38, /* ip_mreq_source: block data from source */
    ADD_SOURCE_MEMBERSHIP = 39, /* ip_mreq_source: join source group */
    DROP_SOURCE_MEMBERSHIP = 40, /* ip_mreq_source: leave source group */
    MSFILTER = 41,
    MULTICAST_ALL = 49,
    UNICAST_IF = 50,
    ROUTER_ALERT = 5, /* bool */
    PKTINFO = 8, /* bool */
    PKTOPTIONS = 9,
    PMTUDISC = 10, /* obsolete name? */
    MTU_DISCOVER = 10, /* int; see below */
    RECVERR = 11, /* bool */
    RECVTTL = 12, /* bool */
    RECVTOS = 13, /* bool */
    MTU = 14, /* int */
    FREEBIND = 15,
    IPSEC_POLICY = 16,
    XFRM_POLICY = 17,
    PASSSEC = 18,
    TRANSPARENT = 19,
    /* TProxy original addresses */
    ORIGDSTADDR = 20,
    RECVORIGDSTADDR = IP.ORIGDSTADDR,
    MINTTL = 21,
    /* IP_MTU_DISCOVER arguments.  */
    PMTUDISC_DONT = 0, /* Never send DF frames.  */
    PMTUDISC_WANT = 1, /* Use per route hints.  */
    PMTUDISC_DO = 2, /* Always DF.  */
    PMTUDISC_PROBE = 3, /* Ignore dst pmtu.  */

    DEFAULT_MULTICAST_TTL = 1,
    DEFAULT_MULTICAST_LOOP = 1,
    MAX_MEMBERSHIPS = 20,
}

export const enum MCAST {
    JOIN_GROUP = 42, /* group_req: join any-source group */
    BLOCK_SOURCE = 43, /* group_source_req: block from given group */
    UNBLOCK_SOURCE = 44, /* group_source_req: unblock from given group*/
    LEAVE_GROUP = 45, /* group_req: leave any-source group */
    JOIN_SOURCE_GROUP = 46, /* group_source_req: join source-spec gr */
    LEAVE_SOURCE_GROUP = 47, /* group_source_req: leave source-spec gr*/
    MSFILTER = 48,
    EXCLUDE = 0,
    INCLUDE = 1,
}

export const enum SOL {
    /* To select the IP level.  */
    IP = 0,
    /* Socket level values for IPv6.  */
    IPV6 = 41,
    ICMPV6 = 58,
    SOCKET = 0xFFFF,
}

export const enum SO {
    DEBUG = 0x0001,		    /* Record debugging information.  */
    ACCEPTCONN = 0x0002,	/* Accept connections on socket.  */
    REUSEADDR = 0x0004,	    /* Allow reuse of local addresses.  */
    KEEPALIVE = 0x0008,	    /* Keep connections alive and send SIGPIPE when they die.  */
    DONTROUTE = 0x0010,	    /* Don't do local routing.  */
    BROADCAST = 0x0020,	    /* Allow transmission of broadcast messages.  */
    USELOOPBACK = 0x0040,	/* Use the software loopback to avoidhardware use when possible.  */
    LINGER = 0x0080,		/* Block on close of a reliable
    OOBINLINE = 0x0100,	    /* Receive out-of-band data in-band.  */
    REUSEPORT = 0x0200,	    /* Allow local address and port reuse.  */
    SNDBUF = 0x1001,		/* Send buffer size.  */
    RCVBUF = 0x1002,		/* Receive buffer.  */
    SNDLOWAT = 0x1003,	    /* Send low-water mark.  */
    RCVLOWAT = 0x1004,	    /* Receive low-water mark.  */
    SNDTIMEO = 0x1005,	    /* Send timeout.  */
    RCVTIMEO = 0x1006,	    /* Receive timeout.  */
    ERROR = 0x1007,		    /* Get and clear error status.  */
    STYLE = 0x1008,		    /* Get socket connection style.  */
    TYPE = SO.STYLE		    /* Compatible name for STYLE.  */
}

export const enum IPV6 {
    ADDRFORM = 1,
    IPV6_2292PKTINFO = 2,
    IPV6_2292HOPOPTS = 3,
    IPV6_2292DSTOPTS = 4,
    IPV6_2292RTHDR = 5,
    IPV6_2292PKTOPTIONS = 6,
    CHECKSUM = 7,
    IPV6_2292HOPLIMIT = 8,
    NEXTHOP = 9,
    AUTHHDR = 10,
    UNICAST_HOPS = 16,
    MULTICAST_IF = 17,
    MULTICAST_HOPS = 18,
    MULTICAST_LOOP = 19,
    JOIN_GROUP = 20,
    LEAVE_GROUP = 21,
    ROUTER_ALERT = 22,
    MTU_DISCOVER = 23,
    MTU = 24,
    RECVERR = 25,
    V6ONLY = 26,
    JOIN_ANYCAST = 27,
    LEAVE_ANYCAST = 28,
    IPSEC_POLICY = 34,
    XFRM_POLICY = 35,
    RECVPKTINFO = 49,
    PKTINFO = 50,
    RECVHOPLIMIT = 51,
    HOPLIMIT = 52,
    RECVHOPOPTS = 53,
    HOPOPTS = 54,
    RTHDRDSTOPTS = 55,
    RECVRTHDR = 56,
    RTHDR = 57,
    RECVDSTOPTS = 58,
    DSTOPTS = 59,
    RECVTCLASS = 66,
    TCLASS = 67,
    /* IPV6_MTU_DISCOVER values.  */
    PMTUDISC_DONT = 0, /* Never send DF frames.  */
    PMTUDISC_WANT = 1, /* Use per route hints.  */
    PMTUDISC_DO = 2, /* Always DF.  */
    PMTUDISC_PROBE = 3, /* Ignore dst pmtu.  */
    /* Routing header options for IPv6.  */
    RTHDR_LOOSE = 0, /* Hop doesn't need to be neighbour. */
    RTHDR_STRICT = 1, /* Hop must be a neighbour.  */
    RTHDR_TYPE_0 = 0, /* IPv6 Routing header type 0.  */
}

export const enum IPPROTO {
    IP = 0,	       /* Dummy protocol for TCP.  */
    ICMP = 1,	   /* Internet Control Message Protocol.  */
    IGMP = 2,	   /* Internet Group Management Protocol. */
    IPIP = 4,	   /* IPIP tunnels (older KA9Q tunnels use 94).  */
    TCP = 6,	   /* Transmission Control Protocol.  */
    EGP = 8,	   /* Exterior Gateway Protocol.  */
    PUP = 12,	   /* PUP protocol.  */
    UDP = 17,	   /* User Datagram Protocol.  */
    IDP = 22,	   /* XNS IDP protocol.  */
    TP = 29,	   /* SO Transport Protocol Class 4.  */
    DCCP = 33,	   /* Datagram Congestion Control Protocol.  */
    IPV6 = 41,     /* IPv6 header.  */
    RSVP = 46,	   /* Reservation Protocol.  */
    GRE = 47,	   /* General Routing Encapsulation.  */
    ESP = 50,      /* encapsulating security payload.  */
    AH = 51,       /* authentication header.  */
    MTP = 92,	   /* Multicast Transport Protocol.  */
    BEETPH = 94,   /* IP option pseudo header for BEET.  */
    ENCAP = 98,	   /* Encapsulation Header.  */
    PIM = 103,	   /* Protocol Independent Multicast.  */
    COMP = 108,	   /* Compression Header Protocol.  */
    SCTP = 132,	   /* Stream Control Transmission Protocol.  */
    UDPLITE = 136, /* UDP-Lite protocol.  */
    RAW = 255,	   /* Raw IP packets.  */
    // MAX
    HOPOPTS = 0,   /* IPv6 Hop-by-Hop options.  */
    ROUTING = 43,  /* IPv6 routing header.  */
    FRAGMENT = 44, /* IPv6 fragmentation header.  */
    ICMPV6 = 58,   /* ICMPv6.  */
    NONE = 59,     /* IPv6 no next header.  */
    DSTOPTS = 60,  /* IPv6 destination options.  */
    MH = 135,      /* IPv6 mobility header.  */
}

export const enum IPPORT {
    ECHO = 7,		    /* Echo service.  */
    DISCARD = 9,	    /* Discard transmissions service.  */
    SYSTAT = 11,	    /* System status service.  */
    DAYTIME = 13,	    /* Time of day service.  */
    NETSTAT = 15,	    /* Network status service.  */
    FTP = 21,		    /* File Transfer Protocol.  */
    TELNET = 23,		/* Telnet protocol.  */
    SMTP = 25,		    /* Simple Mail Transfer Protocol.  */
    TIMESERVER = 37,	/* Timeserver service.  */
    NAMESERVER = 42,	/* Domain Name Service.  */
    WHOIS = 43,		    /* Internet Whois service.  */
    MTP = 57,
    TFTP = 69,		    /* Trivial File Transfer Protocol.  */
    RJE = 77,
    FINGER = 79,		/* Finger service.  */
    TTYLINK = 87,
    SUPDUP = 95,		/* SUPDUP protocol.  */
    EXECSERVER = 512,	/* execd service.  */
    LOGINSERVER = 513,	/* rlogind service.  */
    CMDSERVER = 514,
    EFSSERVER = 520,
    /* UDP ports.  */
    BIFFUDP = 512,
    WHOSERVER = 513,
    ROUTESERVER = 520,
    /* Ports less than this value are reserved for privileged processes.  */
    RESERVED = 1024,
    /* Ports greater this value are reserved for (non-privileged) servers.  */
    USERRESERVED = 5000
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
    WR,		    /* No more transmissions.  */
    RDWR,		/* No more receptions or transmissions.  */
}


export const enum EPOLL_EVENTS {
    // The associated file is available for read(2) operations
    EPOLLIN = 1,

    // The associated file is available for write(2) operations.
    EPOLLOUT = 4,

    // Stream socket peer closed connection, or shut down writing
    // half of connection.  (This flag is especially useful for
    // writing simple code to detect peer shutdown when using Edge
    // Triggered monitoring.)
    EPOLLRDHUP = 8192,

    // There is urgent data available for read(2) operations.
    EPOLLPRI = 2,

    // Error condition happened on the associated file descriptor.
    // epoll_wait(2) will always wait for this event; it is not
    // necessary to set it in events.
    EPOLLERR = 8,

    // Hang up happened on the associated file descriptor.
    // epoll_wait(2) will always wait for this event; it is not
    // necessary to set it in events.  Note that when reading from a
    // channel such as a pipe or a stream socket, this event merely
    // indicates that the peer closed its end of the channel.
    // Subsequent reads from the channel will return 0 (end of file)
    // only after all outstanding data in the channel has been
    // consumed.
    EPOLLHUP = 16,

    // Sets the Edge Triggered behavior for the associated file descriptor
    EPOLLET = 2147483648,

    // Once events fired, kernel fd will be disabled.
    EPOLLONESHOT = 1073741824,

    // Don't "hibernate"
    EPOLLWAKEUP = 536870912,

    // EPOLLEXCLUSIVE = ?
}




export const enum EPOLL {
    // Set the close-on-exec (FD_CLOEXEC) flag on the new file descriptor.  See the description of the O_CLOEXEC flag in open(2) for reasons why this may be useful.
    CLOEXEC = 524288,
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

export var ipc_perm = Struct.define(48, [ // It is 48 for some reason, auto-padding by GCC?
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
export type number64 = [numberLo, numberHi];

export interface utimbuf {
    actime:     [numberLo, numberHi],
    modtime:    [numberLo, numberHi],
}

export var timeval = Struct.define(16, [
    [0, uint64, 'tv_sec'],  // access time
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



// Relevant:
// https://filippo.io/linux-syscall-table/
// Linux:
// apt-get install man manpages-dev
// man 2 syscall
// man 2 syscalls
// x86:
// /usr/include/asm/unistd.h
// i386:
// /usr/src/linux/arch/i386/kernel/entry.S
// POSIX:
// http://pubs.opengroup.org/onlinepubs/009695399/
// http://pubs.opengroup.org/onlinepubs/009695399/idx/functions.html
export var SYS = {

    read:           0,  // First version
    write:          1,  // First version
    open:           2,  // First version
    close:          3,  // First version
    stat:           4,  // First version
    fstat:          5,  // First version
    lstat:          6,  // First version

    // poll:           7, // Use epoll instead.

    lseek:          8,  // First version

    mmap:           9,
    mprotect:       10,
    munmap:         11,
    brk:            12,
    rt_sigaction:   13,
    rt_sigprocmask: 14,
    rt_sigreturn:   15,
    ioctl:          16,
    pread64:        17,
    pwrite64:       18,
    readv:          19,
    writev:         20,
    access:         21,
    pipe:           22,
    // select:         23,
    sched_yield:    24,
    mremap:         25,
    msync:          26,
    mincore:        27,
    madvise:        28,
    shmget:         29,
    shmat:          30,
    shmctl:         31,
    dup:            32,
    dup2:           33,
    pause:          34,
    nanosleep:      35,
    getitimer:      36,
    alarm:          37,
    setitimer:      38,
    getpid:         39,
    sendfile:       40,
    socket:         41,
    connect:        42,
    accept:         43,
    sendto:         44,
    recvfrom:       45,
    sendmsg:        46,
    recvmsg:        47,
    shutdown:       48,
    bind:           49,
    listen:         50,
    getsockname:    51,
    getpeername:    52,
    socketpair:     53,
    setsockopt:     54,
    getsockopt:     55,

    shmdt:          67,

    fcntl:          72,

    fsync:          74,
    fdatasync:      75,
    truncate:       76,
    ftruncate:      77,
    getdents:       78,
    getcwd:         79,
    chdir:          80,
    fchdir:         81,
    rename:         82,
    mkdir:          83,
    rmdir:          84,
    creat:          85,
    link:           86,
    unlink:         87,
    symlink:        88,
    readlink:       89,
    chmod:          90,
    fchmod:         91,
    chown:          92,
    fchown:         93,
    lchown:         94,
    umask:          95,
    gettimeofday:   96,
    getrlimit:      97,
    getrusage:      98,

    getuid:         102,
    getgid:         104,

    geteuid:        107,
    getegid:        108,
    setpgid:        109,
    getppid:        110,

    utime:          132,

    epoll_create:   213,

    getdents64:     217,

    epoll_wait:     232,
    epoll_ctl:      233,

    utimes:         235,

    inotify_init:   253,
    inotify_add_watch: 254,
    inotify_rm_watch: 255,

    mkdirat:        258,

    futimesat:      261,

    utimensat:      280,

    accept4:        288,

    epoll_create1:  291,

    inotify_init1:  294,





// 12	brk	sys_brk	mm/mmap.c
// 13	rt_sigaction	sys_rt_sigaction	kernel/signal.c
// 14	rt_sigprocmask	sys_rt_sigprocmask	kernel/signal.c
// 15	rt_sigreturn	stub_rt_sigreturn	arch/x86/kernel/signal.c
// 16	ioctl	sys_ioctl	fs/ioctl.c
// 17	pread64	sys_pread64	fs/read_write.c
// 18	pwrite64	sys_pwrite64	fs/read_write.c
// 19	readv	sys_readv	fs/read_write.c
// 20	writev	sys_writev	fs/read_write.c
// 21	access	sys_access	fs/open.c
// 22	pipe	sys_pipe	fs/pipe.c
// 23	select	sys_select	fs/select.c
// 24	sched_yield	sys_sched_yield	kernel/sched/core.c
// 25	mremap	sys_mremap	mm/mmap.c
// 26	msync	sys_msync	mm/msync.c
// 27	mincore	sys_mincore	mm/mincore.c
// 28	madvise	sys_madvise	mm/madvise.c
// 29	shmget	sys_shmget	ipc/shm.c
// 30	shmat	sys_shmat	ipc/shm.c
// 31	shmctl	sys_shmctl	ipc/shm.c
// 32	dup	sys_dup	fs/file.c
// 33	dup2	sys_dup2	fs/file.c
// 34	pause	sys_pause	kernel/signal.c
// 35	nanosleep	sys_nanosleep	kernel/hrtimer.c
// 36	getitimer	sys_getitimer	kernel/itimer.c
// 37	alarm	sys_alarm	kernel/timer.c
// 38	setitimer	sys_setitimer	kernel/itimer.c
// 39	getpid	sys_getpid	kernel/sys.c
// 40	sendfile	sys_sendfile64	fs/read_write.c
// 41	socket	sys_socket	net/socket.c
// 42	connect	sys_connect	net/socket.c
// 43	accept	sys_accept	net/socket.c
// 44	sendto	sys_sendto	net/socket.c
// 45	recvfrom	sys_recvfrom	net/socket.c
// 46	sendmsg	sys_sendmsg	net/socket.c
// 47	recvmsg	sys_recvmsg	net/socket.c
// 48	shutdown	sys_shutdown	net/socket.c
// 49	bind	sys_bind	net/socket.c
// 50	listen	sys_listen	net/socket.c
// 51	getsockname	sys_getsockname	net/socket.c
// 52	getpeername	sys_getpeername	net/socket.c
// 53	socketpair	sys_socketpair	net/socket.c
// 54	setsockopt	sys_setsockopt	net/socket.c
// 55	getsockopt	sys_getsockopt	net/socket.c

// 56	clone	stub_clone	kernel/fork.c
// 57	fork	stub_fork	kernel/fork.c
// 58	vfork	stub_vfork	kernel/fork.c
// 59	execve	stub_execve	fs/exec.c
// 60	exit	sys_exit	kernel/exit.c
// 61	wait4	sys_wait4	kernel/exit.c
// 62	kill	sys_kill	kernel/signal.c
// 63	uname	sys_newuname	kernel/sys.c
// 64	semget	sys_semget	ipc/sem.c
// 65	semop	sys_semop	ipc/sem.c
// 66	semctl	sys_semctl	ipc/sem.c
// 67	shmdt	sys_shmdt	ipc/shm.c
// 68	msgget	sys_msgget	ipc/msg.c
// 69	msgsnd	sys_msgsnd	ipc/msg.c
// 70	msgrcv	sys_msgrcv	ipc/msg.c
// 71	msgctl	sys_msgctl	ipc/msg.c
// 73	flock	sys_flock	fs/locks.c
// 74	fsync	sys_fsync	fs/sync.c
// 75	fdatasync	sys_fdatasync	fs/sync.c
// 76	truncate	sys_truncate	fs/open.c
// 77	ftruncate	sys_ftruncate	fs/open.c
// 78	getdents	sys_getdents	fs/readdir.c
// 79	getcwd	sys_getcwd	fs/dcache.c
// 80	chdir	sys_chdir	fs/open.c
// 81	fchdir	sys_fchdir	fs/open.c
// 82	rename	sys_rename	fs/namei.c
// 83	mkdir	sys_mkdir	fs/namei.c
// 84	rmdir	sys_rmdir	fs/namei.c
// 85	creat	sys_creat	fs/open.c
// 86	link	sys_link	fs/namei.c
// 87	unlink	sys_unlink	fs/namei.c
// 88	symlink	sys_symlink	fs/namei.c
// 89	readlink	sys_readlink	fs/stat.c
// 90	chmod	sys_chmod	fs/open.c
// 91	fchmod	sys_fchmod	fs/open.c
// 92	chown	sys_chown	fs/open.c
// 93	fchown	sys_fchown	fs/open.c
// 94	lchown	sys_lchown	fs/open.c
// 95	umask	sys_umask	kernel/sys.c
// 96	gettimeofday	sys_gettimeofday	kernel/time.c
// 97	getrlimit	sys_getrlimit	kernel/sys.c
// 98	getrusage	sys_getrusage	kernel/sys.c
// 99	sysinfo	sys_sysinfo	kernel/sys.c
// 100	times	sys_times	kernel/sys.c
// 101	ptrace	sys_ptrace	kernel/ptrace.c
// 102	getuid	sys_getuid	kernel/sys.c
// 103	syslog	sys_syslog	kernel/printk/printk.c
// 104	getgid	sys_getgid	kernel/sys.c
// 105	setuid	sys_setuid	kernel/sys.c
// 106	setgid	sys_setgid	kernel/sys.c
// 107	geteuid	sys_geteuid	kernel/sys.c
// 108	getegid	sys_getegid	kernel/sys.c
// 109	setpgid	sys_setpgid	kernel/sys.c
// 110	getppid	sys_getppid	kernel/sys.c
// 111	getpgrp	sys_getpgrp	kernel/sys.c
// 112	setsid	sys_setsid	kernel/sys.c
// 113	setreuid	sys_setreuid	kernel/sys.c
// 114	setregid	sys_setregid	kernel/sys.c
// 115	getgroups	sys_getgroups	kernel/groups.c
// 116	setgroups	sys_setgroups	kernel/groups.c
// 117	setresuid	sys_setresuid	kernel/sys.c
// 118	getresuid	sys_getresuid	kernel/sys.c
// 119	setresgid	sys_setresgid	kernel/sys.c
// 120	getresgid	sys_getresgid	kernel/sys.c
// 121	getpgid	sys_getpgid	kernel/sys.c
// 122	setfsuid	sys_setfsuid	kernel/sys.c
// 123	setfsgid	sys_setfsgid	kernel/sys.c
// 124	getsid	sys_getsid	kernel/sys.c
// 125	capget	sys_capget	kernel/capability.c
// 126	capset	sys_capset	kernel/capability.c
// 127	rt_sigpending	sys_rt_sigpending	kernel/signal.c
// 128	rt_sigtimedwait	sys_rt_sigtimedwait	kernel/signal.c
// 129	rt_sigqueueinfo	sys_rt_sigqueueinfo	kernel/signal.c
// 130	rt_sigsuspend	sys_rt_sigsuspend	kernel/signal.c
// 131	sigaltstack	sys_sigaltstack	kernel/signal.c
// 132	utime	sys_utime	fs/utimes.c
// 133	mknod	sys_mknod	fs/namei.c
// 134	uselib		fs/exec.c
// 135	personality	sys_personality	kernel/exec_domain.c
// 136	ustat	sys_ustat	fs/statfs.c
// 137	statfs	sys_statfs	fs/statfs.c
// 138	fstatfs	sys_fstatfs	fs/statfs.c
// 139	sysfs	sys_sysfs	fs/filesystems.c
// 140	getpriority	sys_getpriority	kernel/sys.c
// 141	setpriority	sys_setpriority	kernel/sys.c
// 142	sched_setparam	sys_sched_setparam	kernel/sched/core.c
// 143	sched_getparam	sys_sched_getparam	kernel/sched/core.c
// 144	sched_setscheduler	sys_sched_setscheduler	kernel/sched/core.c
// 145	sched_getscheduler	sys_sched_getscheduler	kernel/sched/core.c
// 146	sched_get_priority_max	sys_sched_get_priority_max	kernel/sched/core.c
// 147	sched_get_priority_min	sys_sched_get_priority_min	kernel/sched/core.c
// 148	sched_rr_get_interval	sys_sched_rr_get_interval	kernel/sched/core.c
// 149	mlock	sys_mlock	mm/mlock.c
// 150	munlock	sys_munlock	mm/mlock.c
// 151	mlockall	sys_mlockall	mm/mlock.c
// 152	munlockall	sys_munlockall	mm/mlock.c
// 153	vhangup	sys_vhangup	fs/open.c
// 154	modify_ldt	sys_modify_ldt	arch/x86/um/ldt.c
// 155	pivot_root	sys_pivot_root	fs/namespace.c
// 156	_sysctl	sys_sysctl	kernel/sysctl_binary.c
// 157	prctl	sys_prctl	kernel/sys.c
// 158	arch_prctl	sys_arch_prctl	arch/x86/um/syscalls_64.c
// 159	adjtimex	sys_adjtimex	kernel/time.c
// 160	setrlimit	sys_setrlimit	kernel/sys.c
// 161	chroot	sys_chroot	fs/open.c
// 162	sync	sys_sync	fs/sync.c
// 163	acct	sys_acct	kernel/acct.c
// 164	settimeofday	sys_settimeofday	kernel/time.c
// 165	mount	sys_mount	fs/namespace.c
// 166	umount2	sys_umount	fs/namespace.c
// 167	swapon	sys_swapon	mm/swapfile.c
// 168	swapoff	sys_swapoff	mm/swapfile.c
// 169	reboot	sys_reboot	kernel/reboot.c
// 170	sethostname	sys_sethostname	kernel/sys.c
// 171	setdomainname	sys_setdomainname	kernel/sys.c
// 172	iopl	stub_iopl	arch/x86/kernel/ioport.c
// 173	ioperm	sys_ioperm	arch/x86/kernel/ioport.c
// 174	create_module		NOT IMPLEMENTED
// 175	init_module	sys_init_module	kernel/module.c
// 176	delete_module	sys_delete_module	kernel/module.c
// 177	get_kernel_syms		NOT IMPLEMENTED
// 178	query_module		NOT IMPLEMENTED
// 179	quotactl	sys_quotactl	fs/quota/quota.c
// 180	nfsservctl		NOT IMPLEMENTED
// 181	getpmsg		NOT IMPLEMENTED
// 182	putpmsg		NOT IMPLEMENTED
// 183	afs_syscall		NOT IMPLEMENTED
// 184	tuxcall		NOT IMPLEMENTED
// 185	security		NOT IMPLEMENTED
// 186	gettid	sys_gettid	kernel/sys.c
// 187	readahead	sys_readahead	mm/readahead.c
// 188	setxattr	sys_setxattr	fs/xattr.c
// 189	lsetxattr	sys_lsetxattr	fs/xattr.c
// 190	fsetxattr	sys_fsetxattr	fs/xattr.c
// 191	getxattr	sys_getxattr	fs/xattr.c
// 192	lgetxattr	sys_lgetxattr	fs/xattr.c
// 193	fgetxattr	sys_fgetxattr	fs/xattr.c
// 194	listxattr	sys_listxattr	fs/xattr.c
// 195	llistxattr	sys_llistxattr	fs/xattr.c
// 196	flistxattr	sys_flistxattr	fs/xattr.c
// 197	removexattr	sys_removexattr	fs/xattr.c
// 198	lremovexattr	sys_lremovexattr	fs/xattr.c
// 199	fremovexattr	sys_fremovexattr	fs/xattr.c
// 200	tkill	sys_tkill	kernel/signal.c
// 201	time	sys_time	kernel/time.c
// 202	futex	sys_futex	kernel/futex.c
// 203	sched_setaffinity	sys_sched_setaffinity	kernel/sched/core.c
// 204	sched_getaffinity	sys_sched_getaffinity	kernel/sched/core.c
// 205	set_thread_area		arch/x86/kernel/tls.c
// 206	io_setup	sys_io_setup	fs/aio.c
// 207	io_destroy	sys_io_destroy	fs/aio.c
// 208	io_getevents	sys_io_getevents	fs/aio.c
// 209	io_submit	sys_io_submit	fs/aio.c
// 210	io_cancel	sys_io_cancel	fs/aio.c
// 211	get_thread_area		arch/x86/kernel/tls.c
// 212	lookup_dcookie	sys_lookup_dcookie	fs/dcookies.c
// 213	epoll_create	sys_epoll_create	fs/eventpoll.c
// 214	epoll_ctl_old		NOT IMPLEMENTED
// 215	epoll_wait_old		NOT IMPLEMENTED
// 216	remap_file_pages	sys_remap_file_pages	mm/fremap.c
// 217	getdents64	sys_getdents64	fs/readdir.c
// 218	set_tid_address	sys_set_tid_address	kernel/fork.c
// 219	restart_syscall	sys_restart_syscall	kernel/signal.c
// 220	semtimedop	sys_semtimedop	ipc/sem.c
// 221	fadvise64	sys_fadvise64	mm/fadvise.c
// 222	timer_create	sys_timer_create	kernel/posix-timers.c
// 223	timer_settime	sys_timer_settime	kernel/posix-timers.c
// 224	timer_gettime	sys_timer_gettime	kernel/posix-timers.c
// 225	timer_getoverrun	sys_timer_getoverrun	kernel/posix-timers.c
// 226	timer_delete	sys_timer_delete	kernel/posix-timers.c
// 227	clock_settime	sys_clock_settime	kernel/posix-timers.c
// 228	clock_gettime	sys_clock_gettime	kernel/posix-timers.c
// 229	clock_getres	sys_clock_getres	kernel/posix-timers.c
// 230	clock_nanosleep	sys_clock_nanosleep	kernel/posix-timers.c
// 231	exit_group	sys_exit_group	kernel/exit.c
// 232	epoll_wait	sys_epoll_wait	fs/eventpoll.c
// 233	epoll_ctl	sys_epoll_ctl	fs/eventpoll.c
// 234	tgkill	sys_tgkill	kernel/signal.c
// 235	utimes	sys_utimes	fs/utimes.c
// 236	vserver		NOT IMPLEMENTED
// 237	mbind	sys_mbind	mm/mempolicy.c
// 238	set_mempolicy	sys_set_mempolicy	mm/mempolicy.c
// 239	get_mempolicy	sys_get_mempolicy	mm/mempolicy.c
// 240	mq_open	sys_mq_open	ipc/mqueue.c
// 241	mq_unlink	sys_mq_unlink	ipc/mqueue.c
// 242	mq_timedsend	sys_mq_timedsend	ipc/mqueue.c
// 243	mq_timedreceive	sys_mq_timedreceive	ipc/mqueue.c
// 244	mq_notify	sys_mq_notify	ipc/mqueue.c
// 245	mq_getsetattr	sys_mq_getsetattr	ipc/mqueue.c
// 246	kexec_load	sys_kexec_load	kernel/kexec.c
// 247	waitid	sys_waitid	kernel/exit.c
// 248	add_key	sys_add_key	security/keys/keyctl.c
// 249	request_key	sys_request_key	security/keys/keyctl.c
// 250	keyctl	sys_keyctl	security/keys/keyctl.c
// 251	ioprio_set	sys_ioprio_set	fs/ioprio.c
// 252	ioprio_get	sys_ioprio_get	fs/ioprio.c
// 253	inotify_init	sys_inotify_init	fs/notify/inotify/inotify_user.c
// 254	inotify_add_watch	sys_inotify_add_watch	fs/notify/inotify/inotify_user.c
// 255	inotify_rm_watch	sys_inotify_rm_watch	fs/notify/inotify/inotify_user.c
// 256	migrate_pages	sys_migrate_pages	mm/mempolicy.c
// 257	openat	sys_openat	fs/open.c
// 258	mkdirat	sys_mkdirat	fs/namei.c
// 259	mknodat	sys_mknodat	fs/namei.c
// 260	fchownat	sys_fchownat	fs/open.c
// 261	futimesat	sys_futimesat	fs/utimes.c
// 262	newfstatat	sys_newfstatat	fs/stat.c
// 263	unlinkat	sys_unlinkat	fs/namei.c
// 264	renameat	sys_renameat	fs/namei.c
// 265	linkat	sys_linkat	fs/namei.c
// 266	symlinkat	sys_symlinkat	fs/namei.c
// 267	readlinkat	sys_readlinkat	fs/stat.c
// 268	fchmodat	sys_fchmodat	fs/open.c
// 269	faccessat	sys_faccessat	fs/open.c
// 270	pselect6	sys_pselect6	fs/select.c
// 271	ppoll	sys_ppoll	fs/select.c
// 272	unshare	sys_unshare	kernel/fork.c
// 273	set_robust_list	sys_set_robust_list	kernel/futex.c
// 274	get_robust_list	sys_get_robust_list	kernel/futex.c
// 275	splice	sys_splice	fs/splice.c
// 276	tee	sys_tee	fs/splice.c
// 277	sync_file_range	sys_sync_file_range	fs/sync.c
// 278	vmsplice	sys_vmsplice	fs/splice.c
// 279	move_pages	sys_move_pages	mm/migrate.c
// 280	utimensat	sys_utimensat	fs/utimes.c
// 281	epoll_pwait	sys_epoll_pwait	fs/eventpoll.c
// 282	signalfd	sys_signalfd	fs/signalfd.c
// 283	timerfd_create	sys_timerfd_create	fs/timerfd.c
// 284	eventfd	sys_eventfd	fs/eventfd.c
// 285	fallocate	sys_fallocate	fs/open.c
// 286	timerfd_settime	sys_timerfd_settime	fs/timerfd.c
// 287	timerfd_gettime	sys_timerfd_gettime	fs/timerfd.c
// 288	accept4	sys_accept4	net/socket.c
// 289	signalfd4	sys_signalfd4	fs/signalfd.c
// 290	eventfd2	sys_eventfd2	fs/eventfd.c
// 291	epoll_create1	sys_epoll_create1	fs/eventpoll.c
// 292	dup3	sys_dup3	fs/file.c
// 293	pipe2	sys_pipe2	fs/pipe.c
// 294	inotify_init1	sys_inotify_init1	fs/notify/inotify/inotify_user.c
// 295	preadv	sys_preadv	fs/read_write.c
// 296	pwritev	sys_pwritev	fs/read_write.c
// 297	rt_tgsigqueueinfo	sys_rt_tgsigqueueinfo	kernel/signal.c
// 298	perf_event_open	sys_perf_event_open	kernel/events/core.c
// 299	recvmmsg	sys_recvmmsg	net/socket.c
// 300	fanotify_init	sys_fanotify_init	fs/notify/fanotify/fanotify_user.c
// 301	fanotify_mark	sys_fanotify_mark	fs/notify/fanotify/fanotify_user.c
// 302	prlimit64	sys_prlimit64	kernel/sys.c
// 303	name_to_handle_at	sys_name_to_handle_at	fs/fhandle.c
// 304	open_by_handle_at	sys_open_by_handle_at	fs/fhandle.c
// 305	clock_adjtime	sys_clock_adjtime	kernel/posix-timers.c
// 306	syncfs	sys_syncfs	fs/sync.c
// 307	sendmmsg	sys_sendmmsg	net/socket.c
// 308	setns	sys_setns	kernel/nsproxy.c
// 309	getcpu	sys_getcpu	kernel/sys.c
// 310	process_vm_readv	sys_process_vm_readv	mm/process_vm_access.c
// 311	process_vm_writev	sys_process_vm_writev	mm/process_vm_access.c
// 312	kcmp	sys_kcmp	kernel/kcmp.c
// 313	finit_module	sys_finit_module	kernel/module.c
};

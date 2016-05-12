"use strict";
var typebase_1 = require('../../typebase');
exports.NULL = 0;
var buf = Buffer.prototype;
exports.int8 = typebase_1.Type.define(1, buf.readInt8, buf.writeInt8);
exports.uint8 = typebase_1.Type.define(1, buf.readUInt8, buf.readUInt8);
exports.int16 = typebase_1.Type.define(2, buf.readInt16LE, buf.writeInt16LE);
exports.uint16 = typebase_1.Type.define(2, buf.readUInt16LE, buf.writeUInt16LE);
exports.int32 = typebase_1.Type.define(4, buf.readInt32LE, buf.writeInt32LE);
exports.uint32 = typebase_1.Type.define(4, buf.readUInt32LE, buf.writeUInt32LE);
exports.int64 = typebase_1.Arr.define(exports.int32, 2);
exports.uint64 = typebase_1.Arr.define(exports.uint32, 2);
exports.size_t = exports.uint64;
exports.time_t = exports.uint64;
exports.pid_t = exports.uint32;
exports.ipv4 = typebase_1.Type.define(4, function (offset) {
    if (offset === void 0) { offset = 0; }
    var buf = this;
    var socket = require('../../socket');
    var octets = socket.Ipv4.type.unpack(buf, offset);
    return new socket.Ipv4(octets);
}, function (data, offset) {
    if (offset === void 0) { offset = 0; }
    var buf = this;
    data.toBuffer().copy(buf, offset);
});
/**
 * See <asm/stat.h> line 82:
 *
 *      __kernel_ulong_t = unsigned long long // 64+ bits
 *      __kernel_long_t = long long // 64+ bits
 *      unsigned int // 32+ bits
 *
 * In `libc`:
 *
 *      struct stat {
 *          __kernel_ulong_t	st_dev;
 *          __kernel_ulong_t	st_ino;
 *          __kernel_ulong_t	st_nlink;
 *          unsigned int		st_mode;
 *          unsigned int		st_uid;
 *          unsigned int		st_gid;
 *          unsigned int		__pad0;
 *          __kernel_ulong_t	st_rdev;
 *          __kernel_long_t		st_size;
 *          __kernel_long_t		st_blksize;
 *          __kernel_long_t		st_blocks;	// Number 512-byte blocks allocated.
 *          __kernel_ulong_t	st_atime;
 *          __kernel_ulong_t	st_atime_nsec;
 *          __kernel_ulong_t	st_mtime;
 *          __kernel_ulong_t	st_mtime_nsec;
 *          __kernel_ulong_t	st_ctime;
 *          __kernel_ulong_t	st_ctime_nsec;
 *          __kernel_long_t		__unused[3];
 *      };
 *
 * @type {Struct}
 */
exports.stat = typebase_1.Struct.define(31 * 4, [
    [0, exports.uint32, 'dev'],
    // dev_hi:         [1 * 4,     buffer.int32],
    [2 * 4, exports.uint32, 'ino'],
    // ino_hi:         [3 * 4,     buffer.int32],
    [4 * 4, exports.uint32, 'nlink'],
    // nlink_hi:       [5 * 4,     buffer.int32],
    [6 * 4, exports.int32, 'mode'],
    [7 * 4, exports.int32, 'uid'],
    [8 * 4, exports.int32, 'gid'],
    // __pad0:         [9 * 4,     buffer.int32],
    [10 * 4, exports.uint32, 'rdev'],
    // rdev_hi:        [11 * 4,    buffer.int32],
    [12 * 4, exports.uint32, 'size'],
    // size_hi:        [13 * 4,    buffer.int32],
    [14 * 4, exports.uint32, 'blksize'],
    // blksize_hi:     [15 * 4,    buffer.int32],
    [16 * 4, exports.uint32, 'blocks'],
    // blocks_hi:      [17 * 4,    buffer.int32],
    [18 * 4, exports.uint32, 'atime'],
    // atime_hi:       [19 * 4,    buffer.int32],
    [20 * 4, exports.uint32, 'atime_nsec'],
    // atime_nsec_hi:  [21 * 4,    buffer.int32],
    [22 * 4, exports.uint32, 'mtime'],
    // mtime_hi:       [23 * 4,    buffer.int32],
    [24 * 4, exports.uint32, 'mtime_nsec'],
    // mtime_nsec_hi:  [25 * 4,    buffer.int32],
    [26 * 4, exports.uint32, 'ctime'],
    // ctime_hi:       [27 * 4,    buffer.int32],
    [28 * 4, exports.uint32, 'ctime_nsec'],
]);
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
exports.in_addr = typebase_1.Struct.define(4, [
    [0, exports.ipv4, 's_addr'],
]);
exports.sockaddr_in = typebase_1.Struct.define(16, [
    [0, exports.int16, 'sin_family'],
    [2, exports.uint16, 'sin_port'],
    [4, exports.in_addr, 'sin_addr'],
    [8, typebase_1.Arr.define(exports.int8, 8), 'sin_zero'],
]);
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
exports.sockaddr = typebase_1.Struct.define(1, [
    [0, 'sa_family', exports.uint16],
    [2, 'sa_data', typebase_1.Arr.define(exports.int8, 14)],
]);
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
exports.epoll_event = typebase_1.Struct.define(4 + 8, [
    [0, exports.uint32, 'events'],
    [4, exports.uint64, 'data'],
]);
/**
 * In `libc`, <bits/ipc.h> line 42:
 *
 *      struct ipc_perm {
 *          __key_t __key;			// Key.
 *          __uid_t uid;			// Owner's user ID.
 *          __gid_t gid;			// Owner's group ID.
 *          __uid_t cuid;			// Creator's user ID.
 *          __gid_t cgid;			// Creator's group ID.
 *          unsigned short int mode;		// Read/write permission.
 *          unsigned short int __pad1;
 *          unsigned short int __seq;		// Sequence number.
 *          unsigned short int __pad2;
 *          __syscall_ulong_t __glibc_reserved1;
 *          __syscall_ulong_t __glibc_reserved2;
 *      };
 *
 * `__syscall_ulong_t` is `unsigned long long int`
 *
 * @type {Struct}
 */
exports.ipc_perm = typebase_1.Struct.define(48, [
    [0, exports.int32, '__key'],
    [4, exports.uint32, 'uid'],
    [8, exports.uint32, 'gid'],
    [12, exports.uint32, 'cuid'],
    [16, exports.uint32, 'cgid'],
    [20, exports.uint16, 'mode'],
    // [22, uint16, '__pad1'],
    [24, exports.uint16, '__seq'],
]);
/**
 * In `libc`, <bits/shm.h> line 49:
 *
 *      struct shmid_ds {
 *          struct ipc_perm shm_perm;		// operation permission struct
 *          size_t shm_segsz;			// size of segment in bytes
 *          __time_t shm_atime;			// time of last shmat()
 *      #ifndef __x86_64__
 *          unsigned long int __glibc_reserved1;
 *      #endif
 *          __time_t shm_dtime;			// time of last shmdt()
 *      #ifndef __x86_64__
 *          unsigned long int __glibc_reserved2;
 *      #endif
 *          __time_t shm_ctime;			// time of last change by shmctl()
 *      #ifndef __x86_64__
 *          unsigned long int __glibc_reserved3;
 *      #endif
 *          __pid_t shm_cpid;			// pid of creator
 *          __pid_t shm_lpid;			// pid of last shmop
 *          shmatt_t shm_nattch;		// number of current attaches
 *          __syscall_ulong_t __glibc_reserved4;
 *          __syscall_ulong_t __glibc_reserved5;
 *      };
 *
 * From internet:
 *
 *      struct shmid_ds {
 *          struct ipc_perm shm_perm;    // Ownership and permissions
 *          size_t          shm_segsz;   // Size of segment (bytes)
 *          time_t          shm_atime;   // Last attach time
 *          time_t          shm_dtime;   // Last detach time
 *          time_t          shm_ctime;   // Last change time
 *          pid_t           shm_cpid;    // PID of creator
 *          pid_t           shm_lpid;    // PID of last shmat(2)/shmdt(2)
 *          shmatt_t        shm_nattch;  // No. of current attaches
 *          // ...
 *      };
 *
 * @type {Struct}
 */
exports.shmid_ds = typebase_1.Struct.define(112, [
    [0, exports.ipc_perm, 'shm_perm'],
    [48, exports.size_t, 'shm_segsz'],
    [56, exports.time_t, 'shm_atime'],
    [64, exports.time_t, 'shm_dtime'],
    [72, exports.time_t, 'shm_ctime'],
    [80, exports.pid_t, 'shm_cpid'],
    [84, exports.pid_t, 'shm_lpid'],
    [88, exports.uint64, 'shm_nattch'],
]);
// Time
//
//     struct utimbuf {
//         time_t actime;       /* access time */
//         time_t modtime;      /* modification time */
//     };
exports.utimbuf = typebase_1.Struct.define(16, [
    [0, exports.uint64, 'actime'],
    [8, exports.uint64, 'modtime'],
]);
exports.timeval = typebase_1.Struct.define(16, [
    [0, exports.uint64, 'tv_sec'],
    [8, exports.uint64, 'tv_nsec'],
]);

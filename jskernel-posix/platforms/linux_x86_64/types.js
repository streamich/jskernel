"use strict";
var typebase_1 = require('../../typebase');
var buf = Buffer.prototype;
exports.int8 = typebase_1.Type.define(1, buf.readInt8, buf.writeInt8);
exports.uint8 = typebase_1.Type.define(1, buf.readUInt8, buf.readUInt8);
exports.int16 = typebase_1.Type.define(2, buf.readInt16LE, buf.writeInt16LE);
exports.uint16 = typebase_1.Type.define(2, buf.readUInt16LE, buf.writeUInt16LE);
exports.int32 = typebase_1.Type.define(4, buf.readInt32LE, buf.writeInt32LE);
exports.uint32 = typebase_1.Type.define(4, buf.readUInt32LE, buf.writeUInt32LE);
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
    [0, exports.uint32, 's_addr'],
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

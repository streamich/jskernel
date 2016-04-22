"use strict";
var buffer;
(function (buffer) {
    buffer.uInt8 = Buffer.prototype.readUInt8;
    buffer.int8 = Buffer.prototype.readInt8;
    buffer.uInt16 = Buffer.prototype.readUInt16LE;
    buffer.int16 = Buffer.prototype.readInt16LE;
    buffer.uInt32 = Buffer.prototype.readUInt32LE;
    buffer.int32 = Buffer.prototype.readInt32LE;
})(buffer = exports.buffer || (exports.buffer = {}));
var struct;
(function (struct) {
    var Type = (function () {
        function Type() {
        }
        Type.create = function (unpack) {
            var new_type = new Type;
            new_type.unpackF = unpack;
            return new_type;
        };
        Type.prototype.unpack = function (buf, offset) {
            if (offset === void 0) { offset = 0; }
            return this.unpackF.call(buf, offset);
        };
        return Type;
    }());
    var Struct = (function () {
        function Struct() {
            this.defs = [];
            this.size = 0; // Full size, not just the size sum of elements in definitions.
        }
        Struct.create = function (size, defs) {
            var new_struct = new Struct;
            new_struct.size = size;
            new_struct.defs = defs;
            return new_struct;
        };
        Struct.prototype.unpack = function (buf, offset) {
            if (offset === void 0) { offset = 0; }
            var result = {};
            for (var _i = 0, _a = this.defs; _i < _a.length; _i++) {
                var field = _a[_i];
                var off = field[0], type = field[1], name = field[2];
                result[name] = type.unpack(buf, offset + off);
            }
            return result;
        };
        return Struct;
    }());
    var int32 = Type.create(Buffer.prototype.readInt32LE);
    struct.stat = Struct.create(31 * 4, [
        [0, int32, 'dev'],
        // dev_hi:         [1 * 4,     buffer.int32],
        [2 * 4, int32, 'ino'],
        // ino_hi:         [3 * 4,     buffer.int32],
        [4 * 4, int32, 'nlink'],
        // nlink_hi:       [5 * 4,     buffer.int32],
        [6 * 4, int32, 'mode'],
        [7 * 4, int32, 'uid'],
        [8 * 4, int32, 'gid'],
        // __pad0:         [9 * 4,     buffer.int32],
        [10 * 4, int32, 'rdev'],
        // rdev_hi:        [11 * 4,    buffer.int32],
        [12 * 4, int32, 'size'],
        // size_hi:        [13 * 4,    buffer.int32],
        [14 * 4, int32, 'blksize'],
        // blksize_hi:     [15 * 4,    buffer.int32],
        [16 * 4, int32, 'blocks'],
        // blocks_hi:      [17 * 4,    buffer.int32],
        [18 * 4, int32, 'atime'],
        // atime_hi:       [19 * 4,    buffer.int32],
        [20 * 4, int32, 'atime_nsec'],
        // atime_nsec_hi:  [21 * 4,    buffer.int32],
        [22 * 4, int32, 'mtime'],
        // mtime_hi:       [23 * 4,    buffer.int32],
        [24 * 4, int32, 'mtime_nsec'],
        // mtime_nsec_hi:  [25 * 4,    buffer.int32],
        [26 * 4, int32, 'ctime'],
        // ctime_hi:       [27 * 4,    buffer.int32],
        [28 * 4, int32, 'ctime_nsec'],
    ]);
    // var in_addr = Struct.create([
    //     [0, 's_addr', int32],
    // ]);
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
    // export var stat = {
    //     dev:            [0 * 4,     buffer.int32],
    // dev_hi:         [1 * 4,     buffer.int32],
    // ino:            [2 * 4,     buffer.int32],
    // ino_hi:         [3 * 4,     buffer.int32],
    // nlink:          [4 * 4,     buffer.int32],
    // nlink_hi:       [5 * 4,     buffer.int32],
    // mode:           [6 * 4,     buffer.int32],
    // uid:            [7 * 4,     buffer.int32],
    // gid:            [8 * 4,     buffer.int32],
    // __pad0:         [9 * 4,     buffer.int32],
    // rdev:           [10 * 4,    buffer.int32],
    // rdev_hi:        [11 * 4,    buffer.int32],
    // size:           [12 * 4,    buffer.int32],
    // size_hi:        [13 * 4,    buffer.int32],
    // blksize:        [14 * 4,    buffer.int32],
    // blksize_hi:     [15 * 4,    buffer.int32],
    // blocks:         [16 * 4,    buffer.int32],
    // blocks_hi:      [17 * 4,    buffer.int32],
    // atime:          [18 * 4,    buffer.int32],
    // atime_hi:       [19 * 4,    buffer.int32],
    // atime_nsec:     [20 * 4,    buffer.int32],
    // atime_nsec_hi:  [21 * 4,    buffer.int32],
    // mtime:          [22 * 4,    buffer.int32],
    // mtime_hi:       [23 * 4,    buffer.int32],
    // mtime_nsec:     [24 * 4,    buffer.int32],
    // mtime_nsec_hi:  [25 * 4,    buffer.int32],
    // ctime:          [26 * 4,    buffer.int32],
    // ctime_hi:       [27 * 4,    buffer.int32],
    // ctime_nsec:     [28 * 4,    buffer.int32],
    // ctime_nsec_hi:  [29 * 4,    buffer.int32],
    // __unused:       [30 * 4,    buffer.int32],
    // };
    // export var stat = [
    //     ['dev',         0 * 4,     buffer.int32],
    // dev_hi:         [1 * 4,     buffer.int32],
    // ['ino',         2 * 4,     buffer.int32],
    // ino_hi:         [3 * 4,     buffer.int32],
    // ['nlink',       4 * 4,     buffer.int32],
    // nlink_hi:       [5 * 4,     buffer.int32],
    // ['mode',        6 * 4,     buffer.int32],
    // ['uid',         7 * 4,     buffer.int32],
    // ['gid',         8 * 4,     buffer.int32],
    // __pad0:         [9 * 4,     buffer.int32],
    // ['rdev',        10 * 4,    buffer.int32],
    // rdev_hi:        [11 * 4,    buffer.int32],
    // ['size',        12 * 4,    buffer.int32],
    // size_hi:        [13 * 4,    buffer.int32],
    // ['blksize',     14 * 4,    buffer.int32],
    // blksize_hi:     [15 * 4,    buffer.int32],
    // ['blocks',      16 * 4,    buffer.int32],
    // blocks_hi:      [17 * 4,    buffer.int32],
    // ['atime',       18 * 4,    buffer.int32],
    // atime_hi:       [19 * 4,    buffer.int32],
    // ['atime_nsec',  20 * 4,    buffer.int32],
    // atime_nsec_hi:  [21 * 4,    buffer.int32],
    // ['mtime',       22 * 4,    buffer.int32],
    // mtime_hi:       [23 * 4,    buffer.int32],
    // ['mtime_nsec',  24 * 4,    buffer.int32],
    // mtime_nsec_hi:  [25 * 4,    buffer.int32],
    // ['ctime',       26 * 4,    buffer.int32],
    // ctime_hi:       [27 * 4,    buffer.int32],
    // ['ctime_nsec',  28 * 4,    buffer.int32],
    // ctime_nsec_hi:  [29 * 4,    buffer.int32],
    // __unused:       [30 * 4,    buffer.int32],
    // ];
    // export var statSize = 31 * 4; // Need to allow all necessary memory so that kernel does not overwrite some memory.
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
    struct.in_addr = [
        ['s_addr', 0, buffer.int32],
    ];
    struct.sockaddr_in = [
        ['sin_family', 0, buffer.int8],
        ['sin_port', 1, buffer.uInt8],
        ['sin_addr', 2, struct.in_addr],
        ['sin_zero', 3, buffer.int8],
    ];
})(struct = exports.struct || (exports.struct = {}));
exports.syscalls = {
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
    read: 0,
    write: 1,
    open: 2,
    close: 3,
    stat: 4,
    fstat: 5,
    lstat: 6,
    poll: 7,
    lseek: 8,
    mmap: 9,
    mprotect: 10,
    munmap: 11,
    brk: 12,
    rt_sigaction: 13,
    rt_sigprocmask: 14,
    rt_sigreturn: 15,
    ioctl: 16,
    pread64: 17,
    pwrite64: 18,
    readv: 19,
    writev: 20,
    access: 21,
    pipe: 22,
    select: 23,
    sched_yield: 24,
    mremap: 25,
    msync: 26,
    mincore: 27,
    madvise: 28,
    shmget: 29,
    shmat: 30,
    shmctl: 31,
    dup: 32,
    dup2: 33,
    pause: 34,
    nanosleep: 35,
    getitimer: 36,
    alarm: 37,
    setitimer: 38,
    getpid: 39,
    sendfile: 40,
    socket: 41,
    connect: 42,
    accept: 43,
    sendto: 44,
    recvfrom: 45,
    sendmsg: 46,
    recvmsg: 47,
    shutdown: 48,
    bind: 49,
    listen: 50,
    getsockname: 51,
    getpeername: 52,
    socketpair: 53,
    setsockopt: 54,
    getsockopt: 55
};

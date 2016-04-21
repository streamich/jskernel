"use strict";
var buffer;
(function (buffer) {
    buffer.uInt16 = Buffer.prototype.readUInt16LE;
    buffer.int16 = Buffer.prototype.readInt16LE;
    buffer.uInt32 = Buffer.prototype.readUInt32LE;
    buffer.int32 = Buffer.prototype.readInt32LE;
})(buffer = exports.buffer || (exports.buffer = {}));
var struct;
(function (struct) {
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
    struct.stat = {
        dev: [0 * 4, buffer.int32],
        // dev_hi:         [1 * 4,     buffer.int32],
        ino: [2 * 4, buffer.int32],
        // ino_hi:         [3 * 4,     buffer.int32],
        nlink: [4 * 4, buffer.int32],
        // nlink_hi:       [5 * 4,     buffer.int32],
        mode: [6 * 4, buffer.int32],
        uid: [7 * 4, buffer.int32],
        gid: [8 * 4, buffer.int32],
        // __pad0:         [9 * 4,     buffer.int32],
        rdev: [10 * 4, buffer.int32],
        // rdev_hi:        [11 * 4,    buffer.int32],
        size: [12 * 4, buffer.int32],
        // size_hi:        [13 * 4,    buffer.int32],
        blksize: [14 * 4, buffer.int32],
        // blksize_hi:     [15 * 4,    buffer.int32],
        blocks: [16 * 4, buffer.int32],
        // blocks_hi:      [17 * 4,    buffer.int32],
        atime: [18 * 4, buffer.int32],
        // atime_hi:       [19 * 4,    buffer.int32],
        atime_nsec: [20 * 4, buffer.int32],
        // atime_nsec_hi:  [21 * 4,    buffer.int32],
        mtime: [22 * 4, buffer.int32],
        // mtime_hi:       [23 * 4,    buffer.int32],
        mtime_nsec: [24 * 4, buffer.int32],
        // mtime_nsec_hi:  [25 * 4,    buffer.int32],
        ctime: [26 * 4, buffer.int32],
        // ctime_hi:       [27 * 4,    buffer.int32],
        ctime_nsec: [28 * 4, buffer.int32]
    };
    struct.statSize = 31 * 4; // Need to allow all necessary memory so that kernel does not overwrite some memory.
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
    munmap: 11
};

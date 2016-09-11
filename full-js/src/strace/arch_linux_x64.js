"use strict";
(function (ERROR) {
    ERROR[ERROR["EPERM"] = 1] = "EPERM";
    ERROR[ERROR["ENOENT"] = 2] = "ENOENT";
    ERROR[ERROR["ESRCH"] = 3] = "ESRCH";
    ERROR[ERROR["EINTR"] = 4] = "EINTR";
    ERROR[ERROR["EIO"] = 5] = "EIO";
    ERROR[ERROR["ENXIO"] = 6] = "ENXIO";
    ERROR[ERROR["E2BIG"] = 7] = "E2BIG";
    ERROR[ERROR["ENOEXEC"] = 8] = "ENOEXEC";
    ERROR[ERROR["EBADF"] = 9] = "EBADF";
    ERROR[ERROR["ECHILD"] = 10] = "ECHILD";
    ERROR[ERROR["EAGAIN"] = 11] = "EAGAIN";
    ERROR[ERROR["ENOMEM"] = 12] = "ENOMEM";
    ERROR[ERROR["EACCES"] = 13] = "EACCES";
    ERROR[ERROR["EFAULT"] = 14] = "EFAULT";
    ERROR[ERROR["ENOTBLK"] = 15] = "ENOTBLK";
    ERROR[ERROR["EBUSY"] = 16] = "EBUSY";
    ERROR[ERROR["EEXIST"] = 17] = "EEXIST";
    ERROR[ERROR["EXDEV"] = 18] = "EXDEV";
    ERROR[ERROR["ENODEV"] = 19] = "ENODEV";
    ERROR[ERROR["ENOTDIR"] = 20] = "ENOTDIR";
    ERROR[ERROR["EISDIR"] = 21] = "EISDIR";
    ERROR[ERROR["EINVAL"] = 22] = "EINVAL";
    ERROR[ERROR["ENFILE"] = 23] = "ENFILE";
    ERROR[ERROR["EMFILE"] = 24] = "EMFILE";
    ERROR[ERROR["ENOTTY"] = 25] = "ENOTTY";
    ERROR[ERROR["ETXTBSY"] = 26] = "ETXTBSY";
    ERROR[ERROR["EFBIG"] = 27] = "EFBIG";
    ERROR[ERROR["ENOSPC"] = 28] = "ENOSPC";
    ERROR[ERROR["ESPIPE"] = 29] = "ESPIPE";
    ERROR[ERROR["EROFS"] = 30] = "EROFS";
    ERROR[ERROR["EMLINK"] = 31] = "EMLINK";
    ERROR[ERROR["EPIPE"] = 32] = "EPIPE";
    ERROR[ERROR["EDOM"] = 33] = "EDOM";
    ERROR[ERROR["ERANGE"] = 34] = "ERANGE";
    ERROR[ERROR["EDEADLK"] = 35] = "EDEADLK";
    ERROR[ERROR["ENAMETOOLONG"] = 36] = "ENAMETOOLONG";
    ERROR[ERROR["ENOLCK"] = 37] = "ENOLCK";
    ERROR[ERROR["ENOSYS"] = 38] = "ENOSYS";
    ERROR[ERROR["ENOTEMPTY"] = 39] = "ENOTEMPTY";
    ERROR[ERROR["ELOOP"] = 40] = "ELOOP";
    ERROR[ERROR["EWOULDBLOCK"] = 11] = "EWOULDBLOCK";
    ERROR[ERROR["ENOMSG"] = 42] = "ENOMSG";
    ERROR[ERROR["EIDRM"] = 43] = "EIDRM";
    ERROR[ERROR["ECHRNG"] = 44] = "ECHRNG";
    ERROR[ERROR["EL2NSYNC"] = 45] = "EL2NSYNC";
    ERROR[ERROR["EL3HLT"] = 46] = "EL3HLT";
    ERROR[ERROR["EL3RST"] = 47] = "EL3RST";
    ERROR[ERROR["ELNRNG"] = 48] = "ELNRNG";
    ERROR[ERROR["EUNATCH"] = 49] = "EUNATCH";
    ERROR[ERROR["ENOCSI"] = 50] = "ENOCSI";
    ERROR[ERROR["EL2HLT"] = 51] = "EL2HLT";
    ERROR[ERROR["EBADE"] = 52] = "EBADE";
    ERROR[ERROR["EBADR"] = 53] = "EBADR";
    ERROR[ERROR["EXFULL"] = 54] = "EXFULL";
    ERROR[ERROR["ENOANO"] = 55] = "ENOANO";
    ERROR[ERROR["EBADRQC"] = 56] = "EBADRQC";
    ERROR[ERROR["EBADSLT"] = 57] = "EBADSLT";
    ERROR[ERROR["EDEADLOCK"] = 35] = "EDEADLOCK";
    ERROR[ERROR["EBFONT"] = 59] = "EBFONT";
    ERROR[ERROR["ENOSTR"] = 60] = "ENOSTR";
    ERROR[ERROR["ENODATA"] = 61] = "ENODATA";
    ERROR[ERROR["ETIME"] = 62] = "ETIME";
    ERROR[ERROR["ENOSR"] = 63] = "ENOSR";
    ERROR[ERROR["ENONET"] = 64] = "ENONET";
    ERROR[ERROR["ENOPKG"] = 65] = "ENOPKG";
    ERROR[ERROR["EREMOTE"] = 66] = "EREMOTE";
    ERROR[ERROR["ENOLINK"] = 67] = "ENOLINK";
    ERROR[ERROR["EADV"] = 68] = "EADV";
    ERROR[ERROR["ESRMNT"] = 69] = "ESRMNT";
    ERROR[ERROR["ECOMM"] = 70] = "ECOMM";
    ERROR[ERROR["EPROTO"] = 71] = "EPROTO";
    ERROR[ERROR["EMULTIHOP"] = 72] = "EMULTIHOP";
    ERROR[ERROR["EDOTDOT"] = 73] = "EDOTDOT";
    ERROR[ERROR["EBADMSG"] = 74] = "EBADMSG";
    ERROR[ERROR["EOVERFLOW"] = 75] = "EOVERFLOW";
    ERROR[ERROR["ENOTUNIQ"] = 76] = "ENOTUNIQ";
    ERROR[ERROR["EBADFD"] = 77] = "EBADFD";
    ERROR[ERROR["EREMCHG"] = 78] = "EREMCHG";
    ERROR[ERROR["ELIBACC"] = 79] = "ELIBACC";
    ERROR[ERROR["ELIBBAD"] = 80] = "ELIBBAD";
    ERROR[ERROR["ELIBSCN"] = 81] = "ELIBSCN";
    ERROR[ERROR["ELIBMAX"] = 82] = "ELIBMAX";
    ERROR[ERROR["ELIBEXEC"] = 83] = "ELIBEXEC";
    ERROR[ERROR["EILSEQ"] = 84] = "EILSEQ";
    ERROR[ERROR["ERESTART"] = 85] = "ERESTART";
    ERROR[ERROR["ESTRPIPE"] = 86] = "ESTRPIPE";
    ERROR[ERROR["EUSERS"] = 87] = "EUSERS";
    ERROR[ERROR["ENOTSOCK"] = 88] = "ENOTSOCK";
    ERROR[ERROR["EDESTADDRREQ"] = 89] = "EDESTADDRREQ";
    ERROR[ERROR["EMSGSIZE"] = 90] = "EMSGSIZE";
    ERROR[ERROR["EPROTOTYPE"] = 91] = "EPROTOTYPE";
    ERROR[ERROR["ENOPROTOOPT"] = 92] = "ENOPROTOOPT";
    ERROR[ERROR["EPROTONOSUPPORT"] = 93] = "EPROTONOSUPPORT";
    ERROR[ERROR["ESOCKTNOSUPPORT"] = 94] = "ESOCKTNOSUPPORT";
    ERROR[ERROR["EOPNOTSUPP"] = 95] = "EOPNOTSUPP";
    ERROR[ERROR["EPFNOSUPPORT"] = 96] = "EPFNOSUPPORT";
    ERROR[ERROR["EAFNOSUPPORT"] = 97] = "EAFNOSUPPORT";
    ERROR[ERROR["EADDRINUSE"] = 98] = "EADDRINUSE";
    ERROR[ERROR["EADDRNOTAVAIL"] = 99] = "EADDRNOTAVAIL";
    ERROR[ERROR["ENETDOWN"] = 100] = "ENETDOWN";
    ERROR[ERROR["ENETUNREACH"] = 101] = "ENETUNREACH";
    ERROR[ERROR["ENETRESET"] = 102] = "ENETRESET";
    ERROR[ERROR["ECONNABORTED"] = 103] = "ECONNABORTED";
    ERROR[ERROR["ECONNRESET"] = 104] = "ECONNRESET";
    ERROR[ERROR["ENOBUFS"] = 105] = "ENOBUFS";
    ERROR[ERROR["EISCONN"] = 106] = "EISCONN";
    ERROR[ERROR["ENOTCONN"] = 107] = "ENOTCONN";
    ERROR[ERROR["ESHUTDOWN"] = 108] = "ESHUTDOWN";
    ERROR[ERROR["ETOOMANYREFS"] = 109] = "ETOOMANYREFS";
    ERROR[ERROR["ETIMEDOUT"] = 110] = "ETIMEDOUT";
    ERROR[ERROR["ECONNREFUSED"] = 111] = "ECONNREFUSED";
    ERROR[ERROR["EHOSTDOWN"] = 112] = "EHOSTDOWN";
    ERROR[ERROR["EHOSTUNREACH"] = 113] = "EHOSTUNREACH";
    ERROR[ERROR["EALREADY"] = 114] = "EALREADY";
    ERROR[ERROR["EINPROGRESS"] = 115] = "EINPROGRESS";
    ERROR[ERROR["ESTALE"] = 116] = "ESTALE";
    ERROR[ERROR["EUCLEAN"] = 117] = "EUCLEAN";
    ERROR[ERROR["ENOTNAM"] = 118] = "ENOTNAM";
    ERROR[ERROR["ENAVAIL"] = 119] = "ENAVAIL";
    ERROR[ERROR["EISNAM"] = 120] = "EISNAM";
    ERROR[ERROR["EREMOTEIO"] = 121] = "EREMOTEIO";
    ERROR[ERROR["EDQUOT"] = 122] = "EDQUOT";
    ERROR[ERROR["ENOMEDIUM"] = 123] = "ENOMEDIUM";
    ERROR[ERROR["EMEDIUMTYPE"] = 124] = "EMEDIUMTYPE";
})(exports.ERROR || (exports.ERROR = {}));
var ERROR = exports.ERROR;
exports.ERROR_MSG = (_a = {},
    _a[ERROR.EPERM] = 'Operation not permitted',
    _a[ERROR.ENOENT] = 'No such file or directory',
    _a[ERROR.ESRCH] = 'No such process',
    _a[ERROR.EINTR] = 'Interrupted system call',
    _a[ERROR.EIO] = 'I/O error',
    _a[ERROR.ENXIO] = 'No such device or address',
    _a[ERROR.E2BIG] = 'Arg list too long',
    _a[ERROR.ENOEXEC] = 'Exec format error',
    _a[ERROR.EBADF] = 'Bad file number',
    _a[ERROR.ECHILD] = 'No child processes',
    _a[ERROR.EAGAIN] = 'Try again',
    _a[ERROR.ENOMEM] = 'Out of memory',
    _a[ERROR.EACCES] = 'Permission denied',
    _a[ERROR.EFAULT] = 'Bad address',
    _a[ERROR.ENOTBLK] = 'Block device required',
    _a[ERROR.EBUSY] = 'Device or resource busy',
    _a[ERROR.EEXIST] = 'File exists',
    _a[ERROR.EXDEV] = 'Cross-device link',
    _a[ERROR.ENODEV] = 'No such device',
    _a[ERROR.ENOTDIR] = 'Not a directory',
    _a[ERROR.EISDIR] = 'Is a directory',
    _a[ERROR.EINVAL] = 'Invalid argument',
    _a[ERROR.ENFILE] = 'File table overflow',
    _a[ERROR.EMFILE] = 'Too many open files',
    _a[ERROR.ENOTTY] = 'Not a typewriter',
    _a[ERROR.ETXTBSY] = 'Text file busy',
    _a[ERROR.EFBIG] = 'File too large',
    _a[ERROR.ENOSPC] = 'No space left on device',
    _a[ERROR.ESPIPE] = 'Illegal seek',
    _a[ERROR.EROFS] = 'Read-only file system',
    _a[ERROR.EMLINK] = 'Too many links',
    _a[ERROR.EPIPE] = 'Broken pipe',
    _a[ERROR.EDOM] = 'Math argument out of domain of func',
    _a[ERROR.ERANGE] = 'Math result not representable',
    _a[ERROR.EDEADLK] = 'Resource deadlock would occur',
    _a[ERROR.ENAMETOOLONG] = 'File name too long',
    _a[ERROR.ENOLCK] = 'No record locks available',
    _a[ERROR.ENOSYS] = 'Function not implemented',
    _a[ERROR.ENOTEMPTY] = 'Directory not empty',
    _a[ERROR.ELOOP] = 'Too many symbolic links encountered',
    _a[ERROR.ENOMSG] = 'No message of desired type',
    _a[ERROR.EIDRM] = 'Identifier removed',
    _a[ERROR.ECHRNG] = 'Channel number out of range',
    _a[ERROR.EL2NSYNC] = 'Level 2 not synchronized',
    _a[ERROR.EL3HLT] = 'Level 3 halted',
    _a[ERROR.EL3RST] = 'Level 3 reset',
    _a[ERROR.ELNRNG] = 'Link number out of range',
    _a[ERROR.EUNATCH] = 'Protocol driver not attached',
    _a[ERROR.ENOCSI] = 'No CSI structure available',
    _a[ERROR.EL2HLT] = 'Level 2 halted',
    _a[ERROR.EBADE] = 'Invalid exchange',
    _a[ERROR.EBADR] = 'Invalid request descriptor',
    _a[ERROR.EXFULL] = 'Exchange full',
    _a[ERROR.ENOANO] = 'No anode',
    _a[ERROR.EBADRQC] = 'Invalid request code',
    _a[ERROR.EBADSLT] = 'Invalid slot',
    _a[ERROR.EBFONT] = 'Bad font file format',
    _a[ERROR.ENOSTR] = 'Device not a stream',
    _a[ERROR.ENODATA] = 'No data available',
    _a[ERROR.ETIME] = 'Timer expired',
    _a[ERROR.ENOSR] = 'Out of streams resources',
    _a[ERROR.ENONET] = 'Machine is not on the network',
    _a[ERROR.ENOPKG] = 'Package not installed',
    _a[ERROR.EREMOTE] = 'Object is remote',
    _a[ERROR.ENOLINK] = 'Link has been severed',
    _a[ERROR.EADV] = 'Advertise error',
    _a[ERROR.ESRMNT] = 'Srmount error',
    _a[ERROR.ECOMM] = 'Communication error on send',
    _a[ERROR.EPROTO] = 'Protocol error',
    _a[ERROR.EMULTIHOP] = 'Multihop attempted',
    _a[ERROR.EDOTDOT] = 'RFS specific error',
    _a[ERROR.EBADMSG] = 'Not a data message',
    _a[ERROR.EOVERFLOW] = 'Value too large for defined data type',
    _a[ERROR.ENOTUNIQ] = 'Name not unique on network',
    _a[ERROR.EBADFD] = 'File descriptor in bad state',
    _a[ERROR.EREMCHG] = 'Remote address changed',
    _a[ERROR.ELIBACC] = 'Can not access a needed shared library',
    _a[ERROR.ELIBBAD] = 'Accessing a corrupted shared library',
    _a[ERROR.ELIBSCN] = '.lib section in a.out corrupted',
    _a[ERROR.ELIBMAX] = 'Attempting to link in too many shared libraries',
    _a[ERROR.ELIBEXEC] = 'Cannot exec a shared library directly',
    _a[ERROR.EILSEQ] = 'Illegal byte sequence',
    _a[ERROR.ERESTART] = 'Interrupted system call should be restarted',
    _a[ERROR.ESTRPIPE] = 'Streams pipe error',
    _a[ERROR.EUSERS] = 'Too many users',
    _a[ERROR.ENOTSOCK] = 'Socket operation on non-socket',
    _a[ERROR.EDESTADDRREQ] = 'Destination address required',
    _a[ERROR.EMSGSIZE] = 'Message too long',
    _a[ERROR.EPROTOTYPE] = 'Protocol wrong type for socket',
    _a[ERROR.ENOPROTOOPT] = 'Protocol not available',
    _a[ERROR.EPROTONOSUPPORT] = 'Protocol not supported',
    _a[ERROR.ESOCKTNOSUPPORT] = 'Socket type not supported',
    _a[ERROR.EOPNOTSUPP] = 'Operation not supported on transport endpoint',
    _a[ERROR.EPFNOSUPPORT] = 'Protocol family not supported',
    _a[ERROR.EAFNOSUPPORT] = 'Address family not supported by protocol',
    _a[ERROR.EADDRINUSE] = 'Address already in use',
    _a[ERROR.EADDRNOTAVAIL] = 'Cannot assign requested address',
    _a[ERROR.ENETDOWN] = 'Network is down',
    _a[ERROR.ENETUNREACH] = 'Network is unreachable',
    _a[ERROR.ENETRESET] = 'Network dropped connection because of reset',
    _a[ERROR.ECONNABORTED] = 'Software caused connection abort',
    _a[ERROR.ECONNRESET] = 'Connection reset by peer',
    _a[ERROR.ENOBUFS] = 'No buffer space available',
    _a[ERROR.EISCONN] = 'Transport endpoint is already connected',
    _a[ERROR.ENOTCONN] = 'Transport endpoint is not connected',
    _a[ERROR.ESHUTDOWN] = 'Cannot send after transport endpoint shutdown',
    _a[ERROR.ETOOMANYREFS] = 'Too many references: cannot splice',
    _a[ERROR.ETIMEDOUT] = 'Connection timed out',
    _a[ERROR.ECONNREFUSED] = 'Connection refused',
    _a[ERROR.EHOSTDOWN] = 'Host is down',
    _a[ERROR.EHOSTUNREACH] = 'No route to host',
    _a[ERROR.EALREADY] = 'Operation already in progress',
    _a[ERROR.EINPROGRESS] = 'Operation now in progress',
    _a[ERROR.ESTALE] = 'Stale NFS file handle',
    _a[ERROR.EUCLEAN] = 'Structure needs cleaning',
    _a[ERROR.ENOTNAM] = 'Not a XENIX named type file',
    _a[ERROR.ENAVAIL] = 'No XENIX semaphores available',
    _a[ERROR.EISNAM] = 'Is a named type file',
    _a[ERROR.EREMOTEIO] = 'Remote I/O error',
    _a[ERROR.EDQUOT] = 'Quota exceeded',
    _a[ERROR.ENOMEDIUM] = 'No medium found',
    _a[ERROR.EMEDIUMTYPE] = 'Wrong medium type',
    _a
);
(function (SYS) {
    SYS[SYS["read"] = 0] = "read";
    SYS[SYS["write"] = 1] = "write";
    SYS[SYS["open"] = 2] = "open";
    SYS[SYS["close"] = 3] = "close";
    SYS[SYS["stat"] = 4] = "stat";
    SYS[SYS["fstat"] = 5] = "fstat";
    SYS[SYS["lstat"] = 6] = "lstat";
    SYS[SYS["poll"] = 7] = "poll";
    SYS[SYS["lseek"] = 8] = "lseek";
    SYS[SYS["mmap"] = 9] = "mmap";
    SYS[SYS["mprotect"] = 10] = "mprotect";
    SYS[SYS["munmap"] = 11] = "munmap";
    SYS[SYS["brk"] = 12] = "brk";
    SYS[SYS["rt_sigaction"] = 13] = "rt_sigaction";
    SYS[SYS["rt_sigprocmask"] = 14] = "rt_sigprocmask";
    SYS[SYS["rt_sigreturn"] = 15] = "rt_sigreturn";
    SYS[SYS["ioctl"] = 16] = "ioctl";
    SYS[SYS["pread64"] = 17] = "pread64";
    SYS[SYS["pwrite64"] = 18] = "pwrite64";
    SYS[SYS["readv"] = 19] = "readv";
    SYS[SYS["writev"] = 20] = "writev";
    SYS[SYS["access"] = 21] = "access";
    SYS[SYS["pipe"] = 22] = "pipe";
    SYS[SYS["select"] = 23] = "select";
    SYS[SYS["sched_yield"] = 24] = "sched_yield";
    SYS[SYS["mremap"] = 25] = "mremap";
    SYS[SYS["msync"] = 26] = "msync";
    SYS[SYS["mincore"] = 27] = "mincore";
    SYS[SYS["madvise"] = 28] = "madvise";
    SYS[SYS["shmget"] = 29] = "shmget";
    SYS[SYS["shmat"] = 30] = "shmat";
    SYS[SYS["shmctl"] = 31] = "shmctl";
    SYS[SYS["dup"] = 32] = "dup";
    SYS[SYS["dup2"] = 33] = "dup2";
    SYS[SYS["pause"] = 34] = "pause";
    SYS[SYS["nanosleep"] = 35] = "nanosleep";
    SYS[SYS["getitimer"] = 36] = "getitimer";
    SYS[SYS["alarm"] = 37] = "alarm";
    SYS[SYS["setitimer"] = 38] = "setitimer";
    SYS[SYS["getpid"] = 39] = "getpid";
    SYS[SYS["sendfile"] = 40] = "sendfile";
    SYS[SYS["socket"] = 41] = "socket";
    SYS[SYS["connect"] = 42] = "connect";
    SYS[SYS["accept"] = 43] = "accept";
    SYS[SYS["sendto"] = 44] = "sendto";
    SYS[SYS["recvfrom"] = 45] = "recvfrom";
    SYS[SYS["sendmsg"] = 46] = "sendmsg";
    SYS[SYS["recvmsg"] = 47] = "recvmsg";
    SYS[SYS["shutdown"] = 48] = "shutdown";
    SYS[SYS["bind"] = 49] = "bind";
    SYS[SYS["listen"] = 50] = "listen";
    SYS[SYS["getsockname"] = 51] = "getsockname";
    SYS[SYS["getpeername"] = 52] = "getpeername";
    SYS[SYS["socketpair"] = 53] = "socketpair";
    SYS[SYS["setsockopt"] = 54] = "setsockopt";
    SYS[SYS["getsockopt"] = 55] = "getsockopt";
    SYS[SYS["shmdt"] = 67] = "shmdt";
    SYS[SYS["fcntl"] = 72] = "fcntl";
    SYS[SYS["fsync"] = 74] = "fsync";
    SYS[SYS["fdatasync"] = 75] = "fdatasync";
    SYS[SYS["truncate"] = 76] = "truncate";
    SYS[SYS["ftruncate"] = 77] = "ftruncate";
    SYS[SYS["getdents"] = 78] = "getdents";
    SYS[SYS["getcwd"] = 79] = "getcwd";
    SYS[SYS["chdir"] = 80] = "chdir";
    SYS[SYS["fchdir"] = 81] = "fchdir";
    SYS[SYS["rename"] = 82] = "rename";
    SYS[SYS["mkdir"] = 83] = "mkdir";
    SYS[SYS["rmdir"] = 84] = "rmdir";
    SYS[SYS["creat"] = 85] = "creat";
    SYS[SYS["link"] = 86] = "link";
    SYS[SYS["unlink"] = 87] = "unlink";
    SYS[SYS["symlink"] = 88] = "symlink";
    SYS[SYS["readlink"] = 89] = "readlink";
    SYS[SYS["chmod"] = 90] = "chmod";
    SYS[SYS["fchmod"] = 91] = "fchmod";
    SYS[SYS["chown"] = 92] = "chown";
    SYS[SYS["fchown"] = 93] = "fchown";
    SYS[SYS["lchown"] = 94] = "lchown";
    SYS[SYS["umask"] = 95] = "umask";
    SYS[SYS["gettimeofday"] = 96] = "gettimeofday";
    SYS[SYS["getrlimit"] = 97] = "getrlimit";
    SYS[SYS["getrusage"] = 98] = "getrusage";
    SYS[SYS["getuid"] = 102] = "getuid";
    SYS[SYS["getgid"] = 104] = "getgid";
    SYS[SYS["geteuid"] = 107] = "geteuid";
    SYS[SYS["getegid"] = 108] = "getegid";
    SYS[SYS["setpgid"] = 109] = "setpgid";
    SYS[SYS["getppid"] = 110] = "getppid";
    SYS[SYS["utime"] = 132] = "utime";
    SYS[SYS["epoll_create"] = 213] = "epoll_create";
    SYS[SYS["getdents64"] = 217] = "getdents64";
    SYS[SYS["epoll_wait"] = 232] = "epoll_wait";
    SYS[SYS["epoll_ctl"] = 233] = "epoll_ctl";
    SYS[SYS["utimes"] = 235] = "utimes";
    SYS[SYS["inotify_init"] = 253] = "inotify_init";
    SYS[SYS["inotify_add_watch"] = 254] = "inotify_add_watch";
    SYS[SYS["inotify_rm_watch"] = 255] = "inotify_rm_watch";
    SYS[SYS["mkdirat"] = 258] = "mkdirat";
    SYS[SYS["futimesat"] = 261] = "futimesat";
    SYS[SYS["utimensat"] = 280] = "utimensat";
    SYS[SYS["eventfd"] = 284] = "eventfd";
    SYS[SYS["accept4"] = 288] = "accept4";
    SYS[SYS["epoll_create1"] = 291] = "epoll_create1";
    SYS[SYS["inotify_init1"] = 294] = "inotify_init1";
})(exports.SYS || (exports.SYS = {}));
var SYS = exports.SYS;
exports.ARGS = (_b = {},
    _b[SYS.open] = [['const char*', 'pathname'], ['int', 'flags'], ['mode_t', 'mode']],
    _b[SYS.close] = [['int', 'fd']],
    _b[SYS.write] = [['int', 'fd'], ['const void*', 'buf'], ['size_t', 'count']],
    _b[SYS.read] = [['int', 'fd'], ['void*', 'buf'], ['size_t', 'count']],
    _b[SYS.getcwd] = [['char*', 'buf'], ['size_t', 'size']],
    _b[SYS.stat] = [['const char*', 'pathname'], ['struct stat*', 'buf']],
    _b[SYS.fstat] = [['int', 'fd'], ['struct stat*', 'buf']],
    _b[SYS.lstat] = [['const char*', 'pathname'], ['struct stat*', 'buf']],
    _b[SYS.socket] = [['int', 'domain'], ['int', 'type'], ['int', 'protocol']],
    _b[SYS.connect] = [['int', 'sockfd'], ['const struct sockaddr*', 'addr'], ['socklen_t', 'addrlen']],
    _b[SYS.accept] = [['int', 'sockfd'], ['struct sockaddr*', 'addr'], ['socklen_t*', 'addrlen']],
    // [SYS.sendto]: [['int', 'sockfd'], ['const void*', 'buf'], ['size_t', 'len'], ['int', 'flags'], ['const struct sockaddr*', 'dest_addr'], ['socklen_t', 'addrlen']],
    _b[SYS.sendto] = [['int', 'sockfd'], ['void*', 'buf'], ['size_t', 'len'], ['int', 'flags'], ['sockaddr*', 'dest_addr'], ['socklen_t', 'addrlen']],
    // [SYS.recvfrom]: [['int', 'sockfd'], ['void*', 'buf'], ['size_t', 'len'], ['int', 'flags'], ['struct sockaddr*', 'src_addr'], ['socklen_t*', 'addrlen']],
    _b[SYS.recvfrom] = [['int', 'sockfd'], ['void*', 'buf'], ['size_t', 'len'], ['int', 'flags'], ['sockaddr*', 'src_addr'], ['socklen_t*', 'addrlen']],
    // [SYS.bind]: [['int', 'sockfd'], ['const struct sockaddr*', 'addr'], ['socklen_t', 'addrlen']],
    _b[SYS.bind] = [['int', 'sockfd'], ['sockaddr*', 'addr'], ['socklen_t', 'addrlen']],
    _b[SYS.listen] = [['int', 'socket'], ['int', 'backlog']],
    _b[SYS.getsockopt] = [['int', 'sockfd'], ['int', 'level'], ['int', 'optname'], ['void*', 'optval'], ['socklen_t*', 'optlen']],
    // [SYS.setsockopt]: [['int', 'sockfd'], ['int', 'level'], ['int', 'optname'], ['const void*', 'optval'], ['socklen_t', 'optlen']],
    _b[SYS.setsockopt] = [['int', 'sockfd'], ['int', 'level'], ['int', 'optname'], ['void*', 'optval'], ['socklen_t', 'optlen']],
    _b[SYS.epoll_create] = [['int', 'size']],
    _b[SYS.epoll_create1] = [['int', 'flags']],
    // [SYS.epoll_wait]: [['int', 'epfd'], ['struct epoll_event*', 'events'], ['int', 'maxevents'], ['int', 'timeout']],
    _b[SYS.epoll_wait] = [['int', 'epfd'], ['epoll_event*', 'events'], ['int', 'maxevents'], ['int', 'timeout']],
    _b[SYS.epoll_ctl] = [['int', 'epfd'], ['int', 'op'], ['int', 'fd'], ['struct epoll_event*', 'event']],
    _b[SYS.eventfd] = [['unsigned int', 'initval'], ['int', 'flags']],
    _b[SYS.mmap] = [['void*', 'addr'], ['size_t', 'length'], ['int', 'prot'], ['int', 'flags'], ['int', 'fd'], ['off_t', 'offset']],
    _b[SYS.munmap] = [['void*', 'addr'], ['size_t', 'length']],
    _b
);
exports.RESULT = (_c = {},
    _c[SYS.write] = 'bytes written',
    _c[SYS.read] = 'bytes read',
    _c[SYS.getcwd] = 'path length',
    _c[SYS.getpid] = 'process ID',
    _c[SYS.epoll_create1] = 'epoll file descriptor',
    _c
);
var _a, _b, _c;


export enum ERROR {
    EPERM = 1,
    ENOENT = 2,
    ESRCH = 3,
    EINTR = 4,
    EIO = 5,
    ENXIO = 6,
    E2BIG = 7,
    ENOEXEC = 8,
    EBADF = 9,
    ECHILD = 10,
    EAGAIN = 11,
    ENOMEM = 12,
    EACCES = 13,
    EFAULT = 14,
    ENOTBLK = 15,
    EBUSY = 16,
    EEXIST = 17,
    EXDEV = 18,
    ENODEV = 19,
    ENOTDIR = 20,
    EISDIR = 21,
    EINVAL = 22,
    ENFILE = 23,
    EMFILE = 24,
    ENOTTY = 25,
    ETXTBSY = 26,
    EFBIG = 27,
    ENOSPC = 28,
    ESPIPE = 29,
    EROFS = 30,
    EMLINK = 31,
    EPIPE = 32,
    EDOM = 33,
    ERANGE = 34,
    EDEADLK = 35,
    ENAMETOOLONG = 36,
    ENOLCK = 37,
    ENOSYS = 38,
    ENOTEMPTY = 39,
    ELOOP = 40,
    EWOULDBLOCK = ERROR.EAGAIN,
    ENOMSG = 42,
    EIDRM = 43,
    ECHRNG = 44,
    EL2NSYNC = 45,
    EL3HLT = 46,
    EL3RST = 47,
    ELNRNG = 48,
    EUNATCH = 49,
    ENOCSI = 50,
    EL2HLT = 51,
    EBADE = 52,
    EBADR = 53,
    EXFULL = 54,
    ENOANO = 55,
    EBADRQC = 56,
    EBADSLT = 57,
    EDEADLOCK = ERROR.EDEADLK,
    EBFONT = 59,
    ENOSTR = 60,
    ENODATA = 61,
    ETIME = 62,
    ENOSR = 63,
    ENONET = 64,
    ENOPKG = 65,
    EREMOTE = 66,
    ENOLINK = 67,
    EADV = 68,
    ESRMNT = 69,
    ECOMM = 70,
    EPROTO = 71,
    EMULTIHOP = 72,
    EDOTDOT = 73,
    EBADMSG = 74,
    EOVERFLOW = 75,
    ENOTUNIQ = 76,
    EBADFD = 77,
    EREMCHG = 78,
    ELIBACC = 79,
    ELIBBAD = 80,
    ELIBSCN = 81,
    ELIBMAX = 82,
    ELIBEXEC = 83,
    EILSEQ = 84,
    ERESTART = 85,
    ESTRPIPE = 86,
    EUSERS = 87,
    ENOTSOCK = 88,
    EDESTADDRREQ = 89,
    EMSGSIZE = 90,
    EPROTOTYPE = 91,
    ENOPROTOOPT = 92,
    EPROTONOSUPPORT = 93,
    ESOCKTNOSUPPORT = 94,
    EOPNOTSUPP = 95,
    EPFNOSUPPORT = 96,
    EAFNOSUPPORT = 97,
    EADDRINUSE = 98,
    EADDRNOTAVAIL = 99,
    ENETDOWN = 100,
    ENETUNREACH = 101,
    ENETRESET = 102,
    ECONNABORTED = 103,
    ECONNRESET = 104,
    ENOBUFS = 105,
    EISCONN = 106,
    ENOTCONN = 107,
    ESHUTDOWN = 108,
    ETOOMANYREFS = 109,
    ETIMEDOUT = 110,
    ECONNREFUSED = 111,
    EHOSTDOWN = 112,
    EHOSTUNREACH = 113,
    EALREADY = 114,
    EINPROGRESS = 115,
    ESTALE = 116,
    EUCLEAN = 117,
    ENOTNAM = 118,
    ENAVAIL = 119,
    EISNAM = 120,
    EREMOTEIO = 121,
    EDQUOT = 122,
    ENOMEDIUM = 123,
    EMEDIUMTYPE = 124,
}

export var ERROR_MSG = {
    [ERROR.EPERM]: 'Operation not permitted',
    [ERROR.ENOENT]: 'No such file or directory',
    [ERROR.ESRCH]: 'No such process',
    [ERROR.EINTR]: 'Interrupted system call',
    [ERROR.EIO]: 'I/O error',
    [ERROR.ENXIO]: 'No such device or address',
    [ERROR.E2BIG]: 'Arg list too long',
    [ERROR.ENOEXEC]: 'Exec format error',
    [ERROR.EBADF]: 'Bad file number',
    [ERROR.ECHILD]: 'No child processes',
    [ERROR.EAGAIN]: 'Try again',
    [ERROR.ENOMEM]: 'Out of memory',
    [ERROR.EACCES]: 'Permission denied',
    [ERROR.EFAULT]: 'Bad address',
    [ERROR.ENOTBLK]: 'Block device required',
    [ERROR.EBUSY]: 'Device or resource busy',
    [ERROR.EEXIST]: 'File exists',
    [ERROR.EXDEV]: 'Cross-device link',
    [ERROR.ENODEV]: 'No such device',
    [ERROR.ENOTDIR]: 'Not a directory',
    [ERROR.EISDIR]: 'Is a directory',
    [ERROR.EINVAL]: 'Invalid argument',
    [ERROR.ENFILE]: 'File table overflow',
    [ERROR.EMFILE]: 'Too many open files',
    [ERROR.ENOTTY]: 'Not a typewriter',
    [ERROR.ETXTBSY]: 'Text file busy',
    [ERROR.EFBIG]: 'File too large',
    [ERROR.ENOSPC]: 'No space left on device',
    [ERROR.ESPIPE]: 'Illegal seek',
    [ERROR.EROFS]: 'Read-only file system',
    [ERROR.EMLINK]: 'Too many links',
    [ERROR.EPIPE]: 'Broken pipe',
    [ERROR.EDOM]: 'Math argument out of domain of func',
    [ERROR.ERANGE]: 'Math result not representable',
    [ERROR.EDEADLK]: 'Resource deadlock would occur',
    [ERROR.ENAMETOOLONG]: 'File name too long',
    [ERROR.ENOLCK]: 'No record locks available',
    [ERROR.ENOSYS]: 'Function not implemented',
    [ERROR.ENOTEMPTY]: 'Directory not empty',
    [ERROR.ELOOP]: 'Too many symbolic links encountered',
    [ERROR.ENOMSG]: 'No message of desired type',
    [ERROR.EIDRM]: 'Identifier removed',
    [ERROR.ECHRNG]: 'Channel number out of range',
    [ERROR.EL2NSYNC]: 'Level 2 not synchronized',
    [ERROR.EL3HLT]: 'Level 3 halted',
    [ERROR.EL3RST]: 'Level 3 reset',
    [ERROR.ELNRNG]: 'Link number out of range',
    [ERROR.EUNATCH]: 'Protocol driver not attached',
    [ERROR.ENOCSI]: 'No CSI structure available',
    [ERROR.EL2HLT]: 'Level 2 halted',
    [ERROR.EBADE]: 'Invalid exchange',
    [ERROR.EBADR]: 'Invalid request descriptor',
    [ERROR.EXFULL]: 'Exchange full',
    [ERROR.ENOANO]: 'No anode',
    [ERROR.EBADRQC]: 'Invalid request code',
    [ERROR.EBADSLT]: 'Invalid slot',
    [ERROR.EBFONT]: 'Bad font file format',
    [ERROR.ENOSTR]: 'Device not a stream',
    [ERROR.ENODATA]: 'No data available',
    [ERROR.ETIME]: 'Timer expired',
    [ERROR.ENOSR]: 'Out of streams resources',
    [ERROR.ENONET]: 'Machine is not on the network',
    [ERROR.ENOPKG]: 'Package not installed',
    [ERROR.EREMOTE]: 'Object is remote',
    [ERROR.ENOLINK]: 'Link has been severed',
    [ERROR.EADV]: 'Advertise error',
    [ERROR.ESRMNT]: 'Srmount error',
    [ERROR.ECOMM]: 'Communication error on send',
    [ERROR.EPROTO]: 'Protocol error',
    [ERROR.EMULTIHOP]: 'Multihop attempted',
    [ERROR.EDOTDOT]: 'RFS specific error',
    [ERROR.EBADMSG]: 'Not a data message',
    [ERROR.EOVERFLOW]: 'Value too large for defined data type',
    [ERROR.ENOTUNIQ]: 'Name not unique on network',
    [ERROR.EBADFD]: 'File descriptor in bad state',
    [ERROR.EREMCHG]: 'Remote address changed',
    [ERROR.ELIBACC]: 'Can not access a needed shared library',
    [ERROR.ELIBBAD]: 'Accessing a corrupted shared library',
    [ERROR.ELIBSCN]: '.lib section in a.out corrupted',
    [ERROR.ELIBMAX]: 'Attempting to link in too many shared libraries',
    [ERROR.ELIBEXEC]: 'Cannot exec a shared library directly',
    [ERROR.EILSEQ]: 'Illegal byte sequence',
    [ERROR.ERESTART]: 'Interrupted system call should be restarted',
    [ERROR.ESTRPIPE]: 'Streams pipe error',
    [ERROR.EUSERS]: 'Too many users',
    [ERROR.ENOTSOCK]: 'Socket operation on non-socket',
    [ERROR.EDESTADDRREQ]: 'Destination address required',
    [ERROR.EMSGSIZE]: 'Message too long',
    [ERROR.EPROTOTYPE]: 'Protocol wrong type for socket',
    [ERROR.ENOPROTOOPT]: 'Protocol not available',
    [ERROR.EPROTONOSUPPORT]: 'Protocol not supported',
    [ERROR.ESOCKTNOSUPPORT]: 'Socket type not supported',
    [ERROR.EOPNOTSUPP]: 'Operation not supported on transport endpoint',
    [ERROR.EPFNOSUPPORT]: 'Protocol family not supported',
    [ERROR.EAFNOSUPPORT]: 'Address family not supported by protocol',
    [ERROR.EADDRINUSE]: 'Address already in use',
    [ERROR.EADDRNOTAVAIL]: 'Cannot assign requested address',
    [ERROR.ENETDOWN]: 'Network is down',
    [ERROR.ENETUNREACH]: 'Network is unreachable',
    [ERROR.ENETRESET]: 'Network dropped connection because of reset',
    [ERROR.ECONNABORTED]: 'Software caused connection abort',
    [ERROR.ECONNRESET]: 'Connection reset by peer',
    [ERROR.ENOBUFS]: 'No buffer space available',
    [ERROR.EISCONN]: 'Transport endpoint is already connected',
    [ERROR.ENOTCONN]: 'Transport endpoint is not connected',
    [ERROR.ESHUTDOWN]: 'Cannot send after transport endpoint shutdown',
    [ERROR.ETOOMANYREFS]: 'Too many references: cannot splice',
    [ERROR.ETIMEDOUT]: 'Connection timed out',
    [ERROR.ECONNREFUSED]: 'Connection refused',
    [ERROR.EHOSTDOWN]: 'Host is down',
    [ERROR.EHOSTUNREACH]: 'No route to host',
    [ERROR.EALREADY]: 'Operation already in progress',
    [ERROR.EINPROGRESS]: 'Operation now in progress',
    [ERROR.ESTALE]: 'Stale NFS file handle',
    [ERROR.EUCLEAN]: 'Structure needs cleaning',
    [ERROR.ENOTNAM]: 'Not a XENIX named type file',
    [ERROR.ENAVAIL]: 'No XENIX semaphores available',
    [ERROR.EISNAM]: 'Is a named type file',
    [ERROR.EREMOTEIO]: 'Remote I/O error',
    [ERROR.EDQUOT]: 'Quota exceeded',
    [ERROR.ENOMEDIUM]: 'No medium found',
    [ERROR.EMEDIUMTYPE]: 'Wrong medium type',
};


export enum SYS {
    read = 0,
    write = 1,
    open = 2,
    close = 3,
    stat = 4,
    fstat = 5,
    lstat = 6,
    poll = 7,
    lseek = 8,
    mmap = 9,
    mprotect = 10,
    munmap = 11,
    brk = 12,
    rt_sigaction = 13,
    rt_sigprocmask = 14,
    rt_sigreturn = 15,
    ioctl = 16,
    pread64 = 17,
    pwrite64 = 18,
    readv = 19,
    writev = 20,
    access = 21,
    pipe = 22,
    select = 23,
    sched_yield = 24,
    mremap = 25,
    msync = 26,
    mincore = 27,
    madvise = 28,
    shmget = 29,
    shmat = 30,
    shmctl = 31,
    dup = 32,
    dup2 = 33,
    pause = 34,
    nanosleep = 35,
    getitimer = 36,
    alarm = 37,
    setitimer = 38,
    getpid = 39,
    sendfile = 40,
    socket = 41,
    connect = 42,
    accept = 43,
    sendto = 44,
    recvfrom = 45,
    sendmsg = 46,
    recvmsg = 47,
    shutdown = 48,
    bind = 49,
    listen = 50,
    getsockname = 51,
    getpeername = 52,
    socketpair = 53,
    setsockopt = 54,
    getsockopt = 55,

    shmdt = 67,

    fcntl = 72,

    fsync = 74,
    fdatasync = 75,
    truncate = 76,
    ftruncate = 77,
    getdents = 78,
    getcwd = 79,
    chdir = 80,
    fchdir = 81,
    rename = 82,
    mkdir = 83,
    rmdir = 84,
    creat = 85,
    link = 86,
    unlink = 87,
    symlink = 88,
    readlink = 89,
    chmod = 90,
    fchmod = 91,
    chown = 92,
    fchown = 93,
    lchown = 94,
    umask = 95,
    gettimeofday = 96,
    getrlimit = 97,
    getrusage = 98,

    getuid = 102,
    getgid = 104,

    geteuid = 107,
    getegid = 108,
    setpgid = 109,
    getppid = 110,

    utime = 132,

    epoll_create = 213,

    getdents64 = 217,

    epoll_wait = 232,
    epoll_ctl = 233,

    utimes = 235,

    inotify_init = 253,
    inotify_add_watch = 254,
    inotify_rm_watch = 255,

    mkdirat = 258,

    futimesat = 261,

    utimensat = 280,

    eventfd = 284,

    accept4 = 288,

    epoll_create1 = 291,

    inotify_init1 = 294,


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
}


export const ARGS = {
    [SYS.open]: [['const char*', 'pathname'], ['int', 'flags'], ['mode_t', 'mode']],
    [SYS.close]: [['int', 'fd']],
    [SYS.write]: [['int', 'fd'], ['const void*', 'buf'], ['size_t', 'count']],
    [SYS.read]: [['int', 'fd'], ['void*', 'buf'], ['size_t', 'count']],
    [SYS.getcwd]: [['char*', 'buf'], ['size_t', 'size']],
    [SYS.stat]: [['const char*', 'pathname'], ['struct stat*', 'buf']],
    [SYS.fstat]: [['int', 'fd'], ['struct stat*', 'buf']],
    [SYS.lstat]: [['const char*', 'pathname'], ['struct stat*', 'buf']],
    [SYS.socket]: [['int', 'domain'], ['int', 'type'], ['int', 'protocol']],
    [SYS.connect]: [['int', 'sockfd'], ['const struct sockaddr*', 'addr'], ['socklen_t', 'addrlen']],
    [SYS.accept]: [['int', 'sockfd'], ['struct sockaddr*', 'addr'], ['socklen_t*', 'addrlen']],
    // [SYS.sendto]: [['int', 'sockfd'], ['const void*', 'buf'], ['size_t', 'len'], ['int', 'flags'], ['const struct sockaddr*', 'dest_addr'], ['socklen_t', 'addrlen']],
    [SYS.sendto]: [['int', 'sockfd'], ['void*', 'buf'], ['size_t', 'len'], ['int', 'flags'], ['sockaddr*', 'dest_addr'], ['socklen_t', 'addrlen']],
    // [SYS.recvfrom]: [['int', 'sockfd'], ['void*', 'buf'], ['size_t', 'len'], ['int', 'flags'], ['struct sockaddr*', 'src_addr'], ['socklen_t*', 'addrlen']],
    [SYS.recvfrom]: [['int', 'sockfd'], ['void*', 'buf'], ['size_t', 'len'], ['int', 'flags'], ['sockaddr*', 'src_addr'], ['socklen_t*', 'addrlen']],
    // [SYS.bind]: [['int', 'sockfd'], ['const struct sockaddr*', 'addr'], ['socklen_t', 'addrlen']],
    [SYS.bind]: [['int', 'sockfd'], ['sockaddr*', 'addr'], ['socklen_t', 'addrlen']],
    [SYS.listen]: [['int', 'socket'], ['int', 'backlog']],
    [SYS.getsockopt]: [['int', 'sockfd'], ['int', 'level'], ['int', 'optname'], ['void*', 'optval'], ['socklen_t*', 'optlen']],
    // [SYS.setsockopt]: [['int', 'sockfd'], ['int', 'level'], ['int', 'optname'], ['const void*', 'optval'], ['socklen_t', 'optlen']],
    [SYS.setsockopt]: [['int', 'sockfd'], ['int', 'level'], ['int', 'optname'], ['void*', 'optval'], ['socklen_t', 'optlen']],
    [SYS.epoll_create]: [['int', 'size']],
    [SYS.epoll_create1]: [['int', 'flags']],
    // [SYS.epoll_wait]: [['int', 'epfd'], ['struct epoll_event*', 'events'], ['int', 'maxevents'], ['int', 'timeout']],
    [SYS.epoll_wait]: [['int', 'epfd'], ['epoll_event*', 'events'], ['int', 'maxevents'], ['int', 'timeout']],
    [SYS.epoll_ctl]: [['int', 'epfd'], ['int', 'op'], ['int', 'fd'], ['struct epoll_event*', 'event']],
    [SYS.eventfd]: [['unsigned int', 'initval'], ['int', 'flags']],
    [SYS.mmap]: [['void*', 'addr'], ['size_t', 'length'], ['int', 'prot'], ['int', 'flags'], ['int', 'fd'], ['off_t', 'offset']],
    [SYS.munmap]: [['void*', 'addr'], ['size_t', 'length']],
};


export const RESULT = {
    [SYS.write]: 'bytes written',
    [SYS.read]: 'bytes read',
    [SYS.getcwd]: 'path length',
    [SYS.getpid]: 'process ID',
    [SYS.epoll_create1]: 'epoll file descriptor',
    // [SYS.mmap]: 'address',
};

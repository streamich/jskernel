/// <reference path="typing.d.ts" />
import * as types from './platforms/linux_x86_64/types';
export * from './platforms/linux_x86_64/types';
import { Struct } from './typebase';
export declare var arch: {
    isLE: boolean;
    kernel: string;
    int: number;
    SYS: {
        read: number;
        write: number;
        open: number;
        close: number;
        stat: number;
        fstat: number;
        lstat: number;
        lseek: number;
        mmap: number;
        mprotect: number;
        munmap: number;
        brk: number;
        rt_sigaction: number;
        rt_sigprocmask: number;
        rt_sigreturn: number;
        ioctl: number;
        pread64: number;
        pwrite64: number;
        readv: number;
        writev: number;
        access: number;
        pipe: number;
        sched_yield: number;
        mremap: number;
        msync: number;
        mincore: number;
        madvise: number;
        shmget: number;
        shmat: number;
        shmctl: number;
        dup: number;
        dup2: number;
        pause: number;
        nanosleep: number;
        getitimer: number;
        alarm: number;
        setitimer: number;
        getpid: number;
        sendfile: number;
        socket: number;
        connect: number;
        accept: number;
        sendto: number;
        recvfrom: number;
        sendmsg: number;
        recvmsg: number;
        shutdown: number;
        bind: number;
        listen: number;
        getsockname: number;
        getpeername: number;
        socketpair: number;
        setsockopt: number;
        getsockopt: number;
        shmdt: number;
        fcntl: number;
        fsync: number;
        fdatasync: number;
        truncate: number;
        ftruncate: number;
        getdents: number;
        getcwd: number;
        chdir: number;
        fchdir: number;
        rename: number;
        mkdir: number;
        rmdir: number;
        creat: number;
        link: number;
        unlink: number;
        symlink: number;
        readlink: number;
        chmod: number;
        fchmod: number;
        chown: number;
        fchown: number;
        lchown: number;
        umask: number;
        gettimeofday: number;
        getrlimit: number;
        getrusage: number;
        getuid: number;
        getgid: number;
        geteuid: number;
        getegid: number;
        setpgid: number;
        getppid: number;
        utime: number;
        epoll_create: number;
        getdents64: number;
        epoll_wait: number;
        epoll_ctl: number;
        utimes: number;
        inotify_init: number;
        inotify_add_watch: number;
        inotify_rm_watch: number;
        mkdirat: number;
        futimesat: number;
        utimensat: number;
        accept4: number;
        epoll_create1: number;
        inotify_init1: number;
    };
    types: typeof types;
};
export * from './ctypes';
export * from './socket';
export declare type number64 = [number, number];
export declare type Taddr = Buffer | ArrayBuffer | Uint8Array;
export declare type TcallbackTyped<T> = (result: T) => void;
export declare type TcallbackErrTyped<E, T> = (err?: E, result?: T) => void;
export declare type Tcallback = TcallbackTyped<number>;
export declare function read(fd: number, buf: Buffer): number;
export declare function readAsync(fd: number, buf: Buffer, callback: Tcallback): void;
export declare function write(fd: number, buf: string | Buffer): number;
export declare function writeAsync(fd: number, buf: string | Buffer, callback: Tcallback): any;
export declare function open(pathname: string, flags: types.FLAG, mode?: types.S): number;
export declare function openAsync(pathname: string, flags: types.FLAG, mode: types.S, callback: Tcallback): void;
export declare function close(fd: number): number;
export declare function closeAsync(fd: number, callback: Tcallback): void;
export declare function access(pathname: string, mode: number): number;
export declare function accessAsync(pathname: string, mode: number, callback: Tcallback): void;
export declare function chmod(pathname: string, mode: number): number;
export declare function chmodAsync(pathname: string, mode: number, callback: Tcallback): void;
export declare function fchmod(fd: number, mode: number): number;
export declare function fchmodAsync(fd: number, mode: number, callback: Tcallback): void;
export declare function chown(pathname: string, owner: number, group: number): number;
export declare function chownAsync(pathname: string, owner: number, group: number, callback: Tcallback): void;
export declare function fchown(fd: number, owner: number, group: number): number;
export declare function fchownAsync(fd: number, owner: number, group: number, callback: Tcallback): void;
export declare function lchown(pathname: string, owner: number, group: number): number;
export declare function lchownAsync(pathname: string, owner: number, group: number, callback: Tcallback): void;
export declare function fsync(fd: number): number;
export declare function fsyncAsync(fd: number, callback: Tcallback): void;
export declare function fdatasync(fd: number): number;
export declare function fdatasyncAsync(fd: number, callback: Tcallback): void;
export declare function stat(filepath: string): types.stat;
export declare function statAsync(filepath: string, callback: TcallbackErrTyped<Error | number, types.stat>): void;
export declare function lstat(linkpath: string): types.stat;
export declare function lstatAsync(linkpath: string, callback: TcallbackErrTyped<Error | number, types.stat>): void;
export declare function fstat(fd: number): types.stat;
export declare function fstatAsync(fd: number, callback: TcallbackErrTyped<Error | number, types.stat>): void;
export declare function truncate(path: string, length: number): number;
export declare function truncateAsync(path: string, length: number, callback: Tcallback): void;
export declare function ftruncate(fd: number, length: number): number;
export declare function ftruncateAsync(fd: number, length: number, callback: Tcallback): void;
export declare function lseek(fd: number, offset: number, whence: types.SEEK): number;
export declare function lseekAsync(fd: number, offset: number, whence: types.SEEK, callback: Tcallback): void;
export declare function rename(oldpath: string, newpath: string): number;
export declare function renameAsync(oldpath: string, newpath: string, callback: Tcallback): void;
export declare function mkdir(pathname: string, mode: number): number;
export declare function mkdirAsync(pathname: string, mode: number, callback: Tcallback): void;
export declare function mkdirat(dirfd: number, pathname: string, mode: number): number;
export declare function mkdiratAsync(dirfd: number, pathname: string, mode: number, callback: Tcallback): void;
export declare function rmdir(pathname: string): number;
export declare function rmdirAsync(pathname: string, callback: Tcallback): void;
export declare function getcwd(): string;
export declare function getcwdAsync(callback: TcallbackErrTyped<number, string>): void;
export declare function getdents64(fd: number, dirp: Buffer): number;
export declare function getdents64Async(fd: number, dirp: Buffer, callback: Tcallback): void;
export interface IReaddirEntry {
    ino: [number, number];
    offset: number;
    type: number;
    name: string;
}
export declare function readdir(path: string, encoding?: string): IReaddirEntry[];
export declare function readdirList(path: string, encoding?: string): string[];
export declare function readdirListAsync(path: string, encoding: string, callback: TcallbackErrTyped<number, string[]>): void;
export declare function symlink(target: string, linkpath: string): number;
export declare function symlinkAsync(target: string, linkpath: string, callback: Tcallback): void;
export declare function unlink(pathname: string): number;
export declare function unlinkAsync(pathname: string, callback: Tcallback): void;
export declare function readlink(pathname: string, buf: Buffer): number;
export declare function readlinkAsync(pathname: string, buf: Buffer, callback: Tcallback): void;
export declare function link(oldpath: string, newpath: string): number;
export declare function linkAsync(oldpath: string, newpath: string, callback: Tcallback): void;
export declare function utime(filename: string, times: types.utimbuf): number;
export declare function utimeAsync(filename: string, times: types.utimbuf, callback: Tcallback): void;
export declare function utimes(filename: string, times: types.timevalarr): number;
export declare function utimesAsync(filename: string, times: types.timevalarr, callback: Tcallback): void;
export declare function socket(domain: types.AF, type: types.SOCK, protocol: number): number;
export declare function socketAsync(domain: types.AF, type: types.SOCK, protocol: number, callback: Tcallback): void;
export declare function connect(fd: number, sockaddr: types.sockaddr_in): number;
export declare function connectAsync(fd: number, sockaddr: types.sockaddr_in, callback: Tcallback): void;
export declare function bind(fd: number, sockaddr: types.sockaddr_in, addr_type: Struct): number;
export declare function bindAsync(fd: number, sockaddr: types.sockaddr_in, addr_type: Struct, callback: Tcallback): void;
export declare function listen(fd: number, backlog: number): number;
export declare function listenAsync(fd: number, backlog: number, callback: Tcallback): void;
export declare function accept(fd: number, buf: Buffer): number;
export declare function acceptAsync(fd: number, buf: Buffer, callback: Tcallback): void;
export declare function accept4(fd: number, buf: Buffer, flags: types.SOCK): number;
export declare function accept4Async(fd: number, buf: Buffer, flags: types.SOCK, callback: Tcallback): void;
export declare function shutdown(fd: number, how: types.SHUT): number;
export declare function shutdownAsync(fd: number, how: types.SHUT, callback: Tcallback): void;
export declare function send(fd: number, buf: Buffer, flags?: types.MSG): number;
export declare function sendAsync(fd: number, buf: Buffer, flags: types.MSG, callback: Tcallback): void;
export declare function sendto(fd: number, buf: Buffer, flags?: types.MSG, addr?: types.sockaddr_in, addr_type?: Struct): number;
export declare function sendtoAsync(fd: number, buf: Buffer, flags: types.MSG, addr: types.sockaddr_in, addr_type: Struct, callback: Tcallback): void;
export declare function recv(sockfd: number, buf: Buffer, flags?: number): number;
export declare function recvAsync(sockfd: number, buf: Buffer, flags: number, callback: Tcallback): void;
export declare function recvfrom(sockfd: number, buf: Buffer, flags: number, addr?: types.sockaddr_in, addr_type?: Struct): number;
export declare function recvfromAsync(sockfd: number, buf: Buffer, flags: number, addr: types.sockaddr_in, addr_type: Struct, callback: Tcallback): void;
export declare function setsockopt(sockfd: number, level: number, optname: number, optval: Buffer): number;
export declare function getpid(): number;
export declare function getppid(): number;
export declare function getppidAsync(callback: Tcallback): void;
export declare function getuid(): number;
export declare function geteuid(): number;
export declare function getgid(): number;
export declare function getegid(): number;
export declare function fcntl(fd: number, cmd: types.FCNTL, arg?: number): number;
export declare function epoll_create(size: number): number;
export declare function epoll_create1(flags: types.EPOLL): number;
export declare function epoll_wait(epfd: number, buf: Buffer, maxevents: number, timeout: number): number;
export declare function epoll_ctl(epfd: number, op: types.EPOLL_CTL, fd: number, epoll_event: types.epoll_event): number;
export declare function inotify_init(): number;
export declare function inotify_init1(flags: types.IN): number;
export declare function inotify_add_watch(fd: number, pathname: string, mask: types.IN): number;
export declare function inotify_rm_watch(fd: number, wd: number): number;
export declare function mmap(addr: number, length: number, prot: types.PROT, flags: types.MAP, fd: number, offset: number): number64;
export declare function munmap(addr: Buffer, length: number): number;
export declare function mprotect(addr: Taddr, len: number, prot: types.PROT): number;
/**
 * @param key {number}
 * @param size {number}
 * @param shmflg {IPC|FLAG} If shmflg specifies both IPC_CREAT and IPC_EXCL and a shared memory segment already exists
 *      for key, then shmget() fails with errno set to EEXIST. (This is analogous to the effect of the combination
 *      O_CREAT | O_EXCL for open(2).)
 * @returns {number} `shmid` -- ID of the allocated memory, if positive.
 */
export declare function shmget(key: number, size: number, shmflg: types.IPC | types.FLAG): number;
/**
 * @param shmid {number} ID returned by `shmget`.
 * @param shmaddr {number} Optional approximate address where to allocate memory, or NULL.
 * @param shmflg {SHM}
 * @returns {number}
 */
export declare function shmat(shmid: number, shmaddr?: number, shmflg?: types.SHM): number64;
/**
 * @param shmaddr {number}
 * @returns {number} On success shmdt() returns 0; on error -1 is returned, and errno is set to indicate the cause of the error.
 */
export declare function shmdt(shmaddr: number): number;
/**
 * Performs the control operation specified by cmd on the shared memory segment whose identifier is given in shmid.
 *
 * In `libc`:
 *
 *      int shmctl(int shmid, int cmd, struct shmid_ds *buf);
 *
 * Reference:
 *
 *  - http://linux.die.net/man/2/shmctl
 *
 * @param shmid {number}
 * @param cmd {defs.IPC|defs.SHM}
 * @param buf {Buffer|defs.shmid_ds|defs.NULL} Buffer of size `defs.shmid_ds.size` where kernel will write reponse, or
 *      `defs.shmid_ds` structure that will be serialized for kernel to read data from, or 0 if no argument needed.
 * @returns {number} A successful IPC_INFO or SHM_INFO operation returns the index of the highest used entry in the
 *      kernel's internal array recording information about all shared memory segments. (This information can be used
 *      with repeated SHM_STAT operations to obtain information about all shared memory segments on the system.) A
 *      successful SHM_STAT operation returns the identifier of the shared memory segment whose index was given in
 *      shmid. Other operations return 0 on success. On error, -1 is returned, and errno is set appropriately.
 */
export declare function shmctl(shmid: number, cmd: types.IPC | types.SHM, buf?: Buffer | types.shmid_ds | number): number;

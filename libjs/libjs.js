// # libjs
//
// Usage example, read 1024 bytes from a file and print to console:
//
//     var libjs = require('libjs');
//     var fd = libjs.open('myfile.txt', 0);
//     var buf = new Buffer(1024);
//     var bytes = libjs.read(fd, buf);
//     buf = buf.slice(0, bytes);
//     libjs.write(1, buf);
//     libjs.close(fd);
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
// `libjs` creates wrappers around system calls, similar to what `libc` does for `C` language.
var sys = require('./sys');
// [libsys](http://www.npmjs.com/package/libsys) library contains our only native dependency -- the `syscall` function:
//
//     sys.syscall(cmd: number, ...args): number
// `defs` provides platform specific constants and structs, the default one we use is `x86_64_linux`.
var defs = require('./definitions');
// In development mode we use `debug` library to trace all our system calls.
var debug = require('debug')('libjs:syscall');
// To see the debug output, set `DEBUG` environment variable to `libjs:*`, example:
//
//     DEBUG=libjs:* node script.js
// Export definitions and other modules all as part of the library.
__export(require('./ctypes'));
__export(require('./definitions'));
__export(require('./socket'));
// ## Files
// 
// Standard file operations, which operate on most of the Linux/Unix file descriptors.
// ### read
//
//     read(fd: number, buf: Buffer): number
// 
// Read data from file associated with `fd` file descriptor into buffer `buf`.
// Up to size of the `buf.length` will be read, or less.
//
// Returns a `number` which is the actual bytes read into the buffer, if negative,
// represents an error. If zero, represents *end-of-file*, but if `buf` is of length
// zero than zero does not necessarily mean *end-of-file*.
function read(fd, buf) {
    debug('read', fd, sys.addr64(buf), buf.length);
    return sys.syscall(defs.syscalls.read, fd, buf, buf.length);
}
exports.read = read;
// ### write
//
//     write(fd: number, buf: string|Buffer): number
//
// Write data to a file descriptor.
function write(fd, buf) {
    debug('write', fd);
    if (!(buf instanceof Buffer))
        buf = new Buffer(buf + '\0');
    return sys.syscall(defs.syscalls.write, fd, buf, buf.length);
}
exports.write = write;
// Usage example, write to console (where `STDOUT` has value `1` as a file descriptor):
//
//     libjs.write(1, 'Hello console\n');
// ### open
// 
//     open(pathname: string, flags: defs.FLAG, mode?: defs.S): number
// 
// Opens a file, returns file descriptor on success or a negative number representing an error.
function open(pathname, flags, mode) {
    debug('open', pathname, flags, mode);
    var args = [defs.syscalls.open, pathname, flags];
    if (typeof mode === 'number')
        args.push(mode);
    return sys.syscall.apply(null, args);
}
exports.open = open;
// Example, read data from a file:
//
//     var fd = libjs.open('/tmp/data.txt', libjs.FLAG.O_RDONLY);
//     var buf = new Buffer(1024);
//     libjs.read(fd, buf);
// ### close
//
// Close a file descriptor.
function close(fd) {
    debug('close', fd);
    return sys.syscall(defs.syscalls.close, fd);
}
exports.close = close;
// ### access
//
//     access(pathname: string, mode: number): number
//
// In `libc`, see [access(2)](http://man7.org/linux/man-pages/man2/faccessat.2.html)::
//
//     int access(const char *pathname, int mode);
//
// Check user's permissions for a file.
function access(pathname, mode) {
    debug('access', pathname, mode);
    return sys.syscall(defs.syscalls.access, pathname, mode);
}
exports.access = access;
// ### chmod and fchmod
//
//     chmod(pathname: string, mode: number): number
//     fchmod(fd: number, mode: number): number
//
// In `libc`, see [chmod(2)](http://man7.org/linux/man-pages/man2/chmod.2.html):
//
//     int chmod(const char *pathname, mode_t mode);
//     int fchmod(int fd, mode_t mode);
//
// Change permissions of a file. On success, zero is returned.  On error, -1 is returned,
// and errno is set appropriately.
function chmod(pathname, mode) {
    debug('chmod', pathname, mode);
    return sys.syscall(defs.syscalls.chmod, pathname, mode);
}
exports.chmod = chmod;
function fchmod(fd, mode) {
    debug('fchmod', fd, mode);
    return sys.syscall(defs.syscalls.chmod, fd, mode);
}
exports.fchmod = fchmod;
// ### chown, fchown and lchown
//
//     chown(pathname: string, owner: number, group: number): number
//     fchown(fd: number, owner: number, group: number): number
//     lchown(pathname: string, owner: number, group: number): number
//
// In `libc`, [chown(2)](http://man7.org/linux/man-pages/man2/lchown.2.html):
//
//     int chown(const char *pathname, uid_t owner, gid_t group);
//     int fchown(int fd, uid_t owner, gid_t group);
//     int lchown(const char *pathname, uid_t owner, gid_t group);
//
// These system calls change the owner and group of a file.  The
// `chown()`, `fchown()`, and `lchown()` system calls differ only in how the
// file is specified:
//
//  - `chown()` changes the ownership of the file specified by pathname, which is dereferenced if it is a symbolic link.
//  - `fchown()` changes the ownership of the file referred to by the open file descriptor fd.
//  - `lchown()` is like chown(), but does not dereference symbolic links.
function chown(pathname, owner, group) {
    debug('chown', pathname, owner, group);
    return sys.syscall(defs.syscalls.chown, pathname, owner, group);
}
exports.chown = chown;
function fchown(fd, owner, group) {
    debug('fchown', fd, owner, group);
    return sys.syscall(defs.syscalls.fchown, fd, owner, group);
}
exports.fchown = fchown;
function lchown(pathname, owner, group) {
    debug('lchown', pathname, owner, group);
    return sys.syscall(defs.syscalls.lchown, pathname, owner, group);
}
exports.lchown = lchown;
// ## fsync and fdatasync
//
// Synchronize a file's in-core state with storage.
function fsync(fd) {
    debug('fsync', fd);
    return sys.syscall(defs.syscalls.fsync, fd);
}
exports.fsync = fsync;
function fdatasync(fd) {
    debug('fdatasync', fd);
    return sys.syscall(defs.syscalls.fdatasync, fd);
}
exports.fdatasync = fdatasync;
// ### stat, lstat, fstat
//
//     stat(filepath: string): defs.stat
//     lstat(linkpath: string): defs.stat
//     fstat(fd: number): defs.stat
// 
// In `libc`, see [stat(2)](http://man7.org/linux/man-pages/man2/stat.2.html):
//
//     int stat(const char *pathname, struct stat *buf);
//     int fstat(int fd, struct stat *buf);
//     int lstat(const char *pathname, struct stat *buf);
//
// Returns a `stat` object of the form:
//
//     interface stat {
//         dev: number;
//         ino: number;
//         nlink: number;
//         mode: number;
//         uid: number;
//         gid: number;
//         rdev: number;
//         size: number;
//         blksize: number;
//         blocks: number;
//         atime: number;
//         atime_nsec: number;
//         mtime: number;
//         mtime_nsec: number;
//         ctime: number;
//         ctime_nsec: number;
//     }
//
// Fetches and returns statistics about a file.
function stat(filepath) {
    debug('stat', filepath);
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.stat, filepath, buf);
    if (result == 0)
        return defs.stat.unpack(buf);
    throw result;
}
exports.stat = stat;
function lstat(linkpath) {
    debug('lstat', linkpath);
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.lstat, linkpath, buf);
    if (result == 0)
        return defs.stat.unpack(buf);
    throw result;
}
exports.lstat = lstat;
function fstat(fd) {
    debug('fstat', fd);
    var buf = new Buffer(defs.stat.size);
    var result = sys.syscall(defs.syscalls.fstat, fd, buf);
    if (result == 0)
        return defs.stat.unpack(buf);
    throw result;
}
exports.fstat = fstat;
// ### truncate and ftruncate
//
//     truncate(path: string, length: number): number
//     ftruncate(fd: number, length: number): number
//
// In `libc`, see [truncate(2)](http://man7.org/linux/man-pages/man2/truncate.2.html):
//
//     int truncate(const char *path, off_t length);
//     int ftruncate(int fd, off_t length);
//
// Truncate a file to a specified length
function truncate(path, length) {
    debug('truncate', path, length);
    return sys.syscall(defs.syscalls.truncate, path, length);
}
exports.truncate = truncate;
function ftruncate(fd, length) {
    debug('ftruncate', fd, length);
    return sys.syscall(defs.syscalls.ftruncate, fd, length);
}
exports.ftruncate = ftruncate;
// ### lseek
//
//     lseek(fd: number, offset: number, whence: defs.SEEK): number
//
// Seek into position in a file. In `libc`, see [lseek(2)](http://man7.org/linux/man-pages/man2/lseek.2.html):
//
//     off_t lseek(int fildes, off_t offset, int whence);
//
// Reposition read/write file offset.
function lseek(fd, offset, whence) {
    debug('lseek', fd, offset, whence);
    return sys.syscall(defs.syscalls.lseek, fd, offset, whence);
}
exports.lseek = lseek;
// ### rename
//
//     rename(oldpath: string, newpath: string): number
//
// In `libc`, see [rename(2)](http://man7.org/linux/man-pages/man2/rename.2.html):
//
//     int rename(const char *oldpath, const char *newpath);
//
// change the name or location of a file
function rename(oldpath, newpath) {
    debug('rename', oldpath, newpath);
    return sys.syscall(defs.syscalls.rename, oldpath, newpath);
}
exports.rename = rename;
// ## Directories
//
// Now we implement functions for working with directories.
// ### mkdir, mkdirat and rmdir
//
//     mkdir(pathname: string, mode: number): number
//     mkdirat(dirfd: number, pathname: string, mode: number): number
//     rmdir(pathname: string): number
//
// In `libc`, see [mkdir(2)](http://man7.org/linux/man-pages/man2/mkdir.2.html) and [rmdir(2)](http://man7.org/linux/man-pages/man2/rmdir.2.html):
//
//     int mkdir(const char *pathname, mode_t mode);
//     int mkdirat(int dirfd, const char *pathname, mode_t mode);
//     int rmdir(const char *dirname);
//
// Use `mkdir` to create a directory and `rmdir` to remove one.
function mkdir(pathname, mode) {
    debug('mkdir', pathname, mode);
    return sys.syscall(defs.syscalls.mkdir, pathname, mode);
}
exports.mkdir = mkdir;
function mkdirat(dirfd, pathname, mode) {
    debug('mkdirat', dirfd, pathname, mode);
    return sys.syscall(defs.syscalls.mkdirat, dirfd, pathname, mode);
}
exports.mkdirat = mkdirat;
function rmdir(pathname) {
    debug('rmdir', pathname);
    return sys.syscall(defs.syscalls.rmdir, pathname);
}
exports.rmdir = rmdir;
// ### getcwd
//
//     getcwd(): string
//
// Returns a *current-working-directory* path `string`, on error, throws a negative `number`
// representing `errno` global variable in `libc`.
//
// First we try to read path into a 64-byte buffer, if buffer is too small, we retry
// using large enough buffer to fit maximum possible file path, `PATH_MAX` is 4096 in `libc`.
//
// > Linux has a maximum filename length of 255 characters for most filesystems (including EXT4), and a maximum path of 4096 characters.
function getcwd() {
    debug('getcwd');
    var buf = new Buffer(64);
    var res = sys.syscall(defs.syscalls.getcwd, buf, buf.length);
    if (res < 0) {
        if (res === -34 /* ERANGE */) {
            // > ERANGE error - The size argument is less than the length of the absolute
            // > pathname of the working directory, including the terminating
            // > null byte.  You need to allocate a bigger array and try again.
            buf = new Buffer(4096);
            res = sys.syscall(defs.syscalls.getcwd, buf, buf.length);
            if (res < 0)
                throw res;
        }
        else
            throw res;
    }
    return buf.slice(0, res).toString();
}
exports.getcwd = getcwd;
// ### getdents64
//
//     getdents64(fd: number, dirp: Buffer): number
//
// In `C` it would be:
//
//     int getdents64(unsigned int fd, struct linux_dirent64 *dirp, unsigned int count);
//
// `libc` does not implement `getdents64` system call, however it uses it internally
// to provide [readdir(3)](http://man7.org/linux/man-pages/man3/readdir.3.html) fucntion.
// We will use this system call to implement our own `readdir` function below.
//
// On success, the number of bytes read is returned.  On end of
// directory, 0 is returned.  On error, -1 is returned, and errno is set
// appropriately.
function getdents64(fd, dirp) {
    debug('getdents64', fd, dirp.length);
    return sys.syscall(defs.syscalls.getdents64, fd, dirp, dirp.length);
}
exports.getdents64 = getdents64;
// The result of `readdir` could look like this:
//
//     [
//         { ino: [ 48879, 0 ], offset: 1, type: 4, name: '.' },
//         { ino: [ 48880, 0 ], offset: 2, type: 4, name: '..' },
//         { ino: [ 48881, 0 ],
//             offset: 3,
//             type: 8,
//             name: 'architecture.gif' },
//     ]
function readdir(path, encoding) {
    if (encoding === void 0) { encoding = 'utf8'; }
    debug('readdir', path, encoding);
    /* Open directory. */
    var fd = open(path, 0 /* O_RDONLY */ | 65536 /* O_DIRECTORY */);
    if (fd < 0)
        throw fd;
    /* Linux will write into our `buf` array of entries of type `linux_dirent64`. */
    var buf = new Buffer(4096);
    var struct = defs.linux_dirent64;
    var list = [];
    var res = getdents64(fd, buf);
    do {
        var offset = 0;
        while (offset + struct.size < res) {
            var unpacked = struct.unpack(buf, offset);
            var name = buf.slice(offset + struct.size, offset + unpacked.d_reclen).toString(encoding);
            name = name.substr(0, name.indexOf("\0"));
            var entry = {
                ino: unpacked.ino64_t,
                offset: unpacked.off64_t[0],
                type: unpacked.d_type,
                name: name
            };
            list.push(entry);
            offset += unpacked.d_reclen;
        }
        res = getdents64(fd, buf);
    } while (res > 0);
    /* `res` should be `0` when we are done. */
    if (res < 0)
        throw res;
    close(fd);
    return list;
}
exports.readdir = readdir;
// `readdirList` reurns a plain `Array` of `string`s of file names in directory,
// excluding `.` and `..` directories, similar to what `fs.readdirSync` does for *Node.js*.
function readdirList(path, encoding) {
    if (encoding === void 0) { encoding = 'utf8'; }
    debug('readdirList', path, encoding);
    var fd = open(path, 0 /* O_RDONLY */ | 65536 /* O_DIRECTORY */);
    if (fd < 0)
        throw fd;
    var buf = new Buffer(4096);
    var struct = defs.linux_dirent64;
    var list = [];
    var res = getdents64(fd, buf);
    do {
        var offset = 0;
        while (offset + struct.size < res) {
            var unpacked = struct.unpack(buf, offset);
            var name = buf.slice(offset + struct.size, offset + unpacked.d_reclen).toString(encoding);
            name = name.substr(0, name.indexOf("\0"));
            if ((name != '.') && (name != '..'))
                list.push(name);
            offset += unpacked.d_reclen;
        }
        res = getdents64(fd, buf);
    } while (res > 0);
    if (res < 0)
        throw res;
    close(fd);
    return list;
}
exports.readdirList = readdirList;
// ## Links
// ### symlink
//
//     symlink(target: string, linkpath: string): number
//
// In `libc`, see [symlink(2)](http://man7.org/linux/man-pages/man2/symlink.2.html):
//
//     int symlink(const char *target, const char *linkpath);
//
// Make a new name for a file.
function symlink(target, linkpath) {
    debug('symlink', target, linkpath);
    return sys.syscall(defs.syscalls.symlink, target, linkpath);
}
exports.symlink = symlink;
// ### unlink
//
//     unlink(pathname: string): number
//
// In `libc`, see [unlink(2)](http://man7.org/linux/man-pages/man2/unlink.2.html):
//
//     int unlink(const char *pathname);
//
// Delete a name and possibly the file it refers to.
function unlink(pathname) {
    debug('unlink', pathname);
    return sys.syscall(defs.syscalls.unlink, pathname);
}
exports.unlink = unlink;
// ### readlink
//
//     readlink(pathname: string, buf: Buffer): number
//
// In `libc`, see [readlink(2)](http://man7.org/linux/man-pages/man2/readlink.2.html):
//
//     ssize_t readlink(const char *pathname, char *buf, size_t bufsiz);
//
// read value of a symbolic link
function readlink(pathname, buf) {
    debug('readlink', pathname, buf.length);
    return sys.syscall(defs.syscalls.readlink, pathname, buf, buf.length);
}
exports.readlink = readlink;
// ### link
//
//     link(oldpath: string, newpath: string): number
//
// In `libc`, see [link(2)](http://man7.org/linux/man-pages/man2/link.2.html):
//
//     int link(const char *oldpath, const char *newpath);
//
// Make a new name for a file.
function link(oldpath, newpath) {
    debug('link', oldpath, newpath);
    return sys.syscall(defs.syscalls.link, oldpath, newpath);
}
exports.link = link;
// ## Time
// ## utime, utimes, utimensat and futimens
// 
// In `libc`:
//
//     int utime(const char *filename, const struct utimbuf *times);
//     int utimes(const char *filename, const struct timeval times[2]);
//     int utimensat(int dirfd, const char *pathname, const struct timespec times[2], int flags);
//     int futimens(int fd, const struct timespec times[2]);
function utime(filename, times) {
    debug('utime', filename, times);
    var buf = defs.utimbuf.pack(times);
    return sys.syscall(defs.syscalls.utime, filename, buf);
}
exports.utime = utime;
function utimes(filename, times) {
    debug('utimes', filename, times);
    var buf = defs.timevalarr.pack(times);
    return sys.syscall(defs.syscalls.utimes, buf);
}
exports.utimes = utimes;
function utimensat(dirfd, pathname, timespecarr, flags) {
}
exports.utimensat = utimensat;
function futimens(fd, times) {
}
exports.futimens = futimens;
// ## Sockets
// ### socket
//
//     socket(domain: defs.AF, type: defs.SOCK, protocol: number): number
//
// In `libc`:
//
//     int socket(int domain, int type, int protocol);
//
// Create an endpoint for communication. On success, a file descriptor for the new socket is returned. On
// error, `errno` is returned.
//
// Useful references:
//  - [Linux socket implementation](https://github.com/torvalds/linux/blob/master/net/socket.c)
//  - [Asynchronous IO introduction](http://www.wangafu.net/~nickm/libevent-book/01_intro.html)
//  - [Asynchronous IO with `epoll` example](https://banu.com/blog/2/how-to-use-epoll-a-complete-example-in-c/epoll-example.c)
function socket(domain, type, protocol) {
    debug('socket', domain, type, protocol);
    return sys.syscall(defs.syscalls.socket, domain, type, protocol);
}
exports.socket = socket;
// ### connect
//
//     connect(fd: number, sockaddr: defs.sockaddr_in): number
//
// In `libc`:
//
//     int connect(sockfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr));
//
// Initiate a connection on a socket.
function connect(fd, sockaddr) {
    debug('connect', fd, sockaddr.sin_addr.s_addr.toString(), require('./socket').hton16(sockaddr.sin_port));
    var buf = defs.sockaddr_in.pack(sockaddr);
    return sys.syscall(defs.syscalls.connect, fd, buf, buf.length);
}
exports.connect = connect;
// ### bind
//
//     bind(fd: number, sockaddr: defs.sockaddr_in): number
//
// In `libc`, see [bind(2)](http://man7.org/linux/man-pages/man2/bind.2.html):
//
//     int bind(int sockfd, const struct sockaddr *addr, socklen_t addrlen);
//
// Bind a name to a socket. On success, zero is returned.
function bind(fd, sockaddr, addr_type) {
    debug('bind', fd, sockaddr, require('./socket').hton16(sockaddr.sin_port));
    var buf = addr_type.pack(sockaddr);
    return sys.syscall(defs.syscalls.bind, fd, buf, buf.length);
}
exports.bind = bind;
// int listen(int sockfd, int backlog);
function listen(fd, backlog) {
    debug('listen', fd, backlog);
    return sys.syscall(defs.syscalls.listen, fd, backlog);
}
exports.listen = listen;
// int accept(int sockfd, struct sockaddr *addr, socklen_t *addrlen);
function accept(fd, buf) {
    debug('accept', fd);
    var buflen = defs.int32.pack(buf.length);
    return sys.syscall(defs.syscalls.accept, fd, buf, buflen);
}
exports.accept = accept;
// int accept4(int sockfd, struct sockaddr *addr, socklen_t *addrlen, int flags);
function accept4(fd, buf, flags) {
    debug('accept4', fd, flags);
    var buflen = defs.int32.pack(buf.length);
    return sys.syscall(defs.syscalls.accept4, fd, buf, buflen, flags);
}
exports.accept4 = accept4;
function shutdown(fd, how) {
    debug('shutdown', fd, how);
    return sys.syscall(defs.syscalls.shutdown, fd, how);
}
exports.shutdown = shutdown;
// ### send and sendto
//
//     send(fd: number, buf: Buffer, flags: defs.MSG = 0): number
//     sendto(fd: number, buf: Buffer, flags: defs.MSG = 0, addr?: defs.sockaddr_in, addr_type?: Struct): number
//
// `send` is simply a proxy for `sendto` without the last two arguments.
//
// In `libc`, see [sendto(2)](http://man7.org/linux/man-pages/man2/sendto.2.html):
//
// ```c
// ssize_t send(int sockfd, const void *buf, size_t len, int flags);
// ssize_t sendto(int sockfd, const void *buf, size_t len, int flags,
// ```
//
// Send a message on a socket.
function send(fd, buf, flags) {
    if (flags === void 0) { flags = 0; }
    debug('send');
    return sendto(fd, buf, flags);
}
exports.send = send;
function sendto(fd, buf, flags, addr, addr_type) {
    if (flags === void 0) { flags = 0; }
    debug('sendto', fd, buf.toString(), buf.length, flags, addr);
    var params = [defs.syscalls.sendto, fd, buf, buf.length, flags, 0, 0];
    if (addr) {
        var addrbuf = addr_type.pack(addr);
        params[5] = addrbuf;
        params[6] = addrbuf.length;
    }
    return sys.syscall.apply(null, params);
}
exports.sendto = sendto;
// ### recv and recvfrom
//
// In `libc`, [recv(2)]():
//
//     ssize_t recv(int sockfd, void *buf, size_t len, int flags);
//     ssize_t recvfrom(int sockfd, void *buf, size_t len, int flags, struct sockaddr *src_addr, socklen_t *addrlen);
//
// Receive a message from a socket. These calls return the number of bytes received.
function recv(sockfd, buf, flags) {
    if (flags === void 0) { flags = 0; }
    debug('recv', sockfd, buf.length, flags);
    return recvfrom(sockfd, buf, flags);
}
exports.recv = recv;
function recvfrom(sockfd, buf, flags, addr, addr_type) {
    debug('recvfrom', sockfd, buf.length, flags, addr);
    var args = [defs.syscalls.recvfrom, sockfd, buf, buf.length, flags, 0, 0];
    if (addr) {
        var addrbuf = addr_type.pack(addr);
        args[5] = addrbuf;
        args[6] = addrbuf.length;
    }
    return sys.syscall.apply(null, args);
}
exports.recvfrom = recvfrom;
// ### setsockopt and getsockopt
//
// In `libc`, see [getsockopt(2)](http://man7.org/linux/man-pages/man2/getsockopt.2.html):
//
//     int setsockopt(int sockfd, int level, int optname, const void *optval, socklen_t optlen);
//     int getsockopt(int sockfd, int level, int optname, void *optval, socklen_t *optlen);
function setsockopt(sockfd, level, optname, optval) {
    debug('setsockopt', sockfd, level, optname, optval.toString(), optval.length);
    return sys.syscall(defs.syscalls.setsockopt, sockfd, level, optname, optval, optval.length);
}
exports.setsockopt = setsockopt;
function getsockopt(sockfd, level, optname, optval) {
    debug('getsockopt', sockfd, level, optname, optval.length);
}
exports.getsockopt = getsockopt;
// ## Process
// ### getpid
//
//     getpid(): number
//
// Get process ID.
function getpid() {
    debug('getpid');
    return sys.syscall(defs.syscalls.getpid);
}
exports.getpid = getpid;
// ### getppid
//
//     getppid(): number
//
// Get parent process ID.
function getppid() {
    debug('getppid');
    return sys.syscall(defs.syscalls.getppid);
}
exports.getppid = getppid;
// ### getuid
//
//     getuid(): number
//
// Get parent user ID.
function getuid() {
    debug('getuid');
    return sys.syscall(defs.syscalls.getuid);
}
exports.getuid = getuid;
// ### geteuid
//
//     geteuid(): number
//
// Get parent real user ID.
function geteuid() {
    debug('geteuid');
    return sys.syscall(defs.syscalls.geteuid);
}
exports.geteuid = geteuid;
// ### getgid
//
//     getgid(): number
//
// Get group ID.
function getgid() {
    debug('getgid');
    return sys.syscall(defs.syscalls.getgid);
}
exports.getgid = getgid;
// ### getgid
//
//     getegid(): number
//
// Get read group ID.
function getegid() {
    debug('getegid');
    return sys.syscall(defs.syscalls.getegid);
}
exports.getegid = getegid;
// ## Events
// ### fcntl
function fcntl(fd, cmd, arg) {
    debug('fcntl', fd, cmd, arg);
    var params = [defs.syscalls.fcntl, fd, cmd];
    if (typeof arg !== 'undefined')
        params.push(arg);
    return sys.syscall.apply(null, params);
}
exports.fcntl = fcntl;
// ### epoll_create
//
// Size is ignored, but must be greater than 0.
//
// In `libc`:
//
//     int epoll_create(int size);
//
function epoll_create(size) {
    debug('epoll_create', size);
    return sys.syscall(defs.syscalls.epoll_create, size);
}
exports.epoll_create = epoll_create;
// int epoll_create1(int flags);
function epoll_create1(flags) {
    debug('epoll_create1');
    return sys.syscall(defs.syscalls.epoll_create1, flags);
}
exports.epoll_create1 = epoll_create1;
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
// http://man7.org/linux/man-pages/man2/epoll_wait.2.html
// int epoll_wait(int epfd, struct epoll_event *events, int maxevents, int timeout);
function epoll_wait(epfd, buf, maxevents, timeout) {
    debug('epoll_wait', epfd, maxevents, timeout);
    return sys.syscall(defs.syscalls.epoll_wait, epfd, buf, maxevents, timeout);
}
exports.epoll_wait = epoll_wait;
// int epoll_pwait(int epfd, struct epoll_event *events, int maxevents, int timeout, const sigset_t *sigmask);
// export function epoll_pwait() {
//
// }
// int epoll_ctl(int epfd, int op, int fd, struct epoll_event *event);
function epoll_ctl(epfd, op, fd, epoll_event) {
    debug('epoll_ctl', epfd, op, fd, epoll_event);
    var buf = defs.epoll_event.pack(epoll_event);
    return sys.syscall(defs.syscalls.epoll_ctl, epfd, op, fd, buf);
}
exports.epoll_ctl = epoll_ctl;
// ### inotify_init, inotify_init1, inotify_add_watch and inotify_rm_watch
//
//     inotify_init(): number
//     inotify_init1(flags: defs.IN): number
//     inotify_add_watch(fd: number, pathname: string, mask: defs.IN): number
//     inotify_rm_watch(fd: number, wd: number): number
//
// In `libc`:
//
//     int inotify_init(void);
//     int inotify_init1(int flags);
//     int inotify_add_watch(int fd, const char *pathname, uint32_t mask);
//     int inotify_rm_watch(int fd, int wd);
//
// Monitoring filesystem events, [inotify(7)](http://man7.org/linux/man-pages/man7/inotify.7.html).
//
// See [`libaio`](http://www.npmjs.com/package/libaio) OOP wrapper `libaio.Notify` around `inotify(7)`
// system calls.
function inotify_init() {
    debug('inotify_init');
    return sys.syscall(defs.syscalls.inotify_init);
}
exports.inotify_init = inotify_init;
function inotify_init1(flags) {
    debug('inotify_init1', flags);
    return sys.syscall(defs.syscalls.inotify_init1, flags);
}
exports.inotify_init1 = inotify_init1;
function inotify_add_watch(fd, pathname, mask) {
    debug('inotify_add_watch', fd, pathname, mask);
    return sys.syscall(defs.syscalls.inotify_add_watch, fd, pathname, mask);
}
exports.inotify_add_watch = inotify_add_watch;
function inotify_rm_watch(fd, wd) {
    debug('inotify_rm_watch', fd, wd);
    return sys.syscall(defs.syscalls.inotify_rm_watch, fd, wd);
}
exports.inotify_rm_watch = inotify_rm_watch;
// ## Memory
// ### mmap
//
// Map files or devices into memory
//
//     mmap(addr: number, length: number, prot: defs.PROT, flags: defs.MAP, fd: number, offset: number): number
//
// In `libc`:
//
//     void *mmap(void *addr, size_t length, int prot, int flags, int fd, off_t offset);
//
function mmap(addr, length, prot, flags, fd, offset) {
    debug('mmap', addr, length, prot, flags, fd, offset);
    return sys.syscall64(defs.syscalls.mmap, addr, length, prot, flags, fd, offset);
}
exports.mmap = mmap;
// ### munmap
//
// In `libc`:
//
//     int munmap(void *addr, size_t length);
//
function munmap(addr, length) {
    debug('munmap', sys.addr64(addr), length);
    return sys.syscall(defs.syscalls.munmap, addr, length);
}
exports.munmap = munmap;
// ### shmget
// 
//     shmget(key: number, size: number, shmflg: defs.IPC|defs.FLAG): number
//
// Allocates a shared memory segment. `shmget()` returns the identifier of the shared memory segment associated with the
// value of the argument key. A new shared memory segment, with size equal to the value of size rounded up to a multiple
// of `PAGE_SIZE`, is created if key has the value `IPC.PRIVATE` or key isn't `IPC.PRIVATE`, no shared memory segment
// corresponding to key exists, and `IPC.CREAT` is specified in `shmflg`.
// 
// In `libc`:
// 
//     int shmget (key_t key, int size, int shmflg);
//
// Reference:
// 
//  - http://linux.die.net/man/2/shmget
// 
// Returns:
// 
//  - If positive: identifier of the shared memory block.
//  - If negative: `errno` =
//    - `EINVAL` -- Invalid segment size specified
//    - `EEXIST` -- Segment exists, cannot create
//    - `EIDRM` -- Segment is marked for deletion, or was removed
//    - `ENOENT` -- Segment does not exist
//    - `EACCES` -- Permission denied
//    - `ENOMEM` -- Not enough memory to create segment
/**
 * @param key {number}
 * @param size {number}
 * @param shmflg {IPC|FLAG} If shmflg specifies both IPC_CREAT and IPC_EXCL and a shared memory segment already exists
 *      for key, then shmget() fails with errno set to EEXIST. (This is analogous to the effect of the combination
 *      O_CREAT | O_EXCL for open(2).)
 * @returns {number} `shmid` -- ID of the allocated memory, if positive.
 */
function shmget(key, size, shmflg) {
    debug('shmget', key, size, shmflg);
    return sys.syscall(defs.syscalls.shmget, key, size, shmflg);
}
exports.shmget = shmget;
// ### shmat`
//
//     shmat(shmid: number, shmaddr: number = defs.NULL, shmflg: defs.SHM = 0): [number, number]
//
// Attaches the shared memory segment identified by shmid to the address space of the calling process.
// 
// In `libc`:
// 
//     void *shmat(int shmid, const void *shmaddr, int shmflg);
// 
// Reference:
// 
//  - http://linux.die.net/man/2/shmat
//
// Returns:
//
//  - On success shmat() returns the address of the attached shared memory segment; on error (void *) -1
//  is returned, and errno is set to indicate the cause of the error.
/**
 * @param shmid {number} ID returned by `shmget`.
 * @param shmaddr {number} Optional approximate address where to allocate memory, or NULL.
 * @param shmflg {SHM}
 * @returns {number}
 */
function shmat(shmid, shmaddr, shmflg) {
    if (shmaddr === void 0) { shmaddr = defs.NULL; }
    if (shmflg === void 0) { shmflg = 0; }
    debug('shmat', shmid, shmaddr, shmflg);
    return sys.syscall64(defs.syscalls.shmat, shmid, shmaddr, shmflg);
}
exports.shmat = shmat;
// ### shmdt
//
// Detaches the shared memory segment located at the address specified by shmaddr from the address space of the calling
// process. The to-be-detached segment must be currently attached with shmaddr equal to the value returned by the
// attaching shmat() call.
//
// In `libc`:
//
//      int shmdt(const void *shmaddr);
//
// Reference:
//
//  - http://linux.die.net/man/2/shmat
/**
 * @param shmaddr {number}
 * @returns {number} On success shmdt() returns 0; on error -1 is returned, and errno is set to indicate the cause of the error.
 */
function shmdt(shmaddr) {
    debug('shmdt', shmaddr);
    return sys.syscall(defs.syscalls.shmdt, shmaddr);
}
exports.shmdt = shmdt;
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
function shmctl(shmid, cmd, buf) {
    if (buf === void 0) { buf = defs.NULL; }
    debug('shmctl', shmid, cmd, buf instanceof Buffer ? '[Buffer]' : buf);
    if (buf instanceof Buffer) {
    }
    else if (typeof buf === 'object') {
        // User provided `defs.shmid_ds` object, so we serialize it.
        buf = defs.shmid_ds.pack(buf);
    }
    else {
    }
    return sys.syscall(defs.syscalls.shmctl, shmid, cmd, buf);
}
exports.shmctl = shmctl;

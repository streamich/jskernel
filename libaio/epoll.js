"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var libjs = require('../libjs/libjs');
var buffer_1 = require('buffer');
function noop() { }
var Socket = (function () {
    function Socket() {
        this.fd = 0; /* `socket` file descriptor */
        this.epfd = 0; /* `epoll` file descriptor */
        this.onstart = noop;
        this.onstop = noop;
        this.ondata = noop;
        this.onerror = noop;
        this.created = false;
    }
    Socket.prototype.start = function () {
        this.fd = libjs.socket(2 /* INET */, this.type, 0);
        if (this.fd < 0)
            throw Error("Could not create scoket: errno = " + this.fd);
        // Socket is not a file, we just created the file descriptor for it, flags
        // for this file descriptor are set to 0 anyways, so we just overwrite 'em,
        // no need to fetch them and OR'em.
        var fcntl = libjs.fcntl(this.fd, 4 /* SETFL */, 2048 /* O_NONBLOCK */);
        if (fcntl < 0)
            throw Error("Could not make socket non-blocking: errno = " + fcntl);
        this.epfd = libjs.epoll_create1(0);
        if (this.epfd < 0)
            throw Error("Could create epoll: errno = " + this.epfd);
        var event = {
            events: 1 /* EPOLLIN */ | 4 /* EPOLLOUT */,
            data: [this.fd, 0]
        };
        var ctl = libjs.epoll_ctl(this.epfd, 1 /* ADD */, this.fd, event);
        if (ctl < 0)
            throw Error("Could not add epoll events: errno = " + ctl);
    };
    Socket.prototype.stop = function () {
        if (this.epfd) {
            libjs.close(this.epfd);
            this.fd = 0;
        }
        if (this.fd) {
            libjs.close(this.fd);
            this.fd = 0;
        }
    };
    return Socket;
}());
exports.Socket = Socket;
var SocketDgram = (function (_super) {
    __extends(SocketDgram, _super);
    function SocketDgram() {
        _super.apply(this, arguments);
        this.type = 2 /* DGRAM */;
    }
    SocketDgram.prototype.send = function (buf, ip, port) {
        var addr = {
            sin_family: 2 /* INET */,
            sin_port: libjs.hton16(port),
            sin_addr: {
                s_addr: new libjs.Ipv4(ip)
            },
            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0]
        };
        // Make sure socket is non-blocking and don't rise `SIGPIPE` signal if the othe end is not receiving.
        var flags = 64 /* DONTWAIT */ | 16384 /* NOSIGNAL */;
        var res = libjs.sendto(this.fd, buf, flags, addr, libjs.sockaddr_in);
        if (res < 0) {
            if (-res == 11 /* EAGAIN */) {
                // This just means, we executed the send *asynchronously*, so no worries.
                return 0;
            }
            else {
                // throw Error(`sendto error, errno = ${res}`);
                return res;
            }
        }
    };
    SocketDgram.prototype.bind = function (port, ip) {
        if (port === void 0) { port = 0; }
        if (ip === void 0) { ip = '0.0.0.0'; }
        var addr = {
            sin_family: 2 /* INET */,
            sin_port: libjs.hton16(port),
            sin_addr: {
                s_addr: new libjs.Ipv4(ip)
            },
            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0]
        };
        return libjs.bind(this.fd, addr, libjs.sockaddr_in);
        // if(res < 0) {
        //     throw Error(`bind error, errno = ${res}`)
        // }
    };
    SocketDgram.prototype.listen = function () {
        var res = libjs.recv(this.fd, buf);
    };
    return SocketDgram;
}(Socket));
exports.SocketDgram = SocketDgram;
var SocketTcp = (function (_super) {
    __extends(SocketTcp, _super);
    function SocketTcp() {
        _super.apply(this, arguments);
        this.type = 1 /* STREAM */;
        this.connected = false;
        this.onconnect = function () { };
        this.ondata = function () { };
        this.onerror = function () { };
        this.pollBound = this.poll.bind(this);
    }
    SocketTcp.prototype.poll = function () {
        var evbuf = new buffer_1.Buffer(libjs.epoll_event.size);
        var waitres = libjs.epoll_wait(this.epfd, evbuf, 1, 0);
        if (waitres > 0) {
            var event = libjs.epoll_event.unpack(evbuf);
            if (!this.connected) {
                if ((event.events & 4 /* EPOLLOUT */) > 0) {
                    // clearInterval(polli);
                    this.connected = true;
                    this.onconnect();
                }
            }
            if ((event.events & 1 /* EPOLLIN */) > 0) {
                var buf = new buffer_1.Buffer(1000);
                var bytes = libjs.read(this.fd, buf);
                if (bytes < -1) {
                    this.onerror(Error("Error reading data: " + bytes));
                }
                if (bytes > 0) {
                    var data = buf.toString().substr(0, bytes);
                    this.ondata(data);
                }
            }
            if ((event.events & 8 /* EPOLLERR */) > 0) {
            }
        }
        if (waitres < 0) {
            this.onerror(Error("Error while waiting for connection: " + waitres));
        }
        // Hook to the global event loop.
        process.nextTick(this.pollBound);
    };
    SocketTcp.prototype.connect = function (opts) {
        // on read check for:
        // EAGAINN and EWOULDBLOCK
        var addr_in = {
            sin_family: 2 /* INET */,
            sin_port: libjs.hton16(opts.port),
            sin_addr: {
                s_addr: new libjs.Ipv4(opts.host)
            },
            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0]
        };
        var res = libjs.connect(this.fd, addr_in);
        // Everything is OK, we are connecting...
        if (res == -115 /* EINPROGRESS */) {
            this.poll(); // Start event loop.
            return;
        }
        // Error occured.
        if (res < 0)
            throw Error("Could no connect: " + res);
        // TODO: undefined behaviour.
        throw Error('Something went not according to plan.');
    };
    // This function has been called by the event loop.
    SocketTcp.prototype.onRead = function () {
    };
    SocketTcp.prototype.write = function (data) {
        var buf = new buffer_1.Buffer(data + '\0');
        var res = libjs.write(this.fd, buf);
        return res;
    };
    return SocketTcp;
}(Socket));
exports.SocketTcp = SocketTcp;
// export abstract class Pool {
//
// }
// export class EpollPool extends Pool {
var Pool = (function () {
    function Pool() {
        this.epfd = 0; /* `epoll` file descriptor */
        this.socks = [];
        this.epfd = libjs.epoll_create1(0);
        if (this.epfd < 0)
            throw Error("Could create epoll: errno = " + this.epfd);
    }
    Pool.prototype.nextTick = function () {
    };
    Pool.prototype.createDgramSocket = function () {
        var sock = new SocketDgram;
        sock.start();
        this.addSocket(sock);
        return sock;
    };
    Pool.prototype.addSocket = function (sock) {
        var event = {
            events: 1 /* EPOLLIN */ | 4 /* EPOLLOUT */,
            data: [sock.fd, 0]
        };
        var ctl = libjs.epoll_ctl(this.epfd, 1 /* ADD */, sock.fd, event);
        if (ctl < 0)
            throw Error("Could not add epoll events: errno = " + ctl);
        this.socks[sock.fd] = sock;
    };
    return Pool;
}());
exports.Pool = Pool;

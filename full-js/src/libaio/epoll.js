"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var libjs = require('../libjs/index');
var static_buffer_1 = require('../lib/static-buffer');
var event_1 = require("./event");
var CHUNK = 11;
var Socket = (function () {
    function Socket() {
        this.poll = null;
        this.fd = 0; // socket` file descriptor
        this.connected = false;
        this.reffed = false;
        this.onstart = event_1.noop; // Maps to "listening" event.
        this.onstop = event_1.noop; // Maps to "close" event.
        this.ondata = event_1.noop; // Maps to "message" event.
        // TODO: Synchronous first level errors: do we (1) `return`, (2) `throw`, or (3) `.onerror()` them?
        this.onerror = event_1.noop; // Maps to "error" event.
    }
    Socket.prototype.start = function () {
        this.fd = libjs.socket(2 /* INET */, this.type, 0);
        if (this.fd < 0)
            return Error("Could not create scoket: errno = " + this.fd);
        // Socket is not a file, we just created the file descriptor for it, flags
        // for this file descriptor are set to 0 anyways, so we just overwrite 'em,
        // no need to fetch them and OR'em.
        var fcntl = libjs.fcntl(this.fd, 4 /* SETFL */, 2048 /* O_NONBLOCK */);
        if (fcntl < 0)
            return Error("Could not make socket non-blocking: errno = " + fcntl);
    };
    Socket.prototype.stop = function () {
        // TODO: When closing fd, it gets removed from `epoll` automatically, right?
        if (this.fd) {
            // TODO: Is socket `close` non-blocking, so we just use `close`.
            libjs.close(this.fd);
            // libjs.closeAsync(this.fd, noop);
            this.fd = 0;
        }
        this.onstop();
    };
    return Socket;
}());
exports.Socket = Socket;
var SocketUdp4 = (function (_super) {
    __extends(SocketUdp4, _super);
    function SocketUdp4() {
        _super.apply(this, arguments);
        this.type = 2 /* DGRAM */;
        this.isIPv4 = true;
    }
    SocketUdp4.prototype.start = function () {
        var err = _super.prototype.start.call(this);
        if (err)
            return err;
        var fd = this.fd;
        var event = {
            // TODO: Do we need `EPOLLOUT` for dgram sockets, or they are ready for writing immediately?
            // events: libjs.EPOLL_EVENTS.EPOLLIN | libjs.EPOLL_EVENTS.EPOLLOUT,
            events: 1 /* EPOLLIN */,
            data: [fd, 0]
        };
        var ctl = libjs.epoll_ctl(this.poll.epfd, 1 /* ADD */, fd, event);
        if (ctl < 0)
            return Error("Could not add epoll events: errno = " + ctl);
    };
    SocketUdp4.prototype.send = function (buf, ip, port) {
        var addr = {
            sin_family: 2 /* INET */,
            sin_port: libjs.hton16(port),
            sin_addr: {
                s_addr: new libjs.Ipv4(ip)
            },
            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0]
        };
        // Make sure socket is non-blocking and don't rise `SIGPIPE` signal if the other end is not receiving.
        var flags = 64 /* DONTWAIT */ | 16384 /* NOSIGNAL */;
        var res = libjs.sendto(this.fd, buf, flags, addr, libjs.sockaddr_in);
        if (res < 0) {
            if (-res == 11 /* EAGAIN */) {
                // This just means, we executed the send *asynchronously*, so no worries.
                return;
            }
            else {
                return Error("sendto error, errno = " + res);
            }
        }
    };
    SocketUdp4.prototype.setOption = function (level, option, value) {
        var buf = libjs.optval_t.pack(value);
        return libjs.setsockopt(this.fd, level, option, buf);
    };
    SocketUdp4.prototype.bind = function (port, ip, reuse) {
        if (ip === void 0) { ip = '0.0.0.0'; }
        if (reuse) {
            var reuseRes = this.setOption(65535 /* SOCKET */, 4 /* REUSEADDR */, 1);
            if (reuseRes < 0)
                return reuseRes;
        }
        var addr = {
            sin_family: 2 /* INET */,
            sin_port: libjs.hton16(port),
            sin_addr: {
                s_addr: new libjs.Ipv4(ip)
            },
            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0]
        };
        var res = libjs.bind(this.fd, addr, libjs.sockaddr_in);
        if (res < 0)
            return res;
        this.reffed = true;
        this.poll.refs++;
    };
    SocketUdp4.prototype.update = function (events) {
        // console.log('events', events);
        // TODO: Do we need this or UDP sockets are automatically writable after `bind()`.
        // if(events & libjs.EPOLL_EVENTS.EPOLLOUT) {
        //     console.log(this.fd, 'EPOLLOUT');
        //
        //     this.connected = true;
        //
        //     var event: libjs.epoll_event = {
        //         events: libjs.EPOLL_EVENTS.EPOLLIN,
        //         data: [this.fd, 0],
        //     };
        //     var res = libjs.epoll_ctl(this.poll.epfd, libjs.EPOLL_CTL.MOD, this.fd, event);
        //     if(res < 0) this.onerror(Error(`Could not remove write listener: ${res}`));
        //
        //     this.onstart();
        // }
        if ((events & 1 /* EPOLLIN */) || (events & 2 /* EPOLLPRI */)) {
            // console.log(this.fd, 'EPOLLIN');
            do {
                var addrlen = libjs.sockaddr_in.size;
                var buf = new static_buffer_1.StaticBuffer(CHUNK + addrlen + 4);
                // var data = new StaticBuffer(CHUNK);
                var data = buf.slice(0, CHUNK);
                // var addr = new StaticBuffer(libjs.sockaddr_in.size);
                var addr = buf.slice(CHUNK, CHUNK + addrlen);
                // var addrlenBuf = new StaticBuffer(4);
                var addrlenBuf = buf.slice(CHUNK + addrlen);
                libjs.int32.pack(libjs.sockaddr_in.size, addrlenBuf);
                var bytes = libjs.recvfrom(this.fd, data, CHUNK, 0, addr, addrlenBuf);
                if (bytes < -1) {
                    this.onerror(Error("Error reading data: " + bytes));
                    break;
                }
                else {
                    var retAddrLen = libjs.int32.unpack(addrlenBuf);
                    var addrStruct = libjs.sockaddr_in.unpack(addr);
                    var from = {
                        address: addrStruct.sin_addr.s_addr.toString(),
                        family: retAddrLen === addrlen ? 'IPv4' : 'IPv6',
                        port: addrStruct.sin_port,
                        size: bytes
                    };
                    this.ondata(buf.slice(0, bytes), from);
                }
            } while (bytes === CHUNK);
        }
        if (events & 8 /* EPOLLERR */) {
            // console.log(this.fd, 'EPOLLERR');
            this.onerror(Error("Some error on " + this.fd));
        }
        if (events & 8192 /* EPOLLRDHUP */) {
        }
        if (events & 16 /* EPOLLHUP */) {
        }
    };
    SocketUdp4.prototype.setTtl = function (ttl) {
        if (ttl < 1 || ttl > 255)
            return -22 /* EINVAL */;
        return this.setOption(0 /* IP */, 2 /* TTL */, ttl);
    };
    SocketUdp4.prototype.setMulticastTtl = function (ttl) {
        return this.setOption(0 /* IP */, 33 /* MULTICAST_TTL */, ttl);
    };
    SocketUdp4.prototype.setMulticastLoop = function (on) {
        return this.setOption(0 /* IP */, 34 /* MULTICAST_LOOP */, on ? 1 : 0);
    };
    return SocketUdp4;
}(Socket));
exports.SocketUdp4 = SocketUdp4;
var SocketUdp6 = (function (_super) {
    __extends(SocketUdp6, _super);
    function SocketUdp6() {
        _super.apply(this, arguments);
        this.isIPv4 = false;
    }
    SocketUdp6.prototype.setTtl = function (ttl) {
        if (ttl < 1 || ttl > 255)
            return -22 /* EINVAL */;
        return this.setOption(41 /* IPV6 */, 16 /* UNICAST_HOPS */, ttl);
    };
    SocketUdp6.prototype.setMulticastTtl = function (ttl) {
        return this.setOption(41 /* IPV6 */, 18 /* MULTICAST_HOPS */, ttl);
    };
    SocketUdp6.prototype.setMulticastLoop = function (on) {
        return this.setOption(41 /* IPV6 */, 19 /* MULTICAST_LOOP */, on ? 1 : 0);
    };
    return SocketUdp6;
}(SocketUdp4));
exports.SocketUdp6 = SocketUdp6;
var SocketTcp = (function (_super) {
    __extends(SocketTcp, _super);
    function SocketTcp() {
        _super.apply(this, arguments);
        this.type = 1 /* STREAM */;
        this.connected = false;
    }
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
        var sb = static_buffer_1.StaticBuffer.from(data + '\0');
        var res = libjs.write(this.fd, sb);
        return res;
    };
    return SocketTcp;
}(Socket));
exports.SocketTcp = SocketTcp;
// export class EpollPool extends Pool {
var Poll = (function () {
    function Poll() {
        this.socks = {};
        this.refs = 0;
        // `epoll` file descriptor
        this.epfd = 0;
        this.onerror = event_1.noop;
        this.maxEvents = 10;
        this.eventSize = libjs.epoll_event.size;
        this.eventBuf = static_buffer_1.StaticBuffer.alloc(this.maxEvents * this.eventSize, 'rw');
        this.epfd = libjs.epoll_create1(0);
        if (this.epfd < 0)
            throw Error("Could not create epoll fd: errno = " + this.epfd);
    }
    Poll.prototype.wait = function (timeout) {
        var EVENT_SIZE = this.eventSize;
        var evbuf = this.eventBuf;
        var waitres = libjs.epoll_wait(this.epfd, evbuf, this.maxEvents, timeout);
        if (waitres > 0) {
            // console.log(waitres);
            // evbuf.print();
            // console.log(this.socks);
            for (var i = 0; i < waitres; i++) {
                var event = libjs.epoll_event.unpack(evbuf, i * EVENT_SIZE);
                // console.log(event);
                var fd = event.data[0];
                var socket = this.socks[fd];
                if (socket) {
                    socket.update(event.events);
                }
                else {
                    this.onerror(Error("Socket not in pool: " + fd));
                }
            }
        }
        else if (waitres < 0) {
            this.onerror(Error("Error while waiting for connection: " + waitres));
        }
        // Hook to the global event loop.
        setTimeout(this.wait.bind(this), 1000);
    };
    Poll.prototype.hasRefs = function () {
        return !!this.refs;
    };
    Poll.prototype.createUdpSocket = function (udp6) {
        var sock = !udp6 ? new SocketUdp4 : new SocketUdp6;
        sock.poll = this;
        var err = sock.start();
        this.socks[sock.fd] = sock;
        if (err)
            return err;
        else
            return sock;
    };
    return Poll;
}());
exports.Poll = Poll;

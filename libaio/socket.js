"use strict";
var libjs = require('./node_modules/libjs/libjs');
var SocketTcp = (function () {
    function SocketTcp(postpone) {
        if (postpone === void 0) { postpone = false; }
        this.connected = false;
        this.onconnect = function () { };
        this.ondata = function () { };
        this.onerror = function () { };
        this.pollBound = this.poll.bind(this);
        if (!postpone)
            this.create();
    }
    SocketTcp.prototype.poll = function () {
        var evbuf = new Buffer(libjs.epoll_event.size);
        var waitres = libjs.epoll_wait(this.epfd, evbuf, 1, 0);
        if (waitres > 0) {
            var event = libjs.epoll_event.unpack(evbuf);
            if (!this.connected) {
                if ((event.events & libjs.EPOLL_EVENTS.EPOLLOUT) > 0) {
                    // clearInterval(polli);
                    this.connected = true;
                    this.onconnect();
                }
            }
            if ((event.events & libjs.EPOLL_EVENTS.EPOLLIN) > 0) {
                var buf = new Buffer(1000);
                var bytes = libjs.read(this.fd, buf);
                if (bytes < -1) {
                    this.onerror(Error("Error reading data: " + bytes));
                }
                if (bytes > 0) {
                    var data = buf.toString().substr(0, bytes);
                    this.ondata(data);
                }
            }
            if ((event.events & libjs.EPOLL_EVENTS.EPOLLERR) > 0) {
            }
        }
        if (waitres < 0) {
            this.onerror(Error("Error while waiting for connection: " + waitres));
        }
        // Hook to the global event loop.
        process.nextTick(this.pollBound);
    };
    SocketTcp.prototype.create = function () {
        this.fd = libjs.socket(libjs.AF.INET, libjs.SOCK.STREAM, 0);
        if (this.fd < 0)
            throw Error("Could not create scoket: " + this.fd);
        // Socket is not a file, we just created the file descriptor for it, flags
        // for this file descriptor are set to 0 anyways, so we just overwrite 'em.
        var fcntl = libjs.fcntl(this.fd, libjs.FCNTL.SETFL, libjs.FLAG.O_NONBLOCK);
        if (fcntl < 0)
            throw Error("Could not make socket non-blocking: " + fcntl);
        this.epfd = libjs.epoll_create1(0);
        if (this.epfd < 0)
            throw Error("Could not start epoll: " + this.epfd);
        var event = {
            events: libjs.EPOLL_EVENTS.EPOLLIN | libjs.EPOLL_EVENTS.EPOLLOUT,
            data: [this.fd, 0]
        };
        var ctl = libjs.epoll_ctl(this.epfd, libjs.EPOLL_CTL.ADD, this.fd, event);
    };
    SocketTcp.prototype.connect = function (opts) {
        // on read check for:
        // EAGAINN and EWOULDBLOCK
        var addr_in = {
            sin_family: libjs.AF.INET,
            sin_port: libjs.hton16(opts.port),
            sin_addr: {
                s_addr: new libjs.Ipv4(opts.host)
            },
            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0]
        };
        var res = libjs.connect(this.fd, addr_in);
        // Everything is OK, we are connecting...
        if (res == -libjs.ERROR.EINPROGRESS) {
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
        var buf = new Buffer(data + '\0');
        var res = libjs.write(this.fd, buf);
        return res;
    };
    return SocketTcp;
}());
exports.SocketTcp = SocketTcp;

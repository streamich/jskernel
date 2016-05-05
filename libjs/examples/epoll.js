"use strict";
var posix = require('../posix');
var socket = require('../socket');
var defs = require('../definitions');
var Socket = (function () {
    function Socket(postpone) {
        if (postpone === void 0) { postpone = false; }
        this.connected = false;
        this.onconnect = function () { };
        this.ondata = function () { };
        this.onerror = function () { };
        this.pollBound = this.poll.bind(this);
        if (!postpone)
            this.create();
    }
    Socket.prototype.poll = function () {
        var evbuf = new Buffer(defs.epoll_event.size);
        var waitres = posix.epoll_wait(this.epfd, evbuf, 1, 0);
        if (waitres > 0) {
            var event = defs.epoll_event.unpack(evbuf);
            if (!this.connected) {
                if ((event.events & 4 /* EPOLLOUT */) > 0) {
                    // clearInterval(polli);
                    this.connected = true;
                    this.onconnect();
                }
            }
            if ((event.events & 1 /* EPOLLIN */) > 0) {
                var buf = new Buffer(1000);
                var bytes = posix.read(this.fd, buf);
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
        process.nextTick(this.pollBound);
    };
    Socket.prototype.create = function () {
        this.fd = posix.socket(2 /* INET */, 1 /* STREAM */, 0);
        if (this.fd < 0)
            throw Error("Could not create scoket: " + this.fd);
        // Socket is not a file, we just created the file descriptor for it, flags
        // for this file descriptor are set to 0 anyways, so we just overwrite 'em.
        var fcntl = posix.fcntl(this.fd, 4 /* SETFL */, 2048 /* O_NONBLOCK */);
        if (fcntl < 0)
            throw Error("Could not make socket non-blocking: " + fcntl);
        this.epfd = posix.epoll_create1(0);
        if (this.epfd < 0)
            throw Error("Could not start epoll: " + this.epfd);
        var event = {
            events: 1 /* EPOLLIN */ | 4 /* EPOLLOUT */,
            data: [this.fd, 0]
        };
        var ctl = posix.epoll_ctl(this.epfd, 1 /* ADD */, this.fd, event);
    };
    Socket.prototype.connect = function (opts) {
        // on read check for:
        // EAGAINN and EWOULDBLOCK
        var addr_in = {
            sin_family: 2 /* INET */,
            sin_port: socket.hton16(opts.port),
            sin_addr: {
                s_addr: new socket.Ipv4(opts.host)
            },
            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0]
        };
        var res = posix.connect(this.fd, addr_in);
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
    Socket.prototype.onRead = function () {
    };
    Socket.prototype.write = function (data) {
        var buf = new Buffer(data + '\0');
        var res = posix.write(this.fd, buf);
        return res;
    };
    return Socket;
}());
try {
    var sock = new Socket;
}
catch (e) {
    console.log('Could not create socket.', e);
}
sock.ondata = function (data) {
    console.log('Data received:');
    console.log(data);
};
sock.onconnect = function () {
    console.log('Connected');
    sock.write('GET / \n\n');
};
sock.onerror = function (err) {
    console.log('Error: ', err);
};
sock.connect({ host: "192.168.1.150", port: 80 });

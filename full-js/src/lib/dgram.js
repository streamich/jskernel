"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var events_1 = require('./events');
var buffer_1 = require('./buffer');
var util = require('./util');
var errnoException = util._errnoException;
var exceptionWithHostPort = util._exceptionWithHostPort;
function lookup4(address, callback) {
    callback();
}
function lookup6(address, callback) {
    callback();
}
function sliceBuffer(buffer, offset, length) {
    if (typeof buffer === 'string')
        buffer = buffer_1.Buffer.from(buffer);
    else if (!(buffer instanceof buffer_1.Buffer))
        throw new TypeError('First argument must be a buffer or string');
    offset = offset >>> 0;
    length = length >>> 0;
    return buffer.slice(offset, offset + length);
}
function fixBufferList(list) {
    var newlist = new Array(list.length);
    for (var i = 0, l = list.length; i < l; i++) {
        var buf = list[i];
        if (typeof buf === 'string')
            newlist[i] = buffer_1.Buffer.from(buf);
        else if (!(buf instanceof buffer_1.Buffer))
            return null;
        else
            newlist[i] = buf;
    }
    return newlist;
}
var Socket = (function (_super) {
    __extends(Socket, _super);
    function Socket(type, listener) {
        var _this = this;
        _super.call(this);
        this.bindState = 0 /* UNBOUND */;
        this.reuseAddr = false;
        var isIP6 = type === 'udp6';
        this.sock = process.loop.poll.createUdpSocket(isIP6);
        this.lookup = isIP6 ? lookup6 : lookup4;
        if (listener)
            this.on('message', listener);
        this.sock.ondata = function (msg, from) {
            _this.emit('message', msg, from);
        };
        this.sock.onstart = function () {
        };
        this.sock.onstop = function () {
        };
        this.sock.onerror = function () {
        };
    }
    Socket.prototype.send = function (msg, a, b, c, d, e) {
        var _this = this;
        var port;
        var address;
        var callback;
        var typeofb = typeof b;
        if (typeofb[0] === 'n') {
            var offset = a;
            var length = b;
            msg = sliceBuffer(msg, offset, length);
            port = c;
            address = d;
            callback = e;
        }
        else if (typeofb[1] === 't') {
            port = a;
            address = b;
            callback = c;
        }
        else
            throw TypeError('3rd arguments must be length or address');
        var list;
        if (!Array.isArray(msg)) {
            if (typeof msg === 'string') {
                list = [buffer_1.Buffer.from(msg)];
            }
            else if (!(msg instanceof buffer_1.Buffer)) {
                throw new TypeError('First argument must be a buffer or a string');
            }
            else {
                list = [msg];
            }
        }
        else if (!(list = fixBufferList(msg))) {
            throw new TypeError('Buffer list arguments must be buffers or strings');
        }
        port = port >>> 0;
        if (port === 0 || port > 65535)
            throw new RangeError('Port should be > 0 and < 65536');
        if (typeof callback !== 'function')
            callback = undefined;
        // if (self._bindState == BIND_STATE_UNBOUND)
        //     self.bind({port: 0, exclusive: true}, null);
        // TODO: Why send nothing, we need this?
        if (list.length === 0)
            list.push(new buffer_1.Buffer(0));
        // If the socket hasn't been bound yet, push the outbound packet onto the
        // send queue and send after binding is complete.
        // if (self._bindState != BIND_STATE_BOUND) {
        //     enqueue(self, self.send.bind(self, list, port, address, callback));
        //     return;
        // }
        this.lookup(address, function (err, ip) {
            var err = _this.sock.send(list[0], address, port);
            if (callback)
                callback(err);
        });
    };
    Socket.prototype.address = function () {
    };
    Socket.prototype.bind = function (a, b, c) {
        var _this = this;
        var port;
        var address;
        var exclusive = false;
        var callback;
        if (typeof a === 'number') {
            port = a;
            if (typeof address === 'string') {
                address = b;
                callback = c;
            }
            else {
                callback = b;
            }
        }
        else if ((a !== null) && (typeof a === 'object')) {
            port = a.port;
            address = a.address || '';
            exclusive = !!a.exclusive;
            callback = b;
        }
        else
            throw TypeError('Invalid bind() arguments.');
        // self._healthCheck();
        if (this.bindState !== 0 /* UNBOUND */)
            throw Error('Socket is already bound');
        this.bindState = 1 /* BINDING */;
        // Defaulting address for bind to all interfaces.
        if (!address) {
            if (this.lookup === lookup4)
                address = '0.0.0.0';
            else
                address = '::';
        }
        this.lookup(address, function (lookup_err, ip) {
            if (lookup_err) {
                _this.bindState = 0 /* UNBOUND */;
                _this.emit('error', lookup_err);
                return;
            }
            // var flags = 0;
            // if (self._reuseAddr)
            //     flags |= UV_UDP_REUSEADDR;
            if (!_this.sock)
                return; // handle has been closed in the mean time
            var err = _this.sock.bind(port || 0, ip);
            if (err) {
                var ex = exceptionWithHostPort(err, 'bind', ip, port);
                _this.emit('error', ex);
                _this.bindState = 0 /* UNBOUND */;
                return;
            }
            // TODO: We need this?
            // this.fd = -42; // compatibility hack
            _this.bindState = 2 /* BOUND */;
            _this.emit('listening');
            if (typeof callback === 'function')
                callback();
        });
        return this;
    };
    Socket.prototype.close = function (callback) {
        this.sock.stop();
    };
    Socket.prototype.addMembership = function (multicastAddress, multicastInterface) {
    };
    Socket.prototype.dropMembership = function (multicastAddress, multicastInterface) {
    };
    Socket.prototype.setBroadcast = function (flag) {
        var res = this.sock.setBroadcast(flag);
        if (res < 0)
            throw errnoException(res, 'setBroadcast');
    };
    Socket.prototype.setMulticastLoopback = function (flag) {
        var res = this.sock.setMulticastLoop(flag);
        if (res < 0)
            throw errnoException(res, 'setMulticastLoopback');
        return flag;
    };
    Socket.prototype.setTTL = function (ttl) {
        if (typeof ttl !== 'number')
            throw TypeError('Argument must be a number');
        var res = this.sock.setTtl(ttl);
        if (res < 0)
            throw errnoException(res, 'setTTL');
        return ttl;
    };
    Socket.prototype.setMulticastTTL = function (ttl) {
        if (typeof ttl !== 'number')
            throw new TypeError('Argument must be a number');
        var err = this.sock.setMulticastTtl(ttl);
        if (err < 0)
            throw errnoException(err, 'setMulticastTTL');
        return ttl;
    };
    Socket.prototype.ref = function () {
        this.sock.ref();
    };
    Socket.prototype.unref = function () {
        this.sock.unref();
    };
    return Socket;
}(events_1.EventEmitter));
exports.Socket = Socket;
function createSocket(type, callback) {
    var socket;
    if (typeof type === 'string')
        socket = new Socket(type, callback);
    else if ((type !== null) && (typeof type === 'object')) {
        socket = new Socket(type.type, callback);
        socket.reuseAddr = !!type.reuseAddr;
    }
    else
        throw TypeError('Invalid type argument.');
    return socket;
}
exports.createSocket = createSocket;

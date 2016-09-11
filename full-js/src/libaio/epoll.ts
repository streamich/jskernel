import * as libjs from '../libjs/index';
import {Buffer} from '../lib/buffer';
import {StaticBuffer} from '../lib/static-buffer';
import {IEventPoll, ISocket, noop, Tfrom, TonData, TonError, TonStart, TonStop, Tcallback} from "./event";
import {setMicroTask} from "../lib/timers";


const CHUNK = 11;


export abstract class Socket implements ISocket {
    poll: Poll = null;
    fd: number = 0;    // socket` file descriptor
    type: libjs.SOCK;
    connected = false;
    reffed = false;

    onstart:    TonStart    = noop as any as TonStart;  // Maps to "listening" event.
    onstop:     TonStop     = noop as any as TonStop;   // Maps to "close" event.
    ondata:     TonData     = noop as any as TonData;   // Maps to "message" event.
    // TODO: Synchronous first level errors: do we (1) `return`, (2) `throw`, or (3) `.onerror()` them?
    onerror:    TonError    = noop as any as TonError;  // Maps to "error" event.


    // Events that come from `Poll`.
    abstract update(events: number);

    start(): Error {
        this.fd = libjs.socket(libjs.AF.INET, this.type, 0);
        if(this.fd < 0) return Error(`Could not create scoket: errno = ${this.fd}`);

        // Socket is not a file, we just created the file descriptor for it, flags
        // for this file descriptor are set to 0 anyways, so we just overwrite 'em,
        // no need to fetch them and OR'em.
        var fcntl = libjs.fcntl(this.fd, libjs.FCNTL.SETFL, libjs.FLAG.O_NONBLOCK);
        if(fcntl < 0) return Error(`Could not make socket non-blocking: errno = ${fcntl}`);
    }

    stop() {
        // TODO: When closing fd, it gets removed from `epoll` automatically, right?
        if(this.fd) {
            // TODO: Is socket `close` non-blocking, so we just use `close`.
            libjs.close(this.fd);
            // libjs.closeAsync(this.fd, noop);
            this.fd = 0;
        }

        this.onstop();
    }
}


export class SocketUdp4 extends Socket {
    
    type = libjs.SOCK.DGRAM;
    isIPv4 = true;

    start(): Error {
        var err = super.start();
        if(err) return err;

        var fd = this.fd;
        var event: libjs.epoll_event = {
            // TODO: Do we need `EPOLLOUT` for dgram sockets, or they are ready for writing immediately?
            // events: libjs.EPOLL_EVENTS.EPOLLIN | libjs.EPOLL_EVENTS.EPOLLOUT,
            events: libjs.EPOLL_EVENTS.EPOLLIN,
            data: [fd, 0],
        };

        var ctl = libjs.epoll_ctl(this.poll.epfd, libjs.EPOLL_CTL.ADD, fd, event);
        if(ctl < 0) return Error(`Could not add epoll events: errno = ${ctl}`);
    }

    send(buf: Buffer|StaticBuffer, ip: string, port: number) {
        var addr: libjs.sockaddr_in = {
            sin_family: libjs.AF.INET,
            sin_port: libjs.hton16(port),
            sin_addr: {
                s_addr: new libjs.Ipv4(ip),
            },
            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0],
        };

        // Make sure socket is non-blocking and don't rise `SIGPIPE` signal if the other end is not receiving.
        const flags = libjs.MSG.DONTWAIT | libjs.MSG.NOSIGNAL;
        var res = libjs.sendto(this.fd, buf, flags, addr, libjs.sockaddr_in);
        if(res < 0) {
            if(-res == libjs.ERROR.EAGAIN) {
                // This just means, we executed the send *asynchronously*, so no worries.
                return;
            } else {
                return Error(`sendto error, errno = ${res}`);
                // return res;
            }
        }
    }

    setOption(level, option: libjs.IP|libjs.IPV6|libjs.SO, value) {
        var buf = libjs.optval_t.pack(value);
        return libjs.setsockopt(this.fd, level, option, buf);
    }

    bind(port: number, ip: string = '0.0.0.0', reuse?): number {
        if(reuse) {
            var reuseRes = this.setOption(libjs.SOL.SOCKET, libjs.SO.REUSEADDR, 1);
            if(reuseRes < 0) return reuseRes;
        }

        var addr: libjs.sockaddr_in = {
            sin_family: libjs.AF.INET,
            sin_port: libjs.hton16(port),
            sin_addr: {
                s_addr: new libjs.Ipv4(ip),
            },
            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0],
        };

        var res = libjs.bind(this.fd, addr, libjs.sockaddr_in);
        if(res < 0) return res;

        this.reffed = true;
        this.poll.refs++;
    }

    update(events: number) {
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

        if((events & libjs.EPOLL_EVENTS.EPOLLIN) || (events & libjs.EPOLL_EVENTS.EPOLLPRI)) {
            // console.log(this.fd, 'EPOLLIN');

            do {
                var addrlen = libjs.sockaddr_in.size;
                var buf = new StaticBuffer(CHUNK + addrlen + 4);
                // var data = new StaticBuffer(CHUNK);
                var data = buf.slice(0, CHUNK);
                // var addr = new StaticBuffer(libjs.sockaddr_in.size);
                var addr = buf.slice(CHUNK, CHUNK + addrlen);
                // var addrlenBuf = new StaticBuffer(4);
                var addrlenBuf = buf.slice(CHUNK + addrlen);
                libjs.int32.pack(libjs.sockaddr_in.size, addrlenBuf);

                var bytes = libjs.recvfrom(this.fd, data, CHUNK, 0, addr, addrlenBuf);

                if(bytes < -1) {
                    this.onerror(Error(`Error reading data: ${bytes}`));
                    break;
                } else {
                    var retAddrLen = libjs.int32.unpack(addrlenBuf);
                    var addrStruct = libjs.sockaddr_in.unpack(addr);
                    var from: Tfrom = {
                        address: addrStruct.sin_addr.s_addr.toString(),
                        family: retAddrLen === addrlen ? 'IPv4' : 'IPv6',
                        port: addrStruct.sin_port,
                        size: bytes,
                    };
                    this.ondata(buf.slice(0, bytes), from);
                }
            } while (bytes === CHUNK);
        }

        if(events & libjs.EPOLL_EVENTS.EPOLLERR) {
            // console.log(this.fd, 'EPOLLERR');
            this.onerror(Error(`Some error on ${this.fd}`));
        }

        if(events & libjs.EPOLL_EVENTS.EPOLLRDHUP) {
            // console.log(this.fd, 'EPOLLRDHUP');
        }

        if(events & libjs.EPOLL_EVENTS.EPOLLHUP) {
            // console.log(this.fd, 'EPOLLHUP');
        }
    }

    setTtl(ttl: number) {
        if (ttl < 1 || ttl > 255) return -libjs.ERROR.EINVAL;
        return this.setOption(libjs.IPPROTO.IP, libjs.IP.TTL, ttl);
    }

    setMulticastTtl(ttl: number) {
        return this.setOption(libjs.IPPROTO.IP, libjs.IP.MULTICAST_TTL, ttl);
    }

    setMulticastLoop(on: boolean) {
        return this.setOption(libjs.IPPROTO.IP, libjs.IP.MULTICAST_LOOP, on ? 1 : 0);
    }

    // setBroadcast(on: boolean) {
    //     return this.setOption(libjs.IPPROTO.SOCKET, libjs.IP.BROADCAST, on ? 1 : 0);
    // }
}

export class SocketUdp6 extends SocketUdp4 {
    isIPv4 = false;

    setTtl(ttl: number) {
        if (ttl < 1 || ttl > 255) return -libjs.ERROR.EINVAL;
        return this.setOption(libjs.IPPROTO.IPV6, libjs.IPV6.UNICAST_HOPS, ttl);
    }

    setMulticastTtl(ttl: number) {
        return this.setOption(libjs.IPPROTO.IPV6, libjs.IPV6.MULTICAST_HOPS, ttl);
    }

    setMulticastLoop(on: boolean) {
        return this.setOption(libjs.IPPROTO.IPV6, libjs.IPV6.MULTICAST_LOOP, on ? 1 : 0);
    }
}


export class SocketTcp extends Socket {
    type = libjs.SOCK.STREAM;

    connected = false;

    connect(opts: {host: string, port: number}) {

        // on read check for:
        // EAGAINN and EWOULDBLOCK

        var addr_in: libjs.sockaddr_in = {
            sin_family: libjs.AF.INET,
            sin_port: libjs.hton16(opts.port),
            sin_addr: {
                s_addr: new libjs.Ipv4(opts.host),
            },
            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0],
        };
        var res = libjs.connect(this.fd, addr_in);

        // Everything is OK, we are connecting...
        if(res == -libjs.ERROR.EINPROGRESS) {
            this.poll(); // Start event loop.
            return;
        }

        // Error occured.
        if(res < 0) throw Error(`Could no connect: ${res}`);

        // TODO: undefined behaviour.
        throw Error('Something went not according to plan.');
    }

    // This function has been called by the event loop.
    onRead() {

    }

    write(data) {
        var sb = StaticBuffer.from(data + '\0');
        var res = libjs.write(this.fd, sb);
        return res;
    }
}


// export class EpollPool extends Pool {
export class Poll implements IEventPoll {

    protected socks: {[n: number]: Socket} = {};

    refs: number = 0;

    // `epoll` file descriptor
    epfd: number = 0;

    onerror: TonError = noop as TonError;

    maxEvents = 10;
    eventSize = libjs.epoll_event.size;
    protected eventBuf = StaticBuffer.alloc(this.maxEvents * this.eventSize, 'rw');

    constructor() {
        this.epfd = libjs.epoll_create1(0);
        if(this.epfd < 0) throw Error(`Could not create epoll fd: errno = ${this.epfd}`);
    }

    wait(timeout: number) {
        const EVENT_SIZE = this.eventSize;
        var evbuf = this.eventBuf;
        var waitres = libjs.epoll_wait(this.epfd, evbuf, this.maxEvents, timeout);

        if(waitres > 0) { // New events arrived.
            // console.log(waitres);
            // evbuf.print();
            // console.log(this.socks);
            for(var i = 0; i < waitres; i++) {
                var event = libjs.epoll_event.unpack(evbuf, i * EVENT_SIZE);
                // console.log(event);
                var [fd,] = event.data;
                var socket = this.socks[fd];
                if(socket) {
                    socket.update(event.events);
                } else {
                    this.onerror(Error(`Socket not in pool: ${fd}`));
                }
            }
        } else if(waitres < 0) {
            this.onerror(Error(`Error while waiting for connection: ${waitres}`));
        }

        // Hook to the global event loop.
        setTimeout(this.wait.bind(this), 1000);
    }

    hasRefs() {
        return !!this.refs;
    }

    createUdpSocket(udp6?): SocketUdp4|SocketUdp6|Error {
        var sock = !udp6 ? new SocketUdp4 : new SocketUdp6;
        sock.poll = this;
        var err = sock.start();
        this.socks[sock.fd] = sock;

        if(err) return err;
        else return sock;
    }
}

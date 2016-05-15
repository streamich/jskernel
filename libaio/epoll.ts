import * as libjs from '../libjs/libjs';
import {Buffer} from 'buffer';


export type c_onStart   = () => void;
export type c_onStop    = () => void;
export type c_onData    = (data: Buffer) => void;
export type c_onError   = (err: Error, errno?: number) => void;
export type c_callback  = (err?: Error, data?: any) => void;

function noop() {}


export abstract class Socket {
    fd: number      = 0;    /* `socket` file descriptor */
    epfd: number    = 0;    /* `epoll` file descriptor */
    type: libjs.SOCK;

    onstart: c_onStart  = noop as any as c_onStart;
    onstop: c_onStop    = noop as any as c_onStop;
    ondata: c_onData    = noop as any as c_onData;
    onerror: c_onError  = noop as any as c_onError;

    created = false;


    start() {
        this.fd = libjs.socket(libjs.AF.INET, this.type, 0);
        if(this.fd < 0) throw Error(`Could not create scoket: errno = ${this.fd}`);

        // Socket is not a file, we just created the file descriptor for it, flags
        // for this file descriptor are set to 0 anyways, so we just overwrite 'em,
        // no need to fetch them and OR'em.
        var fcntl = libjs.fcntl(this.fd, libjs.FCNTL.SETFL, libjs.FLAG.O_NONBLOCK);
        if(fcntl < 0) throw Error(`Could not make socket non-blocking: errno = ${fcntl}`);

        this.epfd = libjs.epoll_create1(0);
        if(this.epfd < 0) throw Error(`Could create epoll: errno = ${this.epfd}`);

        var event: libjs.epoll_event = {
            events: libjs.EPOLL_EVENTS.EPOLLIN | libjs.EPOLL_EVENTS.EPOLLOUT,
            data: [this.fd, 0],
        };
        var ctl = libjs.epoll_ctl(this.epfd, libjs.EPOLL_CTL.ADD, this.fd, event);
        if(ctl < 0) throw Error(`Could not add epoll events: errno = ${ctl}`);
    }

    stop() {
        if(this.epfd) {
            libjs.close(this.epfd);
            this.fd = 0;
        }
        if(this.fd) {
            libjs.close(this.fd);
            this.fd = 0;
        }
    }
}


export class SocketDgram extends Socket {
    type = libjs.SOCK.DGRAM;

    send(buf: Buffer, ip: string, port: number) {
        var addr: libjs.sockaddr_in = {
            sin_family: libjs.AF.INET,
            sin_port: libjs.hton16(port),
            sin_addr: {
                s_addr: new libjs.Ipv4(ip),
            },
            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0],
        };

        // Make sure socket is non-blocking and don't rise `SIGPIPE` signal if the othe end is not receiving.
        var flags = libjs.MSG.DONTWAIT | libjs.MSG.NOSIGNAL;
        var res = libjs.sendto(this.fd, buf, flags, addr, libjs.sockaddr_in);
        if(res < 0) {
            if(-res == libjs.ERROR.EAGAIN) {
                // This just means, we executed the send *asynchronously*, so no worries.
                return 0;
            } else {
                // throw Error(`sendto error, errno = ${res}`);
                return res;
            }
        }
    }

    bind(port: number = 0, ip: string = '0.0.0.0') {
        var addr: libjs.sockaddr_in = {
            sin_family: libjs.AF.INET,
            sin_port: libjs.hton16(port),
            sin_addr: {
                s_addr: new libjs.Ipv4(ip),
            },
            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0],
        };

        return libjs.bind(this.fd, addr, libjs.sockaddr_in);
        // if(res < 0) {
        //     throw Error(`bind error, errno = ${res}`)
        // }
    }

    listen() {

        var res = libjs.recv(this.fd, buf, );
    }
}


export class SocketTcp extends Socket {
    type = libjs.SOCK.STREAM;

    connected = false;

    onconnect: () => void = () => {};
    ondata: (err, data?) => void = () => {};
    onerror: (err) => void = () => {};

    protected pollBound = this.poll.bind(this);

    protected poll() { // Executes on every event loop cycle.
        var evbuf = new Buffer(libjs.epoll_event.size);
        var waitres = libjs.epoll_wait(this.epfd, evbuf, 1, 0);
        if(waitres > 0) { // New events arrived.
            var event = libjs.epoll_event.unpack(evbuf);
            if(!this.connected) {
                if((event.events & libjs.EPOLL_EVENTS.EPOLLOUT) > 0) { // Socket to send data.
                    // clearInterval(polli);
                    this.connected = true;
                    this.onconnect();
                }
            }
            if((event.events & libjs.EPOLL_EVENTS.EPOLLIN) > 0) { // Socket received data.
                var buf = new Buffer(1000);
                var bytes = libjs.read(this.fd, buf);
                if(bytes < -1) {
                    this.onerror(Error(`Error reading data: ${bytes}`));
                }
                if(bytes > 0) {
                    var data = buf.toString().substr(0, bytes);
                    this.ondata(data);
                }
            }
            if((event.events & libjs.EPOLL_EVENTS.EPOLLERR) > 0) { // Check for errors.
            }
        }
        if(waitres < 0) {
            this.onerror(Error(`Error while waiting for connection: ${waitres}`));
        }

        // Hook to the global event loop.
        process.nextTick(this.pollBound);
    }

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
        var buf = new Buffer(data + '\0');
        var res = libjs.write(this.fd, buf);
        return res;
    }
}


// export abstract class Pool {
//
// }

// export class EpollPool extends Pool {
export class Pool {
    protected epfd: number = 0;    /* `epoll` file descriptor */
    protected socks: {[n: number]: Socket} = [];

    constructor() {
        this.epfd = libjs.epoll_create1(0);
        if(this.epfd < 0) throw Error(`Could create epoll: errno = ${this.epfd}`);
    }

    protected nextTick() {

    }

    createDgramSocket(): SocketDgram {
        var sock = new SocketDgram;
        sock.start();
        this.addSocket(sock);
        return sock;
    }

    addSocket(sock: Socket) {
        var event: libjs.epoll_event = {
            events: libjs.EPOLL_EVENTS.EPOLLIN | libjs.EPOLL_EVENTS.EPOLLOUT,
            data: [sock.fd, 0],
        };
        var ctl = libjs.epoll_ctl(this.epfd, libjs.EPOLL_CTL.ADD, sock.fd, event);
        if(ctl < 0) throw Error(`Could not add epoll events: errno = ${ctl}`);

        this.socks[sock.fd] = sock;
    }
}


import * as posix from '../posix';
import * as socket from '../socket';
import * as defs from '../definitions';


class Socket {

    fd;

    epfd;

    connected = false;

    onconnect: () => void = () => {};
    ondata: (err, data?) => void = () => {};
    onerror: (err) => void = () => {};

    protected pollBound = this.poll.bind(this);

    constructor(postpone = false) {
        if(!postpone) this.create();
    }

    protected poll() { // Executes on every event loop cycle.
        var evbuf = new Buffer(defs.epoll_event.size);
        var waitres = posix.epoll_wait(this.epfd, evbuf, 1, 0);
        if(waitres > 0) { // New events arrived.
            var event = defs.epoll_event.unpack(evbuf);
            if(!this.connected) {
                if((event.events & defs.EPOLL_EVENTS.EPOLLOUT) > 0) { // Socket to send data.
                    // clearInterval(polli);
                    this.connected = true;
                    this.onconnect();
                }
            }
            if((event.events & defs.EPOLL_EVENTS.EPOLLIN) > 0) { // Socket received data.
                var buf = new Buffer(1000);
                var bytes = posix.read(this.fd, buf);
                if(bytes < -1) {
                    this.onerror(Error(`Error reading data: ${bytes}`));
                }
                if(bytes > 0) {
                    var data = buf.toString().substr(0, bytes);
                    this.ondata(data);
                }
            }
            if((event.events & defs.EPOLL_EVENTS.EPOLLERR) > 0) { // Check for errors.
            }
        }
        if(waitres < 0) {
            this.onerror(Error(`Error while waiting for connection: ${waitres}`));
        }

        process.nextTick(this.pollBound);
    }

    create() {
        this.fd = posix.socket(defs.AF.INET, defs.SOCK.STREAM, 0);
        if(this.fd < 0) throw Error(`Could not create scoket: ${this.fd}`);

        // Socket is not a file, we just created the file descriptor for it, flags
        // for this file descriptor are set to 0 anyways, so we just overwrite 'em.
        var fcntl = posix.fcntl(this.fd, defs.FCNTL.SETFL, defs.FLAG.O_NONBLOCK);
        if(fcntl < 0) throw Error(`Could not make socket non-blocking: ${fcntl}`);

        this.epfd = posix.epoll_create1(0);
        if(this.epfd < 0) throw Error(`Could not start epoll: ${this.epfd}`);

        var event: defs.epoll_event = {
            events: defs.EPOLL_EVENTS.EPOLLIN | defs.EPOLL_EVENTS.EPOLLOUT,
            data: [this.fd, 0],
        };
        var ctl = posix.epoll_ctl(this.epfd, defs.EPOLL_CTL.ADD, this.fd, event);
    }

    connect(opts: {host: string, port: number}) {

        // on read check for:
        // EAGAINN and EWOULDBLOCK

        var addr_in: defs.sockaddr_in = {
            sin_family: defs.AF.INET,
            sin_port: socket.hton16(opts.port),
            sin_addr: {
                s_addr: new socket.Ipv4(opts.host),
            },
            sin_zero: [0, 0, 0, 0, 0, 0, 0, 0],
        };
        var res = posix.connect(this.fd, addr_in);

        // Everything is OK, we are connecting...
        if(res == -defs.ERROR.EINPROGRESS) {
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
        var res = posix.write(this.fd, buf);
        return res;
    }
}


try {
    var sock = new Socket;
} catch(e) {
    console.log('Could not create socket.', e);
}

sock.ondata = (data) => {
    console.log('Data received:');
    console.log(data);
};


sock.onconnect = () => {
    console.log('Connected');
    sock.write('GET / \n\n');
};

sock.onerror = (err) => {
    console.log('Error: ', err);
};

sock.connect({host: "192.168.1.150", port: 80});


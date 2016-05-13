import * as libjs from '../libjs/libjs';


// Bare-bones OOP wrapper around `inotify(7)`, to make it more user-friendly
// you have to wrap it yourself into `EventEmitter` and use `path.resolve()` to
// resolve full `filepath`.

function noop() {}

export type ConEvent = (event: IInotifyEvent) => void;
export type ConError = (err: Error, errno?: number) => void;

export interface IInotifyEvent extends libjs.inotify_event {
    path: string;
}


// Usage:
//
// ```js
// var watcher = new Inotify;
// watcher.onerror = function(err, errno) {
//     console.log('error', err, errno);
// };
// watcher.onevent = function(event) {
//     console.log('event', event);
// };
// watcher.start();
// watcher.addPath('/tmp');
// watcher.addPath('/tmp/tmp2');
// watcher.removePath('/tmp');
// watcher.stop();
// ```

export class Inotify {

    onevent: ConEvent   = noop as any as ConEvent;
    onerror: ConError   = noop as any as ConError;

    bufSize: number;

    protected buf: Buffer;

    protected fd: number;

    protected wdCount = 0;
    protected wd:   {[s: string]: number} = {};
    protected wdr:  {[n: number]: string} = {};

    protected pollBound = this.poll.bind(this);

    pollInterval: number; /* 1 sec */
    protected timeout;

    encoding = 'utf8';


    constructor(poll_interval = 200, buffer_size = 4096) {
        this.pollInterval = poll_interval;
        this.bufSize = buffer_size;
    }

    protected poll() {
        var res = libjs.read(this.fd, this.buf);

        if(res < 0) {
            if(-res == libjs.ERROR.EAGAIN) {
                // We are in `NONBLOCK` mode, so `EAGAIN` "error" just means: "no events yet, try later".
            } else {
                this.onerror(Error(`Could not poll for events: errno = ${res}`), res);
            }
            this.nextTick();
            return;
        }

        if(res > 0) {
            var offset = 0;
            var struct = libjs.inotify_event;

            while(offset < res) {
                var event:IInotifyEvent = struct.unpack(this.buf, offset);

                var name_off = offset + struct.size;
                var name = this.buf.slice(name_off, name_off + event.len).toString(this.encoding);
                name = name.substr(0, name.indexOf("\0"));
                event.name = name;

                event.path = this.wdr[event.wd];
                this.onevent(event);

                offset += struct.size + event.len;
            }
        }

        this.nextTick();
    }

    protected nextTick() {
        // if(this.isPolling()) process.nextTick(this.pollBound);
        if(this.hasStarted() && this.wdCount)
            this.timeout = setTimeout(this.pollBound, this.pollInterval);
    }

    protected stopPolling() {
        clearTimeout(this.timeout);
        this.timeout = null;
    }

    hasStarted() {
        return !!this.fd;
    }

    start() {
        this.fd = libjs.inotify_init1(libjs.IN.NONBLOCK);
        if(this.fd < 0)
            throw Error(`Could not init: errno = ${this.fd}`);

        this.buf = new Buffer(this.bufSize);

        return this.fd;
    }

    stop() {
        this.stopPolling();
        for(var pathname in this.wd) this.removePath(pathname);
        var fd = this.fd;
        this.fd = 0;
        return libjs.close(fd);
    }

    addPath(pathname: string, events: libjs.IN = libjs.IN.ALL_EVENTS) {
        if(!this.fd)
            throw Error(`inotify file descriptor not initialized, call .init() first.`);

        var wd = libjs.inotify_add_watch(this.fd, pathname, events);

        if(wd < 0)
            throw Error(`Could not add watch: errno = ${wd}`);

        this.wdCount++;
        this.wd[pathname] = wd;
        this.wdr[wd] = pathname;

        /* First path added, so we start polling. */
        if(this.wdCount == 1) this.nextTick();

        return wd;
    }

    // Intentionally does not throw error if we are not watching a path, simply returns -1.
    // Also returns the result of `inotify_rm_watch` system call, if negative, represents an error.
    removePath(pathname: string) {
        var wd = this.wd[pathname];
        if(!wd) return -1;
        delete this.wd[pathname];
        delete this.wdr[wd];

        /* Stop polling loop, if we don't have any paths to watch for. */
        this.wdCount--;

        return libjs.inotify_rm_watch(this.fd, wd);
    }
}

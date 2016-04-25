## jskernel

The Node.js exo-kernel dream: this is a proposal to create a JavaScript exo-kernel
that would have API compatible to Node.js but would be possible to run as part of the Linux kernel.

> Why do I need a JavaScript exo-kernel?

Well, I don't know, but imagine you could have:

 1. A complete OS image (not just a container, but including the kernel and Node.js) at less than 20Mb and it would boot in a couple of dozen milliseconds.
 2. Full access to hardware from JavaScript.
 3. Write hardware drivers in JavaScript.

There are already two projects ([NodeOS](https://node-os.com/) and [runtime.js](http://runtimejs.org/)) that work
towards creating a Node.js operating system, or kernel. See [architecture comparison](./docs/exokernels.md) for comparison
with `jskernel` proposal. The basic summary of the two is as follows:

 - `NodeOS` runs in *user space* on top of Node.js as the main process, so by default
 it comes with `npm` module ecosystem, however, it has no access to the *kernel space*.
 - `runtime.js` is compiled inside the kernel, so it has full access to the *kernel space*,
 however, it does not run on Node.js, not even `libuv` or `libc`, but just raw C++ bindings with kernel and V8,
 so one cannot run `npm` modules on runtime.js, unless they implement Node.js-like API.
 
The proposal of `jskernel` is to have the best of both worlds:

> Create a [Node.js standard library](https://github.com/nodejs/node/tree/master/lib) that would be able to run in *kernel space* (or *user space*).

So, here is how to achieve that:

 1. Write everything in JavaScript (or TypeScript), no C/C++ bindings.
 2. No dependencies, only the `syscall` function, syscalls executed directly from JavaScript.
 
This way we can re-create Node.js standard library whose only dependency will be
[system call function](https://en.wikipedia.org/wiki/System_call).
We would remove all native dependencies from Node.js, including Node.js itself, `libuv`, `libc` and even V8.

The only thing you would need to do to port this thing inside the Linux kernel or to a different JavaScript runtime would
be to port the `syscall` function, as it will be our only dependency.

You might think it is impossible and would take too much effort to rewrite `libc` and `libuv`,
but, hey, we are coding in JavaScript, `libc` in JavaScript sounds like a little weekend project. Moreover, below is
a road map with some working prototypes, so its possible and it is actually simpler than it looks like because
many thing we can take straight from node's standard library and to make a first working prototype we just need to implement
the networking stack: `dgram`, `dns`, `net`, `http`.

Also, Node.js devs usually write their own database drivers and parsers in Node.js, instead 
of creating wrappers around the respective `C/C++` libraries, so, why do we execute system calls
using `libuv` and `libc`?

## Roadmap

Below is a list of five packages from `libsys`, which simply provides the `syscall` function, to
`unode`, which will be a Node.js compatible library whose only native dependency will be that `syscall` function.

### `libsys`

[`libsys`](http://www.npmjs.com/package/libsys) implements the basic `syscall` function, which will
be the only native dependency of the whole stack.

Here is a simple example that prints `Hello world` in console:

```js
require('libsys').syscall(1, 1, new Buffer('Hello world\n'), 12);
```

Here we basically execute `1` system call which is `SYS_write` to `1` file
descriptor which is `STDOUT`, so it goes to our consoles.

Done, we have a `syscall` function, let's move further.

### `libjs`

[`libjs`](http://www.npmjs.com/package/libjs) will be like `libc` in C world: it will
implement wrappers around all the necessary system calls.

For example, reading a file synchronously:

```js
var libjs = require('libjs');

var fd = libjs.open('/share/myfile.txt', libjs.FLAG.O_RDONLY);
if(fd > -1) {
    var buf = new Buffer(1024);
    var bytes_read = libjs.read(fd, buf);
    console.log('Bytes read: ', bytes_read);
    console.log(buf.toString().substr(0, bytes_read));
    libjs.close(fd);
} else {
    console.log('Error: ', fd);
}
```

### `libaio`

[`libaio`](http://www.npmjs.com/package/libaio) will use `libjs` to implement *asynchronous* IO.

Here is a prototype example from `libaio` of an asynchronous TCP socket that executes a simple `GET` request using `epoll` system calls:

```js
var libaio = require('libaio');

var sock = new libaio.SocketTcp();

sock.onconnect = () => {
    console.log('Connected');
    sock.write('GET /\n\n');
};

sock.ondata = (data) => {
    console.log('Received:');
    console.log(data);
};

sock.connect({host: '192.168.1.150', port: 80});
```

### `eloop`

[`eloop`](http://www.npmjs.com/package/eloop) will implement worker pool to outsource
CPU intensive operations that we cannot run asynchronously. Basically its task will
be similar to what `libuv` does for node.js -- provides a thread poll to run file IO.

### `unode`

[`unode`](http://www.npmjs.com/package/unode) will integrate `eloop`, `libaio` and `libjs` to
provide a complete Node.js API, so that `npm` and all packages will run smoothly on `unode` without
even knowing they are not actually running on node.js. It will be a simple drop-in replacement,
where you run your apps with `unode` instead of `node`:

    unode app.js

Meanwhile, `unode` will run on node.js replacing already implemented functionality.

Here is a list of modules from node's standard library that need to be implemented:

*Copy-pasta:* The below modules we should be able to take from node's standard library
and with little modification (or none at all) use in `unode`:

    assert.js
    console.js
    events.js
    path.js
    process.js
    punycode.js
    querystring.js
    readline.js
    repl.js
    module.js
    url.js
    util.js
    stream.js
    string_decoder.js
        
*Special:* When I said `syscall` function will be our only dependency, I actually lied. If you
look carefully at our system call function, it accepts numbers, strings, and `Buffer`s as arguments, where
it uses `Buffer` as a pointer to a memory location of data. However, V8 has typed arrays and we will shim somehow the
`Buffer` class function, there are already [buffer clones](https://github.com/feross/buffer) that work on typed arrays, we
just need to make sure we can pass a pointer to the memory address of buffer's contents in the `syscall` function:
    
    buffer.js
    
*Priority:* The below modules are priority ones for creating our first working prototype and get `npm` working.
They are perfectly doable using Linux's asynchronous sockets with `epoll` system calls:

    dgram.js
    dns.js
    net.js    
    http.js
    
*File system:* `fs` is not an immediate priority because of two reasons: (1) the is no good async way on Linux
to handle files, you have to resort to threads; (2) we don't really need a file system in our first prototype,
instead we can use an in-memory file system like [memfs](https://github.com/streamich/memfs):

    fs.js
    
*Misc:* These are some not-important or node.js and V8 specific modules:
    
    vm.js
    v8.js
    os.js
    tty.js
    timers.js

*Hard ones:* And finally we get to the modules that are hard to implement in pure JavaScript. These are either
computationally intensive modules that we would need a worker pool to run in background, or modules like `tls`,
which probably don't have a JavaScript implementation:
    
    child_process.js
    cluster.js   
    crypto.js
    domain.js
    https.js
    tls.js
    zlib.js
    

### Moving Inside the Kernel

Imagine that we have `unode` completely done with the whole Node.js API. So, what we have achieved
as anything but an exo-kernel. However, the whole stack now has only one dependency -- the `syscall`
function, this means we can very esily port it anywhere we like, including inside the kernel.

Once inside the kernel we can expose more ways for 





## Development

If you don't have Docker yet:

    vagrant up
    vagrant ssh
    sudo /share/install.sh
    
Start a Docker container:
    
    sudo docker build -t jskernel /share/
    sudo docker run -it -v /share:/share --name myjskernel jskernel /bin/bash
    cd /share
    npm install -g npm@latest
    npm install -g node-gyp n typescript tsd mocha
    tsd install node
    
Next time just do:

    sudo docker start -i myjskernel
    
    
    
    
# Unode? I node!

Installation:

    npm install -g unode

Use it as a *drop-in* replacement for Node.js:

    unode script.js
    
See which system calls your app executes:

    DEBUG=libjs:* unode script.js
    
`unode` is Node.js written in JavaScript. Our goal is to implement
complete Node.js API without any dependencies but just `syscall` function
from [`libsys`](http://www.npmjs.com/package/libsys) package. Meanwhile, until
we have 100% compatibility with Node.js, `unode` runs on top of Node.js patching already implemented parts.

Requirements: it runs on Ubuntu 14.04 with Node.js 4.4.4, not tested on other systems.

## What is `unode`?

> ... #FreeNode or #nodefree?

This is all you need to know to tell your colleagues about `unode`:

**Colleague: What is `unode`?**

***You:*** *`unode` is node.js without node.js (no pun intended). `unode` is node's
rewrite in pure unadulterated JavaScript, without any `C/C++` bindings.*

**Colleague: WHOA, what? But node.js is JavaScript?**

***You:*** *Well, Node's [standard library](https://nodejs.org/api/index.html) is partly written in JavaScript, yes, but it also has the other side --
the dark side. Node.js depends on [`libuv`](http://libuv.org/), which uses [`libc`](https://en.wikipedia.org/wiki/C_standard_library) among many other
`C/C++` dependencies, also, part of Node.js itself is written in `C++` and hardcoded
for `V8`. `unode` has none of that, `unode` is **100%** `C/C++` free.*

**Colleague: Agh, don't tell me fairy tales. How is that possible?**

***You:*** *`libuv` and `libc` are essentially [wrapper libraries](https://en.wikipedia.org/wiki/Wrapper_library) around
[system calls](https://filippo.io/linux-syscall-table/) provided by Linux kernel, aka Linux ABI/API. Instead 
of using wrapper libraries `unode` executes system calls directly from JavaScript and implements Node's [standard library](https://nodejs.org/api/index.html)
in pure ~~JavaScript~~ [TypeScript](https://www.typescriptlang.org/) (JavaScript's mature brother).*

**Colleague: This is all Greek to me, WTH is `syscall` function?**

***You:*** *You see, my friend, any time you access any hardware device, like print on screen: `console.log('Hello')`,
your program has to actually ask the Linux kernel to do it for it. This "asking" kernel to do things
for us is called a `syscall`, u know, like calling ur sister, but instead `syscall`.*

**Colleague: So, `unode` itself depends on C's [`syscall`](http://man7.org/linux/man-pages/man2/syscall.2.html) function?**

***You:*** *Kinda, but we will remove it in the future (how? u will see), also it is the **single** dependency point
of the whole stack, moreover, it is just a **one-line** dependcy on `C`; and one-line 
dependency is **no-dependency**, see how ez:*

```c
# include <sys/syscall.h>
long syscall(long number, ...);
```

**Colleague: Why do u need pure JavaScript Node.js aka `unode`?**

***You:*** *There are a few cases:*

 1. *Coding in pure JavaScript makes development much faster.*
 2. *Because of no dependencies, `unode` is highly portable, for example, to move it to another
 JavaScript runtime, all you have to do is to port that `syscall` one-liner, u see? Ever wanted to run Node.js on your
 favorite [${WIKIPEDIA.put.an.ECMAScript.engine.here('please')}](https://en.wikipedia.org/wiki/List_of_ECMAScript_engines).*
 3. *You can "stuff" `unode` into places where Node.js has never been before, like into Linux kernel itself. For example, 
 [runtime.js](http://runtimejs.org/) is a JavaScript exo-kernel (JavaScript compiled into the Linux kernel), but so unfortunately
 there is no `libc` nor `libuv` (or Node.js for that matter) inside the kernel, so `runtime.js` is bare-bones `V8` runtime without any of
 node's [standard library](https://nodejs.org/api/index.html) or `npm` (JS devs in panic mode here), so u cannot do much. But, because `unode` has no
 dependecies you will be able to use it together with `runtime.js` inside the kernel and `npm` will just work,
 because `unode` has 100% compatible API with Node.js, u see?*
 4. *You can trace and intercept `syscalls` to test/debug your app.*
 5. *You could use `unode` for simulations and sandboxing, for example, you could implement your own **virtual**
 Linux kernel, which would expose a single `syscall` function and you could run `unode` on that. Or you could create 
 a sandboxed Node.js runtime, where you would control which syscalls are available in sandbox.*
 6. *Because everything will be written in JavaScript, one more thing we will do is we will package the whole `unode`
 into a single `unode.js` file, image a complete Node.js distribution in a single `.js` file.*

## API Status

Below is list of already implemented API and roadmap on how the rest of the API will be implemented.

 - [`dgram.js`](https://nodejs.org/api/dgram.html), [`net.js`](https://nodejs.org/api/net.html) and [`http.js`](https://nodejs.org/api/http.html) networking stack will be implemented using `epoll` system calls.
 - [`fs.js`](https://nodejs.org/api/fs.html) -- *synchronous* functions are implemented in [`libfs`](http://www.npmjs.com/package/libfs)
 using system calls, also `libfs` will implement *asynchronous* `fs` calls in four ways:
    1. fake *async* wrappers around *synchronous/blocking* `fs` calls;
    2. thread pool where *blocking* function will be executed in parallel using `treads-a-go-go`, analogous to what `libuv` does;
    3. `Worker` pool, similar to *2.*, but less efficient;
    4. using *asynchronous* Linux system calls: `io_submit`.
 - [`dns.js`](https://nodejs.org/api/dns.html) will be replaced by [`node-dns`](https://github.com/tjfontaine/node-dns).
 - [`tls.js`](https://nodejs.org/api/tls.html) will be replaced by [`forge`](https://github.com/digitalbazaar/forge). 
 - [`https.js`](https://nodejs.org/api/https.html) will have to be put together using `http.js` and `tls.js`. 
 - [`zlib.js`](https://nodejs.org/api/tls.html) will be replaced by [`pako`](https://github.com/nodeca/pako).
 - For [`crypto.js`](https://nodejs.org/api/crypto.html) there is `browserify-crypto` and some other libraries we can use.
 - Pure JavaScript modules will be adopted *as-is*:
    - `assert.js`
    - `console.js`
    - `events.js`
    - `path.js`
    - `process.js`
    - `punycode.js`
    - `querystring.js`
    - `readline.js`
    - `repl.js`
    - `module.js`
    - `url.js`
    - `util.js`
    - `stream.js`
    - `string_decoder.js`
 - *Misc* V8 and Node.js specific modules:
    - `vm.js`
    - `v8.js`
    - `os.js`
    - `tty.js`
    - `timers.js`
 - These we need to think about:
    - `child_process.js`
    - `cluster.js`
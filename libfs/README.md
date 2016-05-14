# libfs

[`fs.js`](https://nodejs.org/api/fs.html) module written in pure JavaScript. Has no native dependencies other
than `syscall` function from [`libsys`](http://www.npmjs.com/package/libsys).

When you *require* `libjs` for the first time it has only *synchronous* methods:

```js
var libfs = require('libfs');
libfs.openSync('file.txt'); // OK
libfs.open('file.txt'); // Error
```

`libfs` implements *asynchronous* methods in a few different ways, so
you have to choose which implementation you want to use. After you have chosen
once, the *asynchronous* functions will stay attached with the `libfs` object forever, so
you have to do this only once.

`useFake()` will create fake *async* wrappers around the blocking `fs` functions.
This is useful when you don't want to introduce new dependencies, but just want
a quick way to conform with [`fs.js` API](https://nodejs.org/api/fs.html), usage:

```js
libfs.useFake(libfs);
```

`useTagg()` will use `thread-a-go-go` to execute *async* calls in a thread pool, similar
to what `libuv` does. **NOT IMPLEMENTED YET.**

`useLibaio` will use Linux's *async* `io_submit` system calls. **NOT IMPLEMENTED YET.**

## Incompatibilities with Node.js

`libfs` implements [`fs.js`](https://nodejs.org/api/fs.html) API as in the docs,
with few minor differences, here are the *known* ones:

 1. Some error messages may be different.
 2. `utimes()` sets file time in seconds, instead of milliseconds.
 3. `futimes()` is not implemented.
 4. `persistent` option in `watchFile()` and `watch()` methods is always `true`,
    even if you set it to `false`, as I don't know how to detect if there are no more
    events in node's event loop, maybe somebody does know?
 5. `watch()` function is implemented using the same `inotify(7)` system calls that Node.js is using,
    however, I don't know why Node.js emits only `change` and `rename` events, when `inotify(7)`
    provides a much more diverse event set, so the mapping to `change` and `rename` might be a bit off. 
    It internally uses `Inotify` class from [`libaio`](http://www.npmjs.com/package/libaio) package, for more control
    and better performance use the `libaio.Inotify` class instead.
 6. `readdir()` results may differ as `libfs` implements it itself instead of using `libc`'s C implementation. 
 7. `realpath()` results may differ as `libfs` implements it itself instead of using `libc`'s C implementation.
 8. `fs.ReadStream` and `fs.WriteStream` are not implemented yet.
 
# libfs


## Incompatibilities with Node.js

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
 6. `readdir()` results may differ as `libfs` implements it itself instead of using `libc`'s version. 
 7. `realpath()` results may differ as `libfs` implements it itself instead of using `libc`'s version.
 
 
 

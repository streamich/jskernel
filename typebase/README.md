# `struct` for Node.js

Read `docco` docs at [here](http://streamich.github.io/typebase/). `npm` package is [here](https://www.npmjs.com/package/typebase).

Consider a `C/C++` structure:

```c
struct address {
    int port,
    unsigned char ip[4],
}
```

Define the same binary `struct` in JavaScript and pack/unpack data to `Buffer`:

```js
var t = require('typebase');

var address = t.Struct.define([
    ['port', t.i32],
    ['ip', t.List.define(t.ui8, 4)]
]);

var p = new t.Pointer(new Buffer(address.size), 0);
var host = {
    port: 8080,
    ip: [127, 0, 0, 1]
};
address.pack(p, host);
var unpacked = address.unpack(p);


console.log(unpacked);
```

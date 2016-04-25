# Unode? I node!

`unode` will be node.js written in JavaScript. Our goal is to implement
complete Node.js API without any dependencies but just `syscall` function
from [`libsys`](http://www.npmjs.com/package/libsys) package.

Unode will be a drop-in replacement for node.js, just run your apps with `unode`, instead of `node`:

    unode app.js
    
Installation:

    npm install -g unode
    
Meanwhile `unode` will run on node.js and just patch the already implemented part of the API.
 
## Currently Implemented
 
```js
process.getgid()
```
 
## Example 

Run the example `test.js` file:

    DEBUG=* unode test.js
 
 
## No Dependencies

Gradually `unode` project will remove all native
dependencies of `Node.js`, including `Node.js`, `libuv` and even `V8` itself.
You will be able to pick any JS interpreter, including [`js.js`](https://github.com/jterrace/js.js/)
if you wish so.

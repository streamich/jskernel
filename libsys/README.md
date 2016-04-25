# `syscall` for node.js

Execute POSIX/Linux `syscall` command from Node.js.

Usage, see [syscall reference](https://filippo.io/linux-syscall-table/):

```js
var syscall = require('libsys').syscall;

// Print `Hello world` in console using kernel's `syscall` command.
var buf = new Buffer('Hello world\n');
syscall(1, 1, buf, buf.length);

// Where, on x86_64 Linux:
// 1 - `sys_write` system call
// 1 - STDOUT file descriptor
// buf - pointer to data in memory
// buf.length - size of the memory block to print
```

See [jskernel-posix](http://www.npmjs.com/package/jskernel-posix) for POSIX command implementation.

## Reference

### `syscall` and `syscall64`

```ts
type TArg = number|string|Buffer;
function syscall(command: number, ...args: TArg[]): number;
function syscall64(command: number, ...args: TArg[]): [number, number];
```

`syscall` accepts up to 6 command arguments `args`, which are treated as
follows depending on their type:

 - `number` is put directly in the appropriate CPU register as is.
 - `string` gets converted to *C*'s `char *` string and that pointer is put in CPU register.
 - `Buffer` pointer to the raw data in-memory is put in CPU register.
    
`syscall` returns a `number` which is the result returned by the kernel,
negative numbers usually represent an error. If sytem call returns -1, the
C `errno` variable will be returned, which usually has more information about the error.

### `malloc`

Returns a `Buffer` object of size `size` that is mapped to memory location
specified in `addr` argument.

```ts
function malloc(addr: number, size: number): Buffer;
```

### `addr` and `addr64`

Return memory address of `Buffer`'s data contents.

```ts
function addr(buffer: Buffer): number;
function addr64(buffer: Buffer): [number, number];
```
    
`addr64` returns a tuple which represents 64-bit number, where first element contains the lower
32 bits and second element has the high 32 bits.

### `asm`  [NOT IMPLEMENTED]

Execute assembly code, `buffer` contains raw op-codes to run. 

```ts
function asm(buffer: Buffer);
```
    
### `errno`

Returns `errno` variable.

```ts
function errno(): number;
```
    
## Installation

    npm i libsys
    
Compiles on Ubuntu 14.04 x86_64 running under Docker with Node.js 4.4.3, has not
been tested on other machines.
    
## Building addon:
    
    node-gyp configure
    node-gyp rebuild

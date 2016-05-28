# GASM

**IN DEVELOPMENT**

```js
var gasm = require('gasm');
var {rax, rbx} = gasm.x86;

var _ = new gasm.x64.Code;
_.mov(rax, rbx);
var bin = _.compile();
console.log(bin);
```

`x86` assembler in for Node.js.


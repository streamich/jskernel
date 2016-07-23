This is just an idea to write C directly within JavaScript.

You could write the following C code:

```c
float square(float x) {
    float p;
    p = x * x;
    return p;
}
```

In JavaScript:

```js
var c = require('jsc');

var square = c.func(c.float, [c.float], function(x) {
    p = c['*'](x, x);
    return p;
});
```

Then that code would be able to JIT compile into machine code.

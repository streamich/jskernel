# glot.js

TODO:

 - Activation Tree
 - 

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


Consider the following C function:

```c
void main() {
    int a = 100;
    int b = 200;
    int c = 300;
    return a + (b + c);
}
```

Using `jsc` *builder* interface in JavaScript you would write that function like so:

```js
var _ = require('jsc').Builder.context();

var main = _.func(_ => {
    var a = _.int(100);
    var b = _.int(200);
    var c = _.int(300);
    _.return(_.['+'](a, _['+'](b, c)));
});

console.log(main.compile());
```

Internally `jsc` would generate something like this:

```js
var fs = new FunctionScope();

var a = new Object(Type.int(), 100);
var b = new Object(Type.int(), 200);
var c = new Object(Type.int(), 300);
fs.body.push(new Declaration(a));
fs.body.push(new Declaration(b));
fs.body.push(new Declaration(c));

var pa = new PrimaryExpression(a);
var pb = new PrimaryExpression(b);
var pc = new PrimaryExpression(c);
var expr1 = new AdditionExpression(pb, pc);
var expr2 = new AdditionExpression(pa, expr1);
fs.body.push(new ReturnStatement(expr2));

var codegen = new Codegen();
var bin = codegen.compileFunction(fs);
console.log(bin);
```


# What is `fulljs`?

> ... #FreeNode or #nodefree?

This is all you need to know to tell your colleagues about `fulljs`:

**Colleague: What is `fulljs`?**

***You:*** *`fulljs` is node.js without node.js (no pun intended). `fulljs` is node's
rewrite in pure unadulterated JavaScript, without any `C/C++` bindings.*

**Colleague: WHOA, what? But node.js is JavaScript?**

***You:*** *Well, Node's [standard library](https://nodejs.org/api/index.html) is partly written in JavaScript, yes, but it also has the other side --
the dark side. Node.js depends on [`libuv`](http://libuv.org/), which uses [`libc`](https://en.wikipedia.org/wiki/C_standard_library) among many other
`C/C++` dependencies, also, part of Node.js itself is written in `C++` and hardcoded
for `V8`. `fulljs` has none of that, `fulljs` is **100%** `C/C++` free.*

**Colleague: Agh, don't tell me fairy tales. How is that possible?**

***You:*** *`libuv` and `libc` are essentially [wrapper libraries](https://en.wikipedia.org/wiki/Wrapper_library) around
[system calls](https://filippo.io/linux-syscall-table/) provided by Linux kernel, aka Linux ABI/API. Instead 
of using wrapper libraries `fulljs` executes system calls directly from JavaScript and implements Node's [standard library](https://nodejs.org/api/index.html)
in pure ~~JavaScript~~ [TypeScript](https://www.typescriptlang.org/) (JavaScript's mature brother).*

**Colleague: This is all Greek to me, WTH is `syscall` function?**

***You:*** *You see, my friend, any time you access any hardware device, like print on screen: `console.log('Hello')`,
your program has to actually ask the Linux kernel to do it for it. This "asking" kernel to do things
for us is called a `syscall`, u know, like calling ur sister, but instead `syscall`.*

**Colleague: So, `fulljs` itself depends on C's [`syscall`](http://man7.org/linux/man-pages/man2/syscall.2.html) function?**

***You:*** *Kinda, but we will remove it in the future (how? u will see), also it is the **single** dependency point
of the whole stack, moreover, it is just a **one-line** dependcy on `C`; and one-line 
dependency is **no-dependency**, see how ez:*

```c
# include <sys/syscall.h>
long syscall(long number, ...);
```

**Colleague: Why do u need pure JavaScript Node.js aka `fulljs`?**

***You:*** *There are a few cases:*

 1. *Coding in pure JavaScript makes development much faster.*
 2. *Because of no dependencies, `fulljs` is highly portable, for example, to move it to another
 JavaScript runtime, all you have to do is to port that `syscall` one-liner, u see? Ever wanted to run Node.js on your
 favorite [${WIKIPEDIA.put.an.ECMAScript.engine.here('please')}](https://en.wikipedia.org/wiki/List_of_ECMAScript_engines).*
 3. *You can "stuff" `fulljs` into places where Node.js has never been before, like into Linux kernel itself. For example, 
 [runtime.js](http://runtimejs.org/) is a JavaScript exo-kernel (JavaScript compiled into the Linux kernel), but so unfortunately
 there is no `libc` nor `libuv` (or Node.js for that matter) inside the kernel, so `runtime.js` is bare-bones `V8` runtime without any of
 node's [standard library](https://nodejs.org/api/index.html) or `npm` (JS devs in panic mode here), so u cannot do much. But, because `fulljs` has no
 dependecies you will be able to use it together with `runtime.js` inside the kernel and `npm` will just work,
 because `fulljs` has 100% compatible API with Node.js, u see?*
 4. *You can trace and intercept `syscalls` to test/debug your app.*
 5. *You could use `fulljs` for simulations and sandboxing, for example, you could implement your own **virtual**
 Linux kernel, which would expose a single `syscall` function and you could run `fulljs` on that. Or you could create 
 a sandboxed Node.js runtime, where you would control which syscalls are available in sandbox.*
 6. *Because everything will be written in JavaScript, one more thing we will do is we will package the whole `fulljs`
 into a single `full.js` file, image a complete Node.js distribution in a single `.js` file.*

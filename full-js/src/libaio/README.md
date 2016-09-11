# `libaio`

Asynchronous operations implemented using [`libjs`](http://www.npmjs.com/package/libjs).

This package is in a prototype stage as a proof of concept, it implements
a basic asynchronous `SocketTcp` class using `epoll` and `fcntl` system
calls from `libjs`. See below and async `GET` request example:

```js
import * as socket from 'libaio';

var sock = new libaio.SocketTcp();

sock.onconnect = () => {
    console.log('Connected');
    sock.write('GET /\n\n');
};

sock.ondata = (data) => {
    console.log('Received:');
    console.log(data);
};

sock.connect({host: '192.168.1.150', port: 80});
```

var Buffer = require('buffer').Buffer;
var StaticBuffer = require('static-buffer').StaticBuffer;


var buf = new StaticBuffer(4444);
buf[0] = 1;
buf[1] = 2;
buf[2] = 3;


var buf2 = Buffer.concat([buf.slice(0, 3), buf.slice(0, 3)]);
buf2.print();

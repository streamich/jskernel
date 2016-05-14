import * as socket from '../socket';


var dgram = new socket.SocketDgram;
dgram.start();
dgram.send(new Buffer('cool stuff'), '127.0.0.1', 1234);
dgram.send(new Buffer('yolo'), '127.0.0.1', 1234);
dgram.send(new Buffer('Hi, there'), '127.0.0.1', 1234);



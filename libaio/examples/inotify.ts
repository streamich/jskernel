import * as inotify from '../inotify';


var watcher = new inotify.Inotify;

watcher.onerror = (err, errno) => {
    console.log('err', err, errno);
};

watcher.onevent = (event) => {
    console.log('event', event);
};

watcher.start();
var path = __dirname + '/watch/test.txt';
// console.log(path);
// watcher.addPath(path);
watcher.addPath(__dirname + '/watch');



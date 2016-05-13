"use strict";
var libfs = require('../fs');
var dir = __dirname + '/dir';
// fs.watch(dir, {}, function(event, filename) {
libfs.watch(dir, {}, function (event, filename) {
    console.log('event', event, filename);
});

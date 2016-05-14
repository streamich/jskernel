"use strict";
var chai_1 = require('chai');
var fs = require('fs');
var libfs = require('../fs');
libfs.useFake(libfs);
describe('libfs', function () {
    var dir = __dirname + '/data';
    var file1 = dir + '/hello.txt';
    describe('sync', function () {
        describe('readFileSync', function () {
            it('buffer', function () {
                var d1 = libfs.readFileSync(file1);
                var d2 = fs.readFileSync(file1);
                chai_1.expect(typeof d1).to.equal(typeof d2);
                chai_1.expect(d1.toString()).to.equal(d2.toString());
            });
            it('encoding', function () {
                var d1 = libfs.readFileSync(file1, 'utf8');
                var d2 = fs.readFileSync(file1, 'utf8');
                chai_1.expect(typeof d1).to.equal(typeof d2);
                chai_1.expect(d1).to.equal(d2);
            });
            it('options', function () {
                var opts = { encoding: 'ascii' };
                var d1 = libfs.readFileSync(file1, opts);
                var d2 = fs.readFileSync(file1, opts);
                chai_1.expect(typeof d1).to.equal(typeof d2);
                chai_1.expect(d1).to.equal(d2);
            });
        });
    });
    describe('async', function () {
        describe('readFile', function () {
            it('buffer', function (done) {
                libfs.readFile(file1, function (err, d1) {
                    fs.readFile(file1, function (err, d2) {
                        chai_1.expect(typeof d1).to.equal(typeof d2);
                        chai_1.expect(d1.toString()).to.equal(d2.toString());
                        done();
                    });
                });
            });
        });
    });
});

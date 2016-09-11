import {expect} from 'chai';
import * as fs from 'fs';
import * as libfs from '../fs';

libfs.useFake(libfs);

describe('libfs', function() {

    var dir = __dirname + '/data';
    var file1 = dir + '/hello.txt';

    describe('sync', function() {
        describe('readFileSync', function() {
            it('buffer', function() {
                var d1 = libfs.readFileSync(file1);
                var d2 = fs.readFileSync(file1);
                expect(typeof d1).to.equal(typeof d2);
                expect(d1.toString()).to.equal(d2.toString());
            });
            it('encoding', function() {
                var d1 = libfs.readFileSync(file1, 'utf8');
                var d2 = fs.readFileSync(file1, 'utf8');
                expect(typeof d1).to.equal(typeof d2);
                expect(d1).to.equal(d2);
            });
            it('options', function() {
                var opts = {encoding: 'ascii'};
                var d1 = libfs.readFileSync(file1, opts);
                var d2 = fs.readFileSync(file1, opts);
                expect(typeof d1).to.equal(typeof d2);
                expect(d1).to.equal(d2);
            });
        });
    });

    describe('async', function() {
        describe('readFile', function() {
            it('buffer', function(done) {
                libfs.readFile(file1, (err, d1) => {
                    fs.readFile(file1, (err, d2) => {
                        expect(typeof d1).to.equal(typeof d2);
                        expect(d1.toString()).to.equal(d2.toString());
                        done();
                    });
                });
            });
        });
    });
});

"use strict";
var chai_1 = require('chai');
var index_1 = require('../index');
describe('main', function () {
    describe('toString()', function () {
        it('incq rbx', function () {
            var _ = new index_1.x64.Code;
            _.incq(index_1.rbx);
            chai_1.expect(_.toString()).to.equal('    inc     rbx');
        });
    });
    describe('inc', function () {
        it('incq rbx', function () {
            var _ = new index_1.x64.Code;
            _.incq(index_1.rbx);
            chai_1.expect(_.compile()).to.eql([0x48, 0xff, 0xc3]);
        });
        it('incq [rax]', function () {
            var _ = new index_1.x64.Code;
            _.incq(index_1.rax.ref());
            chai_1.expect(_.compile()).to.eql([0x48, 0xff, 0x00]);
        });
        it('incq [rbx]', function () {
            var _ = new index_1.x64.Code;
            _.incq(index_1.rbx.ref());
            chai_1.expect(_.compile()).to.eql([0x48, 0xff, 0x03]);
        });
        it('incq [rbx + rcx]', function () {
            var _ = new index_1.x64.Code;
            _.incq(index_1.rbx.ref().ind(index_1.rcx));
            chai_1.expect(_.compile()).to.eql([0x48, 0xff, 0x04, 0x0b]);
        });
        it('incq [rbx + rcx * 8]', function () {
            var _ = new index_1.x64.Code;
            _.incq(index_1.rbx.ref().ind(index_1.rcx, 8));
            chai_1.expect(_.compile()).to.eql([0x48, 0xff, 0x04, 0xcb]);
        });
        it('incq [rax + rbx * 8 + 0x11]', function () {
            var _ = new index_1.x64.Code;
            _.incq(index_1.rax.ref().ind(index_1.rbx, 8).disp(0x11));
            chai_1.expect(_.compile()).to.eql([0x48, 0xff, 0x44, 0xd8, 0x11]);
        });
        it('incq [rax + rbx * 8 + -0x11223344]', function () {
            var _ = new index_1.x64.Code;
            var ins = _.incq(index_1.rax.ref().ind(index_1.rbx, 8).disp(-0x11223344));
            chai_1.expect(_.compile()).to.eql([0x48, 0xff, 0x84, 0xd8, 0xbc, 0xcc, 0xdd, 0xee]);
        });
        it('incq [rbx + r15 * 8 + -0x123]', function () {
            var _ = new index_1.x64.Code;
            var ins = _.incq(index_1.rbx.ref().ind(index_1.r15, 8).disp(-0x123));
            chai_1.expect(_.compile()).to.eql([0x4a, 0xff, 0x84, 0xfb, 0xdd, 0xfe, 0xff, 0xff]);
        });
        it('incq [rbp + rbp * 8]', function () {
            var _ = new index_1.x64.Code;
            var ins = _.incq(index_1.rbp.ref().ind(index_1.rbp, 8));
            chai_1.expect(_.compile()).to.eql([0x48, 0xff, 0x44, 0xed, 0x00]);
        });
        it('incq [rbp]', function () {
            var _ = new index_1.x64.Code;
            var ins = _.incq(index_1.rbp.ref());
            chai_1.expect(_.compile()).to.eql([0x48, 0xff, 0x45, 0x00]);
        });
        it('incq [rsp]', function () {
            var _ = new index_1.x64.Code;
            var ins = _.incq(index_1.rsp.ref());
            chai_1.expect(_.compile()).to.eql([0x48, 0xff, 0x04, 0x24]);
        });
        it('incq [r12]', function () {
            var _ = new index_1.x64.Code;
            var ins = _.incq(index_1.r12.ref());
            chai_1.expect(_.compile()).to.eql([0x49, 0xff, 0x04, 0x24]);
        });
        it('incq [r13]', function () {
            var _ = new index_1.x64.Code;
            var ins = _.incq(index_1.r13.ref());
            chai_1.expect(_.compile()).to.eql([0x49, 0xff, 0x45, 0x00]);
        });
        it('incq r15', function () {
            var _ = new index_1.x64.Code;
            var ins = _.incq(index_1.r15);
            chai_1.expect(_.compile()).to.eql([0x49, 0xff, 0xc7]);
        });
        it('incq [0x11]', function () {
            var _ = new index_1.x64.Code;
            var ins = _.incq(0x11);
            // console.log(new Buffer(_.compile()));
            chai_1.expect(_.compile()).to.eql([0x48, 0xff, 0x04, 0x25, 0x11, 0x00, 0x00, 0x00]);
        });
        it('incq [0x11223344]', function () {
            var _ = new index_1.x64.Code;
            var ins = _.incq(0x11223344);
            // console.log(new Buffer(_.compile()));
            chai_1.expect(_.compile()).to.eql([0x48, 0xff, 0x04, 0x25, 0x44, 0x33, 0x22, 0x11]);
        });
    });
    describe('dec', function () {
        it('decq rbx', function () {
            var _ = new index_1.x64.Code;
            _.decq(index_1.rax);
            chai_1.expect(_.compile()).to.eql([0x48, 0xff, 0xc8]);
        });
    });
});

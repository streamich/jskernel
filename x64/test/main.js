"use strict";
var chai_1 = require('chai');
var index_1 = require('../index');
describe('main', function () {
    function code64() {
        return new index_1.x64.Code();
    }
    function compile(code) {
        return code.compile();
    }
    describe('toString()', function () {
        it('incq rbx', function () {
            var _ = code64();
            _.incq(index_1.rbx);
            chai_1.expect(_.toString()).to.equal('    inc     rbx');
        });
    });
    describe('db', function () {
        it('octets', function () {
            var _ = code64();
            var data = [1, 2, 3];
            _.db(data);
            chai_1.expect(compile(_)).to.eql(data);
        });
        it('string', function () {
            var _ = code64();
            var str = 'Hello World!\n';
            _.db(str);
            var bin = compile(_);
            chai_1.expect(bin.length).to.be.equal(str.length);
            chai_1.expect(bin).to.eql([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 10]);
        });
    });
    describe('system', function () {
        it('syscall', function () {
            var _ = code64();
            _.syscall();
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x0F, 0x05]);
        });
        it('sysenter', function () {
            var _ = code64();
            _.sysenter();
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x0F, 0x34]);
        });
        it('sysexit', function () {
            var _ = code64();
            _.sysexit();
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x0F, 0x35]);
        });
        it('int 0x80', function () {
            var _ = code64();
            _.int(0x80);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0xCD, 0x80]);
        });
    });
    describe('mov', function () {
        it('movq rax, rax', function () {
            var _ = code64();
            _.movq(index_1.rax, index_1.rax);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0xc0]);
        });
        it('movq rbx, rax', function () {
            var _ = code64();
            _.movq(index_1.rbx, index_1.rax);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0xc3]);
        });
        it('movq [rax], rax', function () {
            var _ = code64();
            _.movq(index_1.rax.ref(), index_1.rax);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0x00]);
        });
        it('movq [rax], rax', function () {
            var _ = code64();
            _.movq(index_1.rax.ref(), index_1.rax);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0x00]);
        });
        it('movq [rcx], rbx', function () {
            var _ = code64();
            _.movq(index_1.rcx.ref(), index_1.rbx);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x89, 0x19]);
        });
        it('movq rdx, [rbx]', function () {
            var _ = code64();
            _.movq(index_1.rdx, index_1.rbx.ref());
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8B, 0x13]);
        });
        it('movq r9, r8', function () {
            var _ = code64();
            _.movq(index_1.r9, index_1.r8);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x4D, 0x89, 0xC1]);
        });
        it('movq [r11], r10', function () {
            var _ = code64();
            _.movq(index_1.r11.ref(), index_1.r10);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x4D, 0x89, 0x13]);
        });
        it('movq r13, [r12]', function () {
            var _ = code64();
            _.movq(index_1.r13, index_1.r12.ref());
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x4D, 0x8B, 0x2C, 0x24]);
        });
        it('movq rcx, [rbx + 0x11]', function () {
            var _ = code64();
            _.movq(index_1.rcx, index_1.rbx.disp(0x11));
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8B, 0x4B, 0x11]);
        });
        it('movq rsi, [rcx + rdx]', function () {
            var _ = code64();
            _.movq(index_1.rsi, index_1.rcx.ref().ind(index_1.rdx, 1));
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8B, 0x34, 0x11]);
        });
        it('movq rcx, [rax + rbx * 4 + 0x1234]', function () {
            var _ = code64();
            _.movq(index_1.rcx, index_1.rax.ref().ind(index_1.rbx, 4).disp(0x1234));
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8B, 0x8C, 0x98, 0x34, 0x12, 0x00, 0x00]);
        });
        it('movq [rbp], 0x1', function () {
            var _ = code64();
            _.movq(index_1.rbp, 0x1);
            var bin = compile(_);
            chai_1.expect(bin).to.eql([0x48, 0x8B, 0x2C, 0x25, 0x01, 0x00, 0x00, 0x00]);
        });
        // 48 8b 24 25 01 00 00 	mov    0x1,%rsp
        it('movq [rbp], 0x1', function () {
            var _ = code64();
            _.movq(index_1.rbp, 0x1);
            var bin = compile(_);
            console.log(new Buffer(bin));
            chai_1.expect(bin).to.eql([0x48, 0x8B, 0x2C, 0x25, 0x01, 0x00, 0x00, 0x00]);
        });
    });
    describe('inc', function () {
        it('incq rbx', function () {
            var _ = code64();
            _.incq(index_1.rbx);
            chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0xc3]);
        });
        it('incq [rax]', function () {
            var _ = code64();
            _.incq(index_1.rax.ref());
            chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x00]);
        });
        it('incq [rbx]', function () {
            var _ = code64();
            _.incq(index_1.rbx.ref());
            chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x03]);
        });
        it('incq [rbx + rcx]', function () {
            var _ = code64();
            _.incq(index_1.rbx.ref().ind(index_1.rcx));
            chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x0b]);
        });
        it('incq [rbx + rcx * 8]', function () {
            var _ = code64();
            _.incq(index_1.rbx.ref().ind(index_1.rcx, 8));
            chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0xcb]);
        });
        it('incq [rax + rbx * 8 + 0x11]', function () {
            var _ = code64();
            _.incq(index_1.rax.ref().ind(index_1.rbx, 8).disp(0x11));
            chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x44, 0xd8, 0x11]);
        });
        it('incq [rax + rbx * 8 + -0x11223344]', function () {
            var _ = code64();
            var ins = _.incq(index_1.rax.ref().ind(index_1.rbx, 8).disp(-0x11223344));
            chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x84, 0xd8, 0xbc, 0xcc, 0xdd, 0xee]);
        });
        it('incq [rbx + r15 * 8 + -0x123]', function () {
            var _ = code64();
            var ins = _.incq(index_1.rbx.ref().ind(index_1.r15, 8).disp(-0x123));
            chai_1.expect(compile(_)).to.eql([0x4a, 0xff, 0x84, 0xfb, 0xdd, 0xfe, 0xff, 0xff]);
        });
        it('incq [rbp + rbp * 8]', function () {
            var _ = code64();
            var ins = _.incq(index_1.rbp.ref().ind(index_1.rbp, 8));
            chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x44, 0xed, 0x00]);
        });
        it('incq [rbp]', function () {
            var _ = code64();
            var ins = _.incq(index_1.rbp.ref());
            chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x45, 0x00]);
        });
        it('incq [rsp]', function () {
            var _ = code64();
            var ins = _.incq(index_1.rsp.ref());
            chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x24]);
        });
        it('incq [r12]', function () {
            var _ = code64();
            var ins = _.incq(index_1.r12.ref());
            chai_1.expect(compile(_)).to.eql([0x49, 0xff, 0x04, 0x24]);
        });
        it('incq [r13]', function () {
            var _ = code64();
            var ins = _.incq(index_1.r13.ref());
            chai_1.expect(compile(_)).to.eql([0x49, 0xff, 0x45, 0x00]);
        });
        it('incq r15', function () {
            var _ = code64();
            var ins = _.incq(index_1.r15);
            chai_1.expect(compile(_)).to.eql([0x49, 0xff, 0xc7]);
        });
        it('incq [0x11]', function () {
            var _ = code64();
            var ins = _.incq(0x11);
            chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x25, 0x11, 0x00, 0x00, 0x00]);
        });
        it('incq [0x11223344]', function () {
            var _ = code64();
            var ins = _.incq(0x11223344);
            chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x25, 0x44, 0x33, 0x22, 0x11]);
        });
    });
    describe('dec', function () {
        it('decq rbx', function () {
            var _ = code64();
            _.decq(index_1.rax);
            chai_1.expect(compile(_)).to.eql([0x48, 0xff, 0xc8]);
        });
    });
});

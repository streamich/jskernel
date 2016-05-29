import {expect} from 'chai';
import {rax, rbx, rcx, rdx, rbp, rsp, rsi, rdi, eax, r8, r9, r10, r11, r12, r13, r15, r10d} from '../x86/operand';
import {Code} from '../x64/code';


describe('x64', function() {

    function code64(): Code {
        return new Code();
    }

    function compile(code: Code) {
        return code.compile();
    }

    describe('toString()', function() {
        it('incq rbx', function() {
            var _ = code64();
            _.incq(rbx);
            expect(_.toString()).to.equal('    inc     rbx');
        });
    });

    describe('data', function() {
        describe('db', function() {
            it('octets', function() {
                var _ = code64();
                var data = [1, 2, 3];
                _.db(data);
                expect(compile(_)).to.eql(data);
            });
            it('buffer', function() {
                var _ = code64();
                var data = [1, 2, 3];
                _.db(new Buffer(data));
                expect(compile(_)).to.eql(data);
            });
            it('string', function() {
                var _ = code64();
                var str = 'Hello World!\n';
                _.db(str);
                var bin = compile(_);
                expect(bin.length).to.be.equal(str.length);
                expect(bin).to.eql([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 10]);
            });
        });
        describe('incbin', function() {
            it('.incbin(filepath)', function() {
                var _ = code64();
                var ins = _.incbin(__dirname + '/data.txt');
                expect(ins.octets).to.eql([49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 13, 10]);
            });
            it('.incbin(filepath, offset)', function() {
                var _ = code64();
                var ins = _.incbin(__dirname + '/data.txt', 3);
                expect(ins.octets).to.eql([52, 53, 54, 55, 56, 57, 48, 13, 10]);
            });
            it('.incbin(filepath, offset, length)', function() {
                var _ = code64();
                var ins = _.incbin(__dirname + '/data.txt', 3, 3);
                expect(ins.octets).to.eql([52, 53, 54]);
            });
        });
    });

    describe('system', function() {
        it('syscall', function() {
            var _ = code64();
            _.syscall();
            var bin = compile(_);
            expect(bin).to.eql([0x0F, 0x05]);
        });
        it('sysenter', function() {
            var _ = code64();
            _.sysenter();
            var bin = compile(_);
            expect(bin).to.eql([0x0F, 0x34]);
        });
        it('sysexit', function() {
            var _ = code64();
            _.sysexit();
            var bin = compile(_);
            expect(bin).to.eql([0x0F, 0x35]);
        });
        it('int 0x80', function() {
            var _ = code64();
            _.int(0x80);
            var bin = compile(_);
            expect(bin).to.eql([0xCD, 0x80]);
        });
    });

    describe('mov', function() {
        it('movq rax, rax', function() {
            var _ = code64();
            _.movq(rax, rax);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0xc0]);
        });
        it('movq rbx, rax', function() {
            var _ = code64();
            _.movq(rbx, rax);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0xc3]);
        });
        it('movq [rax], rax', function() {
            var _ = code64();
            _.movq(rax.ref(), rax);
            var bin = compile(_);
            // console.log(new Buffer(bin));
            expect(bin).to.eql([0x48, 0x89, 0x00]);
        });
        it('movq [rax], rax', function() {
            var _ = code64();
            _.movq(rax.ref(), rax);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x00]);
        });
        it('movq [rcx], rbx', function() {
            var _ = code64();
            _.movq(rcx.ref(), rbx);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x19]);
        });
        it('movq rdx, [rbx]', function() {
            var _ = code64();
            _.movq(rdx, rbx.ref());
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x13]);
        });
        it('movq r9, r8', function() {
            var _ = code64();
            _.movq(r9, r8);
            var bin = compile(_);
            expect(bin).to.eql([0x4D, 0x89, 0xC1]);
        });
        it('movq [r11], r10', function() {
            var _ = code64();
            _.movq(r11.ref(), r10);
            var bin = compile(_);
            expect(bin).to.eql([0x4D, 0x89, 0x13]);
        });
        it('movq r13, [r12]', function() {
            var _ = code64();
            _.movq(r13, r12.ref());
            var bin = compile(_);
            expect(bin).to.eql([0x4D, 0x8B, 0x2C, 0x24]);
        });
        it('movq rcx, [rbx + 0x11]', function() {
            var _ = code64();
            _.movq(rcx, rbx.disp(0x11));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x4B, 0x11]);
        });
        it('movq rsi, [rcx + rdx]', function() {
            var _ = code64();
            _.movq(rsi, rcx.ref().ind(rdx, 1));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x34, 0x11]);
        });
        it('movq rcx, [rax + rbx * 4 + 0x1234]', function() {
            var _ = code64();
            _.movq(rcx, rax.ref().ind(rbx, 4).disp(0x1234));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x8C, 0x98, 0x34, 0x12, 0x00, 0x00]);
        });
        it('movq rbp, [0x1]', function() {
            var _ = code64();
            _.movq(rbp, _.mem(0x1));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x2C, 0x25, 0x01, 0x00, 0x00, 0x00]);
        });
        it('movq rsp, [0x1]', function() {
            var _ = code64();
            _.movq(rsp, _.mem(0x1));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x24, 0x25, 0x01, 0x00, 0x00, 0x00]);
        });
        it('movq [rsp], rbx', function() {
            var _ = code64();
            _.movq(rsp.ref(), rbx);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x1C, 0x24]);
        });
        it('movq rsp, rbx', function() {
            var _ = code64();
            _.movq(rsp, rbx);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0xDC]);
        });
        it('movq [rbp], rbx', function() {
            var _ = code64();
            _.movq(rbp.ref(), rbx);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x5D, 0x00]);
        });
        it('movq [rsp + rbp * 2], rbx', function() {
            var _ = code64();
            _.movq(rsp.ref().ind(rbp, 2), rbx);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x1C, 0x6C]);
        });
        it('movq rbx, [rbp + rax * 8]', function() {
            var _ = code64();
            _.movq(rbx, rbp.ref().ind(rax, 8));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x5C, 0xC5, 0x00]);
        });
        it('movq rbp, [rdx * 2]', function() {
            var _ = code64();
            _.movq(rbp, rdx.ind(2));
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x8B, 0x2C, 0x55, 0x00, 0x00, 0x00, 0x00]);
        });
        it('movq [rbp * 8 + -0x123], rsp', function() {
            var _ = code64();
            _.movq(rbp.ind(8).disp(-0x123), rsp);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0x89, 0x24, 0xED, 0xDD, 0xFE, 0xFF, 0xFF]);
        });
        it('movq rax, 0x1', function() {
            var _ = code64();
            _.movq(rax, 0x1);
            var bin = compile(_);
            expect(bin).to.eql([0x48, 0xC7, 0xC0, 0x01, 0x00, 0x00, 0x00]);
        });
        // 48 c7 c5 cd cc ff ff 	movq $-0x3333, %rbp
        it('movq rax, 0x1', function() {
            var _ = code64();
            _.movq(rbp, -0x3333);
            var bin = compile(_);
            // console.log(new Buffer(bin));
            expect(bin).to.eql([0x48, 0xC7, 0xC5, 0xCD, 0xCC, 0xFF, 0xFF]);
        });
    });

    describe('inc', function() {
        it('incq rbx', function() {
            var _ = code64();
            _.incq(rbx);
            expect(compile(_)).to.eql([0x48, 0xff, 0xc3]);
        });
        it('incq [rax]', function() {
            var _ = code64();
            _.incq(rax.ref());
            expect(compile(_)).to.eql([0x48, 0xff, 0x00]);
        });
        it('incq [rbx]', function() {
            var _ = code64();
            _.incq(rbx.ref());
            expect(compile(_)).to.eql([0x48, 0xff, 0x03]);
        });
        it('incq [rbx + rcx]', function() {
            var _ = code64();
            _.incq(rbx.ref().ind(rcx));
            expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x0b]);
        });
        it('incq [rbx + rcx * 8]', function() {
            var _ = code64();
            _.incq(rbx.ref().ind(rcx, 8));
            expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0xcb]);
        });
        it('incq [rax + rbx * 8 + 0x11]', function() {
            var _ = code64();
            _.incq(rax.ref().ind(rbx, 8).disp(0x11));
            expect(compile(_)).to.eql([0x48, 0xff, 0x44, 0xd8, 0x11]);
        });
        it('incq [rax + rbx * 8 + -0x11223344]', function() {
            var _ = code64();
            var ins = _.incq(rax.ref().ind(rbx, 8).disp(-0x11223344));
            expect(compile(_)).to.eql([0x48, 0xff, 0x84, 0xd8, 0xbc, 0xcc, 0xdd, 0xee]);
        });
        it('incq [rbx + r15 * 8 + -0x123]', function() {
            var _ = code64();
            var ins = _.incq(rbx.ref().ind(r15, 8).disp(-0x123));
            expect(compile(_)).to.eql([0x4a, 0xff, 0x84, 0xfb, 0xdd, 0xfe, 0xff, 0xff]);
        });
        it('incq [rbp + rbp * 8]', function() {
            var _ = code64();
            var ins = _.incq(rbp.ref().ind(rbp, 8));
            expect(compile(_)).to.eql([0x48, 0xff, 0x44, 0xed, 0x00]);
        });
        it('incq [rbp]', function() {
            var _ = code64();
            var ins = _.incq(rbp.ref());
            expect(compile(_)).to.eql([0x48, 0xff, 0x45, 0x00]);
        });
        it('incq [rsp]', function() {
            var _ = code64();
            var ins = _.incq(rsp.ref());
            expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x24]);
        });
        it('incq [r12]', function() {
            var _ = code64();
            var ins = _.incq(r12.ref());
            expect(compile(_)).to.eql([0x49, 0xff, 0x04, 0x24]);
        });
        it('incq [r13]', function() {
            var _ = code64();
            var ins = _.incq(r13.ref());
            expect(compile(_)).to.eql([0x49, 0xff, 0x45, 0x00]);
        });
        it('incq r15', function() {
            var _ = code64();
            var ins = _.incq(r15);
            expect(compile(_)).to.eql([0x49, 0xff, 0xc7]);
        });
        it('incq [0x11]', function() {
            var _ = code64();
            var ins = _.incq(_.mem(0x11));
            expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x25, 0x11, 0x00, 0x00, 0x00]);
        });
        it('incq [0x11223344]', function() {
            var _ = code64();
            var ins = _.incq(_.mem(0x11223344));
            expect(compile(_)).to.eql([0x48, 0xff, 0x04, 0x25, 0x44, 0x33, 0x22, 0x11]);
        });
    });
    describe('dec', function() {
        it('decq rbx', function () {
            var _ = code64();
            _.decq(rax);
            expect(compile(_)).to.eql([0x48, 0xff, 0xc8]);
        });
    });
});

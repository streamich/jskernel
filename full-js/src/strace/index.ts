import {SYS, ARGS, RESULT, ERROR, ERROR_MSG} from './arch_linux_x64';
import {style, STYLE, interval} from './style';
import {UInt64} from '../libjs/ctypes';
var util = require('../lib/util');

declare var StaticBuffer;
declare var Buffer;


type number64 = [number, number];

export interface Ievent {
    num: number,
    name: string,
    args: any[],
    is64: boolean;
    // The orinical syscall function.
    syscall: (num: number, ...args: any[]) => number|number64;
}


export class Strace {

    syscall;
    syscall64;
    asyscall;
    asyscall64;

    printQueue: string[] = [];

    blockStdout = false;

    time;

    onsync = (e: Ievent): number|number64 => {
        var blockStdout = this.blockStdout && (e.name === 'write') && (e.args[0] === 1);

        var time = 0, result = 0;
        if(!blockStdout) {
            var tmp = [e.num, ...e.args];
            time = Date.now();
            result = e.syscall.apply(null, tmp);
            time = Date.now() - time;
        }

        var callstr = this.formatCall(e);

        var timestr;
        // If system call executes longer than even 1ms, its too long
        if(time > 0) timestr = style(interval(time), STYLE.BG_RED);
        else timestr = style(interval(time), STYLE.GREY);
        callstr += ' ' + timestr;

        var str = callstr + this.formatResult(e, result) + style(' ', STYLE.RESET);
        this.print(style(str, STYLE.RESET) + '\n');
        // this.print(str + '\n');
        return result;
    };

    onasync = (e: Ievent, callback: (result: number|number64) => void) => {
        e.syscall.apply(null, [e.num, ...e.args, (result) => {
            var callstr = this.formatCall(e, true);
            var str = callstr + this.formatResult(e, result) + style(' ', STYLE.RESET);
            this.print(style(str, STYLE.RESET) + '\n');
            callback(result);
        }]);
    };

    formatAddress(tuple): string {
        var value = UInt64.joinToNumber(tuple[1], tuple[0]);
        return value < 0 ? '-' : '' + '0x' + value.toString(16);
    }

    formatValue(val): string {
        if(typeof val === 'number') {
            var hex = '';
            if(Math.abs(val) > 255) {
                hex = ' ' + (val < 0 ? '-' : '') + '0x' + val.toString(16) + '';
            }
            return String(val) + hex;
        } else if(val instanceof Array) {
            var value = UInt64.joinToNumber(val[1], val[0]);
            var hex = '';
            if(Math.abs(value) > 255) {
                hex = ' ' + (value < 0 ? '-' : '') + '0x' + value.toString(16) + '';
            }
            return `${value} [${val[1]}, ${val[0]}]` + hex;
        } else if(StaticBuffer.isStaticBuffer(val)) {
            return `<StaticBuffer ${this.formatAddress(val.getAddress())}>`;
        } else if(Buffer.isBuffer(val)) {
            return `<Buffer ${this.formatAddress(val.getAddress())}>`;
        } else if(val instanceof ArrayBuffer) {
            return '<ArrayBuffer>';
        } else if(val instanceof Uint8Array) {
            var sab = new StaticArrayBuffer(val.buffer);
            return `<Uint8Array ${this.formatAddress((sab as any).getAddress())}>`;
        } else if(val === null) {
            return 'null';
        } else if(typeof val === 'undefined') {
            return val;
        } else
            return String(val);
    }

    formatCall(e: Ievent, isAsync?: boolean) {
        var str = [
            style('syscall', STYLE.GREEN) + ' ' + (isAsync ? style('ASYNC', STYLE.BG_GREEN) + ' ' : '')
        ];

        var time = Date.now();
        if(this.time)
            str.push(style('+' + interval(time - this.time), STYLE.GREY) + ' ');
        this.time = time;

        str.push(style(e.name, STYLE.CYAN));

        // Format arguments
        var params = ARGS[e.num] || [];
        var args = [];
        for(var i = 0; i < Math.max(params.length, e.args.length); i++) {
            var argstr = '';
            var param = params[i];
            if(param) argstr += style(param[0], STYLE.GREY) + ' ' + style(param[1], STYLE.YELLOW) + ' = ';
            argstr += this.formatValue(e.args[i]);
            args.push(argstr);
        }
        str.push('(' + args.join(', ') + ')');

        return str.join('');
    }

    formatResult(e: Ievent, res: number|number64) {
        var resint: number;
        var resstr: string;
        if(res instanceof Array) {
            resint = UInt64.joinToNumber(res[1], res[0]);
            resstr = this.formatValue(res);
        } else {
            resint = res as number;
            resstr = this.formatValue(res);
        }

        var str = [style(' = ', STYLE.RESET)];

        if(resint < 0) {
            str.push(style('ERROR', STYLE.BG_RED) + ' ' + resstr);
            var errconst = ERROR[-resint];
            if(errconst) {
                str.push(' ' + style(errconst, STYLE.RED));
                var errstr = ERROR_MSG[-resint];
                if(errstr)
                    str.push(' ' + style(errstr, STYLE.YELLOW));
            } else {
                str.push(' ' + style('UNKNOWN', STYLE.RED));
            }
        } else {
            str.push(style(resstr, STYLE.GREEN));
            var results = RESULT[e.num];
            if(results) {
                if(typeof results === 'string') {
                    str.push(' ' + style(results, STYLE.GREY));
                }
            }
        }

        return str.join('');
    }

    // We need to execute syscall explicitly, otherwise `console.log` uses
    // `write` syscall to STDOUT and we get infinite loop.
    protected printSyscall(msg: string) {
        this.syscall(1, 1, msg, msg.length);
    }

    print(msg: string) {
        if(this.syscall) {
            if(this.printQueue.length) {
                for(var oldmsg of this.printQueue) this.printSyscall(oldmsg);
                this.printQueue = [];
            }
            this.printSyscall(msg);
        } else {
            this.printQueue.push(msg);
        }
    }

    protected processSync(num: number, args: any[], is64 = false) {
        var syscall = !is64 ? this.syscall : this.syscall64;
        var event: Ievent = {
            num,
            name: SYS[num],
            args,
            is64,
            syscall,
        };
        var result = this.onsync(event);

        return (typeof result === 'number') || (result instanceof Array)
            ? result
            : syscall.apply(null, [num, ...args]);
    }

    protected processAsync(num: number, args: any[], is64 = false, callback) {
        var syscall = !is64 ? this.asyscall : this.asyscall64;
        var event: Ievent = {
            num,
            name: SYS[num],
            args,
            is64,
            syscall,
        };
        this.onasync(event, (result) => {
            if((typeof result === 'number') || (result instanceof Array)) callback(result);
            else syscall.apply(null, [num, ...args, callback]);
        });
    }

    overwriteSync(object = process, method = 'syscall', method64 = 'syscall64') {
        this.syscall = object[method].bind(object);
        this.syscall64 = object[method64].bind(object);

        object[method] = (num: number, ...args: any[]) => this.processSync(num, args, false);
        object[method64] = (num: number, ...args: any[]) => this.processSync(num, args, true);
    }

    overwriteAsync(object = process, method = 'asyscall', method64 = 'asyscall64') {
        this.asyscall = object[method].bind(object);
        this.asyscall64 = object[method64].bind(object);

        object[method] = (num: number, ...args: any[]) => {
            var callback = args[args.length - 1];
            args = args.splice(0, args.length - 1);
            this.processAsync(num, args, false, callback);
        };
        object[method64] = (num: number, ...args: any[]) => {
            var callback = args[args.length - 1];
            args = args.splice(0, args.length - 1);
            this.processAsync(num, args, true, callback);
        };
    }
}


export function createLogger() {
    return new Strace;
}

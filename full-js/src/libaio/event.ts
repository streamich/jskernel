import {Buffer} from '../lib/buffer';
import {StaticBuffer} from '../lib/static-buffer';


export function noop() {}

export interface Tfrom {
    address: string,
    port: number,
    family: string,
    size: number,
}

export type TonStart   = () => void;
export type TonStop    = () => void;
export type TonData    = (data: Buffer, from?: Tfrom) => void;
export type TonError   = (err: Error, errno?: number) => void;
export type Tcallback  = (err?: Error, data?: any) => void;


export interface ISocket {
    fd: number;
    onstart: TonStart;      // Maps to "listening" event.
    onstop: TonStop;        // Maps to "close" event.
    ondata: TonData;        // Maps to "message" event.
    onerror: TonError;      // Maps to "error" event.
    ref();
    unref();
}


export interface ISocketUdp extends ISocket {
    start(): Error;
    stop(): Error;
    send(buf: Buffer|StaticBuffer, ip: string, port: number): Error;
    bind(port: number, ip?: string): Error;
    setTtl(ttl: number);
    setMulticastTtl(ttl: number);
    setMulticastLoop(on: boolean);
    setBroadcast(on: boolean);
}


export interface IEventPoll {

    /**
     * Blocks while waiting for events. This is basically `epoll_wait` syscall.
     * @param timeout Time in milliseconds
     */
    wait(timeout: number);

    hasRefs(): boolean;
}


export interface IEventPollConstructor {
    new (): IEventPoll;
}

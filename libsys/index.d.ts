
export type TSyscallArg = number|string|Buffer;
export function syscall(cmd: number, arg1?: TSyscallArg, arg2?: TSyscallArg, arg3?: TSyscallArg, arg4?: TSyscallArg, arg5?: TSyscallArg, arg6?: TSyscallArg): number;
export function syscall64(cmd: number, arg1?: TSyscallArg, arg2?: TSyscallArg, arg3?: TSyscallArg, arg4?: TSyscallArg, arg5?: TSyscallArg, arg6?: TSyscallArg): [number, number];
export function addr(buf: Buffer): number;
export function addr64(buf: Buffer): [number, number];
export function malloc(addr: number, size: number): ArrayBuffer;
export function malloc64(addr_lo: number, addr_hi: number, size: number): ArrayBuffer;
export function call(addr: number);
export function call64(addr_lo: number, addr_hi: number);
export function errno(): number;

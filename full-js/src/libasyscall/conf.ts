
export const enum CONF {
    INT = 8,
    BLOCK_FIELDS = 9,
    BLOCK_SIZE = CONF.BLOCK_FIELDS * CONF.INT,
    THREADS = 2,
}


export const enum LOCK {
    UNINITIALIZED   = 0,    // Block not used yet.
    FREE            = 1,    // Block ready to be acquired by a thread.
    LOCKED          = 2,    // Block locked by a thread, thread is executing syscall.
    DONE            = 3,    // Thread done executing syscall, result stored at offset 8.
    EXIT            = 4,    // Thread has to perform SYS_exit syscall.
}

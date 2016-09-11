// make --trace && ./full-duktape
#include "duktape.h"
#include <sys/types.h>
#include <syscall.h>
#include <errno.h>
#include <stdlib.h>
#include <stdio.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>
#include <string.h>


typedef int64_t t_int;
typedef int32_t t_int32;
typedef int64_t t_int64;
typedef t_int32 (*callback)();
typedef t_int32 (*callback1)(t_int32 arg1);
typedef t_int32 (*callback2)(t_int32 arg1, t_int32 arg2);
typedef t_int32 (*callback3)(t_int32 arg1, t_int32 arg2, t_int32 arg3);
typedef t_int32 (*callback4)(t_int32 arg1, t_int32 arg2, t_int32 arg3, t_int32 arg4);
typedef t_int32 (*callback5)(t_int32 arg1, t_int32 arg2, t_int32 arg3, t_int32 arg4, t_int32 arg5);
typedef t_int32 (*callback6)(t_int32 arg1, t_int32 arg2, t_int32 arg3, t_int32 arg4, t_int32 arg5, t_int32 arg6);
typedef t_int32 (*callback7)(t_int32 arg1, t_int32 arg2, t_int32 arg3, t_int32 arg4, t_int32 arg5, t_int32 arg6, t_int32 arg7);
typedef t_int32 (*callback8)(t_int32 arg1, t_int32 arg2, t_int32 arg3, t_int32 arg4, t_int32 arg5, t_int32 arg6, t_int32 arg7, t_int32 arg8);
typedef t_int32 (*callback9)(t_int32 arg1, t_int32 arg2, t_int32 arg3, t_int32 arg4, t_int32 arg5, t_int32 arg6, t_int32 arg7, t_int32 arg8, t_int32 arg9);
typedef t_int32 (*callback10)(t_int32 arg1, t_int32 arg2, t_int32 arg3, t_int32 arg4, t_int32 arg5, t_int32 arg6, t_int32 arg7, t_int32 arg8, t_int32 arg9, t_int32 arg10);



t_int fulljs_get_buffer_address(duk_context *ctx, int index) {
    return (t_int) duk_get_buffer_data(ctx, index, NULL);
}


t_int fulljs_arg_to_int(duk_context *ctx, int index) {
    if(duk_is_number(ctx, index)) {
        return (t_int) duk_get_int(ctx, index);
    } else if(duk_is_string(ctx, index)) {
        return (t_int) duk_get_string(ctx, index);
    } else if(duk_is_array(ctx, index)) {
        duk_get_prop_index(ctx, index, 0);
        duk_get_prop_index(ctx, index, 1);
        t_int32 hi = (t_int32) duk_get_int(ctx, -1);
        t_int32 lo = (t_int32) duk_get_int(ctx, -2);
        t_int addr;
        addr = (t_int) ((((t_int64) hi) << 32) | ((t_int64) lo & 0xffffffff));
        
        duk_get_prop_index(ctx, index, 2);
        if(!duk_is_undefined(ctx, -1)) {
            t_int32 offset = (t_int32) duk_get_int(ctx, -1);
            addr += offset;
        }
        
        return addr;
    } else { // assume buffer
        return fulljs_get_buffer_address(ctx, index);
    }
}


t_int fulljs_exec_syscall(duk_context *ctx) {
    char len = duk_get_top(ctx);
    int cmd = (int) duk_get_int(ctx, 0);
    t_int res;
    
    switch(len) {
        case 1:
            res = (t_int) syscall(cmd);
            break;
        case 2:
            res = (t_int) syscall(cmd,
                    fulljs_arg_to_int(ctx, 1));
            break;
        case 3:
            res = (t_int) syscall(cmd,
                    fulljs_arg_to_int(ctx, 1),
                    fulljs_arg_to_int(ctx, 2));
            break;
        case 4:
            res = (t_int) syscall(cmd,
                    fulljs_arg_to_int(ctx, 1),
                    fulljs_arg_to_int(ctx, 2),
                    fulljs_arg_to_int(ctx, 3));
            break;
        case 5:
            res = (t_int) syscall(cmd,
                    fulljs_arg_to_int(ctx, 1),
                    fulljs_arg_to_int(ctx, 2),
                    fulljs_arg_to_int(ctx, 3),
                    fulljs_arg_to_int(ctx, 4));
            break;
        case 6:
            res = (t_int) syscall(cmd,
                    fulljs_arg_to_int(ctx, 1),
                    fulljs_arg_to_int(ctx, 2),
                    fulljs_arg_to_int(ctx, 3),
                    fulljs_arg_to_int(ctx, 4),
                    fulljs_arg_to_int(ctx, 5));
            break;
        case 7:
            res = (t_int) syscall(cmd,
                    fulljs_arg_to_int(ctx, 1),
                    fulljs_arg_to_int(ctx, 2),
                    fulljs_arg_to_int(ctx, 3),
                    fulljs_arg_to_int(ctx, 4),
                    fulljs_arg_to_int(ctx, 5),
                    fulljs_arg_to_int(ctx, 6));
            break;
        default:
            return res = -1;
    }
    
    return res == -1 ? (t_int) -errno : res;
}


int fulljs_api_syscall(duk_context *ctx) {
    t_int res = fulljs_exec_syscall(ctx);
    duk_push_number(ctx, (t_int32) res);
    return 1;     
}

int fulljs_return_number64(duk_context* ctx, t_int num) {
    int32_t lo = num & 0xffffffff;
    int32_t hi = num >> 32;
    
    duk_uarridx_t arr_idx;
    arr_idx = duk_push_array(ctx);
    duk_push_int(ctx, lo);
    duk_put_prop_index(ctx, arr_idx, 0);
    duk_push_int(ctx, hi);
    duk_put_prop_index(ctx, arr_idx, 1);
    
    return 1;
}

int fulljs_api_syscall64(duk_context *ctx) {
    t_int res = fulljs_exec_syscall(ctx);
    return fulljs_return_number64(ctx, res);
}

int fulljs_api_getAddress(duk_context *ctx) {
    t_int addr = fulljs_get_buffer_address(ctx, 0);
    return fulljs_return_number64(ctx, addr);
}


int fulljs_api_frame(duk_context *ctx) {
    void* addr = (void*) fulljs_arg_to_int(ctx, 0);
    size_t size = (size_t) duk_get_int(ctx, 1);
         
    duk_push_external_buffer(ctx);
    duk_config_buffer(ctx, -1, addr, size);
    return 1;
}


int fulljs_api_call(duk_context *ctx) {
    t_int addr = fulljs_arg_to_int(ctx, 0);
    char len = duk_get_top(ctx);

    t_int32 offset;
    if(len > 1) {
        offset = (t_int32) duk_get_int(ctx, 1);
        addr += offset;
    }
    
    t_int res;
    if(len <= 2) {
        res = ((callback) addr)();
    } else {
        len = (char) duk_get_length(ctx, 2);
        for(char i = 0; i < len; i++) {
            duk_get_prop_index(ctx, 2, i);
        }
        switch(len) {
            case 0:
                res = ((callback) addr)();
                break;
            case 1:
                res = ((callback1) addr)(
                        fulljs_arg_to_int(ctx, -1));
                break;
            case 2:
                res = ((callback2) addr)(
                        fulljs_arg_to_int(ctx, -2),
                        fulljs_arg_to_int(ctx, -1));
            case 3:
                res = ((callback3) addr)(
                        fulljs_arg_to_int(ctx, -3),
                        fulljs_arg_to_int(ctx, -2),
                        fulljs_arg_to_int(ctx, -1));
            case 4:
                res = ((callback4) addr)(
                        fulljs_arg_to_int(ctx, -4),
                        fulljs_arg_to_int(ctx, -3),
                        fulljs_arg_to_int(ctx, -2),
                        fulljs_arg_to_int(ctx, -1));
            case 5:
                res = ((callback5) addr)(
                        fulljs_arg_to_int(ctx, -5),
                        fulljs_arg_to_int(ctx, -4),
                        fulljs_arg_to_int(ctx, -3),
                        fulljs_arg_to_int(ctx, -2),
                        fulljs_arg_to_int(ctx, -1));
            case 6:
                res = ((callback6) addr)(
                        fulljs_arg_to_int(ctx, -6),
                        fulljs_arg_to_int(ctx, -5),
                        fulljs_arg_to_int(ctx, -4),
                        fulljs_arg_to_int(ctx, -3),
                        fulljs_arg_to_int(ctx, -2),
                        fulljs_arg_to_int(ctx, -1));
            case 7:
                res = ((callback7) addr)(
                        fulljs_arg_to_int(ctx, -7),
                        fulljs_arg_to_int(ctx, -6),
                        fulljs_arg_to_int(ctx, -5),
                        fulljs_arg_to_int(ctx, -4),
                        fulljs_arg_to_int(ctx, -3),
                        fulljs_arg_to_int(ctx, -2),
                        fulljs_arg_to_int(ctx, -1));
            case 8:
                res = ((callback8) addr)(
                        fulljs_arg_to_int(ctx, -8),
                        fulljs_arg_to_int(ctx, -7),
                        fulljs_arg_to_int(ctx, -6),
                        fulljs_arg_to_int(ctx, -5),
                        fulljs_arg_to_int(ctx, -4),
                        fulljs_arg_to_int(ctx, -3),
                        fulljs_arg_to_int(ctx, -2),
                        fulljs_arg_to_int(ctx, -1));
            case 9:
                res = ((callback9) addr)(
                        fulljs_arg_to_int(ctx, -9),
                        fulljs_arg_to_int(ctx, -8),
                        fulljs_arg_to_int(ctx, -7),
                        fulljs_arg_to_int(ctx, -6),
                        fulljs_arg_to_int(ctx, -5),
                        fulljs_arg_to_int(ctx, -4),
                        fulljs_arg_to_int(ctx, -3),
                        fulljs_arg_to_int(ctx, -2),
                        fulljs_arg_to_int(ctx, -1));
            case 10:
                res = ((callback10) addr)(
                        fulljs_arg_to_int(ctx, -10),
                        fulljs_arg_to_int(ctx, -9),
                        fulljs_arg_to_int(ctx, -8),
                        fulljs_arg_to_int(ctx, -7),
                        fulljs_arg_to_int(ctx, -6),
                        fulljs_arg_to_int(ctx, -5),
                        fulljs_arg_to_int(ctx, -4),
                        fulljs_arg_to_int(ctx, -3),
                        fulljs_arg_to_int(ctx, -2),
                        fulljs_arg_to_int(ctx, -1));
                break;
            default:
                return DUK_RET_TYPE_ERROR;
        }
    }
    
    duk_push_number(ctx, res);
    return 1;
}


int fulljs_api_errno(duk_context *ctx) {
    duk_push_number(ctx, errno);
    return 1;
}


char* fulljs_read_file(char* filename) {
    if(access(filename, F_OK) < 0) {
        return NULL;
    }
    
    int fd = open(filename, O_RDONLY);
    if(fd < 0) return NULL;
    
    char buf[4096];
    ssize_t n;
    char *str = NULL;
    size_t len = 0;
    while (n = read(fd, buf, sizeof buf)) {
        if (n < 0) {
            if (errno == EAGAIN)
                continue;
            perror("read");
            break;
        }
        str = realloc(str, len + n + 1);
        memcpy(str + len, buf, n);
        len += n;
        str[len] = '\0';
    }
    return str;
}


int fulljs_api_readFile(duk_context *ctx) {
    char* str = duk_get_string(ctx, 0);
    char* content = fulljs_read_file(str);
    duk_push_string(ctx, content);
    return 1;
}


void fulljs_load_main(duk_context* ctx, char* filename) {
    char* str = fulljs_read_file(filename);
    if(!str) {
        printf("Could not load file: %s\n", filename);
        return;
    }
    duk_eval_string(ctx, str);    
}


int main(int argc, char *argv[]) {
    duk_context *ctx = duk_create_heap_default();

    if (ctx) {
        duk_eval_string(ctx,
            "var process = {title: 'full.js'};"
            "var global = {process: process};"
            "Duktape.global = global;"
            "Duktape.process = process;");
            
        duk_eval_string(ctx, "(process)");
        
        duk_push_c_function(ctx, fulljs_api_syscall, DUK_VARARGS);
        duk_put_prop_string(ctx, -2, "syscall");
        
        duk_push_c_function(ctx, fulljs_api_syscall64, DUK_VARARGS);
        duk_put_prop_string(ctx, -2, "syscall64");
        
        duk_push_c_function(ctx, fulljs_api_getAddress, 2);
        duk_put_prop_string(ctx, -2, "getAddress");
        
        duk_push_c_function(ctx, fulljs_api_frame, 2);
        duk_put_prop_string(ctx, -2, "frame");
                
        duk_push_c_function(ctx, fulljs_api_call, DUK_VARARGS);
        duk_put_prop_string(ctx, -2, "call");
        
        duk_push_c_function(ctx, fulljs_api_errno, 0);
        duk_put_prop_string(ctx, -2, "errno");
        
        duk_push_c_function(ctx, fulljs_api_readFile, 1);
        duk_put_prop_string(ctx, -2, "readFile");        

        if(argc >= 2) {
            duk_push_string(ctx, "argv");
            duk_push_array(ctx);
            for(int i = 1; i < argc; i++) {
                duk_push_string(ctx, argv[i]);
                duk_put_prop_index(ctx, -2, i - 2);
            }
            duk_put_prop(ctx, -3);
            
            fulljs_load_main(ctx, argv[1]);
        } else {
            printf("*.js file name argument expected.\n");
        }
        
        duk_destroy_heap(ctx);
    }
    return 0;
}


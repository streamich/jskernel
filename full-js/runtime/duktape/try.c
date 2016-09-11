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


int main(int argc, char *argv[]) {
    duk_context *ctx = duk_create_heap_default();

    if (ctx) {

        t_int64 a = -122;
        int32_t b = (int32_t) (((uint64_t) a) & 0xffffffff);;
        int32_t c = (int32_t) (((uint64_t) a) >> 32);
        printf("a: %lli\n", a);
        printf("b: %i\n", b);
        printf("c: %i\n", c);


        duk_eval_string(ctx, "(Duktape)");
        duk_push_string(ctx, "int");
        duk_push_array(ctx);
        duk_push_number(ctx, b);
        duk_put_prop_index(ctx, -2, 0);
        duk_push_number(ctx, c);
        duk_put_prop_index(ctx, -2, 1);
        duk_put_prop(ctx, -3);
        duk_eval_string(ctx, "print(Duktape.int)");


        duk_eval_string(ctx, "(Duktape)");
        duk_push_string(ctx, "int");
        duk_get_prop(ctx, -2);
        duk_get_prop_index(ctx, -1, 0);
        duk_get_prop_index(ctx, -2, 1);
        int32_t b2 = duk_get_int(ctx, -2);
        int32_t c2 = duk_get_int(ctx, -1);
        int64_t a2 = (int64_t) ((((int64_t) c2) << 32) | ((int64_t) b2 & 0xffffffff));
        printf("a: %lli\n", a2);
        printf("b: %i\n", b2);
        printf("c: %i\n", c2);

    }
    return 0;
}


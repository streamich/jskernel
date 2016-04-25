#include <iostream>
#include <syscall.h>
#include <unistd.h>
#include <stdio.h>
#include <sys/types.h>

#include <node.h>
#include <node_buffer.h>
#include <v8.h>
#include <stdint.h>
#include <string.h>

using namespace v8;

// `syscall` with zero arguments.
uint64_t exec_syscall_0(uint64_t cmd) {
    uint64_t result;
    __asm__ (
        "mov %0, %%rax \n"
        "syscall \n"
        :
        : "r" (cmd)
        : "%rax"
    );
    return result;
}

// `syscall` with 1 argument.
uint64_t exec_syscall_1(uint64_t cmd, uint64_t arg1) {
    uint64_t result;
    __asm__ (
        "mov %0, %%rax \n"
        "mov %1, %%rdi \n"
        "syscall \n"
        :
        : "r" (cmd), "r" (arg1)
        : "%rax"
    );
    return result;
}

uint64_t exec_syscall_3(uint64_t cmd, uint64_t arg1, uint64_t arg2, uint64_t arg3) {
    // http://man7.org/linux/man-pages/man2/syscall.2.html
    uint64_t result;
    __asm__ (
        "mov %1, %%rax \n"
        "mov %2, %%rdi \n"
        "mov %3, %%rsi \n"
        "mov %4, %%rdx \n"
        "syscall \n"
        "mov %%rax, %0 \n"
        : "=r" (result)
        : "r" (cmd), "r" (arg1), "r" (arg2), "r" (arg3)
        : "%rax", "%rdi", "%rsi", "%rdx"
    );
    return result;
}


Handle<Value> Method(const Arguments& args) {
    HandleScope scope;
//    char* buf = node::Buffer::Data(args[0]);

    char msg[] = "haasdfha\n";
    exec_syscall_3(1, 1, (uint64_t) &msg, 3);

    return scope.Close(String::New("world"));
}


uint64_t GetBufferAddr(Local<Object> obj) {
    return (uint64_t) node::Buffer::Data(obj);
}

uint64_t ArgToInt(Local<Value> arg) {
    if(arg->IsNumber()) {
        return (uint64_t) arg->Int32Value();
    } else {
        if(arg->IsString()) {
            String::Utf8Value v8str(arg->ToString());
//            String::AsciiValue  v8str(arg->ToString());
            std::string cppstr = std::string(*v8str);
            const char *cstr = cppstr.c_str();
            return (uint64_t) cstr;
        } else {
            return GetBufferAddr(arg->ToObject());
        }
    }
}


Handle<Value> MethodSyscall(const Arguments& args) {
    HandleScope scope;

    char len = (char) args.Length();
    uint64_t result;

    uint64_t cmd = (uint64_t) args[0]->Int32Value();

    if(len == 1) {
        result = syscall(cmd);
        return scope.Close(Number::New(result));
    }

    uint64_t arg1 = ArgToInt(args[1]);
    if(len == 2) {
        result = syscall(cmd, arg1);
        return scope.Close(Number::New(result));
    }

    uint64_t arg2 = ArgToInt(args[2]);
    if(len == 3) {
        result = syscall(cmd, arg1, arg2);
        return scope.Close(Number::New(result));
    }

    uint64_t arg3 = ArgToInt(args[3]);
    if(len == 4) {
        result = syscall(cmd, arg1, arg2, arg3);
        return scope.Close(Number::New(result));
    }

    uint64_t arg4 = ArgToInt(args[4]);
    if(len == 5) {
        result = syscall(cmd, arg1, arg2, arg3, arg4);
        return scope.Close(Number::New(result));
    }

    uint64_t arg5 = ArgToInt(args[5]);
    if(len == 6) {
        result = syscall(cmd, arg1, arg2, arg3, arg4, arg5);
        return scope.Close(Number::New(result));
    }

    uint64_t arg6 = ArgToInt(args[6]);
    if(len == 7) {
        result = syscall(cmd, arg1, arg2, arg3, arg4, arg5, arg6);
        return scope.Close(Number::New(result));
    }
}


Handle<Value> MethodBufAddr32(const Arguments& args) {
    HandleScope scope;
    return scope.Close(Number::New(GetBufferAddr(args[0]->ToObject())));
}


Handle<Value> MethodBufAddr64(const Arguments& args) {
    HandleScope scope;
    uint64_t p = GetBufferAddr(args[0]->ToObject());
    uint32_t lo = (uint32_t) (p & 0xffffffff);
    uint32_t hi = (uint32_t) (p >> 32);

    Handle<Array> array = Array::New(2);
    array->Set(0, Integer::New(hi));
    array->Set(1, Integer::New(lo));
    return scope.Close(array);
}

void Init(Handle<Object> exports) {
    exports->Set(String::NewSymbol("hello"),    FunctionTemplate::New(Method)->GetFunction());
    exports->Set(String::NewSymbol("syscall"),  FunctionTemplate::New(MethodSyscall)->GetFunction());
    exports->Set(String::NewSymbol("addr"),     FunctionTemplate::New(MethodBufAddr64)->GetFunction());
    exports->Set(String::NewSymbol("addr32"),   FunctionTemplate::New(MethodBufAddr32)->GetFunction());
}

NODE_MODULE(hello, Init)

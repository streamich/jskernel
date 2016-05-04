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
#include <errno.h>

namespace jskernel {

    using v8::FunctionCallbackInfo;
    using v8::Isolate;
    using v8::Local;
    using v8::Object;
    using v8::String;
    using v8::Value;
    using v8::Handle;
    using v8::Array;
    using v8::Integer;
    using v8::Exception;
    using v8::ArrayBuffer;

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

    int64_t ExecSyscall(const FunctionCallbackInfo<Value>& args) {
        char len = (char) args.Length();

        int64_t cmd = (uint64_t) args[0]->Int32Value();
        if(len == 1) {
            int64_t res = syscall(cmd);
            // Fix the `errno` returned
            // http://yarchive.net/comp/linux/errno.html
            return res == -1 ? -errno : res;
        }

        int64_t arg1 = ArgToInt(args[1]);
        if(len == 2) {
            int64_t res = syscall(cmd, arg1);
            return res == -1 ? -errno : res;
        }

        int64_t arg2 = ArgToInt(args[2]);
        if(len == 3) {
            int64_t res = syscall(cmd, arg1, arg2);
            return res == -1 ? -errno : res;
        }

        int64_t arg3 = ArgToInt(args[3]);
        if(len == 4) {
            int64_t res = syscall(cmd, arg1, arg2, arg3);
            return res == -1 ? -errno : res;
        }

        int64_t arg4 = ArgToInt(args[4]);
        if(len == 5) {
             int64_t res = syscall(cmd, arg1, arg2, arg3, arg4);
             return res == -1 ? -errno : res;
         }

        int64_t arg5 = ArgToInt(args[5]);
        if(len == 6) {
            int64_t res = syscall(cmd, arg1, arg2, arg3, arg4, arg5);
            return res == -1 ? -errno : res;
        }

        int64_t arg6 = ArgToInt(args[6]);
        if(len == 7) {
            int64_t res = syscall(cmd, arg1, arg2, arg3, arg4, arg5, arg6);
            return res == -1 ? -errno : res;
        }
    }

    void MethodSyscall(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        char len = (char) args.Length();
        if(len > 7) isolate->ThrowException(String::NewFromUtf8(isolate, "Syscall with over 6 arguments."));
        else args.GetReturnValue().Set(Integer::New(isolate, ExecSyscall(args)));
    }

    Handle<Array> Int64ToArray(Isolate* isolate, int64_t number) {
        int32_t lo = number & 0xffffffff;
        int32_t hi = number >> 32;

        Handle<Array> array = Array::New(isolate, 2);
        array->Set(0, Integer::New(isolate, lo));
        array->Set(1, Integer::New(isolate, hi));
        return array;
    }

    void MethodSyscall64(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        char len = (char) args.Length();
        if(len > 7) isolate->ThrowException(String::NewFromUtf8(isolate, "Syscall with over 6 arguments."));
        else {
            int64_t result = ExecSyscall(args);
            std::cout << " sys64: " << result << std::endl;
            args.GetReturnValue().Set(Int64ToArray(isolate, result));
        }
    }

    void MethodBufAddr64(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        int64_t addr = GetBufferAddr(args[0]->ToObject());
        args.GetReturnValue().Set(Int64ToArray(isolate, addr));
    }

    void MethodBufAddr(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        uint64_t addr = GetBufferAddr(args[0]->ToObject());
        args.GetReturnValue().Set(Integer::New(isolate, addr));
    }

    void MethodMalloc(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();

        char* addr = (char*) args[0]->Int32Value();
        size_t size = (size_t) args[1]->Int32Value();

        Local<ArrayBuffer> buf = ArrayBuffer::New(isolate, (void*) addr, size);
        args.GetReturnValue().Set(buf);
    }

    void MethodMalloc64(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();

        int32_t lo = (int32_t) args[0]->Int32Value();
        int32_t hi = (int32_t) args[1]->Int32Value();
        int64_t addr = (((int64_t) hi) << 32) | ((int64_t) lo);

        std::cout << " malloc addr: " << addr << std::endl;

        size_t size = (size_t) args[2]->Int32Value();

        Local<ArrayBuffer> buf = ArrayBuffer::New(isolate, (void*) addr, size);
//        v8::Local<v8::Object> buf = node::Buffer::New(isolate, (char*) addr, size).ToLocalChecked();
        args.GetReturnValue().Set(buf);
    }

    void MethodErrno(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        args.GetReturnValue().Set(Integer::New(isolate, errno));
    }

//    void MethodGen(const FunctionCallbackInfo<Value>& args) {
//        Isolate* isolate = args.GetIsolate();
//
//        size_t size = 3;
//        char* data = (char*) malloc(size);
//        data[0] = 65;
//        data[1] = 66;
//        data[2] = 67;
//
//
//        args.GetReturnValue().Set(Integer::New(isolate, (uint64_t) data));
//    }

    void init(Local<Object> exports) {
        NODE_SET_METHOD(exports, "syscall",     MethodSyscall);
        NODE_SET_METHOD(exports, "syscall64",   MethodSyscall64);
        NODE_SET_METHOD(exports, "addr",        MethodBufAddr);
        NODE_SET_METHOD(exports, "addr64",      MethodBufAddr64);
        NODE_SET_METHOD(exports, "malloc",      MethodMalloc);
        NODE_SET_METHOD(exports, "malloc64",    MethodMalloc64);
        NODE_SET_METHOD(exports, "errno",       MethodErrno);
//        NODE_SET_METHOD(exports, "gen",         MethodGen);
    }

    NODE_MODULE(addon, init)

}

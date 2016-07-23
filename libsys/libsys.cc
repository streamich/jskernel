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
    using v8::Uint8Array;
    using v8::TypedArray;


    uint64_t GetAddrBuffer(Local<Object> obj) {
        return (uint64_t) node::Buffer::Data(obj);
    }

    uint64_t GetAddrArrayBuffer(Local<Object> obj) {
        Local<ArrayBuffer> ab = obj.As<ArrayBuffer>();
        ArrayBuffer::Contents ab_c = ab->GetContents();
        return (uint64_t)(ab_c.Data());
    }

//    uint64_t GetAddrUint8Array(Local<Object> obj) {
//        Local<Uint8Array> ui = obj.As<Uint8Array>();
//        ArrayBuffer::Contents ab_c = ui->Buffer()->GetContents();
//        return (uint64_t)(ab_c.Data()) + ui->ByteOffset();
//    }

    uint64_t GetAddrTypedArray(Local<Object> obj) {
        Local<TypedArray> ta = obj.As<TypedArray>();
        ArrayBuffer::Contents ab_c = ta->Buffer()->GetContents();
        return (uint64_t)(ab_c.Data()) + ta->ByteOffset();
    }

    int64_t ArgToInt(Local<Value> arg) {
        if(arg->IsNumber()) {
            return (int64_t) arg->Int32Value();
        } else {
            if(arg->IsString()) {
                String::Utf8Value v8str(arg->ToString());
    //            String::AsciiValue  v8str(arg->ToString());
                std::string cppstr = std::string(*v8str);
                const char *cstr = cppstr.c_str();
                return (uint64_t) cstr;
            } else if(arg->IsArrayBuffer()) {
                return GetAddrArrayBuffer(arg->ToObject());
//            } else if(arg->IsUint8Array()) {
            } else if(arg->IsTypedArray()) {
//                return GetAddrUint8Array(arg->ToObject());
                return GetAddrTypedArray(arg->ToObject());
            } else if (arg->IsArray()) { // [lo, hi, offset]
                Local<Array> arr = arg.As<Array>();
                uint32_t arrlen = arr->Length();

                int32_t lo = (int32_t) arr->Get(0)->Int32Value();
                int32_t hi = (int32_t) arr->Get(1)->Int32Value();

                uint64_t addr = (uint64_t) ((((int64_t) hi) << 32) | ((int64_t) lo & 0xffffffff));

                if(arrlen == 3) {
                    int32_t offset = (int32_t) arr->Get(2)->Int32Value();
                    addr += offset;
                }

                return addr;
            } else {
                // Assume it is `Buffer`.
                return GetAddrBuffer(arg->ToObject());
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

        return -1;
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

//        std::cout << "split: " << lo << ", " << hi << std::cout;

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
//            std::cout << "syscall: " << result << std::endl;
            args.GetReturnValue().Set(Int64ToArray(isolate, result));
        }
    }

    void MethodAddrArrayBuffer(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        uint64_t addr = GetAddrArrayBuffer(args[0]->ToObject());
        args.GetReturnValue().Set(Integer::New(isolate, addr));
    }

    void MethodAddrArrayBuffer64(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        uint64_t addr = GetAddrArrayBuffer(args[0]->ToObject());
        if(args.Length() == 2) {
            int32_t offset = (int32_t) args[1]->Int32Value();
            addr += offset;
        }
        args.GetReturnValue().Set(Int64ToArray(isolate, addr));
    }

    void MethodAddrTypedArray(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        uint64_t addr = GetAddrTypedArray(args[0]->ToObject());
        args.GetReturnValue().Set(Integer::New(isolate, addr));
    }

    void MethodAddrTypedArray64(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        uint64_t addr = GetAddrTypedArray(args[0]->ToObject());
        args.GetReturnValue().Set(Int64ToArray(isolate, addr));
    }

    void MethodAddrBuffer(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        uint64_t addr = GetAddrBuffer(args[0]->ToObject());
        args.GetReturnValue().Set(Integer::New(isolate, addr));
    }

    void MethodAddrBuffer64(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        int64_t addr = GetAddrBuffer(args[0]->ToObject());
        args.GetReturnValue().Set(Int64ToArray(isolate, addr));
    }

    void MethodMalloc(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();

        void* addr = (void*) ArgToInt(args[0]);
        size_t size = (size_t) args[1]->Int32Value();

        Local<ArrayBuffer> buf = ArrayBuffer::New(isolate, addr, size);
        args.GetReturnValue().Set(buf);
    }

    void MethodErrno(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();
        args.GetReturnValue().Set(Integer::New(isolate, errno));
    }

    typedef int64_t number; // JavaScript number.
    typedef number (*callback)();
    typedef number (*callback1)(number arg1);
    typedef number (*callback2)(number arg1, number arg2);
    typedef number (*callback3)(number arg1, number arg2, number arg3);
    typedef number (*callback4)(number arg1, number arg2, number arg3, number arg4);
    typedef number (*callback5)(number arg1, number arg2, number arg3, number arg4, number arg5);
    typedef number (*callback6)(number arg1, number arg2, number arg3, number arg4, number arg5, number arg6);
    typedef number (*callback7)(number arg1, number arg2, number arg3, number arg4, number arg5, number arg6, number arg7);
    typedef number (*callback8)(number arg1, number arg2, number arg3, number arg4, number arg5, number arg6, number arg7, number arg8);
    typedef number (*callback9)(number arg1, number arg2, number arg3, number arg4, number arg5, number arg6, number arg7, number arg8, number arg9);
    typedef number (*callback10)(number arg1, number arg2, number arg3, number arg4, number arg5, number arg6, number arg7, number arg8, number arg9, number arg10);


    void MethodCall(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();

        uint64_t addr = ArgToInt(args[0]);
        char len = (char) args.Length();

        int32_t offset;
        if(len > 1) {
            offset = (int32_t) args[1]->Int32Value();
            addr += offset;
        }

        if(len <= 2) {
            args.GetReturnValue().Set(Integer::New(isolate, ((callback) addr)()));
            return;
        }

        Local<Array> arr = args[2].As<Array>();
        uint32_t arrlen = arr->Length();

        switch(arrlen) {
            case 0:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback) addr)()));
                break;
            case 1:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback1) addr)(
                    ArgToInt(arr->Get(0))
                    )));
                break;
            case 2:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback2) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1))
                    )));
                break;
            case 3:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback3) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2))
                    )));
                break;
            case 4:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback4) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2)), ArgToInt(arr->Get(3))
                    )));
                break;
            case 5:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback5) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2)), ArgToInt(arr->Get(3)), ArgToInt(arr->Get(4))
                    )));
                break;
            case 6:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback6) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2)), ArgToInt(arr->Get(3)), ArgToInt(arr->Get(4)),
                    ArgToInt(arr->Get(5))
                    )));
                break;
            case 7:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback7) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2)), ArgToInt(arr->Get(3)), ArgToInt(arr->Get(4)),
                    ArgToInt(arr->Get(5)), ArgToInt(arr->Get(6))
                    )));
                break;
            case 8:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback8) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2)), ArgToInt(arr->Get(3)), ArgToInt(arr->Get(4)),
                    ArgToInt(arr->Get(5)), ArgToInt(arr->Get(6)), ArgToInt(arr->Get(7))
                    )));
                break;
            case 9:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback9) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2)), ArgToInt(arr->Get(3)), ArgToInt(arr->Get(4)),
                    ArgToInt(arr->Get(5)), ArgToInt(arr->Get(6)), ArgToInt(arr->Get(7)), ArgToInt(arr->Get(8))
                    )));
                break;
            case 10:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback10) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2)), ArgToInt(arr->Get(3)), ArgToInt(arr->Get(4)),
                    ArgToInt(arr->Get(5)), ArgToInt(arr->Get(6)), ArgToInt(arr->Get(7)), ArgToInt(arr->Get(8)), ArgToInt(arr->Get(9))
                    )));
                break;
            default:
                isolate->ThrowException(String::NewFromUtf8(isolate, "Too many arguments."));
        }
    }

/*
    void MethodCall64(const FunctionCallbackInfo<Value>& args) {
        Isolate* isolate = args.GetIsolate();

        int32_t lo = (int32_t) args[0]->Int32Value();
        int32_t hi = (int32_t) args[1]->Int32Value();
        int64_t addr = (((int64_t) hi) << 32) | ((int64_t) lo & 0xffffffff);
        uint64_t offset = (uint64_t) args[2]->Int32Value();
        addr += offset;
        char len = (char) args.Length();

        uint64_t offset;
        if(len > 1) {
            offset = (uint64_t) args[1]->Int32Value();
            addr += offset;
        }

        if(len <= 3) {
            args.GetReturnValue().Set(Integer::New(isolate, ((callback) addr)()));
            return;
        }

        Local<Array> arr = args[3].As<Array>();
        uint32_t arrlen = arr->Length();

        switch(arrlen) {
            case 0:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback) addr)()));
                break;
            case 1:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback1) addr)(
                    ArgToInt(arr->Get(0))
                    )));
                break;
            case 2:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback2) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1))
                    )));
                break;
            case 3:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback3) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2))
                    )));
                break;
            case 4:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback4) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2)), ArgToInt(arr->Get(3))
                    )));
                break;
            case 5:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback5) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2)), ArgToInt(arr->Get(3)), ArgToInt(arr->Get(4))
                    )));
                break;
            case 6:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback6) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2)), ArgToInt(arr->Get(3)), ArgToInt(arr->Get(4)),
                    ArgToInt(arr->Get(5))
                    )));
                break;
            case 7:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback7) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2)), ArgToInt(arr->Get(3)), ArgToInt(arr->Get(4)),
                    ArgToInt(arr->Get(5)), ArgToInt(arr->Get(6))
                    )));
                break;
            case 8:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback8) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2)), ArgToInt(arr->Get(3)), ArgToInt(arr->Get(4)),
                    ArgToInt(arr->Get(5)), ArgToInt(arr->Get(6)), ArgToInt(arr->Get(7))
                    )));
                break;
            case 9:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback9) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2)), ArgToInt(arr->Get(3)), ArgToInt(arr->Get(4)),
                    ArgToInt(arr->Get(5)), ArgToInt(arr->Get(6)), ArgToInt(arr->Get(7)), ArgToInt(arr->Get(8))
                    )));
                break;
            case 10:
                args.GetReturnValue().Set(Integer::New(isolate, ((callback10) addr)(
                    ArgToInt(arr->Get(0)), ArgToInt(arr->Get(1)), ArgToInt(arr->Get(2)), ArgToInt(arr->Get(3)), ArgToInt(arr->Get(4)),
                    ArgToInt(arr->Get(5)), ArgToInt(arr->Get(6)), ArgToInt(arr->Get(7)), ArgToInt(arr->Get(8)), ArgToInt(arr->Get(9))
                    )));
                break;
            default:
                isolate->ThrowException(String::NewFromUtf8(isolate, "Too many arguments."));
        }
    }
    */

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
        NODE_SET_METHOD(exports, "syscall",                 MethodSyscall);
        NODE_SET_METHOD(exports, "syscall64",               MethodSyscall64);
        NODE_SET_METHOD(exports, "errno",                   MethodErrno);
        NODE_SET_METHOD(exports, "addressArrayBuffer",      MethodAddrArrayBuffer);
        NODE_SET_METHOD(exports, "addressArrayBuffer64",    MethodAddrArrayBuffer64);
        NODE_SET_METHOD(exports, "addressTypedArray",       MethodAddrTypedArray);
        NODE_SET_METHOD(exports, "addressTypedArray64",     MethodAddrTypedArray64);
        NODE_SET_METHOD(exports, "addressBuffer",           MethodAddrBuffer);
        NODE_SET_METHOD(exports, "addressBuffer64",         MethodAddrBuffer64);
        NODE_SET_METHOD(exports, "malloc",                  MethodMalloc);
//        NODE_SET_METHOD(exports, "malloc64",                MethodMalloc64);
        NODE_SET_METHOD(exports, "call",                    MethodCall);
//        NODE_SET_METHOD(exports, "call64",                  MethodCall64);
//        NODE_SET_METHOD(exports, "jump",                  MethodJump);
//        NODE_SET_METHOD(exports, "gen",                   MethodGen);
    }

    NODE_MODULE(addon, init)

}

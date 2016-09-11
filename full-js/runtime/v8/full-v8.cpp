// g++ full-v8.cpp -o full-v8 -I/v8/v8 -Wl,--start-group /v8/v8/out/x64.release/obj.target/{tools/gyp/libv8_{base,libbase,external_snapshot,libplatform},third_party/icu/libicu{uc,i18n,data}}.a -Wl,--end-group -lrt -ldl -pthread -std=c++0x
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fstream>
#include <unistd.h>
#include <iostream>
#include <sys/types.h>
#include <errno.h>
#include <unistd.h>
#include "include/libplatform/libplatform.h"
#include "include/v8.h"

using namespace v8;


namespace FULL {

    // Converts 2/3-tuple array to 64-bit integer (address).
    int64_t tupleToInt(Local<Array> arr) { // [lo, hi, offset]
        uint32_t arrlen = arr->Length();

        // Convert two signed 32-bit ints into a 64-bit value.
        int32_t lo = (int32_t) arr->Get(0)->Int32Value();
        int32_t hi = (int32_t) arr->Get(1)->Int32Value();
        int64_t num = (int64_t) ((((int64_t) hi) << 32) | ((int64_t) lo & 0xffffffff));

        // If the array is 3-tuple, treat the 3rd argument as `offset` that we add to the result,
        // useful when working with 64-bit memory addresses, because JS does not have a native way
        // to add/subtract 64-bit values.
        if(arrlen == 3) {
            int32_t offset = (int32_t) arr->Get(2)->Int32Value();
            num += offset;
        }

        return num;
    }

    Local<Array> intToTuple(Isolate* isolate, int64_t num) {
        int32_t lo = (int32_t) (num & 0xffffffff);
        int32_t hi = (int32_t) (num >> 32);
        Local<Array> tuple = Array::New(isolate);
        tuple->Set(0, Integer::New(isolate, lo));
        tuple->Set(1, Integer::New(isolate, hi));
        return tuple;
    }

    // Converts JavaScript values to integers.
    int64_t argToInt(Local<Value> arg) {
        if(arg->IsNumber()) {
            return (int64_t) arg->Int32Value();
        } else if (arg->IsTypedArray()) {
            Local<TypedArray> ta = arg.As<TypedArray>();
            ArrayBuffer::Contents ab_c = ta->Buffer()->GetContents();
            return (int64_t) ((int64_t) ab_c.Data() + ta->ByteOffset());
        } else if(arg->IsArrayBuffer()) {
            Local<ArrayBuffer> ab = arg.As<ArrayBuffer>();
            ArrayBuffer::Contents ab_c = ab->GetContents();
            return (int64_t) (ab_c.Data());
        } else if(arg->IsString()) {
            String::Utf8Value v8str(arg->ToString());
            // String::AsciiValue  v8str(arg->ToString());
            std::string cppstr = std::string(*v8str);
            const char *cstr = cppstr.c_str();
            return (int64_t) cstr;
        } else if (arg->IsArray()) { // [lo, hi, offset]
            return tupleToInt(arg.As<Array>());
        } else
            return 0;
    }

    int64_t execSyscall(const FunctionCallbackInfo<Value>& args) {
        char len = (char) args.Length();
        int64_t cmd = (uint64_t) args[0]->Int32Value();

        switch(len) {
            case 1: return syscall(cmd);
            case 2: return syscall(cmd,
                                   argToInt(args[1]));
            case 3: return syscall(cmd,
                                   argToInt(args[1]),
                                   argToInt(args[2]));
            case 4: return syscall(cmd,
                                   argToInt(args[1]),
                                   argToInt(args[2]),
                                   argToInt(args[3]));
            case 5: return syscall(cmd,
                                   argToInt(args[1]),
                                   argToInt(args[2]),
                                   argToInt(args[3]),
                                   argToInt(args[4]));
            case 6: return syscall(cmd,
                                   argToInt(args[1]),
                                   argToInt(args[2]),
                                   argToInt(args[3]),
                                   argToInt(args[4]),
                                   argToInt(args[5]));
            case 7: return syscall(cmd,
                                   argToInt(args[1]),
                                   argToInt(args[2]),
                                   argToInt(args[3]),
                                   argToInt(args[4]),
                                   argToInt(args[5]),
                                   argToInt(args[6]));
            default:
                return -1;
        }
    }

    typedef int32_t (*callback)();
    typedef int32_t (*callback1)(int64_t arg1);
    typedef int32_t (*callback2)(int64_t arg1, int64_t arg2);
    typedef int32_t (*callback3)(int64_t arg1, int64_t arg2, int64_t arg3);
    typedef int32_t (*callback4)(int64_t arg1, int64_t arg2, int64_t arg3, int64_t arg4);
    typedef int32_t (*callback5)(int64_t arg1, int64_t arg2, int64_t arg3, int64_t arg4, int64_t arg5);
    typedef int32_t (*callback6)(int64_t arg1, int64_t arg2, int64_t arg3, int64_t arg4, int64_t arg5, int64_t arg6);
    typedef int32_t (*callback7)(int64_t arg1, int64_t arg2, int64_t arg3, int64_t arg4, int64_t arg5, int64_t arg6, int64_t arg7);
    typedef int32_t (*callback8)(int64_t arg1, int64_t arg2, int64_t arg3, int64_t arg4, int64_t arg5, int64_t arg6, int64_t arg7, int64_t arg8);
    typedef int32_t (*callback9)(int64_t arg1, int64_t arg2, int64_t arg3, int64_t arg4, int64_t arg5, int64_t arg6, int64_t arg7, int64_t arg8, int64_t arg9);
    typedef int32_t (*callback10)(int64_t arg1, int64_t arg2, int64_t arg3, int64_t arg4, int64_t arg5, int64_t arg6, int64_t arg7, int64_t arg8, int64_t arg9, int64_t arg10);

    void print(const FunctionCallbackInfo<Value>& args) {
        if(args.Length()) {
            String::Utf8Value utf8(args[0]);
            printf("%s\n", *utf8);
        } else {
            printf("\n");
        }
    }

    void readFile(const FunctionCallbackInfo<Value>& args) {
        String::Utf8Value v8str(args[0]->ToString());
        std::string cppstr = std::string(*v8str);
        std::ifstream file(cppstr);
        if(file) {
            std::string str;
            std::string file_contents;
            while (std::getline(file, str)) {
                file_contents += str;
                file_contents.push_back('\n');
            }
            args.GetReturnValue().Set(String::NewFromOneByte(args.GetIsolate(), (uint8_t *) file_contents.c_str()));
        }
    }


    class Process {
    public:

        static int argc;
        static char* argv[];

        static void getArgv(const FunctionCallbackInfo<Value>& args) {
            Isolate* isolate = args.GetIsolate();
            Local<Array> argv = Array::New(isolate, Process::argc);
            uint32_t i;
//            for(i = 0; i < )

//            int64_t result = execSyscall(args);
//            if(result == -1) result = errno;
//            args.GetReturnValue().Set(Integer::New(, result));
        }

        static void syscall(const FunctionCallbackInfo<Value>& args) {
            int64_t result = execSyscall(args);
            if(result == -1) result = errno;
            args.GetReturnValue().Set(Integer::New(args.GetIsolate(), result));
        }

        static void syscall64(const FunctionCallbackInfo<Value>& args) {
            int64_t result = execSyscall(args);
            if(result == -1) result = errno;
            args.GetReturnValue().Set(intToTuple(args.GetIsolate(), result));
        }

        static void frame(const FunctionCallbackInfo<Value>& args) {
            void* addr = (void*) argToInt(args[0]);
            size_t size = (size_t) args[1]->Int32Value();

            Local<ArrayBuffer> buf = ArrayBuffer::New(args.GetIsolate(), addr, size);
            args.GetReturnValue().Set(buf);
        }

        static void getAddress(const FunctionCallbackInfo<Value>& args) {
            Local<ArrayBuffer> ab = args[0].As<ArrayBuffer>();
            ArrayBuffer::Contents ab_c = ab->GetContents();
            int64_t addr = (int64_t)(ab_c.Data());
            args.GetReturnValue().Set(intToTuple(args.GetIsolate(), addr));
        }

        static void call(const FunctionCallbackInfo<Value>& args) {
            Isolate* isolate = args.GetIsolate();

            int64_t addr = argToInt(args[0]);
            char len = (char) args.Length();

            int32_t offset;
            if(len > 1) {
                offset = (int32_t) args[1]->Int32Value();
                addr += offset;
            }

            int32_t res;
            if(len <= 2) {
                res = ((callback) addr)();
            } else {
                Local<Array> arr = args[2].As<Array>();
                switch(arr->Length()) {
                    case 0:
                        res = ((callback) addr)();
                        break;
                    case 1:
                        res = ((callback1) addr)(
                                argToInt(arr->Get(0))
                        );
                        break;
                    case 2:
                        res = ((callback2) addr)(
                                argToInt(arr->Get(0)),
                                argToInt(arr->Get(1))
                        );
                        break;
                    case 3:
                        res = ((callback3) addr)(
                                argToInt(arr->Get(0)),
                                argToInt(arr->Get(1)),
                                argToInt(arr->Get(2))
                        );
                        break;
                    case 4:
                        res = ((callback4) addr)(
                                argToInt(arr->Get(0)),
                                argToInt(arr->Get(1)),
                                argToInt(arr->Get(2)),
                                argToInt(arr->Get(3))
                        );
                        break;
                    case 5:
                        res = ((callback5) addr)(
                                argToInt(arr->Get(0)),
                                argToInt(arr->Get(1)),
                                argToInt(arr->Get(2)),
                                argToInt(arr->Get(3)),
                                argToInt(arr->Get(4))
                        );
                        break;
                    case 6:
                        res = ((callback6) addr)(
                                argToInt(arr->Get(0)),
                                argToInt(arr->Get(1)),
                                argToInt(arr->Get(2)),
                                argToInt(arr->Get(3)),
                                argToInt(arr->Get(4)),
                                argToInt(arr->Get(5))
                        );
                        break;
                    case 7:
                        res = ((callback7) addr)(
                                argToInt(arr->Get(0)),
                                argToInt(arr->Get(1)),
                                argToInt(arr->Get(2)),
                                argToInt(arr->Get(3)),
                                argToInt(arr->Get(4)),
                                argToInt(arr->Get(5)),
                                argToInt(arr->Get(6))
                        );
                        break;
                    case 8:
                        res = ((callback8) addr)(
                                argToInt(arr->Get(0)),
                                argToInt(arr->Get(1)),
                                argToInt(arr->Get(2)),
                                argToInt(arr->Get(3)),
                                argToInt(arr->Get(4)),
                                argToInt(arr->Get(5)),
                                argToInt(arr->Get(6)),
                                argToInt(arr->Get(7))
                        );
                        break;
                    case 9:
                        res = ((callback9) addr)(
                                argToInt(arr->Get(0)),
                                argToInt(arr->Get(1)),
                                argToInt(arr->Get(2)),
                                argToInt(arr->Get(3)),
                                argToInt(arr->Get(4)),
                                argToInt(arr->Get(5)),
                                argToInt(arr->Get(6)),
                                argToInt(arr->Get(7)),
                                argToInt(arr->Get(8))
                        );
                        break;
                    case 10:
                        res = ((callback10) addr)(
                                argToInt(arr->Get(0)),
                                argToInt(arr->Get(1)),
                                argToInt(arr->Get(2)),
                                argToInt(arr->Get(3)),
                                argToInt(arr->Get(4)),
                                argToInt(arr->Get(5)),
                                argToInt(arr->Get(6)),
                                argToInt(arr->Get(7)),
                                argToInt(arr->Get(8)),
                                argToInt(arr->Get(9))
                        );
                        break;
                }
            }

            args.GetReturnValue().Set(Integer::New(isolate, res));
        }

        static void err(const FunctionCallbackInfo<Value>& args) {
            args.GetReturnValue().Set(Integer::New(args.GetIsolate(), errno));
        }
    };
}



class ArrayBufferAllocator : public v8::ArrayBuffer::Allocator {
public:
    virtual void* Allocate(size_t length) {
        void* data = AllocateUninitialized(length);
        return data;
//        return data == NULL ? data : memset(data, 0, length);
    }

    virtual void* AllocateUninitialized(size_t length) {
        void* ptr = malloc(length);
//        printf("malloc: %lli\n", ptr);
        return ptr;
    }
    virtual void Free(void* data, size_t) {
//        printf("free: %lli\n", data);
        free(data);
    }
};

int main(int argc, char* argv[]) {

    if(argc <= 1) {
        printf("Please provide path to FULL.js as first argument.");
        return 0;
    }

    // Initialize V8.
    V8::InitializeICU();
    V8::InitializeExternalStartupData(argv[0]);
    Platform* platform = platform::CreateDefaultPlatform();
    V8::InitializePlatform(platform);
    V8::Initialize();
    // Create a new Isolate and make it the current one.
    ArrayBufferAllocator allocator;
    Isolate::CreateParams create_params;
    create_params.array_buffer_allocator = &allocator;
    Isolate* isolate = Isolate::New(create_params);
    {
        Isolate::Scope isolate_scope(isolate);
        HandleScope handle_scope(isolate);


        // Create process global variable.
        Local<ObjectTemplate> global = ObjectTemplate::New(isolate);
        Local<ObjectTemplate> process = ObjectTemplate::New(isolate);

        // These are required by FULL.js
        process->Set(String::NewFromUtf8(isolate, "runtime"), String::NewFromUtf8(isolate, "v8"));
        process->Set(String::NewFromUtf8(isolate, "arch"), String::NewFromUtf8(isolate, "x64"));
        process->Set(String::NewFromUtf8(isolate, "platform"), String::NewFromUtf8(isolate, "linux"));
        process->Set(String::NewFromUtf8(isolate, "syscall"), FunctionTemplate::New(isolate, FULL::Process::syscall));

        // Needed for asynchronous `fs.js` methods to create thread pool.
        process->Set(String::NewFromUtf8(isolate, "syscall64"), FunctionTemplate::New(isolate, FULL::Process::syscall64));
        process->Set(String::NewFromUtf8(isolate, "frame"), FunctionTemplate::New(isolate, FULL::Process::frame));
        process->Set(String::NewFromUtf8(isolate, "getAddress"), FunctionTemplate::New(isolate, FULL::Process::getAddress));
        process->Set(String::NewFromUtf8(isolate, "call"), FunctionTemplate::New(isolate, FULL::Process::call));

        // Nice to have.
        process->Set(String::NewFromUtf8(isolate, "errno"), FunctionTemplate::New(isolate, FULL::Process::err));

        // Create globals
        Local<ObjectTemplate> superGlobal = ObjectTemplate::New(isolate);
        superGlobal->Set(String::NewFromUtf8(isolate, "process"), process);
        superGlobal->Set(String::NewFromUtf8(isolate, "global"), global);

        // The below methods are not used by FULL.js, they are here just for while debugging FULL.js.
        superGlobal->Set(String::NewFromUtf8(isolate, "print"), FunctionTemplate::New(isolate, FULL::print));
        superGlobal->Set(String::NewFromUtf8(isolate, "readFile"), FunctionTemplate::New(isolate, FULL::readFile));

        //Persistent<Context> context = Context::New(isolate, NULL, global);
        Local<Context> context = Context::New(isolate, NULL, superGlobal);
        Context::Scope context_scope(context);

        // Create `argv` global array, after context is ready, otherwise any `new Array` would segfault.
        // Later we set it on `process.argv`.
        // TODO: the below is very ugly, need to prettify...
        Local<Array> _argv = Array::New(isolate);
        uint32_t i = 0;
        for(i = 0; i < argc; i++)
            _argv->Set(i, String::NewFromOneByte(isolate, (uint8_t *) argv[i]));
        context->Global()->Set(String::NewFromUtf8(isolate, "argv"), _argv);
        Local<String> source =
            String::NewFromUtf8(isolate,
                                "process.argv = argv;",
                                NewStringType::kNormal).ToLocalChecked();
        Local<Script> script = Script::Compile(context, source).ToLocalChecked();
        script->Run(context).ToLocalChecked();
//        Local<Value> result = script->Run(context).ToLocalChecked();
//        String::Utf8Value utf8(result);
//        printf("%s\n", *utf8);


        // Run FULL.js
        std::ifstream file(argv[1]);
        std::string str;
        std::string file_contents;
        if(file) {
            while (std::getline(file, str)) {
                file_contents += str;
                file_contents.push_back('\n');
            }
            Local<String> fulljs = String::NewFromOneByte(isolate, (uint8_t*) file_contents.c_str());
            Script::Compile(context, fulljs).ToLocalChecked()->Run(context).ToLocalChecked();
        } else {
            printf("%s\n", "Could not find FULL.js file.");
        }
    }

    // Dispose the isolate and tear down V8.
    isolate->Dispose();
    V8::Dispose();
    V8::ShutdownPlatform();
    delete platform;
    return 0;
}

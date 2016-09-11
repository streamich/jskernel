This assumes V8 v4.8 is built in `/v8/v8` folder.

Run:

    g++ full-v8.cpp -o full-v8 -I/v8/v8 -Wl,--start-group /v8/v8/out/x64.release/obj.target/{tools/gyp/libv8_{base,libbase,external_snapshot,libplatform},third_party/icu/libicu{uc,i18n,data}}.a -Wl,--end-group -lrt -ldl -pthread -std=c++0x


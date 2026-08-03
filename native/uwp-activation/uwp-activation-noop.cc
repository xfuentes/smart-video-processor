#include <napi.h>

Napi::Array GetUwpActivationFiles(const Napi::CallbackInfo& info) {
    return Napi::Array::New(info.Env());
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "getUwpActivationFiles"),
                Napi::Function::New(env, GetUwpActivationFiles));
    return exports;
}

NODE_API_MODULE(uwp_activation, Init)

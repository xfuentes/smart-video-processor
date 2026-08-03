#include <napi.h>
#include <Windows.h>
#include <shellapi.h>
#include <string_view>
#include <winrt/Windows.ApplicationModel.h>
#include <winrt/Windows.ApplicationModel.Activation.h>
#include <winrt/Windows.Foundation.Collections.h>
#include <winrt/Windows.Storage.h>

using namespace winrt;
using namespace Windows::ApplicationModel;
using namespace Windows::ApplicationModel::Activation;
using namespace Windows::Foundation::Collections;
using namespace Windows::Storage;

Napi::Array GetUwpActivationFiles(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Array result = Napi::Array::New(env);

    try {
        auto args = AppInstance::GetActivatedEventArgs();
        if (args.Kind() == ActivationKind::File) {
            auto fileArgs = args.try_as<IFileActivatedEventArgs>();
            if (fileArgs) {
                auto files = fileArgs.Files();
                uint32_t index = 0;
                uint32_t count = files.Size();
                for (uint32_t i = 0; i < count; ++i) {
                    auto item = files.GetAt(i);
                    auto storageFile = item.try_as<StorageFile>();
                    if (storageFile) {
                        auto path = storageFile.Path();
                        std::wstring_view pathView = path;
                        if (!pathView.empty()) {
                            result.Set(index++, Napi::String::New(env, winrt::to_string(pathView)));
                        }
                    }
                }
            }
        } else if (args.Kind() == ActivationKind::CommandLineLaunch) {
            auto clArgs = args.try_as<ICommandLineActivatedEventArgs>();
            if (clArgs) {
                auto operation = clArgs.Operation();
                auto commandLine = operation.Arguments();
                std::wstring_view commandLineView = commandLine;
                if (!commandLineView.empty()) {
                    int argCount = 0;
                    LPWSTR* argv = CommandLineToArgvW(commandLineView.data(), &argCount);
                    if (argv) {
                        uint32_t index = 0;
                        for (int i = 0; i < argCount; ++i) {
                            std::wstring_view argView(argv[i]);
                            if (!argView.empty()) {
                                result.Set(index++, Napi::String::New(env, winrt::to_string(argView)));
                            }
                        }
                        LocalFree(argv);
                    }
                }
            }
        }
    } catch (...) {
        // Activation data is unavailable or not supported: return empty array.
    }

    return result;
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "getUwpActivationFiles"),
                Napi::Function::New(env, GetUwpActivationFiles));
    return exports;
}

NODE_API_MODULE(uwp_activation, Init)

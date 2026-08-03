{
  "targets": [
    {
      "target_name": "uwp_activation",
      "conditions": [
        ["OS=='win'", {
          "sources": ["uwp-activation-win.cc"],
          "defines": ["NAPI_CPP_EXCEPTIONS", "NAPI_VERSION=9"],
          "cflags!": ["-fno-exceptions"],
          "cflags_cc!": ["-fno-exceptions"],
          "msbuild_settings": {
            "ClCompile": {
              "ExceptionHandling": "Sync",
              "LanguageStandard": "stdcpp17"
            },
            "Link": {
              "ImageHasSafeExceptionHandlers": "false"
            }
          },
          "libraries": [
            "-lWindowsApp.lib"
          ]
        }, {
          "sources": ["uwp-activation-noop.cc"],
          "defines": ["NAPI_VERSION=9"]
        }]
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "dependencies": [
        "<!(node -p \"require('node-addon-api').gyp\")"
      ]
    }
  ]
}

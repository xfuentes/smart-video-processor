# JDownloader plugin for Smart Video Processor

This folder contains an **EventScripter script** for [JDownloader](https://jdownloader.org/) that automatically launches **Smart Video Processor** when a video file finishes downloading or when video files are extracted from an archive.

## Files

- `SmartVideoProcessor.eventscripter.js` — script to copy and paste into JDownloader.

## Requirements

- JDownloader 2 installed and up to date.
- The **EventScripter** extension must be installed (it is bundled with JDownloader but may need to be enabled).
- Smart Video Processor installed on the machine.
- The path to the `SmartVideoProcessor.exe` executable is known (svp.exe without path can be used with Windows Store version).

## Installation

1. Open JDownloader.
2. Go to **Settings → Addons / Extensions**.
3. Enable the **EventScripter** extension if it is not already enabled, then restart JDownloader if prompted.
4. Open the EventScripter settings.
5. Create a new script for downloaded files:
   - **Name**: `Smart Video Processor - Download stopped`
   - **Trigger**: `A download stopped`
6. (Optional) Create a second new script for extracted archives:
   - **Name**: `Smart Video Processor - Archive extracted`
   - **Trigger**: `Archive extracted`
7. For each script, copy the contents of `SmartVideoProcessor.eventscripter.js` into the script field.
8. Edit the `var SVP_PATH = ...` line at the top of each script to set the full path of `SmartVideoProcessor.exe` on your computer.
   - In a JavaScript string, every `\` must be doubled: `C:\\Users\\...`.
9. Save and enable the scripts.

## How to find the SmartVideoProcessor.exe path

- If installed with the default **Squirrel** installer:
  `C:\Users\<your_name>\AppData\Local\smart-video-processor\SmartVideoProcessor.exe`
- If installed with an **MSI or in Program Files**:
  `C:\Program Files\Smart Video Processor\SmartVideoProcessor.exe`
- Otherwise, right-click the application shortcut → **Open file location**.

## How it works

The script watches for download and archive-extraction events. If the downloaded or extracted file has a supported video extension (`.mp4`, `.mkv`, `.avi`, etc.), it runs `SmartVideoProcessor.exe` and passes the file path as a command-line argument. Smart Video Processor will then open it directly. When Smart Video Processor is already running, the new files are added to the existing window.

### Triggered extensions

`.mkv`, `.mp4`, `.m4v`, `.avi`, `.mov`, `.qt`, `.webm`, `.flv`, `.wmv`, `.asf`, `.mpg`, `.mpeg`, `.ts`, `.m2ts`, `.mts`, `.vob`, `.ogv`, `.3gp`, `.rm`, `.rmvb`

## Uninstallation

Disable or delete the script in the JDownloader EventScripter interface.

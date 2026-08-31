# Changelog

All notable changes to this project will be documented in this file.

## [1.9.3] - 2026-08-27

### Fixed

- Switched the Flatpak mkvmerge module to prebuilt Debian packages for both x86_64 and aarch64, including only their direct shared-library dependencies (resolving the required libraries with ldd).
- Disabled Git LFS fetching in the Flatpak manifest so Flathub builds do not fail on missing LFS objects.
- Removed invalid OARS 1.1 `content_attribute` IDs from the Flatpak metainfo to pass AppStream validation.

## [1.9.2] - 2026-08-27

### Added

- Added `-n` / `--new-instance` command-line argument to allow running a new app instance.
- Added `-h` / `--help` command-line argument to display the version, description and accepted arguments.

## [1.9.1] - 2026-08-21

### Added

- Added the Flatpak application icon.

### Changed

- Updated the Flatpak manifest to the Freedesktop 25.08 runtime and multi-arch packaging.
- Improved the binary download script to skip files that are already present locally.
- Changed the video player loading screen to a black background with white text.

### Fixed

- Fixed the Flatpak desktop entry categories, MIME types, and keywords formatting.

## [1.9.0] - 2026-08-20

### Added

- Added system dark mode support with theme-aware icons.
- Added Flatpak packaging support and a host-filesystem permission banner.
- Added copy-to-clipboard actions and a "Do not show again" option for permission warnings.
- Added new Output Rules matching operators (`in`, `contains any`, `contains all`).

### Changed

- Reworked the Output Rules settings as an editable, drag-and-drop list.
- Reorganized the Settings dialog into General, Output, Filtering and Encoding tabs.

## [1.8.9] - 2026-08-18

### Fixed

- Fixed filename parsing for movie titles containing bracketed release noise such as `[REMASTERED]`.
- Improved automatic source file deletion by falling back to a permanent delete when the system trash is unavailable.

## [1.8.8] - 2026-08-16

### Added

- Added automatic "Spectacle" genre detection for live performances (one-man show, stand-up comedy, theater play, concert, live performance, etc.) when retrieving movie details from TMDB.

### Changed

- Cleanup progress dialog now uses translated messages and the correct application icon.

## [1.8.7] - 2026-08-13

### Added

- Added a cleanup progress dialog that shows the deletion progress of temporary files when closing the application.

### Fixed

- Fixed escaped newlines in the What's New list for version 1.8.5 so each item renders as a separate bullet.

## [1.8.6] - 2026-08-12

### Fixed

- Fixed a Fluent UI runtime error (`presenceFn is not a function`) by deduping renderer dependencies.
- Fixed peer dependency warnings for Fluent UI, uifabric and electron-builder packages.

### Changed

- Updated the JDownloader EventScripter script to launch Smart Video Processor as a detached background process.
- Added Windows support for the JDownloader EventScripter script.

## [1.8.5] - 2026-08-08

### Changed

- The Cancel toolbar action now also removes selected videos that are waiting in the queue and resets them to the ready-to-process state.
- The application log viewer is now available in a new "Logs" tab in the About dialog instead of the main toolbar.
- Logs now indicate their severity (debug, info, warning, error) and are shown with an appropriate color in the log viewer.
- Video status messages (info, warning and error) are now also emitted to the event log.
- Custom videos now display a warning asking the user to complete the required information before processing.
- The log viewer now stores all log levels; debug entries are shown only when the Debug setting is enabled.
- Process priority values shown in the event log are now translated.

### Fixed

- Multi-search now continues with the remaining selected videos if one search fails, preventing the multi-selection panels from staying disabled.
- Auto-start mode is now disabled for videos that have been canceled or manually searched, preventing them from automatically processing again.

## [1.8.4] - 2026-08-06

### Added

- Added a main toolbar toggle to switch off the computer when all active processing is complete, with a 3-minute countdown cancellation dialog.
- Added a setting to automatically delete successfully processed source files when clearing the list or quitting the application.
- Added Arabic (ar-SA) to the Microsoft Store listing.
- Declared all 23 supported languages in the Windows Store package manifest.

### Changed

- Encoding job progress messages in the job list are now translated based on the selected language.

### Fixed

- TV shows using absolute episode numbering are no longer placed in a season subfolder.
- Pinned taskbar icons no longer duplicate when launching the Microsoft Store version from the Start menu.

## [1.8.3] - 2026-08-04

### Added

- Added Output Rules feature to route processed videos to custom directories based on type, language, year, genres, country or quality.
- Added a README section documenting Output Rules.

### Fixed

- Fixed filename parsing for franchise-style titles that use a year as a separator.
- Fixed language output rule matching so a region-less IETF code like `fr` correctly matches `fr-FR`.

## [1.8.2] - 2026-08-03

### Added

- Opening a video file from the Windows right-click menu now works for the Microsoft Store version.
- Now only the language selector in Settings shows the English name of each language next to its translation.

## [1.8.1] - 2026-08-03

### Added

- Improved language selector sorting.
- Improved TV show matching and episode position display.

### Fixed

- Fixed missing translations in packaged builds.

## [1.8.0] - 2026-08-02

### Added

- Added full app translation support with 24 locales.
- New language settings and IETF-aware search.

### Changed

- Improved locale fallback and robustness for settings loading.

## [1.7.2] - 2026-07-29

### Added

- Added JDownloader EventScripter integration for automated download handling.

### Changed

- Reworked filename parser for more reliable movie and TV show identification.
- Improved build and packaging workflows.

### Fixed

- Various bug fixes and UI polish.

## [1.7.1] - 2026-07-27

### Changed

- Improved track language detection when using manual hints.
- UI consistency improvements for settings and multi-file matching.

### Fixed

- Fixed default search mode when parsing movie and TV show filenames.
- Fixed series poster being downloaded to the wrong or duplicate location.

## [1.7.0] - 2026-07-25

### Changed

- Redesigned TV show matching with more search options (by title, TVDB ID, episode number or episode name).
- Improved episode matching for absolute-numbered series.
- Better handling of missing or not-found episodes with clearer messages.

## [1.6.8] - 2026-07-12

### Fixed

- Fixed security issues.

## [1.6.7] - 2026-03-20

### Fixed

- Fixed preview not showing regression.
- Fixed security issues with new packaging.

## [1.6.5] - 2026-01-26

### Changed

- Show mixed selection if different data on multi select.

### Fixed

- Fixed issues with track encoding selection.

## [1.6.4] - 2026-01-19

### Changed

- Improved absolute episode number matching (good for mangas).
- Improved UI performance.
- Added response caching for TVDB and TMDB.

## [1.6.3] - 2026-01-10

### Added

- Added a setting to re-encode on codec mismatch.

### Fixed

- Fixed issue with multi encode.
- Fixed matching of series even if no episode number is specified.

## [1.6.2] - 2025-12-30

### Added

- Support drag and drop movie parts.
- Display progression while generating preview.
- High speed conversion of files if format is not supported for preview.

### Fixed

- Fixed issue with second part joining and trimming.

## [1.6.1] - 2025-12-29

### Added

- Display a warning message if the application can't access removable medias (snap).
- Added What's new section in about dialog.
- Added Features section in about dialog.

## [1.6.0] - 2025-12-26

### Added

- Added Multi edit tv shows for fast matching
- Added Mass TV Series Episode edition

## [1.5.10] - 2025-12-11

### Fixed

- Fixed Wrong codec in target filename

## [1.5.9] - 2025-12-01

### Fixed

- Fixed Old files loading issue

## [1.5.5] - 2025-11-26

### Added

- Added Open files with drag drop or button and settings dialog
- Added Rest of UI
- Added External program path settings
- Added Settings validation at startup
- Added About dialog
- Added 'other' video type.
- Added Banner and remove update check on linux
- Added New processing tab
- Added Beginning of processing tab
- Added Display video previews with ruler
- Added Video preview display
- Added Split and concat code 1/2
- Added Remove part button, improve setStartFrom and setEndAt
- Added New temp directory setting

### Changed

- Improved Preview matching and tracks
- Improved Video codec setting to auto.
- Improved Tmp files handling and cleanup
- Improved Version retriever 1/2
- Improved Display ffmpeg and mkvmerge versions in about dialog
- Improved Separate list and video listeners for better update mechanism
- Improved UI responsiveness
- Disabled Controls when encoding
- Improved Movie name matching
- Improved Snapshot at load time and retrieve keyframes only when needed
- Improved User entered year if not found in DB
- Improved Ffmpeg mkvmerge and ffprobe published with application and setting removed

### Fixed

- Fixed Connect UI to controller with IPC and fix windows packaging
- Fixed Settings update and x265 encoding on linux
- Fixed Pause/unpause, cancel and process icon disabled issue
- Fixed Mkvmerge language argument inconsistency
- Fixed Other type of videos
- Fixed Two pass encoding for x264 and x265
- Fixed X265 encoding on windows
- Fixed Disk space issue because of tmp files
- Fixed Clear button wrongly staying disabled
- Fixed Div hights
- Fixed Shm issue with snaps
- Fixed Startup issue if program missing
- Fixed Loading issue with snap version
- Fixed To allow entering year when not in DB
- Fixed Display issue in matching tab
- Fixed Workaround ffmpeg MJPEG attachment issue
- Fixed Test and fix trim and concat
- Fixed Intermittent issue detecting ffmpeg path with snaps
- Fixed Mapping and cleanup temp files
- Fixed Auto selection of tracks issue
- Fixed Issue with tvShow episode search
- Fixed Issue with language selector and improve display of snapshots
- Fixed Language selector bug
- Fixed Poster not showing on some systems
- Fixed Issue running commands with symbolic link
- Fixed Find executable path and taking snapshot issue
- Fixed Issue when no overviews present in tv show search results
- Fixed Workaround issue with electron-builder 26 on linux
- Fixed Linux packaging, fix merge not returning errors

## [1.5.4] - 2025-11-17

### Fixed

- Fixed Issue when no overviews present in tv show search results

## [1.5.3] - 2025-11-15

### Changed

- Improved Snapshot at load time and retrieve keyframes only when needed
- Improved User entered year if not found in DB

### Fixed

- Fixed Issue running commands with symbolic link
- Fixed Find executable path and taking snapshot issue

## [1.5.2] - 2025-11-05

### Fixed

- Fixed Poster not showing on some systems

## [1.5.0] - 2025-11-04

### Added

- Added New processing tab
- Added Beginning of processing tab
- Added Display video previews with ruler
- Added Video preview display
- Added Split and concat code 1/2
- Added Remove part button, improve setStartFrom and setEndAt
- Added New temp directory setting

### Fixed

- Fixed Test and fix trim and concat
- Fixed Mapping and cleanup temp files
- Fixed Auto selection of tracks issue
- Fixed Issue with language selector and improve display of snapshots
- Fixed Language selector bug

## [1.4.10] - 2025-11-03

### Fixed

- Fixed Issue with tvShow episode search

## [1.4.9] - 2025-10-25

### Fixed

- Fixed Intermittent issue detecting ffmpeg path with snaps

## [1.4.8] - 2025-10-17

### Fixed

- Fixed Workaround ffmpeg MJPEG attachment issue

## [1.4.7] - 2025-10-13

### Fixed

- Fixed Display issue in matching tab

## [1.4.6] - 2025-10-10

### Changed

- Improved Separate list and video listeners for better update mechanism
- Improved UI responsiveness
- Disabled Controls when encoding
- Improved Movie name matching

### Fixed

- Fixed To allow entering year when not in DB

## [1.4.5] - 2025-10-07

### Fixed

- Fixed Bugs

## [1.4.4] - 2025-10-01

### Fixed

- Fixed Loading issue with snap version

## [1.4.3] - 2025-09-30

### Added

- Added Banner and remove update check on linux

### Fixed

- Fixed Shm issue with snaps
- Fixed Startup issue if program missing

## [1.4.1] - 2025-09-27

### Changed

- Improved Version retriever 1/2
- Improved Display ffmpeg and mkvmerge versions in about dialog

### Fixed

- Fixed Div hights

## [1.4.0] - 2025-09-27

### Fixed

- Fixed Clear button wrongly staying disabled

## [1.3.4] - 2025-09-24

### Fixed

- Fixed Disk space issue because of tmp files

## [1.3.3] - 2025-09-24

### Fixed

- Fixed Two pass encoding for x264 and x265
- Fixed X265 encoding on windows

## [1.3.2] - 2025-09-23

### Fixed

- Fixed Other type of videos

## [1.3.0] - 2025-09-23

### Changed

- Improved Tmp files handling and cleanup

## [1.1.0] - 2025-09-16

### Added

- Added 'other' video type.

### Changed

- Improved Video codec setting to auto.

## [1.0.0] - 2025-09-13

### Added

- Added About dialog

## [0.3.0] - 2025-09-11

### Fixed

- Fixed Pause/unpause, cancel and process icon disabled issue
- Fixed Mkvmerge language argument inconsistency

## [0.2.1] - 2025-09-09

### Fixed

- Fixed Settings update and x265 encoding on linux

## [0.2.0] - 2025-09-09

### Added

- Added External program path settings
- Added Settings validation at startup

## [0.1.0] - 2025-09-02

### Added

- Added Open files with drag drop or button and settings dialog
- Added Rest of UI

### Changed

- Improved Preview matching and tracks

### Fixed

- Fixed Connect UI to controller with IPC and fix windows packaging

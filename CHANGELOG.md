# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Changed
- The application log viewer is now available in a new "Logs" tab in the About dialog instead of the main toolbar.
- Logs now indicate their severity (debug, info, warning, error) and are shown with an appropriate color in the log viewer.
- Video status messages (info, warning and error) are now also emitted to the event log.
- Custom videos now display a warning asking the user to complete the required information before processing.
- The log viewer now stores all log levels; debug entries are shown only when the Debug setting is enabled.
- Process priority values shown in the event log are now translated.

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

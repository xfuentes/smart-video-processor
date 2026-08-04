# Changelog

All notable changes to this project will be documented in this file.

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

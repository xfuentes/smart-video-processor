---
name: changelog
description: Update CHANGELOG.md automatically when a notable new feature or bug fix is implemented. Use this skill after completing any user-facing feature or significant bug fix.
---

# Changelog maintenance

## When to use this skill

- After implementing a new feature, enhancement, or notable bug fix that affects the end user.
- Do not use it for pure refactors, internal-only changes, or trivial fixes.

## How to update `CHANGELOG.md`

1. Open `/home/xfuentes/Documents/Projects/smart-video-processor/CHANGELOG.md`.
2. If the file does not exist or does not have an `## [Unreleased]` section, initialize it with:

   ```markdown
   # Changelog

   All notable changes to this project will be documented in this file.

   ## [Unreleased]

   ### Added
   ### Changed
   ### Fixed
   ```

3. Classify the change and add a concise, user-focused bullet point under the matching `###` subsection of `## [Unreleased]`:

   - `### Added` for new features.
   - `### Changed` for changes to existing functionality.
   - `### Fixed` for bug fixes.
   - `### Deprecated`, `### Removed`, or `### Security` if applicable.

4. Keep entries in English, one line, and focused on what the user can see or do differently.
5. Do not set a version number; the release workflow will move the `Unreleased` entries to a versioned section.

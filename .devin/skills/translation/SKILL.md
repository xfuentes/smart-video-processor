---
name: translation
description: Maintain and sync the locale JSON files for the Smart Video Processor.
---

## Locale files

### Tier 1
- Arabic: `locales/ar.json`
- Chinese: `locales/zh.json`
- Dutch: `locales/nl.json`
- English: `locales/en.json`
- French: `locales/fr.json`
- German: `locales/de.json`
- Italian: `locales/it.json`
- Japanese: `locales/ja.json`
- Korean: `locales/ko.json`
- Portuguese: `locales/pt.json`
- Russian: `locales/ru.json`
- Spanish: `locales/es.json`

### Tier 2
- Catalan: `locales/ca.json`
- Czech: `locales/cs.json`
- Danish: `locales/da.json`
- Greek: `locales/el.json`
- Finnish: `locales/fi.json`
- Hebrew: `locales/he.json`
- Hindi: `locales/hi.json`
- Hungarian: `locales/hu.json`
- Indonesian: `locales/id.json`
- Norwegian: `locales/no.json`
- Polish: `locales/pl.json`
- Swedish: `locales/sv.json`
- Thai: `locales/th.json`
- Turkish: `locales/tr.json`
- Ukrainian: `locales/uk.json`
- Vietnamese: `locales/vi.json`

## Rules
- Locale files must be valid JSON. Only these escapes are allowed: `"`, `\\`, `/`, `b`, `f`, `n`, `r`, `t`, `uXXXX`. Apostrophes (`'`) must not be escaped as `\'`.
- Never allow duplicate keys in a locale file.
- Keep the same set of keys in all locale files. Add a key to every file at the same time.
- All skill/project documentation is in English. Non-English text only appears in locale values.
- Use 2-space indentation and a trailing newline.

## Maintenance workflow
1. Parse the file with `JSON.parse`.
2. Re-serialize with `JSON.stringify(obj, null, 2) + "\n"`.
3. Verify it parses again and that `Object.keys(obj).length` matches the other locale file.

## ICU MessageFormat

The project uses the `i18next-icu` plugin. All locale values are parsed as ICU MessageFormat.

### Keys and source strings

- Locale keys are stable, descriptive, dot-separated context identifiers. The key describes where the message is used; it is not the English source text.
- Examples: `main.file_list.photo_counter`, `header.nav.save`, `settings.language.label`.
- For one or two word messages, use a key that clearly describes the context instead of the word itself:
  - `header.nav.open` instead of `open`
  - `main.menu.new_file` instead of `new`
  - `dialog.save.confirm` instead of `confirm`

### Default values

- In React and Node, call `_` with `defaultValue` containing the English ICU source message. `defaultValue` is used when no translation is found and is the source for `en.json`.
- Example:
  ```js
  _('main.file_list.photo_counter', {
    defaultValue: 'You have {count, plural, =0 {no photos.} one {one photo.} other {# photos.}}',
    count: count
  });
  ```
- The `en.json` value for a key must match its `defaultValue` exactly.

### Message syntax

- Use single braces for variables: `{version}`, `{count}`, `{partNumber}`.
- Use `''` to escape a literal apostrophe: `What''s new`.
- Use `#` inside plural branches to insert the count: `{count, plural, one {Selected file: #} other {Selected files: #}}`.

### Locale file structure

- Examples:
  - `en.json`: `"main.file_list.photo_counter": "You have {count, plural, =0 {no photos.} one {one photo.} other {# photos.}}"`
  - `fr.json`: `"main.file_list.photo_counter": "Vous avez {count, plural, =0 {aucune photo.} one {une photo.} other {# photos.}}"`
- Keep the same set of keys in every locale file. Add the context key in all files, then add the localized ICU value in the matching `<language>.json`.

Use this workflow when adding, editing, or deduplicating translations.

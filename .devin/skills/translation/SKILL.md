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
- For infinitive-verb labels, provide a direct-object complement (COD) in the `_()` call via a `cod` option. The script builds a `to <verb> %%<COD>%%` prompt for Google Translate and strips the translated `%%...%%` block from every locale value.

## Maintenance workflow
1. Parse the file with `JSON.parse`.
2. Re-serialize with `JSON.stringify(obj, null, 2) + "\n"`.
3. Verify it parses again and that `Object.keys(obj).length` matches the other locale file.

## Infinitive-verb context

Infinitive-verb labels such as `Open` or `Turn Off` are ambiguous for machine translation. Provide a short direct-object complement (COD) in the `_()` call and the skill will use it to build a clearer prompt.

In the source code:
```tsx
{_('main.toolbar.shutdown', { defaultValue: 'Turn Off', cod: 'this computer' })}
```

The script can then read `defaultValue` and `cod` directly from the source:
```bash
node .devin/skills/translation/add-translation-key.js main.toolbar.shutdown --update
```

The script:
1. Builds the source sentence `to Turn Off %%this computer%%` and sends it to Google Translate.
2. Writes the clean English `defaultValue` to `locales/en.json`:
   ```json
   {
    "main.toolbar.shutdown": "Turn Off"
   }
   ```
3. For every other language, strips the translated `%%...%%` block and any surrounding spaces:
   ```json
   {
    "main.toolbar.shutdown": "Éteindre"
   }
   ```

The `defaultValue` in code and in `locales/en.json` must not contain the `to` prefix or the `%%...%%` context; the script adds `to` and `%%...%%` internally.

## Adding a new translation key

When a new translation key must be created, do not add it manually. Use the `add-translation-key.js` script to add the key to every supported locale file and generate the translations automatically.

1. Set the `GOOGLE_API_KEY` environment variable.
2. Run the script from the project root:
   ```bash
   node .devin/skills/translation/add-translation-key.js <dot.separated.key> ["English source text" ["COD"]] [--update]
   ```
   For new keys with context already in the `_()` call, you can pass just the key:
   ```bash
   node .devin/skills/translation/add-translation-key.js <dot.separated.key> --update
   ```
3. The script writes the English source value to `locales/en.json` and a Google Translate generated value to every other `locales/<lang>.json`. When a COD is provided, the source value is used as-is for `en.json` while the full `to <verb> %%<COD>%%` prompt is used for translation. Use `--update` to overwrite existing keys.
4. Review the generated output, especially ICU placeholders such as `{count}`, `{version}`, etc., because automatic translation may alter them.

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
- For infinitive-verb labels, add a `cod` option with the direct object to help machine translation. The `cod` option is ignored by i18next and only used by the translation skill:
  ```tsx
  {_('main.toolbar.shutdown', { defaultValue: 'Turn Off', cod: 'this computer' })}
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

Use the maintenance workflow above when editing or deduplicating translations; use `add-translation-key.js` when adding new keys.

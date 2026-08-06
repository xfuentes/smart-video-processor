import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const localesDir = path.resolve(import.meta.dirname, '..', '..', '..', 'locales')
const sourceDir = path.resolve(import.meta.dirname, '..', '..', '..', 'src')
const apiKey = process.env.GOOGLE_API_KEY

function findSourceForKey(key) {
  const files = fs
    .readdirSync(sourceDir, { recursive: true })
    .map((name) => path.resolve(sourceDir, name))
    .filter((file) => ['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(file)) && fs.statSync(file).isFile())

  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const callPattern = new RegExp(`_\\(\\s*(?:\\?\\s*)?['"]${escapedKey}['"]\\s*,\\s*\\{([\\s\\S]*?)\\}\\s*\\)`, 'g')

  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8')
    const match = callPattern.exec(text)
    if (match) {
      const block = match[1]
      const defaultValueMatch = block.match(/defaultValue:\\s*(['"])((?:[^'\\\\]|''|\\\\.)*?)\\1/)
      const codMatch = block.match(/cod:\\s*(['"])((?:[^'\\\\]|''|\\\\.)*?)\\1/)
      return {
        value: defaultValueMatch ? defaultValueMatch[2] : undefined,
        cod: codMatch ? codMatch[2] : undefined
      }
    }
  }

  return { value: undefined, cod: undefined }
}

// Direct-object context marker: `Open %%video file%%` gives Google Translate
// extra context for infinitive verbs. The marker is stripped from all locale
// values after translation.
const COD_MARKER = /\s*%%[^%]*%%\s*/g

export function hasCodContext(text) {
  return /%%[^%]+%%/.test(text)
}

export function stripCodContext(text) {
  return text.replace(COD_MARKER, '').trim()
}

export function buildTranslationSource(value, cod) {
  if (!cod) {
    return value
  }
  const infinitiveValue = value.toLowerCase().startsWith('to ') ? value : `to ${value}`
  return `${infinitiveValue} %%${cod}%%`
}

function usage() {
  console.error('Usage: GOOGLE_API_KEY=<key> node add-translation-key.js <dot.separated.key> ["English source text" ["COD"]] [--update]')
  console.error('       GOOGLE_API_KEY=<key> node add-translation-key.js <dot.separated.key> --update')
  console.error('\nWhen "English source text" is omitted, the script reads defaultValue and cod from the _() call in the source.')
  process.exit(1)
}

function fail(message) {
  console.error(`Error: ${message}`)
  process.exit(1)
}

async function translate(text, targetLang) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: 'en',
      target: targetLang,
      format: 'text'
    })
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Google Translate API error (${response.status}): ${body}`)
  }

  const data = await response.json()
  return data.data.translations[0].translatedText
}

function readJson(file) {
  const text = fs.readFileSync(file, 'utf8')
  return JSON.parse(text)
}

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n')
  // Verify the file parses cleanly after writing.
  JSON.parse(fs.readFileSync(file, 'utf8'))
}

async function main() {
  const update = process.argv.includes('--update')
  const positional = process.argv.slice(2).filter((arg) => !arg.startsWith('-'))
  const key = positional[0]
  let value = positional[1]
  let cod = positional[2]

  if (!key || !apiKey) {
    usage()
  }

  if (value === undefined) {
    const source = findSourceForKey(key)
    if (!source.value) {
      fail(`Could not find _() call for "${key}" in the source.`)
    }
    value = source.value
    if (cod === undefined) {
      cod = source.cod
    }
  }

  if (!value) {
    usage()
  }

  const files = fs
    .readdirSync(localesDir)
    .filter((name) => name.endsWith('.json'))
    .map((name) => ({ name, path: path.join(localesDir, name), lang: path.basename(name, '.json') }))

  if (!files.find((f) => f.lang === 'en')) {
    fail('locales/en.json is missing')
  }

  const enFile = files.find((f) => f.lang === 'en')
  const en = readJson(enFile.path)
  if (Object.prototype.hasOwnProperty.call(en, key)) {
    if (!update) {
      fail(`Key "${key}" already exists in locales/en.json. Use --update to overwrite.`)
    }
  }

  const locales = files.filter((f) => f.lang !== 'en')
  const source = buildTranslationSource(value, cod)
  const translated = { en: stripCodContext(value) }

  for (const locale of locales) {
    translated[locale.lang] = stripCodContext(await translate(source, locale.lang))
  }

  for (const { lang, path: filePath } of files) {
    const obj = readJson(filePath)
    obj[key] = translated[lang]
    writeJson(filePath, obj)
    console.log(`Added "${key}" to ${path.basename(filePath)}`)
  }

  console.log('\nDone. Review the generated translations, especially ICU placeholders such as {count}, {version}, etc.')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err.message)
    process.exit(1)
  })
}

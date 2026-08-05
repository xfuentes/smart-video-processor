import fs from 'node:fs'
import path from 'node:path'

const localesDir = path.resolve(import.meta.dirname, '..', '..', '..', 'locales')
const apiKey = process.env.GOOGLE_API_KEY

function usage() {
  console.error('Usage: GOOGLE_API_KEY=<key> node add-translation-key.js <dot.separated.key> "English source text"')
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
  const [key, ...valueParts] = process.argv.slice(2)
  const value = valueParts.join(' ')

  if (!key || !value || !apiKey) {
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
    fail(`Key "${key}" already exists in locales/en.json`)
  }

  const locales = files.filter((f) => f.lang !== 'en')
  const translated = { en: value }

  for (const locale of locales) {
    translated[locale.lang] = await translate(value, locale.lang)
  }

  for (const { lang, path: filePath } of files) {
    const obj = readJson(filePath)
    obj[key] = translated[lang]
    writeJson(filePath, obj)
    console.log(`Added "${key}" to ${path.basename(filePath)}`)
  }

  console.log('\nDone. Review the generated translations, especially ICU placeholders such as {count}, {version}, etc.')
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})

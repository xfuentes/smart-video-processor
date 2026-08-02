import { readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const localeDir = path.join(process.cwd(), 'locales')
const apiKey = process.env.DEEPL_API_KEY
if (!apiKey) {
  throw new Error('Set the DEEPL_API_KEY environment variable.')
}

const apiHost = apiKey.endsWith(':fx') ? 'https://api-free.deepl.com' : 'https://api.deepl.com'

const sourceKeys = {
  'job.title.snapshotting': 'Snapshotting video.',
  'job.title.loading_file_info': 'Loading file information.',
  'job.title.previewing': 'Preparing video preview.',
  'job.title.merging': 'Generating matroska file',
  'job.title.processing': 'Processing, please wait.',
  'job.title.encoding': 'Encoding, please wait.'
}

const projectToDeepL = {
  ar: 'AR',
  cs: 'CS',
  da: 'DA',
  de: 'DE',
  el: 'EL',
  es: 'ES',
  fi: 'FI',
  fr: 'FR',
  hu: 'HU',
  id: 'ID',
  it: 'IT',
  ja: 'JA',
  ko: 'KO',
  nl: 'NL',
  no: 'NB',
  pl: 'PL',
  pt: 'PT-PT',
  ru: 'RU',
  sv: 'SV',
  tr: 'TR',
  uk: 'UK',
  zh: 'ZH'
}

const keys = Object.keys(sourceKeys)
const sourceTexts = Object.values(sourceKeys)

// Update source locale
const enPath = path.join(localeDir, 'en.json')
const enObj = JSON.parse(await readFile(enPath, 'utf8'))
for (const [key, text] of Object.entries(sourceKeys)) {
  enObj[key] = text
}
await writeFile(enPath, JSON.stringify(enObj, null, 2) + '\n')
console.log('updated en.json')

for (const file of await readdir(localeDir)) {
  if (!file.endsWith('.json') || file === 'en.json') continue
  const code = file.replace('.json', '')
  const targetLang = projectToDeepL[code]
  if (!targetLang) {
    console.log(`skip ${file}`)
    continue
  }
  const filePath = path.join(localeDir, file)
  const obj = JSON.parse(await readFile(filePath, 'utf8'))

  const params = new URLSearchParams()
  params.set('source_lang', 'EN')
  params.set('target_lang', targetLang)
  params.set('preserve_formatting', '1')
  for (const text of sourceTexts) {
    params.append('text', text)
  }

  const res = await fetch(`${apiHost}/v2/translate`, {
    method: 'POST',
    headers: { Authorization: `DeepL-Auth-Key ${apiKey}` },
    body: params
  })
  if (!res.ok) {
    throw new Error(`${file}: ${res.status} ${await res.text()}`)
  }

  const { translations } = await res.json()
  for (let i = 0; i < keys.length; i++) {
    const translated = translations[i].text.replace(/'/g, "''")
    obj[keys[i]] = translated
  }
  await writeFile(filePath, JSON.stringify(obj, null, 2) + '\n')
  console.log(`${file}: ${translations.map((t) => t.text).join(' | ')}`)
}

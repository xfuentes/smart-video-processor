import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (!match || line.trim().startsWith('#')) continue
    const [, key, value] = match
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

loadEnv(path.join(projectRoot, '.devin', '.env'))
loadEnv(path.join(projectRoot, '.env'))

const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'))
const tag = `v${pkg.version}`
const appId = '9PG7L9JR8K6M'
const repo = 'xfuentes/smart-video-processor'
const tenantId = process.env.AZURE_AD_TENANT_ID
const clientId = process.env.AZURE_AD_GH_CLIENT_ID
const clientSecret = process.env.AZURE_AD_GH_SECRET
const googleApiKey = process.env.GOOGLE_API_KEY
const metadataPath = path.join(projectRoot, 'assets', 'appx', 'metadata.json')

if (!tenantId || !clientId || !clientSecret) {
  console.error('Missing one of AZURE_AD_TENANT_ID, AZURE_AD_GH_CLIENT_ID, AZURE_AD_GH_SECRET')
  process.exit(1)
}
if (!googleApiKey) {
  console.error('Missing GOOGLE_API_KEY')
  process.exit(1)
}

function fetchJson(url, options = {}) {
  return fetch(url, options).then((res) => {
    if (!res.ok) {
      return res.text().then((text) => { throw new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`) })
    }
    return res.json()
  })
}

async function fetchOk(url, options = {}) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 500)}`)
  }
}

async function getStoreToken() {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://manage.devcenter.microsoft.com/.default',
  })
  const res = await fetchJson(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, { method: 'POST', body })
  return res.access_token
}

function runGh(args) {
  execFileSync('gh', [...args, '-R', repo], { stdio: 'inherit' })
}

const targetMap = {
  en: 'en', fr: 'fr', de: 'de', it: 'it', es: 'es', pt: 'pt', nl: 'nl',
  ar: 'ar', cs: 'cs', da: 'da', el: 'el', fi: 'fi', hu: 'hu', id: 'id',
  ja: 'ja', ko: 'ko', nb: 'no', pl: 'pl', ru: 'ru', sv: 'sv', tr: 'tr',
  uk: 'uk', zh: 'zh-CN'
}

async function translate(text, locale) {
  const lang = locale.split('-')[0]
  const target = targetMap[lang] || lang
  const url = new URL('https://translation.googleapis.com/language/translate/v2')
  url.searchParams.set('key', googleApiKey)
  const body = JSON.stringify({ q: text, source: 'en', target, format: 'text' })
  const res = await fetchJson(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
  return res.data.translations[0].translatedText
}

async function main() {
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))

  const notes = [
    'Added a cleanup progress dialog that shows the deletion progress of temporary files when closing the application.',
    "Fixed escaped newlines in the What's New list for version 1.8.5 so each item renders as a separate bullet."
  ].join('\n\n- ')
  const notesPrefix = '- ' + notes

  console.log('Translating release notes...')
  for (const locale of Object.keys(metadata.listings)) {
    if (locale.toLowerCase().startsWith('en')) {
      metadata.listings[locale].baseListing.releaseNotes = notesPrefix
    } else {
      const translated = await translate(notesPrefix, locale)
      metadata.listings[locale].baseListing.releaseNotes = translated
    }
    console.log(`  ${locale} done`)
  }

  console.log('Getting Azure AD token...')
  const token = await getStoreToken()
  const authHeaders = { Authorization: `Bearer ${token}` }
  const jsonHeaders = { ...authHeaders, 'Content-Type': 'application/json; charset=utf-8' }

  console.log('Fetching current Store submission...')
  const app = await fetchJson(`https://manage.devcenter.microsoft.com/v1.0/my/applications/${appId}`, { headers: authHeaders })
  const submissionId = app.pendingApplicationSubmission?.id
  if (!submissionId) {
    throw new Error('No pending submission found.')
  }

  const submission = await fetchJson(`https://manage.devcenter.microsoft.com/v1.0/my/applications/${appId}/submissions/${submissionId}`, { headers: authHeaders })

  submission.listings = metadata.listings

  const payload = JSON.stringify(submission, null, 2)
  const payloadBytes = new TextEncoder().encode(payload)

  console.log('Putting updated listings...')
  await fetchOk(`https://manage.devcenter.microsoft.com/v1.0/my/applications/${appId}/submissions/${submissionId}`, {
    method: 'PUT',
    headers: jsonHeaders,
    body: payloadBytes,
  })

  console.log('Committing submission for certification...')
  await fetchOk(`https://manage.devcenter.microsoft.com/v1.0/my/applications/${appId}/submissions/${submissionId}/commit`, {
    method: 'POST',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: '',
  })

  console.log(`Submission ${submissionId} committed for certification.`)

  console.log('Removing .appx assets from GitHub release...')
  for (const name of ['smart-video-processor-x64.appx', 'smart-video-processor-arm64.appx']) {
    runGh(['release', 'delete-asset', tag, name, '--yes'])
  }

  console.log('Publishing GitHub release...')
  runGh(['release', 'edit', tag, '--draft=false'])

  console.log('Done.')
}

try {
  main()
} catch (err) {
  console.error(err.message || err)
  process.exit(1)
}

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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

const appId = '9PG7L9JR8K6M'
const tenantId = process.env.AZURE_AD_TENANT_ID
const clientId = process.env.AZURE_AD_GH_CLIENT_ID
const clientSecret = process.env.AZURE_AD_GH_SECRET

if (!tenantId || !clientId || !clientSecret) {
  console.error('Missing one of AZURE_AD_TENANT_ID, AZURE_AD_GH_CLIENT_ID, AZURE_AD_GH_SECRET')
  process.exit(1)
}

async function getToken() {
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://manage.devcenter.microsoft.com/.default',
  })
  const res = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, { method: 'POST', body })
  const data = await res.json()
  if (!res.ok) throw new Error(`Token error: ${JSON.stringify(data)}`)
  return data.access_token
}

async function main() {
  const token = await getToken()
  const headers = { Authorization: `Bearer ${token}` }

  const appRes = await fetch(`https://manage.devcenter.microsoft.com/v1.0/my/applications/${appId}`, { headers })
  const app = await appRes.json()
  const submissionId = app.pendingApplicationSubmission?.id
  console.log('Pending submission:', submissionId)
  if (!submissionId) return

  const subRes = await fetch(`https://manage.devcenter.microsoft.com/v1.0/my/applications/${appId}/submissions/${submissionId}`, { headers })
  const submission = await subRes.json()

  console.log('Application packages:')
  for (const pkg of submission.applicationPackages || []) {
    console.log(JSON.stringify({
      id: pkg.id,
      fileName: pkg.fileName,
      fileStatus: pkg.fileStatus,
      version: pkg.version,
      architecture: pkg.architecture,
      languages: pkg.languages,
    }))
  }

  console.log('Listing locales:', Object.keys(submission.listings || {}).join(', '))
}

main().catch((err) => { console.error(err); process.exit(1) })

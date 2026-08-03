import { join } from 'path'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const UWP_ACTIVATION_FILE = 'uwp_activation.node'

function getModulePath(): string | undefined {
  if (process.platform !== 'win32') return undefined
  if (!process.windowsStore) return undefined

  const candidates = [
    join(__dirname, '../../../native/uwp-activation/build/Release', UWP_ACTIVATION_FILE),
    join(process.resourcesPath, 'native/uwp-activation/build/Release', UWP_ACTIVATION_FILE)
  ]

  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate
  }

  return undefined
}

export function getUwpActivationFiles(): string[] {
  const modulePath = getModulePath()
  if (!modulePath) return []

  try {
    const addon = require(modulePath) as { getUwpActivationFiles: () => string[] }
    return addon.getUwpActivationFiles() || []
  } catch {
    return []
  }
}

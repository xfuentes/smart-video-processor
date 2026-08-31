/*
 * Smart Video Processor
 * Copyright (c) 2025. Xavier Fuentes <xfuentes-dev@serviam.cc>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import * as fs from 'node:fs'
import * as Path from 'node:path'
import { fileURLToPath } from 'node:url'
import { currentSettings } from './domain/Settings'
import { app } from 'electron'
import i18next from 'i18next'
import ICU from 'i18next-icu'

const __dirname = Path.dirname(fileURLToPath(import.meta.url))

const i18n = i18next.createInstance()
await i18n.use(ICU).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['translation'],
  defaultNS: 'translation',
  keySeparator: false,
  nsSeparator: false,
  saveMissing: false,
  interpolation: { escapeValue: false }
})

let cacheLanguage: string | undefined
let cacheTranslations: Record<string, string> | undefined

function getLocaleBasePath(): string {
  if (app) {
    return Path.join(app.getAppPath(), 'locales')
  }
  return Path.join(__dirname, '..', '..', 'locales')
}

function loadTranslations(): Record<string, string> | undefined {
  const lang = (currentSettings.language ?? 'en').split('-')[0]
  if (lang === cacheLanguage && cacheTranslations !== undefined) {
    return cacheTranslations
  }
  const filePath = Path.join(getLocaleBasePath(), `${lang}.json`)
  if (!fs.existsSync(filePath)) {
    return undefined
  }
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Record<string, string>
    i18n.addResourceBundle(lang, 'translation', data, true, true)
    cacheTranslations = data
    cacheLanguage = lang
    return cacheTranslations
  } catch {
    return undefined
  }
}

export function _(key: string, options?: { defaultValue?: string } & Record<string, unknown>): string {
  const lang = (currentSettings.language ?? 'en').split('-')[0]
  loadTranslations()
  let value = i18n.t(key, { ...options, lng: lang, defaultValue: options?.defaultValue }) as string
  if (options !== undefined) {
    for (const [k, v] of Object.entries(options)) {
      if (k === 'defaultValue') continue
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }
  return value
}

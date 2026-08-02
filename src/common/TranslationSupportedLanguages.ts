/*
 * Smart Video Processor
 * Copyright (c) 2026. Xavier Fuentes <xfuentes-dev@hotmail.com>
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

import { Languages } from './LanguageIETF'
import { tmdbLanguages } from './TMDBLanguages'
import { tvdbLanguages } from './TVDBLanguages'

const tmdbIETF = new Set(
  tmdbLanguages
    .map((l) => Languages.getLanguageByCode(l.iso_639_1)?.code)
    .filter((code): code is string => code !== undefined)
)

const tvdbIETF = new Set(
  tvdbLanguages.map((l) => Languages.getLanguageByCode(l.id)?.code).filter((code): code is string => code !== undefined)
)

export const tmdbSupportedLanguageCodes = Languages.getList()
  .filter((l) => tmdbIETF.has(l.code))
  .map((l) => l.code)

export const tvdbSupportedLanguageCodes = Languages.getList()
  .filter((l) => tvdbIETF.has(l.code))
  .map((l) => l.code)

const tier1LanguageCodes = new Set(['ar', 'de', 'en', 'es', 'fr', 'it', 'ja', 'ko', 'nl', 'pt', 'ru', 'zh'])

const tier2LanguageCodes = new Set([
  'ca',
  'cs',
  'da',
  'el',
  'fi',
  'he',
  'hi',
  'hu',
  'id',
  'no',
  'pl',
  'sv',
  'th',
  'tr',
  'uk',
  'vi'
])

export const translationSupportedLanguageCodes = Languages.getList()
  .filter(
    (l) =>
      tmdbIETF.has(l.code) && tvdbIETF.has(l.code) && (tier1LanguageCodes.has(l.code) || tier2LanguageCodes.has(l.code))
  )
  .map((l) => l.code)

export function getTranslationSupportedLanguageCodes(): string[] {
  return translationSupportedLanguageCodes
}

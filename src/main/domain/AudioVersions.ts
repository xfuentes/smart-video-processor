/*
 * Smart Video Processor
 * Copyright (c) 2025. Xavier Fuentes <xfuentes-dev@hotmail.com>
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

export interface AudioVersion {
  key: string
  pattern?: RegExp
  ietf?: string
  alpha2?: string
}

const audioVersions: AudioVersion[] = [
  { key: 'AD', pattern: /\bAD\b/i },
  { key: 'VO', pattern: /\bVO/i },
  { key: 'VFF', pattern: /(\bVFF\b|\bTRUEFRENCH\b)/i, ietf: 'fr-FR', alpha2: 'fr' },
  { key: 'VFI', pattern: /\bVFI\b/i, ietf: 'fr', alpha2: 'fr' },
  { key: 'VFQ', pattern: /\bVFQ\b/i, ietf: 'fr-CA', alpha2: 'fr' }
]

export class AudioVersions {
  static extractVersions(line: string) {
    const versions: AudioVersion[] = []
    audioVersions.forEach((version) => {
      const pattern = version.pattern
      if (pattern && pattern.exec(line) !== null) {
        versions.push(version)
      }
    })
    return versions
  }

  static extractVersionsIncluding(line: string, including: string[]) {
    const versions: AudioVersion[] = []
    audioVersions.forEach((version) => {
      const pattern = version.pattern
      if (including.indexOf(version.key) >= 0 || (pattern && pattern.exec(line) !== null)) {
        versions.push(version)
      }
    })
    return versions
  }

  static alpha3ToAudioVersion(trackLanguage: string, possibleAudioVersions: AudioVersion[]) {
    let version = 'V' + trackLanguage[0].toUpperCase()
    for (const v of possibleAudioVersions) {
      if (v.key.startsWith(version)) {
        version = v.key
        break
      }
    }
    return version
  }

  static findByLanguageIETF(languageIETF: string | undefined) {
    return audioVersions.find((v) => v.ietf === languageIETF)
  }
}

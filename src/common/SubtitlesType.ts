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

import { Languages } from './LanguageIETF'

export enum SubtitlesType {
  FORCED = 'Forced',
  FULL = 'Full',
  SDH = 'Full SDH',
  COMMENTARIES = 'Commentaries'
}

export interface SubtitlesTypeMatcher {
  key: SubtitlesType
  pattern: RegExp
}

const subtitlesTypeMatchers: SubtitlesTypeMatcher[] = [
  { key: SubtitlesType.FORCED, pattern: /FORC/i },
  { key: SubtitlesType.SDH, pattern: /(SDH|CC|malentend|sourd)/i },
  { key: SubtitlesType.COMMENTARIES, pattern: /Comm/i },
  { key: SubtitlesType.FULL, pattern: /(FULL|Comp)/i }
]

export class SubtitlesTypeUtil {
  static extract(line: string): SubtitlesType | undefined {
    let subType: SubtitlesType | undefined = undefined
    if (line) {
      const types: SubtitlesType[] = []
      subtitlesTypeMatchers.forEach((m) => {
        let pattern = m.pattern
        if (!pattern) {
          pattern = new RegExp(`${m.key}`, 'i')
        }

        if (pattern.exec(line) !== null) {
          types.push(m.key)
        }
      })
      if (types.length === 0) {
        const matchedLang = Languages.findLanguageFromDescription(line)
        if (matchedLang) {
          subType = SubtitlesType.FULL
        }
      } else {
        subType = types[0]
      }
    }

    return subType
  }
}

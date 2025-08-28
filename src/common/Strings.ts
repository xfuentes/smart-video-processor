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

import { VideoFormats } from './@types/Strings'

export class Strings {
  static humanBitrate(
    value: number | undefined,
    binary: boolean = false,
    isBytes: boolean = false,
    isRate: boolean = true
  ) {
    if (value === undefined) {
      return ''
    }
    const thresh = binary ? 1024 : 1000
    if (Math.abs(value) < thresh) {
      return `${value} ${isBytes ? 'B' : 'b'}${isRate ? '/s' : ''}`
    }
    const units = ['k', 'M', 'G', 'T']
    let u = -1
    do {
      value /= thresh
      ++u
    } while (Math.abs(value) >= thresh && u < units.length - 1)
    return (
      value.toFixed(1) +
      ' ' +
      units[u] +
      (binary ? 'i' : '') +
      (isBytes ? 'B' : 'b') +
      (isRate ? '/s' : '')
    )
  }

  static humanFileSize(value: number, binary: boolean = false) {
    return this.humanBitrate(value, binary, true, false)
  }

  static humanDuration(durationSeconds: number) {
    if (isNaN(durationSeconds)) {
      return ''
    }
    let hours: string | number = Math.floor(durationSeconds / 3600)
    let minutes: string | number = Math.floor((durationSeconds - hours * 3600) / 60)
    let seconds: string | number = Math.floor(durationSeconds - hours * 3600 - minutes * 60)

    if (hours < 10) {
      hours = '0' + hours
    }
    if (minutes < 10) {
      minutes = '0' + minutes
    }
    if (seconds < 10) {
      seconds = '0' + seconds
    }
    return hours + ':' + minutes + ':' + seconds
  }

  static humanDurationToSeconds(duration: string) {
    const split = duration.split(':')
    if (split.length !== 3) {
      return -1
    }
    return parseInt(split[0], 10) * 3600 + parseInt(split[1], 10) * 60 + parseInt(split[2], 10)
  }

  static pixelsToVideoFormat(pixels: string): VideoFormats {
    const pixelsArr = pixels.split('x')
    const width = Number.parseInt(pixelsArr[0], 10)
    const height = Number.parseInt(pixelsArr[1], 10)

    const possibleResolutions = [
      { id: 0, width: 720, height: 480, format: VideoFormats.SD },
      { id: 1, width: 1280, height: 720, format: VideoFormats.HD_720p },
      { id: 2, width: 1920, height: 1080, format: VideoFormats.HD_1080p },
      { id: 3, width: 2560, height: 1440, format: VideoFormats.HD_1440p },
      { id: 4, width: 3840, height: 2160, format: VideoFormats.UHD_4K },
      { id: 5, width: 7680, height: 4320, format: VideoFormats.UHD_8K }
    ]

    let widthShorterDistance: number | undefined = undefined
    let widthFormat = VideoFormats.SD
    let widthId: number = -1
    for (const posRes of possibleResolutions) {
      const distance = Math.abs(width - posRes.width)
      if (widthShorterDistance === undefined || distance < widthShorterDistance) {
        widthShorterDistance = distance
        widthFormat = posRes.format
        widthId = posRes.id
      }
    }
    let heightShorterDistance: number | undefined = undefined
    let heightFormat = VideoFormats.SD
    let heightId: number = -1
    for (const posRes of possibleResolutions) {
      const distance = Math.abs(height - posRes.height)
      if (heightShorterDistance === undefined || distance < heightShorterDistance) {
        heightShorterDistance = distance
        heightFormat = posRes.format
        heightId = posRes.id
      }
    }
    return heightId > widthId ? heightFormat : widthFormat
  }

  static pixelsToQuality(pixels: string): {
    index: number
    shortName: string
    longName: string
    badge: 'bronze' | 'silver' | 'gold'
  } {
    const format = this.pixelsToVideoFormat(pixels)
    let index: number
    let shortName: string
    let longName: string
    let badge: 'bronze' | 'silver' | 'gold'
    switch (format) {
      case VideoFormats.HD_720p:
        index = 1
        shortName = 'HD'
        longName = '720p'
        badge = 'bronze'
        break
      case VideoFormats.HD_1080p:
        index = 2
        shortName = 'FHD'
        longName = '1080p'
        badge = 'silver'
        break
      case VideoFormats.HD_1440p:
        index = 3
        shortName = 'QHD'
        longName = '1440p'
        badge = 'silver'
        break
      case VideoFormats.UHD_4K:
        index = 4
        shortName = '4K'
        longName = '2160p'
        badge = 'gold'
        break
      case VideoFormats.UHD_8K:
        index = 5
        shortName = '8K'
        longName = '4320p'
        badge = 'gold'
        break
      case VideoFormats.SD:
      default:
        index = 0
        shortName = 'SD'
        longName = '480p'
        badge = 'bronze'
    }
    return { index, shortName, longName, badge }
  }

  static humanFrequencies(hertz: number) {
    if (!hertz) {
      return ''
    }
    const thresh = 1000
    if (Math.abs(hertz) < thresh) {
      return hertz + ' Hz'
    }
    const units = ['kHz', 'MHz', 'GHz', 'THz', 'PHz', 'EHz', 'ZHz', 'YHz']
    let u = -1
    do {
      hertz /= thresh
      ++u
    } while (Math.abs(hertz) >= thresh && u < units.length - 1)
    return hertz.toFixed(1) + ' ' + units[u]
  }

  static humanAudioChannels(channels: number) {
    let human = ''
    switch (channels) {
      case 1:
        human = '1.0'
        break
      case 2:
        human = '2.0'
        break
      case 3:
        human = '2.1'
        break
      case 4:
        human = '4.0'
        break
      case 5:
        human = '5.0'
        break
      case 6:
        human = '5.1'
        break
      case 7:
        human = '6.1'
        break
      case 8:
        human = '7.1'
        break
      default:
        console.log(`Unrecognized channel number "${channels}".`)
    }
    return human
  }

  static toShellArgs(source: string | string[]): string | string[] {
    if (typeof source === 'string') {
      if (source.indexOf(' ') >= 0) {
        return `"${source}"`
      } else {
        return source
      }
    } else {
      const res: string[] = []
      for (const arg of source) {
        res.push(this.toShellArgs(arg) as string)
      }
      return res
    }
  }

  static toLeadingZeroNumber(num: number): string {
    return num.toString(10).padStart(2, '0')
  }

  static localeContains(search: string, base: string) {
    for (let i = 0; i < base.length; i++) {
      const chunk = base.substring(i, Math.min(i + search.length, base.length))
      if (chunk.localeCompare(search, undefined, { sensitivity: 'base' }) === 0) {
        return true
      }
    }
    return false
  }

  static extractWords(needle: string): string[] {
    let things = needle.replace(/[^\p{L}\p{N}]+/gu, ' ')
    things = things.replace(/\p{Zs}+/u, ' ').trim()
    things = things.normalize('NFD').replace(/\p{Diacritic}/gu, '') // Remove all accents
    return things.split(' ')
  }

  static localeIncludes(haystack: string[], needle: string) {
    for (const hay of haystack) {
      if (hay.localeCompare(needle) === 0) {
        return true
      }
    }
    return false
  }

  static getWordsFromNeedleAndHaystack(
    haystack: string,
    needle: string,
    ignoreCase: boolean = false
  ) {
    needle = needle.replace("'", '')
    haystack = haystack.replace("'", '')
    const needleWords = this.extractWords(ignoreCase ? needle.toLocaleLowerCase() : needle)
    const haystackWords = this.extractWords(ignoreCase ? haystack.toLocaleLowerCase() : haystack)
    return { needleWords, haystackWords }
  }

  static getMatchScoreByKeywords(
    haystack: string,
    needle: string,
    ignoreCase: boolean = false
  ): number {
    let matching = 0
    let unMatching = 0

    if (haystack.toLocaleLowerCase() === needle.toLocaleLowerCase()) {
      // Perfect match
      return 100
    }

    const { needleWords, haystackWords } = this.getWordsFromNeedleAndHaystack(
      haystack,
      needle,
      ignoreCase
    )

    if (needleWords.length === 0) {
      return -10
    } else {
      for (const needleWord of needleWords) {
        if (this.localeIncludes(haystackWords, needleWord)) {
          matching++
        } else {
          unMatching++
        }
      }
    }

    for (const haystackWord of haystackWords) {
      if (this.localeIncludes(needleWords, haystackWord)) {
        matching++
      } else {
        unMatching++
      }
    }

    return unMatching <= 1 ? matching / (unMatching === 0 ? 0.5 : unMatching) : -10
  }
}

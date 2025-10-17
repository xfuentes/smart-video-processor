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

import { Video } from '../main/domain/Video'
import { TrackType } from '../common/@types/Track'
import { Strings } from '../common/Strings'
import * as chalk from 'chalk'
import { confirm } from '@inquirer/prompts'

const trackTypeEncodingSection = async (video: Video, type: TrackType, auto: boolean = false) => {
  const selectedTrackIds = video.getSelectedTracks().map((t) => t.id)
  const filteredTracks = video.tracks.filter((t) => t.type === type).filter((s) => selectedTrackIds.includes(s.id))
  if (filteredTracks.length > 0) {
    for (const track of filteredTracks) {
      const key = track.type + ' ' + track.id
      const es = video.encoderSettings.find((s) => s.trackId === track.id)
      let infoLabel = undefined
      let disabled = false
      if (track.unsupported) {
        infoLabel = 'Conversion to a supported audio format is mandatory.'
        disabled = true
      } else if (es && es.targetSize) {
        const items: string[] = []
        if (es.codec) {
          items.push(`Codec: ${es.codec}`)
        }
        if (es.compressionPercent) {
          items.push(`Compression: ${es.compressionPercent}%`)
        }
        if (es.originalSize) {
          items.push(`Original: ${Strings.humanFileSize(es.originalSize, false)}`)
        }
        if (es.targetSize) {
          items.push(`Target: ${Strings.humanFileSize(es.targetSize, false)}`)
        }
        infoLabel = items.join(', ')
      }
      if (infoLabel !== undefined) {
        console.log(chalk.blueBright(key + ':') + ' ' + chalk.italic(infoLabel))
      }
      if (disabled) {
        console.log('Encoding is mandatory.')
      } else {
        if (auto) {
          console.log(
            `${chalk.greenBright('✔  ')}${chalk.whiteBright(`Encode ${key}?`)} ${chalk.blueBright(video.isTrackEncodingEnabled(key) ? 'Yes' : 'No')}`
          )
        } else {
          video.setTrackEncodingEnabled(
            key,
            await confirm({
              message: ` Encode ${key}?`,
              default: video.isTrackEncodingEnabled(key)
            })
          )
        }
      }
    }
  }
}

export const requestEncodingSelection = async (video: Video, auto: boolean = false) => {
  console.log(chalk.blueBright('Track Encoding'))
  await trackTypeEncodingSection(video, TrackType.VIDEO, auto)
  await trackTypeEncodingSection(video, TrackType.AUDIO, auto)
  console.log()
}

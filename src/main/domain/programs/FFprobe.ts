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

import { Processes } from '../../util/processes'
import { Track } from '../Track'
import { Numbers } from '../../util/numbers'
import { Attachment } from '../Change'
import { CommandProgress } from './CommandProgress'

export interface Container {
  type: string
  title?: string
  attachments?: Attachment[]
  tagCount: number
  durationSeconds: number
}

export class FFprobe extends CommandProgress {
  private static instance: FFprobe

  private constructor() {
    super(Processes.findCommandSync('ffprobe', 'c:\\Program Files\\ffmpeg\\bin\\ffprobe.exe'), [0])
  }

  public static getInstance(): FFprobe {
    if (!FFprobe.instance) {
      FFprobe.instance = new FFprobe()
    }
    return FFprobe.instance
  }

  public async completeFileInformation(
    path: string,
    tracks: Track[],
    container: Container
  ): Promise<void> {
    const ffprobeOutput = await Processes.spawnReadStdout(this.command, [
      '-v',
      'quiet',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      path
    ])
    const probeInfo = JSON.parse(ffprobeOutput) as FFProbeResult
    if (probeInfo?.streams === undefined) {
      tracks.length = 0
      return
    }
    const durationSeconds = probeInfo?.format?.duration
      ? parseFloat(probeInfo.format.duration)
      : undefined
    probeInfo?.streams?.forEach((stream) => {
      const track = tracks.find((t) => t.id === stream.index)
      if (track) {
        if ((track.unsupported || !track.codec) && stream.codec_long_name) {
          track.codec = stream.codec_long_name
        }
        if (
          track.properties.videoDimensions === undefined &&
          stream.width !== undefined &&
          stream.height !== undefined
        ) {
          track.properties.videoDimensions = stream.width + 'x' + stream.height
        }
        if (track.properties.audioChannels === undefined && stream.channels !== undefined) {
          track.properties.audioChannels = stream.channels
        }
        if (
          track.properties.audioSamplingFrequency === undefined &&
          stream.sample_rate !== undefined
        ) {
          track.properties.audioSamplingFrequency = parseInt(stream.sample_rate)
        }
        if (track.properties.frames === undefined && stream.nb_frames !== undefined) {
          track.properties.frames = parseInt(stream.nb_frames)
        }
        if (track.properties.bitRate === undefined && stream.bit_rate !== undefined) {
          track.properties.bitRate = parseInt(stream.bit_rate)
        }
        if (stream.tags) {
          if (
            track.properties.frames === undefined &&
            stream.tags['NUMBER_OF_FRAMES-eng'] !== undefined
          ) {
            track.properties.frames = parseInt(stream.tags['NUMBER_OF_FRAMES-eng'])
          }
          if (track.properties.bitRate === undefined && stream.tags['BPS-eng'] !== undefined) {
            track.properties.bitRate = parseInt(stream.tags['BPS-eng'])
          }
          if (track.size === undefined && stream.tags['NUMBER_OF_BYTES-eng'] !== undefined) {
            track.size = parseInt(stream.tags['NUMBER_OF_BYTES-eng'])
          }
          if (track.duration === undefined && stream.tags['DURATION-eng'] !== undefined) {
            track.duration = Numbers.durationToSeconds(stream.tags['DURATION-eng'])
          }
        }
        if (track.duration === undefined && durationSeconds) {
          track.duration = durationSeconds
        }
        if (!track.size && track.properties.bitRate && durationSeconds) {
          track.size = (track.properties.bitRate / 8) * durationSeconds
        }
        if (track.properties.frames && track.duration) {
          let fps = track.properties.frames / track.duration
          if (fps.toFixed(3) === '23.976') {
            fps = 23.976
          } else {
            fps = Math.round(fps)
          }
          track.properties.fps = fps
        }
      }
    })
    if (container.type === undefined && probeInfo?.format?.format_long_name) {
      container.type = probeInfo.format.format_long_name
    }
    if (container.title === undefined && probeInfo?.format?.tags?.title) {
      container.title = probeInfo.format.tags.title
    }
    if (!container.durationSeconds && durationSeconds !== undefined) {
      container.durationSeconds = durationSeconds
    }
  }
}

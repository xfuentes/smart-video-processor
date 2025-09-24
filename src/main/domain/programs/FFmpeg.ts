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
import { CommandProgress } from './CommandProgress'
import { Track } from '../Track'
import { ChildProcess } from 'node:child_process'
import { currentSettings } from '../Settings'
import { debug } from '../../util/log'
import { EncoderSettings, VideoCodec } from '../../../common/@types/Encoding'
import { TrackType } from '../../../common/@types/Track'
import { ProgressNotifier } from '../../../common/@types/processes'
import { Files } from '../../util/files'

const FIRST_PASS_TIME_PERCENT = 170 / 936
const SECOND_PASS_TIME_PERCENT = 766 / 936

export class FFmpeg extends CommandProgress {
  private static instance: FFmpeg
  private readonly timePattern: RegExp = /out_time_ms\s*=\s*(?<time>\d+)/i
  private readonly speedPattern: RegExp = /speed\s*=\s*(?<speed>[\d.]+)x/i
  private readonly endPattern: RegExp = /progress\s*=\s*end/i

  private constructor() {
    super(currentSettings.ffmpegPath, [0], 255)
  }

  public static getInstance(): FFmpeg {
    if (!FFmpeg.instance) {
      FFmpeg.instance = new FFmpeg()
    }
    return FFmpeg.instance
  }

  public isTwoPassesRequired(settings: EncoderSettings[]): boolean {
    for (const setting of settings) {
      if (setting.trackType === TrackType.VIDEO && setting.bitrate !== undefined) {
        return true
      }
    }
    return false
  }

  public async encodeFile(
    path: string,
    durationSeconds: number,
    tracks: Track[],
    settings: EncoderSettings[],
    progressNotifier?: ProgressNotifier
  ): Promise<string> {
    if (!this.isTwoPassesRequired(settings)) {
      return this.encodeFileInternal(path, durationSeconds, tracks, settings, undefined, undefined, progressNotifier)
    }

    const statFile = Files.makeTempFile('first-pass', true)
    let currentPass = 1

    const progressNotifierAggregator: ProgressNotifier = ({ progress, xSpeed, countdown, process }) => {
      if (progressNotifier !== undefined) {
        // const globalXSpeed = xSpeed !== undefined ? xSpeed / 2 : undefined;
        if (progress === undefined) {
          progressNotifier({ progress: progress, xSpeed, countdown, pass: currentPass, process })
        } else {
          if (currentPass === 1) {
            const totalProgress = progress * FIRST_PASS_TIME_PERCENT
            progressNotifier({
              progress: totalProgress,
              xSpeed,
              countdown,
              pass: currentPass,
              process
            })
          } else {
            const totalProgress = progress * SECOND_PASS_TIME_PERCENT + FIRST_PASS_TIME_PERCENT
            progressNotifier({
              progress: totalProgress,
              xSpeed,
              countdown,
              pass: currentPass,
              process
            })
          }
        }
      }
    }

    const firstPassAt = Date.now()
    await this.encodeFileInternal(
      path,
      durationSeconds,
      tracks,
      settings,
      currentPass,
      statFile,
      progressNotifierAggregator
    )
    const firstPassEnd = Date.now()
    debug('First pass completed in ' + (firstPassEnd - firstPassAt) / 1000 + ' seconds.')
    currentPass++
    const secondPassAt = Date.now()
    const prom = this.encodeFileInternal(
      path,
      durationSeconds,
      tracks,
      settings,
      currentPass,
      statFile,
      progressNotifierAggregator
    )
    await prom.finally(() => {
      const secondPassEnd = Date.now()
      debug('Second pass completed in ' + (secondPassEnd - secondPassAt) / 1000 + ' seconds.')
      Files.cleanupFiles(statFile + '*')
    })
    return prom
  }

  async encodeFileInternal(
    sourcePath: string,
    durationSeconds: number,
    tracks: Track[],
    settings: EncoderSettings[],
    pass?: number,
    statFile?: string,
    progressNotifier?: ProgressNotifier
  ): Promise<string> {
    durationSeconds = currentSettings.isTestEncodingEnabled ? 30 : durationSeconds
    if (progressNotifier) {
      progressNotifier({ progress: undefined, pass })
    }
    const encodedPath = pass === 1 ? undefined : Files.makeTempFile('encoded.mkv')
    const args = this.generateEncodingArguments(sourcePath, encodedPath, tracks, settings, pass, statFile)
    const outputInterpreter = (stdout?: string, stderr?: string, process?: ChildProcess) => {
      const response = encodedPath ?? statFile ?? ''
      let error: string | undefined = undefined
      if (progressNotifier != undefined) {
        if (stdout != undefined) {
          const timeMatches = this.timePattern.exec(stdout)
          const speedMatches = this.speedPattern.exec(stdout)
          const endMatches = this.endPattern.exec(stdout)
          let xSpeed = 0
          if (speedMatches?.groups) {
            xSpeed = Number.parseFloat(speedMatches.groups.speed)
          }

          if (endMatches) {
            progressNotifier({ progress: 1, xSpeed, countdown: 0, process })
          } else if (timeMatches?.groups) {
            const currentTimeSeconds = Number(timeMatches.groups.time) / 1000000
            let progress: number | undefined = 0
            if (!durationSeconds) {
              progress = undefined
              progressNotifier({ progress, xSpeed, process })
            } else if (currentTimeSeconds > 0) {
              progress = currentTimeSeconds / durationSeconds
              const secondsLeft = (1 - progress) * durationSeconds
              const countdown = xSpeed !== undefined && xSpeed != 0 ? secondsLeft / xSpeed : undefined
              progressNotifier({ progress, xSpeed, countdown, process })
            }
          }
        } else if (stderr !== undefined) {
          // get first line;
          const end = stderr.indexOf('\n')
          error = stderr.substring(0, end !== -1 ? end : undefined)
        } else {
          progressNotifier({ process })
        }
      }

      return { response, error }
    }
    // const errorPattern: RegExp = /Error: (?<message>.*)/i;
    try {
      return await super.execute(args, outputInterpreter)
    } catch (error) {
      if ((error as Error).message.indexOf('Too many packets buffered') != -1) {
        const workaroundArgs = this.generateEncodingArguments(
          sourcePath,
          encodedPath,
          tracks,
          settings,
          pass,
          statFile,
          true
        )
        return await super.execute(workaroundArgs, outputInterpreter)
      }
      throw error
    }
  }

  private generateEncodingArguments(
    sourcePath: string,
    encodedPath: string | undefined,
    tracks: Track[],
    settings: EncoderSettings[],
    pass: number | undefined = undefined,
    statFile: string | undefined = undefined,
    maxMuxingQueueSizeWorkaround: boolean = false
  ): string[] {
    const ffOptions: string[] = []

    /**
     * Theses two options (-fflags, +genpts) are needed to work around a bug if no timestamps found in media.
     */
    ffOptions.push('-fflags')
    ffOptions.push('+genpts')

    ffOptions.push('-progress', 'pipe:1') // Show progress in parsable mode
    ffOptions.push('-loglevel', '16') // Only show errors
    ffOptions.push('-i', sourcePath)
    ffOptions.push('-y') // Overwrite output file without asking
    //ffOptions.push("-vf", "scale=1920:1080") // Downscale to 1080p
    ffOptions.push('-c', 'copy') // Just copy by default (no encode)
    ffOptions.push('-map', '0') // Copy all streams by default

    if (currentSettings.isTestEncodingEnabled) {
      ffOptions.push('-ss', '00:30:00', '-t', '30') // Output only a 30 seconds extract to judge quality.
    }

    let videoIndex = 0
    let audioIndex = 0
    for (const track of tracks) {
      const setting = settings.find((s) => s.trackId === track.id)
      if (setting != undefined) {
        if (setting.trackType === TrackType.VIDEO) {
          if (setting.codec === VideoCodec.H265) {
            ffOptions.push('-c:v:' + videoIndex, 'libx265')
            if (pass !== undefined && statFile !== undefined) {
              ffOptions.push('-x265-params', `log-level=error${pass == 1 ? ':no-slow-firstpass=1' : ''}`)
              ffOptions.push('-pass', `${pass}`)
              ffOptions.push('-passlogfile', statFile)
            }
          } else {
            ffOptions.push('-c:v:' + videoIndex, 'libx264')
            if (pass !== undefined && statFile !== undefined) {
              ffOptions.push('-pass', `${pass}`)
              ffOptions.push('-passlogfile', statFile)
            }
            ffOptions.push('-profile:v:' + videoIndex, 'high')
            ffOptions.push('-preset:v:' + videoIndex, 'slow')
          }
          if (setting.bitrate) {
            ffOptions.push('-b:v:' + videoIndex, setting.bitrate / 1000 + 'k')
          }
        } else if (setting.trackType === TrackType.AUDIO && setting.bitrate !== undefined && pass !== 1) {
          ffOptions.push('-c:a:' + audioIndex, 'aac')
          ffOptions.push('-b:a:' + audioIndex, setting.bitrate / 1000 + 'k')
        }
      }
      if (track.type === TrackType.VIDEO) {
        videoIndex++
      }
      if (track.type === TrackType.AUDIO) {
        audioIndex++
      }
    }

    if (maxMuxingQueueSizeWorkaround) {
      ffOptions.push('-max_muxing_queue_size', '9999')
    }
    if (pass !== undefined && pass === 1) {
      if (Processes.isWindowsPlatform()) {
        ffOptions.push('-f', 'null', 'NUL')
      } else {
        ffOptions.push('-f', 'null', '/dev/null')
      }
    } else if (encodedPath) {
      ffOptions.push(encodedPath)
    }
    return ffOptions
  }
}

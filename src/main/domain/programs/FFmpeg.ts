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
import { ChildProcess } from 'node:child_process'
import { currentSettings } from '../Settings'
import { debug } from '../../util/log'
import { EncoderSettings, VideoCodec } from '../../../common/@types/Encoding'
import { ITrack, TrackType } from '../../../common/@types/Track'
import { ProgressNotifier } from '../../../common/@types/processes'
import { Files } from '../../util/files'
import path, * as Path from 'node:path'
import { Strings } from '../../../common/Strings'
import { IVideo } from '../../../common/@types/Video'
import fs from 'node:fs'

const FIRST_PASS_TIME_PERCENT = 170 / 936
const SECOND_PASS_TIME_PERCENT = 766 / 936

export class FFmpeg extends CommandProgress {
  private static instance: FFmpeg
  private readonly timePattern: RegExp = /out_time_ms\s*=\s*(?<time>\d+)/i
  private readonly speedPattern: RegExp = /speed\s*=\s*(?<speed>[\d.]+)x/i
  private readonly endPattern: RegExp = /progress\s*=\s*end/i

  private constructor() {
    super(currentSettings.ffmpegPath, [0], 255, ['-version'], /^ffmpeg\sversion\s(?<version>[\d.]+)/i)
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
    video: IVideo,
    destinationPath: string,
    settings: EncoderSettings[],
    progressNotifier?: ProgressNotifier
  ): Promise<string> {
    fs.mkdirSync(destinationPath, { recursive: true })

    if (!this.isTwoPassesRequired(settings)) {
      return this.encodeFileInternal(video, destinationPath, settings, undefined, undefined, progressNotifier)
    }

    const statFile = Path.join(destinationPath, 'secondPassSettings')
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
    await this.encodeFileInternal(video, destinationPath, settings, currentPass, statFile, progressNotifierAggregator)
    const firstPassEnd = Date.now()
    debug('First pass completed in ' + (firstPassEnd - firstPassAt) / 1000 + ' seconds.')
    currentPass++
    const secondPassAt = Date.now()
    const prom = this.encodeFileInternal(
      video,
      destinationPath,
      settings,
      currentPass,
      statFile,
      progressNotifierAggregator
    )
    await prom.finally(() => {
      const secondPassEnd = Date.now()
      debug('Second pass completed in ' + (secondPassEnd - secondPassAt) / 1000 + ' seconds.')
      // Files.cleanupFiles(statFile + '*')
    })
    return prom
  }

  async encodeFileInternal(
    video: IVideo,
    destinationPath: string,
    settings: EncoderSettings[],
    pass?: number,
    statFile?: string,
    progressNotifier?: ProgressNotifier
  ): Promise<string> {
    if (progressNotifier) {
      progressNotifier({ progress: undefined, pass })
    }
    const encodedPath = pass === 1 ? undefined : path.join(destinationPath, 'encoding-temp.mkv')
    const args = this.generateEncodingArguments(video, encodedPath, settings, pass, statFile)

    const versionOutputInterpreter = this.ffmpegProgressInterpreterBuild(
      encodedPath ?? statFile ?? '',
      video.targetDuration,
      progressNotifier
    )

    // const errorPattern: RegExp = /Error: (?<message>.*)/i;
    try {
      return await super.execute(args, versionOutputInterpreter)
    } catch (error) {
      if ((error as Error).message.indexOf('Too many packets buffered') != -1) {
        const workaroundArgs = this.generateEncodingArguments(video, encodedPath, settings, pass, statFile, true)
        return await super.execute(workaroundArgs, versionOutputInterpreter)
      }
      throw error
    }
  }

  public async generateSnapshots(
    sourcePath: string,
    destinationPath: string,
    snapshotHeight: number,
    snapshotWidth: number,
    totalWidth: number,
    durationSeconds: number,
    progressNotifier?: ProgressNotifier
  ): Promise<string> {
    const filters: string[] = []
    const snapshotRefs: string[] = []
    const ffOptions: string[] = []
    fs.mkdirSync(destinationPath, { recursive: true })
    const snapshotPath = path.join(destinationPath, `snapshots${totalWidth + 'x' + snapshotHeight}.png`)

    let snapshotCount = 0

    ffOptions.push('-progress', 'pipe:1') // Show progress in parsable mode
    ffOptions.push('-loglevel', '16') // Only show errors
    ffOptions.push('-y') // Overwrite output file without asking

    for (let posX = 0; posX < totalWidth; posX += snapshotWidth) {
      const posSeconds = Math.round((posX / totalWidth) * durationSeconds)
      ffOptions.push('-ss', Strings.humanDuration(posSeconds))
      ffOptions.push('-i', sourcePath)
      filters.push(`[${snapshotCount}:v]scale=${snapshotWidth}:${snapshotHeight},trim=duration=1[v${snapshotCount}]`)
      snapshotRefs.push(`[v${snapshotCount}]`)
      snapshotCount++
    }

    filters.push(snapshotRefs.join('') + 'hstack=inputs=' + snapshotCount)
    ffOptions.push('-filter_complex', `${filters.join(';')}`)
    ffOptions.push('-vframes', '1')
    ffOptions.push(snapshotPath)

    const versionOutputInterpreter = this.ffmpegProgressInterpreterBuild(
      snapshotPath,
      durationSeconds,
      progressNotifier
    )

    return await super.execute(ffOptions, versionOutputInterpreter)
  }

  public async generateVideoPreview(
    video: IVideo,
    destinationPath: string,
    durationSeconds: number,
    progressNotifier?: ProgressNotifier
  ): Promise<string> {
    const ffOptions: string[] = []
    fs.mkdirSync(destinationPath, { recursive: true })
    const videoPreviewPath = path.join(destinationPath, 'stream.m3u8')

    ffOptions.push('-progress', 'pipe:1') // Show progress in parsable mode
    ffOptions.push('-loglevel', '16') // Only show errors
    ffOptions.push('-y') // Overwrite output file without asking

    ffOptions.push('-i', video.sourcePath)
    ffOptions.push('-c', 'copy')

    let videoIndex = 0
    let audioIndex = 0
    for (const track of video.tracks) {
      if (audioIndex === 0 && track.type === TrackType.AUDIO && track.codec.indexOf('AAC') !== -1) {
        ffOptions.push('-map', '0:a:' + audioIndex++)
      } else if (videoIndex === 0 && track.type === TrackType.VIDEO) {
        ffOptions.push('-map', '0:v:' + videoIndex++)
      }
    }

    ffOptions.push('-f', 'hls')
    ffOptions.push('-hls_time', '4')
    ffOptions.push('-hls_list_size', '0')
    ffOptions.push('-hls_flags', 'independent_segments')
    ffOptions.push('-hls_playlist_type', 'vod')
    ffOptions.push(videoPreviewPath)

    const ffmpegOutputInterpreter = this.ffmpegProgressInterpreterBuild(
      videoPreviewPath,
      durationSeconds,
      progressNotifier
    )
    return await super.execute(ffOptions, ffmpegOutputInterpreter)
  }

  public async preProcessVideoPart(number: number, video: IVideo, destinationPath: string): Promise<string> {
    const ffOptions: string[] = []
    fs.mkdirSync(destinationPath, { recursive: true })
    const preProcessPath = path.join(destinationPath, `part${number}.mkv`)
    const durationSeconds = (video.endAt ?? video.duration) - (video.startFrom ?? 0)

    ffOptions.push('-progress', 'pipe:1') // Show progress in parsable mode
    ffOptions.push('-loglevel', '16') // Only show errors
    ffOptions.push('-y') // Overwrite output file without asking

    ffOptions.push('-i', video.sourcePath)
    ffOptions.push('-c', 'copy')

    let needProcessing = false
    if (video.startFrom) {
      ffOptions.push('-ss', '' + video.startFrom)
      needProcessing = true
    }
    if (video.endAt && video.endAt < video.duration) {
      ffOptions.push('-t', '' + durationSeconds)
      needProcessing = true
    }
    ffOptions.push(...this.generateKeepAllMapping(video.tracks))
    ffOptions.push(preProcessPath)

    if (needProcessing) {
      const ffmpegOutputInterpreter = this.ffmpegProgressInterpreterBuild(preProcessPath, durationSeconds)
      return await super.execute(ffOptions, ffmpegOutputInterpreter)
    } else {
      return video.sourcePath
    }
  }

  generateKeepAllMapping = (tracks: ITrack[]) => {
    const ffOptions: string[] = []
    let videoIndex = 0
    let audioIndex = 0
    let subtitlesIndex = 0
    for (const track of tracks) {
      if (track.type === TrackType.AUDIO) {
        ffOptions.push('-map', '0:a:' + audioIndex++)
      } else if (track.type === TrackType.VIDEO) {
        ffOptions.push('-map', '0:v:' + videoIndex++)
      } else if (track.type === TrackType.SUBTITLES) {
        ffOptions.push('-map', '0:s:' + subtitlesIndex++)
      }
    }
    return ffOptions
  }

  public async preProcessVideo(video: IVideo, destinationPath: string): Promise<string> {
    const ffOptions: string[] = []

    const videoPath = await this.preProcessVideoPart(0, video, destinationPath)

    if (video.videoParts.length === 0) {
      return videoPath
    } else {
      const splitPaths: string[] = []
      splitPaths.push(videoPath)
      let num = 1
      for (const part of video.videoParts) {
        const partPath = await this.preProcessVideoPart(num++, part, destinationPath)
        splitPaths.push(partPath)
      }

      const concatFilePath = Files.writeFileSync(
        destinationPath,
        'concat.txt',
        splitPaths.map((p) => `file '${p}'`).join('\n'),
        'utf8'
      )

      ffOptions.push('-progress', 'pipe:1') // Show progress in parsable mode
      ffOptions.push('-loglevel', '16') // Only show errors
      ffOptions.push('-y') // Overwrite output file without asking

      ffOptions.push('-f', 'concat')
      ffOptions.push('-safe', '0')
      ffOptions.push('-i', concatFilePath)
      ffOptions.push('-c', 'copy')

      ffOptions.push(...this.generateKeepAllMapping(video.tracks))

      const preProcessPath = path.join(destinationPath, `final-concat.mkv`)
      ffOptions.push(preProcessPath)

      const ffmpegOutputInterpreter = this.ffmpegProgressInterpreterBuild(preProcessPath, video.targetDuration)
      await super.execute(ffOptions, ffmpegOutputInterpreter)
      return preProcessPath
    }
  }

  private ffmpegProgressInterpreterBuild(
    outputFilePath: string,
    durationSeconds: number,
    progressNotifier?: ProgressNotifier
  ) {
    return (stdout?: string, stderr?: string, process?: ChildProcess) => {
      const response = outputFilePath
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
  }

  private generateEncodingArguments(
    video: IVideo,
    encodedPath: string | undefined,
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
    // TODO: ffOptions.push('-i', sourcePath)
    ffOptions.push('-y') // Overwrite output file without asking

    if (video.preProcessPath) {
      ffOptions.push('-i', video.preProcessPath)
    } else {
      ffOptions.push('-i', video.sourcePath)
    }
    //ffOptions.push("-vf", "scale=1920:1080") // Downscale to 1080p
    ffOptions.push('-c', 'copy') // Just copy by default (no encode)
    ffOptions.push(...this.generateKeepAllMapping(video.tracks))

    let videoIndex = 0
    let audioIndex = 0
    for (const track of video.tracks) {
      const setting = settings.find((s) => s.trackId === track.id)
      if (setting != undefined) {
        if (setting.trackType === TrackType.VIDEO) {
          if (setting.codec === VideoCodec.H265) {
            ffOptions.push('-c:v:' + videoIndex, 'libx265')
            if (pass !== undefined && statFile !== undefined) {
              const statFileEscaped = statFile.replaceAll('\\', '/').replaceAll(':', '\\:')
              ffOptions.push(
                '-x265-params',
                `log-level=error:pass=${pass}:stats=${statFileEscaped}${pass == 1 ? ':no-slow-firstpass=1' : ''}`
              )
            }
          } else {
            ffOptions.push('-c:v:' + videoIndex, 'libx264')
            // Force 8 bit to workaround issue with 10 bit depth
            ffOptions.push('-pix_fmt', 'yuv420p')
            ffOptions.push('-profile:v:' + videoIndex, 'high')
            ffOptions.push('-preset:v:' + videoIndex, 'slow')
            if (pass !== undefined && statFile !== undefined) {
              ffOptions.push('-pass', `${pass}`)
              ffOptions.push('-passlogfile', statFile)
            }
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

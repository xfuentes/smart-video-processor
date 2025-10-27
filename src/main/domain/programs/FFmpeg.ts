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
import { TrackType } from '../../../common/@types/Track'
import { ProgressNotifier } from '../../../common/@types/processes'
import { Files } from '../../util/files'
import path from 'node:path'
import { Strings } from '../../../common/Strings'
import { IVideo } from '../../../common/@types/Video'

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
    if (!this.isTwoPassesRequired(settings)) {
      return this.encodeFileInternal(video, destinationPath, settings, undefined, undefined, progressNotifier)
    }

    const statFile = Files.makeTempFile('2pass', true)
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
      Files.cleanupFiles(statFile + '*')
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
    const encodedPath =
      pass === 1 ? undefined : path.join(destinationPath, path.basename(Files.makeTempFile('encoding-temp.mkv', true)))
    const args = this.generateEncodingArguments(video, encodedPath, settings, pass, statFile)

    const versionOutputInterpreter = this.ffmpegProgressInterpreterBuild(
      encodedPath ?? statFile ?? '',
      video.duration,
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
    const snapshotPath = path.join(destinationPath, path.basename(Files.makeTempFile('snapshots.png', true)))

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
    sourcePath: string,
    destinationPath: string,
    durationSeconds: number,
    progressNotifier?: ProgressNotifier
  ): Promise<string> {
    const ffOptions: string[] = []
    const videoPreviewPath = path.join(destinationPath, 'stream.m3u8')

    ffOptions.push('-progress', 'pipe:1') // Show progress in parsable mode
    ffOptions.push('-loglevel', '16') // Only show errors
    ffOptions.push('-y') // Overwrite output file without asking

    ffOptions.push('-i', sourcePath)
    ffOptions.push('-c:v', 'copy')
    ffOptions.push('-c:a', 'copy')
    // ffOptions.push('-c:s', 'webvtt')
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

  generateProcessingArguments(video: IVideo, pass: number | undefined) {
    const ffOptions: string[] = []
    const complexFilter: string[] = []
    const finalToMap: string[] = []
    const toMap: string[][] = []
    const typeIndex: Map<TrackType, number>[] = []
    let needConcat = false
    let nbInputs: number = 0

    if (video.startFrom === undefined && video.endAt === undefined && video.videoParts.length === 0) {
      return undefined
    }

    for (const part of video.videoParts) {
      ffOptions.push('-i', part.sourcePath)
    }

    for (const track of video.tracks) {
      if (pass === 1) {
        if (track.type !== TrackType.VIDEO) {
          continue
        }
      }
      if (typeIndex.length <= 0) {
        typeIndex[0] = new Map()
      }
      if (!typeIndex[0].has(track.type)) {
        typeIndex[0].set(track.type, typeIndex[0].get(track.type) ?? 0)
      } else {
        typeIndex[0].set(track.type, (typeIndex[0].get(track.type) ?? 0) + 1)
      }
      const { name, filter } = this.generateTrimFilter(
        0,
        track.type,
        typeIndex[0].get(track.type) ?? 0,
        video.startFrom,
        video.endAt
      )
      complexFilter.push(filter)
      if (toMap[0] === undefined) {
        toMap[0] = []
      }
      toMap[0].push(name)
      let partCount = 0
      for (const part of video.videoParts) {
        partCount++
        needConcat = true
        const nbOfType = part.tracks.filter((pt) => pt.type === track.type).length
        const matchingPartTrack = part.tracks.find(
          (pt) => pt.type === track.type && (nbOfType === 1 || pt.language === track.language)
        )
        if (matchingPartTrack === undefined) {
          throw new Error(
            `Part ${partCount} has no track matching ${track.type.toLowerCase()} track ${track.id} from main video.`
          )
        } else {
          if (typeIndex.length <= partCount) {
            typeIndex[partCount] = new Map()
          }
          if (!typeIndex[partCount].has(matchingPartTrack.type)) {
            typeIndex[partCount].set(matchingPartTrack.type, typeIndex[partCount].get(matchingPartTrack.type) ?? 0)
          } else {
            typeIndex[partCount].set(
              matchingPartTrack.type,
              (typeIndex[partCount].get(matchingPartTrack.type) ?? 0) + 1
            )
          }

          const { name, filter } = this.generateTrimFilter(
            partCount,
            matchingPartTrack.type,
            typeIndex[partCount].get(matchingPartTrack.type) ?? 0,
            part.startFrom,
            part.endAt
          )
          complexFilter.push(filter)
          if (toMap[partCount] === undefined) {
            toMap[partCount] = []
          }
          toMap[partCount].push(name)
        }
      }
      nbInputs = partCount + 1
    }
    if (needConcat) {
      const outTypeIndex: Map<TrackType, number> = new Map()
      let mapping = ''
      for (const map of toMap) {
        mapping += map.map((s) => `[${s}]`).join('')
      }
      let concat = `concat=n=${nbInputs}`
      const names: string[] = []
      if (typeIndex[0].has(TrackType.VIDEO)) {
        if (!outTypeIndex.has(TrackType.VIDEO)) {
          outTypeIndex.set(TrackType.VIDEO, 0)
        } else {
          outTypeIndex.set(TrackType.VIDEO, (outTypeIndex.get(TrackType.VIDEO) ?? 0) + 1)
        }
        concat += `:v=${(typeIndex[0].get(TrackType.VIDEO) ?? 0) + 1}`
        for (let i = 0; i <= (typeIndex[0].get(TrackType.VIDEO) ?? 0); i++) {
          names.push(`[outv_${i}]`)
        }
      }
      if (typeIndex[0].has(TrackType.AUDIO)) {
        if (!outTypeIndex.has(TrackType.AUDIO)) {
          outTypeIndex.set(TrackType.AUDIO, 0)
        } else {
          outTypeIndex.set(TrackType.AUDIO, (outTypeIndex.get(TrackType.AUDIO) ?? 0) + 1)
        }
        concat += `:a=${(typeIndex[0].get(TrackType.AUDIO) ?? 0) + 1}`
        for (let i = 0; i <= (typeIndex[0].get(TrackType.AUDIO) ?? 0); i++) {
          names.push(`[outa_${i}]`)
        }
      }
      if (typeIndex[0].has(TrackType.SUBTITLES)) {
        concat += `:s=${(typeIndex[0].get(TrackType.SUBTITLES) ?? 0) + 1}`
        for (let i = 0; i <= (typeIndex[0].get(TrackType.SUBTITLES) ?? 0); i++) {
          names.push(`[outs_${i}]`)
        }
      }
      finalToMap.push(...names)
      complexFilter.push(mapping + concat + finalToMap.join(''))
    } else {
      finalToMap.push(...toMap[0])
    }

    ffOptions.push('-filter_complex', complexFilter.join(';'))
    finalToMap.forEach((name) => ffOptions.push('-map', `[${name}]`))
    return ffOptions
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
    const videoTrackCount = video.tracks.filter((t) => t.type === TrackType.VIDEO).length
    const hasAudioTrack = video.tracks.find((t) => t.type === TrackType.AUDIO)
    const hasSubtitlesTrack = video.tracks.find((t) => t.type === TrackType.SUBTITLES)

    /**
     * Theses two options (-fflags, +genpts) are needed to work around a bug if no timestamps found in media.
     */
    ffOptions.push('-fflags')
    ffOptions.push('+genpts')

    ffOptions.push('-progress', 'pipe:1') // Show progress in parsable mode
    ffOptions.push('-loglevel', '16') // Only show errors
    // TODO: ffOptions.push('-i', sourcePath)
    ffOptions.push('-y') // Overwrite output file without asking

    ffOptions.push('-i', video.sourcePath)
    const processingArgs = this.generateProcessingArguments(video, pass)

    if (processingArgs === undefined) {
      //ffOptions.push("-vf", "scale=1920:1080") // Downscale to 1080p
      ffOptions.push('-c', 'copy') // Just copy by default (no encode)

      if (videoTrackCount > 0) {
        ffOptions.push('-map', '0:V') // Copy video but not Video attachments to workaround ffmpeg bug
      }
      if (hasAudioTrack) {
        ffOptions.push('-map', '0:a') // Copy audios
      }
      if (hasSubtitlesTrack) {
        ffOptions.push('-map', '0:s') // Copy subs
      }
    } else {
      ffOptions.push(...processingArgs)
    }

    if (videoTrackCount > 0) {
      ffOptions.push('-pix_fmt', 'yuv420p')
    }

    let videoIndex = 0
    let audioIndex = 0
    for (const track of video.tracks) {
      const setting = settings.find((s) => s.trackId === track.id)
      if (setting != undefined) {
        if (setting.trackType === TrackType.VIDEO) {
          if (setting.codec === VideoCodec.H265) {
            if (videoTrackCount > 1) {
              ffOptions.push('-c:v:' + videoIndex, 'libx265')
            } else {
              ffOptions.push('-c:v', 'libx265')
            }
            if (pass !== undefined && statFile !== undefined) {
              const statFileEscaped = statFile.replaceAll('\\', '/').replaceAll(':', '\\:')
              ffOptions.push(
                '-x265-params',
                `log-level=error:pass=${pass}:stats=${statFileEscaped}${pass == 1 ? ':no-slow-firstpass=1' : ''}`
              )
            }
          } else {
            if (videoTrackCount > 1) {
              ffOptions.push('-c:v:' + videoIndex, 'libx264')
              ffOptions.push('-profile:v:' + videoIndex, 'high')
              ffOptions.push('-preset:v:' + videoIndex, 'slow')
            } else {
              ffOptions.push('-c:v', 'libx264')
              ffOptions.push('-profile:v', 'high')
              ffOptions.push('-preset:v', 'slow')
            }
            if (pass !== undefined && statFile !== undefined) {
              ffOptions.push('-pass', `${pass}`)
              ffOptions.push('-passlogfile', statFile)
            }
          }
          if (setting.bitrate) {
            if (videoTrackCount > 1) {
              ffOptions.push('-b:v:' + videoIndex, setting.bitrate / 1000 + 'k')
            } else {
              ffOptions.push('-b:v', setting.bitrate / 1000 + 'k')
            }
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

  private generateTrimFilter(
    inputIndex: number,
    type: TrackType,
    typeIndex: number,
    startFrom: number | undefined,
    endAt: number | undefined
  ) {
    const t =
      type === TrackType.VIDEO ? 'v' : type === TrackType.AUDIO ? 'a' : type === TrackType.SUBTITLES ? 's' : undefined
    const name = `${t}${inputIndex}_${typeIndex}`

    let filter = `[${inputIndex}:${t}:${typeIndex}]${type === TrackType.AUDIO ? 'a' : ''}trim=`
    if (startFrom !== undefined) {
      filter += 'start=' + startFrom
    }
    if (endAt !== undefined) {
      if (!filter.endsWith('=')) {
        filter += ':'
      }
      filter += 'end=' + endAt
    }
    filter += `,${type === TrackType.AUDIO ? 'a' : ''}setpts=PTS-STARTPTS[${name}]`
    return { name, filter }
  }
}

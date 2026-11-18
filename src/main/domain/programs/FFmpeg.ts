/*
 * Smart Video Processor
 * Copyright (c) 2025-2026. Xavier Fuentes <xfuentes-dev@serviam.cc>
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
import { Progression, ProgressNotifier } from '../../../common/@types/processes'
import { Files } from '../../util/files'
import path, * as Path from 'node:path'
import { Strings } from '../../../common/Strings'
import { effectiveExternalDelayMs, IVideo } from '../../../common/@types/Video'
import fs from 'node:fs'
import { SYNC_SAMPLE_RATE } from '../AudioSync'

const FIRST_PASS_TIME_PERCENT = 170 / 936
const SECOND_PASS_TIME_PERCENT = 766 / 936

// The countdown is computed from the average of the last speeds to avoid jumps.
const COUNTDOWN_SPEED_SAMPLES = 10
// The encoding speed is measured over the last seconds, ffmpeg only gives the average since the start.
const ENCODING_SPEED_WINDOW_MS = 30000
const ENCODING_SPEED_MIN_ELAPSED_MS = 2000

// The edit lists of these files are ignored, as mkvmerge does not apply them either when merging.
const MP4_FAMILY_PATTERN = /\.(mp4|m4v|m4a|mov|3gp|3g2)$/i

export type PreProcessStep = { kind: 'trim' | 'cut' | 'join'; current: number; total: number }

const IMPORTED_AUDIO_BITRATE = '192k'

export class FFmpeg extends CommandProgress {
  private static instance: FFmpeg
  private readonly timePattern: RegExp = /out_time_ms\s*=\s*(?<time>\d+)/i
  private readonly speedPattern: RegExp = /speed\s*=\s*(?<speed>[\d.]+)x/i
  private readonly framePattern: RegExp = /frame\s*=\s*(?<frame>\d+)/i
  private readonly endPattern: RegExp = /progress\s*=\s*end/i

  private constructor() {
    super(currentSettings.ffmpegPath, [0], 255, ['-version'], /^ffmpeg\sversion\sn?(?<version>[\d.]+)/i)
  }

  public static getInstance(): FFmpeg {
    if (!FFmpeg.instance) {
      FFmpeg.instance = new FFmpeg()
    }
    return FFmpeg.instance
  }

  // Decodes a part of an audio track to mono samples at the audio synchronisation rate.
  public readAudioWindow = (
    sourcePath: string,
    audioIndex: number,
    startSeconds: number,
    durationSeconds: number
  ): Promise<Float32Array> => {
    const editListArgs = MP4_FAMILY_PATTERN.test(sourcePath) ? ['-ignore_editlist', '1'] : []
    const args = [
      '-v',
      'error',
      ...editListArgs,
      '-ss',
      startSeconds.toFixed(3),
      '-t',
      durationSeconds.toFixed(3),
      '-i',
      sourcePath,
      '-map',
      '0:a:' + audioIndex,
      '-ac',
      '1',
      '-af',
      'aresample=async=1:first_pts=0,aresample=' + SYNC_SAMPLE_RATE,
      '-f',
      'f32le',
      'pipe:1'
    ]
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      const process = Processes.spawn(this.command, args, { stdio: ['pipe', 'pipe', 'pipe'] })
      process.stdout.on('data', (data: Buffer) => chunks.push(data))
      process.stderr.on('data', () => undefined)
      process.on('error', (err: Error) => reject(err))
      process.on('close', (code: number) => {
        if (code !== 0) {
          reject(new Error('Unable to read the audio track.'))
          return
        }
        const buffer = Buffer.concat(chunks)
        const length = Math.floor(buffer.length / 4)
        resolve(new Float32Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + length * 4)))
      })
    })
  }

  // Converts a subtitle track to a SubRip file, for the formats that Matroska cannot store.
  public async convertSubtitleToSrt(
    sourcePath: string,
    subtitleIndex: number,
    destinationPath: string
  ): Promise<string> {
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true })
    const args = ['-y', '-loglevel', '16', '-i', sourcePath, '-map', '0:s:' + subtitleIndex, '-c:s', 'srt']
    const outputInterpreter = (_stdout?: string, stderr?: string) => ({
      response: destinationPath,
      error: stderr?.split('\n')[0]
    })
    await super.execute([...args, destinationPath], outputInterpreter)
    return destinationPath
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

    const videoTrack = video.tracks.find((t) => t.type === TrackType.VIDEO)
    const frames = videoTrack?.properties.frames
    const framesPerSecond =
      frames !== undefined && videoTrack?.duration !== undefined && videoTrack.duration > 0 && frames > 0
        ? frames / videoTrack.duration
        : undefined
    const versionOutputInterpreter = this.ffmpegProgressInterpreterBuild(
      encodedPath ?? statFile ?? '',
      video.targetDuration,
      progressNotifier,
      framesPerSecond
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
    /**
     * Theses two options (-fflags, +genpts) are needed to work around a bug if no timestamps found in media.
     */
    ffOptions.push('-fflags', '+genpts')
    ffOptions.push('-y') // Overwrite output file without asking
    ffOptions.push('-i', video.sourcePath)

    let videoIndex = 0
    let audioIndex = 0
    let firstAudioTrack: ITrack | undefined = undefined
    for (const track of video.tracks) {
      if (track.copy) {
        if (audioIndex === 0 && track.type === TrackType.AUDIO) {
          if (track.codec.indexOf('AAC') !== -1) {
            ffOptions.push('-c:a', 'copy')
            ffOptions.push('-map', '0:a:' + audioIndex++)
          } else {
            firstAudioTrack = track
          }
        } else if (videoIndex === 0 && track.type === TrackType.VIDEO) {
          if (track.codec.indexOf('264') !== -1) {
            ffOptions.push('-c:v', 'copy')
          } else {
            ffOptions.push('-c:v', 'libx264')
            ffOptions.push('-preset', 'ultrafast')
            ffOptions.push('-crf', '35')
          }
          ffOptions.push('-map', '0:v:' + videoIndex++)
        }
      }
    }

    if (audioIndex === 0 && firstAudioTrack !== undefined) {
      ffOptions.push('-c:a', 'aac')
      ffOptions.push('-b:a', '64k')
      ffOptions.push('-map', '0:a:' + audioIndex++)
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

  public async preProcessVideoPart(
    number: number,
    video: IVideo,
    destinationPath: string,
    progressNotifier?: ProgressNotifier
  ): Promise<string> {
    const ffOptions: string[] = []
    fs.mkdirSync(destinationPath, { recursive: true })
    const preProcessPath = path.join(destinationPath, `part${number}.mkv`)
    const durationSeconds = (video.endAt ?? video.duration) - (video.startFrom ?? 0)

    ffOptions.push('-progress', 'pipe:1') // Show progress in parsable mode
    ffOptions.push('-loglevel', '16') // Only show errors
    ffOptions.push('-fflags', '+genpts')
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
      const ffmpegOutputInterpreter = this.ffmpegProgressInterpreterBuild(
        preProcessPath,
        durationSeconds,
        progressNotifier
      )
      return await super.execute(ffOptions, ffmpegOutputInterpreter)
    } else {
      return video.sourcePath
    }
  }

  // A file providing imported tracks is stretched, delayed or cut at its start to match the main video.
  private generateExternalInputArguments(
    sourcePath: string,
    delayMs: number,
    speedRatio: number,
    mainDuration: number,
    resampledAudio: boolean = false
  ): string[] {
    const ffOptions: string[] = []
    if (MP4_FAMILY_PATTERN.test(sourcePath)) {
      ffOptions.push('-ignore_editlist', '1')
    }
    if (speedRatio !== 1 && !resampledAudio) {
      ffOptions.push('-itsscale', speedRatio.toFixed(9))
    }
    // The offset is applied before the scale, so it is expressed in the time of the imported file.
    const delay = delayMs / 1000 / (resampledAudio ? 1 : speedRatio)
    if (delay > 0) {
      ffOptions.push('-itsoffset', delay.toFixed(3))
    } else if (delay < 0) {
      ffOptions.push('-ss', (resampledAudio ? -delayMs / 1000 / speedRatio : -delay).toFixed(3))
    }
    // The imported tracks must not last longer than the main video.
    const keptDuration = resampledAudio
      ? mainDuration - Math.max(delay, 0)
      : delay > 0
        ? mainDuration / speedRatio - delay
        : mainDuration / speedRatio
    if (mainDuration > 0 && keptDuration > 0) {
      ffOptions.push('-t', keptDuration.toFixed(3))
    }
    return ffOptions.concat(['-i', sourcePath])
  }

  // Resamples the audio tracks of a file so that they last ratio times longer, without a gap between the frames.
  public async resampleAudioTracks(
    sourcePath: string,
    tracks: ITrack[],
    speedRatio: number,
    durationSeconds: number,
    destinationPath: string,
    progressNotifier?: ProgressNotifier
  ): Promise<string> {
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true })
    const args = ['-y', '-progress', 'pipe:1', '-loglevel', '16']
    if (MP4_FAMILY_PATTERN.test(sourcePath)) {
      args.push('-ignore_editlist', '1')
    }
    args.push('-i', sourcePath)
    for (const track of tracks) {
      args.push('-map', `0:a:${track.sourceTypeIndex ?? 0}`)
    }
    args.push('-c:a', 'aac', '-b:a', IMPORTED_AUDIO_BITRATE)
    tracks.forEach((track, index) => {
      args.push(`-filter:a:${index}`, this.resampleFilter(speedRatio, track.properties?.audioSamplingFrequency))
    })
    if (durationSeconds > 0) {
      args.push('-t', durationSeconds.toFixed(3))
    }
    await super.execute(
      [...args, destinationPath],
      this.ffmpegProgressInterpreterBuild(destinationPath, durationSeconds, progressNotifier)
    )
    return destinationPath
  }

  // The audio is played slower, which also lowers its pitch back to the one of the original speed.
  private resampleFilter(speedRatio: number, sampleRate: number | undefined): string {
    if (sampleRate === undefined) {
      return `atempo=${(1 / speedRatio).toFixed(9)}`
    }
    // The rate is raised first so that rounding the slowed rate to an integer stays below a millisecond.
    const raised = sampleRate * 8
    return `aresample=${raised},asetrate=${Math.round(raised / speedRatio)},aresample=${sampleRate}`
  }

  // Copies the given tracks of a file to a new one, cut at the given duration.
  public async trimTracks(
    sourcePath: string,
    tracks: ITrack[],
    durationSeconds: number,
    destinationPath: string
  ): Promise<string> {
    fs.mkdirSync(path.dirname(destinationPath), { recursive: true })
    const args = ['-y', '-loglevel', '16']
    if (MP4_FAMILY_PATTERN.test(sourcePath)) {
      args.push('-ignore_editlist', '1')
    }
    args.push('-i', sourcePath, '-c', 'copy')
    args.push(...this.generateKeepAllMapping(tracks, new Map(tracks.map((t) => [t.externalSourceUuid ?? '', 0]))))
    // The limit is set on the output, as a limit on the input does not cut the subtitles.
    args.push('-t', durationSeconds.toFixed(3))
    const outputInterpreter = (_stdout?: string, stderr?: string) => ({
      response: destinationPath,
      error: stderr?.split('\n')[0]
    })
    await super.execute([...args, destinationPath], outputInterpreter)
    return destinationPath
  }

  generateKeepAllMapping = (
    tracks: ITrack[],
    externalInputIndexes: Map<string, number> = new Map(),
    externalAudioInputIndexes: Map<string, number> = new Map()
  ) => {
    const ffOptions: string[] = []
    let videoIndex = 0
    let audioIndex = 0
    let subtitlesIndex = 0
    let mainAudioIndex = 0
    let mainSubtitlesIndex = 0
    // The tracks imported from another file are read from its own input.
    const inputStream = (track: ITrack, letter: string, mainIndex: number) => {
      const externalInput =
        track.externalSourceUuid === undefined
          ? undefined
          : ((letter === 'a' ? externalAudioInputIndexes.get(track.externalSourceUuid) : undefined) ??
            externalInputIndexes.get(track.externalSourceUuid))
      return externalInput !== undefined
        ? `${externalInput}:${letter}:${track.sourceTypeIndex ?? 0}`
        : `0:${letter}:${mainIndex}`
    }
    for (const track of tracks) {
      const external = track.externalSourceUuid !== undefined
      if (track.type === TrackType.AUDIO) {
        ffOptions.push('-map', inputStream(track, 'a', external ? 0 : mainAudioIndex++))
        audioIndex++
      } else if (track.type === TrackType.VIDEO) {
        ffOptions.push('-map', '0:v:' + videoIndex++)
      } else if (track.type === TrackType.SUBTITLES) {
        ffOptions.push('-map', inputStream(track, 's', external ? 0 : mainSubtitlesIndex++))
        if (track.unsupported) {
          // e.g. MP4 Timed Text/mov_text (codec id 94213): Matroska cannot store it as-is,
          // so it must be converted instead of stream-copied.
          ffOptions.push('-c:s:' + subtitlesIndex, 'srt')
        }
        subtitlesIndex++
      }
    }
    return ffOptions
  }

  // Cuts the main video and its parts, then joins them, reporting the progress of the step in progress.
  public async preProcessVideo(
    video: IVideo,
    destinationPath: string,
    onProgress?: (step: PreProcessStep, progression: Progression) => void
  ): Promise<string> {
    const ffOptions: string[] = []

    const cutTotal = 1 + video.videoParts.length
    const stageCount = video.videoParts.length > 0 ? cutTotal + 1 : 1
    const notifierOf = (stage: number, step: PreProcessStep): ProgressNotifier | undefined =>
      onProgress === undefined
        ? undefined
        : (progression) => {
            const progress = progression.progress
            const overall = progress === undefined || progress < 0 ? progress : (stage + progress) / stageCount
            onProgress(step, { ...progression, progress: overall })
          }
    const videoPath = await this.preProcessVideoPart(
      0,
      video,
      destinationPath,
      notifierOf(0, { kind: video.videoParts.length > 0 ? 'cut' : 'trim', current: 1, total: cutTotal })
    )

    if (video.videoParts.length === 0) {
      return videoPath
    } else {
      const splitPaths: string[] = []
      splitPaths.push(videoPath)
      let num = 1
      for (const part of video.videoParts) {
        const partPath = await this.preProcessVideoPart(
          num,
          part,
          destinationPath,
          notifierOf(num, { kind: 'cut', current: num + 1, total: cutTotal })
        )
        num++
        splitPaths.push(partPath)
      }

      // A literal single quote in the path must be escaped as '\'' per the concat demuxer's file format.
      const concatFilePath = Files.writeFileSync(
        destinationPath,
        'concat.txt',
        splitPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join('\n'),
        'utf8'
      )

      ffOptions.push('-progress', 'pipe:1') // Show progress in parsable mode
      ffOptions.push('-loglevel', '16') // Only show errors
      ffOptions.push('-fflags', '+genpts')
      ffOptions.push('-y') // Overwrite output file without asking

      ffOptions.push('-f', 'concat')
      ffOptions.push('-safe', '0')
      ffOptions.push('-i', concatFilePath)
      ffOptions.push('-c', 'copy')

      ffOptions.push(...this.generateKeepAllMapping(video.tracks))

      const preProcessPath = path.join(destinationPath, `final-concat.mkv`)
      ffOptions.push(preProcessPath)

      const ffmpegOutputInterpreter = this.ffmpegProgressInterpreterBuild(
        preProcessPath,
        video.targetDuration,
        notifierOf(cutTotal, { kind: 'join', current: 1, total: 1 })
      )
      await super.execute(ffOptions, ffmpegOutputInterpreter)
      return preProcessPath
    }
  }

  // A chunk can hold several progress blocks, the last one is the most recent.
  private lastGroup(pattern: RegExp, text: string, group: string): string | undefined {
    let last: string | undefined
    for (const match of text.matchAll(new RegExp(pattern.source, 'gi'))) {
      last = match.groups?.[group]
    }
    return last
  }

  // With the frame rate, the progress follows the encoded frames, because the output time is held back by sparse subtitle tracks.
  private ffmpegProgressInterpreterBuild(
    outputFilePath: string,
    durationSeconds: number,
    progressNotifier?: ProgressNotifier,
    framesPerSecond?: number
  ) {
    const recentSpeeds: number[] = []
    const speedSamples: { at: number; mediaSeconds: number }[] = []
    return (stdout?: string, stderr?: string, process?: ChildProcess) => {
      const response = outputFilePath
      let error: string | undefined = undefined
      if (progressNotifier != undefined) {
        if (stdout != undefined) {
          const time = this.lastGroup(this.timePattern, stdout, 'time')
          const speed = this.lastGroup(this.speedPattern, stdout, 'speed')
          const frame = this.lastGroup(this.framePattern, stdout, 'frame')
          const endMatches = this.endPattern.exec(stdout)
          let xSpeed = speed !== undefined ? Number.parseFloat(speed) : 0

          let currentTimeSeconds: number | undefined
          if (framesPerSecond !== undefined && frame !== undefined) {
            currentTimeSeconds = Number(frame) / framesPerSecond
          } else if (time !== undefined) {
            currentTimeSeconds = Number(time) / 1000000
          }

          if (endMatches) {
            progressNotifier({ progress: 1, xSpeed, countdown: 0, process })
          } else if (currentTimeSeconds !== undefined) {
            let progress: number | undefined = 0
            if (!durationSeconds) {
              progress = undefined
              progressNotifier({ progress, xSpeed, process })
            } else if (currentTimeSeconds > 0) {
              progress = currentTimeSeconds / durationSeconds
              if (framesPerSecond !== undefined && frame !== undefined) {
                const now = Date.now()
                speedSamples.push({ at: now, mediaSeconds: currentTimeSeconds })
                while (speedSamples.length > 2 && now - speedSamples[1].at >= ENCODING_SPEED_WINDOW_MS) {
                  speedSamples.shift()
                }
                const oldest = speedSamples[0]
                if (now - oldest.at >= ENCODING_SPEED_MIN_ELAPSED_MS) {
                  xSpeed = (currentTimeSeconds - oldest.mediaSeconds) / ((now - oldest.at) / 1000)
                }
              }
              const secondsLeft = (1 - progress) * durationSeconds
              if (xSpeed > 0) {
                recentSpeeds.push(xSpeed)
                if (recentSpeeds.length > COUNTDOWN_SPEED_SAMPLES) {
                  recentSpeeds.shift()
                }
              }
              const averageSpeed =
                recentSpeeds.length > 0 ? recentSpeeds.reduce((a, b) => a + b, 0) / recentSpeeds.length : 0
              const countdown = averageSpeed > 0 ? secondsLeft / averageSpeed : undefined
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
    ffOptions.push('-fflags', '+genpts')

    ffOptions.push('-progress', 'pipe:1') // Show progress in parsable mode
    ffOptions.push('-loglevel', '16') // Only show errors
    // TODO: ffOptions.push('-i', sourcePath)
    ffOptions.push('-y') // Overwrite output file without asking

    if (video.preProcessPath) {
      ffOptions.push('-i', video.preProcessPath)
    } else {
      ffOptions.push('-i', video.sourcePath)
    }
    const externalInputIndexes = new Map<string, number>()
    const externalAudioInputIndexes = new Map<string, number>()
    let inputCount = 1
    for (const source of video.externalSources ?? []) {
      if (video.tracks.some((t) => t.externalSourceUuid === source.uuid)) {
        const delayMs = effectiveExternalDelayMs(video, source)
        const speedRatio = source.speedRatio ?? 1
        const resampled =
          speedRatio !== 1 &&
          video.tracks.some((t) => t.externalSourceUuid === source.uuid && t.type === TrackType.AUDIO)
        const hasOtherTracks = video.tracks.some(
          (t) => t.externalSourceUuid === source.uuid && (!resampled || t.type !== TrackType.AUDIO)
        )
        if (hasOtherTracks) {
          externalInputIndexes.set(source.uuid, inputCount++)
          ffOptions.push(...this.generateExternalInputArguments(source.path, delayMs, speedRatio, video.targetDuration))
        }
        if (resampled) {
          // The audio is read without the scale of the timestamps, as it is resampled instead.
          externalAudioInputIndexes.set(source.uuid, inputCount++)
          ffOptions.push(
            ...this.generateExternalInputArguments(source.path, delayMs, speedRatio, video.targetDuration, true)
          )
        }
      }
    }
    //ffOptions.push("-vf", "scale=1920:1080") // Downscale to 1080p
    ffOptions.push('-c', 'copy') // Just copy by default (no encode)
    ffOptions.push(...this.generateKeepAllMapping(video.tracks, externalInputIndexes, externalAudioInputIndexes))
    if (externalInputIndexes.size > 0 && video.targetDuration > 0) {
      // The imported subtitles are not cut by the limit set on their input.
      ffOptions.push('-t', (video.targetDuration + 0.5).toFixed(3))
    }

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
      const resampledRatio =
        track.type === TrackType.AUDIO &&
        track.externalSourceUuid !== undefined &&
        externalAudioInputIndexes.has(track.externalSourceUuid)
          ? (video.externalSources.find((s) => s.uuid === track.externalSourceUuid)?.speedRatio ?? 1)
          : 1
      if (resampledRatio !== 1 && pass !== 1) {
        ffOptions.push(
          '-filter:a:' + audioIndex,
          this.resampleFilter(resampledRatio, track.properties?.audioSamplingFrequency)
        )
        if (setting?.bitrate === undefined) {
          ffOptions.push('-c:a:' + audioIndex, 'aac', '-b:a:' + audioIndex, IMPORTED_AUDIO_BITRATE)
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

/*
 * Smart Video Processor
 * Copyright (c) 2025. Xavier Fuentes <xfuentes-dev@serviam.cc>
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
import { Languages } from '../../../common/LanguageIETF'
import { Files } from '../../util/files'
import { CommandProgress } from './CommandProgress'
import { ChildProcess } from 'node:child_process'
import { TrackType } from '../../../common/@types/Track'
import { ProgressNotifier } from '../../../common/@types/processes'
import { Attachment, Change, ChangeProperty, ChangeSourceType, ChangeType } from '../../../common/Change'
import { currentSettings } from '../Settings'
import * as os from 'node:os'

export const MKVMERGE_ENGLISH = os.platform() === 'win32' ? 'en' : 'en_US'

export interface Container {
  type: string
  title?: string
  attachments?: Attachment[]
  tagCount: number
  durationSeconds: number
}

export interface ExternalInput {
  uuid: string
  path: string
  delayMs: number
  // Factor applied to the timestamps of the file to follow the speed of the main video.
  speedRatio?: number
  // Audio tracks resampled to the speed of the main video, read from a file of their own.
  resampledAudio?: { path: string; fileTrackIds: { [trackId: number]: number } }
  // Subtitles that Matroska cannot store as they are, converted to separate files beforehand.
  convertedSubtitles?: { trackId: number; path: string }[]
  // Identifiers of the tracks inside the file, when it is a trimmed copy of the original one.
  fileTrackIds?: { [trackId: number]: number }
}

export class MKVMerge extends CommandProgress {
  private static instance: MKVMerge

  private constructor() {
    super(currentSettings.mkvMergePath, [0, 1], undefined, ['--version'], /^mkvmerge\sv(?<version>[\d.]+)/i)
  }

  public static getInstance(): MKVMerge {
    if (!MKVMerge.instance) {
      MKVMerge.instance = new MKVMerge()
    }
    return MKVMerge.instance
  }

  public async retrieveFileInformation(path: string): Promise<{ tracks: Track[]; container: Container }> {
    const tracks: Track[] = []
    const mkvMergeOutput = await Processes.spawnReadStdout(this.command, [
      '-J',
      path,
      '--ui-language',
      MKVMERGE_ENGLISH
    ])
    let mkvInfo: MKVMergeIdentify
    try {
      mkvInfo = JSON.parse(mkvMergeOutput) as MKVMergeIdentify
    } catch (e) {
      throw new Error(mkvMergeOutput)
    }

    let durationSeconds = 0
    mkvInfo?.tracks?.forEach((track) => {
      let type: TrackType | undefined = undefined
      switch (track.type) {
        case 'audio':
          type = TrackType.AUDIO
          break
        case 'video':
          type = TrackType.VIDEO
          break
        case 'subtitles':
          type = TrackType.SUBTITLES
          break
      }
      if (type !== undefined) {
        const language =
          track.properties.language_ietf ??
          (track.properties.language === 'und' || track.properties.language === undefined
            ? undefined
            : Languages.getLanguageByCode(track.properties.language)?.code)
        const trackDurationSeconds = Numbers.durationToSeconds(track.properties.tag_duration)
        if (trackDurationSeconds !== undefined && trackDurationSeconds > durationSeconds) {
          durationSeconds = trackDurationSeconds
        }
        tracks.push(
          new Track(
            track.id,
            track.properties.track_name,
            type,
            track.codec,
            language,
            {
              videoDimensions: track.properties.pixel_dimensions,
              audioChannels: track.properties.audio_channels,
              audioSamplingFrequency: track.properties.audio_sampling_frequency,
              textSubtitles: track.properties.text_subtitles,
              frames: Numbers.toNumber(track.properties.tag_number_of_frames),
              bitRate: Numbers.toNumber(track.properties.tag_bps)
            },
            track.properties.default_track,
            track.properties.forced_track,
            Numbers.toNumber(track.properties.tag_number_of_bytes),
            trackDurationSeconds
          )
        )
      }
    })
    const container: Container = {
      type: mkvInfo?.container?.type,
      attachments: !mkvInfo?.attachments
        ? []
        : mkvInfo?.attachments?.map((mkva) => new Attachment(mkva.file_name, mkva.content_type, mkva.description)),
      title: mkvInfo?.container?.properties?.title,
      tagCount: (mkvInfo?.global_tags?.length ?? 0) + (mkvInfo?.track_tags?.length ?? 0),
      durationSeconds
    }
    return { tracks, container }
  }

  async processFile(
    originalFilename: string,
    path: string,
    outputDirectory: string,
    changes: Change[],
    tracks: Track[] = [],
    progressNotifier?: ProgressNotifier,
    externalInputs: ExternalInput[] = []
  ): Promise<string> {
    const args = this.generateProcessingArguments(
      originalFilename,
      path,
      outputDirectory,
      changes,
      tracks,
      externalInputs
    )
    Files.mkdirSync(outputDirectory, { recursive: true })
    const progressionPattern: RegExp = /Progress: (?<progress>\d+)%/i
    const errorPattern: RegExp = /Error: (?<message>.*)/i

    const outputInterpreter = (
      stdout?: string,
      stderr?: string,
      process?: ChildProcess
    ): { response: string; error?: string } => {
      let response = ''
      let error: string | undefined = undefined
      if (stdout !== undefined) {
        const matches = progressionPattern.exec(stdout.toString())
        const errMatches = errorPattern.exec(stdout.toString())
        if (matches?.groups) {
          const progress = Number(matches.groups.progress)
          if (progressNotifier != undefined) {
            progressNotifier({ progress: progress / 100, process })
          }
        } else if (errMatches?.groups) {
          error = errMatches.groups.message
        } else {
          response += stdout.toString()
        }
      } else if (stderr !== undefined) {
        // get first line;
        const end = stderr.indexOf('\n')
        error = stderr.substring(0, end !== -1 ? end : undefined)
      }
      return { response, error }
    }

    return super.execute(args, outputInterpreter)
  }

  private generateProcessingArguments(
    originalFilename: string,
    sourcePath: string,
    outputDirectory: string,
    changes: Change[],
    tracks: Track[],
    externalInputs: ExternalInput[]
  ): string[] {
    let mkOptions: string[] = []
    const externalTrackIds = tracks.filter((t) => t.externalSourceUuid !== undefined).map((t) => t.id)
    const mainTracks = tracks.filter((t) => t.externalSourceUuid === undefined)
    const mainChanges = changes.filter((c) => c.trackId == undefined || !externalTrackIds.includes(c.trackId))

    const newFilename = Files.computeOutputPath(originalFilename, changes, outputDirectory)

    mkOptions.push('--ui-language', MKVMERGE_ENGLISH)
    if (newFilename) {
      mkOptions.push('--output', newFilename)
    }

    mkOptions = mkOptions.concat(this.generateGlobalArguments(changes))
    mkOptions = mkOptions.concat(this.generateAttachmentArguments(changes))
    mkOptions = mkOptions.concat(this.generateTracksArguments(mainTracks, mainChanges))
    mkOptions = mkOptions.concat(['(', sourcePath, ')'])
    for (const input of externalInputs) {
      mkOptions = mkOptions.concat(this.generateExternalInputArguments(input, tracks, changes))
    }
    return mkOptions
  }

  // The tracks imported from another file are read from it, delayed to match the main video.
  private generateExternalInputArguments(input: ExternalInput, tracks: Track[], changes: Change[]): string[] {
    const converted = input.convertedSubtitles ?? []
    const speedRatio = input.speedRatio ?? 1
    const syncValue = (ratio: number) => (ratio !== 1 ? `${input.delayMs},${ratio.toFixed(9)}` : `${input.delayMs}`)
    const convertedArgs = converted.flatMap((subtitle) => {
      const track = tracks.filter((t) => t.id === subtitle.trackId)
      const trackChanges = changes.filter((c) => c.trackId === subtitle.trackId)
      const needsSync = input.delayMs !== 0 || speedRatio !== 1
      const syncArgs = needsSync ? ['--sync', `0:${syncValue(speedRatio)}`] : []
      const updateArgs = this.generateTrackUpdateArguments(track, trackChanges, () => 0)
      return [...syncArgs, ...updateArgs, '(', subtitle.path, ')']
    })
    const resampled = input.resampledAudio
    const resampledArgs =
      resampled === undefined
        ? []
        : this.generateImportedBlock(
            resampled.path,
            tracks.filter((t) => t.externalSourceUuid === input.uuid && t.copy && t.id in resampled.fileTrackIds),
            changes,
            (id) => resampled.fileTrackIds[id],
            input.delayMs,
            1
          )
    const selected = tracks.filter(
      (t) =>
        t.externalSourceUuid === input.uuid &&
        t.copy &&
        !converted.some((c) => c.trackId === t.id) &&
        !(resampled !== undefined && t.id in resampled.fileTrackIds)
    )
    if (selected.length === 0) {
      return [...resampledArgs, ...convertedArgs]
    }
    const sourceIds = new Map(selected.map((t) => [t.id, input.fileTrackIds?.[t.id] ?? t.sourceTrackId ?? t.id]))
    const block = this.generateImportedBlock(
      input.path,
      selected,
      changes,
      (id) => sourceIds.get(id) ?? id,
      input.delayMs,
      speedRatio
    )
    return [...resampledArgs, ...block, ...convertedArgs]
  }

  // Reads the selected tracks of a file, delayed and stretched to match the main video.
  private generateImportedBlock(
    filePath: string,
    selected: Track[],
    changes: Change[],
    sourceId: (id: number) => number,
    delayMs: number,
    speedRatio: number
  ): string[] {
    if (selected.length === 0) {
      return []
    }
    const mkOptions = ['--no-video', '--no-attachments', '--no-chapters', '--no-global-tags', '--no-track-tags']
    const idsOfType = (type: TrackType) =>
      selected
        .filter((t) => t.type === type)
        .map((t) => sourceId(t.id))
        .join(',')
    const audios = idsOfType(TrackType.AUDIO)
    mkOptions.push(...(audios ? ['--audio-tracks', audios] : ['--no-audio']))
    const subtitles = idsOfType(TrackType.SUBTITLES)
    mkOptions.push(...(subtitles ? ['--subtitle-tracks', subtitles] : ['--no-subtitles']))
    if (delayMs !== 0 || speedRatio !== 1) {
      const value = speedRatio !== 1 ? `${delayMs},${speedRatio.toFixed(9)}` : `${delayMs}`
      for (const track of selected) {
        mkOptions.push('--sync', `${sourceId(track.id)}:${value}`)
      }
    }
    const ids = new Set(selected.map((t) => t.id))
    const inputChanges = changes.filter((c) => c.trackId != undefined && ids.has(c.trackId))
    mkOptions.push(...this.generateTrackUpdateArguments(selected, inputChanges, sourceId))
    return mkOptions.concat(['(', filePath, ')'])
  }

  private generateGlobalArguments(changes: Change[]): string[] {
    const mkOptions: string[] = []

    const newContainerTitle = changes.find(
      (c) =>
        c.sourceType === ChangeSourceType.CONTAINER &&
        c.changeType === ChangeType.UPDATE &&
        c.property === ChangeProperty.TITLE
    )?.newValue as string | undefined

    if (newContainerTitle !== undefined) {
      mkOptions.push('--title', newContainerTitle)
    }

    mkOptions.push('--no-global-tags', '--no-track-tags')
    return mkOptions
  }

  private generateAttachmentArguments(changes: Change[]): string[] {
    const mkOptions: string[] = []

    const clearAttachmentsRequest = changes.find(
      (c) =>
        c.sourceType === ChangeSourceType.CONTAINER &&
        c.changeType === ChangeType.DELETE &&
        c.property === ChangeProperty.ATTACHMENTS
    )

    if (clearAttachmentsRequest !== undefined) {
      mkOptions.push('--no-attachments')
    }

    const updatePosterRequest = changes.find(
      (c) =>
        c.sourceType === ChangeSourceType.CONTAINER &&
        c.changeType === ChangeType.UPDATE &&
        c.property === ChangeProperty.POSTER
    )
    const attachment = updatePosterRequest?.newValue as Attachment | undefined

    if (attachment !== undefined && attachment.path !== undefined) {
      mkOptions.push('--attachment-name', attachment.filename)
      mkOptions.push('--attachment-description', attachment.description)
      mkOptions.push('--attachment-mime-type', attachment.mimeType)
      mkOptions.push('--attach-file', attachment.path)
    }
    return mkOptions
  }

  private generateTrackUpdateArguments(
    tracks: Track[],
    changes: Change[],
    fileTrackId: (id: number) => number
  ): string[] {
    const mkOptions: string[] = []

    const updatedTrackLanguages: number[] = []
    const updateTrackRequests = changes.filter((c) => c.trackId != undefined && c.changeType === ChangeType.UPDATE)

    for (const uChange of updateTrackRequests) {
      switch (uChange.property) {
        case ChangeProperty.LANGUAGE:
          mkOptions.push(
            '--language',
            `${fileTrackId(uChange.trackId as number)}:${(uChange.newValue === undefined ? 'und' : uChange.newValue) as string}`
          )
          updatedTrackLanguages.push(uChange.trackId as number)
          break
        case ChangeProperty.NAME:
          mkOptions.push('--track-name', `${fileTrackId(uChange.trackId as number)}:${uChange.newValue as string}`)
          break
        case ChangeProperty.DEFAULT:
          mkOptions.push(
            '--default-track',
            `${fileTrackId(uChange.trackId as number)}:${(uChange.newValue as boolean) ? 'yes' : 'no'}`
          )
          break
        case ChangeProperty.FORCED:
          mkOptions.push(
            '--forced-track',
            `${fileTrackId(uChange.trackId as number)}:${(uChange.newValue as boolean) ? 'yes' : 'no'}`
          )
          break
      }
    }

    for (const track of tracks) {
      if (track.copy && !updatedTrackLanguages.includes(track.id)) {
        // If the track is to be copied and language was not updated,
        // we preserve the original track language IETF because ffmpeg removes them.
        mkOptions.push(
          '--language',
          `${fileTrackId(track.id)}:${track.language === undefined ? 'und' : track.language}`
        )
      }
    }
    return mkOptions
  }

  private generateTracksArguments(tracks: Track[], changes: Change[]): string[] {
    const mkOptions = this.generateTrackUpdateArguments(tracks, changes, (id) => id)

    const videosToRemove = tracks
      .filter((t) => !t.copy && t.type === TrackType.VIDEO)
      .map((t) => t.id)
      .join(',')
    if (videosToRemove) {
      mkOptions.push('--video-tracks', '!' + videosToRemove)
    }

    const audiosToRemove = tracks
      .filter((t) => !t.copy && t.type === TrackType.AUDIO)
      .map((t) => t.id)
      .join(',')
    if (audiosToRemove) {
      mkOptions.push('--audio-tracks', '!' + audiosToRemove)
    }

    const subtitlesToRemove = tracks
      .filter((t) => !t.copy && t.type === TrackType.SUBTITLES)
      .map((t) => t.id)
      .join(',')
    if (subtitlesToRemove) {
      mkOptions.push('--subtitle-tracks', '!' + subtitlesToRemove)
    }
    return mkOptions
  }
}

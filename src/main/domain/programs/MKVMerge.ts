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
import { Languages } from '../../../common/LanguageIETF'
import { Files } from '../../util/files'
import { CommandProgress } from './CommandProgress'
import { ChildProcess } from 'node:child_process'
import path from 'node:path'
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
    progressNotifier?: ProgressNotifier
  ): Promise<string> {
    const args = this.generateProcessingArguments(originalFilename, path, outputDirectory, changes, tracks)
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
    tracks: Track[]
  ): string[] {
    let mkOptions: string[] = []

    let newFilename =
      (changes.find(
        (c) =>
          c.sourceType === ChangeSourceType.CONTAINER &&
          c.changeType === ChangeType.UPDATE &&
          c.property === ChangeProperty.FILENAME
      )?.newValue as string | undefined) ?? ''

    if (path.isAbsolute(newFilename)) {
      outputDirectory = path.dirname(newFilename)
      newFilename = path.basename(newFilename)
    }

    if (!path.isAbsolute(outputDirectory)) {
      throw Error('Invalid output Directory, it should be absolute: ' + outputDirectory)
    }

    if (!newFilename) {
      newFilename = originalFilename
    }
    newFilename = Files.removeSpecialCharsFromFilename(newFilename)
    newFilename = path.join(outputDirectory, newFilename)

    mkOptions.push('--ui-language', MKVMERGE_ENGLISH)
    if (newFilename) {
      mkOptions.push('--output', newFilename)
    }

    mkOptions = mkOptions.concat(this.generateGlobalArguments(changes))
    mkOptions = mkOptions.concat(this.generateAttachmentArguments(changes))
    mkOptions = mkOptions.concat(this.generateTracksArguments(tracks, changes))

    return mkOptions.concat(['(', sourcePath, ')'])
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

  private generateTracksArguments(tracks: Track[], changes: Change[]): string[] {
    const mkOptions: string[] = []

    const updatedTrackLanguages: number[] = []
    const updateTrackRequests = changes.filter((c) => c.trackId != undefined && c.changeType === ChangeType.UPDATE)

    for (const uChange of updateTrackRequests) {
      switch (uChange.property) {
        case ChangeProperty.LANGUAGE:
          mkOptions.push(
            '--language',
            `${uChange.trackId}:${(uChange.newValue === undefined ? 'und' : uChange.newValue) as string}`
          )
          updatedTrackLanguages.push(uChange.trackId as number)
          break
        case ChangeProperty.NAME:
          mkOptions.push('--track-name', `${uChange.trackId}:${uChange.newValue as string}`)
          break
        case ChangeProperty.DEFAULT:
          mkOptions.push('--default-track', `${uChange.trackId}:${(uChange.newValue as boolean) ? 'yes' : 'no'}`)
          break
        case ChangeProperty.FORCED:
          mkOptions.push('--forced-track', `${uChange.trackId}:${(uChange.newValue as boolean) ? 'yes' : 'no'}`)
          break
      }
    }

    for (const track of tracks) {
      if (track.copy && !updatedTrackLanguages.includes(track.id)) {
        // If the track is to be copied and language was not updated,
        // we preserve the original track language IETF because ffmpeg removes them.
        mkOptions.push('--language', `${track.id}:${track.language === undefined ? 'und' : track.language}`)
      }
    }

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

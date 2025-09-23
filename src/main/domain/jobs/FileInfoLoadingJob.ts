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

import { Job } from './Job'
import { Container, MKVMerge } from '../programs/MKVMerge'
import { Track } from '../Track'
import { Files } from '../../util/files'
import { FFprobe } from '../programs/FFprobe'
import path from 'node:path'
import { JobStatus } from '../../../common/@types/Job'
import { TrackType } from '../../../common/@types/Track'
import { Change, ChangeProperty, ChangeSourceType, ChangeType } from '../../../common/Change'

export class FileInfoLoadingJob extends Job<{ tracks: Track[]; container: Container }> {
  private readonly sourcePath: string

  constructor(path: string) {
    super(JobStatus.LOADING, 'Loading file information.')
    this.sourcePath = path
  }

  protected async executeInternal(): Promise<{ tracks: Track[]; container: Container }> {
    let result = await MKVMerge.getInstance().retrieveFileInformation(this.sourcePath)
    await FFprobe.getInstance().completeFileInformation(this.sourcePath, result.tracks, result.container)
    if (!result?.tracks?.length) {
      return Promise.reject(new Error('Unsupported video file format.'))
    }
    const unsupported = result.tracks.find((t) => t.unsupported)
    if (!unsupported) {
      const videoTrack = result.tracks.find((t) => t.type === TrackType.VIDEO)
      if (videoTrack !== undefined && videoTrack.properties.bitRate === undefined) {
        const outputPath = Files.makeTempFile('processed.mkv')
        const changes = [
          new Change(
            ChangeSourceType.CONTAINER,
            ChangeType.UPDATE,
            undefined,
            ChangeProperty.FILENAME,
            undefined,
            outputPath
          )
        ]
        await MKVMerge.getInstance().processFile(
          path.basename(this.sourcePath),
          this.sourcePath,
          '/',
          changes,
          [],
          this.setProgression.bind(this)
        )
        result = await MKVMerge.getInstance().retrieveFileInformation(outputPath)
        Files.unlinkSync(outputPath)
      }
    }
    return result
  }
}

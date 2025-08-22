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

import { Job, JobStatus } from './Job'
import { MKVMerge } from '../programs/MKVMerge'
import { Change } from '../Change'
import { Track } from '../Track'
import path from 'node:path'

export class ProcessingJob extends Job<string> {
  private readonly originalFilename: string
  private readonly sourcePath: string
  private readonly changes: Change[]
  private readonly outputPath: string
  private readonly tracks: Track[]

  constructor(
    originalFilename: string,
    sourcePath: string,
    changes: Change[],
    tracks: Track[],
    outputFullPath: string,
    subDirectories: string[] = [],
    extraDuration?: number
  ) {
    super(JobStatus.MERGING, 'Generating matroska file', extraDuration)
    this.originalFilename = originalFilename
    this.sourcePath = sourcePath
    this.changes = changes
    this.outputPath = path.join(outputFullPath, ...subDirectories)
    this.tracks = tracks
  }

  protected executeInternal(): Promise<string> {
    return MKVMerge.getInstance().processFile(
      this.originalFilename,
      this.sourcePath,
      this.outputPath,
      this.changes,
      this.tracks,
      this.setProgression.bind(this)
    )
  }
}

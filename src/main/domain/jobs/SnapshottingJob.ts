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
import { JobStatus } from '../../../common/@types/Job'
import { FFmpeg } from '../programs/FFmpeg'

export class SnapshottingJob extends Job<string> {
  private readonly sourcePath: string
  private readonly destinationPath: string
  private readonly snapshotHeight: number
  private readonly snapshotWidth: number
  private readonly totalWidth: number
  private readonly durationSeconds: number

  constructor(
    sourcePath: string,
    destinationPath: string,
    snapshotHeight: number,
    snapshotWidth: number,
    totalWidth: number,
    durationSeconds: number
  ) {
    super(JobStatus.GRABBING, 'Snapshotting video.')
    this.sourcePath = sourcePath
    this.destinationPath = destinationPath
    this.snapshotHeight = snapshotHeight
    this.snapshotWidth = snapshotWidth
    this.totalWidth = totalWidth
    this.durationSeconds = durationSeconds
  }

  protected async executeInternal(): Promise<string> {
    return await FFmpeg.getInstance().generateSnapshots(
      this.sourcePath,
      this.destinationPath,
      this.snapshotHeight,
      this.snapshotWidth,
      this.totalWidth,
      this.durationSeconds,
      this.setProgression.bind(this)
    )
  }
}

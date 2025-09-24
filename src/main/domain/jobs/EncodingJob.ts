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
import { FFmpeg } from '../programs/FFmpeg'
import { Strings } from '../../../common/Strings'
import { Track } from '../Track'
import { EncoderSettings } from '../../../common/@types/Encoding'
import { JobStatus } from '../../../common/@types/Job'

export class EncodingJob extends Job<string> {
  private readonly sourcePath: string
  private readonly destinationPath: string
  private readonly durationSeconds: number
  private readonly settings: EncoderSettings[]
  private readonly tracks: Track[]

  constructor(
    sourcePath: string,
    destinationPath: string,
    durationSeconds: number,
    tracks: Track[],
    settings: EncoderSettings[]
  ) {
    super(JobStatus.ENCODING, 'Encoding, please wait.')
    this.sourcePath = sourcePath
    this.destinationPath = destinationPath
    this.durationSeconds = durationSeconds
    this.settings = settings
    this.tracks = tracks
  }

  getTitle() {
    const progression = this.getProgression()
    const result: string[] = []
    if (progression.xSpeed !== undefined) {
      result.push(`Encoding at ${progression.xSpeed.toFixed(1)}x.`)
    }
    if (progression.countdown !== undefined) {
      if (progression.pass === 1) {
        result.push(`Completion of first pass in ${Strings.humanDuration(progression.countdown)}.`)
      } else {
        result.push(`Completion in ${Strings.humanDuration(progression.countdown)}.`)
      }
    }
    return result.length > 0 ? result.join(' ') : this.title
  }

  protected executeInternal(): Promise<string> {
    return FFmpeg.getInstance().encodeFile(
      this.sourcePath,
      this.destinationPath,
      this.durationSeconds,
      this.tracks,
      this.settings,
      this.setProgression.bind(this)
    )
  }
}

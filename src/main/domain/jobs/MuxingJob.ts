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

import { Job } from './Job'
import { JobStatus } from '../../../common/@types/Job'
import { Progression } from '../../../common/@types/processes'

export interface MuxingReporter {
  // Replaces the message shown for the step in progress.
  setMessage: (message: string) => void
  setProgression: (progression: Progression) => void
}

// A job preparing the files of a video before the final merge, like cutting parts or resampling imported audio.
export class MuxingJob<T> extends Job<T> {
  private message: string
  private readonly work: (reporter: MuxingReporter) => Promise<T>

  constructor(title: string, work: (reporter: MuxingReporter) => Promise<T>) {
    super(JobStatus.MUXING, title)
    this.message = title
    this.work = work
  }

  getTitle() {
    return this.message
  }

  protected executeInternal(): Promise<T> {
    return this.work({
      setMessage: (message) => {
        if (message !== this.message) {
          this.message = message
          this.emitChangeEvent()
        }
      },
      setProgression: this.setProgression.bind(this)
    })
  }
}

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

import { _ } from '../../i18n'
import { Job } from './Job'
import { JobStatus } from '../../../common/@types/Job'
import type { Video } from '../Video'

export class SearchingJob extends Job<void> {
  private static pendingAutoSearch?: SearchingJob

  private readonly videos: Video[]
  private readonly searchVideo: (video: Video) => Promise<void>
  private readonly sequential: boolean

  constructor(videos: Video[], searchVideo: (video: Video) => Promise<void>, sequential = false) {
    super(JobStatus.SEARCHING, _('job.title.searching', { defaultValue: 'Searching video information.' }))
    this.videos = videos
    this.searchVideo = searchVideo
    this.sequential = sequential
  }

  // Videos loaded while a search is running are grouped in the next waiting job.
  static queueAutoSearch(video: Video): Promise<void> {
    let job = SearchingJob.pendingAutoSearch
    if (job === undefined || job.started) {
      job = new SearchingJob([], (v) => v.search())
      SearchingJob.pendingAutoSearch = job
    }
    job.videos.push(video)
    return job.queue()
  }

  protected async executeInternal(): Promise<void> {
    let firstError: unknown
    let done = 0
    const run = async (video: Video) => {
      try {
        await this.searchVideo(video)
      } catch (err) {
        firstError = firstError ?? err
      }
      done++
      this.setProgression({ progress: done / this.videos.length })
    }
    this.setProgression({ progress: 0 })
    // The first search warms the clients cache so the others can run in parallel.
    if (this.sequential) {
      for (const video of this.videos) {
        await run(video)
      }
    } else if (this.videos.length > 0) {
      await run(this.videos[0])
      await Promise.all(this.videos.slice(1).map(run))
    }
    if (firstError !== undefined) {
      throw firstError as Error
    }
  }
}

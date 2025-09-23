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
import { JobStatus, JobType } from '../../../common/@types/Job'

export class JobManager {
  private static instance: JobManager
  private paused: boolean = false

  private runningJobs: { [K in JobType]: Job<object | unknown> | undefined } = {
    [JobStatus.LOADING]: undefined as Job<object | unknown> | undefined,
    [JobStatus.ENCODING]: undefined as Job<object | unknown> | undefined,
    [JobStatus.MERGING]: undefined as Job<object | unknown> | undefined
  }
  private queues: { [K in JobType]: Job<object | unknown>[] } = {
    [JobStatus.LOADING]: [] as Job<object | unknown>[],
    [JobStatus.ENCODING]: [] as Job<object | unknown>[],
    [JobStatus.MERGING]: [] as Job<object | unknown>[]
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): JobManager {
    if (!JobManager.instance) {
      JobManager.instance = new JobManager()
    }
    return JobManager.instance
  }

  queue<T>(job: Job<T>) {
    return new Promise<T>((resolve, reject) => {
      this.queues[job.type].push(job)
      job.addChangeListener(() => {
        if (job.finished) {
          if (this.runningJobs[job.type] === job) {
            this.runningJobs[job.type] = undefined
            this.handleQueueUpdated(job.type)
          }
          if (job.success) {
            resolve(job.getResult() as T)
          } else {
            reject(new Error(job.getError()))
          }
        }
      })
      this.handleQueueUpdated(job.type)
    })
  }

  handleQueueUpdated(jobType: JobType) {
    if (!this.isPaused(jobType) && !this.runningJobs[jobType]) {
      this.runningJobs[jobType] = this.queues[jobType].shift()
      if (this.runningJobs[jobType]) {
        this.runningJobs[jobType].execute().catch((_err) => {
          // Error ignored because it was handled by the job change handler above.
        })
      }
    }
  }

  isPaused(jobType: JobType = JobStatus.ENCODING) {
    return (jobType === JobStatus.ENCODING || jobType === JobStatus.MERGING) && this.paused
  }

  switchPaused() {
    this.paused = !this.paused
    if (this.paused) {
      if (this.runningJobs[JobStatus.ENCODING] !== undefined) {
        this.runningJobs[JobStatus.ENCODING]?.pause()
      }
      if (this.runningJobs[JobStatus.MERGING]) {
        this.runningJobs[JobStatus.MERGING]?.pause()
      }
    } else {
      if (this.runningJobs[JobStatus.ENCODING] !== undefined) {
        this.runningJobs[JobStatus.ENCODING]?.resume()
      }
      if (this.runningJobs[JobStatus.MERGING] !== undefined) {
        this.runningJobs[JobStatus.MERGING]?.resume()
      }
      this.handleQueueUpdated(JobStatus.ENCODING)
      this.handleQueueUpdated(JobStatus.MERGING)
    }
    return this.paused
  }

  updatePriority() {
    if (this.runningJobs[JobStatus.ENCODING] !== undefined) {
      this.runningJobs[JobStatus.ENCODING]?.updatePriority()
    }
    if (this.runningJobs[JobStatus.MERGING]) {
      this.runningJobs[JobStatus.MERGING]?.updatePriority()
    }
  }

  removeFromQueueAndAbort(job: Job<object | unknown>) {
    if (this.runningJobs[job.type] === job) {
      this.runningJobs[job.type] = undefined
      this.handleQueueUpdated(job.type)
    } else {
      this.queues[job.type] = this.queues[job.type].filter((qj) => qj !== job)
    }
    job.abort()
  }
}

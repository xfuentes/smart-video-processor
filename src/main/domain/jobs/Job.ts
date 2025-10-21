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

import { v4 as UUIDv4 } from 'uuid'
import { JobManager } from './JobManager'
import { Processes } from '../../util/processes'
import { Strings } from '../../../common/Strings'
import { currentSettings, defaultSettings } from '../Settings'
import { debug } from '../../util/log'
import { ProcessesPriority, Progression } from '../../../common/@types/processes'
import { IJob, JobStatus, JobType } from '../../../common/@types/Job'
import { isDeepStrictEqual } from 'node:util'

export type JobChangeListener = (job: Job<object | unknown>) => void

export abstract class Job<T> implements IJob {
  public readonly uuid: string = UUIDv4()
  public readonly type: JobType
  public readonly title: string
  public status: JobStatus
  public processingOrPaused: boolean = false
  public started: boolean = false
  public finished: boolean = false
  public success: boolean = false
  public failed: boolean = false
  private result?: T
  private error?: string
  private changeListeners: JobChangeListener[] = []
  private progression: Progression = { progress: -1 }
  private startedAt?: number
  private endedAt?: number
  private readonly extraDuration?: number
  private abortLaunched: boolean = false

  protected constructor(type: JobType, title: string, extraDuration?: number) {
    this.type = type
    this.title = title
    this.extraDuration = extraDuration
    this.status = JobStatus.WAITING
    this.setStatus(JobStatus.WAITING)
  }

  addChangeListener(listener: JobChangeListener) {
    this.changeListeners.push(listener)
  }

  removeChangeListener(listener: JobChangeListener) {
    const listeners: JobChangeListener[] = []
    for (const l of this.changeListeners) {
      if (l !== listener) {
        listeners.push(l)
      }
    }
    this.changeListeners = listeners
  }

  emitChangeEvent() {
    this.changeListeners.forEach((listener) => {
      listener(this)
    })
  }

  async execute(): Promise<T> {
    this.started = true
    this.startedAt = Date.now()
    let promise: Promise<T>
    try {
      this.setStatus(this.type)
      this.emitChangeEvent()
      this.progression.progress = undefined
      this.result = await this.executeInternal()
      this.setStatus(JobStatus.SUCCESS)
      this.progression = { progress: -1 }
      promise = Promise.resolve(this.result)
    } catch (error) {
      if (this.abortLaunched || error === 'Aborted') {
        this.setStatus(JobStatus.ABORTED)
      } else {
        this.setStatus(JobStatus.ERROR)
      }
      this.error = (error as Error).message
      if (this.progression?.progress === undefined) {
        this.progression = { progress: -1 }
      }
      promise = Promise.reject(error)
    } finally {
      this.endedAt = Date.now()
      this.emitChangeEvent()
    }
    return promise
  }

  queue(): Promise<T> {
    if (this.status === JobStatus.WAITING) {
      this.setStatus(JobStatus.QUEUED)
      this.emitChangeEvent()
    }
    return JobManager.getInstance().queue(this)
  }

  getResult(): T | undefined {
    return this.result
  }

  getError() {
    return this.error
  }

  getProgression() {
    return this.progression
  }

  setProgression(progression: Progression) {
    if (!this.abortLaunched && !isDeepStrictEqual(progression, this.progression)) {
      this.progression = progression
      this.emitChangeEvent()
    }
  }

  getStatus() {
    return this.status
  }

  getTitle() {
    return this.title
  }

  getDuration() {
    if (this.endedAt !== undefined && this.startedAt !== undefined && this.endedAt > this.startedAt) {
      return (this.endedAt - this.startedAt) / 1000 + (this.extraDuration ?? 0)
    } else {
      return this.extraDuration
    }
  }

  getStatusMessage() {
    const duration = this.getDuration()
    switch (this.status) {
      case JobStatus.QUEUED:
        return `${this.type} queued. Please wait.`
      case JobStatus.SUCCESS:
        if (duration !== undefined) {
          return `Completed in ${Strings.humanDuration(duration)}.`
        }
        return `Complete.`
      case JobStatus.ABORTED:
        if (duration !== undefined) {
          return `Canceled by user after ${Strings.humanDuration(duration)}.`
        }
        return 'Canceled by user.'
      case JobStatus.PAUSED:
        return 'Paused.'
      case JobStatus.ERROR:
        return this.error ?? `Unexpected error during ${this.type}`
      case JobStatus.LOADING:
      case JobStatus.MERGING:
      case JobStatus.ENCODING:
        return this.getTitle()

      default:
        return `Unknown status: ${this.status} for ${this.type}`
    }
  }

  pause() {
    if (this.progression.process) {
      debug('Pause !')
      void Processes.pause(this.progression.process)
      this.status = JobStatus.PAUSED
      this.emitChangeEvent()
    } else {
      debug("Can't Pause no process !")
    }
  }

  resume() {
    if (this.progression.process) {
      debug('Resume !')
      void Processes.resume(this.progression.process)
      this.status = this.type
      this.emitChangeEvent()
    } else {
      debug("Can't Resume no process !")
    }
  }

  abort() {
    if (this.progression.process) {
      debug('Abort !')
      this.progression.process.kill('SIGTERM')
      this.abortLaunched = true
    } else {
      debug("Can't Abort no process !")
    }
  }

  updatePriority() {
    if (this.progression.process?.pid) {
      Processes.setPriority(
        this.progression.process.pid,
        ProcessesPriority[currentSettings.priority ?? defaultSettings.priority]
      )
    }
  }

  protected abstract executeInternal(): Promise<T>

  private setStatus(status: JobStatus): void {
    this.status = status
    this.processingOrPaused =
      this.status === JobStatus.MERGING || this.status === JobStatus.ENCODING || this.status === JobStatus.PAUSED
    this.finished =
      this.status === JobStatus.ABORTED || this.status === JobStatus.ERROR || this.status === JobStatus.SUCCESS
    this.success = this.status === JobStatus.SUCCESS
    this.failed = this.status === JobStatus.ERROR
  }
}

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
import { Processes, ProcessesPriority, Progression } from '../../util/processes'
import { Strings } from '../../util/strings'
import { isEqual } from 'lodash'
import { currentSettings, defaultSettings } from '../Settings'
import { debug } from '../../util/log'

type JobChangeListener = (job: Job<object | unknown>) => void

export enum JobStatus {
  WAITING = 'Waiting',
  QUEUED = 'Queued',
  LOADING = 'Loading',
  ENCODING = 'Encoding',
  MERGING = 'Merging',
  SUCCESS = 'Success',
  WARNING = 'Warning',
  ERROR = 'Error',
  ABORTED = 'Aborted',
  PAUSED = 'Paused'
}

export type JobType = JobStatus.LOADING | JobStatus.ENCODING | JobStatus.MERGING

export abstract class Job<T> {
  public readonly uuid: string = UUIDv4()
  public readonly type: JobType
  public readonly title: string
  private status: JobStatus
  private result?: T
  private error?: string
  private changeListeners: JobChangeListener[] = []
  private progression: Progression = { progress: -1 }
  private startedAt?: number
  private endedAt?: number
  private readonly extraDuration?: number

  protected constructor(type: JobType, title: string, extraDuration?: number) {
    this.type = type
    this.status = JobStatus.WAITING
    this.title = title
    this.extraDuration = extraDuration
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
    this.startedAt = Date.now()
    let promise
    try {
      this.status = this.type
      this.emitChangeEvent()
      this.progression.progress = undefined
      this.result = await this.executeInternal()
      this.status = JobStatus.SUCCESS
      this.progression = { progress: -1 }
      promise = Promise.resolve(this.result)
    } catch (error) {
      if (error === 'Aborted') {
        this.status = JobStatus.ABORTED
      } else {
        this.status = JobStatus.ERROR
      }
      this.error = error as string
      promise = Promise.reject(this.error)
    } finally {
      this.endedAt = Date.now()
      this.emitChangeEvent()
    }
    return promise
  }

  queue(): Promise<T> {
    this.status = JobStatus.QUEUED
    this.emitChangeEvent()
    return JobManager.getInstance().queue(this)
  }

  isStarted() {
    return this.status !== JobStatus.WAITING
  }

  isFinished() {
    switch (this.status) {
      case JobStatus.ABORTED:
      case JobStatus.ERROR:
      case JobStatus.SUCCESS:
        return true
      default:
        return false
    }
  }

  isSuccess() {
    return this.status === JobStatus.SUCCESS
  }

  isError() {
    return this.status === JobStatus.ERROR
  }

  isProcessing() {
    return (
      this.status === JobStatus.MERGING ||
      this.status === JobStatus.ENCODING ||
      this.status === JobStatus.PAUSED
    )
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
    if (!isEqual(progression, this.progression)) {
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
    if (
      this.endedAt !== undefined &&
      this.startedAt !== undefined &&
      this.endedAt > this.startedAt
    ) {
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
          return `Aborted after ${Strings.humanDuration(duration)}.`
        }
        return 'Aborted.'
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
      Processes.pause(this.progression.process)
      this.status = JobStatus.PAUSED
      this.emitChangeEvent()
    } else {
      debug("Can't Pause no process !")
    }
  }

  resume() {
    if (this.progression.process) {
      debug('Resume !')
      Processes.resume(this.progression.process)
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
}

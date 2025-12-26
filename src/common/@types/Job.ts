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

export enum JobStatus {
  WAITING = 'Waiting',
  QUEUED = 'Queued',
  LOADING = 'Loading',
  GRABBING = 'Grabbing',
  ENCODING = 'Encoding',
  MERGING = 'Merging',
  SUCCESS = 'Success',
  WARNING = 'Warning',
  ERROR = 'Error',
  ABORTED = 'Aborted',
  PAUSED = 'Paused'
}

export type JobType = JobStatus.LOADING | JobStatus.ENCODING | JobStatus.MERGING | JobStatus.GRABBING

export interface IJob {
  readonly uuid: string
  readonly type: JobType
  readonly title: string
  status?: JobStatus
  processingOrPaused: boolean
  started: boolean
  finished: boolean
  success: boolean
  failed: boolean
}

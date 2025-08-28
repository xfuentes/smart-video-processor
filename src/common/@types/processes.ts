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

import { ChildProcess } from 'node:child_process'

interface Dict<T> {
  [key: string]: T | undefined
}

interface ProcessEnv extends Dict<string> {
  /**
   * Can be used to change the default timezone at runtime
   */
  TZ?: string
}

export type Progression = {
  /**
   * Float between 0 and 1, -1 means stopped, undefined means indeterminate.
   */
  progress: number | undefined
  /**
   * The current speed in float number of times compared to normal playback speed.
   */
  xSpeed?: number
  /**
   * Estimated number of seconds until completion.
   */
  countdown?: number
  /**
   * Current pass if using multi pass encoding.
   */
  pass?: number
  /**
   * The current process to allow controlling it.
   */
  process?: ChildProcess
}
export type ProgressNotifier = (progression: Progression) => void

export enum ProcessesPriority {
  LOW = 'Low',
  BELOW_NORMAL = 'Below Normal',
  NORMAL = 'Normal',
  ABOVE_NORMAL = 'Above Normal',
  HIGH = 'High'
}

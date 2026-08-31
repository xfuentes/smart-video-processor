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

import { exec } from 'node:child_process'
import { error } from './log'

export const SHUTDOWN_DELAY_SECONDS = 0

export const getShutdownCommand = (platform: string = process.platform): string => {
  switch (platform) {
    case 'win32':
      return `shutdown /s /t ${SHUTDOWN_DELAY_SECONDS}`
    case 'darwin':
      return 'osascript -e \'tell application "System Events" to shut down\''
    default:
      return 'shutdown -h now'
  }
}

export const shutdownComputer = (platform: string = process.platform): void => {
  const command = getShutdownCommand(platform)
  exec(command, (err) => {
    if (err) {
      error('log.shutdown.failed', { defaultValue: 'Failed to shut down the computer: {detail}', detail: String(err) })
    }
  })
}

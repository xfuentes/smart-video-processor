/*
 * Smart Video Processor
 * Copyright (c) 2026. Xavier Fuentes <xfuentes-dev@serviam.cc>
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

import { BrowserWindow } from 'electron'
import { LogEntry, LogLevel } from '../../common/@types/Log'

const MAX_LOGS = 10000
const logs: LogEntry[] = []

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 8)
}

export function getLogs(): LogEntry[] {
  return [...logs]
}

function log(level: LogLevel, key: string, options?: Record<string, unknown>): void {
  const entry = { level, key, options, timestamp: formatTime(new Date()) }
  logs.push(entry)
  if (logs.length > MAX_LOGS) {
    logs.shift()
  }
  if (BrowserWindow) {
    BrowserWindow.getAllWindows().forEach((win) => win.webContents.send('main:logAdded', entry))
  }
}

export function debug(key: string, options?: Record<string, unknown>): void {
  log('debug', key, options)
}

export function info(key: string, options?: Record<string, unknown>): void {
  log('info', key, options)
}

export function warning(key: string, options?: Record<string, unknown>): void {
  log('warning', key, options)
}

export function error(key: string, options?: Record<string, unknown>): void {
  log('error', key, options)
}

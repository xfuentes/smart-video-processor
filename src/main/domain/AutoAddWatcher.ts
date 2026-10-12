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

import { FSWatcher, watch } from 'chokidar'
import { extname } from 'node:path'
import { Settings } from '../../common/@types/Settings'
import { VideoController } from '../controller/VideoController'
import { VIDEO_EXTENSIONS } from '../util/videoExtensions'
import { error } from '../util/log'

const FLUSH_DELAY_MS = 3000

export class AutoAddWatcher {
  private static instance: AutoAddWatcher
  private watcher: FSWatcher | null = null
  private watchedPath: string | null = null
  private pendingFiles = new Set<string>()
  private flushTimer: NodeJS.Timeout | null = null

  static getInstance() {
    if (!AutoAddWatcher.instance) {
      AutoAddWatcher.instance = new AutoAddWatcher()
    }
    return AutoAddWatcher.instance
  }

  settingsUpdated(settings: Settings) {
    const shouldWatch = settings.isAutoAddEnabled && settings.autoAddPath.trim() !== ''
    if (!shouldWatch) {
      void this.stop()
      return
    }
    if (this.watchedPath === settings.autoAddPath) {
      return
    }
    void this.start(settings.autoAddPath)
  }

  private async start(path: string) {
    await this.stop()
    this.watchedPath = path
    this.watcher = watch(path, {
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 5000,
        pollInterval: 1000
      }
    })
    this.watcher.on('add', (filePath) => {
      if (VIDEO_EXTENSIONS.has(extname(filePath).toLowerCase())) {
        this.pendingFiles.add(filePath)
        this.scheduleFlush()
      }
    })
    this.watcher.on('error', (err) => {
      error('log.auto_add.watch_error', { defaultValue: 'Auto add folder watch error: {error}', error: String(err) })
    })
  }

  // Files detected close together are added as a batch so they get sorted.
  private scheduleFlush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
    }
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null
      const files = [...this.pendingFiles]
      this.pendingFiles.clear()
      void VideoController.getInstance().openFiles(files)
    }, FLUSH_DELAY_MS)
  }

  async stop() {
    this.watchedPath = null
    if (this.flushTimer) {
      clearTimeout(this.flushTimer)
      this.flushTimer = null
    }
    this.pendingFiles.clear()
    if (this.watcher) {
      const watcher = this.watcher
      this.watcher = null
      await watcher.close()
    }
  }
}

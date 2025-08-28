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

import { Settings } from '../../common/@types/Settings'
import { ElectronAPI } from '@electron-toolkit/preload'
import { IVideo } from '../../common/@types/Video'

export type FilesChangedListener = (value: IVideo[]) => void

interface SvpAPI {
  main: {
    version: string
    getCurrentSettings: () => Promise<Settings>
    saveSettings: (settings: Settings) => Promise<Settings>
  }
  video: {
    openFileExplorer: () => Promise<void>
    openFiles: (files: File[]) => Promise<void>
    addFilesChangedListener: (callback: FilesChangedListener) => Promise<void>
    removeFilesChangedListener: (callback: FilesChangedListener) => Promise<void>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: SvpAPI
  }
}

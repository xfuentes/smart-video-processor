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
import { IVideo, SearchBy, SearchInputData, VideoType } from '../../common/@types/Video'
import { EditionType } from '../../common/@types/Movie'
import { EpisodeOrder } from '../../main/domain/clients/TVDBClient'
import { ChangeProperty, ChangePropertyValue, ChangeType } from '../../common/Change'
import { FormValidation } from '../../common/FormValidation'
import { IProcess } from '../../common/Process'
import { ipcRenderer } from 'electron/renderer'

export type InvalidSettingsListener = (validation: FormValidation<Settings>) => void
export type ListChangedListener = (value: IVideo[]) => void
export type VideoChangedListener = (value: IVideo) => void

interface SvpAPI {
  main: {
    version: string
    ffmpegVersion: string
    mkvmergeVersion: string
    fluentUIVersion: string
    viteVersion: string
    getCurrentSettings: () => Promise<FormValidation<Settings>>
    saveSettings: (settings: Settings) => Promise<FormValidation<Settings>>
    addInvalidSettingsListener: (callback: InvalidSettingsListener) => Promise<void>
    switchPaused: () => Promise<boolean>
    openSingleFileExplorer: (title: string, defaultPath?: string) => Promise<string>
  }
  video: {
    openFileExplorer: () => Promise<void>
    openFiles: (files: File[]) => Promise<void>
    addListChangedListener: (callback: ListChangedListener) => () => void
    addVideoChangedListener: (callback: VideoChangedListener) => () => void
    selectSearchResultID: (uuid: string, searchResultID?: number) => Promise<void>
    search: (uuid: string, data: SearchInputData) => Promise<void>
    switchTrackSelection: (uuid: string, changedItems: number[]) => Promise<void>
    setHint: (uuid: string, hint: IHint, value?: string) => Promise<void>
    addChange: (
      uuid: string,
      source: string,
      changeType: ChangeType,
      property?: ChangeProperty,
      newValue?: ChangePropertyValue
    ) => Promise<string>
    saveChange: (
      uuid: string,
      changeUuid: string,
      source: string,
      changeType: ChangeType,
      property?: ChangeProperty,
      newValue?: ChangePropertyValue
    ) => Promise<void>
    deleteChange: (uuid: string, changeUuid: string) => Promise<void>
    setTrackEncodingEnabled: (uuid: string, source: string, value: boolean) => Promise<void>
    addPart: (uuid: string) => Promise<void>
    process: (uuid: string) => Promise<void>
    abortJob: (uuid: string) => Promise<void>
    remove: (videoUuidList: string[]) => Promise<void>
    clearCompleted: () => Promise<void>
    setStartFrom: (uuid: string, value: string) => Promise<void>
    setEndAt: (uuid: string, value: string) => Promise<void>
    takeSnapshots: (uuid: string, snapshotHeight: number, snapshotWidth: number, totalWidth: number) => Promise<string>
    preparePreview: (uuid: string) => Promise<string>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: SvpAPI
  }
}

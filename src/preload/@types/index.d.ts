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
import { IVideo, SearchBy, VideoType } from '../../common/@types/Video'
import { EditionType } from '../../common/@types/Movie'
import { EpisodeOrder } from '../../main/domain/clients/TVDBClient'
import { Hint } from '../../main/domain/Hint'
import { ChangeProperty, ChangePropertyValue, ChangeType } from '../../common/Change'
import { FormValidation } from '../../common/FormValidation'
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
    setType: (uuid: string, videoType: VideoType) => Promise<void>
    setSearchBy: (uuid: string, searchBy: SearchBy) => Promise<void>
    selectSearchResultID: (uuid: string, searchResultID?: number) => Promise<void>
    search: (uuid: string) => Promise<void>
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
    process: (uuid: string) => Promise<void>
    abortJob: (uuid: string) => Promise<void>
    remove: (videoUuidList: string[]) => Promise<void>
    clearCompleted: () => Promise<void>
    movie: {
      setTitle: (uuid: string, title: string) => Promise<void>
      setYear: (uuid: string, year: string) => Promise<void>
      setIMDB: (uuid: string, imdb: string) => Promise<void>
      setTMDB: (uuid: string, tmdb: number | string | undefined) => Promise<void>
      setEdition: (uuid: string, edition: EditionType) => Promise<void>
    }
    tvShow: {
      setTitle: (uuid: string, title: string) => Promise<void>
      setYear: (uuid: string, year: string) => Promise<void>
      setIMDB: (uuid: string, imdb: string) => Promise<void>
      setTheTVDB: (uuid: string, tvdb: number | string | undefined) => Promise<void>
      setOrder: (uuid: string, order: EpisodeOrder) => Promise<void>
      setSeason: (uuid: string, newSeason: string) => Promise<void>
      setEpisode: (uuid: string, newEpisode: string) => Promise<void>
      setAbsoluteEpisode: (uuid: string, newAbsoluteEpisode: string) => Promise<void>
    }
    other: {
      setTitle: (uuid: string, title: string) => Promise<void>
      setYear: (uuid: string, year: string) => Promise<void>
      setMonth: (uuid: string, month: string) => Promise<void>
      setDay: (uuid: string, day: string) => Promise<void>
      setPosterPath: (uuid: string, posterPath: string) => Promise<void>
      setOriginalLanguage: (uuid: string, originalLanguageCode: string) => Promise<void>
    }
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: SvpAPI
  }
}

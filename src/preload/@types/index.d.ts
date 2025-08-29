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
    setType: (uuid: string, videoType: VideoType) => Promise<void>
    setSearchBy: (uuid: string, videoType: SearchBy) => Promise<void>
    selectSearchResultID: (uuid: string, searchResultID?: number) => Promise<void>
    search: (uuid: string) => Promise<void>
    switchTrackSelection: (uuid: string, changedItems: number[]) => Promise<void>
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
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: SvpAPI
  }
}

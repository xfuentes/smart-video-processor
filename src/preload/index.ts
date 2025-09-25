import { contextBridge, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ipcRenderer } from 'electron/renderer'
import { Settings } from '../common/@types/Settings'
import { IVideo, SearchBy, VideoType } from '../common/@types/Video'
import { EditionType } from '../common/@types/Movie'
import { EpisodeOrder } from '../main/domain/clients/TVDBClient'
import { IHint } from '../common/@types/Hint'
import { ChangeProperty, ChangePropertyValue, ChangeType } from '../common/Change'
import { FormValidation } from '../common/FormValidation'
import { FilesChangedListener, InvalidSettingsListener } from './@types'

const version = await ipcRenderer.invoke('main:getVersion')

// Custom APIs for renderer
const api = {
  main: {
    ...version,
    getCurrentSettings: (): Promise<FormValidation<Settings>> => ipcRenderer.invoke('main:getCurrentSettings'),
    saveSettings: (settings: Settings): Promise<FormValidation<Settings>> =>
      ipcRenderer.invoke('main:saveSettings', settings),
    addInvalidSettingsListener: (callback: InvalidSettingsListener) =>
      ipcRenderer.on('main:invalidSettings', (_event, jsonValue: string) => callback(JSON.parse(jsonValue))),
    switchPaused: (): Promise<boolean> => ipcRenderer.invoke('main:switchPaused'),
    openSingleFileExplorer: (title: string, defaultPath?: string): Promise<string> =>
      ipcRenderer.invoke('main:openSingleFileExplorer', title, defaultPath)
  },
  video: {
    openFileExplorer: () => ipcRenderer.invoke('video:openFileExplorer'),
    openFiles: (files: File[]) => {
      const filePaths = files.map((f) => webUtils.getPathForFile(f))
      return ipcRenderer.invoke('video:openFiles', filePaths)
    },
    addFilesChangedListener: (callback: FilesChangedListener) =>
      ipcRenderer.on('video:filesChanged', (_event, jsonValue: string) => callback(JSON.parse(jsonValue))),
    removeFilesChangedListener: (callback: FilesChangedListener) =>
      ipcRenderer.off('video:filesChanged', (_event, value: IVideo[]) => callback(value)),
    setType: (uuid: string, videoType: VideoType): Promise<void> =>
      ipcRenderer.invoke('video:setType', uuid, videoType),
    setSearchBy: (uuid: string, videoType: SearchBy): Promise<void> =>
      ipcRenderer.invoke('video:setSearchBy', uuid, videoType),
    selectSearchResultID: (uuid: string, searchResultID?: number): Promise<void> =>
      ipcRenderer.invoke('video:selectSearchResultID', uuid, searchResultID),
    search: (uuid: string): Promise<void> => ipcRenderer.invoke('video:search', uuid),
    switchTrackSelection: (uuid: string, changedItems: number[]): Promise<void> =>
      ipcRenderer.invoke('video:switchTrackSelection', uuid, changedItems),
    setHint: (uuid: string, hint: IHint, value?: string): Promise<void> =>
      ipcRenderer.invoke('video:setHint', uuid, hint, value),
    addChange: (
      uuid: string,
      source: string,
      changeType: ChangeType,
      property?: ChangeProperty,
      newValue?: ChangePropertyValue
    ): Promise<void> => ipcRenderer.invoke('video:addChange', uuid, source, changeType, property, newValue),
    saveChange: (
      uuid: string,
      changeUuid: string,
      source: string,
      changeType: ChangeType,
      property?: ChangeProperty,
      newValue?: ChangePropertyValue
    ): Promise<void> =>
      ipcRenderer.invoke('video:saveChange', uuid, changeUuid, source, changeType, property, newValue),
    deleteChange: (uuid: string, changeUuid: string): Promise<void> =>
      ipcRenderer.invoke('video:deleteChange', uuid, changeUuid),
    setTrackEncodingEnabled: (uuid: string, source: string, value: boolean): Promise<void> =>
      ipcRenderer.invoke('video:setTrackEncodingEnabled', uuid, source, value),
    process: (uuid: string): Promise<void> => ipcRenderer.invoke('video:process', uuid),
    abortJob: (uuid: string): Promise<void> => ipcRenderer.invoke('video:abortJob', uuid),
    remove: (videoUuidList: string[]): Promise<void> => ipcRenderer.invoke('video:remove', videoUuidList),
    clearCompleted: (): Promise<void> => ipcRenderer.invoke('video:clearCompleted'),
    movie: {
      setTitle: (uuid: string, title: string): Promise<void> => ipcRenderer.invoke('video.movie:setTitle', uuid, title),
      setYear: (uuid: string, year: string): Promise<void> => ipcRenderer.invoke('video.movie:setYear', uuid, year),
      setIMDB: (uuid: string, imdb: string): Promise<void> => ipcRenderer.invoke('video.movie:setIMDB', uuid, imdb),
      setTMDB: (uuid: string, tmdb: number | string | undefined): Promise<void> =>
        ipcRenderer.invoke('video.movie:setTMDB', uuid, tmdb),
      setEdition: (uuid: string, edition: EditionType): Promise<void> =>
        ipcRenderer.invoke('video.movie:setEdition', uuid, edition)
    },
    tvShow: {
      setTitle: (uuid: string, title: string): Promise<void> =>
        ipcRenderer.invoke('video.tvShow:setTitle', uuid, title),
      setYear: (uuid: string, year: string): Promise<void> => ipcRenderer.invoke('video.tvShow:setYear', uuid, year),
      setIMDB: (uuid: string, imdb: string): Promise<void> => ipcRenderer.invoke('video.tvShow:setIMDB', uuid, imdb),
      setTheTVDB: (uuid: string, tvdb: number | string | undefined): Promise<void> =>
        ipcRenderer.invoke('video.tvShow:setTheTVDB', uuid, tvdb),
      setOrder: (uuid: string, order: EpisodeOrder): Promise<void> =>
        ipcRenderer.invoke('video.tvShow:setOrder', uuid, order),
      setSeason: (uuid: string, newSeason: string): Promise<void> =>
        ipcRenderer.invoke('video.tvShow:setSeason', uuid, newSeason),
      setEpisode: (uuid: string, newEpisode: string): Promise<void> =>
        ipcRenderer.invoke('video.tvShow:setEpisode', uuid, newEpisode),
      setAbsoluteEpisode: (uuid: string, newAbsoluteEpisode: string): Promise<void> =>
        ipcRenderer.invoke('video.tvShow:setAbsoluteEpisode', uuid, newAbsoluteEpisode)
    },
    other: {
      setTitle: (uuid: string, title: string): Promise<void> => ipcRenderer.invoke('video.other:setTitle', uuid, title),
      setYear: (uuid: string, year: string): Promise<void> => ipcRenderer.invoke('video.other:setYear', uuid, year),
      setMonth: (uuid: string, month: string): Promise<void> => ipcRenderer.invoke('video.other:setMonth', uuid, month),
      setDay: (uuid: string, day: string): Promise<void> => ipcRenderer.invoke('video.other:setDay', uuid, day),
      setPosterPath: (uuid: string, posterPath: string): Promise<void> =>
        ipcRenderer.invoke('video.other:setPosterPath', uuid, posterPath),
      setOriginalLanguage: (uuid: string, originalLanguageCode: string): Promise<void> =>
        ipcRenderer.invoke('video.other:setOriginalLanguage', uuid, originalLanguageCode)
    }
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  console.log('isolated')
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

import { contextBridge, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ipcRenderer } from 'electron/renderer'
import { Settings } from '../common/@types/Settings'
import { IVideo, MultiSearchInputData, SearchInputData } from '../common/@types/Video'
import { IHint } from '../common/@types/Hint'
import { ChangeProperty, ChangePropertyValue, ChangeType } from '../common/Change'
import { FormValidation } from '../common/FormValidation'
import { InvalidSettingsListener, ListChangedListener, SvpAPI, VideoChangedListener } from './@types'
import IpcRendererEvent = Electron.IpcRendererEvent

const version = await ipcRenderer.invoke('main:getVersion')
const installationStatus = await ipcRenderer.invoke('main:getInstallationStatus')

// Custom APIs for renderer
const api: SvpAPI = {
  main: {
    ...version,
    ...installationStatus,
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
    addListChangedListener: (callback: ListChangedListener) => {
      const subscriber = (_event: IpcRendererEvent, videos: IVideo[]) => callback(videos)
      ipcRenderer.on('video:listChanged', subscriber)
      return () => {
        ipcRenderer.off('video:listChanged', subscriber)
      }
    },
    addVideoChangedListener: (callback: VideoChangedListener) => {
      const subscriber = (_event: IpcRendererEvent, video: IVideo) => callback(video)
      ipcRenderer.on('video:changed', subscriber)
      return () => {
        ipcRenderer.off('video:changed', subscriber)
      }
    },
    selectSearchResultID: (uuid: string, searchResultID?: number): Promise<void> =>
      ipcRenderer.invoke('video:selectSearchResultID', uuid, searchResultID),
    search: (uuid: string, data: SearchInputData): Promise<void> => ipcRenderer.invoke('video:search', uuid, data),
    multiSelectSearchResultID: (uuids: string[], searchResultID?: number): Promise<void> =>
      ipcRenderer.invoke('video:multiSelectSearchResultID', uuids, searchResultID),
    multiSearch: (uuids: string[], data: MultiSearchInputData): Promise<void> =>
      ipcRenderer.invoke('video:multiSearch', uuids, data),
    setMultiHint: (uuids: string[], hint: IHint, value?: string): Promise<void> =>
      ipcRenderer.invoke('video:setMultiHint', uuids, hint, value),
    switchTrackSelection: (uuid: string, changedItems: number[]): Promise<void> =>
      ipcRenderer.invoke('video:switchTrackSelection', uuid, changedItems),
    setHint: (uuid: string, hint: IHint, value?: string): Promise<void> =>
      ipcRenderer.invoke('video:setHint', uuid, hint, value),
    setMultiTrackEncodingEnabled: (uuids: string[], source: string, value: boolean): Promise<void> =>
      ipcRenderer.invoke('video:setMultiTrackEncodingEnabled', uuids, source, value),
    multiProcess: (uuids: string[]): Promise<void> => ipcRenderer.invoke('video:multiProcess', uuids),
    addChange: (
      uuid: string,
      source: string,
      changeType: ChangeType,
      property?: ChangeProperty,
      newValue?: ChangePropertyValue
    ): Promise<string> => ipcRenderer.invoke('video:addChange', uuid, source, changeType, property, newValue),
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
    addParts: (uuid: string, files: File[]): Promise<void> => {
      const filePaths = files.map((f) => webUtils.getPathForFile(f))
      return ipcRenderer.invoke('video:addParts', uuid, filePaths)
    },
    addPart: (uuid: string): Promise<void> => ipcRenderer.invoke('video:addPart', uuid),
    removePart: (uuid: string, partUuid: string): Promise<void> =>
      ipcRenderer.invoke('video:removePart', uuid, partUuid),
    setStartFrom: (uuid: string, value?: number): Promise<void> =>
      ipcRenderer.invoke('video:setStartFrom', uuid, value),
    setEndAt: (uuid: string, value?: number): Promise<void> => ipcRenderer.invoke('video:setEndAt', uuid, value),
    process: (uuid: string): Promise<void> => ipcRenderer.invoke('video:process', uuid),
    abortJob: (uuid: string): Promise<void> => ipcRenderer.invoke('video:abortJob', uuid),
    remove: (videoUuidList: string[]): Promise<void> => ipcRenderer.invoke('video:remove', videoUuidList),
    clearCompleted: (): Promise<void> => ipcRenderer.invoke('video:clearCompleted'),
    takeSnapshots: (uuid: string): Promise<string> => ipcRenderer.invoke('video:takeSnapshots', uuid),
    preparePreview: (uuid: string): Promise<string> => ipcRenderer.invoke('video:preparePreview', uuid)
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

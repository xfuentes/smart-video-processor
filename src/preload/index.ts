import { webUtils, contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { ipcRenderer } from 'electron/renderer'
import { Settings } from '../common/@types/Settings'
import { IVideo } from '../common/@types/Video'

const version = await ipcRenderer.invoke('main:getVersion')

// Custom APIs for renderer
const api = {
  main: {
    version,
    getCurrentSettings: (): Promise<Settings> => ipcRenderer.invoke('main:getCurrentSettings'),
    saveSettings: (settings: Settings): Promise<Settings> => ipcRenderer.invoke('main:saveSettings', settings)
  },
  video: {
    openFileExplorer: () => ipcRenderer.invoke('video:openFileExplorer'),
    openFiles: (files: File[]) => {
      const filePaths = files.map((f) => webUtils.getPathForFile(f))
      return ipcRenderer.invoke('video:openFiles', filePaths)
    },
    addFilesChangedListener: (callback: (value: IVideo[]) => void) =>
      ipcRenderer.on('video:filesChanged', (_event, jsonValue: string) => callback(JSON.parse(jsonValue))),
    removeFilesChangedListener: (callback: (value: IVideo[]) => void) =>
      ipcRenderer.off('video:filesChanged', (_event, value: IVideo[]) => callback(value))
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

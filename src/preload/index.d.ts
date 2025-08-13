import { ElectronAPI } from '@electron-toolkit/preload'

interface SvpAPI {
  version: () => Promise<string>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: SvpAPI
  }
}

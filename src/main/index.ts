/*
 * Smart Video Processor
 * Copyright (c) 2025-2026. Xavier Fuentes <xfuentes-dev@hotmail.com>
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

import { app, BrowserWindow, dialog, ipcMain, net, protocol, shell } from 'electron'
import { extname, join } from 'path'
import fs from 'node:fs'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.ico?asset'
import { currentSettings, defaultSettings, loadSettings, saveSettings, validateSettings } from './domain/Settings'
import { VideoController } from './controller/VideoController'
import { JobManager } from './domain/jobs/JobManager'
import { getUwpActivationFiles } from './uwpActivation'
import { Settings } from '../common/@types/Settings'
import { initVideoControllerIPC } from './VideoControllerIPC'

import electron_squirrel_startup from 'electron-squirrel-startup'
import { FormValidation } from '../common/FormValidation'
import { mainBindings } from 'i18next-electron-fs-backend'
import { updateElectronApp } from 'update-electron-app'
import { FFmpeg } from './domain/programs/FFmpeg'
import { MKVMerge } from './domain/programs/MKVMerge'
import packageJSON from '../../package.json' with { type: 'json' }
import * as os from 'node:os'
import { Processes } from './util/processes'
import { shutdownComputer } from './util/shutdown'

if (electron_squirrel_startup) app.quit()

const VIDEO_EXTENSIONS = new Set([
  '.mkv',
  '.mp4',
  '.m4v',
  '.avi',
  '.mov',
  '.qt',
  '.webm',
  '.flv',
  '.wmv',
  '.asf',
  '.mpg',
  '.mpeg',
  '.ts',
  '.m2ts',
  '.mts',
  '.vob',
  '.ogv',
  '.3gp',
  '.rm',
  '.rmvb'
])

function getCommandLineVideoFiles(argv: string[] = process.argv): string[] {
  return argv
    .slice(1)
    .filter((arg) => !arg.startsWith('-'))
    .filter((arg) => VIDEO_EXTENSIONS.has(extname(arg).toLowerCase()))
    .filter((arg) => {
      try {
        return fs.existsSync(arg) && fs.statSync(arg).isFile()
      } catch {
        return false
      }
    })
}

let mainWindow: BrowserWindow | null = null
const pendingVideoFiles: string[] = []

function flushPendingVideoFiles() {
  if (!mainWindow || mainWindow.webContents.isLoading() || pendingVideoFiles.length === 0) {
    return
  }
  const filesToOpen = [...pendingVideoFiles]
  pendingVideoFiles.length = 0
  void VideoController.getInstance().openFiles(filesToOpen)
}

function addCommandLineVideoFiles(argv: string[] = process.argv) {
  const files = getCommandLineVideoFiles(argv)
  if (files.length > 0) {
    pendingVideoFiles.push(...files)
    flushPendingVideoFiles()
  }
}

function addUwpActivationFiles() {
  if (process.platform !== 'win32' || !process.windowsStore) {
    return
  }
  try {
    const uwpArguments = getUwpActivationFiles()
    const files = getCommandLineVideoFiles(['uwp-activation', ...uwpArguments])
    if (files.length > 0) {
      pendingVideoFiles.push(...files)
      flushPendingVideoFiles()
    }
  } catch {
    /* UWP activation data is unavailable or the native module is missing */
  }
}

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, commandLine) => {
    addCommandLineVideoFiles(commandLine)
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore()
      }
      mainWindow.focus()
    }
  })
}

if (os.platform() === 'win32' && !process.windowsStore) {
  updateElectronApp()
}

function createWindow(): BrowserWindow {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform !== 'darwin' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      sandbox: false
    }
  })
  mainWindow.on('ready-to-show', () => {
    mainWindow.setMinimumSize(925, 568)
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    void shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.webContents.on('did-finish-load', () => {
    flushPendingVideoFiles()
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local HTML file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    void mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  return mainWindow
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'svp',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      bypassCSP: true
    }
  },
  {
    scheme: 'svp-stream',
    privileges: {
      secure: true,
      supportFetchAPI: true,
      stream: true,
      bypassCSP: true
    }
  }
])

app.whenReady().then(async () => {
  // For the packaged MSIX build, let Windows derive the package AUMID
  // (PackageFamilyName!ApplicationId) so that pinned taskbar icons group
  // with the running window. For other Windows builds, use the explicit id.
  const isMsix =
    process.platform === 'win32' &&
    (process.windowsStore || process.execPath.toLowerCase().includes('\\windowsapps\\'))
  if (!isMsix) {
    electronApp.setAppUserModelId('XavierFuentes.SmartVideoProcessor')
  }

  loadSettings()

  let ffmpegVersion = '-'
  let mkvmergeVersion = '-'
  try {
    ffmpegVersion = await FFmpeg.getInstance().getVersion()
  } catch (_err) {
    /* error will be shown in settings */
  }

  try {
    mkvmergeVersion = await MKVMerge.getInstance().getVersion()
  } catch (_err) {
    /* error will be shown in settings */
  }

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  mainWindow = createWindow()
  mainWindow.removeMenu()

  protocol.handle('svp', async (req) => {
    const filePath = new URL(req.url).pathname
    try {
      return await net.fetch(`file://${filePath}`)
    } catch (error) {
      console.error(`Unable to fetch '${filePath}':${error}`)
      throw error
    }
  })
  protocol.handle('svp-stream', async (req) => {
    const filePath = new URL(req.url).pathname
    try {
      return await net.fetch(`file://${filePath}`)
    } catch (error) {
      console.error(`Unable to fetch '${filePath}':${error}`)
      throw error
    }
  })
  ipcMain.handle('main:getVersion', async () => {
    return {
      version: `${app.getVersion()}`,
      development: !app.isPackaged,
      ffmpegVersion: ffmpegVersion,
      mkvmergeVersion: mkvmergeVersion,
      fluentUIVersion: packageJSON.devDependencies['@fluentui/react-components'].replace(/^\^/, ''),
      viteVersion: packageJSON.devDependencies['vite'].replace(/^\^/, '')
    }
  })
  ipcMain.handle('main:getInstallationStatus', async () => {
    return {
      isLimitedPermissions: Processes.isLimitedPermissions(),
      hasRemovableMediaAccess: Processes.hasRemovableMediaAccess()
    }
  })
  ipcMain.handle('main:getCurrentSettings', () => {
    try {
      return validateSettings(currentSettings)
    } catch {
      return defaultSettings
    }
  })
  ipcMain.handle('main:getLocaleBasePath', () => {
    try {
      return join(app.getAppPath(), 'locales')
    } catch {
      return ''
    }
  })
  ipcMain.handle('main:getLicenseText', (_event, language: string): string => {
    const localePath = join(app.getAppPath(), 'locales')
    const aliases: Record<string, string[]> = { zh: ['zh-cn'], pt: ['pt-br'], no: ['nn'] }
    const code = (language || 'en').toLowerCase()
    const candidates = new Set<string>([code])
    for (const alias of aliases[code] || []) {
      candidates.add(alias)
    }
    candidates.add('en')
    for (const candidate of candidates) {
      const filePath = join(localePath, 'licenses', `gpl-3.0-${candidate}.html`)
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, 'utf8')
      }
    }
    return ''
  })
  ipcMain.handle('main:saveSettings', async (_event, settings: Settings): Promise<FormValidation<Settings>> => {
    const priorityUpdated = currentSettings.priority !== settings.priority
    const encoderSettingsUpdated =
      currentSettings.isTrackEncodingEnabled !== settings.isTrackEncodingEnabled ||
      currentSettings.videoCodec !== settings.videoCodec ||
      currentSettings.videoSizeReduction !== settings.videoSizeReduction ||
      currentSettings.videoEnforceCodec !== settings.videoEnforceCodec ||
      currentSettings.audioSizeReduction !== settings.audioSizeReduction ||
      currentSettings.audioEnforceCodec !== settings.audioEnforceCodec

    const validation = saveSettings(settings)
    if (validation.status === 'success') {
      if (priorityUpdated) {
        JobManager.getInstance().updatePriority()
      }
      if (encoderSettingsUpdated) {
        VideoController.getInstance().encoderSettingsUpdated()
      }
    }
    validation.result = currentSettings
    return validation
  })
  ipcMain.handle('main:openSingleFileExplorer', async (_event, title: string, defaultPath?: string) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title,
      defaultPath,
      properties: ['openFile', 'dontAddToRecent']
    })
    if (!result.canceled) {
      return result.filePaths[0]
    }
    return ''
  })
  ipcMain.handle('main:openDirectoryExplorer', async (_event, title: string, defaultPath?: string) => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      title,
      defaultPath,
      properties: ['openDirectory', 'dontAddToRecent']
    })
    if (!result.canceled) {
      return result.filePaths[0]
    }
    return ''
  })
  ipcMain.handle('main:switchPaused', () => JobManager.getInstance().switchPaused())
  ipcMain.handle('main:shutdown', () => shutdownComputer())
  initVideoControllerIPC(mainWindow)
  mainBindings(ipcMain, mainWindow, fs)
  ipcMain.on('video:requestList', () => {
    flushPendingVideoFiles()
    VideoController.getInstance().fireListChangeEvent()
  })

  addCommandLineVideoFiles(process.argv)
  addUwpActivationFiles()

  app.on('activate', function () {
    // On macOS, it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) mainWindow = createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', (_event) => {
  VideoController.getInstance().destroy()
})

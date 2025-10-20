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

import { app, BrowserWindow, dialog, ipcMain, net, protocol, shell } from 'electron'
import { join } from 'path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { currentSettings, loadSettings, saveSettings, validateSettings } from './domain/Settings'
import { VideoController } from './controller/VideoController'
import { JobManager } from './domain/jobs/JobManager'
import { Settings } from '../common/@types/Settings'
import { initVideoControllerIPC } from './VideoControllerIPC'

import electron_squirrel_startup from 'electron-squirrel-startup'
import { FormValidation } from '../common/FormValidation'
import { updateElectronApp } from 'update-electron-app'
import { FFmpeg } from './domain/programs/FFmpeg'
import { MKVMerge } from './domain/programs/MKVMerge'
import packageJSON from '../../package.json' with { type: 'json' }
import * as os from 'node:os'
import { Processes } from './util/processes'

if (electron_squirrel_startup) app.quit()

if (os.platform() !== 'linux') {
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

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
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
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.squirrel.SmartVideoProcessor.SmartVideoProcessor')
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

  const mainWindow = createWindow()
  mainWindow.removeMenu()

  protocol.handle('svp', async (req) => {
    const filePath = new URL(req.url).pathname
    try {
      return await net.fetch(`file://${filePath}`)
    } catch (error) {
      console.error(error)
      throw error
    }
  })
  protocol.handle('svp-stream', async (req) => {
    const filePath = new URL(req.url).pathname
    try {
      return await net.fetch(`file://${filePath}`)
    } catch (error) {
      console.error(error)
      throw error
    }
  })
  ipcMain.handle('main:getVersion', async () => {
    return {
      version: app.getVersion(),
      ffmpegVersion: ffmpegVersion,
      mkvmergeVersion: mkvmergeVersion,
      fluentUIVersion: packageJSON.devDependencies['@fluentui/react-components'].replace(/^\^/, ''),
      viteVersion: packageJSON.devDependencies['vite'].replace(/^\^/, '')
    }
  })
  ipcMain.handle('main:isLimitedPermissions', async () => {
    return Processes.isLimitedPermissions()
  })
  ipcMain.handle('main:getCurrentSettings', () => validateSettings(currentSettings))
  ipcMain.handle('main:saveSettings', async (_event, settings: Settings): Promise<FormValidation<Settings>> => {
    const priorityUpdated = currentSettings.priority !== settings.priority
    const encoderSettingsUpdated =
      currentSettings.isTrackEncodingEnabled !== settings.isTrackEncodingEnabled ||
      currentSettings.videoCodec !== settings.videoCodec ||
      currentSettings.isTestEncodingEnabled !== settings.isTestEncodingEnabled

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
    const result = await dialog.showOpenDialog(mainWindow, {
      title,
      defaultPath,
      properties: ['openFile', 'dontAddToRecent']
    })
    if (!result.canceled) {
      return result.filePaths[0]
    }
    return ''
  })
  ipcMain.handle('main:switchPaused', () => JobManager.getInstance().switchPaused())
  initVideoControllerIPC(mainWindow)

  app.on('activate', function () {
    // On macOS, it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
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

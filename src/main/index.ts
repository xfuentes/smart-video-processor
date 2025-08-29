import { app, BrowserWindow, dialog, ipcMain, net, protocol, shell } from 'electron'
import { join } from 'path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { currentSettings, loadSettings, saveSettings } from './domain/Settings'
import { initializeIcons } from '@uifabric/icons'
import { VideoController } from './controller/VideoController'
import { JobManager } from './domain/jobs/JobManager'
import { Settings } from '../common/@types/Settings'

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
  }
])

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron.svp')

  loadSettings()
  initializeIcons()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const mainWindow = createWindow()

  protocol.handle('svp', (req) => {
    const filePath = new URL(req.url).pathname
    return net.fetch(`file://${filePath}`)
  })

  ipcMain.handle('main:getVersion', () => app.getVersion())
  ipcMain.handle('video:openFileExplorer', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select video files',
      properties: ['openFile', 'multiSelections', 'dontAddToRecent']
    })
    if (!result.canceled) {
      VideoController.getInstance().openFiles(result.filePaths)
    }
  })
  ipcMain.handle('video:openFiles', (_event, filePaths: string[]) => {
    VideoController.getInstance().openFiles(filePaths)
  })
  ipcMain.handle('main:getCurrentSettings', () => currentSettings)
  ipcMain.handle('main:saveSettings', (_event, settings: Settings) => {
    const priorityUpdated = currentSettings.priority !== settings.priority
    const encoderSettingsUpdated =
      currentSettings.isTrackEncodingEnabled !== settings.isTrackEncodingEnabled ||
      currentSettings.videoCodec !== settings.videoCodec ||
      currentSettings.isTestEncodingEnabled !== settings.isTestEncodingEnabled

    saveSettings(settings)
    if (priorityUpdated) {
      JobManager.getInstance().updatePriority()
    }
    if (encoderSettingsUpdated) {
      VideoController.getInstance().encoderSettingsUpdated()
    }
    return currentSettings
  })
  VideoController.getInstance().addChangeListener((videos) => {
    console.log('*** SENDING VIDEOS UPDATES ***')
    console.log(JSON.stringify(videos))
    mainWindow.webContents.send('video:filesChanged', JSON.stringify(videos))
  })

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

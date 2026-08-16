import { BrowserWindow } from 'electron'
import { pathToFileURL } from 'node:url'
import { _ } from './i18n'
import icon from '../../resources/icon.ico?asset'
import iconPng from '../../resources/icon.png?asset'

let cleanupWindow: BrowserWindow | null = null
let cleanupWindowReady = false
let pendingCleanupProgress: { current: number; total: number } | null = null

function getCleanupDialogHtml(iconUrl: string, message: string, progressTemplate: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body { margin: 0; padding: 0 24px; width: 100vw; height: 100vh; display: flex; flex-direction: row; align-items: center; justify-content: flex-start; gap: 24px; background: #202020; color: #ffffff; font-family: system-ui, sans-serif; font-size: 14px; user-select: none; -webkit-app-region: no-drag; box-sizing: border-box; }
#left { display: flex; flex-direction: column; align-items: flex-start; }
#message { margin-bottom: 12px; }
progress { width: 280px; height: 16px; }
#app-icon { width: 64px; height: 64px; border-radius: 8px; }
</style>
</head>
<body>
<img id="app-icon" src="${iconUrl}" alt="${message}">
<div id="left">
  <div id="message"></div>
  <progress id="bar" value="0" max="100"></progress>
</div>
<script>
document.getElementById('message').textContent = ${JSON.stringify(message)};
window.updateProgress = (current, total, percent) => {
  document.getElementById('message').textContent = ${JSON.stringify(progressTemplate)}.replace('{current}', current).replace('{total}', total);
  document.getElementById('bar').value = percent;
}
</script>
</body>
</html>`
}

export function showCleanupDialog() {
  cleanupWindowReady = false
  pendingCleanupProgress = null
  cleanupWindow = new BrowserWindow({
    width: 500,
    height: 120,
    icon,
    show: false,
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    closable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    center: true,
    webPreferences: {
      devTools: false,
      webSecurity: false
    }
  })
  const iconUrl = pathToFileURL(iconPng).toString().replace('file://', 'svp://')
  const message = _('cleanup.message', { defaultValue: 'Cleaning temporary files...' })
  const progressTemplate = _('cleanup.progress', { defaultValue: 'Cleaning temporary files... ({current}/{total})' })
  const html = getCleanupDialogHtml(iconUrl, message, progressTemplate)
  void cleanupWindow.loadURL(`data:text/html;base64,${Buffer.from(html).toString('base64')}`)
  cleanupWindow.webContents.on('did-finish-load', () => {
    cleanupWindowReady = true
    cleanupWindow?.show()
    if (pendingCleanupProgress) {
      updateCleanupProgress(pendingCleanupProgress.current, pendingCleanupProgress.total)
      pendingCleanupProgress = null
    }
  })
}

export function updateCleanupProgress(current: number, total: number) {
  if (!cleanupWindow || cleanupWindow.isDestroyed()) return
  const percent = total > 0 ? Math.round((current / total) * 100) : 0
  if (!cleanupWindowReady) {
    pendingCleanupProgress = { current, total }
    return
  }
  void cleanupWindow.webContents.executeJavaScript(`window.updateProgress(${current}, ${total}, ${percent})`)
}

export function closeCleanupDialog() {
  cleanupWindowReady = false
  pendingCleanupProgress = null
  if (cleanupWindow && !cleanupWindow.isDestroyed()) {
    cleanupWindow.destroy()
  }
  cleanupWindow = null
}

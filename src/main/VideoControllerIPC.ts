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

import { BrowserWindow, dialog, ipcMain } from 'electron'
import { VideoController } from './controller/VideoController'
import { SearchInputData } from '../common/@types/Video'
import { IHint } from '../common/@types/Hint'
import { ChangeProperty, ChangePropertyValue, ChangeType } from '../common/Change'

export const initVideoControllerIPC = (mainWindow: BrowserWindow) => {
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
  VideoController.getInstance().addListChangeListener((videos) => {
    mainWindow.webContents.send('video:listChanged', JSON.stringify(videos))
  })
  VideoController.getInstance().addVideoChangeListener((video) => {
    mainWindow.webContents.send('video:changed', JSON.stringify(video))
  })
  ipcMain.handle('video:selectSearchResultID', (_event, uuid: string, searchResultID?: number) => {
    return VideoController.getInstance().selectSearchResultID(uuid, searchResultID)
  })
  ipcMain.handle('video:search', (_event, uuid: string, data?: SearchInputData) => {
    return VideoController.getInstance().search(uuid, data)
  })
  ipcMain.handle('video:switchTrackSelection', (_event, uuid: string, changedItems: number[]) => {
    VideoController.getInstance().switchTrackSelection(uuid, changedItems)
  })
  ipcMain.handle('video:setHint', (_event, uuid: string, hint: IHint, value?: string) => {
    VideoController.getInstance().setHint(uuid, hint, value)
  })
  ipcMain.handle(
    'video:addChange',
    (
      _event,
      uuid: string,
      source: string,
      changeType: ChangeType,
      property?: ChangeProperty,
      newValue?: ChangePropertyValue
    ) => {
      VideoController.getInstance().addChange(uuid, source, changeType, property, newValue)
    }
  )
  ipcMain.handle(
    'video:saveChange',
    (
      _event,
      uuid: string,
      changeUuid: string,
      source: string,
      changeType: ChangeType,
      property?: ChangeProperty,
      newValue?: ChangePropertyValue
    ) => {
      VideoController.getInstance().saveChange(uuid, changeUuid, source, changeType, property, newValue)
    }
  )
  ipcMain.handle('video:deleteChange', (_event, uuid: string, changeUuid: string) => {
    VideoController.getInstance().deleteChange(uuid, changeUuid)
  })
  ipcMain.handle('video:setTrackEncodingEnabled', (_event, uuid: string, source: string, value: boolean) => {
    VideoController.getInstance().setTrackEncodingEnabled(uuid, source, value)
  })
  ipcMain.handle('video:addPart', async (_event, uuid: string) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Select additional video part',
      properties: ['openFile', 'dontAddToRecent']
    })
    if (!result.canceled && result.filePaths.length >= 1) {
      void VideoController.getInstance().addPart(uuid, result.filePaths[0])
    }
  })
  ipcMain.handle('video:setStartFrom', (_event, uuid: string, value?: string) => {
    VideoController.getInstance().setStartFrom(uuid, value)
  })
  ipcMain.handle('video:setEndAt', (_event, uuid: string, value?: string) => {
    VideoController.getInstance().setEndAt(uuid, value)
  })
  ipcMain.handle('video:process', (_event, uuid: string) => {
    return VideoController.getInstance().process(uuid)
  })
  ipcMain.handle('video:abortJob', (_event, uuid: string) => {
    VideoController.getInstance().abortJob(uuid)
  })
  ipcMain.handle('video:remove', (_event, videoUuidList: string[]) => {
    VideoController.getInstance().remove(videoUuidList)
  })
  ipcMain.handle('video:clearCompleted', (_event) => {
    VideoController.getInstance().clearCompleted()
  })
}

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
import { SearchBy, VideoType } from '../common/@types/Video'
import { IHint } from '../common/@types/Hint'
import { ChangeProperty, ChangePropertyValue, ChangeType } from '../common/Change'
import { EpisodeOrder } from './domain/clients/TVDBClient'
import { EditionType } from '../common/@types/Movie'

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
  VideoController.getInstance().addChangeListener((videos) => {
    mainWindow.webContents.send('video:filesChanged', JSON.stringify(videos))
  })
  ipcMain.handle('video:setType', (_event, uuid: string, videoType: VideoType) => {
    VideoController.getInstance().setType(uuid, videoType)
  })
  ipcMain.handle('video:setSearchBy', (_event, uuid: string, searchBy: SearchBy) => {
    VideoController.getInstance().setSearchBy(uuid, searchBy)
  })
  ipcMain.handle('video:selectSearchResultID', (_event, uuid: string, searchResultID?: number) => {
    return VideoController.getInstance().selectSearchResultID(uuid, searchResultID)
  })
  ipcMain.handle('video:search', (_event, uuid: string) => {
    return VideoController.getInstance().search(uuid)
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

  // TV Shows:
  ipcMain.handle('video.tvShow:setTitle', (_event, uuid: string, title: string) => {
    VideoController.getInstance().getTVShow(uuid).setTitle(title)
  })
  ipcMain.handle('video.tvShow:setYear', (_event, uuid: string, year: string) => {
    VideoController.getInstance().getTVShow(uuid).setYear(year)
  })
  ipcMain.handle('video.tvShow:setIMDB', (_event, uuid: string, imdb: string) => {
    VideoController.getInstance().getTVShow(uuid).setIMDB(imdb)
  })
  ipcMain.handle('video.tvShow:setTheTVDB', (_event, uuid: string, tvdb: number | string | undefined) => {
    VideoController.getInstance().getTVShow(uuid).setTheTVDB(tvdb)
  })
  ipcMain.handle('video.tvShow:setOrder', (_event, uuid: string, order: EpisodeOrder) => {
    VideoController.getInstance().getTVShow(uuid).setOrder(order)
  })
  ipcMain.handle('video.tvShow:setSeason', (_event, uuid: string, newSeason: string) => {
    VideoController.getInstance().getTVShow(uuid).setSeason(newSeason)
  })
  ipcMain.handle('video.tvShow:setEpisode', (_event, uuid: string, newEpisode: string) => {
    VideoController.getInstance().getTVShow(uuid).setEpisode(newEpisode)
  })
  ipcMain.handle('video.tvShow:setAbsoluteEpisode', (_event, uuid: string, newAbsoluteEpisode: string) => {
    VideoController.getInstance().getTVShow(uuid).setAbsoluteEpisode(newAbsoluteEpisode)
  })

  // Movies:
  ipcMain.handle('video.movie:setTitle', (_event, uuid: string, title: string) => {
    VideoController.getInstance().getMovie(uuid).setTitle(title)
  })
  ipcMain.handle('video.movie:setYear', (_event, uuid: string, year: string) => {
    VideoController.getInstance().getMovie(uuid).setYear(year)
  })
  ipcMain.handle('video.movie:setIMDB', (_event, uuid: string, imdb: string) => {
    VideoController.getInstance().getMovie(uuid).setIMDB(imdb)
  })
  ipcMain.handle('video.movie:setTMDB', (_event, uuid: string, tmdb: number | string | undefined) => {
    VideoController.getInstance().getMovie(uuid).setTMDB(tmdb)
  })
  ipcMain.handle('video.movie:setEdition', (_event, uuid: string, edition: EditionType) => {
    VideoController.getInstance().getMovie(uuid).setEdition(edition)
  })
}

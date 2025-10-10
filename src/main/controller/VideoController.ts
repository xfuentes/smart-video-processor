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

import { Video } from '../domain/Video'
import { SearchBy, SearchInputData, VideoType } from '../../common/@types/Video'
import { IHint } from '../../common/@types/Hint'
import { Attachment, ChangeProperty, ChangeType } from '../../common/Change'

type VideoListChangeListener = (videos: Video[]) => void
type VideoChangeListener = (video: Video) => void

export class VideoController {
  private static instance: VideoController
  private videos: Video[] = []
  private listChangeListeners: VideoListChangeListener[] = []
  private videoChangeListeners: VideoChangeListener[] = []

  static getInstance() {
    if (!VideoController.instance) {
      VideoController.instance = new VideoController()
    }
    return VideoController.instance
  }

  handleVideoChange = (video: Video) => {
    this.fireListChangeEvent()
    this.fireVideoChangeEvent(video)
  }

  addVideoChangeListener(listener: VideoChangeListener) {
    this.videoChangeListeners.push(listener)
  }

  fireVideoChangeEvent(video: Video) {
    this.videoChangeListeners.forEach((listener) => listener(video))
  }

  addListChangeListener(listener: VideoListChangeListener) {
    this.listChangeListeners.push(listener)
  }

  fireListChangeEvent() {
    this.listChangeListeners.forEach((listener) => listener(this.videos))
  }

  openFiles(filePaths: string[]) {
    if (filePaths.length > 0) {
      const newVideos = [] as Video[]
      for (const filePath of filePaths) {
        if (!this.videos.find((video) => video.sourcePath === filePath)) {
          // Avoid inserting videos which were already added.
          const video = new Video(filePath)
          video.addChangeListener(this.handleVideoChange)
          newVideos.push(video)
        }
      }
      this.videos = this.videos.concat(newVideos)
      this.fireListChangeEvent()
      for (const newVideo of newVideos) {
        void newVideo.load()
      }
    }
  }

  encoderSettingsUpdated() {
    for (const video of this.videos) {
      video.generateEncoderSettings(true)
    }
  }

  private getVideoByUuid(uuid: string) {
    const video = this.videos.find((video) => video.uuid === uuid)
    if (video == undefined) {
      throw new Error("Video with uuid '" + uuid + "' not found")
    }
    return video
  }

  setType(uuid: string, videoType: VideoType) {
    this.getVideoByUuid(uuid).setType(videoType)
  }

  setSearchBy(uuid: string, searchBy: SearchBy) {
    this.getVideoByUuid(uuid).setSearchBy(searchBy)
  }

  selectSearchResultID(uuid: string, searchResultID?: number) {
    return this.getVideoByUuid(uuid).selectSearchResultID(searchResultID)
  }

  search(uuid: string, data?: SearchInputData) {
    return this.getVideoByUuid(uuid).search(data)
  }

  switchTrackSelection(uuid: string, changedItems: number[]) {
    this.getVideoByUuid(uuid).switchTrackSelection(changedItems)
  }

  setHint(uuid: string, hint: IHint, value?: string) {
    this.getVideoByUuid(uuid).setHint(hint, value)
  }

  addChange(
    uuid: string,
    source: string,
    changeType: ChangeType,
    property?: ChangeProperty,
    newValue?: string | Attachment | boolean
  ) {
    return this.getVideoByUuid(uuid).addChange(source, changeType, property, newValue)
  }

  saveChange(
    uuid: string,
    changeUuid: string,
    source: string,
    changeType: ChangeType,
    property?: ChangeProperty,
    newValue?: string | Attachment | boolean
  ) {
    this.getVideoByUuid(uuid).saveChange(changeUuid, source, changeType, property, newValue)
  }

  deleteChange(uuid: string, changeUuid: string) {
    this.getVideoByUuid(uuid).deleteChange(changeUuid)
  }

  setTrackEncodingEnabled(uuid: string, source: string, value: boolean) {
    this.getVideoByUuid(uuid).setTrackEncodingEnabled(source, value)
  }

  process(uuid: string) {
    return this.getVideoByUuid(uuid).process()
  }

  abortJob(uuid: string) {
    return this.getVideoByUuid(uuid).abortJob()
  }

  remove(videoUuidList: string[]) {
    this.videos = this.videos.filter((v) => {
      if (videoUuidList.includes(v.uuid)) {
        v.abortJob()
        return false
      }
      return true
    })
    this.fireListChangeEvent()
  }

  clearCompleted() {
    this.videos = this.videos.filter((v) => !v.isProcessed())
    this.fireListChangeEvent()
  }

  getMovie(uuid: string) {
    return this.getVideoByUuid(uuid).movie
  }

  getTVShow(uuid: string) {
    return this.getVideoByUuid(uuid).tvShow
  }

  getOther(uuid: string) {
    return this.getVideoByUuid(uuid).other
  }
}

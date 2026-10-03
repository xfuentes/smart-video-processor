/*
 * Smart Video Processor
 * Copyright (c) 2025. Xavier Fuentes <xfuentes-dev@serviam.cc>
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
import { currentSettings } from '../domain/Settings'
import { MultiSearchInputData, SearchBy, SearchInputData, VideoType } from '../../common/@types/Video'
import { EpisodeOrder } from '../domain/clients/TVDBClient'
import { IHint } from '../../common/@types/Hint'
import { Attachment, ChangeProperty, ChangeType } from '../../common/Change'

type VideoListChangeListener = (videos: Video[]) => void
type VideosChangeListener = (videos: Video[]) => void

const CHANGE_FLUSH_DELAY_MS = 100

export class VideoController {
  private static instance: VideoController
  private videos: Video[] = []
  private listChangeListeners: VideoListChangeListener[] = []
  private videosChangeListeners: VideosChangeListener[] = []
  private batchDepth = 0
  private batchedVideos = new Set<Video>()
  private pendingVideos = new Set<Video>()
  private flushTimer: NodeJS.Timeout | undefined

  static getInstance() {
    if (!VideoController.instance) {
      VideoController.instance = new VideoController()
    }
    return VideoController.instance
  }

  handleVideoChange = (video: Video) => {
    if (this.batchDepth > 0) {
      this.batchedVideos.add(video)
      return
    }
    this.pendingVideos.add(video)
    this.flushTimer ??= setTimeout(this.flushPendingChanges, CHANGE_FLUSH_DELAY_MS)
  }

  // Coalesces rapid changes (e.g. progress updates) into one event carrying only the videos that changed.
  private flushPendingChanges = () => {
    this.flushTimer = undefined
    const changedVideos = [...this.pendingVideos].filter((video) => this.videos.includes(video))
    this.pendingVideos.clear()
    if (changedVideos.length > 0) {
      this.videosChangeListeners.forEach((listener) => listener(changedVideos))
    }
  }

  addVideosChangeListener(listener: VideosChangeListener) {
    this.videosChangeListeners.push(listener)
  }

  // Runs a bulk operation and emits a single list event and a single videos event instead of one pair per video.
  private batchChanges(operation: () => void) {
    this.batchDepth++
    try {
      operation()
    } finally {
      this.batchDepth--
      if (this.batchDepth === 0 && this.batchedVideos.size > 0) {
        const changedVideos = [...this.batchedVideos]
        this.batchedVideos.clear()
        this.videosChangeListeners.forEach((listener) => listener(changedVideos))
      }
    }
  }

  addListChangeListener(listener: VideoListChangeListener) {
    this.listChangeListeners.push(listener)
  }

  fireListChangeEvent() {
    this.listChangeListeners.forEach((listener) => listener(this.videos))
  }

  async openFiles(filePaths: string[]) {
    if (filePaths.length > 0) {
      const newVideos = [] as Video[]
      const sortedFilePaths = [...filePaths].sort(new Intl.Collator(undefined, { numeric: true }).compare)
      for (const filePath of sortedFilePaths) {
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

  setType(uuid: string, videoType: VideoType) {
    this.getVideoByUuid(uuid).setType(videoType)
  }

  setSearchBy(uuid: string, searchBy: SearchBy) {
    this.getVideoByUuid(uuid).setSearchBy(searchBy)
  }

  async setMultiTvShowOrder(uuids: string[], order: EpisodeOrder) {
    for (const uuid of uuids) {
      await this.getVideoByUuid(uuid).tvShow.setOrder(order)
    }
    this.fireListChangeEvent()
  }

  selectSearchResultID(uuid: string, searchResultID?: number) {
    return this.getVideoByUuid(uuid).selectSearchResultID(searchResultID)
  }

  search(uuid: string, data?: SearchInputData) {
    const video = this.getVideoByUuid(uuid)
    video.autoModePossible = false
    return video.search(data)
  }

  async multiSelectSearchResultID(uuids: string[], searchResultID: number | undefined) {
    for (const uuid of uuids) {
      void this.getVideoByUuid(uuid).selectSearchResultID(searchResultID)
    }
  }

  async multiSearch(uuids: string[], data: MultiSearchInputData | undefined) {
    const videos = uuids.map((uuid: string) => this.getVideoByUuid(uuid))
    for (const [index, video] of videos.entries()) {
      video.prepareMultiSearch(data, index)
      video.autoModePossible = false
    }
    this.fireListChangeEvent()
    let firstError: unknown
    for (const video of videos) {
      try {
        await video.search()
      } catch (err) {
        firstError = firstError ?? err
      }
    }
    if (firstError !== undefined) {
      throw firstError as Error
    }
  }

  setMultiHint(uuids: string[], hint: IHint, value: string | undefined) {
    this.batchChanges(() => {
      for (const uuid of uuids) {
        void this.getVideoByUuid(uuid).setHint(hint, value)
      }
    })
  }

  setMultiTrackEncodingEnabled(uuids: string[], source: string, value: boolean) {
    this.batchChanges(() => {
      for (const uuid of uuids) {
        void this.getVideoByUuid(uuid).setTrackEncodingEnabled(source, value)
      }
    })
  }

  multiProcess(uuids: string[]) {
    for (const uuid of uuids) {
      void this.getVideoByUuid(uuid).process()
    }
  }

  switchTrackSelection(uuid: string, changedItems: number[]) {
    this.getVideoByUuid(uuid).switchTrackSelection(changedItems)
  }

  setHint(uuid: string, hint: IHint, value?: string) {
    void this.getVideoByUuid(uuid).setHint(hint, value)
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
        v.destroy()
        return false
      }
      return true
    })
    this.fireListChangeEvent()
  }

  async clearCompleted(onProgress?: (current: number, total: number) => void) {
    const toRemove = this.videos.filter((v) => v.isProcessed())
    const total = toRemove.length
    for (let i = 0; i < toRemove.length; i++) {
      const video = toRemove[i]
      if (currentSettings.isAutoDeleteProcessedFilesEnabled) {
        await video.deleteSourceFiles()
      }
      onProgress?.(i + 1, total)
    }
    const toRemoveUuid = toRemove.map((v) => v.uuid)
    this.remove(toRemoveUuid)
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

  addPart(uuid: string, partPath: string) {
    return this.getVideoByUuid(uuid).addPart(partPath)
  }

  removePart(uuid: string, partUuid: string) {
    return this.getVideoByUuid(uuid).removePart(partUuid)
  }

  setStartFrom(uuid: string, value?: number) {
    return this.findVideoByUuidIncludingParts(uuid).setStartFrom(value)
  }

  setEndAt(uuid: string, value?: number) {
    return this.findVideoByUuidIncludingParts(uuid).setEndAt(value)
  }

  async takeSnapshots(uuid: string): Promise<string> {
    return await this.findVideoByUuidIncludingParts(uuid).takeSnapshots()
  }

  preparePreview(uuid: string) {
    return this.findVideoByUuidIncludingParts(uuid).preparePreview()
  }

  /**
   * Called before quit to clean temp files
   */
  async destroy(onProgress?: (current: number, total: number) => void) {
    const total = this.videos.length
    for (let i = 0; i < this.videos.length; i++) {
      const video = this.videos[i]
      if (currentSettings.isAutoDeleteProcessedFilesEnabled && video.isProcessed()) {
        await video.deleteSourceFiles()
      }
      video.destroy()
      onProgress?.(i + 1, total)
    }
  }

  addParts(uuid: string, filePaths: string[]) {
    for (const partPath of filePaths) {
      void this.getVideoByUuid(uuid).addPart(partPath)
    }
  }

  private getVideoByUuid(uuid: string) {
    const video = this.videos.find((video) => video.uuid === uuid)
    if (video == undefined) {
      throw new Error("Video with uuid '" + uuid + "' not found")
    }
    return video
  }

  private findVideoByUuidIncludingParts(uuid: string) {
    let foundVideo: Video | undefined = undefined

    for (const video of this.videos) {
      if (video.uuid === uuid) {
        foundVideo = video
        break
      }
      const foundPart = video.videoParts.find((part) => part.uuid === uuid)
      if (foundPart) {
        foundVideo = foundPart
        break
      }
    }
    if (!foundVideo) {
      throw new Error("Video with uuid '" + uuid + "' not found")
    }
    return foundVideo
  }
}

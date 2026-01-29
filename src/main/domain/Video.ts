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

import Movie from './Movie'
import { AudioVersion, AudioVersions } from './AudioVersions'
import { TVShow } from './TVShow'
import { Files } from '../util/files'
import { v4 as UUIDv4 } from 'uuid'
import { Container } from './programs/MKVMerge'
import {
  Attachment,
  Change,
  ChangeProperty,
  ChangePropertyValue,
  ChangeSourceType,
  ChangeType
} from '../../common/Change'
import { Brain } from './Brain'
import { Hint } from './Hint'
import { Job } from './jobs/Job'
import { ProcessingJob } from './jobs/ProcessingJob'
import { FileInfoLoadingJob } from './jobs/FileInfoLoadingJob'
import { Strings } from '../../common/Strings'
import { Encoding } from './Encoding'
import { EncodingJob } from './jobs/EncodingJob'
import { SearchResult } from './SearchResult'
import { currentSettings } from './Settings'
import { Track } from './Track'
import { JobManager } from './jobs/JobManager'
import { debug } from '../util/log'
import path from 'node:path'
import Path from 'node:path'
import * as fs from 'node:fs'
import { Progression } from '../../common/@types/processes'
import { TrackType } from '../../common/@types/Track'
import { JobStatus } from '../../common/@types/Job'
import { EncoderSettings } from '../../common/@types/Encoding'
import {
  ISnapshots,
  IVideo,
  MultiSearchInputData,
  retrieveChangePropertyValue,
  SearchBy,
  SearchInputData,
  sourceToSourceTypeTrackID,
  VideoTune,
  VideoType
} from '../../common/@types/Video'
import { EditionType } from '../../common/@types/Movie'
import { LanguageIETF } from '../../common/LanguageIETF'
import { Country } from '../../common/Countries'
import { IHint } from '../../common/@types/Hint'
import Other from './Other'
import { SnapshottingJob } from './jobs/SnapshottingJob'
import { PreviewingJob } from './jobs/PreviewingJob'
import { FFmpeg } from './programs/FFmpeg'
import { FFprobe } from './programs/FFprobe'
import Chalk from 'chalk'
import _ from 'lodash'

type VideoChangeListener = (video: Video) => void

export class Video implements IVideo {
  public readonly uuid: string = UUIDv4()
  public filename: string
  public size: number = 0
  public duration: number = 0
  public sourcePath: string
  public type: VideoType = VideoType.OTHER
  public changeListeners: VideoChangeListener[] = []
  public container?: Container
  public tracks: Track[] = []
  public pixels?: string
  public changes: Change[] = []
  public hints: Hint[] = []
  public movie: Movie = new Movie(this)
  public tvShow: TVShow = new TVShow(this)
  public other: Other = new Other(this)
  public snapshots?: ISnapshots
  public videoParts: Video[] = []
  public keyFrames: number[] = []
  public startFrom?: number
  public endAt?: number

  public status: JobStatus
  public message: string | undefined
  public progression: Progression
  // Eventual preview progression
  public previewProgression?: Progression
  public searchResults: SearchResult[] = []
  public selectedSearchResultID?: number

  /**
   * This flag is set to false once video file has been loaded.
   */
  public loading: boolean = true
  public searching: boolean = false
  public processing: boolean = false
  public matched: boolean = false
  public brainCalled: boolean = false
  public autoModePossible: boolean = true
  public queued: boolean = false
  /**
   * True if processing was completed successfully
   */
  public processed: boolean = false
  public hintMissing: boolean = false

  /*
   * Audio versions hint from filename
   */
  public audioVersions: AudioVersion[] = []
  public title: string = ''
  public poster?: Attachment
  public searchBy: SearchBy = SearchBy.TITLE
  /*
   * Encoder Info
   */
  public encodedPath?: string
  public tune: VideoTune = VideoTune.FILM
  public encoderSettings: EncoderSettings[] = []
  /*
   * User preference input by video.
   */
  public trackEncodingEnabled: { [key: string]: boolean } = {}
  // Currently running job
  public job?: Job<unknown>
  public lastPromise?: Promise<void>
  public previewJob?: Job<string>
  public previewPath?: string
  public snapshotsJob?: Job<string>
  public preProcessPath?: string
  public targetDuration: number = 0
  public encodingForced: boolean = false

  constructor(sourcePath: string) {
    this.filename = path.basename(sourcePath)
    this.sourcePath = sourcePath
    this.status = JobStatus.QUEUED
    this.progression = { progress: -1 }
    this.extractInfosFromFilename()
  }

  public computeVersions() {
    const versions: string[] = []
    if (this.type !== VideoType.TV_SHOW) {
      let videoCodec: string | undefined = undefined
      let dimensions: string | undefined = undefined

      const videoTrack = this.tracks.find((t) => t.type === TrackType.VIDEO)
      if (videoTrack?.properties.videoDimensions) {
        dimensions = Strings.pixelsToVideoFormat(videoTrack.properties.videoDimensions)
      }
      if (videoTrack?.codec) {
        videoCodec = videoTrack?.codec.toLowerCase()
      }
      const videoSettings = this.encoderSettings.find((s) => s.trackType === TrackType.VIDEO)
      if (videoSettings && this.isTrackEncodingEnabled(videoSettings.trackType + ' ' + videoSettings.trackId)) {
        videoCodec = videoSettings.codec === undefined ? undefined : videoSettings.codec.toLowerCase()
      }

      if (dimensions) {
        versions.push(dimensions)
      }
      if (videoCodec) {
        let codec: string | undefined = undefined
        if (videoCodec.indexOf('h.264') !== -1) {
          codec = 'h264'
        } else if (videoCodec.indexOf('h.265') !== -1) {
          codec = 'h265'
        }
        if (codec) {
          versions.push(codec)
        }
      }
    }

    return versions
  }

  addChangeListener(listener: VideoChangeListener) {
    this.changeListeners.push(listener)
  }

  removeChangeListener(listener: VideoChangeListener) {
    const listeners: VideoChangeListener[] = []
    for (const l of this.changeListeners) {
      if (l !== listener) {
        listeners.push(l)
      }
    }
    this.changeListeners = listeners
  }

  fireChangeEvent() {
    this.changeListeners.forEach((listener) => {
      listener(this)
    })
  }

  attachJob<T>(job: Job<T>): Job<T> {
    if (this.job === undefined || this.job.finished) {
      this.job = job
      const listener = () => {
        const newStatus = job.getStatus()
        const newMessage = job.getStatusMessage()
        const newProgression = job.getProgression()
        let newIndicator = false
        if (job.finished) {
          if (this.job === job) {
            this.job = undefined
          }
          if (this.queued) {
            newIndicator = true
            this.queued = false
          }
          job.removeChangeListener(listener)
        } else {
          if (this.processed) {
            newIndicator = true
            this.processed = false
          }
        }
        if (
          !_.isEqual(this.status, newStatus) ||
          !_.isEqual(this.message, newMessage) ||
          !_.isEqual(this.progression, newProgression) ||
          newIndicator
        ) {
          this.status = newStatus
          this.message = newMessage
          this.progression = newProgression
          this.fireChangeEvent()
        }
      }
      job.addChangeListener(listener)
    } else {
      throw new Error('A job is already running, please wait.')
    }
    return job
  }

  attachPreviewJob(job: Job<string>): Job<string> {
    if (this.previewJob === undefined || this.previewJob.finished) {
      this.previewJob = job
      const listener = () => {
        this.previewProgression = job.getProgression()
        if (job.finished) {
          if (this.previewJob === job) {
            this.previewJob = undefined
          }
          job.removeChangeListener(listener)
        }
        this.fireChangeEvent()
      }
      job.addChangeListener(listener)
      return job
    } else {
      return this.previewJob
    }
  }

  attachSnapshotJob(job: Job<string>): Job<string> {
    if (this.snapshotsJob === undefined || this.snapshotsJob.finished) {
      this.snapshotsJob = job
      const listener = () => {
        if (job.finished) {
          if (this.snapshotsJob === job) {
            this.snapshotsJob = undefined
          }
          job.removeChangeListener(listener)
        }
        this.fireChangeEvent()
      }
      job.addChangeListener(listener)
      return job
    } else {
      return this.snapshotsJob
    }
  }

  async load(searchEnabled: boolean = true) {
    this.progression.progress = undefined
    this.status = JobStatus.LOADING
    this.fireChangeEvent()
    const fij = new FileInfoLoadingJob(this.sourcePath, this.getPreviewDirectory())
    const { tracks, container } = await fij.queue()
    this.tracks = tracks
    this.duration =
      tracks.find((t) => t.type === TrackType.VIDEO)?.duration ??
      tracks.find((t) => t.type === TrackType.AUDIO)?.duration ??
      0
    this.targetDuration = this.duration
    this.pixels = this.computePixels()
    this.container = container
    this.keyFrames = []
    this.fireChangeEvent()
    this.generateEncoderSettings(true)

    if (this.type !== VideoType.OTHER && searchEnabled) {
      // Only manual mode enabled for custom videos
      await this.search()
    } else {
      this.status = JobStatus.WAITING
      this.message = 'Ready to process.'
      this.progression.progress = -1
    }
    this.loading = false
    this.fireChangeEvent()
  }

  generateEncoderSettings(init = true) {
    if (init) {
      this.trackEncodingEnabled = {}
    }
    this.encoderSettings = Encoding.getInstance().analyse(this.tracks, this.targetDuration)
    if (init) {
      this.encoderSettings.forEach(
        (s) => (this.trackEncodingEnabled[s.trackType + ' ' + s.trackId] = s.encodingEnabled ?? false)
      )
    }
    debug('### ENCODER SETTINGS ###')
    debug(this.encoderSettings)

    const filenameChange = Brain.getInstance().generateFilenameChange(
      this.sourcePath,
      this.title,
      this.type === VideoType.MOVIE ? this.movie.tmdb : undefined,
      this.type === VideoType.MOVIE ? this.movie.edition : undefined,
      this.computeVersions()
    )

    const oldFilenameChange = this.changes.find(
      (c) => c.sourceType === ChangeSourceType.CONTAINER && c.property === ChangeProperty.FILENAME
    )
    if (filenameChange === undefined) {
      if (oldFilenameChange !== undefined) {
        // Remove filename change if not needed anymore
        this.changes = this.changes.filter((c) => c === oldFilenameChange)
      }
    } else {
      if (oldFilenameChange !== undefined) {
        this.changes = this.changes.map((c) => (c === oldFilenameChange ? filenameChange : c))
      } else {
        this.changes.push(filenameChange)
      }
    }

    this.fireChangeEvent()
  }

  async search(data?: SearchInputData) {
    if (data) {
      this.setType(data.type)
      this.setSearchBy(data.searchBy)
      this.movie.setTitle(data.movieTitle)
      this.movie.setYear(data.movieYear)
      this.movie.setIMDB(data.movieIMDB)
      this.movie.setTMDB(data.movieTMDB)
      this.movie.setEdition(data.movieEdition)
      this.tvShow.setTitle(data.tvShowTitle)
      this.tvShow.setYear(data.tvShowYear)
      this.tvShow.setTheTVDB(data.tvShowTVDB)
      this.tvShow.setOrder(data.tvShowOrder)
      this.tvShow.setSeason(data.tvShowSeason)
      this.tvShow.setEpisode(data.tvShowEpisode)
      this.tvShow.setAbsoluteEpisode(data.tvShowAbsoluteEpisode)
      this.other.setTitle(data.otherTitle)
      this.other.setYear(data.otherYear)
      this.other.setMonth(data.otherMonth)
      this.other.setDay(data.otherDay)
      this.other.setOriginalLanguage(data.otherOriginalLanguage)
      this.other.setPosterPath(data.otherPosterPath)
      this.fireChangeEvent()
    }

    this.matched = false
    this.searching = true
    this.brainCalled = false
    this.selectAllTracks()
    this.hints = []
    try {
      if (this.type === VideoType.MOVIE) {
        await this.movie.search(this.searchBy)
      } else if (this.type === VideoType.TV_SHOW) {
        await this.tvShow.search(this.searchBy)
      } else if (this.type === VideoType.OTHER) {
        await this.other.search()
      }
      this.searching = false
      this.fireChangeEvent()
    } catch (error) {
      this.status = JobStatus.WARNING
      this.progression.progress = -1
      this.message = (error as Error).message + '. Please check the information provided and try again.'
      console.log(Chalk.red(this.message))
      this.searching = false
      this.fireChangeEvent()
    }
    if (this.status !== JobStatus.WARNING) {
      await this.analyse()
    }
  }

  prepareMultiSearch(data?: MultiSearchInputData) {
    this.searching = true
    if (data && data.type === VideoType.TV_SHOW) {
      if (data.type !== undefined) this.setType(data.type)
      if (data.searchBy !== undefined) this.setSearchBy(data.searchBy)
      if (data.tvShowTitle !== undefined) this.tvShow.setTitle(data.tvShowTitle)
      if (data.tvShowYear !== undefined) this.tvShow.setYear(data.tvShowYear)
      if (data.tvShowTVDB !== undefined) this.tvShow.setTheTVDB(data.tvShowTVDB)
      if (data.tvShowOrder !== undefined) this.tvShow.setOrder(data.tvShowOrder)
      if (data.tvShowSeason !== undefined) this.tvShow.setSeason(data.tvShowSeason)
    }
  }

  async analyse() {
    const selectedTracks = this.getSelectedTracks()
    if (this.matched && selectedTracks.length > 0) {
      debug('### TRACKS ###')
      debug(this.tracks)
      debug('### OriginalLanguageIETF ###')
      debug(this.getOriginalLanguageIETF())
      debug('### Attachments ###')
      debug(this.container?.attachments)

      const processingResults = Brain.getInstance().analyse(
        selectedTracks,
        this.sourcePath,
        this.title,
        this.poster,
        this.container?.title,
        this.container?.attachments,
        this.container?.tagCount ?? 0,
        this.getOriginalLanguageIETF(),
        this.getOriginalCountries(),
        this.audioVersions,
        this.hints,
        this.type === VideoType.MOVIE ? this.movie.tmdb : undefined,
        this.type === VideoType.MOVIE ? this.movie.edition : undefined,
        this.computeVersions()
      )
      this.changes = processingResults.changes
      this.hints = processingResults.hints
      this.hintMissing = this.hints.find((h) => !h.value) !== undefined

      debug('### CHANGES ###')
      debug(this.changes)
      debug('### HINTS ###')
      debug(this.hints)
      this.status = JobStatus.WAITING
      this.progression.progress = -1
      if (this.hintMissing) {
        this.message = 'Waiting for your hints.'
        this.autoModePossible = false
      } else if (this.changes.length > 0) {
        this.message = 'Ready to process.'
      } else if (this.encoderSettings.length > 0) {
        this.message = 'Ready to encode.'
      } else {
        this.status = JobStatus.WARNING
        this.message = 'Nothing to do.'
      }
      if (!this.brainCalled) {
        this.selectAllTracks()
        this.unselectBrainDeletedTracks()
        this.brainCalled = true
      }
      this.fireChangeEvent()
      if (this.autoModePossible && currentSettings.isAutoStartEnabled) {
        await this.process()
      }
    }
  }

  unselectBrainDeletedTracks() {
    const trackDeletionList: number[] = this.changes
      .filter((c) => c.changeType === ChangeType.DELETE && c.trackId != undefined)
      .map((c) => c.trackId as number)
    this.changes = this.changes.filter((c) => !trackDeletionList.includes(c.trackId as number))
    this.hints = this.hints.filter((h) => !trackDeletionList.includes(h.trackId as number))
    this.tracks
      .filter((t) => trackDeletionList.includes(t.id))
      .forEach((t) => {
        t.copy = false
        this.setTrackEncodingEnabled(t.type + ' ' + t.id, false)
      })
  }

  getOriginalLanguageIETF(): LanguageIETF | undefined {
    let originalLanguage: LanguageIETF | undefined
    if (this.type === VideoType.MOVIE) {
      originalLanguage = this.movie.getOriginalLanguage()
    } else if (this.type === VideoType.TV_SHOW) {
      originalLanguage = this.tvShow.getOriginalLanguage()
    } else if (this.type === VideoType.OTHER) {
      originalLanguage = this.other.getOriginalLanguage()
    }
    return originalLanguage
  }

  getOriginalCountries(): Country[] {
    let originalCountries: Country[]
    if (this.type === VideoType.MOVIE) {
      originalCountries = this.movie.getOriginalCountries()
    } else {
      originalCountries = this.tvShow.getOriginalCountries()
    }
    return originalCountries
  }

  async process() {
    if (this.startFrom || (this.endAt && this.endAt != this.duration) || this.videoParts.length > 0) {
      // Need to launch preprocessing
      debug('Pre-processing video parts')
      this.progression.progress = undefined
      this.status = JobStatus.ENCODING
      if (this.videoParts.length > 0) {
        this.message = 'Processing video parts...'
      } else {
        this.message = 'Trimming video...'
      }
      this.fireChangeEvent()
      try {
        this.preProcessPath = await FFmpeg.getInstance().preProcessVideo(this.toJSON(), this.getPreviewDirectory())
      } catch (e) {
        this.message = (e as Error).message
        this.status = JobStatus.ERROR
        this.progression.progress = -1
        this.fireChangeEvent()
        return
      }
    }
    let encodingRequired = false
    let encodingJob: Job<string> | undefined = undefined
    const finalEncoderSettings = this.getFinalEncoderSettings()
    if (finalEncoderSettings.length > 0) {
      encodingRequired = true
    }
    this.queued = true

    if (encodingRequired && this.container !== undefined) {
      encodingJob = this.attachJob(new EncodingJob(this.toJSON(), this.getTempDirectory(), finalEncoderSettings))
      this.encodedPath = (await encodingJob.queue()) as string
    }
    await this.merge(this.getOutputDirectory(), encodingJob?.getDuration())
    this.queued = false
    this.processed = true
    this.fireChangeEvent()
  }

  getFinalEncoderSettings() {
    return this.encoderSettings.filter(
      (s) => this.encodingForced || this.isTrackEncodingEnabled(s.trackType + ' ' + s.trackId)
    )
  }

  getOutputDirectory() {
    let outputDirectory: fs.PathLike
    if (this.type === VideoType.MOVIE) {
      outputDirectory = currentSettings.moviesOutputPath
    } else if (this.type === VideoType.TV_SHOW) {
      outputDirectory = currentSettings.tvShowsOutputPath
    } else {
      outputDirectory = currentSettings.othersOutputPath
    }
    if (!path.isAbsolute(outputDirectory)) {
      // Output path is relative to the original filename dirname.
      outputDirectory = path.join(path.dirname(this.sourcePath), outputDirectory)
    }
    return outputDirectory
  }

  getTempRootDirectory() {
    let tempDirectory: fs.PathLike
    tempDirectory = currentSettings.tmpFilesPath
    if (!path.isAbsolute(tempDirectory)) {
      // Output path is relative to the original filename dirname.
      tempDirectory = path.join(path.dirname(this.sourcePath), tempDirectory)
    }
    return tempDirectory
  }

  getTempDirectory() {
    return path.join(this.getTempRootDirectory(), this.uuid)
  }

  getPreviewDirectory() {
    let previewDirectory = this.getTempDirectory()
    previewDirectory = path.join(previewDirectory, 'preview')
    return previewDirectory
  }

  setType(type: VideoType) {
    this.type = type
    this.matched = false
  }

  setTune(tune: VideoTune) {
    this.tune = tune
  }

  setSearchBy(searchBy: SearchBy) {
    this.searchBy = searchBy
  }

  public async setHint(hint: IHint, value?: string) {
    const foundHint = this.hints.find((h) => h.type === hint.type && h.trackId === hint.trackId)
    if (foundHint !== undefined) {
      foundHint.value = value
      await this.analyse()
    }
  }

  addChange(source: string, changeType: ChangeType, property?: ChangeProperty, newValue?: ChangePropertyValue): string {
    const { sourceType, trackId } = sourceToSourceTypeTrackID(source)
    const newChange = new Change(
      sourceType,
      changeType,
      trackId,
      property,
      retrieveChangePropertyValue(this, source, property),
      newValue
    )
    this.changes.push(newChange)
    this.fireChangeEvent()
    return newChange.uuid
  }

  saveChange(
    uuid: string,
    source: string,
    changeType: ChangeType,
    property?: ChangeProperty,
    newValue?: ChangePropertyValue
  ) {
    const { sourceType, trackId } = sourceToSourceTypeTrackID(source)
    const change = this.changes.find((c) => c.uuid === uuid)
    if (change !== undefined) {
      change.sourceType = sourceType
      change.changeType = changeType
      change.trackId = trackId
      change.property = property
      change.currentValue = retrieveChangePropertyValue(this, source, property)
      change.newValue = newValue
      this.changes = this.changes.slice(0)
      this.fireChangeEvent()
    }
  }

  deleteChange(uuid: string) {
    this.changes = this.changes.filter((c) => c.uuid !== uuid)
    this.fireChangeEvent()
  }

  abortJob() {
    if (this.job) {
      JobManager.getInstance().removeFromQueueAndAbort(this.job)
      this.autoModePossible = false
    }
  }

  isTrackEncodingEnabled(source: string) {
    return this.trackEncodingEnabled[source] ?? false
  }

  setTrackEncodingEnabled(source: string, value: boolean) {
    this.trackEncodingEnabled[source] = value
    this.generateEncoderSettings(false)
  }

  getSelectedSearchResultID() {
    if (this.type === VideoType.MOVIE) {
      return this.movie.tmdb
    } else if (this.type === VideoType.TV_SHOW) {
      return this.tvShow.theTVDB
    }
    return undefined
  }

  async selectSearchResultID(id?: number) {
    this.brainCalled = false
    this.autoModePossible = false
    this.hints = []
    this.selectedSearchResultID = id
    if (this.type === VideoType.MOVIE) {
      await this.movie.selectSearchResultID(id)
    } else if (this.type === VideoType.TV_SHOW) {
      await this.tvShow.selectSearchResultID(id)
    }
    void this.analyse()
  }

  isProcessing() {
    return this.job && this.job.processingOrPaused
  }

  isProcessed() {
    return this.status === JobStatus.SUCCESS && this.processed
  }

  switchTrackSelection(changedItems: number[]) {
    this.tracks
      .filter((t) => changedItems.includes(t.id))
      .forEach((t) => {
        t.copy = !t.copy
        if (!t.copy) {
          this.setTrackEncodingEnabled(t.type + ' ' + t.id, false)
        }
      })
    void this.analyse()
  }

  getSelectedTracks(): Track[] {
    return this.tracks.filter((t) => t.copy)
  }

  selectAllTracks(): void {
    this.tracks.forEach((t) => {
      t.copy = true
    })
  }
  getTracksDuration() {
    let duration = 0
    for (const t of this.tracks) {
      if (t.duration != undefined && t.duration > duration) {
        duration = t.duration
      }
    }
    return duration
  }

  computePixels() {
    for (const t of this.tracks) {
      if (t.type === TrackType.VIDEO && t.properties.videoDimensions) {
        return t.properties.videoDimensions
      }
    }
    return undefined
  }

  toJSON(): IVideo {
    return {
      uuid: this.uuid,
      filename: this.filename,
      sourcePath: this.sourcePath,
      size: this.size,
      duration: this.duration,
      pixels: this.pixels,
      type: this.type,
      container: this.container,
      tracks: this.tracks.map((t) => t.toJSON()),
      changes: this.changes.map((c) => c.toJSON()),
      hints: this.hints.map((h) => h.toJSON()),
      keyFrames: this.keyFrames,
      videoParts: this.videoParts.map((v) => v.toJSON()),
      startFrom: this.startFrom,
      endAt: this.endAt,
      status: this.status,
      message: this.message,
      progression: _.omit(this.progression, 'process'),
      loading: this.loading,
      searching: this.searching,
      processing: (this.job && this.job.processingOrPaused) ?? false,
      matched: this.matched,
      queued: this.queued,
      processed: this.processed,
      searchBy: this.searchBy,
      searchResults: this.searchResults.map((sr) => sr.toJSON()),
      selectedSearchResultID: this.selectedSearchResultID,
      ...(this.type === VideoType.MOVIE ? { movie: this.movie.toJSON() } : {}),
      ...(this.type === VideoType.TV_SHOW ? { tvShow: this.tvShow.toJSON() } : {}),
      ...(this.type === VideoType.OTHER ? { other: this.other.toJSON() } : {}),
      hintMissing: this.hintMissing,
      encoderSettings: this.encoderSettings,
      trackEncodingEnabled: this.trackEncodingEnabled,
      previewProgression: this.previewProgression !== undefined ? _.omit(this.previewProgression, 'process') : undefined,
      previewPath: this.previewPath,
      snapshots: this.snapshots,
      preProcessPath: this.preProcessPath,
      targetDuration: this.targetDuration
    }
  }

  videoPartListener = (_video: Video) => {
    this.computeTargetDuration()
    this.fireChangeEvent()
  }

  async addPart(partPath: string) {
    if (this.sourcePath !== partPath && !this.videoParts.find((video) => video.sourcePath === partPath)) {
      // Avoid inserting part which were already added or if same as main video.
      const videoPart = new Video(partPath)
      videoPart.addChangeListener(this.videoPartListener)
      this.videoParts.push(videoPart)
      await videoPart.load(false)
      this.computeTargetDuration()
      this.generateEncoderSettings()
      await videoPart.takeSnapshots()
      this.fireChangeEvent()
    }
  }

  removePart(partUuid: string) {
    const part = this.videoParts.find((p) => p.uuid === partUuid)
    if (part !== undefined) {
      this.videoParts = this.videoParts.filter((p) => p.uuid !== partUuid)
      this.fireChangeEvent()
      part.destroy()
    }
  }

  computeTargetDuration() {
    let targetDuration = 0
    targetDuration += (this.endAt ?? this.duration) - (this.startFrom ?? 0)
    for (const videoPart of this.videoParts) {
      targetDuration += videoPart.targetDuration
    }
    this.targetDuration = targetDuration
  }

  findClosest(arr: number[], target: number) {
    let left = 0
    let right = arr.length - 1

    // Binary search to find insertion point
    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      if (arr[mid] < target) {
        left = mid + 1
      } else {
        right = mid
      }
    }

    // Check neighbors around the insertion point
    const closest = left
    const before = left > 0 ? arr[left - 1] : arr[closest]
    const after = arr[closest]

    // Return the closest value
    return target - before <= after - target ? before : after
  }

  async toNearestKeyFrameTime(selTime: number) {
    if (this.keyFrames.length === 0) {
      const prevMessage = this.message
      const prevStatus = this.status
      this.message = 'Extracting key frames...'
      this.progression.progress = undefined
      this.status = JobStatus.LOADING
      this.keyFrames = []
      this.fireChangeEvent()
      this.keyFrames = await FFprobe.getInstance().retrieveKeyFramesInformation(this.sourcePath)
      this.message = prevMessage
      this.progression.progress = -1
      this.status = prevStatus
      this.fireChangeEvent()
    }

    if (this.keyFrames.length === 0) {
      return selTime
    }
    if (this.keyFrames[0] > selTime) {
      return this.keyFrames[0]
    }
    if (this.keyFrames[this.keyFrames.length - 1] < selTime) {
      return this.keyFrames[this.keyFrames.length - 1]
    }

    return this.findClosest(this.keyFrames, selTime)
  }

  async setStartFrom(value?: number) {
    this.startFrom = value !== undefined ? Math.round(await this.toNearestKeyFrameTime(value)) : undefined
    this.computeTargetDuration()
    this.generateEncoderSettings()
    this.fireChangeEvent()
  }

  async setEndAt(value?: number) {
    this.endAt = value !== undefined ? Math.round(await this.toNearestKeyFrameTime(value)) : undefined
    this.computeTargetDuration()
    this.generateEncoderSettings()
    this.fireChangeEvent()
  }

  generateSnapshotConfigurationFromZoom(zoom?: number): ISnapshots {
    const height: number = 56
    const width = Math.round(Strings.pixelsToAspectRatio(this.pixels) * 56)
    let step: number = (60 * 10) / 12
    let stepSize: number = 20
    let totalWidth: number = Math.round((this.duration * stepSize) / step)

    let favoriteZoom = 1
    while (favoriteZoom <= 5) {
      step = (5 * 10) / favoriteZoom
      stepSize = 20
      totalWidth = Math.round((this.duration * stepSize) / step)
      if ((!zoom && totalWidth >= 1920) || zoom === favoriteZoom) {
        break
      }
      favoriteZoom++
    }

    return {
      width,
      height,
      step,
      stepSize,
      zoom: favoriteZoom,
      totalWidth
    }
  }

  async takeSnapshots(): Promise<string> {
    if (!this.snapshots) {
      this.snapshots = this.generateSnapshotConfigurationFromZoom()
    }
    if (this.snapshots.snapshotsPath) {
      return Promise.resolve(this.snapshots?.snapshotsPath)
    } else {
      const snapshotJob = new SnapshottingJob(
        this.sourcePath,
        this.getPreviewDirectory(),
        this.snapshots.height,
        this.snapshots.width,
        this.snapshots.totalWidth,
        this.duration
      )
      const job = this.attachSnapshotJob(snapshotJob)
      this.snapshots.snapshotsPath = await job.queue()
      this.fireChangeEvent()
      return this.snapshots.snapshotsPath
    }
  }

  async preparePreview(): Promise<string> {
    this.previewJob = this.attachPreviewJob(new PreviewingJob(this.toJSON(), this.getPreviewDirectory(), this.duration))
    this.previewPath = await this.previewJob.queue()
    this.fireChangeEvent()
    return this.previewPath
  }

  destroy() {
    this.abortJob()
    debug('Cleaning temporary files for video [' + this.filename + ']...')
    for (const part of this.videoParts) {
      part.destroy()
    }
    Files.deleteFolderRecursive(this.getTempDirectory())
    if (!Path.isAbsolute(currentSettings.tmpFilesPath)) {
      try {
        fs.rmdirSync(this.getTempRootDirectory())
      } catch (e) {
        /* ignored */
      }
    }
  }

  private async merge(outputDirectory: string, extraDuration?: number) {
    const subDirs: string[] = []
    if (this.type === VideoType.TV_SHOW && this.tvShow.title !== undefined) {
      subDirs.push(`${Files.removeSpecialCharsFromFilename(this.tvShow.title)} {tvdb-${this.tvShow.theTVDB}}`)
      if (this.tvShow.season !== undefined) {
        subDirs.push('Season ' + Strings.toLeadingZeroNumber(this.tvShow.season))
      }
    }

    let sourcePath = this.sourcePath
    if (this.preProcessPath) {
      sourcePath = this.preProcessPath
    }
    if (this.encodedPath) {
      sourcePath = this.encodedPath
    }
    const mergeJob = this.attachJob(
      new ProcessingJob(
        path.basename(this.sourcePath),
        sourcePath,
        this.changes,
        this.tracks,
        outputDirectory,
        subDirs,
        extraDuration
      )
    )
    await mergeJob.queue()
    if (this.encodedPath) {
      Files.cleanupFiles(this.encodedPath)
    }
    this.encodedPath = undefined
  }

  private extractInfosFromFilename() {
    const filename = Files.cleanFilename(this.filename)
    try {
      const stats = fs.statSync(this.sourcePath)
      this.size = stats.size
    } catch (e) {
      // TODO: Log
    }
    const moviePattern = /(?<title>.*)[(\s](?<year>\d\d\d\d)[)\s]?/i
    const tvShowAbsoluteEpisodePattern = /(?<title>[\p{L}\s()]+)?.*?(?<absoluteEpisode>E?\d\d\d?\d?)/iu

    this.type = VideoType.OTHER
    const tvShowSeasonEpisodePattern =
      /(?<title>.+?)\s*s\p{L}*\s*(?<season>\d{1,3})\s*[éex]\p{L}*\s*(?<episode>\d{1,3})/iu
    const tvShowSeasonEpisodeMatches = tvShowSeasonEpisodePattern.exec(filename)
    const tvShowAbsoluteEpisodeMatches = tvShowAbsoluteEpisodePattern.exec(filename)
    const movieMatches = moviePattern.exec(filename)

    const tvdbPattern = /\{tvdb-(?<tvdb>\d+)}/i
    const tvdbMatches = tvdbPattern.exec(this.sourcePath)
    const tmdbPattern = /\{tmdb-(?<tmdb>\d+)}/i
    const tmdbMatches = tmdbPattern.exec(this.filename)
    const editionPattern = /\{edition-(?<edition>[^}]+)}/i
    const editionMatches = editionPattern.exec(this.filename)
    if (editionMatches?.groups) {
      const edition: string = editionMatches.groups.edition.toLowerCase()
      if (edition.indexOf('director') != -1) {
        this.movie.edition = EditionType.DIRECTORS_CUT
      } else if (edition.indexOf('extended') != -1) {
        this.movie.edition = EditionType.EXTENDED
      } else if (edition.indexOf('unrated') != -1) {
        this.movie.edition = EditionType.UNRATED
      } else {
        this.movie.edition = EditionType.THEATRICAL
      }
    }
    const imdbPattern = /\{tt(?<imdb>\d+)}/i
    const imdbMatches = imdbPattern.exec(this.filename)

    if (tvdbMatches?.groups) {
      this.searchBy = SearchBy.TVDB
      this.type = VideoType.TV_SHOW
      this.tvShow.setTheTVDB(tvdbMatches.groups.tvdb)
    }

    if (tmdbMatches?.groups) {
      this.searchBy = SearchBy.TMDB
      this.type = VideoType.MOVIE
      this.movie.setTMDB(tmdbMatches.groups.tmdb)
    }

    if (imdbMatches?.groups) {
      this.tvShow.imdb = this.movie.imdb = 'tt' + imdbMatches.groups.imdb
      this.searchBy = SearchBy.IMDB
    }

    if (tvShowSeasonEpisodeMatches?.groups) {
      this.type = VideoType.TV_SHOW
      this.tvShow.season = Number.parseInt(tvShowSeasonEpisodeMatches.groups.season, 10)
      this.tvShow.episode = Number.parseInt(tvShowSeasonEpisodeMatches.groups.episode, 10)
      this.tvShow.order = 'official'
      this.tvShow.title = Files.megaTrim(tvShowSeasonEpisodeMatches.groups.title ?? '')
    } else if (movieMatches?.groups) {
      this.type = VideoType.MOVIE
      this.movie.title = Files.megaTrim(movieMatches.groups.title)
      this.movie.year = Number.parseInt(movieMatches.groups.year, 10)
    } else if (tvShowAbsoluteEpisodeMatches?.groups) {
      this.type = VideoType.TV_SHOW
      this.tvShow.absoluteEpisode = Number.parseInt(tvShowAbsoluteEpisodeMatches.groups.absoluteEpisode, 10)
      this.tvShow.order = 'absolute'
      this.tvShow.title = Files.megaTrim(tvShowAbsoluteEpisodeMatches.groups.title ?? '')
    }

    if (this.type === VideoType.OTHER) {
      const extPos = this.filename.lastIndexOf('.')
      this.other.title = this.filename.substring(0, extPos !== -1 ? extPos : undefined)
    }
    this.audioVersions = AudioVersions.extractVersions(filename)
  }
}

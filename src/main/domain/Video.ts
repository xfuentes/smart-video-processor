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
import { Attachment, Change, ChangeProperty, ChangePropertyValue, ChangeType } from '../../common/Change'
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
import * as fs from 'node:fs'
import { Progression } from '../../common/@types/processes'
import { TrackType } from '../../common/@types/Track'
import { JobStatus } from '../../common/@types/Job'
import { EncoderSettings } from '../../common/@types/Encoding'
import {
  IVideo,
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
  public videoParts: Video[] = []
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

  constructor(sourcePath: string) {
    this.filename = path.basename(sourcePath)
    this.sourcePath = sourcePath
    this.status = JobStatus.LOADING
    this.message = 'Analysing file name.'
    this.progression = { progress: undefined }
    this.extractInfosFromFilename()
  }

  public computeVersions() {
    const versions: string[] = []
    if (this.type !== VideoType.TV_SHOW) {
      const videoTrack = this.tracks.find((t) => t.type === TrackType.VIDEO)
      if (videoTrack?.properties.videoDimensions) {
        versions.push(Strings.pixelsToVideoFormat(videoTrack.properties.videoDimensions))
      }
      if (videoTrack?.codec) {
        const codec = videoTrack?.codec.toLowerCase()
        if (codec.indexOf('H.264')) {
          versions.push('h264')
        } else if (codec.indexOf('H.265')) {
          versions.push('h265')
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
        this.status = job.getStatus()
        this.message = job.getStatusMessage()
        this.progression = job.getProgression()
        if (job.finished) {
          if (this.job === job) {
            this.job = undefined
          }
          this.queued = false
          job.removeChangeListener(listener)
        } else {
          this.processed = false
        }
        this.fireChangeEvent()
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
    } else {
      throw new Error('A preview job is already running, please wait.')
    }
    return job
  }

  async load(searchEnabled: boolean = true) {
    const fij = this.attachJob(new FileInfoLoadingJob(this.sourcePath))
    const { tracks, container } = await fij.queue()
    this.tracks = tracks
    this.duration =
      tracks.find((t) => t.type === TrackType.VIDEO)?.duration ??
      tracks.find((t) => t.type === TrackType.AUDIO)?.duration ??
      0
    this.pixels = this.computePixels()
    this.container = container
    this.generateEncoderSettings(true)
    this.loading = false
    this.fireChangeEvent()
    if (this.type !== VideoType.OTHER && searchEnabled) {
      // Only manual mode enabled for custom videos
      await this.search()
    }
  }

  generateEncoderSettings(init = true) {
    if (init) {
      this.trackEncodingEnabled = {}
    }
    this.encoderSettings = Encoding.getInstance().analyse(this.tracks, this.trackEncodingEnabled)
    if (init) {
      this.encoderSettings.forEach((s) => this.setTrackEncodingEnabled(s.trackType + ' ' + s.trackId, true))
    }
    debug('### ENCODER SETTINGS ###')
    debug(this.encoderSettings)
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
    this.brainCalled = false
    this.hints = []
    if (this.type === VideoType.MOVIE) {
      await this.movie.search(this.searchBy)
    } else if (this.type === VideoType.TV_SHOW) {
      await this.tvShow.search(this.searchBy)
    } else if (this.type === VideoType.OTHER) {
      await this.other.search()
    }
    await this.analyse()
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
      if (this.brainCalled) {
        // remove deletion request if not on first call to keep user selection.
        this.changes = processingResults.changes.filter(
          (c) => c.changeType !== ChangeType.DELETE || c.trackId === undefined
        )
      } else {
        this.changes = processingResults.changes
      }
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
    let encodingRequired = false
    let encodingJob: Job<string> | undefined = undefined
    const finalEncoderSettings = this.getFinalEncoderSettings()
    if (finalEncoderSettings.length > 0) {
      encodingRequired = true
    }
    this.queued = true
    const outputDirectory = this.getOutputDirectory()

    if (encodingRequired && this.container !== undefined) {
      encodingJob = this.job = this.attachJob(
        new EncodingJob(
          this.sourcePath,
          outputDirectory,
          this.container.durationSeconds,
          this.tracks,
          finalEncoderSettings
        )
      )
      this.encodedPath = (await this.job.queue()) as string
    }
    await this.merge(outputDirectory, encodingJob?.getDuration())
    this.queued = false
    this.processed = true
    this.fireChangeEvent()
  }

  getFinalEncoderSettings() {
    return this.encoderSettings.filter((s) => this.isTrackEncodingEnabled(s.trackType + ' ' + s.trackId))
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
    fs.mkdirSync(outputDirectory, { recursive: true })
    return outputDirectory
  }

  getPreviewDirectory() {
    let previewDirectory = this.getOutputDirectory()
    previewDirectory = path.join(previewDirectory, this.uuid + '-preview')
    fs.mkdirSync(previewDirectory, { recursive: true })
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

  getTrackEncodingEnabledCount() {
    return Object.values(this.trackEncodingEnabled).filter((enabled) => enabled).length
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
      size: this.size,
      duration: this.duration,
      pixels: this.pixels,
      type: this.type,
      container: this.container,
      tracks: this.tracks.map((t) => t.toJSON()),
      changes: this.changes.map((c) => c.toJSON()),
      hints: this.hints.map((h) => h.toJSON()),
      videoParts: this.videoParts.map((v) => v.toJSON()),
      startFrom: this.startFrom,
      endAt: this.endAt,
      status: this.status,
      message: this.message,
      progression: this.progression,
      loading: this.loading,
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
      previewProgression: this.previewProgression,
      previewPath: this.previewPath
    }
  }

  videoPartListener = (_video: Video) => {
    this.fireChangeEvent()
  }

  async addPart(partPath: string) {
    if (this.sourcePath !== partPath && !this.videoParts.find((video) => video.sourcePath === partPath)) {
      // Avoid inserting part which were already added or if same as main video.
      const videoPart = new Video(partPath)
      videoPart.addChangeListener(this.videoPartListener)
      await videoPart.load(false)
      this.videoParts.push(videoPart)
      this.fireChangeEvent()
    }
  }

  setStartFrom(value?: number) {
    this.startFrom = value
    this.fireChangeEvent()
  }

  setEndAt(value?: number) {
    this.endAt = value
    this.fireChangeEvent()
  }

  async takeSnapshots(snapshotHeight: number, snapshotWidth: number, totalWidth: number): Promise<string> {
    const job = new SnapshottingJob(
      this.sourcePath,
      this.getPreviewDirectory(),
      snapshotHeight,
      snapshotWidth,
      totalWidth,
      this.duration
    )
    return await job.queue()
  }

  async preparePreview(): Promise<string> {
    this.previewJob = this.attachPreviewJob(
      new PreviewingJob(this.sourcePath, this.getPreviewDirectory(), this.duration)
    )
    this.previewPath = await this.previewJob.queue()
    this.fireChangeEvent()
    return this.previewPath
  }

  private async merge(outputDirectory: string, extraDuration?: number) {
    const subDirs: string[] = []
    if (this.type === VideoType.TV_SHOW && this.tvShow.title !== undefined) {
      subDirs.push(`${Files.removeSpecialCharsFromFilename(this.tvShow.title)} {tvdb-${this.tvShow.theTVDB}}`)
      if (this.tvShow.order === 'official' && this.tvShow.season !== undefined) {
        subDirs.push('Season ' + Strings.toLeadingZeroNumber(this.tvShow.season))
      }
    }

    this.job = this.attachJob(
      new ProcessingJob(
        path.basename(this.sourcePath),
        this.encodedPath !== undefined ? this.encodedPath : this.sourcePath,
        this.changes,
        this.tracks,
        outputDirectory,
        subDirs,
        extraDuration
      )
    )
    await this.job.queue()
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
    const tvShowAbsoluteEpisodePattern = /(?<title>[\p{L}\s()]+).*[e\s](?<absoluteEpisode>\d\d\d?\d?)\p{L}/iu

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
      this.tvShow.title = Files.megaTrim(tvShowSeasonEpisodeMatches.groups.title)
    } else if (movieMatches?.groups) {
      this.type = VideoType.MOVIE
      this.movie.title = Files.megaTrim(movieMatches.groups.title)
      this.movie.year = Number.parseInt(movieMatches.groups.year, 10)
    } else if (tvShowAbsoluteEpisodeMatches?.groups) {
      this.type = VideoType.TV_SHOW
      this.tvShow.absoluteEpisode = Number.parseInt(tvShowAbsoluteEpisodeMatches.groups.absoluteEpisode, 10)
      this.tvShow.order = 'absolute'
      this.tvShow.title = Files.megaTrim(tvShowAbsoluteEpisodeMatches.groups.title)
    }

    if (this.type === VideoType.OTHER) {
      const extPos = this.filename.lastIndexOf('.')
      this.other.title = this.filename.substring(0, extPos !== -1 ? extPos : undefined)
    }
    this.audioVersions = AudioVersions.extractVersions(filename)
  }
}

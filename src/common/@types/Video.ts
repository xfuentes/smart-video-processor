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

import { JobStatus } from './Job'
import { Progression } from './processes'
import { ITrack, TrackType } from './Track'
import { ChangeProperty, ChangeSourceType, ChangeType, IChange } from '../Change'
import { IHint } from './Hint'
import { ISearchResult } from './SearchResult'
import { EditionType, IMovie } from './Movie'
import { ITVShow } from './TVShow'
import { Container } from '../../main/domain/programs/MKVMerge'
import { EncoderSettings } from './Encoding'
import { IOther } from './Other'
import { EpisodeOrder } from '../../main/domain/clients/TVDBClient'

export enum VideoType {
  MOVIE = 'Movie',
  TV_SHOW = 'TV-Show',
  OTHER = 'Other'
}

export enum VideoTune {
  FILM = 'Film',
  ANIMATION = 'Animation',
  GRAIN = 'Grain'
}

export enum SearchBy {
  TITLE = 'Title',
  IMDB = 'IMDB ID',
  TMDB = 'TMDB ID',
  TVDB = 'TVDB ID'
}

export interface TrackChanges {
  id: number
  type: TrackType
  score: number
  name?: string
  language?: string
  default?: boolean
  forced?: boolean
}

export interface ISnapshots {
  snapshotsPath?: string
  zoom: number
  step: number
  stepSize: number
  height: number
  width: number
  totalWidth: number
}

export interface IVideo {
  uuid: string
  filename: string
  sourcePath: string
  size: number
  duration: number
  pixels?: string
  type: VideoType
  container?: Container
  tracks: ITrack[]
  changes: IChange[]
  hints: IHint[]
  videoParts: IVideo[]
  keyFrames: number[]
  startFrom?: number
  endAt?: number
  downscale?: string
  loading: boolean
  searching: boolean
  processing: boolean
  matched: boolean
  queued: boolean
  processed: boolean
  status: JobStatus
  message?: string
  progression: Progression
  searchBy: SearchBy
  searchResults: ISearchResult[]
  selectedSearchResultID?: number
  movie?: IMovie
  tvShow?: ITVShow
  other?: IOther
  encoderSettings: EncoderSettings[]
  trackEncodingEnabled: { [key: string]: boolean }
  hintMissing: boolean
  previewProgression?: Progression
  previewPath?: string
  snapshots?: ISnapshots
  preProcessPath?: string
  targetDuration: number
}

export interface IVideoListItem {
  uuid: string
  filename: string
  size: number
  pixels?: string
  status: JobStatus
  message?: string
  progression: Progression
  queued: boolean
  loading: boolean
  matched: boolean
  hintMissing: boolean
  processing: boolean
  searching: boolean
}
export const videoListItemKeys = [
  'uuid',
  'filename',
  'size',
  'pixels',
  'status',
  'message',
  'progression',
  'queued',
  'loading',
  'matched',
  'hintMissing',
  'processing',
  'searching'
]

export type SearchInputData = {
  type: VideoType
  searchBy: SearchBy
  movieTitle: string
  movieYear: string
  movieIMDB: string
  movieTMDB: string
  movieEdition: EditionType
  tvShowTitle: string
  tvShowYear: string
  tvShowTVDB: string
  tvShowOrder: EpisodeOrder
  tvShowSeason: string
  tvShowEpisode: string
  tvShowAbsoluteEpisode: string
  otherTitle: string
  otherYear: string
  otherMonth: string
  otherDay: string
  otherOriginalLanguage: string
  otherPosterPath: string
}

export type MultiSearchInputData = {
  type: VideoType
  searchBy: SearchBy
  tvShowTitle: string
  tvShowYear: string
  tvShowTVDB: string
  tvShowOrder: EpisodeOrder
  tvShowSeason: string
}

export const retrieveChangePropertyValue = (
  video: IVideo,
  source: string,
  property: ChangeProperty | undefined
): string | boolean | undefined => {
  if (property === undefined) {
    return property
  }
  let value: string | boolean | undefined
  if (source === 'Container') {
    switch (property) {
      case ChangeProperty.TITLE:
        value = video.container?.title ?? ''
        break
      default:
        value = undefined
    }
  } else {
    const trackId = Number(source.substring(source.indexOf(' ') + 1))
    const track = video.tracks.find((t) => t.id === trackId)
    switch (property) {
      case ChangeProperty.DEFAULT:
        value = track?.default
        break
      case ChangeProperty.FORCED:
        value = track?.forced
        break
      case ChangeProperty.NAME:
        value = track?.name
        break
      case ChangeProperty.LANGUAGE:
        value = track?.language
        break
      default:
        value = undefined
    }
  }
  return value
}

export const retrievePossibleSources = (video: IVideo): string[] => {
  const possibleSources: string[] = []
  Object.values(ChangeSourceType).forEach((k) => {
    if (k === ChangeSourceType.CONTAINER) {
      possibleSources.push(k)
    } else {
      for (const t of video.tracks) {
        if (t.type.toString() === k.toString()) {
          possibleSources.push(`${k} ${t.id}`)
        }
      }
    }
  })
  return possibleSources
}

export const changeExists = (
  video: IVideo,
  uuid: string | undefined,
  source: string,
  changeType: ChangeType,
  property?: ChangeProperty
): boolean => {
  const { sourceType, trackId } = sourceToSourceTypeTrackID(source)
  for (const change of video.changes) {
    if (
      change.uuid !== uuid &&
      change.sourceType === sourceType &&
      change.changeType === changeType &&
      change.trackId === trackId &&
      change.property === property
    ) {
      return true
    }
  }
  return false
}

export const sourceToSourceTypeTrackID = (
  source: string
): {
  sourceType: ChangeSourceType
  trackId?: number
} => {
  const sepIndex = source.indexOf(' ')
  const trackId = sepIndex !== -1 ? Number(source.substring(source.indexOf(' ') + 1)) : undefined
  const sourceTypeStr =
    sepIndex !== -1 ? (source.substring(0, source.indexOf(' ')) as ChangeSourceType) : (source as ChangeSourceType)
  const sourceType = Object.values(ChangeSourceType).find((type) => sourceTypeStr === type)
  if (sourceType === undefined) {
    throw new Error('Invalid ChangeSourceType extracted from ' + source)
  }
  return { sourceType, trackId }
}

export const checkVideoProcessingEnabled = (video: IVideo) => {
  return video.matched && !video.hintMissing && !video.queued && !video.processing
}

export const checkVideoProcessingSuccessful = (video: IVideo) => {
  return video.status === JobStatus.SUCCESS && video.processed
}

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
import { IChange } from './Change'
import { IHint } from './Hint'
import { ISearchResult } from './SearchResult'
import { IMovie } from './Movie'
import { ITVShow } from './TVShow'

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

export interface IVideo {
  uuid: string
  filename: string
  size: number
  pixels?: string
  type: VideoType
  tracks: ITrack[]
  changes: IChange[]
  hints: IHint[]
  loading: boolean
  matched: boolean
  status: JobStatus
  message?: string
  progression: Progression
  searchBy: SearchBy
  searchResults: ISearchResult[]
  selectedSearchResultID?: number
  movie?: IMovie
  tvShow?: ITVShow
}

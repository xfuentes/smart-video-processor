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

import { Files } from '../util/files'
import { Video } from './Video'
import { SearchResult } from './SearchResult'
import Chalk from 'chalk'
import { EpisodeOrder, TVDBClient } from './clients/TVDBClient'
import { Strings } from '../../common/Strings'
import { Numbers } from '../util/numbers'
import { debug } from '../util/log'
import { JobStatus } from '../../common/@types/Job'
import { SearchBy } from '../../common/@types/Video'
import { ITVShow } from '../../common/@types/TVShow'
import { LanguageIETF } from '../../common/LanguageIETF'
import { Country } from '../../common/Countries'

export class TVShow implements ITVShow {
  public video: Video
  public title?: string
  public order?: EpisodeOrder
  public season?: number
  public episode?: number
  public episodeTitle: string = ''
  public year?: number
  public overview?: string
  public episodeOverview?: string
  public poster: string = ''
  public posterURL?: string
  public theTVDB?: number
  public imdb?: string
  public absoluteEpisode?: number
  public episodePoster: string = ''
  public episodePosterURL: string = ''
  public originalLanguage: LanguageIETF | undefined
  public originalCountries: Country[] = []

  constructor(video: Video) {
    this.video = video
  }

  async search(searchBy: SearchBy) {
    this.video.searchResults = []
    if (searchBy === SearchBy.TVDB) {
      if (!this.theTVDB) {
        throw new Error('TVDB ID is mandatory')
      }
      await this.loadSeries()
    } else {
      if (!this.title) {
        throw new Error('Series name is mandatory')
      }
      this.video.status = JobStatus.LOADING
      this.video.message = 'Searching series on TheTVDB'
      this.video.fireChangeEvent()
      this.video.searchResults = await TVDBClient.getInstance().searchSeries(this.title, this.year)
      const seriesMatched = SearchResult.getBestMatch(this.video.searchResults, this.title, this.year)

      if (!seriesMatched) {
        this.video.status = JobStatus.WARNING
        this.video.message =
          'Unable to find an exact match on TheTVDB. Please check the information provided and try again.'
        console.log(Chalk.red(this.video.message))
        this.video.fireChangeEvent()
      } else {
        await this.selectSearchResultID(seriesMatched.id)
      }
    }
  }

  public async loadSeries() {
    if (!this.theTVDB) {
      throw new Error('TVDB ID is mandatory.')
    }
    if (!this.episode && !this.absoluteEpisode) {
      throw new Error('EpisodeData number is mandatory.')
    }

    this.video.message = 'Retrieving episode details'
    const { episodeData, seriesData } = await TVDBClient.getInstance().retrieveSeriesDetails(
      this.theTVDB,
      this.order ?? 'official',
      this.episode,
      this.absoluteEpisode,
      this.season
    )
    if (!episodeData) {
      this.video.status = JobStatus.WARNING
      this.video.message = 'EpisodeData not found. Please check the information provided and try again.'
      console.log(Chalk.red(this.video.message))
      this.video.fireChangeEvent()
    }
    this.imdb = seriesData.imdb
    this.title = seriesData.title
    this.poster = ''
    this.posterURL = seriesData.posterURL
    this.originalCountries = seriesData.countries
    this.originalLanguage = seriesData.language
    if (seriesData.year) {
      this.year = seriesData.year
    }

    this.episode = episodeData.episodeNumber
    this.season = episodeData.seasonNumber
    this.absoluteEpisode = episodeData.absoluteNumber
    this.episodeTitle = episodeData.title
    this.episodePoster = ''
    this.episodePosterURL = episodeData.posterURL
    this.overview = seriesData.overview
    this.episodeOverview = episodeData.overview
    this.video.matched = true
    if (!this.video.searchResults || this.video.searchResults.length === 0) {
      this.video.searchResults = [seriesData]
    }

    if (this.posterURL) {
      this.video.status = JobStatus.LOADING
      this.video.message = 'Downloading poster image from TheTVDB.'
      this.video.fireChangeEvent()
      const fullPath = Files.makeTempFile('TVDB-' + this.theTVDB + '-cover.jpg')
      this.poster = await Files.downloadFile(this.posterURL, fullPath)
      debug(`Wrote poster file://${this.poster}`)
    }
    if (this.episodePosterURL || this.poster) {
      if (!this.episodePosterURL && this.poster) {
        this.video.poster = {
          path: this.poster,
          filename: 'cover.jpg',
          description: `TVDB Image ${this.posterURL}`,
          mimeType: 'image/jpeg'
        }
      } else if (this.episodePosterURL) {
        this.video.message = 'Downloading episode image from TheTVDB.'
        this.video.fireChangeEvent()
        const filename = `episode-${this.season !== undefined ? 'S' + Strings.toLeadingZeroNumber(this.season) + 'E' + Strings.toLeadingZeroNumber(this.episode) : this.absoluteEpisode}`
        const fullPath = Files.makeTempFile('TVDB-' + this.theTVDB + '-' + filename + '.jpg')
        this.episodePoster = await Files.downloadFile(this.episodePosterURL, fullPath)
        debug(`wrote episode image file://${this.episodePoster}`)
        this.video.poster = {
          path: this.episodePoster,
          filename: 'cover.jpg',
          description: `TVDB Image ${this.episodePosterURL}`,
          mimeType: 'image/jpeg'
        }
      }
    }
    if (this.season !== undefined && this.episode !== undefined) {
      this.video.title = `${this.title} - S${Strings.toLeadingZeroNumber(this.season)}E${Strings.toLeadingZeroNumber(this.episode)}${this.episodeTitle ? ' - ' + this.episodeTitle : ''}`
    } else {
      this.video.title = `${this.title}${this.absoluteEpisode ? ' - E' + Strings.toLeadingZeroNumber(this.absoluteEpisode) : ''}${this.episodeTitle ? ' - ' + this.episodeTitle : ''}`
    }
    this.video.fireChangeEvent()
  }

  setTitle(newTitle: string) {
    this.title = newTitle
    this.video.fireChangeEvent()
  }

  setIMDB(newIMDB: string) {
    this.imdb = newIMDB
    this.video.fireChangeEvent()
  }

  setOrder(order: EpisodeOrder) {
    this.order = order
    this.video.fireChangeEvent()
  }

  setSeason(newSeason: string) {
    this.season = Numbers.toNumber(newSeason)
    this.video.fireChangeEvent()
  }

  setEpisode(newEpisode: string) {
    this.episode = Numbers.toNumber(newEpisode)
    this.video.fireChangeEvent()
  }

  setAbsoluteEpisode(newAbsoluteEpisode: string) {
    this.season = 1
    this.absoluteEpisode = Numbers.toNumber(newAbsoluteEpisode)
    this.video.fireChangeEvent()
  }

  setTheTVDB(id: number | string | undefined) {
    this.theTVDB = id !== undefined ? Numbers.toNumber('' + id) : undefined
    this.video.selectedSearchResultID = this.theTVDB
    this.video.fireChangeEvent()
  }

  setYear(newYear: string) {
    this.year = Numbers.toNumber(newYear)
    this.video.fireChangeEvent()
  }

  async selectSearchResultID(id: number | string | undefined) {
    const idNum = id !== undefined ? Numbers.toNumber('' + id) : undefined
    this.setTheTVDB(idNum)
    await this.loadSeries()
  }

  getOriginalLanguage() {
    return this.originalLanguage
  }

  getOriginalCountries() {
    return this.originalCountries
  }

  toJSON(): ITVShow {
    return {
      title: this.title,
      order: this.order,
      season: this.season,
      episode: this.episode,
      episodeTitle: this.episodeTitle,
      year: this.year,
      overview: this.overview,
      episodeOverview: this.episodeOverview,
      poster: this.poster,
      posterURL: this.posterURL,
      theTVDB: this.theTVDB,
      imdb: this.imdb,
      absoluteEpisode: this.absoluteEpisode,
      episodePoster: this.episodePoster,
      episodePosterURL: this.episodePosterURL,
      originalLanguage: this.originalLanguage,
      originalCountries: this.originalCountries
    }
  }
}

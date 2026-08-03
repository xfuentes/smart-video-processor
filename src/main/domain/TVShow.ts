/*
 * Smart Video Processor
 * Copyright (c) 2025-2026. Xavier Fuentes <xfuentes-dev@hotmail.com>
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
import { _ } from '../i18n'
import { EpisodeOrder, TVDBClient } from './clients/TVDBClient'
import { Strings } from '../../common/Strings'
import { Numbers } from '../util/numbers'
import { debug } from '../util/log'
import { JobStatus } from '../../common/@types/Job'
import { SearchBy } from '../../common/@types/Video'
import { ITVShow } from '../../common/@types/TVShow'
import { LanguageIETF } from '../../common/LanguageIETF'
import { Country } from '../../common/Countries'
import * as Path from 'node:path'
import fs from 'node:fs'

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
  public episodeCount?: number
  public isAnimation: boolean = false
  public genres?: string[]

  constructor(video: Video) {
    this.video = video
  }

  async search(searchBy: SearchBy) {
    this.video.searchResults = []
    if (searchBy === SearchBy.TVDB_POSITION || searchBy === SearchBy.TVDB_EP_NAME) {
      if (!this.theTVDB) {
        throw new Error('TVDB ID is mandatory')
      }
      await this.selectSearchResultID(this.theTVDB)
    } else {
      if (!this.title) {
        throw new Error('Series name is mandatory')
      }
      this.video.status = JobStatus.LOADING
      this.video.message = _('video.message.searching_series_tvdb', { defaultValue: 'Searching series on TheTVDB' })
      this.video.fireChangeEvent()
      this.video.searchResults = await TVDBClient.getInstance().searchSeriesByTitle(this.title, this.year)
      const seriesMatched = SearchResult.getBestMatch(this.video.searchResults, this.title, this.year)

      if (!seriesMatched) {
        this.video.progression.progress = -1
        this.showWarning(
          _('video.message.tvdb_no_exact_match', {
            defaultValue:
              'Unable to find an exact match on TheTVDB. Please check the information provided and try again.'
          })
        )
      } else {
        await this.selectSearchResultID(seriesMatched.id)
      }
    }
  }

  public async loadSeries(episodeSearchFailed = false) {
    if (!this.theTVDB) {
      throw new Error('TVDB ID is mandatory.')
    }

    this.video.message = _('video.message.retrieving_episode_details', { defaultValue: 'Retrieving episode details' })
    const matchedSearchResult = this.video.searchResults?.find((r) => r.id === this.theTVDB)
    const { episodeData, seriesData, episodeCount } = await TVDBClient.getInstance().retrieveSeriesDetails(
      this.theTVDB,
      this.order ?? 'official',
      this.episode,
      this.absoluteEpisode,
      this.season
    )

    this.video.matched =
      !episodeSearchFailed &&
      (!!this.episode || !!this.absoluteEpisode || !!(this.episodeTitle && !episodeSearchFailed)) &&
      !!episodeData

    this.imdb = seriesData.imdb
    this.title = seriesData.title
    this.poster = ''
    this.posterURL = seriesData.posterURL
    this.originalCountries = seriesData.countries
    this.originalLanguage = seriesData.language
    this.episodeCount = episodeCount
    this.isAnimation = matchedSearchResult?.isAnimation || seriesData.isAnimation || false
    if (matchedSearchResult) {
      matchedSearchResult.isAnimation = this.isAnimation
    }
    this.genres = seriesData.genres
    if (seriesData.year) {
      this.year = seriesData.year
    }

    if (this.episode || this.absoluteEpisode) {
      if (episodeData) {
        if (this.order !== 'absolute') {
          this.season = episodeData.seasonNumber
          this.episode = episodeData.episodeNumber
          this.absoluteEpisode = episodeData.absoluteNumber > 0 ? episodeData.absoluteNumber : undefined
        } else if (this.order === 'absolute') {
          this.absoluteEpisode = episodeData.absoluteNumber > 0 ? episodeData.absoluteNumber : episodeData.episodeNumber
          if (episodeData.id !== undefined) {
            try {
              const officialEpisode = await TVDBClient.getInstance().getEpisodeById(episodeData.id)
              this.season = officialEpisode.seasonNumber
              this.episode = officialEpisode.number
              if (officialEpisode.absoluteNumber > 0) {
                this.absoluteEpisode = officialEpisode.absoluteNumber
              }
            } catch (error) {
              debug(error)
            }
          }
        }
        this.episodeTitle = episodeData.title
        this.episodePosterURL = episodeData.posterURL
        this.episodeOverview = episodeData.overview
      }
    }
    this.episodePoster = ''
    this.overview = seriesData.overview

    if (!this.video.searchResults || this.video.searchResults.length === 0) {
      this.video.searchResults = [seriesData]
    }

    const tempDirectory = this.video.getTempDirectory()
    const seriesPosterPath = Path.join(this.video.getTempRootDirectory(), 'TVDB-' + this.theTVDB + '-poster.jpg')
    if (this.posterURL) {
      this.video.status = JobStatus.LOADING
      this.video.message = _('video.message.downloading_poster_tvdb', {
        defaultValue: 'Downloading poster image from TheTVDB.'
      })
      this.video.fireChangeEvent()
      if (!Files.fileExistsAndIsReadable(seriesPosterPath)) {
        fs.mkdirSync(this.video.getTempRootDirectory(), { recursive: true })
        await Files.downloadFile(this.posterURL, seriesPosterPath)
      }
      this.poster = seriesPosterPath
      debug(`Series poster file://${this.poster}`)
    }
    if (!this.episode && !this.absoluteEpisode) {
      if (episodeSearchFailed) {
        this.showWarning(
          _('video.message.tvdb_episode_not_found', {
            defaultValue: 'Episode not found. Please check the information provided and try again.'
          })
        )
      } else {
        this.showWarning(
          _('video.message.tvdb_episode_number_required', {
            defaultValue: 'Episode number not specified. Please provide a valid episode number and try again.'
          })
        )
      }
    } else if (!episodeData) {
      this.showWarning(
        _('video.message.tvdb_episode_not_found', {
          defaultValue: 'Episode not found. Please check the information provided and try again.'
        })
      )
    } else {
      const position = Strings.formatEpisodePosition(this.order, this.season, this.episode, this.absoluteEpisode, this.episodeCount)

      if (this.episodePosterURL || this.poster) {
        if (!this.episodePosterURL && this.poster) {
          this.video.poster = {
            path: this.poster,
            filename: 'cover.jpg',
            description: `TVDB Image ${this.posterURL}`,
            mimeType: 'image/jpeg'
          }
        } else if (this.episodePosterURL) {
          this.video.message = _('video.message.downloading_episode_tvdb', {
            defaultValue: 'Downloading episode image from TheTVDB.'
          })
          this.video.fireChangeEvent()
          const filename = `episode-${position}`
          fs.mkdirSync(tempDirectory, { recursive: true })
          const fullPath = Path.join(tempDirectory, 'TVDB-' + this.theTVDB + '-' + filename + '.jpg')
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
      this.video.title = `${this.title}${position ? ' - ' + position : ''}${this.episodeTitle ? ' - ' + this.episodeTitle : ''}`
      this.video.fireChangeEvent()
    }
  }

  setTitle(newTitle: string) {
    this.title = newTitle
  }

  setEpisodeTitle(newTitle: string) {
    this.episodeTitle = newTitle
  }

  setIMDB(newIMDB: string) {
    this.imdb = newIMDB
  }

  setOrder(order: EpisodeOrder) {
    this.order = order
  }

  setSeason(newSeason: string) {
    this.season = this.order === 'absolute' ? undefined : Numbers.toNumber(newSeason)
  }

  setEpisode(newEpisode: string) {
    this.episode = Numbers.toNumber(newEpisode)
  }

  setAbsoluteEpisode(newAbsoluteEpisode: string) {
    if (this.order === 'absolute') {
      const absoluteEpisode = Numbers.toNumber(newAbsoluteEpisode)
      this.season = undefined
      this.absoluteEpisode = absoluteEpisode
    }
  }

  setTheTVDB(id: number | string | undefined) {
    this.theTVDB = id !== undefined ? Numbers.toNumber('' + id) : undefined
    this.video.selectedSearchResultID = this.theTVDB
  }

  setYear(newYear: string) {
    this.year = Numbers.toNumber(newYear)
  }

  async selectSearchResultID(id: number | string | undefined) {
    const idNum = id !== undefined ? Numbers.toNumber('' + id) : undefined
    this.setTheTVDB(idNum)

    let episodeSearchFailed = false

    if (
      (this.video.searchBy === SearchBy.TITLE_EP_NAME || this.video.searchBy === SearchBy.TVDB_EP_NAME) &&
      idNum !== undefined
    ) {
      if (!this.episodeTitle) {
        episodeSearchFailed = true
      } else {
        try {
          const position = await TVDBClient.getInstance().searchEpisodeByTitle(
            idNum,
            this.order || 'official',
            this.episodeTitle
          )
          this.setSeason('' + (position.season ?? ''))
          this.setEpisode('' + (position.episodeNumber ?? ''))
          this.setAbsoluteEpisode('' + (position.absoluteEpisodeNumber ?? ''))
        } catch (e) {
          this.clearEpisodeNumbers()
          episodeSearchFailed = true
        }
      }
      this.video.fireChangeEvent()
    }

    await this.loadSeries(episodeSearchFailed)
  }

  private showWarning(message: string) {
    this.video.status = JobStatus.WARNING
    this.video.message = message
    console.log(Chalk.red(message))
    this.video.fireChangeEvent()
  }

  private clearEpisodeNumbers() {
    this.setSeason('')
    this.setEpisode('')
    this.setAbsoluteEpisode('')
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
      originalCountries: this.originalCountries,
      episodeCount: this.episodeCount,
      isAnimation: this.isAnimation,
      genres: this.genres
    }
  }
}

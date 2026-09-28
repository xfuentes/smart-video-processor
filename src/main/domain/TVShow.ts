/*
 * Smart Video Processor
 * Copyright (c) 2025-2026. Xavier Fuentes <xfuentes-dev@serviam.cc>
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
import { _ } from '../i18n'
import { EpisodeOrder, TVDBClient } from './clients/TVDBClient'
import { TMDBClient } from './clients/TMDBClient'
import { Strings } from '../../common/Strings'
import { Numbers } from '../util/numbers'
import { debug, info, warning } from '../util/log'
import { SearchBy } from '../../common/@types/Video'
import { ITVShow } from '../../common/@types/TVShow'
import { currentSettings } from './Settings'
import { TVShowMatchingSource } from '../../common/@types/Settings'
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
  public theMovieDB?: number
  public imdb?: string
  public absoluteEpisode?: number
  public episodePoster: string = ''
  public episodePosterURL: string = ''
  public originalLanguage: LanguageIETF | undefined
  public originalCountries: Country[] = []
  public episodeCount?: number
  public isAnimation: boolean = false
  public genres?: string[]
  private lastSearchSource: 'tvdb' | 'tmdb' = 'tvdb'

  constructor(video: Video) {
    this.video = video
  }

  async search(searchBy: SearchBy) {
    this.video.searchResults = []
    if (searchBy === SearchBy.TVDB_POSITION || searchBy === SearchBy.TVDB_EP_NAME) {
      if (!this.theTVDB) {
        throw new Error('TVDB ID is mandatory')
      }
      this.lastSearchSource = 'tvdb'
      await this.selectSearchResultID(this.theTVDB)
    } else if (searchBy === SearchBy.TMDB) {
      if (!this.theMovieDB) {
        throw new Error('TMDB ID is mandatory')
      }
      this.lastSearchSource = 'tmdb'
      await this.selectTMDBSearchResultID(this.theMovieDB)
    } else {
      if (!this.title) {
        throw new Error('Series name is mandatory')
      }
      // Tries the preferred database first (per settings), then falls back to the other one before giving up.
      const primary = currentSettings.tvShowMatchingPriority === TVShowMatchingSource.TMDB ? 'tmdb' : 'tvdb'
      const secondary = primary === 'tvdb' ? 'tmdb' : 'tvdb'
      if (!(await this.searchTitleOn(primary, this.title)) && !(await this.searchTitleOn(secondary, this.title))) {
        this.video.progression.progress = -1
        this.video.showWarning('video.message.series_no_match', {
          defaultValue:
            'Unable to find an exact match on TheTVDB or TheMovieDB. Please check the information provided and try again.'
        })
      }
    }
  }

  /**
   * Searches this show by title on the given database. Returns true and selects the best match when found.
   */
  private async searchTitleOn(source: 'tvdb' | 'tmdb', title: string): Promise<boolean> {
    if (source === 'tvdb') {
      this.video.showLoading('video.message.searching_series_tvdb', { defaultValue: 'Searching series on TheTVDB' })
      this.video.searchResults = await TVDBClient.getInstance().searchSeriesByTitle(title, this.year)
    } else {
      this.video.showLoading('video.message.searching_series_tmdb', { defaultValue: 'Searching series on TheMovieDB' })
      this.video.searchResults = await TMDBClient.getInstance().searchTVByNameYear(title, this.year)
    }
    const seriesMatched = SearchResult.getBestMatch(this.video.searchResults, title, this.year)
    if (!seriesMatched) {
      return false
    }
    if (source === 'tvdb') {
      this.lastSearchSource = 'tvdb'
      await this.selectSearchResultID(seriesMatched.id)
    } else {
      this.lastSearchSource = 'tmdb'
      await this.selectTMDBSearchResultID(seriesMatched.id)
    }
    return true
  }

  public async loadSeries(episodeSearchFailed = false) {
    if (!this.theTVDB) {
      throw new Error('TVDB ID is mandatory.')
    }

    this.video.message = _('video.message.retrieving_episode_details', { defaultValue: 'Retrieving episode details' })
    info('video.message.retrieving_episode_details', { defaultValue: 'Retrieving episode details' })
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
              warning('log.tvdb.api_error', { defaultValue: 'TVDB API error: {message}', message: String(error) })
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
      this.video.showLoading('video.message.downloading_poster_tvdb', {
        defaultValue: 'Downloading poster image from TheTVDB.'
      })
      if (!Files.fileExistsAndIsReadable(seriesPosterPath)) {
        fs.mkdirSync(this.video.getTempRootDirectory(), { recursive: true })
        await Files.downloadFile(this.posterURL, seriesPosterPath)
      }
      this.poster = seriesPosterPath
      debug('log.tvdb.series_poster', { defaultValue: 'Series poster file://{poster}', poster: this.poster })
    }
    if (!this.episode && !this.absoluteEpisode) {
      if (episodeSearchFailed) {
        this.video.showWarning('video.message.tvdb_episode_not_found', {
          defaultValue: 'Episode not found. Please check the information provided and try again.'
        })
      } else {
        this.video.showWarning('video.message.tvdb_episode_number_required', {
          defaultValue: 'Episode number not specified. Please provide a valid episode number and try again.'
        })
      }
    } else if (!episodeData) {
      this.video.showWarning('video.message.tvdb_episode_not_found', {
        defaultValue: 'Episode not found. Please check the information provided and try again.'
      })
    } else {
      const position = Strings.formatEpisodePosition(
        this.order,
        this.season,
        this.episode,
        this.absoluteEpisode,
        this.episodeCount
      )

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
          info('video.message.downloading_episode_tvdb', {
            defaultValue: 'Downloading episode image from TheTVDB.'
          })
          this.video.fireChangeEvent()
          const filename = `episode-${position}`
          fs.mkdirSync(tempDirectory, { recursive: true })
          const fullPath = Path.join(tempDirectory, 'TVDB-' + this.theTVDB + '-' + filename + '.jpg')
          this.episodePoster = await Files.downloadFile(this.episodePosterURL, fullPath)
          debug('log.tvdb.episode_image', {
            defaultValue: 'Wrote episode image file://{poster}',
            poster: this.episodePoster
          })
          this.video.poster = {
            path: this.episodePoster,
            filename: 'cover.jpg',
            description: `TVDB Image ${this.episodePosterURL}`,
            mimeType: 'image/jpeg'
          }
        }
      }
      this.video.title = `${this.title}${position ? ' - ' + position : ''}${this.episodeTitle ? ' - ' + this.episodeTitle : ''}`
      this.video.generateEncoderSettings(false)
    }
  }

  /**
   * Loads series and episode details from TheMovieDB, used when the show could not be matched on TheTVDB.
   */
  public async loadSeriesFromTMDB() {
    if (!this.theMovieDB) {
      throw new Error('TMDB ID is mandatory.')
    }

    this.video.message = _('video.message.retrieving_episode_details', { defaultValue: 'Retrieving episode details' })
    info('video.message.retrieving_episode_details', { defaultValue: 'Retrieving episode details' })
    const matchedSearchResult = this.video.searchResults?.find((r) => r.id === this.theMovieDB)
    const { episodeData, seriesData, episodeCount } = await TMDBClient.getInstance().retrieveTVSeriesDetails(
      this.theMovieDB,
      this.episode,
      this.season
    )

    this.video.matched = !!this.episode && !!episodeData

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

    if (this.episode && episodeData) {
      this.season = episodeData.seasonNumber
      this.episode = episodeData.episodeNumber
      this.episodeTitle = episodeData.title
      this.episodePosterURL = episodeData.posterURL
      this.episodeOverview = episodeData.overview
    }
    this.episodePoster = ''
    this.overview = seriesData.overview

    if (!this.video.searchResults || this.video.searchResults.length === 0) {
      this.video.searchResults = [seriesData]
    }

    const tempDirectory = this.video.getTempDirectory()
    if (this.posterURL) {
      this.video.showLoading('video.message.downloading_poster_tmdb', {
        defaultValue: 'Downloading poster image from TheMovieDB.'
      })
      const seriesPosterPath = Path.join(this.video.getTempRootDirectory(), 'TMDB-' + this.theMovieDB + '-poster.jpg')
      if (!Files.fileExistsAndIsReadable(seriesPosterPath)) {
        fs.mkdirSync(this.video.getTempRootDirectory(), { recursive: true })
        await Files.downloadFile(this.posterURL, seriesPosterPath)
      }
      this.poster = seriesPosterPath
      debug('log.tmdb.series_poster', { defaultValue: 'Series poster file://{poster}', poster: this.poster })
    }

    if (!this.episode) {
      this.video.showWarning('video.message.tvdb_episode_number_required', {
        defaultValue: 'Episode number not specified. Please provide a valid episode number and try again.'
      })
    } else if (!episodeData) {
      this.video.showWarning('video.message.tvdb_episode_not_found', {
        defaultValue: 'Episode not found. Please check the information provided and try again.'
      })
    } else {
      const position = Strings.formatEpisodePosition(
        this.order,
        this.season,
        this.episode,
        this.absoluteEpisode,
        this.episodeCount
      )

      if (this.episodePosterURL || this.poster) {
        if (!this.episodePosterURL && this.poster) {
          this.video.poster = {
            path: this.poster,
            filename: 'cover.jpg',
            description: `TMDB Image ${this.posterURL}`,
            mimeType: 'image/jpeg'
          }
        } else if (this.episodePosterURL) {
          this.video.message = _('video.message.downloading_episode_tmdb', {
            defaultValue: 'Downloading episode image from TheMovieDB.'
          })
          info('video.message.downloading_episode_tmdb', {
            defaultValue: 'Downloading episode image from TheMovieDB.'
          })
          this.video.fireChangeEvent()
          const filename = `episode-${position}`
          fs.mkdirSync(tempDirectory, { recursive: true })
          const fullPath = Path.join(tempDirectory, 'TMDB-' + this.theMovieDB + '-' + filename + '.jpg')
          this.episodePoster = await Files.downloadFile(this.episodePosterURL, fullPath)
          debug('log.tmdb.episode_image', {
            defaultValue: 'Wrote episode image file://{poster}',
            poster: this.episodePoster
          })
          this.video.poster = {
            path: this.episodePoster,
            filename: 'cover.jpg',
            description: `TMDB Image ${this.episodePosterURL}`,
            mimeType: 'image/jpeg'
          }
        }
      }
      this.video.title = `${this.title}${position ? ' - ' + position : ''}${this.episodeTitle ? ' - ' + this.episodeTitle : ''}`
      this.video.generateEncoderSettings(false)
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

  async setOrder(order: EpisodeOrder) {
    if (this.order === order) {
      return
    }
    this.order = order
    if (this.theTVDB && (this.episode !== undefined || this.absoluteEpisode !== undefined)) {
      await this.loadSeries()
    }
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

  setTheMovieDB(id: number | string | undefined) {
    this.theMovieDB = id !== undefined ? Numbers.toNumber('' + id) : undefined
    this.video.selectedSearchResultID = this.theMovieDB
  }

  setYear(newYear: string) {
    this.year = Numbers.toNumber(newYear)
  }

  async selectSearchResultID(id: number | string | undefined) {
    if (this.lastSearchSource === 'tmdb') {
      await this.selectTMDBSearchResultID(id)
      return
    }

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

  async selectTMDBSearchResultID(id: number | string | undefined) {
    this.lastSearchSource = 'tmdb'
    const idNum = id !== undefined ? Numbers.toNumber('' + id) : undefined
    this.setTheMovieDB(idNum)
    await this.loadSeriesFromTMDB()
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
      theMovieDB: this.theMovieDB,
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

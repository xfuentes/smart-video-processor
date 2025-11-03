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
import { Numbers } from '../util/numbers'
import { TMDBClient } from './clients/TMDBClient'
import Chalk from 'chalk'
import { Countries, Country } from '../../common/Countries'
import { LanguageIETF, Languages } from '../../common/LanguageIETF'
import { debug } from '../util/log'
import { JobStatus } from '../../common/@types/Job'
import { SearchBy } from '../../common/@types/Video'
import { EditionType, IMovie } from '../../common/@types/Movie'
import Path from 'node:path'

export default class Movie implements IMovie {
  public title: string = ''
  public year?: number
  public overview?: string
  public poster: string = ''
  public posterURL?: string
  public tmdb?: number
  public imdb?: string
  public originalLanguage?: LanguageIETF
  public rating?: number
  public originalCountries: Country[] = []
  public edition: EditionType = EditionType.THEATRICAL
  private video: Video
  private duration?: number

  constructor(video: Video) {
    this.video = video
  }

  async search(by: SearchBy) {
    this.video.searchResults = []
    if (by === SearchBy.TMDB) {
      await this.load()
    } else {
      this.tmdb = undefined
      if (by === SearchBy.TITLE) {
        this.imdb = ''
        if (!this.title) {
          throw new Error('Movie name is mandatory')
        }
      } else if (by === SearchBy.IMDB) {
        if (!this.imdb) {
          throw new Error('IMDB ID is mandatory')
        }
      }
      this.video.status = JobStatus.LOADING
      this.video.message = 'Searching movie on TMDB.'
      this.video.fireChangeEvent()
      if (by === SearchBy.TITLE) {
        this.video.searchResults = await TMDBClient.getInstance().searchMovieByNameYear(this.title, this.year)
      } else if (this.imdb) {
        this.video.searchResults = await TMDBClient.getInstance().searchMovieByImdb(this.imdb)
      }
      debug('### SEARCH RESULTS ###')
      debug(this.video.searchResults)
      const movieMatched = SearchResult.getPerfectMatch(this.video.searchResults, this.title, this.year)

      if (!movieMatched) {
        this.video.autoModePossible = false
        this.video.status = JobStatus.WARNING
        if (by === SearchBy.TITLE) {
          this.video.message =
            'Unable to find an exact match on TMDB. Please check the information provided and try again.'
        } else {
          this.video.message = 'Unable to find the movie on TMDB.'
        }
        debug(Chalk.red(this.video.message))
        this.video.fireChangeEvent()
      } else {
        await this.selectSearchResultID(movieMatched.id)
      }
    }
  }

  async load() {
    if (!this.tmdb) {
      throw new Error('TMDB ID is mandatory')
    }
    this.video.status = JobStatus.LOADING
    this.video.message = 'Retrieving movie details from TMDB.'
    this.video.fireChangeEvent()
    try {
      const movieData = await TMDBClient.getInstance().retrieveMovieDetails(this.tmdb)
      this.originalCountries = movieData.countries
        .map((c) => Countries.getCountryByCode(c))
        .filter((c) => c != undefined)
      this.originalLanguage = Languages.guessLanguageIETFFromCountries(movieData.language, this.originalCountries)
      this.title = movieData.title || this.title
      this.overview = movieData.overview
      this.year = movieData.year || this.year // Do not overwrite year if not defined in DB to allow user to manually enter it
      this.posterURL = movieData.posterUrl
      this.imdb = movieData.imdb
      this.rating = movieData.rating
      this.duration = movieData.duration
      const tracksDuration = this.video.getTracksDuration()
      if (
        this.duration != undefined &&
        Math.round(this.duration / 1000) < Math.round((tracksDuration - tracksDuration / 10) / 1000)
      ) {
        this.setEdition(EditionType.EXTENDED)
      } else {
        this.setEdition(EditionType.THEATRICAL)
      }

      debug('GUESS COUNTRY')
      debug(movieData.countries)
      debug(this.originalLanguage)
      if (this.video.searchResults.length === 0) {
        this.video.searchResults.push(
          new SearchResult(
            this.tmdb,
            this.title,
            this.year,
            this.title,
            this.overview,
            this.posterURL,
            this.originalLanguage,
            this.originalCountries,
            this.imdb,
            this.rating
          )
        )
        this.setTMDB(this.tmdb)
      }

      const fullPath = Path.join(this.video.getTempDirectory(), 'TMDB-' + this.tmdb + '-poster.jpg')
      if (this.posterURL) {
        this.video.status = JobStatus.LOADING
        this.video.message = 'Downloading poster image from TMDB.'
        this.video.fireChangeEvent()
        this.poster = await Files.downloadFile(this.posterURL, fullPath)
        debug(`Wrote poster file://${this.poster}`)
      }
      if (this.poster && this.posterURL) {
        this.video.poster = {
          path: this.poster,
          description: `TMDB Poster ${this.posterURL}`,
          mimeType: 'image/jpeg',
          filename: 'cover.jpg'
        }
      }
      this.video.title = `${this.title} (${this.year})`
      this.video.matched = true
      this.video.status = JobStatus.WAITING
      this.video.message = ''
      this.video.fireChangeEvent()
    } catch (error) {
      this.video.status = JobStatus.ERROR
      this.video.message = (error as Error).message
      this.video.fireChangeEvent()
    }
  }

  setTitle(newTitle: string) {
    this.title = newTitle
  }

  setYear(newYear: string) {
    this.year = Numbers.toNumber(newYear)
  }

  setIMDB(newIMDB: string) {
    this.imdb = newIMDB
  }

  setTMDB(tmdbId: number | string | undefined) {
    this.tmdb = tmdbId !== undefined ? Numbers.toNumber('' + tmdbId) : undefined
    this.video.selectedSearchResultID = this.tmdb
  }

  async selectSearchResultID(id: number | string | undefined) {
    const idNum = id !== undefined ? Numbers.toNumber('' + id) : undefined
    this.setTMDB(idNum)
    const matchedSearchResult = this.video.searchResults.find((r) => r.id === idNum)
    if (matchedSearchResult) {
      this.title = matchedSearchResult.title
      this.year = matchedSearchResult.year
    }
    await this.load()
  }

  getOriginalLanguage() {
    return this.originalLanguage
  }

  getOriginalCountries() {
    return this.originalCountries
  }

  setEdition(edition: EditionType) {
    this.edition = edition
  }

  toJSON(): IMovie {
    return {
      title: this.title,
      year: this.year,
      overview: this.overview,
      poster: this.poster,
      posterURL: this.posterURL,
      tmdb: this.tmdb,
      imdb: this.imdb,
      originalLanguage: this.originalLanguage,
      rating: this.rating,
      originalCountries: this.originalCountries,
      edition: this.edition
    }
  }
}

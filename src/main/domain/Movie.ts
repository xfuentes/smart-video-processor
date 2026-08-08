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
import { Numbers } from '../util/numbers'
import { TMDBClient } from './clients/TMDBClient'
import { Countries, Country } from '../../common/Countries'
import { LanguageIETF, Languages } from '../../common/LanguageIETF'
import { debug } from '../util/log'
import { SearchBy } from '../../common/@types/Video'
import { EditionType, IMovie } from '../../common/@types/Movie'
import Path from 'node:path'
import fs from 'node:fs'

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
  public isAnimation: boolean = false
  public genres?: string[]
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
      this.video.showLoading('video.message.searching_movie_tmdb', { defaultValue: 'Searching movie on TMDB.' })
      if (by === SearchBy.TITLE) {
        this.video.searchResults = await TMDBClient.getInstance().searchMovieByNameYear(this.title, this.year)
      } else if (this.imdb) {
        this.video.searchResults = await TMDBClient.getInstance().searchMovieByImdb(this.imdb)
      }
      debug('log.movie.search_results', { defaultValue: '### MOVIE SEARCH RESULTS ###' })
      debug('log.debug_data', { defaultValue: '{value}', value: JSON.stringify(this.video.searchResults) })
      const movieMatched = SearchResult.getPerfectMatch(this.video.searchResults, this.title, this.year)

      if (!movieMatched) {
        this.video.autoModePossible = false
        const key = by === SearchBy.TITLE ? 'video.message.tmdb_no_exact_match' : 'video.message.tmdb_not_found'
        const options =
          by === SearchBy.TITLE
            ? {
                defaultValue:
                  'Unable to find an exact match on TMDB. Please check the information provided and try again.'
              }
            : { defaultValue: 'Unable to find the movie on TMDB.' }
        this.video.showWarning(key, options)
      } else {
        await this.selectSearchResultID(movieMatched.id)
      }
    }
  }

  async load() {
    if (!this.tmdb) {
      throw new Error('TMDB ID is mandatory')
    }
    this.video.showLoading('video.message.retrieving_movie_tmdb', { defaultValue: 'Retrieving movie details from TMDB.' })
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
      this.isAnimation = movieData.isAnimation
      this.genres = movieData.genres
      const tracksDuration = this.video.getTracksDuration()
      if (
        this.duration != undefined &&
        Math.round(this.duration / 1000) < Math.round((tracksDuration - tracksDuration / 10) / 1000)
      ) {
        this.setEdition(EditionType.EXTENDED)
      } else {
        this.setEdition(EditionType.THEATRICAL)
      }

      debug('log.movie.guess_country', { defaultValue: '# GUESS COUNTRY #' })
      debug('log.debug_data', { defaultValue: '{value}', value: JSON.stringify(movieData.countries) })
      debug('log.movie.original_language', { defaultValue: '# ORIGINAL LANGUAGE #' })
      debug('log.debug_data', { defaultValue: '{value}', value: JSON.stringify(this.originalLanguage) })
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

      const tempDirectory = this.video.getTempDirectory()
      fs.mkdirSync(tempDirectory, { recursive: true })

      const fullPath = Path.join(tempDirectory, 'TMDB-' + this.tmdb + '-poster.jpg')
      if (this.posterURL) {
        this.video.showLoading('video.message.downloading_poster_tmdb', { defaultValue: 'Downloading poster image from TMDB.' })
        this.poster = await Files.downloadFile(this.posterURL, fullPath)
        debug('log.movie.wrote_poster', { defaultValue: 'Wrote poster file://{poster}', poster: this.poster })
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
      this.video.showWaiting()
    } catch (err) {
      this.video.showError(
        (err as Error).message,
        'video.message.tmdb_error',
        { defaultValue: '{error}', error: (err as Error).message }
      )
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
      if (matchedSearchResult.year) {
        this.year = matchedSearchResult.year
      }
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
      edition: this.edition,
      isAnimation: this.isAnimation,
      genres: this.genres
    }
  }
}

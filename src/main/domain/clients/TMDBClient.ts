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

import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { SearchResult } from '../SearchResult'
import { MovieData } from '../MovieData'
import { RateLimiter } from './RateLimiter'
import { currentSettings } from '../Settings'
import { Languages } from '../LanguageIETF'
import { debug } from '../../util/log'

const TMDB_TOKEN =
  'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMmVmODJlOTcwNmE4NjVjN2IzYmJjMTlkMzczNWUxYSIsIm5iZiI6MTU3NjA1MDI1MC41NTAwMDAyLCJzdWIiOiI1ZGYwOWU0YWVkYTRiNzAwMTUwNDMyM2YiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.dtLAYJZYn_skkO7fbp_fMF61QbbAlihCAJAkVR8BOVo'
const TMDB_API_URL = 'https://api.themoviedb.org/3'
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w1280'

export class TMDBClient {
  private static instance: TMDBClient
  rateLimiter = new RateLimiter(10)
  private readonly tmdb: AxiosInstance | undefined

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): TMDBClient {
    if (!TMDBClient.instance) {
      TMDBClient.instance = new TMDBClient()
    }
    return TMDBClient.instance
  }

  public async searchMovieByImdb(imdb: string): Promise<SearchResult[]> {
    const tmdb = await this.getTMDBSession()
    let response: AxiosResponse<TMDBSearchIMDBResult>
    try {
      response = await tmdb.get<TMDBSearchIMDBResult>('/find/' + imdb, {
        params: {
          language: 'en',
          external_source: 'imdb_id'
        }
      })
    } catch (error) {
      debug(error)
      const response = error as AxiosError<TMDBResponse>
      throw new Error('Unexpected TMDB API Error: ' + response.response?.data.status_message)
    }
    const results: SearchResult[] = []
    for (const r of response.data.movie_results) {
      results.push(
        new SearchResult(
          r.id,
          r.title,
          new Date(r.release_date).getFullYear(),
          r.original_title,
          r.overview,
          TMDB_IMAGE_URL + r.poster_path,
          Languages.getLanguageByCode(r.original_language)
        )
      )
    }
    return results
  }

  public async searchMovieByNameYear(
    title: string,
    year: number | undefined = undefined
  ): Promise<SearchResult[]> {
    const tmdb = await this.getTMDBSession()
    // TODO: Handle pagination
    let response: AxiosResponse<TMDBSearchResults>
    try {
      response = await tmdb.get<TMDBSearchResults>('/search/movie', {
        params: {
          query: title,
          ...(year ? { year } : {}),
          language: currentSettings.favoriteLanguages[0] ?? 'en',
          page: 1,
          include_adult: false
        }
      })
    } catch (error) {
      debug(error)
      const response = error as AxiosError<TMDBResponse>
      throw new Error('Unexpected TMDB API Error: ' + response.response?.data.status_message)
    }
    const results: SearchResult[] = []
    for (const r of response.data.results) {
      results.push(
        new SearchResult(
          r.id,
          r.title,
          new Date(r.release_date).getFullYear(),
          r.original_title,
          r.overview,
          TMDB_IMAGE_URL + r.poster_path,
          Languages.getLanguageByCode(r.original_language)
        )
      )
    }
    if (year && results.length === 0) {
      // Try without entering the year if no results found.
      return await this.searchMovieByNameYear(title)
    }
    return results
  }

  public async retrieveMovieDetails(tmdbId: number): Promise<MovieData> {
    const tmdb = await this.getTMDBSession()
    let response: AxiosResponse<TMDBDetails>
    try {
      response = await tmdb.get<TMDBDetails>('/movie/' + tmdbId, {
        params: currentSettings.favoriteLanguages[0]
          ? {
              language: currentSettings.favoriteLanguages[0]
            }
          : {}
      })
    } catch (error) {
      debug(error)
      const response = error as AxiosError<TMDBResponse>
      throw new Error('Unexpected TMDB API Error: ' + response.response?.data.status_message)
    }

    let movieDetails = response.data

    // If no overview, lets try to retrieve the movie details without translation.
    try {
      response = await tmdb.get<TMDBDetails>('/movie/' + tmdbId)
      if (!movieDetails.runtime || response.data.runtime > movieDetails.runtime) {
        // Using US runtime if longer.
        movieDetails.runtime = response.data.runtime
      }
      if (!movieDetails.overview) {
        movieDetails = response.data
      }
    } catch (error) {
      /* empty */
    }

    return new MovieData(
      movieDetails.id,
      movieDetails.title.replace(/\u200E/g, ''),
      new Date(movieDetails.release_date).getFullYear(),
      movieDetails.overview,
      movieDetails.poster_path ? TMDB_IMAGE_URL + movieDetails.poster_path : undefined,
      movieDetails.original_language,
      movieDetails.origin_country ?? [],
      !movieDetails.imdb_id ? undefined : movieDetails.imdb_id,
      movieDetails.vote_average / 2,
      movieDetails.runtime ? movieDetails.runtime * 60 : undefined
    )
  }

  private async getTMDBSession(): Promise<AxiosInstance> {
    let tmdb: AxiosInstance
    await this.rateLimiter.slows()

    if (this.tmdb !== undefined) {
      tmdb = this.tmdb
      return tmdb
    } else {
      tmdb = axios.create({ baseURL: TMDB_API_URL })
      tmdb.defaults.headers.common['Authorization'] = `Bearer ${TMDB_TOKEN}`
      return tmdb
    }
  }
}

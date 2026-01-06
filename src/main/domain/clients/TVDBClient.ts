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
import { EpisodeData } from '../EpisodeData'
import { RateLimiter } from './RateLimiter'
import { Languages } from '../../../common/LanguageIETF'
import { Countries } from '../../../common/Countries'
import { currentSettings } from '../Settings'
import { debug } from '../../util/log'

const THE_TVDB_API_KEY = 'f8389a4c-1ad6-4193-b7c1-b74943ef2dcf'
const THE_TVDB_API_URL = 'https://api4.thetvdb.com/v4'

type SeriesEpisode = {
  episodeData: EpisodeData
  seriesData: SearchResult
}

export type EpisodeOrder = 'official' | 'dvd' | 'absolute'

export class TVDBClient {
  private static instance: TVDBClient
  rateLimiter = new RateLimiter(10)
  private readonly tvdb: AxiosInstance | undefined
  private retrieveTokenPromise: Promise<AxiosResponse<TVDBLoginResponse>> | undefined

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  public static getInstance(): TVDBClient {
    if (!TVDBClient.instance) {
      TVDBClient.instance = new TVDBClient()
    }
    return TVDBClient.instance
  }

  public async searchSeries(name: string, year: number | undefined = undefined): Promise<SearchResult[]> {
    const tvdb = await this.getTVDBSession()
    // TODO: Handle pagination
    let response
    try {
      response = await tvdb.get<TVDBSearchResponses>('/search', {
        params: {
          query: name,
          ...(year ? { year } : {}),
          type: 'series',
          offset: 0,
          limit: 10
        }
      })
    } catch (error) {
      debug(error)
      const response = error as AxiosError<TVDBSeriesResponse>
      throw new Error('Unexpected TVDB API Error: ' + response.response?.data.message)
    }
    const results: SearchResult[] = []
    for (const r of response.data.data) {
      let langCode = currentSettings.favoriteLanguages[0] ?? 'en'
      if (langCode.indexOf('-') != -1) {
        langCode = langCode.substring(0, langCode.indexOf('-'))
      }
      const favoriteLanguage = Languages.getLanguageByCode(langCode)
      const language = Languages.getLanguageByCode(r.primary_language)
      const country = Countries.getCountryByCode(r.country)
      const imdb = r.remote_ids
        ?.filter((rObj) => rObj.sourceName === 'IMDB')
        .map((rObj) => rObj.id)
        .pop()
      const originalName = r.name
      let name = originalName
      let overview = r.overview

      if (favoriteLanguage !== undefined) {
        if (r.translations[favoriteLanguage.code] !== undefined) {
          name = r.translations[favoriteLanguage.code]
        } else {
          for (const code of favoriteLanguage?.altCodes ?? []) {
            if (r.translations[code] !== undefined) {
              name = r.translations[code]
              break
            }
          }
        }
        if (r.overviews) {
          if(r.overviews[favoriteLanguage.code] !== undefined) {
            overview = r.overviews[favoriteLanguage.code]
          } else {
            for (const code of favoriteLanguage?.altCodes ?? []) {
              if (r.overviews[code] !== undefined) {
                overview = r.overviews[code]
                break
              }
            }
          }
        }
      }

      results.push(
        new SearchResult(
          Number.parseInt(r.tvdb_id),
          name,
          Number.parseInt(r.year),
          originalName,
          overview,
          r.image_url,
          language,
          country ? [country] : [],
          imdb
        )
      )
    }
    return results
  }

  public async retrieveSeriesDetails(
    tvdbId: number,
    order: EpisodeOrder,
    episodeNumber: number | undefined,
    absoluteEpisodeNumber: number | undefined,
    season: number | undefined
  ): Promise<SeriesEpisode> {
    const tvdb = await this.getTVDBSession()
    let response: AxiosResponse<TVDBSeriesResponse> | undefined = undefined

    try {
      response = await tvdb.get<TVDBSeriesResponse>(`/series/${tvdbId}/episodes/${order}`, {
        params: {
          ...(season !== undefined ? { season } : { season: 1 }),
          episodeNumber: episodeNumber || absoluteEpisodeNumber || 1
        }
      })
    } catch (error) {
      debug(error)
      const response = error as AxiosError<TVDBSeriesResponse>
      throw new Error('Unexpected TVDB API Error: ' + response.response?.data.message)
    }

    const episodeData = response.data.data.episodes.pop()
    const seriesData = response.data.data.series
    if (episodeData === undefined) {
      throw new Error('TVDB: Episode Data Not Found')
    }
    const country = Countries.getCountryByCode(seriesData.originalCountry)
    const language = Languages.guessLanguageIETFFromCountries(seriesData.originalLanguage, country ? [country] : [])
    const name = this.cleanupSeriesTitle(seriesData.name)
    const result = {
      episodeData: new EpisodeData(
        episodeData.number,
        episodeData.seasonNumber,
        episodeData.absoluteNumber,
        episodeData.name,
        episodeData.image,
        episodeData.overview
      ),
      seriesData: new SearchResult(
        seriesData.id,
        name,
        Number.parseInt(seriesData.year),
        name,
        seriesData.overview,
        seriesData.image,
        language,
        country ? [country] : []
      )
    }
    let langCode = currentSettings.favoriteLanguages[0] ?? 'en'
    if (langCode.indexOf('-') != -1) {
      langCode = langCode.substring(0, langCode.indexOf('-'))
    }
    const favoriteLanguage = Languages.getLanguageByCode(langCode)
    let trCode: string | undefined = undefined
    if (favoriteLanguage != undefined && favoriteLanguage.code !== result.seriesData.language?.code) {
      trCode = Languages.getMatchingCodeFromCodeList(favoriteLanguage, response.data.data.series.nameTranslations)
    }
    if (trCode != undefined) {
      try {
        const seriesTranslation = await tvdb.get<TVDBTranslation>(`/series/${tvdbId}/translations/${trCode}`)
        if (seriesTranslation.data.data.name) {
          result.seriesData.title = this.cleanupSeriesTitle(seriesTranslation.data.data.name)
        }
        if (seriesTranslation.data.data.overview) {
          result.seriesData.overview = seriesTranslation.data.data.overview
        }
      } catch (error) {
        debug(error)
        const response = error as AxiosError<TVDBSeriesResponse>
        throw new Error('Unexpected TVDB API Error: ' + response.response?.data.message)
      }
      try {
        const episodesTranslation = await tvdb.get<TVDBEpisodesTranslationResponse>(
          `/series/${tvdbId}/episodes/${order}/${trCode}`
        )
        result.seriesData.posterURL = episodesTranslation.data.data.image
        for (const episode of episodesTranslation.data.data.episodes) {
          if (
            ((order === 'official' || order === 'dvd') &&
              episode.seasonNumber === season &&
              episode.number === episodeNumber) ||
            (order === 'absolute' && episode.absoluteNumber === absoluteEpisodeNumber)
          ) {
            if (episode.name) {
              result.episodeData.title = episode.name
            }
            if (episode.overview) {
              result.episodeData.overview = episode.overview
            }
            break
          }
        }
      } catch (error) {
        debug(error)
        const response = error as AxiosError<TVDBSeriesResponse>
        throw new Error('Unexpected TVDB API Error: ' + response.response?.data.message)
      }
    }
    return result
  }

  private cleanupSeriesTitle(title: string): string {
    return title.replace(/\s*\((\d+|\w+)\)$/gi, '')
  }

  private async getTVDBSession(): Promise<AxiosInstance> {
    let tvdb: AxiosInstance
    await this.rateLimiter.slows()

    if (this.tvdb !== undefined) {
      tvdb = this.tvdb
      return tvdb
    } else {
      if (this.retrieveTokenPromise === undefined) {
        this.retrieveTokenPromise = axios.post(`${THE_TVDB_API_URL}/login`, `{"apikey": "${THE_TVDB_API_KEY}"}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      }
      let response
      try {
        response = await this.retrieveTokenPromise
      } catch (error) {
        debug(error)
        const response = error as AxiosError<TVDBSeriesResponse>
        throw new Error('Unexpected TVDB API Error: ' + response.response?.data.message)
      } finally {
        this.retrieveTokenPromise = undefined
      }
      if (response) {
        tvdb = axios.create({ baseURL: THE_TVDB_API_URL })
        tvdb.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`
        return tvdb
      } else {
        debug('No Response but no Error as well ?!?')
        throw new Error('TVDB: Unexpected API Error')
      }
    }
  }
}

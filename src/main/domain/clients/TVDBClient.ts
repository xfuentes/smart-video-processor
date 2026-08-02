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

import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import { SearchResult } from '../SearchResult'
import { EpisodeData } from '../EpisodeData'
import { RateLimiter } from './RateLimiter'
import { Languages } from '../../../common/LanguageIETF'
import { Countries } from '../../../common/Countries'
import { currentSettings } from '../Settings'
import { _ } from '../../i18n'
import { debug } from '../../util/log'
import { simpleCachingAdapter } from './SimpleCachingAdapter'
import { Strings } from '../../../common/Strings'

const THE_TVDB_API_KEY = 'f8389a4c-1ad6-4193-b7c1-b74943ef2dcf'
const THE_TVDB_API_URL = 'https://api4.thetvdb.com/v4'

type SeriesEpisode = {
  episodeData: EpisodeData | undefined
  seriesData: SearchResult
  episodeCount: number
}

import type { EpisodeOrder } from '../../../common/@types/EpisodeOrder'

export { type EpisodeOrder } from '../../../common/@types/EpisodeOrder'

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

  public async getLanguages(): Promise<TVDBLanguage[]> {
    const tvdb = await this.getTVDBSession()
    let response
    try {
      response = await tvdb.get<TVDBLanguagesResponse>('/languages')
    } catch (error) {
      debug(error)
      const response = error as AxiosError<TVDBLanguagesResponse>
      throw new Error('Unexpected TVDB API Error: ' + response.response?.data.message)
    }
    return response.data.data
  }

  public async searchSeriesByTitle(title: string, year: number | undefined = undefined): Promise<SearchResult[]> {
    const tvdb = await this.getTVDBSession()
    let response
    try {
      response = await tvdb.get<TVDBSearchResponses>('/search', {
        params: {
          query: title,
          ...(year ? { year } : {}),
          type: 'series',
          offset: 0,
          limit: 20
        }
      })
    } catch (error) {
      debug(error)
      const response = error as AxiosError<TVDBSeriesResponse>
      throw new Error('Unexpected TVDB API Error: ' + response.response?.data.message)
    }
    const results: SearchResult[] = []
    for (const r of response.data.data) {
      const language = Languages.getLanguageByCode(r.primary_language)
      const country = Countries.getCountryByCode(r.country)
      const imdb = r.remote_ids
        ?.filter((rObj) => rObj.sourceName === 'IMDB')
        .map((rObj) => rObj.id)
        .pop()
      const originalName = r.name
      let name = originalName
      let overview = r.overview
      let nameFound = false
      let overviewFound = false

      for (const langCode of [currentSettings.language, ...currentSettings.additionalTvSearchLanguages]) {
        const favoriteLanguage = Languages.getLanguageByCode(langCode)
        if (favoriteLanguage === undefined) continue

        if (!nameFound) {
          if (r.translations[favoriteLanguage.code] !== undefined) {
            name = r.translations[favoriteLanguage.code]
            nameFound = true
          } else {
            for (const code of favoriteLanguage.altCodes ?? []) {
              if (r.translations[code] !== undefined) {
                name = r.translations[code]
                nameFound = true
                break
              }
            }
          }
        }

        if (r.overviews && !overviewFound) {
          if (r.overviews[favoriteLanguage.code] !== undefined) {
            overview = r.overviews[favoriteLanguage.code]
            overviewFound = true
          } else {
            for (const code of favoriteLanguage.altCodes ?? []) {
              if (r.overviews[code] !== undefined) {
                overview = r.overviews[code]
                overviewFound = true
                break
              }
            }
          }
        }

        if (nameFound && (overviewFound || !r.overviews)) break
      }

      const isAnimation = r.genres
        ? r.genres.some((g) => g.toLowerCase() === 'animation' || g.toLowerCase() === 'anime')
        : undefined
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
          imdb,
          undefined,
          isAnimation
        )
      )
    }
    return results
  }

  public async searchEpisodeByTitle(
    tvdbId: number,
    order: EpisodeOrder,
    title: string
  ): Promise<{ episodeNumber?: number; absoluteEpisodeNumber?: number; season?: number }> {
    const tvdb = await this.getTVDBSession()
    let langCode = currentSettings.language
    if (langCode.indexOf('-') != -1) {
      langCode = langCode.substring(0, langCode.indexOf('-'))
    }

    let response: AxiosResponse<TVDBSeriesResponse> | undefined = undefined
    try {
      response = await tvdb.get<TVDBSeriesResponse>(`/series/${tvdbId}/episodes/${order}`, {
        headers: {
          'Accept-Language': langCode
        }
      })
    } catch (error) {
      debug(error)
      const response = error as AxiosError<TVDBSeriesResponse>
      throw new Error('Unexpected TVDB API Error: ' + response.response?.data.message)
    }

    const episodes = response.data.data.episodes
    const threshold = 85
    let bestMatch: EpisodeBaseRecord | null = null
    let bestScore = 0

    // First pass: check with original names
    for (const episode of episodes) {
      if (!episode.name) continue
      const score = Strings.getSimilarity(
        Strings.normalizeForComparison(episode.name),
        Strings.normalizeForComparison(title)
      )
      if (score > bestScore) {
        bestScore = score
        bestMatch = episode
      }
    }

    // If no good match, try translations in TV search languages
    if (bestScore < threshold) {
      for (const searchLangCode of [currentSettings.language, ...currentSettings.additionalTvSearchLanguages]) {
        let baseLang = searchLangCode
        if (baseLang.indexOf('-') != -1) {
          baseLang = baseLang.substring(0, baseLang.indexOf('-'))
        }
        const favoriteLanguage = Languages.getLanguageByCode(baseLang)
        if (!favoriteLanguage) continue

        // Get matching translation code from available translations
        const trCode = Languages.getMatchingCodeFromCodeList(
          favoriteLanguage,
          response.data.data.series.nameTranslations
        )

        if (!trCode) continue

        try {
          const langResponse = await tvdb.get<TVDBEpisodesTranslationResponse>(
            `/series/${tvdbId}/episodes/${order}/${trCode}`
          )

          for (const episode of langResponse.data.data.episodes) {
            if (episode.name) {
              const score = Strings.getSimilarity(
                Strings.normalizeForComparison(episode.name),
                Strings.normalizeForComparison(title)
              )
              if (score > bestScore) {
                bestScore = score
                // Find the corresponding episode in the original list to get the correct IDs
                const originalEpisode = episodes.find((ep) => ep.id === episode.id)
                if (originalEpisode) {
                  bestMatch = originalEpisode
                }
              }
            }
          }

          if (bestScore >= threshold) break // Stop if we found a good match
        } catch (error) {
          debug(error)
          // Continue with next language
        }
      }
    }

    if (!bestMatch || bestScore < threshold) {
      throw new Error('TVDB: No episode found matching the title')
    }

    if (order === 'absolute') {
      return {
        episodeNumber: undefined,
        absoluteEpisodeNumber: bestMatch.absoluteNumber,
        season: undefined
      }
    } else {
      return {
        episodeNumber: bestMatch.number,
        absoluteEpisodeNumber: undefined,
        season: bestMatch.seasonNumber
      }
    }
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

    const params = {
      ...(order === 'absolute' || season === undefined ? { season: 1 } : { season }),
      episodeNumber: order === 'absolute' ? (absoluteEpisodeNumber ?? 1) : (episodeNumber ?? 1)
    }
    try {
      debug(`Calling /series/${tvdbId}/episodes/${order} with params: ${params}`)
      response = await tvdb.get<TVDBSeriesResponse>(`/series/${tvdbId}/episodes/${order}`, {
        params
      })
    } catch (error) {
      debug(error)
      const response = error as AxiosError<TVDBSeriesResponse>
      throw new Error('Unexpected TVDB API Error: ' + response.response?.data.message)
    }

    const episodeData = response.data.data.episodes[0]
    const seriesData = response.data.data.series

    let extendedGenres: string[] | undefined
    try {
      const extendedResponse = await tvdb.get<TVDBSeriesExtendedResponse>(`/series/${tvdbId}/extended`)
      const rawGenres = extendedResponse.data.data.genres
      if (rawGenres) {
        extendedGenres = rawGenres.map((g) => g.name)
      }
    } catch (error) {
      debug('Failed to fetch TVDB extended series info for genres')
      debug(error)
    }

    const genres = extendedGenres ?? seriesData.genres ?? []
    const seriesIsAnimation = genres.some((g) => g.toLowerCase() === 'animation' || g.toLowerCase() === 'anime')
    const displayGenres = genres.map((g) =>
      _(
        'genre.' +
          g
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_'),
        { defaultValue: g }
      )
    )

    // Get episode count for the selected season
    let episodeCount = 1
    try {
      const countParams: { limit: number; season?: number } = { limit: 10000 }
      if (order !== 'absolute') {
        countParams.season = season ?? 1
      }
      const countResponse = await tvdb.get<TVDBEpisodesListResponse>(`/series/${tvdbId}/episodes/${order}`, {
        params: countParams
      })
      const rawData = countResponse.data.data as unknown
      const episodes: EpisodeBaseRecord[] =
        (Array.isArray(rawData)
          ? (rawData as EpisodeBaseRecord[])
          : (rawData as { episodes?: EpisodeBaseRecord[] } | undefined)?.episodes) ?? []

      if (order === 'absolute') {
        episodeCount = countResponse.data.links?.total_items ?? (episodes.length > 0 ? episodes.length : 1)
      } else {
        const countSeason = countParams.season
        const maxEpisodeNumber = episodes.reduce(
          (max, e) => (e.seasonNumber === countSeason && e.number > max ? e.number : max),
          0
        )
        episodeCount = maxEpisodeNumber > 0 ? maxEpisodeNumber : 1
      }
    } catch (error) {
      debug('Failed to get episode count, defaulting to 1')
    }

    if (episodeData === undefined) {
      // Return undefined episode data instead of throwing error
      const country = Countries.getCountryByCode(seriesData.originalCountry)
      const language = Languages.guessLanguageIETFFromCountries(seriesData.originalLanguage, country ? [country] : [])
      let name = this.cleanupSeriesTitle(seriesData.name)
      const overview = seriesData.overview

      // Apply translation logic for favorite languages
      let langCode = currentSettings.favoriteLanguages[0] ?? 'en'
      if (langCode.indexOf('-') != -1) {
        langCode = langCode.substring(0, langCode.indexOf('-'))
      }
      const favoriteLanguage = Languages.getLanguageByCode(langCode)
      let trCode: string | undefined = undefined
      if (favoriteLanguage != undefined && favoriteLanguage.code !== language?.code) {
        trCode = Languages.getMatchingCodeFromCodeList(favoriteLanguage, response.data.data.series.nameTranslations)
      }
      if (trCode != undefined) {
        try {
          const seriesTranslation = await tvdb.get<TVDBTranslation>(`/series/${tvdbId}/translations/${trCode}`)
          if (seriesTranslation.data.data.name) {
            name = this.cleanupSeriesTitle(seriesTranslation.data.data.name)
          }
        } catch (e) {
          debug('Failed to fetch translation, using original name')
        }
      }

      const searchResult = new SearchResult(
        seriesData.id,
        name,
        Number.parseInt(seriesData.year),
        name,
        overview,
        seriesData.image,
        language,
        country ? [country] : [],
        undefined,
        undefined,
        seriesIsAnimation
      )
      searchResult.genres = displayGenres
      return {
        episodeData: undefined,
        seriesData: searchResult,
        episodeCount
      }
    }

    const country = Countries.getCountryByCode(seriesData.originalCountry)
    const language = Languages.guessLanguageIETFFromCountries(seriesData.originalLanguage, country ? [country] : [])
    const name = this.cleanupSeriesTitle(seriesData.name)
    const result = {
      episodeData: new EpisodeData(
        episodeData.id,
        episodeData.number,
        episodeData.seasonNumber,
        episodeData.absoluteNumber,
        episodeData.name,
        episodeData.image,
        episodeData.overview,
        episodeCount
      ),
      seriesData: new SearchResult(
        seriesData.id,
        name,
        Number.parseInt(seriesData.year),
        name,
        seriesData.overview,
        seriesData.image,
        language,
        country ? [country] : [],
        undefined,
        undefined,
        seriesIsAnimation
      ),
      episodeCount
    }
    result.seriesData.genres = displayGenres
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
            (order !== 'absolute' && episode.seasonNumber === season && episode.number === episodeNumber) ||
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

  public async getEpisodeById(id: number): Promise<EpisodeBaseRecord> {
    const tvdb = await this.getTVDBSession()
    let response: AxiosResponse<TVDBEpisodeResponse> | undefined = undefined
    try {
      response = await tvdb.get<TVDBEpisodeResponse>(`/episodes/${id}`)
    } catch (error) {
      debug(error)
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>
        throw new Error('Unexpected TVDB API Error: ' + (axiosError.response?.data?.message ?? axiosError.message))
      }
      throw new Error('Unexpected TVDB API Error: ' + String(error))
    }
    return response.data.data
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
        tvdb = axios.create({ baseURL: THE_TVDB_API_URL, adapter: simpleCachingAdapter })
        tvdb.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.token}`
        return tvdb
      } else {
        debug('No Response but no Error as well ?!?')
        throw new Error('TVDB: Unexpected API Error')
      }
    }
  }
}

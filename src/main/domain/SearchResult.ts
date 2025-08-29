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

import { Strings } from '../../common/Strings'
import { ISearchResult } from '../../common/@types/SearchResult'
import { LanguageIETF } from '../../common/@types/LanguageIETF'
import { Country } from '../../common/@types/Countries'

export class SearchResult implements ISearchResult {
  public id: number
  public title: string
  public year: number | undefined
  public originalTitle: string
  public overview: string
  public posterURL?: string
  public language: LanguageIETF | undefined
  public countries: Country[] = []
  public imdb: string | undefined
  public note: number | undefined

  constructor(
    id: number,
    title: string,
    year: number | undefined,
    originalTitle: string,
    overview: string,
    poster: string | undefined,
    language: LanguageIETF | undefined = undefined,
    countries: Country[] = [],
    imdb: string | undefined = undefined,
    note: number | undefined = undefined
  ) {
    this.id = id
    this.title = title
    this.year = year
    this.originalTitle = originalTitle
    this.overview = overview
    this.posterURL = poster
    this.language = language
    this.countries = countries
    this.imdb = imdb
    this.note = note
  }

  /**
   * If positive result, it is matching.
   * @param searchResult
   * @param title
   * @param year
   */
  public static getMatchingScore(searchResult: SearchResult, title: string, year: number | undefined): number {
    let matchScore: number = Strings.getMatchScoreByKeywords(searchResult.title, title, true)
    const originalMatchScore: number = Strings.getMatchScoreByKeywords(searchResult.originalTitle, title, true)

    if (originalMatchScore > matchScore) {
      matchScore = originalMatchScore
    }
    if (year !== undefined && searchResult.year !== undefined) {
      const delta = Math.abs(year - searchResult.year)
      matchScore -= 0.25 * delta
    }
    return matchScore
  }

  /**
   * If perfect match returns true.
   * @param searchResult
   * @param title
   * @param year
   */
  public static isPerfectMatch(searchResult: SearchResult, title: string, year: number | undefined): boolean {
    const { haystackWords, needleWords } = Strings.getWordsFromNeedleAndHaystack(searchResult.title, title, true)
    let perfectMatch = true
    if (haystackWords.length === 0 || haystackWords.length !== needleWords.length) {
      perfectMatch = false
    } else {
      for (let i = 0; i < haystackWords.length; i++) {
        if (haystackWords[i].localeCompare(needleWords[i]) !== 0) {
          perfectMatch = false
          break
        }
      }
    }

    if (perfectMatch) {
      if (searchResult.year && year) {
        const delta = Math.abs(searchResult.year - year)
        perfectMatch = delta <= 2
      }
    }

    return perfectMatch
  }

  static getBestMatch(searchResults: SearchResult[], title: string, year: number | undefined) {
    let searchResultMatched: SearchResult | undefined = undefined
    if (searchResults.length === 1) {
      searchResultMatched = searchResults[0]
    } else {
      let bestResult: SearchResult | undefined
      let bestScore: number | undefined = undefined

      for (const searchResult of searchResults) {
        const score = SearchResult.getMatchingScore(searchResult, title, year)
        if (score > 0 && (bestScore === undefined || score > bestScore)) {
          bestScore = score
          bestResult = searchResult
        }
      }
      searchResultMatched = bestResult
    }
    return searchResultMatched
  }

  static getPerfectMatch(searchResults: SearchResult[], title: string, year: number | undefined) {
    let searchResultMatched: SearchResult | undefined = undefined
    if (searchResults.length === 1) {
      searchResultMatched = searchResults[0]
    } else {
      for (const searchResult of searchResults) {
        if (SearchResult.isPerfectMatch(searchResult, title, year)) {
          searchResultMatched = searchResult
          break
        }
      }
    }
    return searchResultMatched
  }

  toJSON(): ISearchResult {
    return {
      id: this.id,
      title: this.title,
      year: this.year,
      originalTitle: this.originalTitle,
      overview: this.overview,
      posterURL: this.posterURL,
      language: this.language,
      countries: this.countries,
      imdb: this.imdb,
      note: this.note
    }
  }
}

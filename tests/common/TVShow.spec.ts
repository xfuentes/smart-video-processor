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

import { beforeAll, expect, test, vi } from 'vitest'
import { Video } from '../../src/main/domain/Video'
import { SearchBy, VideoType } from '../../src/common/@types/Video'
import { currentSettings, defaultSettings } from '../../src/main/domain/Settings'
import { TVDBClient } from '../../src/main/domain/clients/TVDBClient'
import { TMDBClient } from '../../src/main/domain/clients/TMDBClient'
import { SearchResult } from '../../src/main/domain/SearchResult'
import { TVShowMatchingSource } from '../../src/common/@types/Settings'

beforeAll(() => {
  currentSettings.language = 'en'
  currentSettings.favoriteLanguages = ['en']
  currentSettings.additionalTvSearchLanguages = ['es']
  currentSettings.tmpFilesPath = defaultSettings.tmpFilesPath
})

test('TV-Show search with single match', async () => {
  const video = new Video('c:\\The.Walking.Dead.Dead.City.S02E03.MULTi.1080p.WEB.H264-SUPPLY.mkv')
  expect(video.type).toBe(VideoType.TV_SHOW)
  expect(video.tvShow.season).toBe(2)
  expect(video.tvShow.episode).toBe(3)
  await video.search()
  expect(video.tvShow.title).toBe('The Walking Dead: Dead City')
  expect(video.matched).toBeTruthy()
  video.destroy()
})

test('TV-Show search by TVDB ID and Episode Name', async () => {
  currentSettings.favoriteLanguages = ['en', 'es']
  const video = new Video('c:\\test.mkv')
  video.type = VideoType.TV_SHOW
  video.searchBy = SearchBy.TVDB_EP_NAME
  video.tvShow.setTheTVDB(81797)
  video.tvShow.setEpisodeTitle('¡La explosión es la señal! El CP9 empieza a moverse')
  video.tvShow.setOrder('absolute')
  await video.search()
  expect(video.tvShow.title).toBe('One Piece')
  expect(video.tvShow.absoluteEpisode).toBe(242)
  expect(video.matched).toBeTruthy()
  video.destroy()
})

test('TV-Show search by TVDB ID and Episode Name - Episode not found', async () => {
  currentSettings.favoriteLanguages = ['en', 'es']
  const video = new Video('c:\\test.mkv')
  video.type = VideoType.TV_SHOW
  video.searchBy = SearchBy.TVDB_EP_NAME
  video.tvShow.setTheTVDB(81797)
  video.tvShow.setEpisodeTitle('Nonexistent Episode Title That Does Not Exist')
  video.tvShow.setOrder('absolute')
  await video.search()
  expect(video.tvShow.title).toBe('One Piece')
  expect(video.matched).toBeFalsy()
  expect(video.status).toBe('Warning')
  expect(video.message).toBe('Episode not found. Please check the information provided and try again.')
  video.destroy()
})

test('TV-Show search by TVDB ID and Position', async () => {
  currentSettings.favoriteLanguages = ['en']
  const video = new Video('c:\\test.mkv')
  video.type = VideoType.TV_SHOW
  video.searchBy = SearchBy.TVDB_POSITION
  video.tvShow.setTheTVDB(81797)
  video.tvShow.setOrder('absolute')
  video.tvShow.setAbsoluteEpisode('242')
  await video.search()
  expect(video.tvShow.title).toBe('One Piece')
  expect(video.tvShow.absoluteEpisode).toBe(242)
  expect(video.matched).toBeTruthy()
  video.destroy()
})

test('TV-Show search by TVDB ID and Position - Episode not found', async () => {
  currentSettings.favoriteLanguages = ['en']
  const video = new Video('c:\\test.mkv')
  video.type = VideoType.TV_SHOW
  video.searchBy = SearchBy.TVDB_POSITION
  video.tvShow.setTheTVDB(81797)
  video.tvShow.setOrder('absolute')
  video.tvShow.setAbsoluteEpisode('99999')
  await video.search()
  expect(video.tvShow.title).toBe('One Piece')
  expect(video.matched).toBeFalsy()
  expect(video.status).toBe('Warning')
  expect(video.message).toBe('Episode not found. Please check the information provided and try again.')
  video.destroy()
})

test('TV-Show search by TVDB ID and Position - No episode number', async () => {
  currentSettings.favoriteLanguages = ['en']
  const video = new Video('c:\\test.mkv')
  video.type = VideoType.TV_SHOW
  video.searchBy = SearchBy.TVDB_POSITION
  video.tvShow.setTheTVDB(81797)
  video.tvShow.setOrder('absolute')
  video.tvShow.setAbsoluteEpisode('')
  await video.search()
  expect(video.tvShow.title).toBe('One Piece')
  expect(video.tvShow.absoluteEpisode).toBe(undefined)
  expect(video.tvShow.episode).toBe(undefined)
  expect(video.tvShow.season).toBe(undefined)
  expect(video.matched).toBeFalsy()
  expect(video.status).toBe('Warning')
  expect(video.message).toBe('Episode number not specified. Please provide a valid episode number and try again.')
  video.destroy()
})

test('TV-Show search by Title and Position', async () => {
  const video = new Video('c:\\test.mkv')
  video.type = VideoType.TV_SHOW
  video.searchBy = SearchBy.TITLE_POSITION
  video.tvShow.setTitle('One Piece')
  video.tvShow.setOrder('absolute')
  video.tvShow.setAbsoluteEpisode('242')
  await video.search()
  expect(video.tvShow.title).toBe('One Piece')
  expect(video.tvShow.absoluteEpisode).toBe(242)
  expect(video.matched).toBeTruthy()
  video.destroy()
})

test('TV-Show search by Title and Position - Episode not found', async () => {
  const video = new Video('c:\\test.mkv')
  video.type = VideoType.TV_SHOW
  video.searchBy = SearchBy.TITLE_POSITION
  video.tvShow.setTitle('One Piece')
  video.tvShow.setOrder('absolute')
  video.tvShow.setAbsoluteEpisode('99999')
  await video.search()
  expect(video.tvShow.title).toBe('One Piece')
  expect(video.matched).toBeFalsy()
  expect(video.status).toBe('Warning')
  expect(video.message).toBe('Episode not found. Please check the information provided and try again.')
  video.destroy()
})

test('TV-Show search by Title and Episode Name', async () => {
  currentSettings.favoriteLanguages = ['en', 'es']
  const video = new Video('c:\\test.mkv')
  video.type = VideoType.TV_SHOW
  video.searchBy = SearchBy.TITLE_EP_NAME
  video.tvShow.setTitle('One Piece')
  video.tvShow.setEpisodeTitle('¡La explosión es la señal! El CP9 empieza a moverse')
  video.tvShow.setOrder('absolute')
  await video.search()
  expect(video.tvShow.title).toBe('One Piece')
  expect(video.tvShow.absoluteEpisode).toBe(242)
  expect(video.matched).toBeTruthy()
  video.destroy()
})

test('TV-Show search by Title and Episode Name - Episode not found', async () => {
  currentSettings.favoriteLanguages = ['en', 'es']
  const video = new Video('c:\\test.mkv')
  video.type = VideoType.TV_SHOW
  video.searchBy = SearchBy.TITLE_EP_NAME
  video.tvShow.setTitle('One Piece')
  video.tvShow.setEpisodeTitle('Nonexistent Episode Title That Does Not Exist')
  video.tvShow.setOrder('absolute')
  await video.search()
  expect(video.tvShow.title).toBe('One Piece')
  expect(video.matched).toBeFalsy()
  expect(video.status).toBe('Warning')
  expect(video.message).toBe('Episode not found. Please check the information provided and try again.')
  video.destroy()
})

test('No match for Spanish episode name when only French and English are enabled', async () => {
  currentSettings.language = 'fr-FR'
  currentSettings.additionalTvSearchLanguages = ['en']
  const video = new Video('c:\\test.mkv')
  video.type = VideoType.TV_SHOW
  video.searchBy = SearchBy.TITLE_EP_NAME
  video.tvShow.setTheTVDB(76666)
  video.setSearchBy(SearchBy.TVDB_EP_NAME)
  video.tvShow.setEpisodeTitle('Han robado las bolas de dragon')
  video.tvShow.setOrder('default')
  await video.search()
  expect(video.tvShow.title).toBe('Dragon Ball')
  expect(video.matched).toBeFalsy()
  expect(video.status).toBe('Warning')
  expect(video.message).toBe('Épisode introuvable. Veuillez vérifier les informations fournies et réessayer.')
  video.destroy()
})

test('TV-Show search falls back to TheMovieDB when no TVDB match is found', async () => {
  currentSettings.language = 'en'
  currentSettings.favoriteLanguages = ['en']
  const tvdbSearchSpy = vi.spyOn(TVDBClient.getInstance(), 'searchSeriesByTitle').mockResolvedValue([])
  const tmdbSearchResult = new SearchResult(
    999888,
    'Some Obscure Show',
    2020,
    'Some Obscure Show',
    'An overview.',
    undefined
  )
  const tmdbSearchSpy = vi.spyOn(TMDBClient.getInstance(), 'searchTVByNameYear').mockResolvedValue([tmdbSearchResult])
  const tmdbDetailsSpy = vi.spyOn(TMDBClient.getInstance(), 'retrieveTVSeriesDetails').mockResolvedValue({
    episodeData: undefined,
    seriesData: tmdbSearchResult,
    episodeCount: 1
  })

  const video = new Video('c:\\Some.Obscure.Show.S01E01.mkv')
  expect(video.type).toBe(VideoType.TV_SHOW)
  await video.search()

  expect(tvdbSearchSpy).toHaveBeenCalled()
  expect(tmdbSearchSpy).toHaveBeenCalled()
  expect(tmdbDetailsSpy).toHaveBeenCalled()
  expect(video.tvShow.theTVDB).toBeUndefined()
  expect(video.tvShow.theMovieDB).toBe(999888)
  expect(video.tvShow.title).toBe('Some Obscure Show')

  tvdbSearchSpy.mockRestore()
  tmdbSearchSpy.mockRestore()
  tmdbDetailsSpy.mockRestore()
  video.destroy()
})

test('TV-Show search shows a warning when neither TVDB nor TheMovieDB have a match', async () => {
  currentSettings.language = 'en'
  currentSettings.favoriteLanguages = ['en']
  const tvdbSearchSpy = vi.spyOn(TVDBClient.getInstance(), 'searchSeriesByTitle').mockResolvedValue([])
  const tmdbSearchSpy = vi.spyOn(TMDBClient.getInstance(), 'searchTVByNameYear').mockResolvedValue([])

  const video = new Video('c:\\Some.Completely.Unknown.Show.S01E01.mkv')
  await video.search()

  expect(video.tvShow.theTVDB).toBeUndefined()
  expect(video.tvShow.theMovieDB).toBeUndefined()
  expect(video.status).toBe('Warning')
  expect(video.message).toBe(
    'Unable to find an exact match on TheTVDB or TheMovieDB. Please check the information provided and try again.'
  )

  tvdbSearchSpy.mockRestore()
  tmdbSearchSpy.mockRestore()
  video.destroy()
})

test('TV-Show search tries TheMovieDB first when it is the preferred database', async () => {
  currentSettings.language = 'en'
  currentSettings.favoriteLanguages = ['en']
  currentSettings.tvShowMatchingPriority = TVShowMatchingSource.TMDB
  const tvdbSearchSpy = vi.spyOn(TVDBClient.getInstance(), 'searchSeriesByTitle')
  const tmdbSearchResult = new SearchResult(
    999888,
    'Some Obscure Show',
    2020,
    'Some Obscure Show',
    'An overview.',
    undefined
  )
  const tmdbSearchSpy = vi.spyOn(TMDBClient.getInstance(), 'searchTVByNameYear').mockResolvedValue([tmdbSearchResult])
  const tmdbDetailsSpy = vi.spyOn(TMDBClient.getInstance(), 'retrieveTVSeriesDetails').mockResolvedValue({
    episodeData: undefined,
    seriesData: tmdbSearchResult,
    episodeCount: 1
  })

  const video = new Video('c:\\Some.Obscure.Show.S01E01.mkv')
  await video.search()

  expect(tvdbSearchSpy).not.toHaveBeenCalled()
  expect(tmdbSearchSpy).toHaveBeenCalled()
  expect(tmdbDetailsSpy).toHaveBeenCalled()
  expect(video.tvShow.theMovieDB).toBe(999888)

  currentSettings.tvShowMatchingPriority = TVShowMatchingSource.TVDB
  tvdbSearchSpy.mockRestore()
  tmdbSearchSpy.mockRestore()
  tmdbDetailsSpy.mockRestore()
  video.destroy()
})

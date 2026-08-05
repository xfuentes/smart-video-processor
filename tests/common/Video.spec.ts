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

import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest'
import { Video } from '../../src/main/domain/Video'
import { SearchBy, VideoType } from '../../src/common/@types/Video'
import { Job } from '../../src/main/domain/jobs/Job'
import { ProcessingJob } from '../../src/main/domain/jobs/ProcessingJob'
import { getFakeAbsolutePath } from './testUtils'
import { currentSettings, defaultSettings } from '../../src/main/domain/Settings'
import type { OutputRule } from '../../src/common/@types/Settings'
import { Languages } from '../../src/common/LanguageIETF'
import type { Country } from '../../src/common/Countries'

beforeAll(() => {
  currentSettings.favoriteLanguages = ['en']
  currentSettings.tmpFilesPath = defaultSettings.tmpFilesPath
})

test('TV-Show extracts season and episode number', () => {
  const video = new Video(
    getFakeAbsolutePath(
      'out put',
      'One Piece - S12E003 - Le rêve sombrant dans le nouveau monde ! Le pirate du désespoir, Puzzle.mkv'
    )
  )
  expect(video.type).toBe(VideoType.TV_SHOW)
  expect(video.tvShow.season).toBe(12)
  expect(video.tvShow.episode).toBe(3)
  expect(video.tvShow.title).toBe('One Piece')
})

test('TV-Show extracts tvdb ID', async () => {
  const video = new Video(
    getFakeAbsolutePath(
      'out put',
      'T.W.D.The.Ones.Who.Live.S01E01.MULTi.1080p.WEBRip.DDP5.1.HEVC-BATGirl{TVDB-427202}.mkv'
    )
  )
  expect(video.type).toBe(VideoType.TV_SHOW)
  expect(video.tvShow.season).toBe(1)
  expect(video.tvShow.episode).toBe(1)
  expect(video.tvShow.theTVDB).toBe(427202)
  expect(video.tvShow.title).contain('The Ones Who Live')
})

test('TV-Show extracts imdb ID', async () => {
  const video = new Video(
    getFakeAbsolutePath(
      'out put',
      'T.W.D.The.Ones.Who.Live.S01E01.MULTi.1080p.WEBRip.DDP5.1.HEVC-BATGirl{TT9859436}.mkv'
    )
  )
  expect(video.type).toBe(VideoType.TV_SHOW)
  expect(video.tvShow.season).toBe(1)
  expect(video.tvShow.episode).toBe(1)
  expect(video.tvShow.imdb).toBe('tt9859436')
  expect(video.tvShow.title).contain('The Ones Who Live')
})

test('Movie extracts tmdb ID', async () => {
  const video = new Video(
    "C'Est.Pas.Parce.Qu'On.A.Rien.À.Dire.Qu'Il.Faut.Fermer.Sa.Gueule.(1975).FRENCH.HDLight.1080p.AAC.x264-Notag{tmdb-58652}.mkv"
  )
  expect(video.type).toBe(VideoType.MOVIE)
  expect(video.movie.title).toBe("C'Est Pas Parce Qu'On A Rien À Dire Qu'Il Faut Fermer Sa Gueule")
  expect(video.movie.year).toBe(1975)
  expect(video.movie.tmdb).toBe(58652)
})

test('Movie extracts title and year', async () => {
  const video = new Video('Celine Dion - Live at Tokyo Dome 2018.mkv')
  expect(video.type).toBe(VideoType.MOVIE)
  expect(video.movie.title).toBe('Celine Dion   Live at Tokyo Dome')
  expect(video.movie.year).toBe(2018)
})

test('TV-Show Retrieve Language IETF', async () => {
  const video = new Video(
    getFakeAbsolutePath(
      'out put',
      'T.W.D.The.Ones.Who.Live.S01E01.MULTi.1080p.WEBRip.DDP5.1.HEVC-BATGirl{tvdb-427202}.mkv'
    )
  )
  expect(video.type).toBe(VideoType.TV_SHOW)
  expect(video.tvShow.theTVDB).toBe(427202)
  expect(video.tvShow.title).contain('The Ones Who Live')
  expect(video.searchBy).toBe(SearchBy.TVDB_POSITION)
  await video.search()
  expect(video.getOriginalLanguageIETF()?.code).toBe('en-US')
  video.destroy()
})

test('Movie Retrieve Language IETF', async () => {
  const video = new Video(
    "C'Est.Pas.Parce.Qu'On.A.Rien.À.Dire.Qu'Il.Faut.Fermer.Sa.Gueule.(1975).FRENCH.HDLight.1080p.AAC.x264-Notag{tmdb-58652}.mkv"
  )
  expect(video.type).toBe(VideoType.MOVIE)
  expect(video.movie.tmdb).toBe(58652)
  expect(video.searchBy).toBe(SearchBy.TMDB)

  await video.search()
  expect(video.getOriginalLanguageIETF()?.code).toBe('fr-FR')
  video.destroy()
})

test('Movie Search by TMDB', async () => {
  const video = new Video('Widows.(2011).SPANISH.HDLight.1080p.AAC.x264-Notag{tmdb-81022}.mkv')
  expect(video.type).toBe(VideoType.MOVIE)
  expect(video.movie.tmdb).toBe(81022)
  expect(video.searchBy).toBe(SearchBy.TMDB)

  await video.search()
  expect(video.getOriginalLanguageIETF()?.code).toBe('es-AR')
  expect(video.searchResults.length).toBe(1)
  expect(video.searchResults[0].id).toBe(81022)
  expect(video.searchResults[0].title).toBe('Widows')
  expect(video.searchResults[0].year).toBe(2011)
  video.destroy()
})

test('TV-Show fils cordonnier extracts season and episode number', () => {
  const video = new Video(getFakeAbsolutePath('out put', 'Le fils du cordonnier saison 01 épisode 01.avi'))
  expect(video.type).toBe(VideoType.TV_SHOW)
  expect(video.tvShow.season).toBe(1)
  expect(video.tvShow.episode).toBe(1)
  expect(video.tvShow.title).toBe('Le fils du cordonnier')
})

test('Movie Terence Hill un cowboy pacifiste', () => {
  const video = new Video(
    getFakeAbsolutePath('Download', 'Terence.Hill.un.cowboy.pacifiste.2025.DOC.VFF.HDTV.720p.H264.AAC-NoX.mkv')
  )
  expect(video.type).toBe(VideoType.MOVIE)
  expect(video.movie.title).toBe('Terence Hill un cowboy pacifiste')
  expect(video.movie.year).toBe(2025)
  expect(video.audioVersions.find((ver) => ver.ietf === 'fr-FR')).toBeDefined()
})

test('Movie House 1000 corpse', () => {
  const video = new Video(getFakeAbsolutePath('Download', 'House of 1000 Corpses (2003).mkv'))
  expect(video.type).toBe(VideoType.MOVIE)
  expect(video.movie.title).toBe('House of 1000 Corpses')
  expect(video.movie.year).toBe(2003)
})

test('video with TMDB', async () => {
  const video = new Video('something{tmdb-122977}.mkv')
  expect(video.type).toBe(VideoType.MOVIE)
  expect(video.movie.tmdb).toBe(122977)
  expect(video.searchBy).toBe(SearchBy.TMDB)

  await video.search()
  expect(video.getOriginalLanguageIETF()?.code).toBe('it-IT')
  expect(video.searchResults.length).toBe(1)
  expect(video.searchResults[0].id).toBe(122977)
  expect(video.searchResults[0].title).toBe('Saint John Bosco Mission to Love')
  expect(video.searchResults[0].year).toBe(2004)
  expect(video.selectedSearchResultID).toBe(122977)
  video.destroy()
})

test('TV-Show with season and episode name but no episode number', () => {
  const video = new Video(getFakeAbsolutePath('Download', 'The Series - The Episode Name.mkv'))
  expect(video.type).toBe(VideoType.TV_SHOW)
  expect(video.tvShow.season).toBeUndefined()
  expect(video.tvShow.episode).toBeUndefined()
  expect(video.tvShow.title).toBe('The Series')
  expect(video.tvShow.episodeTitle).toBe('The Episode Name')
  expect(video.searchBy).toBe(SearchBy.TITLE_EP_NAME)
})

test('TV-Show with year range and release tags', () => {
  const video = new Video(
    getFakeAbsolutePath(
      'Download',
      'La Quatrième Dimension (1959-1960) - S01E01 - Webrip-1080p-X265- Multi -HEVC-ACC-Notag.mkv'
    )
  )
  expect(video.type).toBe(VideoType.TV_SHOW)
  expect(video.tvShow.title).toBe('La Quatrième Dimension')
  expect(video.tvShow.season).toBe(1)
  expect(video.tvShow.episode).toBe(1)
  expect(video.tvShow.episodeTitle).toBe('')
})

describe('Output directory rules', () => {
  beforeEach(() => {
    currentSettings.defaultOutputPath = 'NotMatched'
    currentSettings.outputRules = []
  })

  afterEach(() => {
    currentSettings.defaultOutputPath = defaultSettings.defaultOutputPath
    currentSettings.outputRules = []
  })

  const matchedRule = (conditions: OutputRule['conditions'], match: OutputRule['match'] = 'all'): OutputRule => ({
    enabled: true,
    match,
    conditions,
    outputPath: 'MatchedDirectory'
  })

  test('rule on type eq matches', () => {
    currentSettings.outputRules = [matchedRule([{ property: 'type', operator: 'eq', value: 'movie' }])]
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    expect(video.getOutputDirectory().toString()).toMatch(/MatchedDirectory$/)
  })

  test('rule on type eq does not match', () => {
    currentSettings.outputRules = [matchedRule([{ property: 'type', operator: 'eq', value: 'tv_show' }])]
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    expect(video.getOutputDirectory().toString()).not.toMatch(/MatchedDirectory$/)
    expect(video.getOutputDirectory().toString()).toMatch(/NotMatched$/)
  })

  test('rule on year eq matches', () => {
    currentSettings.outputRules = [matchedRule([{ property: 'year', operator: 'eq', value: '2011' }])]
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    expect(video.getOutputDirectory().toString()).toMatch(/MatchedDirectory$/)
  })

  test('rule on year eq does not match', () => {
    currentSettings.outputRules = [matchedRule([{ property: 'year', operator: 'eq', value: '2020' }])]
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    expect(video.getOutputDirectory().toString()).not.toMatch(/MatchedDirectory$/)
    expect(video.getOutputDirectory().toString()).toMatch(/NotMatched$/)
  })

  test('rule on language eq matches', () => {
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    video.movie.originalLanguage = Languages.getLanguageByCode('fr-FR')
    currentSettings.outputRules = [matchedRule([{ property: 'language', operator: 'eq', value: 'fr-FR' }])]
    expect(video.getOutputDirectory().toString()).toMatch(/MatchedDirectory$/)
  })

  test('rule on language eq matches with no country', () => {
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    video.movie.originalLanguage = Languages.getLanguageByCode('fr-FR')
    currentSettings.outputRules = [matchedRule([{ property: 'language', operator: 'eq', value: 'fr' }])]
    expect(video.getOutputDirectory().toString()).toMatch(/MatchedDirectory$/)
  })

  test('rule on language eq does not match', () => {
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    video.movie.originalLanguage = Languages.getLanguageByCode('fr-FR')
    currentSettings.outputRules = [matchedRule([{ property: 'language', operator: 'eq', value: 'en-US' }])]
    expect(video.getOutputDirectory().toString()).not.toMatch(/MatchedDirectory$/)
    expect(video.getOutputDirectory().toString()).toMatch(/NotMatched$/)
  })

  test('rule on genres containsAny matches ignore case', () => {
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    video.movie.genres = ['Action', 'Drama']
    currentSettings.outputRules = [matchedRule([{ property: 'genres', operator: 'containsAny', value: ['drama'] }])]
    expect(video.getOutputDirectory().toString()).toMatch(/MatchedDirectory$/)
  })

  test('rule on genres containsAny does not match', () => {
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    video.movie.genres = ['Action', 'Drama']
    currentSettings.outputRules = [matchedRule([{ property: 'genres', operator: 'containsAny', value: ['Horror'] }])]
    expect(video.getOutputDirectory().toString()).not.toMatch(/MatchedDirectory$/)
    expect(video.getOutputDirectory().toString()).toMatch(/NotMatched$/)
  })

  test('rule on quality eq matches', () => {
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    video.pixels = '1920x1080'
    currentSettings.outputRules = [matchedRule([{ property: 'quality', operator: 'eq', value: 'FHD' }])]
    expect(video.getOutputDirectory().toString()).toMatch(/MatchedDirectory$/)
  })

  test('rule on quality eq does not match', () => {
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    video.pixels = '1920x1080'
    currentSettings.outputRules = [matchedRule([{ property: 'quality', operator: 'eq', value: '4K' }])]
    expect(video.getOutputDirectory().toString()).not.toMatch(/MatchedDirectory$/)
    expect(video.getOutputDirectory().toString()).toMatch(/NotMatched$/)
  })

  test('rule on country containsAny matches', () => {
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    video.movie.originalCountries = [{ alpha2: 'FR' } as Country]
    currentSettings.outputRules = [matchedRule([{ property: 'country', operator: 'containsAny', value: ['fr'] }])]
    expect(video.getOutputDirectory().toString()).toMatch(/MatchedDirectory$/)
  })

  test('rule on country containsAny does not match', () => {
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    video.movie.originalCountries = [{ alpha2: 'FR' } as Country]
    currentSettings.outputRules = [matchedRule([{ property: 'country', operator: 'containsAny', value: ['US'] }])]
    expect(video.getOutputDirectory().toString()).not.toMatch(/MatchedDirectory$/)
    expect(video.getOutputDirectory().toString()).toMatch(/NotMatched$/)
  })

  test('rule with match all matches only when every condition is true', () => {
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    currentSettings.outputRules = [
      matchedRule(
        [
          { property: 'type', operator: 'eq', value: 'movie' },
          { property: 'year', operator: 'eq', value: '2011' }
        ],
        'all'
      )
    ]
    expect(video.getOutputDirectory().toString()).toMatch(/MatchedDirectory$/)
  })

  test('rule with match all does not match when one condition is false', () => {
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    currentSettings.outputRules = [
      matchedRule(
        [
          { property: 'type', operator: 'eq', value: 'movie' },
          { property: 'year', operator: 'eq', value: '2020' }
        ],
        'all'
      )
    ]
    expect(video.getOutputDirectory().toString()).not.toMatch(/MatchedDirectory$/)
    expect(video.getOutputDirectory().toString()).toMatch(/NotMatched$/)
  })

  test('rule with match any matches when at least one condition is true', () => {
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    currentSettings.outputRules = [
      matchedRule(
        [
          { property: 'type', operator: 'eq', value: 'tv_show' },
          { property: 'year', operator: 'eq', value: '2011' }
        ],
        'any'
      )
    ]
    expect(video.getOutputDirectory().toString()).toMatch(/MatchedDirectory$/)
  })

  test('rule with match any does not match when every condition is false', () => {
    const video = new Video(getFakeAbsolutePath('out put', 'Widows.(2011).mkv'))
    currentSettings.outputRules = [
      matchedRule(
        [
          { property: 'type', operator: 'eq', value: 'tv_show' },
          { property: 'year', operator: 'eq', value: '2020' }
        ],
        'any'
      )
    ]
    expect(video.getOutputDirectory().toString()).not.toMatch(/MatchedDirectory$/)
    expect(video.getOutputDirectory().toString()).toMatch(/NotMatched$/)
  })
})

describe('TV show merge output subdirectories', () => {
  test('official order creates a season subfolder', async () => {
    const video = new Video(getFakeAbsolutePath('Download', 'test.mkv'))
    video.type = VideoType.TV_SHOW
    video.tvShow.title = 'One Piece'
    video.tvShow.theTVDB = 81797
    video.tvShow.order = 'official'
    video.tvShow.season = 1
    video.tvShow.episode = 1
    vi.spyOn(Job.prototype, 'queue').mockImplementation(() => Promise.resolve(undefined as never))
    const outputDir = getFakeAbsolutePath('Output')
    await (video as unknown as { merge: (dir: string) => Promise<void> }).merge(outputDir)
    const processingJob = video.job as unknown as ProcessingJob
    const outputPath = (processingJob as unknown as { outputPath: string }).outputPath
    expect(outputPath).toContain('One Piece {tvdb-81797}')
    expect(outputPath).toContain('Season 01')
    video.destroy()
  })

  test('absolute order does not create a season subfolder even when season is known', async () => {
    const video = new Video(getFakeAbsolutePath('Download', 'test.mkv'))
    video.type = VideoType.TV_SHOW
    video.tvShow.title = 'One Piece'
    video.tvShow.theTVDB = 81797
    video.tvShow.order = 'absolute'
    video.tvShow.absoluteEpisode = 242
    video.tvShow.season = 1
    vi.spyOn(Job.prototype, 'queue').mockImplementation(() => Promise.resolve(undefined as never))
    const outputDir = getFakeAbsolutePath('Output')
    await (video as unknown as { merge: (dir: string) => Promise<void> }).merge(outputDir)
    const processingJob = video.job as unknown as ProcessingJob
    const outputPath = (processingJob as unknown as { outputPath: string }).outputPath
    expect(outputPath).toContain('One Piece {tvdb-81797}')
    expect(outputPath).not.toContain('Season 01')
    video.destroy()
  })
})

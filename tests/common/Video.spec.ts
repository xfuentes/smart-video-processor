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

import { afterEach, expect, test } from 'vitest'
import { Video } from '../../src/main/domain/Video'
import { SearchBy, VideoType } from '../../src/common/@types/Video'
import { cleanTmpFiles, getFakeAbsolutePath, registerTmpFiles } from './testUtils'

afterEach(() => {
  cleanTmpFiles()
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

test('TV-Show Retrieve Language IETF', async () => {
  registerTmpFiles()
  const video = new Video(
    getFakeAbsolutePath(
      'out put',
      'T.W.D.The.Ones.Who.Live.S01E01.MULTi.1080p.WEBRip.DDP5.1.HEVC-BATGirl{tvdb-427202}.mkv'
    )
  )
  expect(video.type).toBe(VideoType.TV_SHOW)
  expect(video.tvShow.theTVDB).toBe(427202)
  expect(video.tvShow.title).contain('The Ones Who Live')
  expect(video.searchBy).toBe(SearchBy.TVDB)
  await video.search()
  expect(video.getOriginalLanguageIETF().code).toBe('en-US')
})

test('Movie Retrieve Language IETF', async () => {
  const video = new Video(
    "C'Est.Pas.Parce.Qu'On.A.Rien.À.Dire.Qu'Il.Faut.Fermer.Sa.Gueule.(1975).FRENCH.HDLight.1080p.AAC.x264-Notag{tmdb-58652}.mkv"
  )
  expect(video.type).toBe(VideoType.MOVIE)
  expect(video.movie.tmdb).toBe(58652)
  expect(video.searchBy).toBe(SearchBy.TMDB)

  await video.search()
  expect(video.getOriginalLanguageIETF().code).toBe('fr-FR')
})

test('Movie Search by TMDB', async () => {
  const video = new Video('Widows.(2011).SPANISH.HDLight.1080p.AAC.x264-Notag{tmdb-81022}.mkv')
  expect(video.type).toBe(VideoType.MOVIE)
  expect(video.movie.tmdb).toBe(81022)
  expect(video.searchBy).toBe(SearchBy.TMDB)

  await video.search()
  expect(video.getOriginalLanguageIETF().code).toBe('es-AR')
  expect(video.searchResults.length).toBe(1)
  expect(video.searchResults[0].id).toBe(81022)
  expect(video.searchResults[0].title).toBe('Widows')
  expect(video.searchResults[0].year).toBe(2011)
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

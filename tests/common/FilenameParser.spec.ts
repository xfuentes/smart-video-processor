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

import { describe, expect, it, test } from 'vitest'
import { detectExtraType, parseFilename } from '../../src/main/domain/FilenameParser'
import { EXTRA_FILENAME_SUFFIXES, ExtraType } from '../../src/common/@types/Movie'

test('parse TV show filename with dotted title and year before season/episode', () => {
  const result = parseFilename('Motive.Le.Mobile.Du.Crime.2013.S01E02.TRUEFRENCH.1080p.EAC3.x264-Darkjedi.mkv')
  expect(result).toStrictEqual({
    title: 'Motive Le Mobile Du Crime',
    year: 2013,
    season: 1,
    episode: 2,
    episodeTitle: undefined,
    absoluteEpisode: undefined
  })
})

test('parse movie filename with franchise prefix and year separator', () => {
  const result = parseFilename('James Bond 007 - 1974 - L Homme Au Pistolet D Or - 1080p X264 Ac3 mHDgz.mkv')
  expect(result).toStrictEqual({
    title: 'James Bond 007 L Homme Au Pistolet D Or',
    year: 1974,
    season: undefined,
    episode: undefined,
    episodeTitle: undefined,
    absoluteEpisode: undefined
  })
})

test('parse movie filename with leading [Film] tag and dotted year', () => {
  const result = parseFilename('[Film] Les désaxés.1961.Multi.Web-DL.1080p.H265-KANE .mkv')
  expect(result).toStrictEqual({
    title: 'Les désaxés',
    year: 1961,
    season: undefined,
    episode: undefined,
    episodeTitle: undefined,
    absoluteEpisode: undefined
  })
})

test('parse anime filename with absolute episode number and episode title', () => {
  const result = parseFilename("Dragon Ball - E127 - Plus rapide que l'éclair.mkv")
  expect(result).toStrictEqual({
    title: 'Dragon Ball',
    season: undefined,
    episode: undefined,
    episodeTitle: "Plus rapide que l'éclair",
    absoluteEpisode: 127
  })
})

test('parse movie filename with bracketed release noise before year', () => {
  const result = parseFilename(
    'Le Septième Voyage De Sinbad [REMASTERED] (1958) VFF ENG 1080p MULTi AC3 5.1 @384Kbps.x264-RHT.mkv'
  )
  expect(result).toStrictEqual({
    title: 'Le Septième Voyage De Sinbad',
    year: 1958,
    season: undefined,
    episode: undefined,
    episodeTitle: undefined,
    absoluteEpisode: undefined
  })
})

test('parse movie filename without year by cutting the title at the first technical token', () => {
  const result = parseFilename('La Nouvelle Guerre Des Boutons.1080p.HDLight.French.AAC.x264-noTag.mkv')
  expect(result).toStrictEqual({
    title: 'La Nouvelle Guerre Des Boutons',
    season: undefined,
    episode: undefined,
    episodeTitle: undefined,
    absoluteEpisode: undefined
  })
})

test('parse movie filename without year and without dash before the technical tokens', () => {
  const result = parseFilename('Le Grand Bleu 720p BluRay x264.mkv')
  expect(result.title).toBe('Le Grand Bleu')
})

test('keep words like French in a title without technical tokens', () => {
  const result = parseFilename('The French Dispatch.mkv')
  expect(result.title).toBe('The French Dispatch')
})

describe('multi-episode filenames', () => {
  it.each(['Paw.Patrol.S09E01E02.1080p.mkv', 'Paw Patrol - S09E01-E02.mkv', 'Paw Patrol S09E01-02 1080p.mkv'])(
    'detects an episode range in %s',
    (filename) => {
      const result = parseFilename(filename)
      expect(result.title).toBe('Paw Patrol')
      expect(result.season).toBe(9)
      expect(result.episode).toBe(1)
      expect(result.episodeEnd).toBe(2)
    }
  )

  it('does not treat a resolution as an episode range', () => {
    expect(parseFilename('Show.S01E01-1080p.mkv').episodeEnd).toBeUndefined()
  })
})

describe('detectExtraType', () => {
  test.each([
    ['Movie.2020.Trailer.mkv', ExtraType.TRAILER, 'Movie 2020'],
    ['Movie (2020) - bande annonce.mkv', ExtraType.TRAILER, 'Movie (2020)'],
    ['Movie.2020.Making.Of.1080p.mkv', ExtraType.BEHIND_THE_SCENES, 'Movie 2020 1080p'],
    ['Movie (2020) - Scènes coupées.mkv', ExtraType.DELETED_SCENE, 'Movie (2020)'],
    ['Movie 2020 featurette.mkv', ExtraType.FEATURETTE, 'Movie 2020'],
    ['Movie 2020 Interview.mkv', ExtraType.INTERVIEW, 'Movie 2020'],
    ['Movie 2020 - short.mkv', ExtraType.SHORT, 'Movie 2020'],
    [
      'La Lapidation de Soraya M (2009)-behindthescenes.mkv',
      ExtraType.BEHIND_THE_SCENES,
      'La Lapidation de Soraya M (2009)'
    ],
    ['Movie (2020)-deleted.mkv', ExtraType.DELETED_SCENE, 'Movie (2020)'],
    ['Movie (2020)-scene.mkv', ExtraType.SCENE, 'Movie (2020)'],
    ['Movie (2020)-other.mkv', ExtraType.OTHER, 'Movie (2020)']
  ])('%s is %s', (filename, type, cleanedName) => {
    expect(detectExtraType(filename)).toEqual({ type, cleanedName })
  })

  test.each(['Short Circuit (1986).mkv', 'Trailer Park Boys (2019).mkv', 'The Interview (2014).mkv', 'Movie.2020.mkv'])(
    '%s is not an extra',
    (filename) => {
      expect(detectExtraType(filename)).toBeUndefined()
    }
  )
})

// Suffixes listed by the Jellyfin documentation, with the kind of extra the application files them under.
const JELLYFIN_SUFFIXES: [string, ExtraType][] = [
  ['-trailer', ExtraType.TRAILER],
  ['.trailer', ExtraType.TRAILER],
  ['_trailer', ExtraType.TRAILER],
  [' trailer', ExtraType.TRAILER],
  ['-sample', ExtraType.OTHER],
  ['.sample', ExtraType.OTHER],
  ['_sample', ExtraType.OTHER],
  [' sample', ExtraType.OTHER],
  ['-scene', ExtraType.SCENE],
  ['-clip', ExtraType.SCENE],
  ['-interview', ExtraType.INTERVIEW],
  ['-behindthescenes', ExtraType.BEHIND_THE_SCENES],
  ['-deleted', ExtraType.DELETED_SCENE],
  ['-deletedscene', ExtraType.DELETED_SCENE],
  ['-featurette', ExtraType.FEATURETTE],
  ['-short', ExtraType.SHORT],
  ['-other', ExtraType.OTHER],
  ['-extra', ExtraType.OTHER]
]

// Suffixes of the inline extras documented by Plex.
const PLEX_SUFFIXES: [string, ExtraType][] = [
  ['-behindthescenes', ExtraType.BEHIND_THE_SCENES],
  ['-deleted', ExtraType.DELETED_SCENE],
  ['-featurette', ExtraType.FEATURETTE],
  ['-interview', ExtraType.INTERVIEW],
  ['-scene', ExtraType.SCENE],
  ['-short', ExtraType.SHORT],
  ['-trailer', ExtraType.TRAILER],
  ['-other', ExtraType.OTHER]
]

// Kodi only knows the trailer next to the movie file.
const KODI_SUFFIXES: [string, ExtraType][] = [['-trailer', ExtraType.TRAILER]]

describe.each([
  ['Jellyfin', JELLYFIN_SUFFIXES],
  ['Plex', PLEX_SUFFIXES],
  ['Kodi', KODI_SUFFIXES]
])('extras named for %s', (_server, suffixes) => {
  test.each(suffixes)('the suffix "%s" is detected', (suffix, type) => {
    expect(detectExtraType(`Movie (2020)${suffix}.mkv`)?.type).toBe(type)
    expect(detectExtraType(`Movie (2020) [tmdbid-12].1080p.h264${suffix}.mkv`)?.type).toBe(type)
    expect(detectExtraType(`Movie (2020) {tmdb-12}${suffix}.mp4`)?.type).toBe(type)
  })

  test.each(suffixes)('the suffix "%s" leaves the title of the movie untouched', (suffix) => {
    expect(detectExtraType(`Movie (2020)${suffix}.mkv`)?.cleanedName).toBe('Movie (2020)')
  })
})

describe('the suffixes written by the application', () => {
  test.each(Object.values(ExtraType).filter((type) => type !== ExtraType.NONE))(
    'the suffix of %s is known by Jellyfin and Plex and is detected back',
    (type) => {
      const suffix = EXTRA_FILENAME_SUFFIXES[type]
      expect(JELLYFIN_SUFFIXES.map(([s]) => s)).toContain(suffix)
      expect(PLEX_SUFFIXES.map(([s]) => s)).toContain(suffix)
      expect(detectExtraType(`Movie (2020) [tmdbid-12]${suffix}.mkv`)?.type).toBe(type)
    }
  )

  test('a movie has no suffix', () => {
    expect(EXTRA_FILENAME_SUFFIXES[ExtraType.NONE]).toBe('')
  })
})

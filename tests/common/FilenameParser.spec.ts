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

import { expect, test } from 'vitest'
import { parseFilename } from '../../src/main/domain/FilenameParser'

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

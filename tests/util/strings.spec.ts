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

import { expect, test } from 'vitest'
import Strings from '../../src/main/util/strings'

test('Pixels Dimension To 8K', async () => {
  const res = Strings.pixelsToVideoFormat('7680x4320')
  expect(res).toBe('8k')
})

test('Pixels Dimension To 4K', async () => {
  const res = Strings.pixelsToVideoFormat('3840x2160')
  expect(res).toBe('4k')
})

test('Pixels Dimension To 1080p', async () => {
  const res = Strings.pixelsToVideoFormat('1920x1080')
  expect(res).toBe('1080p')
})

test('Pixels Dimension To 720p', async () => {
  const res = Strings.pixelsToVideoFormat('1280x720')
  expect(res).toBe('720p')
})

test('Pixels Dimension To 480p', async () => {
  const res = Strings.pixelsToVideoFormat('720x480')
  expect(res).toBe('SD')
})

test('Pixels Dimension Bug To 1080p - 1', async () => {
  const res = Strings.pixelsToVideoFormat('1792x1080')
  expect(res).toBe('1080p')
})

test('Matches movie', () => {
  const needle = 'Captain America - Civil War'
  const goodScore = Strings.getMatchScoreByKeywords('Captain America : Civil War', needle, true)
  const lessGoodScore = Strings.getMatchScoreByKeywords(
    'Captain America: Civil War Reenactors',
    needle,
    true
  )
  expect(goodScore).toBeGreaterThan(lessGoodScore)
})

test('Matches movie 2', () => {
  const needle = 'The Devils Rejects'
  const goodScore = Strings.getMatchScoreByKeywords("The Devil's Rejects", needle, true)
  const lessGoodScore = Strings.getMatchScoreByKeywords(
    "30 Days in Hell: The Making of 'The Devil's Rejects'",
    needle,
    true
  )
  expect(goodScore).toBeGreaterThan(lessGoodScore)
})

test('Pixels Dimension To 1080p Conquete de l ouest', async () => {
  const res = Strings.pixelsToVideoFormat('1920x660')
  expect(res).toBe('1080p')
})

test('Pixels Dimension To 1080p Walking Dead S3', async () => {
  const res = Strings.pixelsToVideoFormat('1918x1078')
  expect(res).toBe('1080p')
})

test('Matches Joyeux noel', () => {
  const needle = 'Joyeux noel'
  const goodScore = Strings.getMatchScoreByKeywords('Joyeux Noël', needle, true)
  expect(goodScore).toBe(8)
})

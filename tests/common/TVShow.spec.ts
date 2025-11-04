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

import { beforeAll, expect, test } from 'vitest'
import { Video } from '../../src/main/domain/Video'
import { VideoType } from '../../src/common/@types/Video'
import { currentSettings, defaultSettings } from '../../src/main/domain/Settings'

beforeAll(() => {
  currentSettings.favoriteLanguages = ['en']
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

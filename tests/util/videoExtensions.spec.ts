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

import { afterEach, beforeEach, expect, test } from 'vitest'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import { scanVideoFilesRecursive } from '../../src/main/util/videoExtensions'

let rootDir: string

beforeEach(() => {
  rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'svp-scan-test-'))
})

afterEach(() => {
  fs.rmSync(rootDir, { recursive: true, force: true })
})

test('finds video files directly inside the folder and ignores non-video files', () => {
  fs.writeFileSync(path.join(rootDir, 'episode01.mkv'), '')
  fs.writeFileSync(path.join(rootDir, 'poster.jpg'), '')
  fs.writeFileSync(path.join(rootDir, 'notes.txt'), '')

  const found = scanVideoFilesRecursive(rootDir)

  expect(found).toEqual([path.join(rootDir, 'episode01.mkv')])
})

test('recursively finds video files in a TV show folder with season subfolders', () => {
  const season1 = path.join(rootDir, 'Season 01')
  const season2 = path.join(rootDir, 'Season 02')
  fs.mkdirSync(season1)
  fs.mkdirSync(season2)
  fs.writeFileSync(path.join(season1, 'S01E01.mkv'), '')
  fs.writeFileSync(path.join(season1, 'S01E02.mp4'), '')
  fs.writeFileSync(path.join(season2, 'S02E01.avi'), '')
  fs.writeFileSync(path.join(season2, 'season-poster.jpg'), '')
  fs.writeFileSync(path.join(rootDir, 'tvshow.nfo'), '')

  const found = scanVideoFilesRecursive(rootDir).sort()

  expect(found).toEqual(
    [path.join(season1, 'S01E01.mkv'), path.join(season1, 'S01E02.mp4'), path.join(season2, 'S02E01.avi')].sort()
  )
})

test('returns an empty array when the folder does not exist', () => {
  const found = scanVideoFilesRecursive(path.join(rootDir, 'does-not-exist'))

  expect(found).toEqual([])
})

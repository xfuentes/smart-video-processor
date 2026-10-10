/*
 * Smart Video Processor
 * Copyright (c) 2025. Xavier Fuentes <xfuentes-dev@serviam.cc>
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

import { describe, expect, test } from 'vitest'
import { getAddableHints } from '../../src/renderer/src/components/preview/addableHints'
import { ITrack, TrackType } from '../../src/common/@types/Track'
import { HintType } from '../../src/common/@types/Hint'
import { IVideo } from '../../src/common/@types/Video'

const track = (id: number, type: TrackType, copy = true) => ({ id, type, copy }) as ITrack
const video = (...tracks: ITrack[]) => ({ tracks }) as unknown as IVideo

describe('getAddableHints', () => {
  test('offers language for audio and language plus type for subtitles but nothing for video', () => {
    const options = getAddableHints(
      [video(track(0, TrackType.VIDEO), track(1, TrackType.AUDIO), track(2, TrackType.SUBTITLES))],
      []
    )
    expect(options.map((o) => `${o.trackId}:${o.hintType}`)).toEqual([
      `1:${HintType.LANGUAGE}`,
      `2:${HintType.LANGUAGE}`,
      `2:${HintType.SUBTITLES_TYPE}`
    ])
  })

  test('skips existing hints but offers unselected tracks', () => {
    const options = getAddableHints(
      [video(track(1, TrackType.AUDIO), track(2, TrackType.AUDIO, false))],
      [{ trackId: 1, type: HintType.LANGUAGE, value: 'fr' }]
    )
    expect(options.map((o) => o.trackId)).toEqual([2])
  })

  test('only offers tracks present in every video', () => {
    const options = getAddableHints(
      [video(track(1, TrackType.AUDIO), track(2, TrackType.AUDIO)), video(track(1, TrackType.AUDIO))],
      []
    )
    expect(options.map((o) => o.trackId)).toEqual([1])
  })
})

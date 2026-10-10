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
import { groupTracks } from '../../src/renderer/src/components/preview/trackGroups'
import { ITrack, TrackType } from '../../src/common/@types/Track'
import { IVideo } from '../../src/common/@types/Video'

const track = (id: number, type: TrackType, language: string, codec: string, copy = true): ITrack => ({
  id,
  name: '',
  type,
  codec,
  language,
  properties: {},
  default: false,
  forced: false,
  duration: undefined,
  size: undefined,
  copy,
  unsupported: false
})

const video = (...tracks: ITrack[]) => ({ tracks }) as unknown as IVideo

describe('groupTracks', () => {
  test('tracks with the same properties in every video are similar', () => {
    const groups = groupTracks([
      video(track(1, TrackType.AUDIO, 'fr', 'AAC')),
      video(track(1, TrackType.AUDIO, 'fr', 'AAC'))
    ])
    expect(groups).toHaveLength(1)
    expect(groups[0].differences).toEqual([])
  })

  test('differences in language, codec and presence are reported', () => {
    const groups = groupTracks([
      video(track(1, TrackType.AUDIO, 'fr', 'AAC'), track(2, TrackType.AUDIO, 'en', 'AAC')),
      video(track(1, TrackType.AUDIO, 'en', 'AC-3'))
    ])
    expect(groups[0].differences).toEqual(['language', 'codec'])
    expect(groups[1].differences).toEqual(['presence'])
  })

  test('different track names are reported', () => {
    const named = (name: string) => ({ ...track(1, TrackType.AUDIO, 'fr', 'AAC'), name })
    const groups = groupTracks([video(named('Commentary')), video(named('Main'))])
    expect(groups[0].differences).toEqual(['name'])
  })

  test('a forced flag set in only some videos is reported', () => {
    const forced = (value: boolean) => ({ ...track(1, TrackType.SUBTITLES, 'fr', 'SRT'), forced: value })
    const groups = groupTracks([video(forced(true)), video(forced(false))])
    expect(groups[0].differences).toEqual(['forced'])
  })

  test('properties that are not displayed are not reported as a difference', () => {
    const subtitles = (fps: number, audioChannels: number) => ({
      ...track(2, TrackType.SUBTITLES, 'fr', 'SRT'),
      properties: { fps, audioChannels }
    })
    const groups = groupTracks([video(subtitles(0.4, 0)), video(subtitles(0.5, 0))])
    expect(groups[0].differences).toEqual([])
  })

  test('groups are ordered by type then id', () => {
    const groups = groupTracks([
      video(
        track(3, TrackType.SUBTITLES, 'fr', 'SRT'),
        track(2, TrackType.AUDIO, 'fr', 'AAC'),
        track(0, TrackType.VIDEO, 'und', 'H.264')
      )
    ])
    expect(groups.map((g) => g.type)).toEqual([TrackType.VIDEO, TrackType.AUDIO, TrackType.SUBTITLES])
  })
})

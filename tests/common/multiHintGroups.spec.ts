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
import {
  buildMultiHintGroups,
  getHintCheckState,
  getNextHintTarget
} from '../../src/renderer/src/components/preview/multiHintGroups'
import { ITrack, TrackType } from '../../src/common/@types/Track'
import { HintType, IHint } from '../../src/common/@types/Hint'
import { IVideo } from '../../src/common/@types/Video'

const track = (id: number, type: TrackType) => ({ id, type, copy: true }) as ITrack
const hint = (trackId: number, value: string, required = true): IHint => ({
  trackId,
  type: HintType.LANGUAGE,
  value,
  required
})
const video = (tracks: ITrack[], hints: IHint[] = []) => ({ tracks, hints }) as unknown as IVideo

describe('multi hint groups', () => {
  test('a hint present in some videos only is partial and can be applied to every video having the track', () => {
    const videos = [
      video([track(2, TrackType.AUDIO)], [hint(2, 'fr')]),
      video([track(2, TrackType.AUDIO)], [hint(2, 'ja')]),
      video([track(2, TrackType.AUDIO)])
    ]
    const group = buildMultiHintGroups(videos).find((g) => g.hintType === HintType.LANGUAGE && g.trackId === 2)!
    expect(group.present).toHaveLength(2)
    expect(group.eligible).toHaveLength(3)
    expect(group.value).toBeUndefined()
    expect(getHintCheckState(group, videos.length)).toEqual({ checked: 'mixed' })
  })

  test('applied everywhere it is checked and can only be removed when it is not required', () => {
    const videos = [
      video([track(2, TrackType.AUDIO)], [hint(2, 'fr', false)]),
      video([track(2, TrackType.AUDIO)], [hint(2, 'fr', false)])
    ]
    const group = buildMultiHintGroups(videos)[0]
    expect(group.value).toBe('fr')
    expect(getHintCheckState(group, 2)).toEqual({ checked: true })
  })

  test('without the track in every video it never gets fully checked', () => {
    const videos = [video([track(2, TrackType.AUDIO)], [hint(2, 'fr', false)]), video([track(3, TrackType.AUDIO)])]
    const group = buildMultiHintGroups(videos).find((g) => g.trackId === 2)!
    expect(group.eligible).toHaveLength(1)
    expect(getHintCheckState(group, 2)).toEqual({ checked: 'mixed' })
  })

  test('the same id with another track type is a separate group', () => {
    const videos = [video([track(2, TrackType.AUDIO)]), video([track(2, TrackType.SUBTITLES)])]
    const groups = buildMultiHintGroups(videos).filter((g) => g.hintType === HintType.LANGUAGE)
    expect(groups.map((g) => g.trackType)).toEqual([TrackType.AUDIO, TrackType.SUBTITLES])
    expect(groups.every((g) => g.eligible.length === 1)).toBe(true)
  })

  test('a hint without value is reported as missing', () => {
    const group = buildMultiHintGroups([video([track(1, TrackType.AUDIO)], [hint(1, '')])])[0]
    expect(group.anyMissing).toBe(true)
  })
})

describe('hint checkbox cycle', () => {
  const uuidVideo = (uuid: string, hints: IHint[] = []) =>
    ({ uuid, tracks: [track(2, TrackType.AUDIO)], hints }) as unknown as IVideo
  const group = (hintsByVideo: IHint[][]) => buildMultiHintGroups(hintsByVideo.map((h, i) => uuidVideo(`v${i}`, h)))[0]

  test('goes from the original partial selection to every video, to none and back to the original', () => {
    const original = ['v0']
    let g = group([[hint(2, 'fr', false)], [], []])
    let step = getNextHintTarget(g, undefined)
    expect(step.target).toEqual(['v0', 'v1', 'v2'])
    g = group([[hint(2, 'fr', false)], [hint(2, 'fr', false)], [hint(2, 'fr', false)]])
    step = getNextHintTarget(g, original)
    expect(step.target).toEqual([])
    g = group([[], [], []])
    step = getNextHintTarget(g, original)
    expect(step.target).toEqual(original)
  })

  test('never goes to none when a video requires the hint', () => {
    const g = group([[hint(2, 'fr', true)], []])
    const first = getNextHintTarget(g, undefined)
    expect(first.cycle).toHaveLength(2)
    const all = group([[hint(2, 'fr', true)], [hint(2, 'fr', false)]])
    expect(getNextHintTarget(all, ['v0']).target).toEqual(['v0'])
  })

  test('has nothing to switch to when the original already is every video and one requires it', () => {
    const g = group([[hint(2, 'fr', true)], [hint(2, 'fr', true)]])
    expect(getNextHintTarget(g, undefined).cycle).toHaveLength(1)
  })

  test('starts a new cycle from the current selection when the original is not reachable', () => {
    const g = group([[hint(2, 'fr', false)], [hint(2, 'fr', false)], []])
    const step = getNextHintTarget(g, ['v2'])
    expect(step.base).toEqual(['v0', 'v1'])
  })
})

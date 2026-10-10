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
import { groupChanges } from '../../src/renderer/src/components/preview/changeGroups'
import { ChangeProperty, ChangeSourceType, ChangeType, IChange } from '../../src/common/Change'
import { IVideo } from '../../src/common/@types/Video'

const change = (
  sourceType: ChangeSourceType,
  property: ChangeProperty,
  currentValue: string,
  newValue: string,
  trackId?: number
): IChange => ({
  uuid: `${sourceType}${trackId}${property}`,
  sourceType,
  trackId,
  changeType: ChangeType.UPDATE,
  property,
  currentValue,
  newValue
})

const video = (...changes: IChange[]) => ({ changes }) as unknown as IVideo

describe('groupChanges', () => {
  test('identical changes are merged and counted', () => {
    const groups = groupChanges([
      video(change(ChangeSourceType.AUDIO, ChangeProperty.LANGUAGE, 'und', 'fr', 1)),
      video(change(ChangeSourceType.AUDIO, ChangeProperty.LANGUAGE, 'und', 'fr', 1))
    ])
    expect(groups).toHaveLength(1)
    expect(groups[0].count).toBe(2)
    expect(groups[0].currentValueDiffers).toBe(false)
    expect(groups[0].newValueDiffers).toBe(false)
  })

  test('values that differ between videos are reported', () => {
    const groups = groupChanges([
      video(change(ChangeSourceType.CONTAINER, ChangeProperty.FILENAME, 'a.mkv', 'A.mkv')),
      video(change(ChangeSourceType.CONTAINER, ChangeProperty.FILENAME, 'b.mkv', 'B.mkv'))
    ])
    expect(groups[0].currentValueDiffers).toBe(true)
    expect(groups[0].newValueDiffers).toBe(true)
  })

  test('groups are ordered by source then track', () => {
    const groups = groupChanges([
      video(
        change(ChangeSourceType.SUBTITLES, ChangeProperty.NAME, '', 'x', 3),
        change(ChangeSourceType.CONTAINER, ChangeProperty.TITLE, '', 'y')
      )
    ])
    expect(groups.map((g) => g.sourceType)).toEqual([ChangeSourceType.CONTAINER, ChangeSourceType.SUBTITLES])
  })
})

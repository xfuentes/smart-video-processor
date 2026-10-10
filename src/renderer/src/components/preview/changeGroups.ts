/*
 * Smart Video Processor
 * Copyright (c) 2026. Xavier Fuentes <xfuentes-dev@serviam.cc>
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

import isEqual from 'lodash/isEqual'
import { IVideo } from '../../../../common/@types/Video'
import { ChangeProperty, ChangePropertyValue, ChangeSourceType, ChangeType } from '../../../../common/Change'

export type ChangeGroup = {
  key: string
  sourceType: ChangeSourceType
  trackId?: number
  changeType: ChangeType
  property?: ChangeProperty
  /** Number of videos where this change will be applied. */
  count: number
  /** Value shared by all the videos, undefined when they differ. */
  currentValue?: ChangePropertyValue
  /** Value shared by all the videos, undefined when they differ. */
  newValue?: ChangePropertyValue
  /** Values of every video, in order. */
  currentValues: (ChangePropertyValue | undefined)[]
  newValues: (ChangePropertyValue | undefined)[]
  currentValueDiffers: boolean
  newValueDiffers: boolean
}

const SOURCE_ORDER = [
  ChangeSourceType.CONTAINER,
  ChangeSourceType.VIDEO,
  ChangeSourceType.AUDIO,
  ChangeSourceType.SUBTITLES
]

/** Groups the changes of all videos targeting the same source, type and property. */
export const groupChanges = (videos: IVideo[]): ChangeGroup[] => {
  const groups = new Map<string, ChangeGroup>()
  for (const video of videos) {
    for (const change of video.changes) {
      const key = `${change.sourceType}|${change.trackId}|${change.changeType}|${change.property}`
      const group = groups.get(key)
      if (group === undefined) {
        groups.set(key, {
          key,
          sourceType: change.sourceType,
          trackId: change.trackId,
          changeType: change.changeType,
          property: change.property,
          count: 1,
          currentValue: change.currentValue,
          newValue: change.newValue,
          currentValues: [change.currentValue],
          newValues: [change.newValue],
          currentValueDiffers: false,
          newValueDiffers: false
        })
      } else {
        group.count++
        group.currentValues.push(change.currentValue)
        group.newValues.push(change.newValue)
        group.currentValueDiffers ||= !isEqual(group.currentValue, change.currentValue)
        group.newValueDiffers ||= !isEqual(group.newValue, change.newValue)
      }
    }
  }
  return Array.from(groups.values()).sort(
    (a, b) =>
      SOURCE_ORDER.indexOf(a.sourceType) - SOURCE_ORDER.indexOf(b.sourceType) ||
      (a.trackId ?? -1) - (b.trackId ?? -1) ||
      (a.property ?? '').localeCompare(b.property ?? '')
  )
}

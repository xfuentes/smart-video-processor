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

import { IVideo } from '../../../../common/@types/Video'
import { HintType } from '../../../../common/@types/Hint'
import { TrackType } from '../../../../common/@types/Track'
import { hintTypesFor } from './addableHints'

export type MultiHintGroup = {
  key: string
  hintType: HintType
  trackId: number
  trackType: TrackType
  /** Videos having a track with this id and type that can receive this hint. */
  eligible: IVideo[]
  /** Videos where the hint is currently applied. */
  present: IVideo[]
  /** Number of videos where the hint is required by the analysis, so it cannot be removed. */
  requiredCount: number
  /** Value shared by all the videos having the hint, undefined when they differ. */
  value?: string
  /** True when a video having the hint has no value for it yet. */
  anyMissing: boolean
}

const TRACK_TYPE_ORDER = [TrackType.VIDEO, TrackType.AUDIO, TrackType.SUBTITLES]
const HINT_TYPE_ORDER = [HintType.LANGUAGE, HintType.SUBTITLES_TYPE]

/** Lists every hint that could be applied to the tracks of the videos, with how many videos currently have it. */
export const buildMultiHintGroups = (videos: IVideo[]): MultiHintGroup[] => {
  const groups = new Map<string, MultiHintGroup>()
  for (const video of videos) {
    for (const track of video.tracks) {
      for (const hintType of hintTypesFor(track.type)) {
        const key = `${hintType}|${track.type}|${track.id}`
        const group = groups.get(key) ?? {
          key,
          hintType,
          trackId: track.id,
          trackType: track.type,
          eligible: [],
          present: [],
          requiredCount: 0,
          anyMissing: false
        }
        group.eligible.push(video)
        const hint = video.hints.find((h) => h.type === hintType && h.trackId === track.id)
        if (hint !== undefined) {
          if (group.present.length === 0) {
            group.value = hint.value
          } else if (group.value !== hint.value) {
            group.value = undefined
          }
          group.present.push(video)
          group.anyMissing = group.anyMissing || !hint.value
          if (hint.required) {
            group.requiredCount++
          }
        }
        groups.set(key, group)
      }
    }
  }
  return Array.from(groups.values()).sort(
    (a, b) =>
      HINT_TYPE_ORDER.indexOf(a.hintType) - HINT_TYPE_ORDER.indexOf(b.hintType) ||
      TRACK_TYPE_ORDER.indexOf(a.trackType) - TRACK_TYPE_ORDER.indexOf(b.trackType) ||
      a.trackId - b.trackId
  )
}

export type HintCheckState = {
  checked: boolean | 'mixed'
}

/** Applying to every video is only possible when all of them have the track, otherwise it stays partial. */
export const getHintCheckState = (group: MultiHintGroup, totalVideos: number): HintCheckState => {
  const presentCount = group.present.length
  return { checked: presentCount === 0 ? false : presentCount === totalVideos ? true : 'mixed' }
}

const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((uuid) => b.includes(uuid))

/**
 * The selections a click goes through: the original one, every video having the track and none.
 * None is skipped when a video requires the hint, and duplicates are skipped.
 */
export const getHintCycle = (group: MultiHintGroup, original: string[]): string[][] => {
  const candidates = [original, group.eligible.map((v) => v.uuid)]
  if (group.requiredCount === 0) {
    candidates.push([])
  }
  return candidates.filter((c, index) => candidates.findIndex((other) => sameSet(other, c)) === index)
}

/** Next selection of the cycle, starting a new cycle from the current one when the original is no longer reachable. */
export const getNextHintTarget = (group: MultiHintGroup, original?: string[]) => {
  const current = group.present.map((v) => v.uuid)
  let base = original ?? current
  let cycle = getHintCycle(group, base)
  if (!cycle.some((c) => sameSet(c, current))) {
    base = current
    cycle = getHintCycle(group, base)
  }
  const index = cycle.findIndex((c) => sameSet(c, current))
  return { base, cycle, target: cycle[(index + 1) % cycle.length] }
}

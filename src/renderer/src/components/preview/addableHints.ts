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
import { HintType, IHint } from '../../../../common/@types/Hint'
import { TrackType } from '../../../../common/@types/Track'

export type AddableHint = {
  trackId: number
  trackType: TrackType
  hintType: HintType
}

export const hintTypesFor = (trackType: TrackType): HintType[] => {
  switch (trackType) {
    case TrackType.AUDIO:
      return [HintType.LANGUAGE]
    case TrackType.SUBTITLES:
      return [HintType.LANGUAGE, HintType.SUBTITLES_TYPE]
    default:
      return []
  }
}

/** Hints that can be added for the tracks present in every video and that do not exist yet. */
export const getAddableHints = (videos: IVideo[], existingHints: IHint[]): AddableHint[] => {
  const result: AddableHint[] = []
  for (const track of videos[0]?.tracks ?? []) {
    const inEveryVideo = videos.every((v) => v.tracks.some((t) => t.id === track.id && t.type === track.type))
    if (!inEveryVideo) {
      continue
    }
    for (const hintType of hintTypesFor(track.type)) {
      if (!existingHints.some((h) => h.trackId === track.id && h.type === hintType)) {
        result.push({ trackId: track.id, trackType: track.type, hintType })
      }
    }
  }
  return result
}

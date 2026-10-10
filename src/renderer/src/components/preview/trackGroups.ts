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
import { ITrack, TrackType } from '../../../../common/@types/Track'

const codecFamily = (codec: string) => /H\.26[45]/.exec(codec)?.[0] ?? codec

// Mirrors what the properties column displays so that empty or zero values count as identical.
const propertiesSignature = (t: ITrack) =>
  [
    t.properties.videoDimensions ? `${t.properties.videoDimensions}@${t.properties.fps || ''}` : '',
    t.properties.audioChannels || '',
    t.properties.audioSamplingFrequency || ''
  ].join('|')

export type TrackGroup = {
  type: TrackType
  id: number
  tracks: ITrack[]
  /** Names of the properties whose value is not the same in every video. */
  differences: ('presence' | 'language' | 'name' | 'forced' | 'codec' | 'properties')[]
}

const TRACK_TYPE_ORDER = [TrackType.VIDEO, TrackType.AUDIO, TrackType.SUBTITLES]

/** Groups the tracks of all videos sharing the same type and id and compares them. */
export const groupTracks = (videos: IVideo[]): TrackGroup[] => {
  const groups = new Map<string, TrackGroup>()
  for (const video of videos) {
    for (const track of video.tracks) {
      const key = `${track.type} ${track.id}`
      const group = groups.get(key) ?? { type: track.type, id: track.id, tracks: [], differences: [] }
      group.tracks.push(track)
      groups.set(key, group)
    }
  }
  const result = Array.from(groups.values())
  for (const group of result) {
    const first = group.tracks[0]
    if (group.tracks.length !== videos.length) {
      group.differences.push('presence')
    }
    if (group.tracks.some((t) => (t.language ?? 'und') !== (first.language ?? 'und'))) {
      group.differences.push('language')
    }
    if (group.tracks.some((t) => (t.name ?? '') !== (first.name ?? ''))) {
      group.differences.push('name')
    }
    if (group.tracks.some((t) => t.forced !== first.forced)) {
      group.differences.push('forced')
    }
    if (group.tracks.some((t) => codecFamily(t.codec) !== codecFamily(first.codec))) {
      group.differences.push('codec')
    }
    if (group.tracks.some((t) => propertiesSignature(t) !== propertiesSignature(first))) {
      group.differences.push('properties')
    }
  }
  return result.sort((a, b) => TRACK_TYPE_ORDER.indexOf(a.type) - TRACK_TYPE_ORDER.indexOf(b.type) || a.id - b.id)
}

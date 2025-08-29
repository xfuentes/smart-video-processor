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
import { ITrack, TrackProperties, TrackType } from '../../common/@types/Track'

export class Track implements ITrack {
  public id: number
  public name: string
  public type: TrackType
  public codec: string
  public language?: string
  public properties: TrackProperties
  public default: boolean
  public forced: boolean
  public duration: number | undefined
  // Number of bytes
  public size: number | undefined
  // if true the track will be copied to destination file.
  public copy: boolean
  // if true the tracks needs to be re-encoded.
  public unsupported: boolean

  constructor(
    id: number,
    name: string,
    type: TrackType,
    codec: string,
    language: string | undefined,
    properties: TrackProperties,
    isDefault: boolean,
    isForced: boolean,
    size: number | undefined,
    duration: number | undefined
  ) {
    this.id = id
    this.name = name
    // video, audio, subtitles
    this.type = type
    this.codec = codec
    this.unsupported = codec.indexOf('unsupported') !== -1
    this.language = language
    this.properties = properties
    this.default = isDefault
    this.forced = isForced
    this.duration = duration
    this.size = size
    this.copy = true
    if (type === TrackType.VIDEO && properties.frames && duration) {
      let fps = properties.frames / duration
      if (fps.toFixed(3) === '23.976') {
        fps = 23.976
      } else {
        fps = Math.round(fps)
      }
      this.properties.fps = fps
    }
  }

  toJSON(): ITrack {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      codec: this.codec,
      language: this.language,
      properties: this.properties,
      default: this.default,
      forced: this.forced,
      duration: this.duration,
      size: this.size,
      copy: this.copy,
      unsupported: this.unsupported
    }
  }
}

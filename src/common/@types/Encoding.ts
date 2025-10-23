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

import { TrackType } from './Track'

export type EncoderSettings = {
  trackId: number
  trackType: TrackType
  codec: VideoCodec | AudioCodec
  bitrate?: number
  fps?: number
  compressionPercent?: number
  originalSize?: number
  targetSize?: number
  audioChannels?: number
  encodingEnabled: boolean
}

export enum VideoCodec {
  AUTO = 'Auto',
  H264 = 'H.264',
  H265 = 'H.265'
}

export enum AudioCodec {
  AAC_LC = 'AAC LC'
}

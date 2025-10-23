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

import { ProcessesPriority } from './processes'
import { VideoCodec } from './Encoding'

export type Settings = {
  /**
   * Enable this for detailed output for debugging.
   */
  isDebugEnabled: boolean
  /**
   * Language to use for retrieving movies descriptions and to display this program.
   */
  language: string
  /**
   * Output path where processed movies will be saved (can be relative to the original file or absolute)
   */
  moviesOutputPath: string
  /**
   * Output path where processed TV Shows will be saved (can be relative to the original file or absolute)
   */
  tvShowsOutputPath: string
  /**
   * Output path where other processed files will be saved (can be relative to the original file or absolute)
   */
  othersOutputPath: string
  /**
   * if enabled automatically encode and/or process the files as soon as they are added (if no user input is requested)
   */
  isAutoStartEnabled: boolean
  /**
   * Process priority to use when merging or encoding
   */
  priority: keyof typeof ProcessesPriority
  /**
   * If enabled, will only keep tracks in your favorite languages list.
   */
  isTrackFilteringEnabled: boolean
  /**
   * List of languages ietf ordered by preference.
   */
  favoriteLanguages: string[]
  /**
   * If enabled, keep VO tracks even if not in favorite languages.
   */
  isKeepVOEnabled: boolean
  /**
   * If enabled allows automatic track encoding if below conditions are met.
   */
  isTrackEncodingEnabled: boolean
  /**
   * When enabled always force re-encoding all streams to enable precise trimming.
   */
  isFineTrimEnabled: boolean
  /**
   * Video Codec to use to re-encode video tracks.
   */
  videoCodec: VideoCodec
  /**
   * Video size reduction needed to allow re-encoding.
   */
  videoSizeReduction: number
  /**
   * Audio size reduction needed to allow re-encoding.
   */
  audioSizeReduction: number
  /**
   * MKVMerge command full path.
   */
  mkvMergePath: string
  /**
   * ffmpeg command full path.
   */
  ffmpegPath: string
  /**
   * ffprobe command full path.
   */
  ffprobePath: string
}

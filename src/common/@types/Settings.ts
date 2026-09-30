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

import { ProcessesPriority } from './processes'
import { VideoCodec } from './Encoding'

/** Limits and default of the preview pane height, in percent of the window height. */
export const PREVIEW_PANE_HEIGHT = { min: 15, max: 80, default: 40 }

export type OutputRuleProperty = 'type' | 'language' | 'year' | 'genres' | 'quality' | 'country'
export type OutputRuleOperator = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'in' | 'containsAny' | 'containsAll'
export type OutputRuleCondition = {
  property: OutputRuleProperty
  operator: OutputRuleOperator
  value: string | string[]
}
export type OutputRuleMatch = 'all' | 'any'

export enum NamingConvention {
  PLEX = 'Plex',
  JELLYFIN = 'Jellyfin',
  KODI = 'Kodi'
}

export enum TVShowMatchingSource {
  TVDB = 'TheTVDB',
  TMDB = 'TheMovieDB'
}

export type OutputRule = {
  enabled: boolean
  match: OutputRuleMatch
  conditions: OutputRuleCondition[]
  outputPath: string
}

export type Settings = {
  /**
   * Enable this for detailed output for debugging.
   */
  isDebugEnabled: boolean
  /**
   * If enabled, successfully processed source files are deleted when clearing the list or quitting the application.
   */
  isAutoDeleteProcessedFilesEnabled: boolean
  /**
   * Language to use for retrieving movies descriptions and to display this program.
   */
  language: string
  /**
   * Additional languages, in addition to the main language, to use when searching for TV series names.
   */
  additionalTvSearchLanguages: string[]
  /**
   * Database to try first when matching a TV show by title. The other one is used as a fallback when no match is found.
   */
  tvShowMatchingPriority: TVShowMatchingSource
  /**
   * Output path where temporary files will be written (absolute)
   */
  tmpFilesPath: string
  /**
   * Default output path used when no output rule matches (absolute)
   */
  defaultOutputPath: string
  /**
   * Ordered list of output rules evaluated to determine the output directory
   */
  outputRules: OutputRule[]
  /**
   * Media server naming convention used for generated file and folder names.
   */
  namingConvention: NamingConvention
  /**
   * if enabled automatically encode and/or process the files as soon as they are added (if no user input is requested)
   */
  isAutoStartEnabled: boolean
  /**
   * If enabled, watches autoAddPath for new fully-downloaded video files and adds them automatically.
   */
  isAutoAddEnabled: boolean
  /**
   * Directory watched for new video files when isAutoAddEnabled is true (absolute)
   */
  autoAddPath: string
  /**
   * Height of the preview pane below the video list, in percent of the window height.
   */
  previewPaneHeight: number
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
   * Video Codec to use to re-encode video tracks.
   */
  videoCodec: VideoCodec
  /**
   * Video size reduction needed to allow re-encoding.
   */
  videoSizeReduction: number
  /**
   * If video codec is not H.264 or H.265, force re-encode
   */
  videoEnforceCodec: boolean
  /**
   * Audio size reduction needed to allow re-encoding.
   */
  audioSizeReduction: number
  /**
   * If audio codec is not AAC force re-encode
   */
  audioEnforceCodec: boolean
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

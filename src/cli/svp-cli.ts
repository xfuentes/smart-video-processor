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

import yargs, { Arguments } from 'yargs'
import { hideBin } from 'yargs/helpers'
import { processFile } from './processing'
import { currentSettings, loadSettings } from '../main/domain/Settings'
import { debug } from '../main/util/log'
import { VideoType, SearchBy } from '../common/@types/Video'
import { EditionType } from '../common/@types/Movie'

export interface SvpArgs {
  languageHint?: string[]
  auto?: boolean
  type?: VideoType
  searchBy?: SearchBy
  title?: string
  year?: string
  imdb?: string
  tmdb?: string
  edition?: EditionType
  tvdb?: string
  order?: string
  season?: string
  episode?: string
  absoluteEpisode?: string
  episodeTitle?: string
  month?: string
  day?: string
  originalLanguage?: string
  poster?: string
  parts?: string[]
  startFrom?: number
  endAt?: number
}

const argv: Arguments<SvpArgs> = yargs(hideBin(process.argv))
  .demandCommand(1, 'At least one video file should be provided.')
  .option('auto', {
    type: 'boolean',
    description: 'Enables auto mode, which will answer all questions with default values.'
  })
  .option('language-hint', {
    alias: 'lh',
    type: 'string',
    description: 'Set IETF language to use for hints: [<track-number>:]<fr-FR|es|it|en-GB|jp|etc...>'
  })
  .array('language-hint')
  .option('type', {
    type: 'string',
    choices: Object.values(VideoType),
    description: 'Video type: Movie, TV-Show or Other'
  })
  .option('search-by', {
    type: 'string',
    choices: Object.values(SearchBy),
    description: 'How to search for the video metadata'
  })
  .option('title', {
    type: 'string',
    description: 'Movie / TV show / custom title'
  })
  .option('year', {
    type: 'string'
  })
  .option('imdb', {
    type: 'string',
    description: 'IMDB ID for movie search'
  })
  .option('tmdb', {
    type: 'string',
    description: 'TMDB ID for movie search'
  })
  .option('edition', {
    type: 'string',
    choices: Object.values(EditionType),
    description: 'Movie edition'
  })
  .option('tvdb', {
    type: 'string',
    description: 'TVDB ID for TV show search'
  })
  .option('order', {
    type: 'string',
    choices: ['official', 'dvd', 'absolute'],
    description: 'TV show episode order'
  })
  .option('season', {
    type: 'string'
  })
  .option('episode', {
    type: 'string'
  })
  .option('absolute-episode', {
    type: 'string'
  })
  .option('episode-title', {
    type: 'string'
  })
  .option('month', {
    type: 'string',
    description: 'Month for custom video date'
  })
  .option('day', {
    type: 'string',
    description: 'Day for custom video date'
  })
  .option('original-language', {
    type: 'string',
    description: 'Original language IETF code (for custom videos)'
  })
  .option('poster', {
    type: 'string',
    description: 'Path to a custom poster image'
  })
  .option('parts', {
    type: 'string',
    array: true,
    description: 'Additional video parts to merge before processing'
  })
  .option('start-from', {
    type: 'number',
    description: 'Start time in seconds'
  })
  .option('end-at', {
    type: 'number',
    description: 'End time in seconds'
  })
  .parseSync()

loadSettings()
debug(currentSettings)
void processFile(argv)

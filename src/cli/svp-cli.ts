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

export interface SvpArgs {
  languageHint?: string[]
  auto?: boolean
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
  .parseSync()

loadSettings()
debug(currentSettings)
void processFile(argv)

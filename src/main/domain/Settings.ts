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

import { Processes } from '../util/processes'
import { Files } from '../util/files'
import { getConfigPath } from '../util/path'
import path from 'node:path'
import { Settings } from '../../common/@types/Settings'
import { VideoCodec } from '../../common/@types/Encoding'
import * as fs from 'node:fs'
import { FormValidationBuilder } from '../../common/FormValidation'

const systemLocale = Processes?.osLocaleSync() ?? 'en-US'

export const defaultSettings: Settings = {
  isDebugEnabled: false,
  language: systemLocale,
  moviesOutputPath: './Reworked',
  tvShowsOutputPath: './Reworked',
  othersOutputPath: './Reworked',
  isAutoStartEnabled: false,
  priority: 'BELOW_NORMAL',
  isTrackFilteringEnabled: false,
  favoriteLanguages: [systemLocale],
  isKeepVOEnabled: true,
  isTrackEncodingEnabled: true,
  isTestEncodingEnabled: false,
  videoCodec: VideoCodec.AUTO,
  videoSizeReduction: 50,
  audioSizeReduction: 70,
  mkvMergePath: Processes.findCommandSync('mkvmerge', 'c:\\Program Files\\MKVToolNix\\mkvmerge.exe'),
  ffmpegPath: Processes.findCommandSync('ffmpeg', 'c:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe'),
  ffprobePath: Processes.findCommandSync('ffprobe', 'c:\\Program Files\\ffmpeg\\bin\\ffprobe.exe')
}
export let currentSettings: Settings = defaultSettings

export function loadSettings() {
  if (Files.fileExistsAndIsReadable(path.join(getConfigPath(), 'settings.json'))) {
    const data = Files.loadTextFileSync(getConfigPath(), 'settings.json')
    if (data !== undefined) {
      currentSettings = JSON.parse(data) as Settings
    }
    for (const key of Object.keys(defaultSettings) as Array<keyof Settings>) {
      if (currentSettings[key] === undefined) {
        // @ts-expect-error ts is lost
        currentSettings[key] = defaultSettings[key]
      }
    }
    const favSet = new Set<string>()
    currentSettings.favoriteLanguages.forEach((l) => favSet.add(l))
    currentSettings.favoriteLanguages = [...favSet.values()]
  } else {
    currentSettings = defaultSettings
  }
}

export function saveSettings(settings: Settings) {
  const validation = validateSettings(settings)
  if (validation.status === 'success') {
    currentSettings = { ...settings }
    Files.writeFileSync(getConfigPath(), 'settings.json', JSON.stringify(currentSettings, null, 2))
  }
  return validation
}

function isValidExecutable(path: string) {
  if (!fs.existsSync(path)) {
    return false
  }
  if (!fs.lstatSync(path).isFile()) {
    return false
  }
  try {
    fs.accessSync(path, fs.constants.X_OK)
    return true
  } catch (e) {
    return false
  }
}

export function validateSettings(settings: Settings) {
  const validationBuilder = new FormValidationBuilder<Settings>(settings)
  isValidExecutable(settings.mkvMergePath) ||
    validationBuilder.fieldValidation('mkvMergePath', 'error', 'Invalid executable path')
  isValidExecutable(settings.ffmpegPath) ||
    validationBuilder.fieldValidation('ffmpegPath', 'error', 'Invalid executable path')
  isValidExecutable(settings.ffprobePath) ||
    validationBuilder.fieldValidation('ffprobePath', 'error', 'Invalid executable path')
  return validationBuilder.build()
}

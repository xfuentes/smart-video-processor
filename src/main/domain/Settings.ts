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
  videoCodec: VideoCodec.H265,
  videoSizeReduction: 50,
  audioSizeReduction: 70
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

export function saveSettings(settings?: Settings) {
  Files.writeFileSync(
    getConfigPath(),
    'settings.json',
    JSON.stringify(settings ?? currentSettings, null, 2)
  )
}

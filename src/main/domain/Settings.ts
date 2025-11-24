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
import * as Path from 'node:path'
import { Settings } from '../../common/@types/Settings'
import { VideoCodec } from '../../common/@types/Encoding'
import * as fs from 'node:fs'
import { FormValidationBuilder } from '../../common/FormValidation'
import * as os from 'node:os'

const systemLocale = Processes?.osLocaleSync() ?? 'en-US'

const getDefaultToolPath = (tool: 'ffmpeg' | 'ffprobe' | 'mkvmerge') => {
  if (os.platform() === 'win32') {
    return process.resourcesPath
      ? Path.join(process.resourcesPath, 'bin', `${tool}.exe`)
      : Path.join('bin', 'win', `${tool}.exe`)
  } else if (os.platform() === 'linux') {
    if (process.env.SNAP && process.env.SNAP.indexOf('smart-video-processor') !== -1) {
      return `${process.env.SNAP}/usr/bin/${tool}`
    }
    const toolPathFromSources = Path.join(__dirname, '../', '../', 'bin', process.platform, tool)
    if (isValidExecutable(toolPathFromSources)) {
      return toolPathFromSources
    }
    return Processes.findCommandSync(tool, tool)
  } else {
    return Processes.findCommandSync(tool, tool)
  }
}

export const defaultSettings: Settings = {
  isDebugEnabled: false,
  language: systemLocale,
  tmpFilesPath: Processes.isLimitedPermissions() ? Path.join('.', 'svp-tmp') : Path.join(os.tmpdir(), 'svp-tmp'),
  moviesOutputPath: Path.join('.', 'Reworked'),
  tvShowsOutputPath: Path.join('.', 'Reworked'),
  othersOutputPath: Path.join('.', 'Reworked'),
  isAutoStartEnabled: false,
  priority: 'BELOW_NORMAL',
  isTrackFilteringEnabled: false,
  favoriteLanguages: [systemLocale],
  isKeepVOEnabled: true,
  isTrackEncodingEnabled: true,
  isFineTrimEnabled: false,
  videoCodec: VideoCodec.AUTO,
  videoSizeReduction: 50,
  audioSizeReduction: 70,
  mkvMergePath: getDefaultToolPath('mkvmerge'),
  ffmpegPath: getDefaultToolPath('ffmpeg'),
  ffprobePath: getDefaultToolPath('ffprobe')
}
export let currentSettings: Settings = defaultSettings

export function loadSettings() {
  if (Files.fileExistsAndIsReadable(Path.join(getConfigPath(), 'settings.json'))) {
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
  if (!isValidExecutable(currentSettings.mkvMergePath) && isValidExecutable(defaultSettings.mkvMergePath)) {
    currentSettings.mkvMergePath = defaultSettings.mkvMergePath
  }
  if (!isValidExecutable(currentSettings.ffmpegPath) && isValidExecutable(defaultSettings.ffmpegPath)) {
    currentSettings.ffmpegPath = defaultSettings.ffmpegPath
  }
  if (!isValidExecutable(currentSettings.ffprobePath) && isValidExecutable(defaultSettings.ffprobePath)) {
    currentSettings.ffprobePath = defaultSettings.ffprobePath
  }
  currentSettings.isFineTrimEnabled = false
}

export function saveSettings(settings: Settings) {
  const validation = validateSettings(settings)
  currentSettings.isFineTrimEnabled = false
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
  if (fs.lstatSync(path).isDirectory()) {
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
  if (!isValidExecutable(settings.mkvMergePath)) {
    if (isValidExecutable(defaultSettings.mkvMergePath)) {
      settings.mkvMergePath = defaultSettings.mkvMergePath
    } else {
      validationBuilder.fieldValidation('mkvMergePath', 'error', 'Invalid executable path')
    }
  }
  if (!isValidExecutable(settings.ffmpegPath)) {
    if (isValidExecutable(defaultSettings.ffmpegPath)) {
      settings.ffmpegPath = defaultSettings.ffmpegPath
    } else {
      validationBuilder.fieldValidation('ffmpegPath', 'error', 'Invalid executable path')
    }
  }
  if (!isValidExecutable(settings.ffprobePath)) {
    if (isValidExecutable(defaultSettings.ffprobePath)) {
      settings.ffprobePath = defaultSettings.ffprobePath
    } else {
      validationBuilder.fieldValidation('ffprobePath', 'error', 'Invalid executable path')
    }
  }
  return validationBuilder.build()
}

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

import { createRequire } from 'node:module'
import * as fs from 'node:fs'
import * as path from 'node:path'
import * as os from 'node:os'

const nodeRequire = createRequire(import.meta.url)

export const getConfigPath = (): string => {
  let configPath: string | undefined

  if (process.versions.electron) {
    try {
      const { app } = nodeRequire('electron')
      configPath = app.getPath('userData')
    } catch {
      // Not running in Electron, ignore
    }
  }

  if (!configPath) {
    configPath = path.join(os.homedir(), '.smart-video-processor')
  }

  if (!fs.existsSync(configPath)) {
    fs.mkdirSync(configPath, { recursive: true })
  }
  return configPath
}

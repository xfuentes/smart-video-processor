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

import * as path from 'node:path'
import type { ForgeConfig } from '@electron-forge/shared-types'
import { FreeDesktopCategories } from '@reforged/maker-types'
import { MakerAppImageConfig } from '@reforged/maker-appimage'
import { MakerSquirrelConfig } from '@electron-forge/maker-squirrel'
import { MakerDebConfig } from '@electron-forge/maker-deb'

const iconDir = path.resolve(__dirname, 'resources')

const commonLinuxConfig: MakerDebConfig = {
  options: {
    categories: ['AudioVideo'] as FreeDesktopCategories['main'][],
    mimeType: ['video/x-matroska', 'video/x-msvideo', 'video/mp4'],
    genericName: 'Audio/Video Processor',
    productName: 'Smart Video Processor',
    icon: path.resolve(iconDir, 'icon.png'),
    depends: ['mkvtoolnix', 'ffmpeg'],
    section: 'video',
    productDescription:
      'This small application in JavaScript is a frontend for various great free command line tools. It uses Electron (https://www.electronjs.org/fr/), Fluent UI React (https://github.com/microsoft/fluentui) and Vite (https://vite.dev/) frameworks. Its purpose is to help process and encode your DVD or Blu-ray backups.'
  }
}

const config: ForgeConfig = {
  packagerConfig: {
    ignore: [
      /^\/src/,
      /^\/tests/,
      /^\/\..*/,
      /(electron.vite.config.ts)|(forge.config.*)|(tsconfig.*)|eslint.config.mjs|(tmp-svp-.*)/
    ],
    icon: path.resolve(__dirname, 'resources', 'icon')
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        iconUrl: path.resolve(__dirname, 'resources', 'icon.ico'),
        setupIcon: path.resolve(__dirname, 'resources', 'icon.ico')
      } as MakerSquirrelConfig
    },
    {
      name: '@reforged/maker-appimage',
      config: {
        options: {
          genericName: 'Audio/Video Processor',
          productName: 'Smart Video Processor',
          categories: commonLinuxConfig.options.categories,
          icon: commonLinuxConfig.options.icon
        }
      } as MakerAppImageConfig
    },
    {
      name: '@electron-forge/maker-deb',
      config: commonLinuxConfig
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'xfuentes',
          name: 'smart-video-processor'
        },
        draft: true,
        prerelease: true,
        generateReleaseNotes: true
      }
    }
  ]
}

export default config

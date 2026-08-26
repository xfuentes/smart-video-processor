/*
 * Smart Video Processor
 * Copyright (c) 2026. Xavier Fuentes <xfuentes-dev@hotmail.com>
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

import { Configuration } from 'electron-builder'
import { homedir } from 'os'

const arch = process.arch === 'x64' ? 'x64' : 'arm64'

export default {
  appId: 'XavierFuentes.SmartVideoProcessor',
  productName: 'Smart Video Processor',
  copyright: 'Copyright (c) 2025. Xavier Fuentes',
  removePackageScripts: true,
  compression: 'normal',
  electronLanguages: ['en-US', 'fr'],
  directories: {
    output: 'dist',
    buildResources: 'assets'
  },
  files: ['build/**/*', 'resources/flags', 'locales/**'],
  extraFiles: ['LICENSE', 'README.md', 'docs'],
  electronDownload: {
    cache: process.env.XDG_CACHE_HOME ? `${process.env.XDG_CACHE_HOME}/electron` : `${homedir()}/.cache/electron`,
    isVerifyChecksum: false
  },
  extraResources: [
    {
      from: `bin/${process.platform}/${arch}`,
      to: 'bin',
      filter: ['*']
    },
    {
      from: 'native/uwp-activation/build/Release',
      to: 'native/uwp-activation/build/Release',
      filter: ['*.node']
    }
  ],
  asar: true,
  fileAssociations: [
    {
      ext: 'mkv',
      description: 'Matroska Video',
      mimeType: 'video/matroska',
      role: 'Editor'
    }
  ],
  win: {
    appId: 'smart-video-processor',
    signtoolOptions: {
      publisherName: 'CN=F8CDDB61-F860-4CB9-B176-609E178A4DA9'
    },
    target: process.arch === 'arm64' ? ['appx'] : ['appx', 'squirrel'],
    icon: 'icons/icon.ico',
    executableName: 'SmartVideoProcessor',
    artifactName: '${name}-${arch}.${ext}'
  },
  linux: {
    executableName: 'smart-video-processor',
    artifactName: '${name}-${version}-${arch}.${ext}',
    target: ['dir', 'AppImage', 'tar.gz'],
    category: 'AudioVideo',
    maintainer: 'Xavier Fuentes <xfuentes-dev@hotmail.com>',
    vendor: 'Xavier Fuentes',
    icon: 'icons/',
    syncDesktopName: true
  },
  appx: {
    applicationId: 'XavierFuentes.SmartVideoProcessor',
    identityName: 'XavierFuentes.SmartVideoProcessor',
    publisher: 'CN=F8CDDB61-F860-4CB9-B176-609E178A4DA9',
    publisherDisplayName: 'Xavier Fuentes',
    minVersion: '10.0.17763.0',
    maxVersionTested: '10.0.22000.1',
    languages: [
      'ar-SA',
      'cs-CZ',
      'da-DK',
      'de-DE',
      'el-GR',
      'en-US',
      'es-ES',
      'fi-FI',
      'fr-FR',
      'hu-HU',
      'id-ID',
      'it-IT',
      'ja-JP',
      'ko-KR',
      'nl-NL',
      'nb-NO',
      'pl-PL',
      'pt-BR',
      'ru-RU',
      'sv-SE',
      'tr-TR',
      'uk-UA',
      'zh-CN'
    ],
    backgroundColor: 'transparent',
    customManifestPath: 'AppxManifestTemplate.xml'
  },
  squirrelWindows: {
    useAppIdAsId: true,
    iconUrl: 'https://raw.githubusercontent.com/xfuentes/smart-video-processor/refs/heads/main/resources/icon.ico',
    artifactName: '${name}-${version}.Setup.${ext}'
  }
} as Configuration

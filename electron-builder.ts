import { Configuration } from 'electron-builder'

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
  files: ['build/**/*', 'resources/flags'],
  extraFiles: ['LICENSE', 'README.md', 'docs'],
  extraResources: [
    ...(process.platform === 'win32'
      ? [
          {
            from: 'bin/win',
            to: 'bin',
            filter: ['*']
          }
        ]
      : []),
    ...(process.platform === 'linux'
      ? [
          {
            from: `bin/linux/${process.arch}`,
            to: 'bin',
            filter: ['*']
          }
        ]
      : [])
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
      /* certificateFile: 'CodingCertificate.pfx',
      certificatePassword: 'svp', */
      publisherName: 'CN=F8CDDB61-F860-4CB9-B176-609E178A4DA9'
    },
    target: ['appx', 'squirrel'],
    icon: 'icons/icon.ico',
    executableName: 'SmartVideoProcessor',
    artifactName: '${productName}-${arch}.${ext}'
  },
  linux: {
    target: ['dir', 'AppImage'],
    category: 'AudioVideo',
    maintainer: 'Xavier Fuentes <xfuentes-dev@hotmail.com>',
    vendor: 'Xavier Fuentes',
    icon: 'icons/'
  },
  appx: {
    applicationId: 'XavierFuentes.SmartVideoProcessor',
    identityName: 'XavierFuentes.SmartVideoProcessor',
    publisher: 'CN=F8CDDB61-F860-4CB9-B176-609E178A4DA9',
    publisherDisplayName: 'Xavier Fuentes',
    minVersion: '10.0.17763.0',
    maxVersionTested: '10.0.22000.1',
    languages: ['en-US'],
    backgroundColor: 'transparent',
    customManifestPath: 'AppxManifestTemplate.xml'
  },
  squirrelWindows: {
    useAppIdAsId: true,
    iconUrl: 'https://raw.githubusercontent.com/xfuentes/smart-video-processor/refs/heads/main/resources/icon.ico'
  }
} as Configuration

/*
 * Smart Video Processor - JDownloader Plugin
 * Copyright (c) 2026. Xavier Fuentes <xfuentes-dev@serviam.cc>
 * Type : EventScripter script
 * Triggers : "A download stopped" and "Archive extracted"
 *
 * When a video file has finished downloading or has been extracted from an
 * archive, this script launches Smart Video Processor with the file path as a
 * command-line argument.
 */

// === CONFIGURATION / AUTO-DETECTION ===
// SVP_PATH is detected automatically from the environment.

function getJavaSystemProperty(name) {
  try {
    return String(Packages.java.lang.System.getProperty(name) || '')
  } catch (e) {
    return ''
  }
}

function getJavaEnv(name) {
  try {
    var value = Packages.java.lang.System.getenv(name)
    return value === null ? null : String(value)
  } catch (e) {
    return null
  }
}

function javaFileExists(path) {
  try {
    return new Packages.java.io.File(path).exists()
  } catch (e) {
    return false
  }
}

function findFileCaseInsensitive(dir, fileName) {
  try {
    var d = new Packages.java.io.File(dir)
    if (!d.isDirectory()) return null
    var files = d.list()
    for (var i = 0; i < files.length; i++) {
      var f = new Packages.java.io.File(d, files[i])
      if (f.isDirectory()) {
        var found = findFileCaseInsensitive(f.getAbsolutePath(), fileName)
        if (found) return found
      } else if (String(files[i]).toLowerCase() === fileName.toLowerCase()) {
        return f.getAbsolutePath()
      }
    }
  } catch (e) {
    // ignore
  }
  return null
}

function resolveWindowsPath() {
  var localAppData = getJavaEnv('LOCALAPPDATA')
  if (localAppData) {
    var found = findFileCaseInsensitive(localAppData + '\\smart-video-processor', 'SmartVideoProcessor.exe')
    if (found) return found
  }
  return 'svp.exe'
}

function resolveLinuxPath() {
  var home = getJavaSystemProperty('user.home')
  var candidates = [
    '/snap/bin/smart-video-processor',
    home + '/.local/share/flatpak/exports/bin/io.github.xfuentes.SmartVideoProcessor',
    '/var/lib/flatpak/exports/bin/io.github.xfuentes.SmartVideoProcessor',
    home + '/.local/bin/smart-video-processor'
  ]
  for (var i = 0; i < candidates.length; i++) {
    if (javaFileExists(candidates[i])) {
      return candidates[i]
    }
  }
  return 'smart-video-processor'
}

var IS_WINDOWS = /windows/i.test(getJavaSystemProperty('os.name') || '')
var SVP_PATH = IS_WINDOWS ? resolveWindowsPath() : resolveLinuxPath()

log('[SVP] Detected path: ' + SVP_PATH)

// File extensions recognized as video files (must match Smart Video Processor)
var VIDEO_EXTENSIONS = [
  '.mkv',
  '.mp4',
  '.m4v',
  '.avi',
  '.mov',
  '.qt',
  '.webm',
  '.flv',
  '.wmv',
  '.asf',
  '.mpg',
  '.mpeg',
  '.ts',
  '.m2ts',
  '.mts',
  '.vob',
  '.ogv',
  '.3gp',
  '.rm',
  '.rmvb'
]

// === LOGIC ===

function hasVideoExtension(filePath) {
  if (!filePath) return false
  var lower = filePath.toLowerCase()
  for (var i = 0; i < VIDEO_EXTENSIONS.length; i++) {
    var ext = VIDEO_EXTENSIONS[i]
    if (lower.length >= ext.length && lower.substring(lower.length - ext.length) === ext) {
      return true
    }
  }
  return false
}

function getLinkFilePath(link) {
  var path = link.getDownloadPath ? link.getDownloadPath() : null
  if (path) return path
  // Fallback in case getDownloadPath() returns null (older JDownloader versions)
  var pkg = link.getPackage ? link.getPackage() : null
  if (pkg && pkg.getDownloadFolder && link.getName) {
    return pkg.getDownloadFolder() + '\\' + link.getName()
  }
  return null
}

function escapeShellArg(arg) {
  return "'" + String(arg).replace(/'/g, "'\\''") + "'"
}

function buildLaunchArgs(paths) {
  if (IS_WINDOWS) {
    var args = [SVP_PATH]
    for (var i = 0; i < paths.length; i++) {
      args.push(paths[i])
    }
    return args
  }
  var cmd = 'setsid nohup ' + escapeShellArg(SVP_PATH)
  for (var i = 0; i < paths.length; i++) {
    cmd += ' ' + escapeShellArg(paths[i])
  }
  cmd += ' </dev/null >/dev/null 2>&1 &'
  return ['/bin/sh', '-c', cmd]
}

function launchSmartVideoProcessor(filePath) {
  if (!filePath || !hasVideoExtension(filePath)) {
    return
  }
  log('[SVP] Launching Smart Video Processor for: ' + filePath)
  callAsync(
    function (exitCode, stdOut, errOut) {
      log('[SVP] Finished for ' + filePath + ' (code: ' + exitCode + ')')
    },
    buildLaunchArgs([filePath])
  )
}

function isLinkFinished(link) {
  if (!link) return false
  // getFinalLinkStatus() returns "FINISHED" for a successful download,
  // and "FAILED", "SKIPPED", etc. for any other final state.
  if (link.getFinalLinkStatus) {
    return link.getFinalLinkStatus() === 'FINISHED'
  }
  // Fallback in case getFinalLinkStatus() is not available (older JDownloader versions)
  return link.isFinished && link.isFinished()
}

function processLink(link) {
  if (isLinkFinished(link)) {
    var filePath = getLinkFilePath(link)
    launchSmartVideoProcessor(filePath)
  }
}

function getArchiveExtractedPaths(archive) {
  var paths = []
  var i
  if (archive.getExtractedFilePaths) {
    var rawPaths = archive.getExtractedFilePaths()
    for (i = 0; i < rawPaths.length; i++) {
      var p = rawPaths[i]
      if (p && p.getAbsolutePath) {
        paths.push(String(p.getAbsolutePath()))
      } else {
        paths.push(String(p))
      }
    }
  } else if (archive.getExtractedFiles) {
    var files = archive.getExtractedFiles()
    for (i = 0; i < files.length; i++) {
      var f = files[i]
      if (f && f.getFilePath) {
        paths.push(String(f.getFilePath()))
      } else if (f && f.getAbsolutePath) {
        paths.push(String(f.getAbsolutePath()))
      } else {
        paths.push(String(f))
      }
    }
  }
  return paths
}

function launchSmartVideoProcessorForFiles(filePaths) {
  if (!filePaths || filePaths.length === 0) {
    return
  }
  log('[SVP] Launching Smart Video Processor for ' + filePaths.length + ' file(s)')
  callAsync(function (exitCode, stdOut, errOut) {
    log('[SVP] Finished for ' + filePaths.length + ' file(s) (code: ' + exitCode + ')')
  }, buildLaunchArgs(filePaths))
}

function processArchive(archive) {
  if (!archive) {
    log('[SVP] archive object is missing')
    return
  }
  if (!archive.getExtractionStatus) {
    log('[SVP] archive.getExtractionStatus is missing')
    return
  }
  var status = archive.getExtractionStatus()
  log('[SVP] Archive extraction status: ' + status)
  if (status !== 'SUCCESSFUL') {
    return
  }
  var extractedPaths = getArchiveExtractedPaths(archive)
  extractedPaths.sort()
  var videoPaths = []
  for (var i = 0; i < extractedPaths.length; i++) {
    if (hasVideoExtension(extractedPaths[i])) {
      videoPaths.push(extractedPaths[i])
    }
  }
  log('[SVP] Found ' + videoPaths.length + ' video file(s)')
  if (videoPaths.length > 0) {
    launchSmartVideoProcessorForFiles(videoPaths)
  }
}

// link and archive are only present in their respective trigger contexts.
// We safely grab them using try/catch to avoid ReferenceError when a variable
// is not set for the current trigger.
var linkRef
try {
  linkRef = link
} catch (e) {
  linkRef = null
}

if (linkRef) {
  try {
    processLink(linkRef)
  } catch (e) {
    log('[SVP] link process error: ' + e)
  }
}

var archiveRef
try {
  archiveRef = archive
} catch (e) {
  archiveRef = null
}

if (archiveRef) {
  try {
    processArchive(archiveRef)
  } catch (e) {
    log('[SVP] archive process error: ' + e)
  }
}

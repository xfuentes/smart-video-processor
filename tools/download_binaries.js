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

import fetch from 'node-fetch'
import fs from 'node:fs'
import path from 'node:path'

const MY_FILES_API_KEY = process.env.MY_FILES_API_KEY
if (!MY_FILES_API_KEY) throw new Error('MY_FILES_API_KEY missing from .env')

const downloadDir = './dist/bin'
if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir, { recursive: true })

const getDownloadUrls = () => {
  const arch = process.arch === 'x64' ? 'x64' : 'arm64'
  const platform = process.platform

  if (platform === 'linux') {
    if (arch === 'arm64') {
      return [
        { filename: 'ffmpeg', url: 'https://mesfichiers.org/?v8bqjrir58z22f40b6u9' },
        { filename: 'ffprobe', url: 'https://mesfichiers.org/?qfooirxit9alswnr4gxf' }
      ]
    } else {
      return [
        { filename: 'ffmpeg', url: 'https://mesfichiers.org/?akqb2gkb2czjf0v7a7mo' },
        { filename: 'ffprobe', url: 'https://mesfichiers.org/?bjrqaa0mnlwztohjfuf4' }
      ]
    }
  } else if (platform === 'win32') {
    if (arch === 'arm64') {
      return [
        { filename: 'ffmpeg.exe', url: 'https://mesfichiers.org/?ir7xm989twxddx7vxcky' },
        { filename: 'ffprobe.exe', url: 'https://mesfichiers.org/?1d8dtrrrdyzhhaa6suqn' },
        { filename: 'mkvmerge.exe', url: 'https://mesfichiers.org/?zq3mj35zmmtlq4whxdyy' }
      ]
    } else {
      return [
        { filename: 'ffmpeg.exe', url: 'https://mesfichiers.org/?wuyup5ndlakuqj7h8ijw' },
        { filename: 'ffprobe.exe', url: 'https://mesfichiers.org/?ct0eppmf0m7fi00qzdm9' },
        { filename: 'mkvmerge.exe', url: 'https://mesfichiers.org/?3v15nc8l8drmz157kwld' }
      ]
    }
  }
  throw new Error(`Unsupported Platform : ${platform}`)
}

async function downloadFromMyFiles(urlToFile) {
  const res = await fetch('https://api.1fichier.com/v1/download/get_token.cgi', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${MY_FILES_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: urlToFile.url })
  })

  const data = await res.json()
  if (data.status !== 'OK') throw new Error(data.message)

  const filePath = path.join(downloadDir, urlToFile.filename)

  const fileRes = await fetch(data.url)
  if (!fileRes.ok) throw new Error(`Failed Download: ${urlToFile.url} -> ${urlToFile.filename}`)

  const fileStream = fs.createWriteStream(filePath)
  await new Promise((resolve, reject) => {
    fileRes.body.pipe(fileStream)
    fileStream.on('finish', () => resolve())
    fileStream.on('error', () => reject())
  })

  if (process.platform !== 'win32') {
    fs.chmod(filePath, '755', (err) => {
      if (err) throw err;
    });
  }

  return filePath
}

(async () => {
  try {
    const urlToFileList = getDownloadUrls()
    const results = await Promise.all(urlToFileList.map(downloadFromMyFiles))
    console.log(`✅  Downloaded for ${process.platform}/${process.arch}:`, results)
  } catch (error) {
    console.error('❌  Error:', error.message)
    process.exit(1)
  }
})()

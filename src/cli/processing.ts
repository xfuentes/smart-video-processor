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

import { Arguments } from 'yargs'
import { SvpArgs } from './svp-cli'
import { Video } from '../main/domain/Video'
import { version } from '../../package.json'
import * as CLI from 'clui'
import { renderVideoList } from './video-list'
import { matchVideo } from './matching'
import { requestTracksToCopy } from './track-list'
import { requestHints } from './hints'
import { requestEncodingSelection } from './encoding'
import { glob } from 'glob'
import * as cliProgress from 'cli-progress'
import * as chalk from 'chalk'
import { currentSettings } from '../main/domain/Settings'

const progressBar: cliProgress.SingleBar = new cliProgress.SingleBar(
  {
    format: '{status}' + ' |' + chalk.cyan('{bar}') + '| {message}',
    stream: process.stdout,
    hideCursor: true
  },
  cliProgress.Presets.shades_classic
)

const aggregationListener = (current: number, total: number, video: Video) => {
  // console.log(video.status + ": " + video.message);
  if (video.progression?.progress) {
    progressBar.update(video.progression?.progress * 100, {
      status: `${video.status}`,
      message: `${video.message} ${current}/${total}`
    })
  }
}

const finalListener = (video: Video) => {
  // console.log(video.status + ": " + video.message);
  if (video.progression?.progress) {
    progressBar.update(video.progression?.progress * 100, {
      status: `${video.status}`,
      message: `${video.message} ${video.title}`
    })
  }
}

export async function processFile(argv: Arguments<SvpArgs>) {
  console.log(`Smart Video Processor v${version}`)
  console.log()

  const outputBuffer = new CLI.LineBuffer({ x: 0, y: 0, width: 'console', height: 'console' })
  const wildcards = argv._.filter((myVar) => typeof myVar === 'string').map((wild) => wild.replace(/\\/g, '/'))
  const files = await glob(wildcards, {
    nodir: true
  })
  files.sort((nameA, nameB) =>
    nameA.localeCompare(nameB, currentSettings.language, {
      caseFirst: 'false'
    })
  )
  const videos: Video[] = []

  let current = 0
  const total = files.length

  for (const filename of files) {
    const video = new Video(filename)
    video.lastPromise = video.load()
    videos.push(video)
  }

  for (const video of videos) {
    current++
    progressBar.start(100, 0, {
      status: `${video.status}`,
      message: `${video.message} ${current}/${total}`
    })
    const myAggregationListener = aggregationListener.bind(null, current, total)
    video.addChangeListener(myAggregationListener)
    try {
      await video.lastPromise
      progressBar.update((current * 100) / total, {
        status: `${video.status}`,
        message: `${video.message} ${current}/${total}`
      })
      video.removeChangeListener(myAggregationListener)
      progressBar.stop()
      console.log()
      renderVideoList(outputBuffer, video)
      await matchVideo(outputBuffer, video, argv.auto)
      await requestTracksToCopy(outputBuffer, video, argv.auto)
      await requestHints(video, argv.languageHint, argv.auto)
      await requestEncodingSelection(video, argv.auto)
      video.lastPromise = video.process()
    } catch (err) {
      progressBar.update((current * 100) / total, {
        status: `${video.status}`,
        message: `${video.message} ${current}/${total}`
      })
      video.removeChangeListener(myAggregationListener)
      progressBar.stop()
    }
  }

  for (const video of videos) {
    video.addChangeListener(finalListener)
    progressBar.start(100, 0, {
      status: video.status,
      message: `${video.message} ${video.title}`
    })
    await video.lastPromise
    video.removeChangeListener(finalListener)
    progressBar.update(100, {
      status: video.status,
      message: `${video.message} ${video.title}`
    })
    progressBar.stop()
  }
  console.log()
}

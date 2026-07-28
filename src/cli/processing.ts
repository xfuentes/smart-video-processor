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
import { SearchInputData, SearchBy } from '../common/@types/Video'
import { EditionType } from '../common/@types/Movie'
import { EpisodeOrder } from '../main/domain/clients/TVDBClient'
import { Video } from '../main/domain/Video'
import { version } from '../../package.json'
import CLI from 'clui'
import { renderVideoList } from './video-list'
import { matchVideo } from './matching'
import { requestTracksToCopy } from './track-list'
import { requestHints } from './hints'
import { requestEncodingSelection } from './encoding'
import { glob } from 'glob'
import * as cliProgress from 'cli-progress'
import chalk from 'chalk'
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

const buildSearchInputData = (argv: Arguments<SvpArgs>): SearchInputData | undefined => {
  if (!argv.type) {
    return undefined
  }
  return {
    type: argv.type,
    searchBy: argv.searchBy ?? SearchBy.TITLE,
    movieTitle: argv.title ?? '',
    movieYear: argv.year ?? '',
    movieIMDB: argv.imdb ?? '',
    movieTMDB: argv.tmdb ?? '',
    movieEdition: argv.edition ?? EditionType.THEATRICAL,
    tvShowTitle: argv.title ?? '',
    tvShowYear: argv.year ?? '',
    tvShowTVDB: argv.tvdb ?? '',
    tvShowOrder: (argv.order as EpisodeOrder) ?? 'official',
    tvShowSeason: argv.season ?? '',
    tvShowEpisode: argv.episode ?? '',
    tvShowAbsoluteEpisode: argv.absoluteEpisode ?? '',
    tvShowEpisodeTitle: argv.episodeTitle ?? '',
    otherTitle: argv.title ?? '',
    otherYear: argv.year ?? '',
    otherMonth: argv.month ?? '',
    otherDay: argv.day ?? '',
    otherOriginalLanguage: argv.originalLanguage ?? '',
    otherPosterPath: argv.poster ?? ''
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
      for (const part of argv.parts ?? []) {
        await video.addPart(part)
      }
      if (argv.startFrom !== undefined) {
        await video.setStartFrom(argv.startFrom)
      }
      if (argv.endAt !== undefined) {
        await video.setEndAt(argv.endAt)
      }
      const searchData = buildSearchInputData(argv)
      if (searchData) {
        await video.search(searchData).catch((error) => console.log(chalk.red((error as Error).message)))
      }
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

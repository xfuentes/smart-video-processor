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

import * as chalk from 'chalk'
import { confirm, input, rawlist, select } from '@inquirer/prompts'
import { toNumber } from 'lodash'
import { ratingRenderer } from './renderers'
import { SearchResult } from '../main/domain/SearchResult'
import { SearchBy, VideoType } from '../common/@types/Video'
import { EditionType } from '../common/@types/Movie'
import { EpisodeOrder } from '../main/domain/clients/TVDBClient'
import { Video } from '../main/domain/Video'
import { Strings } from '../common/Strings'
import * as CLI from 'clui'

export const promptSearchResultID = async (searchResults: SearchResult[]) => {
  const options = searchResults.map((sr) => {
    return { name: sr.title + ' (' + sr.year + ')', value: sr.id }
  })
  options.push({ name: '<None Matched>', value: -1 })
  return rawlist({
    message: ' Selected result:',
    choices: options
  })
}

export const promptStringArray = async <VALUE>(message: string, values: VALUE[], defaultValue: VALUE) => {
  const options = values.map((key) => {
    return { value: key }
  })

  return select({
    message: ' ' + message,
    choices: options,
    default: defaultValue
  })
}

export const promptVideoType = async (v: VideoType) => {
  return promptStringArray(
    'Type:',
    Object.values(VideoType).filter((t) => t !== VideoType.OTHER),
    v
  )
}

export const promptMovieSearchBy = async (v: SearchBy) => {
  return promptStringArray('Search By:', [SearchBy.TITLE, SearchBy.IMDB, SearchBy.TMDB], v)
}

export const promptMovieEdition = async (v: EditionType) => {
  return promptStringArray('Edition:', Object.values(EditionType), v)
}

export const promptNumber = async (message: string, v: string, required = false) => {
  return input({
    message: ' ' + message,
    default: v,
    required,
    validate: (inputted) => {
      const num = toNumber(inputted)
      return num !== undefined
    }
  })
}

export const promptTVShowSearchBy = async (v: SearchBy) => {
  return promptStringArray('Search By:', [SearchBy.TITLE, SearchBy.TVDB], v)
}

export const promptTVShowOrder = async (v: EpisodeOrder | undefined) => {
  return (await select({
    message: ' Order:',
    choices: [
      { value: 'official', name: 'Official' },
      { value: 'dvd', name: 'DVD' },
      { value: 'absolute', name: 'Absolute' }
    ],
    default: v
  })) as EpisodeOrder
}

export const matchVideo = async (outputBuffer: CLI.LineBuffer, video: Video, auto: boolean = false) => {
  while (!video.matched) {
    const searchResults = video.searchResults
    if (searchResults.length > 0) {
      const selectedID = await promptSearchResultID(searchResults)
      if (selectedID != -1) {
        await video.selectSearchResultID(selectedID)
      }
    }
    if (!video.matched) {
      video.setType(await promptVideoType(video.type))
      if (video.type === VideoType.MOVIE) {
        video.setSearchBy(await promptMovieSearchBy(video.searchBy))
        if (video.searchBy === SearchBy.TITLE) {
          video.movie.setTitle(await input({ message: ' Title:', default: video.movie.title, required: true }))
          video.movie.setYear(await promptNumber('Year:', video.movie.year ? '' + video.movie.year : ''))
        }
        if (video.searchBy === SearchBy.IMDB) {
          video.movie.setIMDB(await input({ message: ' IMDB ID:', default: video.movie.imdb, required: true }))
        }
        if (video.searchBy === SearchBy.TMDB) {
          video.movie.setTMDB(await promptNumber('TMDB ID:', video.movie.tmdb ? '' + video.movie.tmdb : '', true))
        }
        video.movie.setEdition(await promptMovieEdition(video.movie.edition))
      } else if (video.type === VideoType.TV_SHOW) {
        video.setSearchBy(await promptTVShowSearchBy(video.searchBy))
        if (video.searchBy === SearchBy.TITLE) {
          video.tvShow.setTitle(await input({ message: ' Title:', default: video.tvShow.title, required: true }))
          video.tvShow.setYear(await promptNumber('Year:', video.tvShow.year ? '' + video.tvShow.year : ''))
        }
        if (video.searchBy === SearchBy.TVDB) {
          video.tvShow.setTheTVDB(
            await promptNumber('TVDB ID:', video.tvShow.theTVDB ? '' + video.tvShow.theTVDB : '', true)
          )
        }
        video.tvShow.setOrder(await promptTVShowOrder(video.tvShow.order))
        if (video.tvShow.order !== 'absolute') {
          video.tvShow.setSeason(
            await promptNumber('Season:', !video.tvShow.season ? '' : '' + video.tvShow.season, true)
          )
          video.tvShow.setEpisode(
            await promptNumber('Episode:', !video.tvShow.episode ? '' : '' + video.tvShow.episode, true)
          )
        } else {
          video.tvShow.setAbsoluteEpisode(
            await promptNumber('Episode:', !video.tvShow.absoluteEpisode ? '' : '' + video.tvShow.absoluteEpisode, true)
          )
        }
      }
      await video.search().catch((error) => console.log(chalk.red((error as Error).message)))
    }
  }

  console.log()
  if (video.type === VideoType.MOVIE) {
    const fitWidth = outputBuffer.width() - 52
    const rLine = new CLI.Line(outputBuffer)
      .column(chalk.blueBright('ID'), 8)
      .column(chalk.blueBright('Title'), fitWidth)
      .column(chalk.blueBright('Year'), 6)
      .column(chalk.blueBright('Rating'), 8)
      .column(chalk.blueBright('Origin'), 30)
    rLine.fill().output()
    const dataLine = new CLI.Line(outputBuffer)
      .column('' + (video.movie.tmdb ?? ''), 8)
      .column(video.movie.title, fitWidth)
      .column('' + (video.movie.year ?? ''), 6)
      .column(ratingRenderer(video.movie.rating), 8)
      .column(video.movie.originalCountries.map((c) => c.alpha3).join(', '), 30)
    dataLine.fill().output()
    console.log()
    console.log(chalk.blueBright('Overview'))
    console.log(video.movie.overview ?? '-')
    console.log()
  } else if (video.type === VideoType.TV_SHOW) {
    const episode =
      (video.tvShow.season ? 'S' + Strings.toLeadingZeroNumber(video.tvShow.season) : '') +
      (video.tvShow.episode
        ? 'E' + Strings.toLeadingZeroNumber(video.tvShow.episode)
        : video.tvShow.absoluteEpisode
          ? 'E' + Strings.toLeadingZeroNumber(video.tvShow.absoluteEpisode)
          : '') +
      ' - ' +
      (video.tvShow.episodeTitle ?? '')
    const fitWidth = outputBuffer.width() - 24
    const rLine = new CLI.Line(outputBuffer)
      .column(chalk.blueBright('ID'), 8)
      .column(chalk.blueBright('Title'), Math.trunc(fitWidth / 2))
      .column(chalk.blueBright('Episode'), Math.trunc(fitWidth / 2))
      .column(chalk.blueBright('Year'), 6)
      .column(chalk.blueBright('Origin'), 6)
    rLine.fill().output()

    const dataLine = new CLI.Line(outputBuffer)
      .column('' + (video.tvShow.theTVDB ?? ''), 8)
      .column(video.tvShow.title ?? '', Math.trunc(fitWidth / 2))
      .column(episode, Math.trunc(fitWidth / 2))
      .column('' + (video.tvShow.year ?? ''), 6)
      .column(video.tvShow.originalCountries.map((c) => c.alpha3).join(', '), 6)
    dataLine.fill().output()
    console.log()
    console.log(chalk.blueBright('Overview'))
    console.log(video.tvShow.episodeOverview ?? video.tvShow.overview)
    console.log()
  }

  if (!auto) {
    const proceed = await confirm({ message: ' Proceed with this match?' })
    if (!proceed) {
      video.matched = false
      await matchVideo(outputBuffer, video)
    }
  }
}

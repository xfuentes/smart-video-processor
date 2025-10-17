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

import * as CLI from 'clui'
import * as chalk from 'chalk'
import { Video } from '../main/domain/Video'
import {
  booleanRenderer,
  codecRenderer,
  durationRenderer,
  framesRenderer,
  sizeRenderer,
  trackPropertiesRenderer,
  trackTypeRenderer
} from './renderers'
import { checkbox } from '@inquirer/prompts'

export const renderTrackList = (outputBuffer: CLI.LineBuffer, video: Video) => {
  let minWidth = 6
  video.tracks.forEach((t) => {
    if (t.name !== undefined && t.name.length > minWidth) {
      minWidth = t.name.length
    }
  })
  const fitWidth = Math.max(minWidth, outputBuffer.width() - 95)
  const rLine = new CLI.Line(outputBuffer)
    .column(chalk.blueBright('ID'), 4)
    .column(chalk.blueBright('Type'), 6)
    .column(chalk.blueBright('Language'), 9)
    .column(chalk.blueBright('Name'), fitWidth)
    .column(chalk.blueBright('Codec'), 12)
    .column(chalk.blueBright('Properties'), 16)
    .column(chalk.blueBright('Default'), 8)
    .column(chalk.blueBright('Forced'), 8)
    .column(chalk.blueBright('Duration'), 9)
    .column(chalk.blueBright('Frames'), 9)
    .column(chalk.blueBright('Size'), 9)
  rLine.fill().output()

  for (const track of video.tracks) {
    const dataLine = new CLI.Line(outputBuffer)
      .column('' + track.id, 4)
      .column(trackTypeRenderer(track.type), 6)
      .column(track.language ?? '', 9)
      .column(track.name || '', fitWidth)
      .column(codecRenderer(track.codec), 12)
      .column(trackPropertiesRenderer(track.properties), 16)
      .column(booleanRenderer(track.default), 8)
      .column(booleanRenderer(track.forced), 8)
      .column(durationRenderer(track.duration), 9)
      .column(framesRenderer(track.properties.frames), 9)
      .column(sizeRenderer(track.size), 9)
    if (track.copy) {
      dataLine.fill().output()
    } else {
      console.log(chalk.grey(chalk.strikethrough(dataLine.fill().contents().trim())))
    }
  }

  console.log()
}

export const requestTracksToCopy = async (outputBuffer: CLI.LineBuffer, video: Video, auto: boolean = false) => {
  if (!auto) {
    let minWidth = 6
    video.tracks.forEach((t) => {
      if (t.name !== undefined && t.name.length > minWidth) {
        minWidth = t.name.length
      }
    })
    const fitWidth = Math.max(6, outputBuffer.width() - 100)

    const rLine = new CLI.Line(outputBuffer)
      .column(chalk.blueBright(' ID'), 5)
      .column(chalk.blueBright('Type'), 6)
      .column(chalk.blueBright('Language'), 9)
      .column(chalk.blueBright('Name'), fitWidth)
      .column(chalk.blueBright('Codec'), 12)
      .column(chalk.blueBright('Properties'), 16)
      .column(chalk.blueBright('Default'), 8)
      .column(chalk.blueBright('Forced'), 8)
      .column(chalk.blueBright('Duration'), 9)
      .column(chalk.blueBright('Frames'), 9)
      .column(chalk.blueBright('Size'), 9)
    const headers = rLine.fill().contents()

    const choices: {
      name: string
      value: string | number | undefined
      checked: boolean
      disabled?: string | boolean
      short?: string
    }[] = []
    choices.push({ name: headers, value: undefined, checked: false, disabled: ' ', short: ' ' })
    for (const track of video.tracks) {
      const dataLine = new CLI.Line(outputBuffer)
        .column('' + track.id, 4)
        .column(trackTypeRenderer(track.type), 6)
        .column(track.language ?? '', 9)
        .column(track.name || '', fitWidth)
        .column(codecRenderer(track.codec), 12)
        .column(trackPropertiesRenderer(track.properties), 16)
        .column(booleanRenderer(track.default), 8)
        .column(booleanRenderer(track.forced), 8)
        .column(durationRenderer(track.duration), 9)
        .column(framesRenderer(track.properties.frames), 9)
        .column(sizeRenderer(track.size), 9)
      const name = dataLine.fill().contents().trim()
      choices.push({ name, value: track.id, checked: track.copy, short: '' + track.id })
    }

    const answer = await checkbox({
      message: ' Which track to keep?',
      choices,
      required: true,
      pageSize: 15
    })

    const changedTrackIDs: number[] = []
    for (const track of video.tracks) {
      const trackSelected = answer.includes(track.id)
      if (track.copy !== trackSelected) {
        changedTrackIDs.push(track.id)
      }
    }
    video.switchTrackSelection(changedTrackIDs)
  }
  renderTrackList(outputBuffer, video)
}

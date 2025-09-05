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
import { search } from '@inquirer/prompts'
import { promptStringArray } from './matching'
import { SubtitlesType } from '../common/SubtitlesType'
import { Languages } from '../common/LanguageIETF'
import { Hint } from '../main/domain/Hint'
import { Video } from '../main/domain/Video'
import { HintType } from '../common/@types/Hint'

export const promptLanguage = async (label: string, v: string | undefined) => {
  return search({
    message: ' ' + label,
    source: (input) => {
      if (!input) {
        input = v
      }
      if (input) {
        return Languages.searchByNameOrCode(input).map((lang) => ({
          name: lang.label,
          value: lang.code
        }))
      } else {
        return []
      }
    },
    pageSize: 5
  })
}

export const promptSubtitlesType = async (label: string, value: string | undefined) => {
  return promptStringArray(label, Object.values(SubtitlesType), value)
}

export const getCmdHint = (hint: Hint, languageHint?: string[]) => {
  if (languageHint) {
    for (const data of languageHint) {
      const hintArray = data.split(':')
      const id = hintArray.length === 2 ? Number(hintArray[0]) : undefined
      const value = hintArray.length === 2 ? hintArray[1] : hintArray[0]
      const { language } = Languages.fromIETF(value)
      const { language: languageHint } = Languages.fromIETF(hint.value)

      if (
        (id !== undefined && id === hint.trackId) ||
        language === languageHint ||
        languageHint === 'und' ||
        !hint.value
      ) {
        return value
      }
    }
  }
}

export const requestHints = async (video: Video, languageHint?: string[], auto: boolean = false) => {
  const languageHints = video.hints.filter((h) => h.type === HintType.LANGUAGE)
  const subtitlesTypeHints = video.hints.filter((h) => h.type === HintType.SUBTITLES_TYPE)

  if (languageHints.length > 0) {
    console.log(chalk.blueBright('Missing Language'))
    for (const hint of languageHints) {
      const track = video.tracks.find((t) => t.id === hint.trackId)
      const cmdHint = getCmdHint(hint, languageHint)
      if (cmdHint) {
        await video.setHint(hint, cmdHint)
        const languageName = Languages.getLanguageByCode(cmdHint)?.label
        console.log(
          `${chalk.greenBright('✔  ')}${chalk.whiteBright((track?.type ?? 'Unknown') + ' ' + hint.trackId + ':')} ${chalk.blueBright(languageName)}`
        )
      } else if (auto && hint.value) {
        console.log(
          `${chalk.greenBright('✔  ')}${chalk.whiteBright((track?.type ?? 'Unknown') + ' ' + hint.trackId + ':')} ${chalk.blueBright(Languages.getLanguageByCode(hint.value)?.label)}`
        )
      } else {
        await video.setHint(
          hint,
          await promptLanguage(
            `${track?.type ?? 'Unknown'} ${hint.trackId}`,
            Languages.getLanguageByCode(hint.value)?.label
          )
        )
      }
    }
    console.log()
  }

  if (subtitlesTypeHints.length > 0) {
    console.log(chalk.blueBright('Missing Subtitles Type'))
    for (const hint of subtitlesTypeHints) {
      const track = video.tracks.find((t) => t.id === hint.trackId)
      await video.setHint(hint, await promptSubtitlesType(`${track?.type ?? 'Unknown'} ${hint.trackId}`, hint.value))
    }
    console.log()
  }
}

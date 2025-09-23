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

import { IOther } from '../../common/@types/Other'
import { LanguageIETF, Languages } from '../../common/LanguageIETF'
import { Video } from './Video'
import { Files } from '../util/files'
import { debug } from '../util/log'
import { JobStatus } from '../../common/@types/Job'
import { Numbers } from '../util/numbers'

export default class Other implements IOther {
  public year?: number
  public month?: number
  public day?: number
  public originalLanguage?: LanguageIETF
  public poster?: string
  public posterURL?: string
  public title: string = ''
  private video: Video

  constructor(video: Video) {
    this.video = video
  }

  async search() {
    this.video.searchResults = []
    return this.load()
  }

  async load() {
    if (this.poster && Files.fileExistsAndIsReadable(this.poster)) {
      debug(`Using poster file://${this.poster}`)
    } else if (this.posterURL) {
      const fullPath = Files.makeTempFile('Other-poster.jpg')
      this.video.status = JobStatus.LOADING
      this.video.message = 'Downloading poster image.'
      this.video.fireChangeEvent()
      this.poster = await Files.downloadFile(this.posterURL, fullPath)
      debug(`Wrote poster file://${this.poster}`)
    }
    if (this.poster) {
      this.video.poster = {
        path: this.poster,
        description: `Custom Poster`,
        mimeType: 'image/jpeg',
        filename: 'cover.jpg'
      }
    } else {
      this.video.poster = undefined
    }
    const isoDate = this.year
      ? '' + this.year + (this.month ? '-' + this.month + (this.day ? '-' + this.day : '') : '')
      : ''
    this.video.title = `${isoDate ? isoDate + ': ' : ''}${this.title}`
    this.video.matched = true
    this.video.status = JobStatus.WAITING
    this.video.message = ''
    this.video.fireChangeEvent()
  }

  setTitle(newTitle: string) {
    this.title = newTitle
    this.video.fireChangeEvent()
  }

  setYear(newYear: string) {
    this.year = Numbers.toNumber(newYear)
    this.video.fireChangeEvent()
  }

  setMonth(newMonth: string) {
    this.month = Numbers.toNumber(newMonth)
    this.video.fireChangeEvent()
  }

  setDay(newDay: string) {
    this.day = Numbers.toNumber(newDay)
    this.video.fireChangeEvent()
  }

  setPosterPath(posterPath: string) {
    this.poster = posterPath
    this.video.fireChangeEvent()
  }

  setOriginalLanguage(originalLanguageCode: string) {
    this.originalLanguage = Languages.getLanguageByCode(originalLanguageCode)
    this.video.fireChangeEvent()
  }

  getOriginalLanguage() {
    return this.originalLanguage
  }

  toJSON(): IOther {
    return {
      title: this.title,
      year: this.year,
      month: this.month,
      day: this.day,
      poster: this.poster,
      posterURL: this.posterURL,
      originalLanguage: this.originalLanguage
    }
  }
}

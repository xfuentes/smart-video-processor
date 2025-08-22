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

import { Strings } from '../util/strings'

export class EpisodeData {
  public episodeNumber: number
  public seasonNumber: number | undefined
  public absoluteNumber: number
  public title: string
  public posterURL: string
  public overview: string

  constructor(
    episodeNumber: number,
    season: number | undefined,
    absoluteEpisode: number,
    title: string,
    posterURL: string,
    overview: string
  ) {
    this.episodeNumber = episodeNumber
    this.seasonNumber = season
    this.absoluteNumber = absoluteEpisode
    this.title =
      title ??
      (season ? 'S' + Strings.toLeadingZeroNumber(season) : '') +
        'E' +
        Strings.toLeadingZeroNumber(episodeNumber)
    this.posterURL = posterURL
    this.overview = overview
  }
}

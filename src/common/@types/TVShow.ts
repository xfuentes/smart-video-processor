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
import { EpisodeOrder } from '../../main/domain/clients/TVDBClient'
import { LanguageIETF } from './LanguageIETF'
import { Country } from './Countries'

export interface ITVShow {
  title?: string
  order?: EpisodeOrder
  season?: number
  episode?: number
  episodeTitle: string
  year?: number
  overview?: string
  episodeOverview?: string
  poster: string
  posterURL?: string
  theTVDB?: number
  imdb?: string
  absoluteEpisode?: number
  episodePoster: string
  episodePosterURL: string
  originalLanguage?: LanguageIETF
  originalCountries: Country[]
}

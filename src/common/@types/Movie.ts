/*
 * Smart Video Processor
 * Copyright (c) 2025. Xavier Fuentes <xfuentes-dev@serviam.cc>
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
import { LanguageIETF } from '../LanguageIETF'
import { Country } from '../Countries'
import { IDatabaseLink } from './DatabaseLink'

export enum EditionType {
  THEATRICAL = 'Theatrical',
  EXTENDED = 'Extended',
  DIRECTORS_CUT = "Director's cut",
  UNRATED = 'Unrated'
}

export enum ExtraType {
  NONE = 'None',
  TRAILER = 'Trailer',
  BEHIND_THE_SCENES = 'Behind the scenes',
  DELETED_SCENE = 'Deleted scene',
  FEATURETTE = 'Featurette',
  INTERVIEW = 'Interview',
  SCENE = 'Scene',
  SHORT = 'Short',
  OTHER = 'Other'
}

// The file name suffixes recognised by Jellyfin, Plex and Kodi for the extras of a movie.
export const EXTRA_FILENAME_SUFFIXES: Record<ExtraType, string> = {
  [ExtraType.NONE]: '',
  [ExtraType.TRAILER]: '-trailer',
  [ExtraType.BEHIND_THE_SCENES]: '-behindthescenes',
  [ExtraType.DELETED_SCENE]: '-deleted',
  [ExtraType.FEATURETTE]: '-featurette',
  [ExtraType.INTERVIEW]: '-interview',
  [ExtraType.SCENE]: '-scene',
  [ExtraType.SHORT]: '-short',
  [ExtraType.OTHER]: '-other'
}

export interface IMovie {
  title: string
  year?: number
  overview?: string
  poster: string
  posterURL?: string
  tmdb?: number
  imdb?: string
  originalLanguage?: LanguageIETF
  rating?: number
  originalCountries: Country[]
  edition: EditionType
  extraType?: ExtraType
  extraTitle?: string
  isAnimation?: boolean
  genres?: string[]
  database?: IDatabaseLink
}

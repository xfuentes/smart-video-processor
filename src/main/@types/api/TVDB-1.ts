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

export interface TVDBResult {
    "aliases": string[],
    "banner": string,
    "firstAired": string,
    "id": number,
    "image": string,
    "network": string,
    "overview": string,
    "poster": string,
    "seriesName": string,
    "slug": string,
    "status": string
}

export interface TVDBSearchResults {
    data: TVDBResult[]
}

export enum TVDBGenre {
    ACTION = "Action",
    ADVENTURE = "Adventure",
    ANIMATION = "Animation",
    ANIME = "Anime",
    COMEDY = "Comedy",
    DRAMA = "Drama",
    FANTASY = "Fantasy"
}

export interface TVDBDetails {
    "data": {
        "id": number,
        "seriesId": number,
        "seriesName": string,
        "aliases": string[],
        "season": number,
        "poster": string,
        "banner": string,
        "fanart": string,
        "status": string,
        "firstAired": string,
        "network": string,
        "networkId": number,
        "runtime": number,
        "language": string,
        "genre": TVDBGenre[],
        "overview": string,
        "lastUpdated": number,
        "airsDayOfWeek": string,
        "airsTime": string,
        "rating": string,
        "imdbId": string,
        "zap2itId": string,
        "added": string,
        "addedBy": number,
        "siteRating": number,
        "siteRatingCount": number,
        "slug": string
    },
    "Error": string
}

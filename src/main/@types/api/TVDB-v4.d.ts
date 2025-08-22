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

interface TVDBLoginResponse {
    "data": {
        "token": string
    },
    "status": string
}

interface RemoteID {
    "id": string,
    "type": number,
    "sourceName": string
}

interface TVDBSearchResponse {
    "aliases": string[],
    "companies": string[],
    "companyType": string,
    "country": string,
    "director": string,
    "first_air_time": string,
    "genres": string[],
    "id": string,
    "image_url": string,
    "name": string,
    "is_official": true,
    "name_translated": string,
    "network": string,
    "objectID": string,
    "officialList": string,
    "overview": string,
    "overviews": {
        [name: string]: string
    },
    "poster": string,
    "posters": string[],
    "primary_language": string,
    "remote_ids": RemoteID[],
    "status": string,
    "slug": string,
    "studios": string[],
    "title": string,
    "thumbnail": string,
    "translations": {
        [name: string]: string
    },
    "translationsWithLang": string[],
    "tvdb_id": string,
    "type": string,
    "year": string
}

interface TVDBSearchResponses {
    data: TVDBSearchResponse[],
    "status": string,
    "links": {
        "prev": string,
        "self": string,
        "next": string,
        "total_items": number,
        "page_size": number
    }
}

interface TVDBGenreIDMap {
    1: "Soap",
    2: "Science Fiction",
    3: "Reality",
    4: "News",
    5: "Mini-Series",
    6: "Horror",
    7: "Home and Garden",
    8: "Game Show",
    9: "Food",
    10: "Fantasy",
    11: "Family",
    12: "Drama",
    13: "Documentary",
    14: "Crime",
    15: "Comedy",
    16: "Children",
    17: "Animation",
    18: "Adventure",
    19: "Action",
    21: "Sport",
    22: "Suspense",
    23: "Talk Show",
    24: "Thriller",
    25: "Travel",
    26: "Western",
    27: "Anime",
    28: "Romance",
    29: "Musical",
    30: "Podcast",
    31: "Mystery",
    32: "Indie",
    33: "History",
    34: "War",
    35: "Martial Arts",
    36: "Awards Show"
}

enum TVDBGenre {
    ACTION = 19,
    ADVENTURE = 18,
    ANIMATION = 17,
    ANIME = 27,
    WESTERN = 26,
    COMEDY = 15,
    DRAMA = 12,
    FANTASY = 10,
    HORROR = 6
}

/**
 * A company record
 */
interface Company {
    activeDate: string,
    aliases: string[],
    country: string,
    id: number,
    inactiveDate: string,
    name: string,
    nameTranslations: string[],
    overviewTranslations: string[],
    primaryCompanyType: number | null,
    slug: string,
    parentCompany: never,
    tagOptions: never
}

/**
 * Companies by type record
 */
interface Companies {
    studio: Company[],
    network: Company[],
    production: Company[],
    distributor: Company[],
    special_effects: Company[]
}

/**
 * season type record
 */
interface SeasonType {
    alternateName: string,
    id: number,
    name: string,
    type: string
}

/**
 * Season genre record
 */
interface SeasonBaseRecord {
    id: number,
    image: string,
    imageType: number,
    lastUpdated: string,
    name: string,
    nameTranslations: string[],
    number: number,
    overviewTranslations: string[],
    companies: Companies,
    seriesId: number,
    type: SeasonType,
    year: string
}

/**
 * An alias model, which can be associated with a series, season, movie, person, or list.
 */
interface Alias {
    /**
     * A 3-4 character string indicating the language of the alias, as defined in Language.
     */
    language: string,
    /**
     * A string containing the alias itself. (max 100 characters)
     */
    name: string,
}

/**
 * status record
 */
interface Status {
    id: number | null,
    keepUpdated: boolean,
    name: string,
    recordType: string
}

/**
 * base episode record
 */
interface EpisodeBaseRecord {
    absoluteNumber: number,
    aired: string,
    airsAfterSeason: number,
    airsBeforeEpisode: number,
    airsBeforeSeason: number,
    /**
     * "season", "midseason", or "series"
     */
    finaleType: string | null,
    id: number,
    image: string,
    imageType: number | null,
    isMovie: number,
    lastUpdated: string,
    linkedMovie: number,
    name: string,
    nameTranslations: string[],
    number: number,
    overview: string,
    overviewTranslations: string[],
    runtime: number | null,
    seasonNumber: number,
    seriesId: number,
    seasonName: string,
    year: string
}

/**
 * The base record for a series. All series airs time like firstAired, lastAired, nextAired, etc. are in US EST for US series,
 * and for all non-US series, the time of the show’s country capital or most populous city.
 * For streaming services, is the official release time. See https://support.thetvdb.com/kb/faq.php?id=29.
 */
interface SeriesBaseRecord {
    aliases: Alias[],
    averageRuntime: number | null,
    country: string,
    defaultSeasonType: number
    firstAired: string,
    id: number,
    image: string,
    isOrderRandomized: boolean,
    lastAired: string,
    lastUpdated: string,
    name: string,
    nameTranslations: string[]
    nextAired: string,
    originalCountry: string,
    originalLanguage: string,
    overviewTranslations: string[],
    score: number,
    slug: string,
    status: Status,
    year: string,
    overview: string
}

interface TVDBSeriesResponse {
    data: {
        series: SeriesBaseRecord,
        episodes: EpisodeBaseRecord[],
    },
    status: string,
    message: string
}

interface TVDBTranslation {
    "data": {
        "aliases": string[],
        "isAlias": true,
        "isPrimary": true,
        "language": string,
        "name": string,
        "overview": string,
        "tagline": string
    },
    "status": string
}

interface TVDBEpisodesTranslationResponse {
    data: {
        id: number,
        name: string,
        image: string,
        slug: string,
        episodes: EpisodeBaseRecord[],
    },
    status: string,
    message: string
}

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

interface TMDBResult {
    "popularity": number,
    "id": number,
    "video": boolean,
    "vote_count": number,
    "vote_average": number,
    "title": string,
    "release_date": string,
    "original_language": string,
    "original_title": string,
    "genre_ids": number[],
    "backdrop_path": string,
    "adult": boolean,
    "overview": string,
    "poster_path": string
}

interface TMDBSearchResults {
    "page": number,
    "total_results": number,
    "total_pages": number,
    "results": TMDBResult[]
}

interface TMDBSearchIMDBResult {
    "movie_results": TMDBResult[]
}

interface TMDBResponse {
    "status_code": number,
    "status_message": string,
    "success": boolean
}

interface TMDBGenre {
    id: number,
    name: string
}

interface ProductionCompany {
    "id": number,
    "logo_path": string | null,
    "name": string,
    "origin_country": string
}

interface ProductionCountry {
    "iso_3166_1": string,
    "name": string
}

interface Language {
    "iso_639_1": string,
    "name": string
}

interface TMDBDetails {
    success?: boolean,
    status_message: string,
    "adult": boolean,
    "backdrop_path": string,
    "belongs_to_collection": {
        "id": number,
        "name": string,
        "poster_path": string,
        "backdrop_path": string
    },
    "budget": number,
    "genres": TMDBGenre[],
    "homepage": string,
    "id": number,
    "imdb_id": string,
    "origin_country": string[],
    "original_language": string,
    "original_title": string,
    "overview": string,
    "popularity": number,
    "poster_path": string,
    "production_companies": ProductionCompany[],
    "production_countries": ProductionCountry[],
    "release_date": string,
    "revenue": number,
    "runtime": number,
    "spoken_languages": Language[],
    "status": "Released",
    "tagline": string,
    "title": string,
    "video": boolean,
    "vote_average": number,
    "vote_count": number
}

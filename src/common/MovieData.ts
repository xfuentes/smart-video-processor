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

export default class MovieData {
    public tmdb: number;
    public title: string;
    public year: number;
    public overview: string;
    public posterUrl?: string;
    public language: string;
    public countries: string[];
    public imdb?: string;
    public rating?: number;
    public duration: number | undefined;

    constructor(tmdb: number, title: string, year: number, overview: string, posterUrl: string | undefined, language: string, countries: string[], imdb?: string, rating?: number, duration?: number) {
        this.tmdb = tmdb;
        this.title = title;
        this.year = year;
        this.overview = overview;
        this.posterUrl = posterUrl;
        this.language = language;
        this.imdb = imdb;
        this.countries = countries;
        this.rating = rating;
        this.duration = duration;
    }

}

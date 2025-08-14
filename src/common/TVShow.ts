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

import Files from "../util/files.ts";
import Video, {SearchBy} from "./Video.ts";
import {SearchResult} from "./SearchResult.ts";
import Chalk from "chalk";
import {LanguageIETF} from "./LanguageIETF.ts";
import {EpisodeOrder, TVDBClient} from "./clients/TVDBClient.ts";
import Strings from "../util/strings.ts";
import {Country} from "./Countries.ts";
import Numbers from "../util/numbers.ts";
import {pathJoin} from "../util/path.ts";
import {JobStatus} from "./jobs/Job.ts";
import {JobManager} from "./jobs/JobManager.ts";
import { debug } from "../util/log.ts";

export const THE_TVDB_IMAGE_URL = "https://www.thetvdb.com";

export default class TVShow {
    public video: Video;
    public title?: string;
    public order?: EpisodeOrder;
    public season?: number;
    public episode?: number;
    public episodeTitle: string = "";
    public year?: number;
    public overview?: string;
    public episodeOverview?: string;
    public poster: string = "";
    public posterURL?: string;
    public theTVDB?: number;
    public imdb?: string;
    public absoluteEpisode?: number;
    public episodePoster: string = "";
    public episodePosterURL: string = "";
    public searchResults: SearchResult[] = [];
    public originalLanguage: LanguageIETF | undefined;
    public originalCountries: Country[] = [];

    constructor(video: Video) {
        this.video = video;
    }

    async search(searchBy: SearchBy) {
        this.searchResults = [];
        if (searchBy === SearchBy.TVDB) {
            if (!this.theTVDB) {
                throw new Error("TVDB ID is mandatory")
            }
            await this.loadSeries();
        } else {
            if (!this.title) {
                throw new Error("Series name is mandatory")
            }
            this.video.status = JobStatus.LOADING;
            this.video.message = "Searching series on TheTVDB";
            this.video.emitChangeEvent();
            this.searchResults = await TVDBClient.getInstance().searchSeries(this.title, this.year);
            const seriesMatched = SearchResult.getBestMatch(this.searchResults, this.title, this.year);

            if (!seriesMatched) {
                this.video.status = JobStatus.WARNING;
                this.video.message = "Unable to find an exact match on TheTVDB. Please check the information provided and try again.";
                console.log(Chalk.red(this.video.message));
                this.video.emitChangeEvent();
            } else {
                this.theTVDB = seriesMatched.id;
                await this.loadSeries();
            }
        }
    }

    public async loadSeries() {
        if (!this.theTVDB) {
            throw new Error("TVDB ID is mandatory.");
        }
        if (!this.episode && !this.absoluteEpisode) {
            throw new Error("EpisodeData number is mandatory.");
        }

        this.video.message = "Retrieving episode details";
        const {episodeData, seriesData} = await TVDBClient.getInstance().retrieveSeriesDetails(this.theTVDB, this.order ?? "official", this.episode, this.absoluteEpisode, this.season);
        if (!episodeData) {
            this.video.status = JobStatus.WARNING;
            this.video.message = "EpisodeData not found. Please check the information provided and try again.";
            console.log(Chalk.red(this.video.message));
            this.video.emitChangeEvent();
        }
        this.imdb = seriesData.imdb;
        this.title = seriesData.title;
        this.poster = "";
        this.posterURL = seriesData.posterURL;
        this.originalCountries = seriesData.countries;
        this.originalLanguage = seriesData.language;
        if (seriesData.year) {
            this.year = seriesData.year;
        }

        this.episode = episodeData.episodeNumber;
        this.season = episodeData.seasonNumber;
        this.absoluteEpisode = episodeData.absoluteNumber;
        this.episodeTitle = episodeData.title;
        this.episodePoster = "";
        this.episodePosterURL = episodeData.posterURL;
        this.overview = seriesData.overview;
        this.episodeOverview = episodeData.overview;
        this.video.matched = true;
        if (!this.searchResults || this.searchResults.length === 0) {
            this.searchResults = [seriesData];
        }

        const directory = JobManager.getInstance().getTempPath("TVDB-" + this.theTVDB);

        let filename = "cover.jpg";
        const fullPath = pathJoin(directory, filename);
        if (Files.fileExistsAndIsReadable(fullPath)) {
            this.poster = fullPath;
            debug(`Re-using poster file://${this.poster}`);
        } else if (this.posterURL) {
            this.video.status = JobStatus.LOADING;
            this.video.message = "Downloading poster image from TheTVDB.";
            this.video.emitChangeEvent();
            this.poster = await Files.downloadFile(this.posterURL, directory, filename);
            debug(`Wrote poster file://${this.poster}`);
        }
        if (this.episodePosterURL || this.poster) {
            if (!this.episodePosterURL && this.poster) {
                this.video.poster = {
                    path: this.poster,
                    filename: "cover.jpg",
                    description: `TVDB Image ${this.posterURL}`,
                    mimeType: "image/jpeg"
                };
            } else if (this.episodePosterURL) {
                this.video.message = "Downloading episode image from TheTVDB."
                this.video.emitChangeEvent();
                filename = `episode-${this.season !== undefined ? "S" + Strings.toLeadingZeroNumber(this.season) + "E" + Strings.toLeadingZeroNumber(this.episode) : this.absoluteEpisode}.jpg`;
                this.episodePoster = await Files.downloadFile(this.episodePosterURL, directory, filename);
                debug(`wrote episode image file://${this.episodePoster}`);
                this.video.poster = {
                    path: this.episodePoster,
                    filename: "cover.jpg",
                    description: `TVDB Image ${this.episodePosterURL}`,
                    mimeType: "image/jpeg"
                };
            }
        }
        if (this.season !== undefined && this.episode !== undefined) {
            this.video.title = `${this.title} - S${Strings.toLeadingZeroNumber(this.season)}E${Strings.toLeadingZeroNumber(this.episode)}${this.episodeTitle ? " - " + this.episodeTitle : ""}`;
        } else {
            this.video.title = `${this.title}${this.absoluteEpisode ? " - E" + Strings.toLeadingZeroNumber(this.absoluteEpisode) : ""}${this.episodeTitle ? " - " + this.episodeTitle : ""}`;
        }
        this.video.emitChangeEvent();
    }

    setTitle(newTitle: string) {
        this.title = newTitle;
        this.video.emitChangeEvent();
    }

    setIMDB(newIMDB: string) {
        this.imdb = newIMDB;
        this.video.emitChangeEvent();
    }

    setOrder(order: EpisodeOrder) {
        this.order = order;
        this.video.emitChangeEvent();
    }

    setSeason(newSeason: string) {
        this.season = Numbers.toNumber(newSeason);
        this.video.emitChangeEvent();
    }

    setEpisode(newEpisode: string) {
        this.episode = Numbers.toNumber(newEpisode);
        this.video.emitChangeEvent();
    }

    setAbsoluteEpisode(newAbsoluteEpisode: string) {
        this.season = 1;
        this.absoluteEpisode = Numbers.toNumber(newAbsoluteEpisode);
        this.video.emitChangeEvent();
    }

    setTheTVDB(id: number | string | undefined) {
        this.theTVDB = id !== undefined ? Numbers.toNumber("" + id) : undefined;
        this.video.emitChangeEvent();
    }

    setYear(newYear: string) {
        this.year = Numbers.toNumber(newYear);
        this.video.emitChangeEvent();
    }

    async selectSearchResultID(id: number | string | undefined) {
        const idNum = id !== undefined ? Numbers.toNumber("" + id) : undefined;
        if (this.theTVDB !== id) {
            this.setTheTVDB(idNum);
            await this.loadSeries();
        }
    }

    getOriginalLanguage() {
        return this.originalLanguage;
    }

    getOriginalCountries() {
        return this.originalCountries;
    }
}

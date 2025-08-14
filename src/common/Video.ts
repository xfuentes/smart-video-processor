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

import Movie, {EditionType} from "./Movie";
import AudioVersions, {AudioVersion} from "./AudioVersions";
import TVShow from "./TVShow";
import Files from "../util/files";
import {v4 as UUIDv4} from "uuid";
import {Container} from "./programs/MKVMerge.ts";
import {Attachment, Change, ChangeProperty, ChangePropertyValue, ChangeSourceType, ChangeType, containerItems, containerProperties, trackProperties} from "./Change.ts";
import {Brain} from "./Brain.ts";
import {Hint} from "./Hint.ts";
import {pathBasename, pathDirname, pathIsAbsolute, pathJoin} from "../util/path.ts";
import Job, {JobStatus} from "./jobs/Job.ts";
import ProcessingJob from "./jobs/ProcessingJob.ts";
import FileInfoLoadingJob from "./jobs/FileInfoLoadingJob.ts";
import Strings from "../util/strings.ts";
import {EncoderSettings, Encoding} from "./Encoding.ts";
import EncodingJob from "./jobs/EncodingJob.ts";
import {SearchResult} from "./SearchResult.ts";
import {currentSettings} from "./Settings.ts";
import Track, {TrackType} from "./Track.ts";
import {JobManager} from "./jobs/JobManager.ts";
import {Progression} from "../util/processes.ts";
import {debug} from "../util/log.ts";

type Listener = (video: Video) => void;

export enum VideoType {
    MOVIE = "Movie",
    TV_SHOW = "TV-Show",
    OTHER = "Other"
}

export enum VideoTune {
    FILM = "Film",
    ANIMATION = "Animation",
    GRAIN = "Grain"
}

export enum SearchBy {
    TITLE = "Title",
    IMDB = "IMDB ID",
    TMDB = "TMDB ID",
    TVDB = "TVDB ID"
}

interface TrackChanges {
    id: number;
    type: TrackType;
    score: number;
    name?: string;
    language?: string;
    default?: boolean;
    forced?: boolean;
}

export default class Video {
    public readonly uuid: string = UUIDv4();
    public filename: string;
    public size: number = 0;
    public path: string;
    public type: VideoType = VideoType.OTHER;
    public changeListeners: Listener[] = [];
    public container: Container | undefined;
    public tracks: Track[] = [];
    public changes: Change[] = [];
    public hints: Hint[] = [];
    public movie: Movie = new Movie(this);
    public tvShow: TVShow = new TVShow(this);
    public status: JobStatus;
    public message: string | undefined;
    public progression: Progression;
    /**
     * This flag is set to false once video file has been loaded.
     */
    public loading: boolean = true;
    public matched: boolean = false;
    public brainCalled: boolean = false;
    public autoModePossible: boolean = true;
    /**
     * True if processing was completed successfully
     */
    public processed: boolean = false;
    public removeTracksChecked: boolean = true;
    public trackLanguageSelection = new Map();
    public trackTypeSelection = new Map();
    /*
     * Audio versions hint from filename
     */
    public audioVersions: AudioVersion[] = [];
    public title: string = "";
    public poster?: Attachment;
    public changedTracks: TrackChanges[] = [];
    public missingLanguageTracks: number[] = [];
    public missingTypeTracks: number[] = [];
    public containerChanges: string[] = [];
    public searchBy: SearchBy = SearchBy.TITLE;
    /*
     * Encoder Info
     */
    public encodedPath?: string;
    public tune: VideoTune = VideoTune.FILM;
    public encoderSettings: EncoderSettings[] = [];
    /*
     * User preference input by video.
     */
    public trackEncodingEnabled: Map<string, boolean> = new Map();
    // Currently running job
    private job?: Job<unknown>;
    public lastPromise?: Promise<unknown>;

    constructor(path: string) {
        this.filename = pathBasename(path);
        this.path = path;
        this.status = JobStatus.LOADING;
        this.message = "Analysing file name.";
        this.progression = {progress: undefined};
        this.extractInfosFromFilename();
    }

    public static getAvailablePropertiesBySource(source: string, type: ChangeType) {
        if(type === ChangeType.UPDATE) {
            return Object.values(ChangeProperty)
                .filter(key => (source === "Container" && containerProperties.includes(key))
                    || (source !== "Container" && trackProperties.includes(key)));
        } else {
            return Object.values(ChangeProperty)
                .filter(key => (source === "Container" && containerItems.includes(key)));
        }
    }

    public static getAvailableChangeTypesBySource = (source: string) => {
        if(source === "Container") {
            return Object.values(ChangeType);
        } else {
            return [ChangeType.UPDATE];
        }
    };

    static sourceToSourceTypeTrackID(source: string): { sourceType: ChangeSourceType, trackId?: number } {
        const sepIndex = source.indexOf(" ");
        const trackId = sepIndex !== -1 ? Number(source.substring(source.indexOf(" ") + 1)) : undefined;
        const sourceTypeStr = sepIndex !== -1 ? source.substring(0, source.indexOf(" ")) as ChangeSourceType : source as ChangeSourceType;
        const sourceType = Object.values(ChangeSourceType).find(type => sourceTypeStr === type);
        if (sourceType === undefined) {
            throw new Error("Invalid ChangeSourceType extracted from " + source);
        }
        return {sourceType, trackId};
    }

    static sourceTypeTrackIDToSource(sourceType: ChangeSourceType, trackId?: number): string {
        let source;
        switch (sourceType) {
            case ChangeSourceType.CONTAINER:
                source = "Container";
                break;
            default:
                source = `${sourceType} ${trackId}`;
        }
        return source;
    }

    public getVersions() {
        const versions: string[] = [];
        if (this.type !== VideoType.TV_SHOW) {
            const videoTrack = this.tracks.find(t => t.type === TrackType.VIDEO);
            if (videoTrack?.properties.videoDimensions) {
                versions.push(Strings.pixelsToVideoFormat(videoTrack.properties.videoDimensions));
            }
            if (videoTrack?.codec) {
                const codec = videoTrack?.codec.toLowerCase();
                if (codec.indexOf("H.264")) {
                    versions.push("h264");
                } else if (codec.indexOf("H.265")) {
                    versions.push("h265");
                }
            }
        }
        return versions;
    }

    addChangeListener(listener: Listener) {
        this.changeListeners.push(listener);
    }

    removeChangeListener(listener: Listener) {
        const listeners: Listener[] = [];
        for (const l of this.changeListeners) {
            if (l !== listener) {
                listeners.push(l);
            }
        }
        this.changeListeners = listeners;
    }

    emitChangeEvent() {
        this.changeListeners.forEach(listener => {
            listener(this);
        });
    }

    attachJob<T>(job: Job<T>): Job<T> {
        if (this.job === undefined || this.job.isFinished()) {
            this.job = job;
            const listener = () => {
                this.status = job.getStatus();
                this.message = job.getStatusMessage();
                this.progression = job.getProgression();
                if (job.isFinished()) {
                    if (this.job === job) {
                        this.job = undefined;
                    }
                    job.removeChangeListener(listener);
                } else {
                    this.processed = false;
                }
                this.emitChangeEvent();
            }
            job.addChangeListener(listener);
        } else {
            throw new Error("A job is already running, please wait.");
        }
        return job;
    }

    async load() {
        const fij = this.attachJob(new FileInfoLoadingJob(this.path));
        const {tracks, container} = await fij.queue();
        this.tracks = tracks;
        this.container = container;
        this.generateEncoderSettings();
        this.loading = false;
        this.emitChangeEvent();
        await this.search();
    }

    generateEncoderSettings(init = true) {
        this.encoderSettings = Encoding.getInstance().analyse(this.tracks, this.trackEncodingEnabled);
        if (init) {
            this.trackEncodingEnabled.clear();
            this.encoderSettings.forEach(s => this.setTrackEncodingEnabled(s.trackType + " " + s.trackId, true));
        }
        debug("### ENCODER SETTINGS ###");
        debug(this.encoderSettings);
        this.emitChangeEvent();
    }

    async search() {
        this.matched = false;
        this.brainCalled = false;
        this.hints = [];
        if (this.type === VideoType.MOVIE) {
            await this.movie.search(this.searchBy);
        } else if (this.type === VideoType.TV_SHOW) {
            await this.tvShow.search(this.searchBy);
        }
        await this.analyse();
    }

    async analyse() {
        const selectedTracks = this.getSelectedTracks();
        if (this.matched && selectedTracks.length > 0) {
            debug("### TRACKS ###");
            debug(this.tracks);
            debug("### OriginalLanguageIETF ###");
            debug(this.getOriginalLanguageIETF());
            debug("### Attachments ###");
            debug(this.container?.attachments);

            const processingResults = Brain.getInstance().analyse(selectedTracks,
                this.path, this.title, this.poster, this.container?.title, this.container?.attachments, this.container?.tagCount ?? 0,
                this.getOriginalLanguageIETF(), this.getOriginalCountries(), this.audioVersions, this.hints,
                this.type === VideoType.MOVIE ? this.movie.tmdb : undefined, this.type === VideoType.MOVIE ? this.movie.edition : undefined,
                this.getVersions());
            if (this.brainCalled) {
                // remove deletion request if not on first call to keep user selection.
                this.changes = processingResults.changes.filter(c => c.changeType !== ChangeType.DELETE || c.trackId === undefined);
            } else {
                this.changes = processingResults.changes;
            }
            this.hints = processingResults.hints;

            debug("### CHANGES ###");
            debug(this.changes);
            debug("### HINTS ###");
            debug(this.hints);
            this.status = JobStatus.WAITING;
            this.progression.progress = -1;
            if (this.hintMissing()) {
                this.message = "Waiting for your hints.";
                this.autoModePossible = false;
            } else if (this.changes.length > 0) {
                this.message = "Ready to process.";
            } else if (this.encoderSettings.length > 0) {
                this.message = "Ready to encode.";
            } else {
                this.status = JobStatus.WARNING;
                this.message = "Nothing to do."
            }
            if (!this.brainCalled) {
                this.selectAllTracks();
                this.unselectBrainDeletedTracks();
                this.brainCalled = true;
            }
            this.emitChangeEvent();
            if (this.autoModePossible && currentSettings.isAutoStartEnabled) {
                await this.encode();
            }
        }
    }

    unselectBrainDeletedTracks() {
        const trackDeletionList: number[] = this.changes
            .filter(c => c.changeType === ChangeType.DELETE && c.trackId != undefined)
            .map(c => c.trackId as number);
        this.changes = this.changes.filter(c => !trackDeletionList.includes(c.trackId as number));
        this.hints = this.hints.filter(h => !trackDeletionList.includes(h.trackId as number));
        this.tracks.filter(t => trackDeletionList.includes(t.id)).forEach(t => {
            t.copy = false;
            this.setTrackEncodingEnabled(t.type + " " + t.id, false);
        });
    }

    getOriginalLanguageIETF() {
        let originalLanguage;
        if (this.type === VideoType.MOVIE) {
            originalLanguage = this.movie.getOriginalLanguage();
        } else {
            originalLanguage = this.tvShow.getOriginalLanguage();
        }
        return originalLanguage;
    }

    getOriginalCountries() {
        let originalCountries;
        if (this.type === VideoType.MOVIE) {
            originalCountries = this.movie.getOriginalCountries();
        } else {
            originalCountries = this.tvShow.getOriginalCountries();
        }
        return originalCountries;
    }

    async encode() {
        let encodingRequired = false;
        let encodingJob = undefined;
        const finalEncoderSettings = this.getFinalEncoderSettings();
        if (finalEncoderSettings.length > 0) {
            encodingRequired = true;
        }
        if (encodingRequired && this.container !== undefined) {
            encodingJob = this.job = this.attachJob(new EncodingJob(this.path, this.container.durationSeconds,
                this.tracks, finalEncoderSettings));
            this.encodedPath = await this.job.queue() as string;
        }
        await this.process(encodingJob?.getDuration());
    }

    getFinalEncoderSettings() {
        return this.encoderSettings.filter(s => this.isTrackEncodingEnabled(s.trackType + " " + s.trackId));
    }

    async process(extraDuration?: number) {
        const subDirs = [];
        if (this.type === VideoType.TV_SHOW && this.tvShow.title !== undefined) {
            subDirs.push(`${Files.removeSpecialCharsFromFilename(this.tvShow.title)} {tvdb-${this.tvShow.theTVDB}}`);
            if (this.tvShow.order === "official" && this.tvShow.season !== undefined) {
                subDirs.push("Season " + Strings.toLeadingZeroNumber(this.tvShow.season));
            }
        }
        let outputDirectory = this.getOutputDirectory();
        if (!pathIsAbsolute(outputDirectory)) {
            // Output path is relative to the original filename dirname.
            outputDirectory = pathJoin(pathDirname(this.path), outputDirectory);
        }

        this.job = this.attachJob(new ProcessingJob(pathBasename(this.path), this.encodedPath !== undefined ? this.encodedPath : this.path, this.changes, this.tracks, outputDirectory, subDirs, extraDuration));
        await this.job.queue();
        this.encodedPath = undefined;
        if (this.status === JobStatus.SUCCESS) {
            this.processed = true;
        }
    }

    getOutputDirectory() {
        if (this.type === VideoType.MOVIE) {
            return currentSettings.moviesOutputPath;
        } else if (this.type === VideoType.TV_SHOW) {
            return currentSettings.tvShowsOutputPath;
        } else {
            return currentSettings.othersOutputPath;
        }
    }

    setType(type: VideoType) {
        this.type = type;
        this.emitChangeEvent();
    }

    setTune(tune: VideoTune) {
        this.tune = tune;
        this.emitChangeEvent();
    }

    setSearchBy(searchBy: SearchBy) {
        this.searchBy = searchBy;
        this.emitChangeEvent();
    }

    getPossibleSources(): string[] {
        const possibleSources: string[] = [];
        Object.values(ChangeSourceType).forEach(k => {
            if (k === ChangeSourceType.CONTAINER) {
                possibleSources.push(k);
            } else {
                for (const t of this.tracks) {
                    if (t.type.toString() === k.toString()) {
                        possibleSources.push(`${k} ${t.id}`);
                    }
                }
            }
        });
        return possibleSources;
    }

    getPropertyValue(source: string, property: ChangeProperty | undefined): string | boolean | undefined {
        if (property === undefined) {
            return property;
        }
        let value;
        if (source === "Container") {
            switch (property) {
                case ChangeProperty.TITLE:
                    value = this.container?.title ?? "";
                    break;
                default:
                    value = undefined;
            }
        } else {
            const trackId = Number(source.substring(source.indexOf(" ") + 1));
            const track = this.tracks.find(t => t.id === trackId);
            switch (property) {
                case ChangeProperty.DEFAULT:
                    value = track?.default;
                    break;
                case ChangeProperty.FORCED:
                    value = track?.forced;
                    break;
                case ChangeProperty.NAME:
                    value = track?.name;
                    break;
                case ChangeProperty.LANGUAGE:
                    value = track?.language;
                    break;
                default:
                    value = undefined;
            }
        }
        return value;
    }

    public setHint(hint: Hint, value?: string) {
        const foundHint = this.hints.find(h => h.type === hint.type && h.trackId === hint.trackId);
        if (foundHint !== undefined) {
            foundHint.value = value;
            void this.analyse();
        }
    }

    changeExists(uuid: string | undefined, source: string, changeType: ChangeType, property?: ChangeProperty): boolean {
        const {sourceType, trackId} = Video.sourceToSourceTypeTrackID(source);
        for (const change of this.changes) {
            if (change.uuid !== uuid && change.sourceType === sourceType && change.changeType === changeType &&
                change.trackId === trackId && change.property === property) {
                return true;
            }
        }
        return false;
    }

    addChange(source: string, changeType: ChangeType, property?: ChangeProperty, newValue?: ChangePropertyValue): string {
        const {sourceType, trackId} = Video.sourceToSourceTypeTrackID(source);
        const newChange = new Change(sourceType, changeType, trackId, property, this.getPropertyValue(source, property), newValue);
        this.changes.push(newChange);
        this.emitChangeEvent();
        return newChange.uuid;
    }

    saveChange(uuid: string, source: string, changeType: ChangeType, property?: ChangeProperty, newValue?: ChangePropertyValue) {
        const {sourceType, trackId} = Video.sourceToSourceTypeTrackID(source);
        const change = this.changes.find(c => c.uuid === uuid);
        if (change !== undefined) {
            change.sourceType = sourceType;
            change.changeType = changeType;
            change.trackId = trackId;
            change.property = property;
            change.currentValue = this.getPropertyValue(source, property);
            change.newValue = newValue;
            this.changes = this.changes.slice(0);
            this.emitChangeEvent();
        }
    }

    deleteChange(uuid: string) {
        this.changes = this.changes.filter(c => c.uuid !== uuid);
        this.emitChangeEvent();
    }

    getChangeByUUID(changeUUID: string) {
        return this.changes.find(c => c.uuid === changeUUID);
    }

    hintMissing() {
        return this.hints.find(h => !h.value) !== undefined;
    }

    abortJob() {
        if (this.job) {
            JobManager.getInstance().removeFromQueueAndAbort(this.job);
            this.autoModePossible = false;
        }
    }

    isTrackEncodingEnabled(source: string) {
        return this.trackEncodingEnabled.get(source) ?? false;
    }

    setTrackEncodingEnabled(source: string, value: boolean) {
        this.trackEncodingEnabled.set(source, value);
        this.generateEncoderSettings(false);
    }

    getSearchResults(): SearchResult[] {
        if (this.type === VideoType.MOVIE) {
            return this.movie.searchResults;
        } else if (this.type === VideoType.TV_SHOW) {
            return this.tvShow.searchResults;
        } else {
            return [];
        }
    }

    getSelectedSearchResultID() {
        if (this.type === VideoType.MOVIE) {
            return this.movie.tmdb;
        } else if (this.type === VideoType.TV_SHOW) {
            return this.tvShow.theTVDB;
        }
    }

    async selectSearchResultID(id?: number) {
        this.brainCalled = false;
        this.autoModePossible = false;
        this.hints = [];
        if (this.type === VideoType.MOVIE) {
            await this.movie.selectSearchResultID(id);
        } else if (this.type === VideoType.TV_SHOW) {
            await this.tvShow.selectSearchResultID(id);
        }
        void this.analyse();
    }

    isQueued() {
        return this.job !== undefined;
    }

    isProcessing() {
        return this.job && this.job.isProcessing();
    }

    isProcessed() {
        return this.status === JobStatus.SUCCESS && this.processed;
    }

    switchTrackSelection(changedItems: number[]) {
        this.tracks.filter(t => changedItems.includes(t.id)).forEach(t => {
            t.copy = !t.copy;
            if (!t.copy) {
                this.setTrackEncodingEnabled(t.type + " " + t.id, false);
            }
        });
        void this.analyse();
    }

    getSelectedTracks(): Track[] {
        return this.tracks.filter(t => t.copy);
    }

    selectAllTracks(): void {
        this.tracks.forEach(t => {
            t.copy = true;
        });
    }

    getTrackEncodingEnabledCount() {
        let encodingCount = 0;
        this.trackEncodingEnabled.forEach((value, _key) => {
            if (value) {
                encodingCount++;
            }
        });
        return encodingCount;
    }

    getTracksDuration() {
        let duration = 0;
        for (const t of this.tracks) {
            if (t.duration != undefined && t.duration > duration) {
                duration = t.duration;
            }
        }
        return duration;
    }

    getPixels() {
        for (const t of this.tracks) {
            if (t.type === TrackType.VIDEO && t.properties.videoDimensions) {
                return t.properties.videoDimensions;
            }
        }
        return undefined;
    }

    private extractInfosFromFilename() {
        const filename = Files.cleanFilename(this.filename);
        try {
            const stats = Files.statSync(this.path);
            this.size = stats.size;
        } catch (e) {
            // TODO: Log
        }
        const moviePattern = /(?<title>.*)[(\s](?<year>\d\d\d\d)[)\s]/i;
        const tvShowAbsoluteEpisodePattern = /(?<title>[\p{L}\s()]+).*[e\s](?<absoluteEpisode>\d\d\d?\d?)\p{L}/iu;

        this.type = VideoType.OTHER;
        const tvShowSeasonEpisodePattern = /(?<title>.+?)\s*s\p{L}*\s*(?<season>\d{1,3})\s*[éex]\p{L}*\s*(?<episode>\d{1,3})/ui;
        const tvShowSeasonEpisodeMatches = tvShowSeasonEpisodePattern.exec(filename);
        const tvShowAbsoluteEpisodeMatches = tvShowAbsoluteEpisodePattern.exec(filename);
        const movieMatches = moviePattern.exec(filename);

        const tvdbPattern = /\{tvdb-(?<tvdb>\d+)}/i;
        const tvdbMatches = tvdbPattern.exec(this.filename);
        if (tvdbMatches?.groups) {
            this.tvShow.theTVDB = Number.parseInt(tvdbMatches.groups.tvdb);
            this.searchBy = SearchBy.TVDB;
        }
        const tmdbPattern = /\{tmdb-(?<tmdb>\d+)}/i;
        const tmdbMatches = tmdbPattern.exec(this.filename);
        if (tmdbMatches?.groups) {
            this.movie.tmdb = Number.parseInt(tmdbMatches.groups.tmdb);
            this.searchBy = SearchBy.TMDB;
        }
        const editionPattern = /\{edition-(?<edition>[^}]+)}/i;
        const editionMatches = editionPattern.exec(this.filename);
        if (editionMatches?.groups) {
            const edition: string = editionMatches.groups.edition.toLowerCase();
            if (edition.indexOf("director") != -1) {
                this.movie.edition = EditionType.DIRECTORS_CUT;
            } else if (edition.indexOf("extended") != -1) {
                this.movie.edition = EditionType.EXTENDED;
            } else if (edition.indexOf("unrated") != -1) {
                this.movie.edition = EditionType.UNRATED;
            } else {
                this.movie.edition = EditionType.THEATRICAL;
            }
        }
        const imdbPattern = /\{tt(?<imdb>\d+)}/i;
        const imdbMatches = imdbPattern.exec(this.filename);
        if (imdbMatches?.groups) {
            this.tvShow.imdb = this.movie.imdb = "tt" + imdbMatches.groups.imdb;
            this.searchBy = SearchBy.IMDB;
        }

        if (tvShowSeasonEpisodeMatches?.groups) {
            this.type = VideoType.TV_SHOW;
            this.tvShow.season = Number.parseInt(tvShowSeasonEpisodeMatches.groups.season, 10);
            this.tvShow.episode = Number.parseInt(tvShowSeasonEpisodeMatches.groups.episode, 10);
            this.tvShow.order = "official";
            this.tvShow.title = Files.megaTrim(tvShowSeasonEpisodeMatches.groups.title);
        } else if (movieMatches?.groups) {
            this.type = VideoType.MOVIE;
            this.movie.title = Files.megaTrim(movieMatches.groups.title);
            this.movie.year = Number.parseInt(movieMatches.groups.year, 10);
        } else if (tvShowAbsoluteEpisodeMatches?.groups) {
            this.type = VideoType.TV_SHOW;
            this.tvShow.absoluteEpisode = Number.parseInt(tvShowAbsoluteEpisodeMatches.groups.absoluteEpisode, 10);
            this.tvShow.order = "absolute";
            this.tvShow.title = Files.megaTrim(tvShowAbsoluteEpisodeMatches.groups.title);
        } else {
            const patterns = [/1080p/i, /720p/i, /\s+FR\s+/, /\s+French\s+/, /\s+hdlight\s+/, /\s+EN\s+/, /\s+x264\s+/i, /\s+AC3\s+/i];
            let pos = 0;
            patterns.forEach((pattern) => {
                const res = pattern.exec(filename);
                if (res !== null) {
                    const pos2 = res.index;
                    if (pos2 > 0 && (pos === 0 || pos2 < pos)) {
                        pos = pos2;
                    }
                }
            });
            if (pos > 0) {
                this.type = VideoType.MOVIE;
                this.movie.title = filename.substring(0, pos);
                this.movie.title = Files.megaTrim(this.movie.title);
                this.movie.year = undefined;
            }
        }

        this.audioVersions = AudioVersions.extractVersions(filename);
    }

    canProcess() {
        return this.matched && !this.hintMissing() && !this.isQueued() && !this.isProcessing();
    }
};

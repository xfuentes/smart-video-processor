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

import {Attachment, Change, ChangeProperty, ChangeSourceType, ChangeType} from "./Change.ts";
import Track, {TrackType} from "./Track.ts";
import AudioVersions, {AudioVersion} from "./AudioVersions.ts";
import {Hint, HintType} from "./Hint.ts";
import Strings from "../util/strings.ts";
import {SubtitlesType, SubtitlesTypeUtil} from "./SubtitlesType.ts";
import Files from "../util/files.ts";
import {pathBasename} from "../util/path.ts";
import Languages, {LanguageIETF} from "./LanguageIETF.ts";
import {currentSettings} from "./Settings.ts";
import {Country} from "./Countries.ts";
import {EditionType} from "./Movie.ts";

const MAX_FORCED_FRAMES = 40;

export class Brain {
    private static instance: Brain;
    private guessedSubtitleTypeMap: Map<number, SubtitlesType> = new Map<number, SubtitlesType>();

    private constructor() {
    }

    public static getInstance(): Brain {
        if (!Brain.instance) {
            Brain.instance = new Brain();
        }
        return Brain.instance;
    }

    public analyse(tracks: Track[], path: string, title: string, poster: Attachment | undefined, containerTitle: string | undefined,
                   containerAttachments: Attachment[] | undefined, tagCount: number,
                   originalLanguageIETF: LanguageIETF | undefined, originalCountries: Country[], audioVersions: AudioVersion[],
                   userHints: Hint[], tmdb?: number, edition?: EditionType, versions?: string[]): { changes: Change[], hints: Hint[] } {
        let changes: Change[] = [];
        let hints: Hint[] = [];
        const nbAudioTracks = tracks.filter(t => t.type === TrackType.AUDIO).length;

        this.preAnalyseSubtitleTypes(tracks);

        for (const track of tracks) {
            switch (track.type) {
                case TrackType.VIDEO:
                    changes = changes.concat(this.analyseVideoTrack(track, originalLanguageIETF));
                    break;
                case TrackType.AUDIO: {
                    const {changes: c, hints: h} = this.analyseAudioTrack(track, originalLanguageIETF, originalCountries, nbAudioTracks, audioVersions, userHints);
                    changes = changes.concat(c);
                    hints = hints.concat(h);
                    break;
                }
                case TrackType.SUBTITLES: {
                    const {changes: c, hints: h} = this.analyseSubtitlesTrack(track, originalLanguageIETF, originalCountries, userHints);
                    changes = changes.concat(c);
                    hints = hints.concat(h);
                    break;
                }
            }
        }

        const {changes: c} = this.analyseContainer(path, title, tmdb, edition, versions, poster, containerTitle, containerAttachments, tagCount);
        changes = changes.concat(c);

        if (currentSettings.isTrackFilteringEnabled) {
            const {changes: c} = this.filterTracks(tracks, originalLanguageIETF, hints);
            changes = changes.concat(c);
        }

        return {changes, hints};
    }

    private preAnalyseSubtitleTypes(tracks: Track[]) {
        const languageTracksMap = new Map<string, Track[]>();

        for (const track of tracks.filter(t => t.type === TrackType.SUBTITLES)) {
            if (track.language && track.properties.frames) {
                const tracksArray: Track[] = languageTracksMap.get(track.language) ?? [] as Track[];
                tracksArray.push(track);
                languageTracksMap.set(track.language, tracksArray);
            }
        }

        this.guessedSubtitleTypeMap.clear();
        for (const tracks of languageTracksMap.values()) {
            const sortedTracks = [...tracks].sort((t1, t2) => (t1.properties.frames ?? -1) - (t2.properties.frames ?? -1));
            let fullAdded = false;
            for (const track of sortedTracks) {
                if (track.properties.frames && (track.properties.frames < MAX_FORCED_FRAMES || track.forced)) {
                    this.guessedSubtitleTypeMap.set(track.id, SubtitlesType.FORCED);
                } else if (!fullAdded) {
                    this.guessedSubtitleTypeMap.set(track.id, SubtitlesType.FULL);
                    fullAdded = true;
                } else {
                    this.guessedSubtitleTypeMap.set(track.id, SubtitlesType.SDH);
                }
            }
        }
    }

    private analyseContainer(path: string, title: string, tmdb: number | undefined, edition: EditionType | undefined,
                             versions: string[] | undefined,
                             poster: Attachment | undefined, containerTitle: string | undefined,
                             containerAttachments: Attachment[] | undefined, tagCount: number) {
        const changes = [];
        const currentFilename = pathBasename(path);
        let newFilename = title;
        if (versions && versions.length > 0) {
            newFilename += `.${versions.join(".")}`
        }
        if (edition !== undefined && edition !== EditionType.THEATRICAL) {
            newFilename += ` {edition-${edition}}`;
        }
        if (tmdb !== undefined) {
            newFilename += ` {tmdb-${tmdb}}`;
        }
        newFilename = Files.removeSpecialCharsFromFilename(newFilename + ".mkv");

        if (newFilename !== currentFilename) {
            changes.push(new Change(ChangeSourceType.CONTAINER, ChangeType.UPDATE, undefined, ChangeProperty.FILENAME, currentFilename, newFilename));
        }

        if (containerTitle !== title) {
            changes.push(new Change(ChangeSourceType.CONTAINER, ChangeType.UPDATE, undefined, ChangeProperty.TITLE, containerTitle, title));
        }

        if (tagCount > 0) {
            changes.push(new Change(ChangeSourceType.CONTAINER, ChangeType.DELETE, undefined, ChangeProperty.TAGS, undefined, undefined));
        }

        if (poster) {
            let posterNeeded = true;
            if (containerAttachments && containerAttachments.length > 0) {
                if (containerAttachments.length > 1) {
                    changes.push(new Change(ChangeSourceType.CONTAINER, ChangeType.DELETE, undefined, ChangeProperty.ATTACHMENTS, undefined, undefined));
                }
                for (const attach of containerAttachments) {
                    if (poster?.filename === attach.filename) {
                        posterNeeded = false;
                        if (poster?.description !== attach.description) {
                            changes.push(new Change(ChangeSourceType.CONTAINER, ChangeType.UPDATE, undefined, ChangeProperty.POSTER, attach, poster));
                        }
                    }
                }
            }

            if (!containerAttachments || posterNeeded) {
                changes.push(new Change(ChangeSourceType.CONTAINER, ChangeType.UPDATE, undefined, ChangeProperty.POSTER, undefined, poster));
            }
        }

        return {changes};
    }

    private analyseVideoTrack(track: Track, originalLanguageIETF: LanguageIETF | undefined): Change[] {
        const changes = [];
        if (track.name) {
            changes.push(new Change(ChangeSourceType.VIDEO, ChangeType.UPDATE, track.id, ChangeProperty.NAME, track.name, ""));
        }
        if (track.default) {
            changes.push(new Change(ChangeSourceType.VIDEO, ChangeType.UPDATE, track.id, ChangeProperty.DEFAULT, track.default, false));
        }
        if (track.forced) {
            changes.push(new Change(ChangeSourceType.VIDEO, ChangeType.UPDATE, track.id, ChangeProperty.FORCED, track.forced, false));
        }
        if (originalLanguageIETF?.code !== track.language) {
            changes.push(new Change(ChangeSourceType.VIDEO, ChangeType.UPDATE, track.id, ChangeProperty.LANGUAGE, track.language, originalLanguageIETF?.code));
        }
        return changes;
    }

    private guessTrackLanguage(track: Track, originalLanguageIETF: LanguageIETF | undefined, originalCountries: Country[], nbAudioTracks: number, audioVersions: AudioVersion[], userHints: Hint[]) {
        const {language: trackLanguage} = Languages.fromIETF(track.language);
        const changes = [];
        const hints: Hint[] = [];
        let languageHint = undefined;
        let userLanguageHint = Hint.retrieve(userHints, track.id, HintType.LANGUAGE, languageHint);

        if (userLanguageHint !== undefined) {
            languageHint = userLanguageHint;
        } else {
            if (track.name) {
                for (const version of AudioVersions.extractVersions(track.name)) {
                    if (version.key === "VO") {
                        languageHint = originalLanguageIETF?.code;
                    } else if (version.ietf) {
                        languageHint = version.ietf;
                    } else if (version.alpha2) {
                        languageHint = Languages.guessLanguageIETFFromCountries(version.alpha2, originalCountries)?.code;
                    }
                }
                if (!languageHint) {
                    const temp = Languages.findLanguageFromDescription(track.name)?.code;
                    languageHint = temp != undefined ? Languages.guessLanguageIETFFromCountries(temp, originalCountries)?.code : temp;
                }
            }
            if (!languageHint) {
                for (const audioVersion of audioVersions) {
                    if (nbAudioTracks === 1) {
                        if (audioVersion.ietf) {
                            languageHint = audioVersion.ietf;
                        } else if (audioVersion.alpha2) {
                            languageHint = Languages.guessLanguageIETFFromCountries(audioVersion.alpha2, originalCountries)?.code;
                        }
                    } else if (trackLanguage && (audioVersion.ietf?.indexOf(trackLanguage) === 0)) {
                        languageHint = audioVersions[0]?.ietf;
                    }
                }
            }

            const originalLanguage = Languages.fromIETF(originalLanguageIETF?.code)?.language;
            if ((languageHint && languageHint === originalLanguage) || (trackLanguage === originalLanguage)) {
                languageHint = originalLanguageIETF?.code;
            }

            if (track.type === TrackType.AUDIO && languageHint === undefined && (trackLanguage === undefined || track.language?.indexOf("-") === -1)) {
                const languageInfo = trackLanguage !== undefined ? Languages.getLanguageByCode(trackLanguage) : undefined;
                if (languageInfo !== undefined) {
                    if (languageInfo.isRegionImportant) {
                        // no hint and region missing for language where it matters, lets add a user input request.
                        languageHint = trackLanguage ? Languages.guessLanguageIETFFromCountries(trackLanguage, originalCountries)?.code
                            : trackLanguage;
                    }
                } else {
                    languageHint = "";
                }
            }
        }

        const isRegionImportant = Languages.getLanguageByCode(trackLanguage ?? languageHint)?.isRegionImportant ?? false;
        let trackLanguageIETFUpdated = undefined;
        if (track.language === undefined || track.language === "und"
            || (track.language.indexOf("-") === -1 && track.type === TrackType.AUDIO && isRegionImportant)
            || (languageHint !== undefined && languageHint.indexOf("-") != -1 && track.language !== languageHint)
            || (languageHint !== undefined && languageHint === originalLanguageIETF?.code && track.language !== languageHint)) {
            if (languageHint === undefined) {
                languageHint = track.language ?? "";
            }
            hints.push(new Hint(track.id, HintType.LANGUAGE, languageHint));
            if (userLanguageHint === undefined) {
                userLanguageHint = languageHint;
            }
            if (userLanguageHint && track.language !== userLanguageHint) {
                changes.push(new Change(track.type as unknown as ChangeSourceType, ChangeType.UPDATE, track.id, ChangeProperty.LANGUAGE, track.language, userLanguageHint));
                trackLanguageIETFUpdated = userLanguageHint;
            }
        }
        return {changes, hints, trackLanguageIETFUpdated};
    }

    private analyseAudioTrack(track: Track, originalLanguageIETF: LanguageIETF | undefined, originalCountries: Country[],
                              nbAudioTracks: number, audioVersions: AudioVersion[], userHints: Hint[]): { changes: Change[], hints: Hint[] } {
        const {language: originalLanguage, region: originalRegion} = Languages.fromIETF(originalLanguageIETF?.code);
        let {language: trackLanguage, region: trackRegion} = Languages.fromIETF(track.language);
        let changes: Change[] = [];
        let hints: Hint[] = [];

        const {changes: c, hints: h, trackLanguageIETFUpdated} = this.guessTrackLanguage(track, originalLanguageIETF, originalCountries, nbAudioTracks, audioVersions, userHints);
        changes = changes.concat(c);
        hints = hints.concat(h);

        if (trackLanguageIETFUpdated) {
            const {language, region} = Languages.fromIETF(trackLanguageIETFUpdated);
            trackLanguage = language;
            trackRegion = region;
        }

        const nameBuilder: string[] = [];
        if (originalLanguage === trackLanguage || (trackRegion !== undefined && originalRegion === trackRegion)) {
            const versions = AudioVersions.extractVersionsIncluding(track.name, ["VO"]);
            if (versions.length > 0) {
                nameBuilder.push(versions[0].key);
            } else {
                nameBuilder.push("VO");
            }
        } else {
            const ietf = Languages.toIETF(trackLanguage, trackRegion);
            const version = AudioVersions.findByLanguageIETF(ietf)?.key;
            if (version) {
                nameBuilder.push(version);
            }
        }
        if (track.properties.audioChannels) {
            nameBuilder.push(Strings.humanAudioChannels(track.properties.audioChannels));
        }
        const newName = nameBuilder.join(" ");

        if (track.name !== newName) {
            changes.push(new Change(ChangeSourceType.AUDIO, ChangeType.UPDATE, track.id, ChangeProperty.NAME, track.name, newName));
        }
        if (track.default) {
            changes.push(new Change(ChangeSourceType.AUDIO, ChangeType.UPDATE, track.id, ChangeProperty.DEFAULT, track.default, false));
        }
        if (track.forced) {
            changes.push(new Change(ChangeSourceType.AUDIO, ChangeType.UPDATE, track.id, ChangeProperty.FORCED, track.forced, false));
        }

        return {changes, hints};
    }

    private analyseSubtitlesTrack(track: Track, originalLanguageIETF: LanguageIETF | undefined, originalCountries: Country[], userHints: Hint[]): { changes: Change[], hints: Hint[] } {
        let changes: Change[] = [];
        let hints: Hint[] = [];

        const {changes: c, hints: h} = this.guessTrackLanguage(track, originalLanguageIETF, originalCountries, -1, [], userHints);
        changes = changes.concat(c);
        hints = hints.concat(h);

        let subTypeHint = SubtitlesTypeUtil.extract(track.name);
        if (!subTypeHint) {
            const scores = {
                [SubtitlesType.FORCED]: 0,
                [SubtitlesType.FULL]: 0,
                [SubtitlesType.SDH]: 0,
                [SubtitlesType.COMMENTARIES]: 0,
            };
            const guessedType = this.guessedSubtitleTypeMap.get(track.id);
            if (guessedType) {
                scores[guessedType] += 2;
            }
            if (track.default) {
                scores[SubtitlesType.FORCED]++;
            }
            let highScore: number = -1;
            let winner: SubtitlesType | undefined = undefined;
            for (const subType of Object.values(SubtitlesType)) {
                if (scores[subType] > highScore) {
                    highScore = scores[subType];
                    winner = subType;
                }
            }

            if (winner) {
                subTypeHint = winner;
            }

            const subTypeUserHint = Hint.retrieve(userHints, track.id, HintType.SUBTITLES_TYPE, subTypeHint) as SubtitlesType;
            hints.push(new Hint(track.id, HintType.SUBTITLES_TYPE, subTypeUserHint ?? subTypeHint));
            subTypeHint = subTypeUserHint;
        }

        switch (subTypeHint) {
            case SubtitlesType.FORCED:
                if (!track.forced) {
                    changes.push(new Change(ChangeSourceType.SUBTITLES, ChangeType.UPDATE, track.id, ChangeProperty.FORCED, track.forced, true));
                }
                if (track.name !== SubtitlesType.FORCED) {
                    changes.push(new Change(ChangeSourceType.SUBTITLES, ChangeType.UPDATE, track.id, ChangeProperty.NAME, track.name, SubtitlesType.FORCED));
                }
                break;
            case SubtitlesType.SDH:
            case SubtitlesType.FULL:
                if (track.forced) {
                    changes.push(new Change(ChangeSourceType.SUBTITLES, ChangeType.UPDATE, track.id, ChangeProperty.FORCED, track.forced, false));
                }
                if (track.name !== subTypeHint) {
                    changes.push(new Change(ChangeSourceType.SUBTITLES, ChangeType.UPDATE, track.id, ChangeProperty.NAME, track.name, subTypeHint));
                }
                break;
            default:
                if (track.forced) {
                    changes.push(new Change(ChangeSourceType.SUBTITLES, ChangeType.UPDATE, track.id, ChangeProperty.FORCED, track.forced, false));
                }
        }
        if (track.default) {
            changes.push(new Change(ChangeSourceType.SUBTITLES, ChangeType.UPDATE, track.id, ChangeProperty.DEFAULT, track.default, false));
        }
        return {changes, hints};
    }

    private filterTracks(tracks: Track[], originalLanguageIETF: LanguageIETF | undefined, hints: Hint[]): { changes: Change[] } {
        const tracksByLanguage: { [key: string]: { [key: string]: { [key: string]: number[] } } } = {};
        for (const track of tracks) {
            let trackLanguageIETF = track.language;
            const hint = hints.find(h => h.trackId === track.id && h.type === HintType.LANGUAGE);
            if (hint !== undefined) {
                trackLanguageIETF = hint.value;
            }
            const {language: trackLanguage} = Languages.fromIETF(trackLanguageIETF);
            if (trackLanguage !== undefined && trackLanguageIETF !== undefined) {
                if (tracksByLanguage[track.type] === undefined) {
                    tracksByLanguage[track.type] = {};
                }
                if (tracksByLanguage[track.type][trackLanguage] === undefined) {
                    tracksByLanguage[track.type][trackLanguage] = {};
                }
                if (tracksByLanguage[track.type][trackLanguage][trackLanguageIETF] === undefined) {
                    tracksByLanguage[track.type][trackLanguage][trackLanguageIETF] = [];
                }
                tracksByLanguage[track.type][trackLanguage][trackLanguageIETF].push(track.id);
            }
        }
        const selectedTrackIds = new Set<number>();
        const favoriteLanguages = [...currentSettings.favoriteLanguages];
        if (originalLanguageIETF?.code && currentSettings.isKeepVOEnabled) {
            favoriteLanguages.push(originalLanguageIETF?.code);
        }
        for (const favLanguageIETF of favoriteLanguages) {
            const {language: favLanguage} = Languages.fromIETF(favLanguageIETF);
            if (favLanguage !== undefined && favLanguageIETF !== undefined) {
                if (favLanguage === favLanguageIETF) {
                    for (const [, type] of Object.entries(TrackType)) {
                        if (tracksByLanguage[type] !== undefined && tracksByLanguage[type][favLanguage] !== undefined) {
                            for (const indexes of Object.values(tracksByLanguage[type][favLanguage])) {
                                indexes.forEach(i => selectedTrackIds.add(i));
                            }
                        }
                    }
                } else {
                    for (const [, type] of Object.entries(TrackType)) {
                        if (tracksByLanguage[type] != undefined && tracksByLanguage[type][favLanguage] !== undefined) {
                            if (tracksByLanguage[type][favLanguage][favLanguageIETF] !== undefined) {
                                tracksByLanguage[type][favLanguage][favLanguageIETF].forEach(i => selectedTrackIds.add(i));
                            } else {
                                for (const indexes of Object.values(tracksByLanguage[type][favLanguage])) {
                                    indexes.forEach(i => selectedTrackIds.add(i));
                                }
                            }
                        }
                    }
                }
            }
        }
        const changes: Change[] = [];
        const totalAudios = tracks.filter(t => t.type === TrackType.AUDIO).length;
        const audiosToDelete = tracks.filter(t => t.type === TrackType.AUDIO && !selectedTrackIds.has(t.id) && t.language !== undefined)
            .map(t => t.id);
        const totalSubs = tracks.filter(t => t.type === TrackType.SUBTITLES).length;
        const subsToDelete = tracks.filter(t => t.type === TrackType.SUBTITLES && !selectedTrackIds.has(t.id) && t.language !== undefined)
            .map(t => t.id);
        if (totalAudios > audiosToDelete.length) {
            for (const id of audiosToDelete) {
                changes.push(new Change(ChangeSourceType.AUDIO, ChangeType.DELETE, id, undefined, undefined, undefined));
            }
        }
        if (totalSubs > subsToDelete.length) {
            for (const id of subsToDelete) {
                changes.push(new Change(ChangeSourceType.SUBTITLES, ChangeType.DELETE, id, undefined, undefined, undefined));
            }
        }
        return {changes};
    }
}

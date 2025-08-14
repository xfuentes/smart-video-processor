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

import Processes, {ProcessesPriority} from "../util/processes.ts";
import Files from "../util/files.ts";
import {getConfigPath} from "../util/path.ts";
import {VideoCodec} from "./Encoding.ts";

export type Settings = {
    /**
     * Enable this for detailed output for debugging.
     */
    isDebugEnabled: boolean,
    /**
     * Language to use for retrieving movies descriptions and to display this program.
     */
    language: string,
    /**
     * Output path where processed movies will be saved (can be relative to the original file or absolute)
     */
    moviesOutputPath: string,
    /**
     * Output path where processed TV Shows will be saved (can be relative to the original file or absolute)
     */
    tvShowsOutputPath: string,
    /**
     * Output path where other processed files will be saved (can be relative to the original file or absolute)
     */
    othersOutputPath: string,
    /**
     * if enabled automatically encode and/or process the files as soon as they are added (if no user input is requested)
     */
    isAutoStartEnabled: boolean,
    /**
     * Process priority to use when merging or encoding
     */
    priority: keyof typeof ProcessesPriority,
    /**
     * If enabled, will only keep tracks in your favorite languages list.
     */
    isTrackFilteringEnabled: boolean,
    /**
     * List of languages ietf ordered by preference.
     */
    favoriteLanguages: string[],
    /**
     * If enabled, keep VO tracks even if not in favorite languages.
     */
    isKeepVOEnabled: boolean,
    /**
     * If enabled allows automatic track encoding if below conditions are met.
     */
    isTrackEncodingEnabled: boolean;
    /**
     * When enabled only encode a 30s section of the video to verify quality.
     */
    isTestEncodingEnabled: boolean;
    /**
     * Video Codec to use to re-encode video tracks.
     */
    videoCodec: VideoCodec;
    /**
     * Video size reduction needed to allow re-encoding.
     */
    videoSizeReduction: number;
    /**
     * Audio size reduction needed to allow re-encoding.
     */
    audioSizeReduction: number;
};

const systemLocale = Processes?.osLocaleSync() ?? "en-US";

export const defaultSettings: Settings = {
    isDebugEnabled: false,
    language: systemLocale,
    moviesOutputPath: "./Reworked",
    tvShowsOutputPath: "./Reworked",
    othersOutputPath: "./Reworked",
    isAutoStartEnabled: false,
    priority: "BELOW_NORMAL",
    isTrackFilteringEnabled: false,
    favoriteLanguages: [systemLocale],
    isKeepVOEnabled: true,
    isTrackEncodingEnabled: true,
    isTestEncodingEnabled: false,
    videoCodec: VideoCodec.H265,
    videoSizeReduction: 50,
    audioSizeReduction: 70
};
export let currentSettings:Settings = defaultSettings;

export function loadSettings() {
    const data = Files.loadTextFileSync(getConfigPath(), "settings.json");
    if (data !== undefined) {
        currentSettings = JSON.parse(data) as Settings;
    }
    for(const key of Object.keys(defaultSettings) as Array<keyof Settings>) {
        if(currentSettings[key] === undefined) {
            // @ts-expect-error ts is lost
            currentSettings[key] = defaultSettings[key];
        }
    }
    const favSet = new Set<string>();
    currentSettings.favoriteLanguages.forEach(l => favSet.add(l));
    currentSettings.favoriteLanguages = [...favSet.values()];
}

export function saveSettings() {
    Files.writeFileSync(getConfigPath(), "settings.json", JSON.stringify(currentSettings, null, 2));
}

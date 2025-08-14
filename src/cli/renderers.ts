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

import {TrackProperties, TrackType} from "../common/Track.ts";
import Strings from "../util/strings.ts";
import chalk from "chalk";

export function codecRenderer(codec: string) {
    if (codec.indexOf("H.264") >= 0) {
        return "H.264";
    }
    if (codec.indexOf("H.265") >= 0) {
        return "H.265";
    }
    return codec;
}

export function sizeRenderer(size?: number) {
    return size !== undefined ? Strings.humanFileSize(size, false) : " ";
}

export function booleanRenderer(enabled: boolean) {
    return enabled ? chalk.green("✔") : "  ";
}

export function copyRenderer(enabled: boolean) {
    return enabled ? chalk.green("✔") : chalk.red(chalk.bold(" X"));
}

export function durationRenderer(duration?: number) {
    return duration != undefined ? Strings.humanDuration(duration) : " ";
}

export function trackPropertiesRenderer(properties: TrackProperties) {
    const res = [];
    if (properties.videoDimensions) {
        res.push(properties.videoDimensions + (properties.fps ? "@" + properties.fps : ""));
    }
    if (properties.audioChannels) {
        res.push(Strings.humanAudioChannels(properties.audioChannels));
    }
    if (properties.audioSamplingFrequency) {
        res.push(Strings.humanFrequencies(properties.audioSamplingFrequency));
    }
    return res.join(" ");
}

export function qualityRenderer(pixels: string | undefined) {
    if (pixels != undefined) {
        const {shortName, longName, badge} = Strings.pixelsToQuality(pixels);
        let writeColored;
        switch (badge) {
            case "gold":
                writeColored = chalk.yellowBright;
                break;
            case "silver":
                writeColored = chalk.grey;
                break;
            default:
                writeColored = chalk.red;
                break;

        }
        return writeColored(shortName + " " + longName);
    } else {
        return " ";
    }
}

export function ratingRenderer(rating: number | undefined) {
    let strRating = "";
    if (rating != undefined) {
        const rounded = Math.round(rating * 2);
        const truncated = Math.trunc(rating) * 2;
        for (let i = 0; i < 5; i++) {
            // 0 2 4 6 8
            if (i * 2 < truncated) {
                strRating += "★";
            } else if (i * 2 === truncated) {
                if (rounded % 2 === 0) {
                    strRating += "☆";
                } else {
                    strRating += "✬";
                }
            } else {
                strRating += "☆";
            }
        }
        return strRating;
    } else {
        return " ";
    }
}

export function trackTypeRenderer(trackType: TrackType) {
    let type;
    switch (trackType) {
        case TrackType.AUDIO:
            type = "🔊";
            break;
        case TrackType.SUBTITLES:
            type = "💬";
            break;
        case TrackType.VIDEO:
            type = "🎥";
            break;
        default:
            type = "?";
            break;
    }
    return type;
}

export function bitrateRenderer(bitrate?: number) {
    return bitrate ? Strings.humanBitrate(bitrate) : " ";
}

export function framesRenderer(frames?: number) {
    return "" + frames;
}

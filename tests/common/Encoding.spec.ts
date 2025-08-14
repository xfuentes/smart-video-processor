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

import {expect, test} from "vitest";
import {Brain} from "../../src/common/Brain";
import {changeListToMap, encoderSettingsListToMap} from "./testUtils";
import {Encoding} from "../../src/common/Encoding";
import Track from "../../src/common/Track";
import Strings from "../../src/util/strings";
import {currentSettings} from "../../src/common/Settings";

const queLaFeteCommenceTracks = [
    {
        "id": 0,
        "type": "Video",
        "codec": "AVC/H.264/MPEG-4p10",
        "language": "und",
        "properties": {
            "videoDimensions": "1792x1080",
            "frames": 171811,
            "bitRate": 10001550,
            "fps": 24
        },
        "default": true,
        "forced": false,
        "duration": 7158.792,
        "pathExtracted": "",
        "size": 8949877080
    },
    {
        "id": 1,
        "type": "Audio",
        "codec": "DTS-HD Master Audio",
        "language": "fr",
        "properties": {
            "audioChannels": 2,
            "audioSamplingFrequency": 48000,
            "frames": 671137,
            "bitRate": 1785099
        },
        "default": true,
        "forced": false,
        "duration": 7158,
        "pathExtracted": "",
        "size": 1597395496
    },
    {
        "id": 2,
        "name": "FULL SDH",
        "type": "Subtitles",
        "codec": "HDMV PGS",
        "language": "fr",
        "properties": {
            "frames": 3532,
            "bitRate": 43387
        },
        "default": false,
        "forced": false,
        "duration": 7141,
        "size": 38731250
    }
] as Track[];

test('Analysis of Que La Fete Commence - 1', () => {
    const results = Encoding.getInstance().analyse(queLaFeteCommenceTracks);
    const settings = encoderSettingsListToMap(results);
    expect(settings["Video 0"]?.fps).toBe(24);
    expect(settings["Video 0"]?.bitrate).toBe(1857946);

    const origBitrate = 10001550;
    const reduction = Math.round((origBitrate - settings["Video 0"]?.bitrate)  * 100 /origBitrate);
    const size = Strings.humanFileSize(origBitrate * 7158.792 / 8, false);
    const targetSize = Strings.humanFileSize(settings["Video 0"]?.bitrate * 7158.792 / 8, false);
    console.log(`Size: ${size} Target Size: ${targetSize} Reduction: ${reduction}%`);
});

test('BPS for 2.0 Audio', () => {
    expect(Encoding.getInstance().getBpsForAudioChannels(2)).toBe(128 * 1000);
});

test('BPS for 5.1 Audio', () => {
    expect(Encoding.getInstance().getBpsForAudioChannels(6)).toBe(384 * 1000);
});

const workingMan23_976FPSTracks = [
    {
        "id": 0,
        "type": "Video",
        "codec": "HEVC/H.265/MPEG-H",
        "language": "und",
        "properties": {
            "videoDimensions": "1920x800",
            "frames": 167210,
            "bitRate": 23286430,
            "fps": 23.976
        },
        "default": true,
        "forced": false,
        "duration": 6974.051,
        "size": 2030010065
    },
    {
        "id": 1,
        "name": "AAC VO",
        "type": "Audio",
        "codec": "AAC",
        "language": "en",
        "properties": {
            "audioChannels": 6,
            "audioSamplingFrequency": 24000,
            "frames": 163452,
            "bitRate": 216751
        },
        "default": true,
        "forced": false,
        "duration": 6973.953,
        "size": 188951562
    },
    {
        "id": 2,
        "name": "FANSUB FR",
        "type": "Subtitles",
        "codec": "SubRip/SRT",
        "language": "fr",
        "properties": {
            "textSubtitles": true,
            "frames": 1207,
            "bitRate": 42
        },
        "default": true,
        "forced": false,
        "duration": 6633,
        "size": 35459
    },
    {
        "id": 3,
        "name": "FULL VO",
        "type": "Subtitles",
        "codec": "SubRip/SRT",
        "language": "en",
        "properties": {
            "textSubtitles": true,
            "frames": 1237,
            "bitRate": 38
        },
        "default": false,
        "forced": false,
        "duration": 6399.517,
        "size": 30796
    }
] as Track[];
test('Working Man NTSC 23.976 FPS', () => {
    const results = Encoding.getInstance().analyse(workingMan23_976FPSTracks);
    const settings = encoderSettingsListToMap(results);
    expect(settings["Video 0"]?.fps).toBe(23.976);
    expect(settings["Video 0"]?.bitrate).toBe(1473085);
});

const marcelinoProbeTracks = [
    {
        "id": 0,
        "type": "Video",
        "codec": "MPEG-4p2",
        "properties": {
            "videoDimensions": "720x576",
            "frames": 114785,
            "bitRate": 780324
        },
        "duration": 4591.4,
        "size": 447847451.7,
        "copy": true,
        "unsupported": false
    },
    {
        "id": 1,
        "type": "Audio",
        "codec": "ADPCM Microsoft",
        "properties": {
            "audioChannels": 2,
            "audioSamplingFrequency": 44100,
            "frames": 99448,
            "bitRate": 354872
        },
        "duration": 4591.4,
        "size": 203669912.6,
        "copy": true,
        "unsupported": true
    }
] as Track[];

test('Marcelino, unsupported audio', () => {
    const results = Encoding.getInstance().analyse(marcelinoProbeTracks);
    const settings = encoderSettingsListToMap(results);
    expect(settings["Audio 1"]?.audioChannels).toBe(2);
    expect(settings["Audio 1"]?.bitrate).toBe(128000);
    expect(settings["Audio 1"]?.originalSize).toBe(203669913);
    expect(settings["Audio 1"]?.targetSize).toBe(73462400);
    expect(settings["Audio 1"]?.compressionPercent).toBe(64);
});

const violentNightTracks = [
    {
        "id": 0,
        "type": "Video",
        "codec": "AVC/H.264/MPEG-4p10",
        "language": "en",
        "properties": {
            "videoDimensions": "1920x1080",
            "frames": 160440,
            "bitRate": 7936352,
            "fps": 23.976
        },
        "default": false,
        "forced": false,
        "duration": 6691.769,
        "size": 6638529418,
        "copy": true,
        "unsupported": false
    },
    {
        "id": 1,
        "name": "VO 5.1",
        "type": "Audio",
        "codec": "E-AC-3",
        "language": "en",
        "properties": {
            "audioChannels": 6,
            "audioSamplingFrequency": 48000,
            "frames": 209322,
            "bitRate": 768000,
            "fps": 31
        },
        "default": false,
        "forced": false,
        "duration": 6698.304,
        "size": 643037184,
        "copy": true,
        "unsupported": false
    },
    {
        "id": 2,
        "name": "Full",
        "type": "Subtitles",
        "codec": "SubRip/SRT",
        "language": "fr",
        "properties": {
            "textSubtitles": true,
            "frames": 1455,
            "bitRate": 53,
            "fps": 0
        },
        "default": false,
        "forced": false,
        "duration": 6384.509,
        "size": 42612,
        "copy": true,
        "unsupported": false
    }
] as Track[];
test('Violent Night encoding video and no audio', () => {
    currentSettings.videoSizeReduction = 59;
    currentSettings.audioSizeReduction = 51;
    const results = Encoding.getInstance().analyse(violentNightTracks);
    const settings = encoderSettingsListToMap(results);
    expect(settings["Video 0"]?.bitrate).toBe(1988665);
    expect(settings["Video 0"]?.codec).toBe("H.265");
    expect(settings["Video 0"]?.originalSize).toBe(6638529286);
    expect(settings["Video 0"]?.targetSize).toBe(1663460850);
    expect(settings["Video 0"]?.compressionPercent).toBe(75);
    expect(settings["Audio 1"]).toBeUndefined();
});

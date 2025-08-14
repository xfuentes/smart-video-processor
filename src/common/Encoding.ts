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

import Track, {TrackType} from "./Track.ts";
import Strings, {VideoFormats} from "../util/strings.ts";
import {currentSettings} from "./Settings.ts";

export type EncoderSettings = {
    trackId: number;
    trackType: TrackType;
    codec: VideoCodec | AudioCodec;
    bitrate?: number;
    fps?: number;
    compressionPercent?: number;
    originalSize?: number;
    targetSize?: number;
    audioChannels?: number;
};

export enum VideoCodec {
    AUTO = "Auto",
    H264 = "H.264",
    H265 = "H.265"
}

export enum AudioCodec {
    AAC_LC = "AAC LC",
}

export class Encoding {
    private static instance: Encoding;

    private constructor() {
    }

    public static getInstance(): Encoding {
        if (!Encoding.instance) {
            Encoding.instance = new Encoding();
        }
        return Encoding.instance;
    }

    public analyse(tracks: Track[], trackEncodingEnabled: Map<string, boolean> = new Map()): EncoderSettings[] {
        let settings: EncoderSettings[] = [];

        for (const track of tracks) {
            switch (track.type) {
                case TrackType.VIDEO:
                    settings = settings.concat(this.analyseVideoTrack(track, trackEncodingEnabled));
                    break;
                case TrackType.AUDIO:
                    settings = settings.concat(this.analyseAudioTrack(track, trackEncodingEnabled));
                    break;
            }
        }
        return settings;
    }

    public analyseVideoTrack(videoTrack: Track, trackEncodingEnabled: Map<string, boolean> = new Map()): EncoderSettings[] {
        const settings: EncoderSettings[] = [];

        if (videoTrack.properties.bitRate !== undefined && videoTrack.properties.videoDimensions !== undefined
            && videoTrack.properties.frames !== undefined && videoTrack.duration !== undefined) {
            const duration = currentSettings.isTestEncodingEnabled ? 30 : videoTrack.duration;
            const pixelsArr = videoTrack.properties.videoDimensions.split("x");
            const width = Number.parseInt(pixelsArr[0], 10);
            const height = Number.parseInt(pixelsArr[1], 10);
            const format = Strings.pixelsToVideoFormat(videoTrack.properties.videoDimensions);
            const fps = videoTrack.properties.fps ?? 25;
            const {bpf, codec} = this.getVideoBPFByFormat(format);
            const bitrate = Math.round(bpf * width * height * fps);
            const proposedCompression = Math.round((1 - (bitrate / videoTrack.properties.bitRate)) * 100);

            if (trackEncodingEnabled.get(videoTrack.type + " " + videoTrack.id) === true
                || (currentSettings.isTrackEncodingEnabled && currentSettings.videoSizeReduction <= proposedCompression)) {
                const setting: EncoderSettings = {
                    trackId: videoTrack.id,
                    trackType: videoTrack.type,
                    fps,
                    bitrate,
                    codec,
                    ...this.computeCompression(videoTrack.properties.bitRate, bitrate, duration)
                };

                settings.push(setting);
            }
        }
        return settings;
    }

    public getVideoCodecByFormat(format: VideoFormats) {
        let codec = VideoCodec.H264;
        switch (format) {
            case VideoFormats.UHD_8K:
            case VideoFormats.UHD_4K:
            case VideoFormats.HD_1440p:
            case VideoFormats.HD_1080p:
                codec = VideoCodec.H265;
                break;
        }
        return codec;
    }

    public getVideoBPFByFormat(format: VideoFormats) {
        const codec = currentSettings.videoCodec === VideoCodec.AUTO ?
            this.getVideoCodecByFormat(format) : currentSettings.videoCodec;
        let bpf = 0.085;
        switch (format) {
            case VideoFormats.UHD_8K:
            case VideoFormats.UHD_4K:
            case VideoFormats.HD_1440p:
                if (codec === VideoCodec.H265) {
                    bpf = 0.028;
                } else {
                    bpf = 0.066;
                }
                break;
            case VideoFormats.HD_1080p:
                if (codec === VideoCodec.H265) {
                    bpf = 0.040;
                } else {
                    bpf = 0.066;
                }
                break;
            case VideoFormats.HD_720p:
                bpf = 0.082;
                break;
            case VideoFormats.SD:
                bpf = 0.090;
                break;
        }
        return {bpf, codec};
    }

    public analyseAudioTrack(audioTrack: Track, trackEncodingEnabled: Map<string, boolean> = new Map()): EncoderSettings[] {
        const settings: EncoderSettings[] = [];

        if (audioTrack.properties.bitRate !== undefined
            && audioTrack.properties.audioChannels !== undefined && audioTrack.duration !== undefined) {
            const duration = currentSettings.isTestEncodingEnabled ? 30 : audioTrack.duration;
            const bitrate = this.getBpsForAudioChannels(audioTrack.properties.audioChannels);
            const proposedCompression = Math.round((1 - (bitrate / audioTrack.properties.bitRate)) * 100);

            if (trackEncodingEnabled.get(audioTrack.type + " " + audioTrack.id) === true
                || (currentSettings.isTrackEncodingEnabled && currentSettings.audioSizeReduction <= proposedCompression)
                || audioTrack.unsupported) {
                const setting: EncoderSettings = {
                    trackId: audioTrack.id,
                    trackType: audioTrack.type,
                    codec: AudioCodec.AAC_LC,
                    audioChannels: audioTrack.properties.audioChannels,
                    bitrate,
                    ...this.computeCompression(audioTrack.properties.bitRate, bitrate, duration)
                };
                settings.push(setting);
            }
        }

        return settings;
    }

    public getBpsForAudioChannels(audioChannels: number) {
        // Audio CD Quality = 96kbps AAC-LC
        return 64 * audioChannels * 1000;
    }

    private computeCompression(originalBps: number, targetBps: number, durationSeconds: number) {
        const originalSize = Math.round(originalBps * durationSeconds / 8);
        const targetSize = Math.round(targetBps * durationSeconds / 8);
        const compressionPercent = Math.round((1 - (targetSize / originalSize)) * 100);

        return {originalSize, targetSize, compressionPercent};
    }

}

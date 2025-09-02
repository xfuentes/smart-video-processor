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

interface FFProbeResult {
    "streams": [{
        "index": number,
        "codec_name": string,
        "codec_long_name": string,
        "codec_type": "audio" | "video" | "subtitle",
        "codec_time_base": string,
        "codec_tag_string": string,
        "codec_tag": string,
        "sample_fmt": string,
        "sample_rate": string,
        "channels": number,
        "bits_per_sample": number,
        "width": number,
        "height": number,
        "coded_width": number,
        "coded_height": number,
        "has_b_frames": number,
        "sample_aspect_ratio": string,
        "display_aspect_ratio": string,
        "pix_fmt": string,
        "level": number,
        "chroma_location": string,
        "refs": number,
        "quarter_sample": "true" | "false",
        "divx_packed": "true" | "false",
        "r_frame_rate": string,
        "avg_frame_rate": string,
        "time_base": string,
        "start_pts": number,
        "start_time": number,
        "duration_ts": number,
        "duration": string, // "4591.400000",
        "bit_rate": string, // "780324",
        "nb_frames": string, // "114785",
        "disposition": {
            "default": 0 | 1,
            "dub": 0 | 1,
            "original": 0 | 1,
            "comment": 0 | 1,
            "lyrics": 0 | 1,
            "karaoke": 0 | 1,
            "forced": 0 | 1,
            "hearing_impaired": 0 | 1,
            "visual_impaired": 0 | 1,
            "clean_effects": 0 | 1,
            "attached_pic": 0 | 1,
            "timed_thumbnails": 0 | 1
        },
        "tags"?: {
            "language": string,
            "BPS-eng": string, // "2577070",
            "DURATION-eng": string, // "00:51:36.844000000",
            "NUMBER_OF_FRAMES-eng": string, // "74250",
            "NUMBER_OF_BYTES-eng": string, // "997598254"
        }
    }],
    "format": {
        "filename": string,
        "nb_streams": number,
        "nb_programs": number,
        "format_name": string,
        "format_long_name": string,
        "start_time": string, // "0.000000",
        "duration": string, // "4591.400000",
        "size": string, // "654912112",
        "bit_rate": string, // "1141110",
        "probe_score": number,
        "tags"?: {
            "title": string,
            "encoder": string,
            "creation_time": string // "2022-08-17T16:25:49.000000Z"
        }
    }
}
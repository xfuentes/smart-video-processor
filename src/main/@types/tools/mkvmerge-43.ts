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

interface MKVAttachment {
    content_type: string,
    description: string,
    file_name: string,
    id: number,
    properties: {
        uid: number
    },
    size: number
}

interface MKVMergeIdentify {
    file_name: string,
    identification_format_version: number,
    attachments: MKVAttachment[],
    chapters: [
        {
            num_entries: number
        }
    ],
    container: {
        properties: {
            container_type: number,
            date_local: string,
            date_utc: string,
            duration: number,
            is_providing_timestamps: boolean,
            muxing_application: string,
            segment_uid: string,
            title: string,
            writing_application: string
        },
        recognized: boolean,
        supported: boolean,
        type: string
    },
    global_tags: [
        {
            "num_entries": number
        }
    ]
    track_tags: [
        {
            "num_entries": number,
            "track_id": number
        }
    ]
    tracks: [
        {
            codec: string,
            id: number,
            properties: {
                codec_id: string,
                audio_channels?: number,
                audio_sampling_frequency?: number,
                codec_private_data: string,
                codec_private_length: number,
                default_duration: number,
                default_track: boolean,
                display_dimensions: string,
                display_unit: number,
                enabled_track: boolean,
                forced_track: boolean,
                language?: string,
                language_ietf?: string,
                minimum_timestamp: number,
                number: number,
                packetizer: string,
                pixel_dimensions?: string,
                track_name: string,
                text_subtitles?: boolean, // "text_subtitles": true,
                uid: number,
                tag_number_of_frames?: string,
                tag_duration?: string,
                tag_number_of_bytes?: string,
                tag_bps?: string
            },
            type: "audio" | "video" | "subtitles" | "buttons"
        }
    ],
    warnings: string[]
    errors: string[],
}

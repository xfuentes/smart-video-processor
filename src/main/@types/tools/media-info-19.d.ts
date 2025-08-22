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

type YesNo= "Yes"|"No";

interface GeneralTrack {
    "@type": "General",
    "UniqueID": number,
    "VideoCount": number,
    "AudioCount": number,
    "TextCount": number,
    "MenuCount": number,
    "FileExtension": string,
    "Format": string,
    "Format_Version": string,
    "FileSize": number,
    "Duration": number,
    "OverallBitRate": number,
    "FrameRate": number,
    "FrameCount": number,
    "StreamSize": number,
    "IsStreamable": YesNo,
    "Title": string,
    "Movie": string,
    "Encoded_Date": string,
    "File_Created_Date": string,
    "File_Created_Date_Local": string,
    "File_Modified_Date": string,
    "File_Modified_Date_Local": string,
    "Encoded_Application": string,
    "Encoded_Library": string,
    "Cover": YesNo,
    "extra": {
        "Attachments": string
    }
}

interface VideoTrack {
    "@type": "Video",
    "StreamOrder": number,
    "ID": number,
    "UniqueID": string,
    "Format": string,
    "Format_Profile": string,
    "Format_Level": string,
    "Format_Settings_CABAC": YesNo,
    "Format_Settings_RefFrames": string,
    "CodecID": string,
    "Duration": number,
    "BitRate": number,
    "Width": number,
    "Height": number,
    "Stored_Height": number,
    "Sampled_Width": number,
    "Sampled_Height": number,
    "PixelAspectRatio": string,
    "DisplayAspectRatio": number,
    "FrameRate_Mode": string,
    "FrameRate_Mode_Original": string,
    "FrameRate": number,
    "FrameCount": number,
    "ColorSpace": string,
    "ChromaSubsampling": string,
    "BitDepth": string,
    "ScanType": string,
    "Delay": number,
    "StreamSize": number,
    "Title": string,
    "Encoded_Library": string,
    "Encoded_Library_Name": string,
    "Encoded_Library_Version": string,
    /* command line args of x264 */
    "Encoded_Library_Settings": string,
    "Language": string,
    "Default": YesNo,
    "Forced": YesNo
}
interface AudioTrack {
    "@type": "Audio",
    "@typeorder": string,
    "StreamOrder": string,
    "ID": number,
    "UniqueID": string,
    "Format": string,
    "Format_Commercial_IfAny": string,
    "Format_Settings_Endianness": string,
    "CodecID": string,
    "Duration": number,
    "BitRate_Mode": string,
    "BitRate": number,
    "Channels": string,
    "ChannelPositions": string,
    "ChannelLayout": string,
    "SamplesPerFrame": string,
    "SamplingRate": string,
    "SamplingCount": string,
    "FrameRate": number,
    "FrameCount": number,
    "Compression_Mode": string,
    "Delay": number,
    "Delay_Source": string,
    "StreamSize": number,
    "StreamSize_Proportion": string,
    "Title": string,
    "Language": string,
    "ServiceKind": string,
    "Default": YesNo,
    "Forced": YesNo
}
interface TextTrack {
    "@type": "Text",
    "@typeorder": string,
    "ID": number,
    "UniqueID": string,
    "Format": string,
    "CodecID": string,
    "Duration": number,
    "BitRate": number,
    "FrameRate": number,
    "FrameCount": number,
    "ElementCount": number,
    "StreamSize": number,
    "Title": string,
    "Language": string,
    "Default": YesNo,
    "Forced": YesNo
}
interface MenuTrack {
    "@type": "Menu"
}

type Track= GeneralTrack | VideoTrack | AudioTrack | TextTrack | MenuTrack;

interface MediaInfoResponse {
    "media": {
        "track": Track[]
    }
}

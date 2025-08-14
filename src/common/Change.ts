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

import {v4 as UUIDv4} from "uuid";

export class Attachment {
    path?: string;
    filename: string;
    mimeType: string;
    description: string;

    constructor(filename: string, mimeType: string, description: string, path?: string) {
        this.path = path;
        this.filename = filename;
        this.mimeType = mimeType;
        this.description = description;
    }
}

export enum ChangeSourceType {
    CONTAINER = "Container",
    VIDEO = "Video",
    AUDIO = "Audio",
    SUBTITLES = "Subtitles"
}

export enum ChangeType {
    UPDATE = "Update",
    DELETE = "Delete"
}

export enum SubtitleType {
    FORCED = "Forced",
    FULL = "Full",
    SDH = "SDH"
}

export enum ChangeProperty {
    NAME = "Name",
    LANGUAGE = "Language",
    DEFAULT = "Default",
    FORCED = "Forced",
    // Specific to Container:
    TITLE = "Title",
    FILENAME = "Filename",
    POSTER = "Poster Image",
    ATTACHMENTS = "Attachments",
    TAGS = "Tags"
}

export type ChangePropertyValue = string | boolean | Attachment;

export const containerProperties = [ChangeProperty.TITLE, ChangeProperty.FILENAME, ChangeProperty.POSTER];
export const containerItems = [ChangeProperty.ATTACHMENTS, ChangeProperty.TAGS]; // This is used with Remove action
export const trackProperties = [ChangeProperty.NAME, ChangeProperty.LANGUAGE, ChangeProperty.FORCED, ChangeProperty.DEFAULT];
export const propertyTypes = {
    [ChangeProperty.NAME]: "string",
    [ChangeProperty.LANGUAGE]: "language",
    [ChangeProperty.DEFAULT]: "boolean",
    [ChangeProperty.FORCED]: "boolean",
    [ChangeProperty.TITLE]: "string",
    [ChangeProperty.FILENAME]: "string",
    [ChangeProperty.POSTER]: "attachment",
    [ChangeProperty.ATTACHMENTS]: "undefined",
    [ChangeProperty.TAGS]: "undefined"
};

export class Change {
    uuid: string;
    sourceType: ChangeSourceType;
    trackId?: number;
    changeType: ChangeType;
    property?: ChangeProperty;
    currentValue?: ChangePropertyValue;
    newValue?: ChangePropertyValue;

    constructor(sourceType: ChangeSourceType, changeType: ChangeType, trackId?: number, property?: ChangeProperty, currentValue?: ChangePropertyValue, newValue?: ChangePropertyValue) {
        this.uuid = UUIDv4();
        this.sourceType = sourceType;
        this.changeType = changeType;
        this.trackId = trackId;
        this.property = property;
        this.currentValue = currentValue;
        this.newValue = newValue;
    }

    getSource() {
        return this.sourceType + (this.trackId !== undefined ? " " + this.trackId : "");
    }
}

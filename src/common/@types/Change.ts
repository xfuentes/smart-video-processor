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

export class Attachment {
  path?: string
  filename: string
  mimeType: string
  description: string

  constructor(filename: string, mimeType: string, description: string, path?: string) {
    this.path = path
    this.filename = filename
    this.mimeType = mimeType
    this.description = description
  }
}

export enum ChangeSourceType {
  CONTAINER = 'Container',
  VIDEO = 'Video',
  AUDIO = 'Audio',
  SUBTITLES = 'Subtitles'
}

export enum ChangeType {
  UPDATE = 'Update',
  DELETE = 'Delete'
}

export enum SubtitleType {
  FORCED = 'Forced',
  FULL = 'Full',
  SDH = 'SDH'
}

export enum ChangeProperty {
  NAME = 'Name',
  LANGUAGE = 'Language',
  DEFAULT = 'Default',
  FORCED = 'Forced',
  // Specific to Container:
  TITLE = 'Title',
  FILENAME = 'Filename',
  POSTER = 'Poster Image',
  ATTACHMENTS = 'Attachments',
  TAGS = 'Tags'
}

export type ChangePropertyValue = string | boolean | Attachment

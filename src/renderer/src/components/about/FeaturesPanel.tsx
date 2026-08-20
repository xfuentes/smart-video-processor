/*
 * Smart Video Processor
 * Copyright (c) 2025-2026. Xavier Fuentes <xfuentes-dev@hotmail.com>
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

import React from 'react'
import { useI18n } from '../../i18n'

export const FeaturesPanel = (): React.JSX.Element => {
  const _ = useI18n()

  return (
    <div
      style={{
        backgroundColor: 'var(--colorNeutralBackground1)',
        height: '360px',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '5px',
        border: '1px solid var(--colorNeutralStroke1)',
        boxSizing: 'border-box'
      }}
    >
      <ul>
        <li>
          <b>
            {_('about.features.automatic_media_recognition.title', {
              defaultValue: 'Automatic Media Recognition:'
            })}
          </b>{' '}
          <small>
            {_('about.features.automatic_media_recognition.description', {
              defaultValue: 'Identifies movies and TV shows using TheMovieDB or TVDB'
            })}
          </small>
        </li>
        <li>
          <b>{_('about.features.smart_file_renaming.title', { defaultValue: 'Smart File Renaming:' })}</b>{' '}
          <small>
            {_('about.features.smart_file_renaming.description', {
              defaultValue: 'Renames files using Plex/Kodi-friendly naming conventions'
            })}
          </small>
        </li>
        <li>
          <b>{_('about.features.metadata_correction.title', { defaultValue: 'Metadata Correction:' })}</b>{' '}
          <small>
            {_('about.features.metadata_correction.description', {
              defaultValue: 'Fetches and corrects title, year, episode name...'
            })}
          </small>
        </li>
        <li>
          <b>
            {_('about.features.audio_subtitle_management.title', {
              defaultValue: 'Audio & Subtitle Track Management:'
            })}
          </b>{' '}
          <small>
            {_('about.features.audio_subtitle_management.description', {
              defaultValue: 'Detects and labels audio/subtitle languages; renames and reorders tracks.'
            })}
          </small>
        </li>
        <li>
          <b>
            {_('about.features.poster_thumbnail_download.title', {
              defaultValue: 'Poster & Thumbnail Download:'
            })}
          </b>{' '}
          <small>
            {_('about.features.poster_thumbnail_download.description', {
              defaultValue: 'Automatically downloads posters and thumbnails.'
            })}
          </small>
        </li>
        <li>
          <b>
            {_('about.features.media_splitting_joining.title', {
              defaultValue: 'Media File Splitting & Joining:'
            })}
          </b>{' '}
          <small>
            {_('about.features.media_splitting_joining.description', {
              defaultValue: 'Splits large files or joins multiple parts (e.g., DVD1/DVD2) into one.'
            })}
          </small>
        </li>
        <li>
          <b>
            {_('about.features.video_encoding.title', {
              defaultValue: 'Video Encoding (H.264 / H.265):'
            })}
          </b>{' '}
          <small>
            {_('about.features.video_encoding.description', {
              defaultValue: 'Converts media to efficient formats with predefined presets.'
            })}
          </small>
        </li>
        <li>
          <b>{_('about.features.batch_processing.title', { defaultValue: 'Batch Processing:' })}</b>{' '}
          <small>
            {_('about.features.batch_processing.description', {
              defaultValue: 'Handles multiple files simultaneously with queue management.'
            })}
          </small>
        </li>
        <li>
          <b>
            {_('about.features.multilingual_support.title', {
              defaultValue: 'Multilingual Support:'
            })}
          </b>{' '}
          <small>
            {_('about.features.multilingual_support.description', {
              defaultValue: 'Available in {count} languages.',
              count: 23
            })}
          </small>
        </li>
      </ul>
    </div>
  )
}

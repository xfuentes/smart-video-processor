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

import { Divider, Field, Select } from '@fluentui/react-components'
import { IVideo } from '../../../../common/@types/Video'
import { HintType } from '../../../../common/@types/Hint'
import { LanguageSelector } from '@renderer/components/LanguageSelector'
import { SubtitlesType } from '../../../../common/SubtitlesType'

type Props = {
  video: IVideo,
  disabled?: boolean
}

export const Hints = ({ video, disabled }: Props) => {
  const languageHints = video.hints.filter((h) => h.type === HintType.LANGUAGE)
  const subtitlesTypeHints = video.hints.filter((h) => h.type === HintType.SUBTITLES_TYPE)
  return (
    <div className="hints-main">
      {languageHints.length > 0 && (
        <>
          <Divider appearance="default">Missing Language</Divider>
          <div className="hints-form">
            {languageHints.map((hint) => {
              const key = hint.type + ' ' + hint.trackId
              const track = video.tracks.find((t) => t.id === hint.trackId)
              return (
                <Field key={key} size="small" label={`${track?.type ?? 'Unknown'} ${hint.trackId}`} required>
                  <LanguageSelector
                    id={key}
                    disabled={disabled}
                    size={'small'}
                    multiselect={false}
                    value={hint.value || ''}
                    onChange={async (value) => {
                      if (value) {
                        await window.api.video.setHint(video.uuid, hint, value)
                      }
                    }}
                    required
                  />
                </Field>
              )
            })}
          </div>
        </>
      )}
      {subtitlesTypeHints.length > 0 && (
        <>
          <Divider appearance="default">Missing Subtitles Type</Divider>
          <div className="hints-form">
            {subtitlesTypeHints.map((hint) => {
              const key = hint.type + ' ' + hint.trackId
              const track = video.tracks.find((t) => t.id === hint.trackId)
              return (
                <Field key={key} size="small" label={`${track?.type ?? 'Unknown'} ${hint.trackId}`} required>
                  <Select
                    disabled={disabled}
                    value={hint.value || ''}
                    onChange={async (_ev, data) => await window.api.video.setHint(video.uuid, hint, data.value)}
                  >
                    {Object.values(SubtitlesType).map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </Select>
                </Field>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

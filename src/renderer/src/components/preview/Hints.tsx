/*
 * Smart Video Processor
 * Copyright (c) 2025-2026. Xavier Fuentes <xfuentes-dev@serviam.cc>
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
import { LanguageSelector } from '@renderer/components/fields/LanguageSelector'
import { useI18n } from '../../i18n'
import { SubtitlesType } from '../../../../common/SubtitlesType'

type Props = {
  video: IVideo
  disabled?: boolean
}

export const Hints = ({ video, disabled }: Props) => {
  const _ = useI18n()
  const languageHints = video.hints.filter((h) => h.type === HintType.LANGUAGE)
  const subtitlesTypeHints = video.hints.filter((h) => h.type === HintType.SUBTITLES_TYPE)
  return (
    <div className="hints-main">
      {languageHints.length > 0 && (
        <>
          <Divider appearance="default">{_('hints.missing_language', { defaultValue: 'Missing Language' })}</Divider>
          <div className="hints-form">
            {languageHints.map((hint) => {
              const key = hint.type + ' ' + hint.trackId
              const track = video.tracks.find((t) => t.id === hint.trackId)
              return (
                <Field
                  key={key}
                  size="small"
                  label={
                    track?.type
                      ? _('track_type.' + track.type.toLowerCase() + '.label_id', {
                          defaultValue: `${track.type} {id}`,
                          id: hint.trackId
                        })
                      : _('track.unknown.label_id', { defaultValue: 'Unknown {id}', id: hint.trackId })
                  }
                  required
                  className={disabled ? 'disabled' : ''}
                >
                  <LanguageSelector
                    id={key}
                    disabled={disabled}
                    size="small"
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
          <Divider appearance="default">
            {_('hints.missing_subtitles_type', { defaultValue: 'Missing Subtitles Type' })}
          </Divider>
          <div className="hints-form">
            {subtitlesTypeHints.map((hint) => {
              const key = hint.type + ' ' + hint.trackId
              const track = video.tracks.find((t) => t.id === hint.trackId)
              return (
                <Field
                  key={key}
                  size="small"
                  label={`${track?.type ? _('track_type.' + track.type.toLowerCase() + '.label', { defaultValue: track.type }) : _('track.unknown', { defaultValue: 'Unknown' })} ${hint.trackId}`}
                  required
                  className={disabled ? 'disabled' : ''}
                >
                  <Select
                    size="small"
                    disabled={disabled}
                    value={hint.value || ''}
                    onChange={async (_ev, data) => await window.api.video.setHint(video.uuid, hint, data.value)}
                  >
                    {Object.values(SubtitlesType).map((key) => (
                      <option key={key} value={key}>
                        {_(`subtitles_type.${key.toLowerCase().replace(/ /g, '_')}.label`, { defaultValue: key })}
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

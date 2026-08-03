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

import { Button, Checkbox, Divider, Field, InfoLabel, ProgressBar } from '@fluentui/react-components'
import { WrenchSettings20Regular } from '@fluentui/react-icons'
import { ReactElement } from 'react'
import { _, useI18n } from '../../i18n'
import { IVideo } from '../../../../common/@types/Video'
import { ITrack, TrackType } from '../../../../common/@types/Track'
import { Strings } from '../../../../common/Strings'
import { JobStatus } from '../../../../common/@types/Job'

type Props = {
  video: IVideo
  disabled: boolean
}

const trackTypeEncodingSection = (video: IVideo, type: TrackType, disabled: boolean, expand: boolean = false) => {
  const selectedTrackIds = video.tracks.filter((t) => t.copy).map((t) => t.id)
  const filteredTracks = video.tracks.filter((t) => t.type === type).filter((s) => selectedTrackIds.includes(s.id))
  return (
    filteredTracks.length > 0 && (
      <>
        <Divider style={{ flexGrow: '0' }}>{_('encoding.options', { defaultValue: '{type} Options', type })}</Divider>
        <div className="encoding-form" style={expand ? { flexGrow: 1 } : {}}>
          {filteredTracks.map((track: ITrack) => {
            const key = track.type + ' ' + track.id
            const i18nKey = _('track_type.' + track.type.toLowerCase() + '.label_id', {
              defaultValue: `${track.type} {id}`,
              id: track.id
            })

            const es = video.encoderSettings.find((s) => s.trackId === track.id)
            let infoLabel: ReactElement | undefined = undefined
            let forceDisabled = false
            if (track.unsupported) {
              infoLabel = (
                <InfoLabel
                  info={
                    <div>
                      {_('encoding.conversion_mandatory', {
                        defaultValue: 'Conversion to a supported audio format is mandatory.'
                      })}
                    </div>
                  }
                />
              )
              forceDisabled = true
            } else if (es && es.targetSize) {
              infoLabel = (
                <InfoLabel
                  info={
                    <div style={{ whiteSpace: 'nowrap' }}>
                      {es.codec && (
                        <>
                          {es.enforcingCodec ? _('encoding.enforcing', { defaultValue: 'Enforcing' }) + ' ' : ''}
                          {_('encoding.codec', { defaultValue: 'Codec' })}: {es.codec}
                          <br />
                        </>
                      )}
                      {es.compressionPercent !== undefined && (
                        <>
                          {_('encoding.compression', { defaultValue: 'Compression' })}: {es.compressionPercent}%<br />
                        </>
                      )}
                      {es.originalSize !== undefined && (
                        <>
                          {_('encoding.original', { defaultValue: 'Original' })}:{' '}
                          {Strings.humanFileSize(es.originalSize, false)}
                          <br />
                        </>
                      )}
                      <>
                        {_('encoding.target', { defaultValue: 'Target' })}:{' '}
                        {Strings.humanFileSize(es.targetSize, false)}
                        <br />
                      </>
                    </div>
                  }
                />
              )
            }
            return (
              <Checkbox
                key={key}
                checked={video.trackEncodingEnabled[key] ?? false}
                onChange={async (_ev, data) => {
                  if (data.checked !== 'mixed') {
                    await window.api.video.setTrackEncodingEnabled(video.uuid, key, data.checked)
                  }
                }}
                disabled={disabled || forceDisabled}
                label={
                  infoLabel === undefined ? (
                    i18nKey
                  ) : (
                    <>
                      {i18nKey}
                      {infoLabel}
                    </>
                  )
                }
              />
            )
          })}
        </div>
      </>
    )
  )
}

export const Encoding = ({
 video, disabled }: Props) => {
  const _ = useI18n()
  const progression = video.progression.progress
  let progressColor: 'brand' | 'success' | 'warning' | 'error' = 'brand'
  let validation: 'error' | 'warning' | 'success' | 'none' = 'none'

  switch (video.status) {
    case JobStatus.PAUSED:
    case JobStatus.WARNING:
      progressColor = 'warning'
      validation = 'warning'
      break
    case JobStatus.SUCCESS:
      progressColor = 'success'
      validation = 'success'
      break
    case JobStatus.ABORTED:
    case JobStatus.ERROR:
      progressColor = 'error'
      validation = 'error'
      break
  }
  const statusI18n = _(`job.status.${video.status.toLowerCase()}.short`, { defaultValue: video.status })
  const messageI18n = video.message
    ? _('encoding.status_message', { defaultValue: '{status}: {message}', status: statusI18n, message: video.message })
    : statusI18n

  return (
    <div className="encoding-main" style={{ flexGrow: '1' }}>
      {trackTypeEncodingSection(video, TrackType.VIDEO, disabled)}
      {trackTypeEncodingSection(video, TrackType.AUDIO, disabled, true)}
      <>
        {video.message !== undefined && (
          <>
            <Divider style={{ flexGrow: '0' }} />
            <div style={{ paddingTop: '5px', paddingBottom: '5px' }}>
              <Field validationMessage={messageI18n} validationState={validation}>
                {progression !== -1 ? (
                  <ProgressBar color={progressColor} value={progression} />
                ) : (
                  <div style={{ minHeight: '2px' }} />
                )}
              </Field>
            </div>
          </>
        )}
        <Divider style={{ flexGrow: '0' }} />
        <div className="preview-buttons">
          <div className="button">
            <Button
              size="small"
              appearance="primary"
              icon={<WrenchSettings20Regular />}
              disabled={disabled}
              onClick={() => void window.api.video.process(video.uuid)}
            >
              {_('encoding.process', { defaultValue: 'Process' })}
            </Button>
          </div>
        </div>
      </>
    </div>
  )
}

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

import { Button, Checkbox, Divider, InfoLabel } from '@fluentui/react-components'
import { WrenchSettings20Regular } from '@fluentui/react-icons'
import { ReactElement } from 'react'
import { IVideo } from '../../../../common/@types/Video'
import { ITrack, TrackType } from '../../../../common/@types/Track'
import { Strings } from '../../../../common/Strings'
import { EncoderSettings } from '../../../../common/@types/Encoding'

type Props = {
  videos: IVideo[]
  commonEncoderSettings: EncoderSettings[]
  disabled: boolean
}

const trackTypeEncodingSection = (
  videos: IVideo[],
  commonEncoderSettings: EncoderSettings[],
  type: TrackType,
  disabled: boolean,
  expand: boolean = false
) => {
  let commonFilteredTracks: ITrack[] = []
  let first = true
  for (const video of videos) {
    const filteredTracks = video.tracks.filter((t) => t.type === type && t.copy)
    if (first) {
      commonFilteredTracks = filteredTracks
      first = false
    } else {
      commonFilteredTracks = commonFilteredTracks.filter((t) => {
        const u = filteredTracks.find((u) => t.id === u.id && t.type === u.type)
        return u !== undefined
      })
    }
  }
  return (
    commonFilteredTracks.length > 0 && (
      <>
        <Divider style={{ flexGrow: '0' }}>{type} Options</Divider>
        <div className="encoding-form" style={expand ? { flexGrow: 1 } : {}}>
          {commonFilteredTracks.map((track: ITrack) => {
            const key = track.type + ' ' + track.id
            const es = commonEncoderSettings.find((s) => s.trackId === track.id)
            let infoLabel: ReactElement | undefined = undefined
            let forceDisabled = false
            if (track.unsupported) {
              infoLabel = <InfoLabel info={<div>Conversion to a supported audio format is mandatory.</div>} />
              forceDisabled = true
            } else if (es && es.targetSize) {
              infoLabel = (
                <InfoLabel
                  info={
                    <div style={{ whiteSpace: 'nowrap' }}>
                      <>
                        Selected file{videos.length > 1 ? 's' : ''}: {videos.length}
                        <br />
                      </>
                      {es.codec !== undefined && (
                        <>
                          {es.enforcingCodec ? 'Enforcing ' : ''}Codec: {es.codec}
                          <br />
                        </>
                      )}
                      {es.compressionPercent !== undefined && (
                        <>
                          Compression: {es.compressionPercent}%<br />
                        </>
                      )}
                      {es.originalSize !== undefined && (
                        <>
                          Original: {Strings.humanFileSize(es.originalSize, false)}
                          <br />
                        </>
                      )}
                      <>
                        Target: {Strings.humanFileSize(es.targetSize, false)}
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
                checked={es?.encodingEnabled ?? 'mixed'}
                onChange={async (_ev, data) => {
                  if (data.checked !== 'mixed') {
                    await window.api.video.setMultiTrackEncodingEnabled(
                      videos.map((v) => v.uuid),
                      key,
                      data.checked
                    )
                  }
                }}
                disabled={disabled || forceDisabled}
                label={
                  infoLabel === undefined ? (
                    key
                  ) : (
                    <>
                      {key}
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

export const MultiEncoding = ({ videos, commonEncoderSettings, disabled }: Props) => {
  return (
    <div className="encoding-main" style={{ flexGrow: '1' }}>
      {trackTypeEncodingSection(videos, commonEncoderSettings, TrackType.VIDEO, disabled)}
      {trackTypeEncodingSection(videos, commonEncoderSettings, TrackType.AUDIO, disabled, true)}
      <>
        <Divider style={{ flexGrow: '0' }} />
        <div className="preview-buttons">
          <div className="button">
            <Button
              size={'medium'}
              appearance="primary"
              icon={<WrenchSettings20Regular />}
              disabled={disabled}
              onClick={() => void window.api.video.multiProcess(videos.map((v) => v.uuid))}
            >
              Process
            </Button>
          </div>
        </div>
      </>
    </div>
  )
}

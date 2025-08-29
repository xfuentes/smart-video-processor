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

import { MessageBar, MessageBarGroup, MessageBarIntent, ProgressBar, Tooltip } from '@fluentui/react-components'
import {
  CheckboxChecked16Regular,
  CheckboxUnchecked16Regular,
  PresenceUnknown16Regular,
  Speaker216Regular,
  Subtitles16Regular,
  Video16Regular
} from '@fluentui/react-icons'
import { Strings } from '../../../../common/Strings'
import { TrackProperties, TrackType } from '../../../../common/@types/Track'
import { IVideo } from '../../../../common/@types/Video'
import { JobStatus } from '../../../../common/@types/Job'
import { Attachment } from '../../../../common/@types/Change'
import React from 'react'

export function bitrateRenderer(bitrate?: number) {
  return bitrate ? <span>{Strings.humanBitrate(bitrate)} </span> : <span>-</span>
}

export function sizeRenderer(size?: number) {
  return size ? <span>{Strings.humanFileSize(size)} </span> : <span>-</span>
}

export function progressRenderer(video: IVideo) {
  let progressColor: 'brand' | 'success' | 'warning' | 'error' = 'brand'
  switch (video.status) {
    case JobStatus.PAUSED:
    case JobStatus.WARNING:
      progressColor = 'warning'
      break
    case JobStatus.SUCCESS:
      progressColor = 'success'
      break
    case JobStatus.ABORTED:
    case JobStatus.ERROR:
      progressColor = 'error'
      break
  }

  const percentComplete = video.progression.progress
  return percentComplete !== -1 ? (
    <ProgressBar color={progressColor} value={percentComplete} max={1} />
  ) : (
    <div style={{ minHeight: '2px' }} />
  )
}

export function codecRenderer(codec: string) {
  if (codec.indexOf('H.264') >= 0) {
    return 'H.264'
  }
  if (codec.indexOf('H.265') >= 0) {
    return 'H.265'
  }
  return codec
}

export function trackPropertiesRenderer(properties: TrackProperties) {
  const res: string[] = []
  if (properties.videoDimensions) {
    res.push(properties.videoDimensions + (properties.fps ? '@' + properties.fps : ''))
  }
  if (properties.audioChannels) {
    res.push(Strings.humanAudioChannels(properties.audioChannels))
  }
  if (properties.audioSamplingFrequency) {
    res.push(Strings.humanFrequencies(properties.audioSamplingFrequency))
  }
  return res.join(' ')
}

export function framesRenderer(frames?: number) {
  return <span>{frames}</span>
}

export function durationRenderer(duration?: number) {
  return duration ? <span>{Strings.humanDuration(duration)}</span> : <span>-</span>
}

export function booleanRenderer(value: boolean) {
  return value ? <CheckboxChecked16Regular /> : <CheckboxUnchecked16Regular />
}

export function attachmentRenderer(value: Attachment) {
  if (value === undefined) {
    return <span />
  }
  if (value.description) {
    return (
      <Tooltip content={value.description} relationship="description">
        <span>{value.filename + ' (' + value.mimeType + ')'}</span>
      </Tooltip>
    )
  } else {
    return <span>{value.filename + ' (' + value.mimeType + ')'}</span>
  }
}

export function statusRenderer(
  status: JobStatus,
  message: string | undefined,
  size: 'small' | 'large' = 'small'
) {
  let intent: MessageBarIntent
  switch (status) {
    case JobStatus.ERROR:
    case JobStatus.ABORTED:
      intent = 'error'
      break
    case JobStatus.SUCCESS:
      intent = 'success'
      break
    case JobStatus.WARNING:
      intent = 'warning'
      break
    default:
      intent = 'info'
      break
  }
  if (size === 'small') {
    const messageGroup = (
      <MessageBarGroup>
        <MessageBar
          style={{ minHeight: '20px', minWidth: '100px' }}
          shape="rounded"
          intent={intent}
        >
          {status}
        </MessageBar>
      </MessageBarGroup>
    )
    return message === undefined ? (
      messageGroup
    ) : (
      <Tooltip content={message} relationship="description">
        {messageGroup}
      </Tooltip>
    )
  } else {
    return (
      <MessageBarGroup>
        <MessageBar
          style={{ minHeight: '20px', minWidth: '100px' }}
          shape="rounded"
          intent={intent}
        >
          {message}
        </MessageBar>
      </MessageBarGroup>
    )
  }
}

export function trackTypeRenderer(trackType: TrackType): React.JSX.Element {
  let image: React.JSX.Element
  switch (trackType) {
    case TrackType.AUDIO:
      image = <Speaker216Regular />
      break
    case TrackType.SUBTITLES:
      image = <Subtitles16Regular />
      break
    case TrackType.VIDEO:
      image = <Video16Regular />
      break
    default:
      image = <PresenceUnknown16Regular />
      break
  }
  return (
    <Tooltip content={trackType} relationship={'description'}>
      {image}
    </Tooltip>
  )
}

export function qualityRenderer(pixels: string | undefined) {
  if (pixels != undefined) {
    const { shortName, longName, badge } = Strings.pixelsToQuality(pixels)

    return (
      <div className={`quality-icon ${badge}`}>
        <div className="short">{shortName}</div>
        <div className="long">{longName}</div>
      </div>
    )
  } else {
    return '-'
  }
}

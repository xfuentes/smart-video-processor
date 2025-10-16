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

import { IVideo } from '../../../../common/@types/Video'
import React, { ReactElement } from 'react'
import { Strings } from '../../../../common/Strings'

declare type Hour =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 23
  | 24

type Props = {
  video: IVideo
  step?: number
  disabled?: boolean
}

export const VideoSectionSelectorField = React.memo(function ({ video, step = 60, disabled = false }: Props) {
  const duration = video.duration
  const previewHeight = 58
  const labels: ReactElement[] = []
  const tickMarks: ReactElement[] = []
  for (let i = 0; i <= duration; i += step) {
    const currentStep = i / step
    if (currentStep % 10 === 0) {
      labels.push(
        <div
          key={`label-tick-${i}`}
          className="tick-mark"
          style={{ position: 'absolute', left: `${currentStep * 22}px`, bottom: `${previewHeight + 4}px` }}
        />,
        <div
          key={`label-${i}`}
          className="label"
          style={{ position: 'absolute', left: `${currentStep * 22 + 2}px`, bottom: `${previewHeight + 4}px` }}
        >
          {Strings.humanDuration(i)}
        </div>
      )
    }
    tickMarks.push(
      <div
        key={`tick-${i}`}
        className="tick-mark"
        style={{ position: 'absolute', left: `${currentStep * 22}px`, bottom: `${previewHeight}px` }}
      />
    )
  }
  const durationLeft = duration % step
  let endPos = Math.floor(duration / step) * 22
  if (durationLeft > 0) {
    endPos += Math.round((durationLeft * 22) / step)
    labels.push(
      <div
        key={`label-tick-${duration}`}
        className="tick-mark"
        style={{ position: 'absolute', left: `${endPos}px`, bottom: `${previewHeight + 4}px` }}
      />,
      <div
        key={`label-${duration}`}
        className="label"
        style={{ position: 'absolute', left: `${endPos - 44}px`, bottom: `${previewHeight + 4}px` }}
      >
        {Strings.humanDuration(duration)}
      </div>
    )
    tickMarks.push(
      <div
        key={`tick-${duration}`}
        className="tick-mark"
        style={{ position: 'absolute', left: `${endPos}px`, bottom: `${previewHeight}px` }}
      />
    )
  }
  const imageHeight = previewHeight - 2;
  //const imageWidth = video.aspectRatio

  /*
  ffmpeg -ss 00:01:19 -i input.mp4 -vframes 1 output_01.png
ffmpeg -ss 00:01:36 -i input.mp4 -vframes 1 output_02.png
ffmpeg -ss 00:03:05 -i input.mp4 -vframes 1 output_03.png
ffmpeg -ss 00:05:51 -i input.mp4 -vframes 1 output_04.png

ffmpeg -ss 00:01:30 -i input.mp4 -ss 00:02:45 -i input.mp4 \
-map 0:v -vframes 1 snapshot1.png \
-map 1:v -vframes 1 snapshot2.png

   */

  return (
    <div className="video-section-selector-field">
      <div className="ruler">
        {labels}
        {tickMarks}
        <div className="preview" style={{ width: `${endPos}px` }}>

        </div>
      </div>
    </div>
  )
})

VideoSectionSelectorField.displayName = 'VideoSectionSelectorField'

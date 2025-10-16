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

import { IVideo } from "../../../../common/@types/Video";
import React, { ReactElement } from "react";
import { Strings } from "../../../../common/Strings";

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
  step: number
  disabled: boolean
}

export const VideoSectionSelectorField = React.memo(function ({ video, step = 60, disabled = false }: Props) {
  const duration = video.duration
  const labels: ReactElement[] = []
  const tickMarks: ReactElement[] = []
  for (let i = 0; i <= duration; i += step) {
    const currentStep = i / step
    if (currentStep % 10 === 0) {
      labels.push(
        <div
          key={`label-tick-${i}`}
          className="tick-mark"
          style={{ position: 'absolute', left: `${currentStep * 22}px`, bottom: 0 }}
        />,
        <div
          key={`label-${i}`}
          className="label"
          style={{ position: 'absolute', left: `${currentStep * 22 + 2}px`, bottom: 0 }}
        >
          {Strings.humanDuration(i)}
        </div>
      )
    }
    if (tickMarks.length > 0) {
      tickMarks.push(<div key={`space-${i}`} className="space" />)
    }
    tickMarks.push(<div key={`tick-${i}`} className="tick-mark" />)
  }
  const durationLeft = duration % step
  if (durationLeft > 0) {
    const restSize = Math.round((durationLeft * 22) / step)
    const endPos = Math.floor(duration / step) * 22 + restSize
    labels.push(
      <div
        key={`label-tick-${duration}`}
        className="tick-mark"
        style={{ position: 'absolute', left: `${endPos + 2}px`, bottom: 0 }}
      />,
      <div
        key={`label-${duration}`}
        className="label"
        style={{ position: 'absolute', left: `${endPos - 44 + 2}px`, bottom: 0 }}
      >
        {Strings.humanDuration(duration)}
      </div>
    )
    if (tickMarks.length > 0) {
      tickMarks.push(<div key={`space-${duration}`} className="space" style={{ width: `${restSize}px` }} />)
    }
    tickMarks.push(<div key={`tick-${duration}`} className="tick-mark" />)
  }
  return (
    <div className="video-section-selector-field">
      <div className="ruler">
        <div className="labels">{labels}</div>
        <div className="tick-marks">{tickMarks}</div>
        <div className="preview"></div>
      </div>
    </div>
  )
})

VideoSectionSelectorField.displayName = 'VideoSectionSelectorField'

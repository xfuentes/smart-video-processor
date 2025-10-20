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
import React, { ReactElement, useEffect } from 'react'
import { Strings } from '../../../../common/Strings'
import { Button, Image } from '@fluentui/react-components'
import {
  ArrowNext20Regular,
  ArrowPrevious20Regular,
  FilmstripSplitRegular,
  Pause16Regular,
  Play16Regular,
  Stop16Regular
} from '@fluentui/react-icons'
import { useVideoPlayer } from '@renderer/components/context/VideoPlayerContext'

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

export const VideoSectionSelectorField = function ({ video, step = 60 }: Props) {
  const { videoPlayed, setVideoPlayed, videoPlayerOpened, setVideoPlayerOpened, seekTo, pause, play } = useVideoPlayer()
  const [snapshotsStep, setSnapshotsStep] = React.useState(0)
  const [snapshotsVideoUuid, setSnapshotsVideoUuid] = React.useState('')
  const [snapshotsFilePath, setSnapshotsFilePath] = React.useState('')
  const [playHeadPosition, setPlayHeadPosition] = React.useState(0)
  const [startFrom, setStartFrom] = React.useState(video.startFrom ?? 0)
  const [endAt, setEndAt] = React.useState(video.endAt ?? video.duration)

  const duration = video.duration
  const durationLeft = duration % step
  const previewHeight = 58
  const labels: ReactElement[] = []
  const tickMarks: ReactElement[] = []
  for (let i = 0; i <= duration; i += step) {
    const currentStep = i / step
    if (currentStep % 10 === 0) {
      const lastSection = i + step * 10 > duration
      const lastSectionStepCount = (duration - i) / step
      if (!lastSection || lastSectionStepCount >= 2.5) {
        labels.push(
          <div
            key={`label-tick-${i}`}
            className="tick-mark"
            style={{ position: 'absolute', left: `${currentStep * 22}px`, bottom: `${previewHeight + 4}px` }}
          />
        )
      }
      if (!lastSection || lastSectionStepCount >= 4) {
        console.log(durationLeft / step)
        labels.push(
          <div
            key={`label-${i}`}
            className="label"
            style={{ position: 'absolute', left: `${currentStep * 22 + 2}px`, bottom: `${previewHeight + 4}px` }}
          >
            {Strings.humanDuration(i)}
          </div>
        )
      }
    }
    tickMarks.push(
      <div
        key={`tick-${i}`}
        className="tick-mark"
        style={{ position: 'absolute', left: `${currentStep * 22}px`, bottom: `${previewHeight}px` }}
      />
    )
  }
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
  useEffect(() => {
    if (video.uuid != snapshotsVideoUuid || snapshotsStep != step) {
      const durationLeft = video.duration % step
      let endPos = Math.floor(video.duration / step) * 22
      if (durationLeft > 0) {
        endPos += Math.round((durationLeft * 22) / step)
      }
      const totalWidth = endPos
      const snapshotHeight = previewHeight - 2
      const snapshotWidth = Math.round(Strings.pixelsToAspectRatio(video.pixels) * snapshotHeight)
      window.api.video
        .takeSnapshots(video.uuid, snapshotHeight, snapshotWidth, totalWidth)
        .then((snapshotsFilePath: string) => {
          setSnapshotsStep(step)
          setSnapshotsVideoUuid(video.uuid)
          setSnapshotsFilePath(snapshotsFilePath)
        })
    }
  }, [video.uuid, step, snapshotsVideoUuid, snapshotsStep, video.duration, video.pixels])

  const handlePrevious = () => {
    setPlayHeadPosition((currentPlayHeadPosition) => {
      if (currentPlayHeadPosition > endAt) {
        return endAt
      } else if (currentPlayHeadPosition > startFrom) {
        return startFrom
      } else {
        return 0
      }
    })
  }

  const handleNext = () => {
    setPlayHeadPosition((currentPlayHeadPosition) => {
      if (currentPlayHeadPosition < startFrom) {
        return startFrom
      } else if (currentPlayHeadPosition < endAt) {
        return endAt
      } else {
        return video.duration
      }
    })
  }

  const handlePlay = () => {
    if(videoPlayed !== video || videoPlayerOpened == false) {
      setVideoPlayed(video)
      setVideoPlayerOpened(true)
    } else {
      void play()
    }
  }

  const handlePause = () => {
    pause && pause()
  }

  const handleStop = () => {
    setVideoPlayed(undefined)
    setVideoPlayerOpened(false)
  }

  const isPlaying = videoPlayerOpened && videoPlayed?.uuid === video.uuid
  const isStopped = !videoPlayerOpened
  
  return (
    <div className="video-section-selector-field">
      <div className="controller">
        <div className="current-position">00:00:00,00</div>
        <div className="video-controls">
          <Button size="small" appearance="subtle" onClick={handlePrevious} icon={<ArrowPrevious20Regular />} />
          <Button size="small" appearance="subtle" onClick={handlePlay} icon={<Play16Regular />} disabled={isPlaying} />
          <Button size="small" appearance="subtle" onClick={handlePause} icon={<Pause16Regular />} />
          <Button size="small" appearance="subtle" onClick={handleStop} icon={<Stop16Regular />} disabled={isStopped} />
          <Button size="small" appearance="subtle" onClick={handleNext} icon={<ArrowNext20Regular />} />
        </div>
        <div className="video-controls">
          <Button
            size="small"
            appearance="subtle"
            onClick={handleNext}
            icon={
              <div className="hide-first-half">
                <FilmstripSplitRegular />
              </div>
            }
          />
          <Button
            size="small"
            appearance="subtle"
            onClick={handleNext}
            icon={
              <div className="hide-second-half">
                <FilmstripSplitRegular />
              </div>
            }
          />
        </div>
      </div>
      <div className="scrollable">
        <div className="ruler">
          {labels}
          {tickMarks}
          <div className="preview" style={{ width: `${endPos}px`, overflow: 'hidden' }}>
            {snapshotsFilePath && <Image src={'svp:///' + snapshotsFilePath} className="poster" />}
          </div>
        </div>
      </div>
    </div>
  )
}

VideoSectionSelectorField.displayName = 'VideoSectionSelectorField'

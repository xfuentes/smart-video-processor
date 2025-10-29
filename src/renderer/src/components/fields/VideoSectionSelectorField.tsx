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
import React, { ReactElement, useCallback, useEffect, useRef } from 'react'
import { Strings } from '../../../../common/Strings'
import { Button, ProgressBar } from '@fluentui/react-components'
import {
  ArrowNext20Regular,
  ArrowPrevious20Regular,
  FilmstripSplitRegular,
  Pause16Regular,
  Play16Regular,
  Stop16Regular
} from '@fluentui/react-icons'
import { useVideoPlayer } from '@renderer/components/context/VideoPlayerContext'
import { PlayHead } from '@renderer/components/context/PlayHead'
import { Delimitation } from '@renderer/components/context/Delimitation'
import { useSettings } from '@renderer/components/context/SettingsContext'

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
  // step ===> 22 px
  const { settingsValidation } = useSettings()
  const {
    videoPlayed,
    setVideoPlayed,
    videoPlayerOpened,
    setVideoPlayerOpened,
    seekTo,
    pause,
    play,
    videoPlayerPaused,
    videoPlayerCurrentTime,
    setVideoPlayerCurrentTime
  } = useVideoPlayer()
  const scrollableRef = useRef<HTMLDivElement | null>(null)
  const rulerRef = useRef<HTMLDivElement | null>(null)
  const startFrom = video.startFrom ?? 0
  const endAt = video.endAt ?? video.duration
  const [selPosX, setSelPosX] = React.useState<number | undefined>(undefined)
  const [currentTime, setCurrentTime] = React.useState<number>(0)

  const duration = video.duration
  const durationLeft = duration % step
  const previewHeight = 58
  const labels: ReactElement[] = []
  const tickMarks: ReactElement[] = []

  const toNearestKeyFrameTime = React.useCallback(
    (selTime: number) => {
      if (video.keyFrames.length === 0) {
        return selTime
      }
      if (video.keyFrames[0] > selTime) {
        return video.keyFrames[0]
      }
      if (video.keyFrames[video.keyFrames.length - 1] < selTime) {
        return video.keyFrames[video.keyFrames.length - 1]
      }

      return findClosest(video.keyFrames, selTime)
    },
    [video.keyFrames]
  )

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
    if (videoPlayed?.uuid === video.uuid) {
      setCurrentTime(videoPlayerCurrentTime)
    }
  }, [videoPlayerCurrentTime, videoPlayed?.uuid, video.uuid])

  useEffect(() => {
    if (video.uuid === videoPlayed?.uuid && videoPlayed !== video) {
      setVideoPlayed(video)
    }
  }, [setVideoPlayed, video, videoPlayed])

  useEffect(() => {
    if (!video.snapshotsPath && video.duration && video.pixels) {
      const durationLeft = video.duration % step
      let endPos = Math.floor(video.duration / step) * 22
      if (durationLeft > 0) {
        endPos += Math.round((durationLeft * 22) / step)
      }
      const totalWidth = endPos
      const snapshotHeight = previewHeight - 2
      const snapshotWidth = Math.round(Strings.pixelsToAspectRatio(video.pixels) * snapshotHeight)
      void window.api.video.takeSnapshots(video.uuid, snapshotHeight, snapshotWidth, totalWidth)
    }
  }, [video.uuid, step, video.duration, video.pixels, video.snapshotsPath])

  const handlePlay = async () => {
    if (!videoPlayerOpened) {
      setVideoPlayerOpened(true)
    }
    if (videoPlayed !== video) {
      setVideoPlayed(video)
      setVideoPlayerCurrentTime(currentTime)
      seekTo(currentTime)
    }
    if (videoPlayerOpened) {
      await play()
    }
  }

  const handlePause = () => {
    pause && pause()
  }

  const handleStop = () => {
    setVideoPlayed(undefined)
    setVideoPlayerOpened(false)
  }

  const isPlaying = videoPlayerOpened && videoPlayed?.uuid === video.uuid && !videoPlayerPaused
  const isStopped = !videoPlayerOpened || videoPlayed?.uuid !== video.uuid
  const isPaused = !videoPlayerOpened || videoPlayerPaused || videoPlayed?.uuid !== video.uuid
  let previousTime: number | undefined = undefined
  if (currentTime > endAt) {
    previousTime = endAt
  } else if (currentTime > startFrom) {
    previousTime = startFrom
  } else if (currentTime !== 0) {
    previousTime = 0
  }
  let nextTime: number | undefined = undefined
  if (currentTime < startFrom) {
    nextTime = startFrom
  } else if (currentTime < endAt) {
    nextTime = endAt
  }
  const canStartHere = endAt > currentTime && startFrom !== currentTime
  const canEndHere = startFrom < currentTime && endAt !== currentTime

  const handlePrevious = () => {
    if (previousTime !== undefined) {
      localSeekTo(previousTime)
    }
  }

  const handleNext = () => {
    if (nextTime !== undefined) {
      localSeekTo(nextTime)
    }
  }

  const handleSetStartFrom = async () => {
    if (settingsValidation.result.isFineTrimEnabled) {
      await window.api.video.setStartFrom(video.uuid, toNearestKeyFrameTime(currentTime))
    }
  }

  const handleSetEndTo = async () => {
    if (settingsValidation.result.isFineTrimEnabled) {
      await window.api.video.setEndAt(video.uuid, toNearestKeyFrameTime(currentTime))
    }
  }

  function findClosest(arr: number[], target: number) {
    let left = 0
    let right = arr.length - 1

    // Binary search to find insertion point
    while (left < right) {
      const mid = Math.floor((left + right) / 2)
      if (arr[mid] < target) {
        left = mid + 1
      } else {
        right = mid
      }
    }

    // Check neighbors around the insertion point
    const closest = left
    const before = left > 0 ? arr[left - 1] : arr[closest]
    const after = arr[closest]

    // Return the closest value
    return target - before <= after - target ? before : after
  }

  const handleMouseMoveOverScrollable = useCallback((event: MouseEvent) => {
    if (rulerRef.current != null) {
      setSelPosX(event.clientX - rulerRef.current.getBoundingClientRect().left - 4)
    }
  }, [])

  const handleMouseOutScrollable = useCallback(
    (_event: MouseEvent) => {
      setSelPosX(undefined)
    },
    [setSelPosX]
  )

  const localSeekTo = useCallback(
    (position: number) => {
      if (videoPlayed?.uuid === video.uuid) {
        seekTo(position)
      } else {
        setCurrentTime(position)
      }
    },
    [seekTo, video.uuid, videoPlayed?.uuid]
  )

  useEffect(() => {
    let ruler: HTMLDivElement | null = null
    if (rulerRef && rulerRef.current) {
      ruler = rulerRef.current
      ruler.addEventListener('mouseover', handleMouseMoveOverScrollable)
      ruler.addEventListener('mousemove', handleMouseMoveOverScrollable)
      ruler.addEventListener('mouseout', handleMouseOutScrollable)
    }
    return () => {
      if (ruler) {
        ruler.removeEventListener('mouseover', handleMouseMoveOverScrollable)
        ruler.removeEventListener('mousemove', handleMouseMoveOverScrollable)
        ruler.removeEventListener('mouseout', handleMouseOutScrollable)
      }
    }
  }, [handleMouseOutScrollable, handleMouseMoveOverScrollable, rulerRef])

  const posX = (currentTime * 22) / step
  const startVideoPercent = (startFrom * 100) / duration
  const endVideoPercent = (endAt * 100) / duration

  return (
    <div className="video-section-selector-field">
      <div className="controller">
        <div className="current-position">{Strings.humanDuration(currentTime)}</div>
        <div className="video-controls">
          <Button
            size="small"
            appearance="subtle"
            onClick={handlePrevious}
            icon={<ArrowPrevious20Regular />}
            disabled={previousTime === undefined}
          />
          <Button size="small" appearance="subtle" onClick={handlePlay} icon={<Play16Regular />} disabled={isPlaying} />
          <Button
            size="small"
            appearance="subtle"
            onClick={handlePause}
            icon={<Pause16Regular />}
            disabled={isPaused}
          />
          <Button size="small" appearance="subtle" onClick={handleStop} icon={<Stop16Regular />} disabled={isStopped} />
          <Button
            size="small"
            appearance="subtle"
            onClick={handleNext}
            icon={<ArrowNext20Regular />}
            disabled={nextTime === undefined}
          />
        </div>
        <div className="video-controls">
          <Button
            size="small"
            appearance="subtle"
            onClick={handleSetStartFrom}
            icon={
              <div className="hide-first-half">
                <FilmstripSplitRegular />
              </div>
            }
            disabled={!canStartHere}
          />
          <Button
            size="small"
            appearance="subtle"
            onClick={handleSetEndTo}
            icon={
              <div className="hide-second-half">
                <FilmstripSplitRegular />
              </div>
            }
            disabled={!canEndHere}
          />
        </div>
        <div style={{ verticalAlign: 'center', padding: '4px', height: '100%', display: 'flex', alignItems: 'center' }}>
          {video.progression?.progress !== -1 ? (
            <ProgressBar value={video.progression?.progress} max={1} />
          ) : (
            <div style={{ minHeight: '2px' }} />
          )}
        </div>
      </div>
      <div className="scrollable" ref={scrollableRef}>
        <div
          className="ruler"
          ref={rulerRef}
          onClick={() => selPosX !== undefined && localSeekTo((selPosX * step) / 22)}
        >
          {labels}
          {tickMarks}
          <div
            className="preview"
            style={{
              width: `${endPos}px`,
              background: video.snapshotsPath
                ? `url('${'svp:///' + video.snapshotsPath.replaceAll('\\', '/')}') 0% 0% / auto 100%`
                : 'black'
            }}
          >
            <div
              className="mask"
              style={{
                maskImage: `linear-gradient(to right, black ${startVideoPercent}%, transparent ${startVideoPercent + 0.001}%, transparent ${endVideoPercent - 0.001}%, black ${endVideoPercent}%)`
              }}
            />
          </div>
          <Delimitation time={startFrom} posX={(startFrom * 22) / step} />
          <Delimitation time={endAt} posX={(endAt * 22) / step} end />
          <PlayHead currentTime={currentTime} posX={posX} />
          <PlayHead selection posX={selPosX} />
        </div>
      </div>
    </div>
  )
}
VideoSectionSelectorField.displayName = 'VideoSectionSelectorField'

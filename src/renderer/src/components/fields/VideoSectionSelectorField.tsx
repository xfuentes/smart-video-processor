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
import { Button, ProgressBar, ToggleButton, Tooltip } from '@fluentui/react-components'
import {
  ArrowNext20Regular,
  ArrowPrevious20Regular,
  FilmstripSplitFilled,
  FilmstripSplitRegular,
  Pause16Regular,
  Play16Regular,
  Stop16Regular,
  SubtractSquareRegular
} from '@fluentui/react-icons'
import { useVideoPlayer } from '@renderer/components/context/VideoPlayerContext'
import { PlayHead } from '@renderer/components/context/PlayHead'
import { Delimitation } from '@renderer/components/context/Delimitation'

type Props = {
  video: IVideo
  disabled?: boolean
  mainVideoUuid?: string
}

export const VideoSectionSelectorField = function ({ video, mainVideoUuid = undefined }: Props) {
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
  const startFrom = video.startFrom
  const endAt = video.endAt
  const [selPosX, setSelPosX] = React.useState<number | undefined>(undefined)
  const [currentTime, setCurrentTime] = React.useState<number>(0)
  const startFromChecked = startFrom !== undefined
  const endAtChecked = endAt !== undefined

  const { step, stepSize } = video.snapshots ?? {
    step: 5,
    stepSize: 10
  }

  const duration = video.duration

  const durationLeft = duration % step
  let endPos = Math.floor(duration / step) * stepSize
  if (durationLeft > 0) {
    endPos += Math.round((durationLeft * stepSize) / step)
  }

  const previewHeight = 58
  const labels: ReactElement[] = []
  const tickMarks: ReactElement[] = []

  for (let i = 0; i <= duration; i += step) {
    const currentStep = i / step
    if (currentStep % 12 === 0) {
      const lastSection = i + step * 12 > duration
      const lastSectionStepCount = (duration - i) / step
      if (!lastSection || lastSectionStepCount >= 3) {
        labels.push(
          <div
            key={`label-tick-${i}`}
            className="tick-mark"
            style={{ position: 'absolute', left: `${currentStep * stepSize}px`, bottom: `${previewHeight + 4}px` }}
          />
        )
      }
      if (!lastSection || lastSectionStepCount >= 6) {
        labels.push(
          <div
            key={`label-${i}`}
            className="label"
            style={{ position: 'absolute', left: `${currentStep * stepSize + 2}px`, bottom: `${previewHeight + 4}px` }}
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
        style={{ position: 'absolute', left: `${currentStep * stepSize}px`, bottom: `${previewHeight}px` }}
      />
    )
  }
  if (durationLeft > 0) {
    labels.push(
      <div
        key={`label-tick-${duration}`}
        className="tick-mark"
        style={{ position: 'absolute', left: `${endPos}px`, bottom: `${previewHeight + 4}px` }}
      />,
      <div
        key={`label-${duration}`}
        className="label"
        style={{ position: 'absolute', left: `${endPos - stepSize * 2}px`, bottom: `${previewHeight + 4}px` }}
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
  if (endAt !== undefined && currentTime > endAt) {
    previousTime = endAt
  } else if (startFrom !== undefined && currentTime > startFrom) {
    previousTime = startFrom
  } else if (currentTime !== 0) {
    previousTime = 0
  }
  let nextTime: number | undefined = undefined
  if (startFrom !== undefined && currentTime < startFrom) {
    nextTime = startFrom
  } else if (endAt !== undefined && currentTime < endAt) {
    nextTime = endAt
  }
  const canStartHere = (endAt === undefined || endAt > currentTime) && startFrom !== currentTime
  const canEndHere = (startFrom === undefined || startFrom < currentTime) && endAt !== currentTime

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
    if (startFromChecked) {
      await window.api.video.setStartFrom(video.uuid, undefined)
    } else {
      console.log('current time: ' + Strings.humanDuration(currentTime))
      await window.api.video.setStartFrom(video.uuid, currentTime)
    }
  }

  const handleSetEndAt = async () => {
    if (endAtChecked) {
      await window.api.video.setEndAt(video.uuid, undefined)
    } else {
      await window.api.video.setEndAt(video.uuid, currentTime)
    }
  }

  const handleRemovePart = async () => {
    if (mainVideoUuid !== undefined) {
      await window.api.video.removePart(mainVideoUuid, video.uuid)
    }
  }

  const handleMouseMoveOverScrollable = useCallback(
    (event: MouseEvent) => {
      if (rulerRef.current != null) {
        const sp = event.clientX - rulerRef.current.getBoundingClientRect().left
        setSelPosX(sp < 0 ? 0 : sp > endPos ? endPos : sp)
      }
    },
    [endPos]
  )

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

  const posX = (currentTime * stepSize) / step
  const startVideoPercent = ((startFrom === undefined ? 0 : startFrom) * 100) / duration
  const endVideoPercent = ((endAt === undefined ? duration : endAt) * 100) / duration

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
          <Tooltip
            content={mainVideoUuid === undefined ? "Main video can't be removed here" : 'Remove this video part'}
            relationship="description"
          >
            <Button
              size="small"
              appearance="subtle"
              onClick={handleRemovePart}
              icon={<SubtractSquareRegular />}
              disabled={mainVideoUuid === undefined}
            />
          </Tooltip>
          <Tooltip
            content={startFromChecked ? 'Unset video start time' : 'Set video start time to current position'}
            relationship="description"
          >
            <ToggleButton
              size="small"
              checked={startFromChecked}
              appearance="subtle"
              onClick={handleSetStartFrom}
              icon={
                startFromChecked ? (
                  <div className="hide-first-half">
                    <FilmstripSplitFilled />
                  </div>
                ) : (
                  <div className="hide-first-half">
                    <FilmstripSplitRegular />
                  </div>
                )
              }
              disabled={(!startFromChecked && !canStartHere) || video.status === 'Loading'}
            />
          </Tooltip>
          <Tooltip
            content={endAtChecked ? 'Unset video end time' : 'Set video end time to current position'}
            relationship="description"
          >
            <ToggleButton
              size="small"
              checked={endAtChecked}
              appearance="subtle"
              onClick={handleSetEndAt}
              icon={
                endAtChecked ? (
                  <div className="hide-second-half">
                    <FilmstripSplitFilled />
                  </div>
                ) : (
                  <div className="hide-second-half">
                    <FilmstripSplitRegular />
                  </div>
                )
              }
              disabled={(!endAtChecked && !canEndHere) || video.status === 'Loading'}
            />
          </Tooltip>
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
          onClick={() => selPosX !== undefined && localSeekTo((selPosX * step) / stepSize)}
        >
          {labels}
          {tickMarks}
          <div
            className="preview"
            style={{
              width: `${endPos}px`,
              background: video.snapshots?.snapshotsPath
                ? `url('${'svp:///' + video.snapshots.snapshotsPath.replaceAll('\\', '/')}') 0% 0% / auto 100%`
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
          {startFrom !== undefined && <Delimitation time={startFrom} posX={(startFrom * stepSize) / step} />}
          {endAt !== undefined && <Delimitation time={endAt} posX={(endAt * stepSize) / step} end />}
          <PlayHead currentTime={currentTime} posX={posX} />
          <PlayHead selection posX={selPosX} />
        </div>
      </div>
    </div>
  )
}
VideoSectionSelectorField.displayName = 'VideoSectionSelectorField'

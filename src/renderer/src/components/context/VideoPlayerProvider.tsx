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

import React, { Dispatch, useCallback, useState } from 'react'
import { IVideo } from '../../../../common/@types/Video'
import { VideoPlayerContext } from '@renderer/components/context/VideoPlayerContext'

export type VideoPlayerContextType = {
  videoPlayerOpened: boolean
  setVideoPlayerOpened: Dispatch<boolean>
  videoPlayed: IVideo | undefined
  setVideoPlayed: Dispatch<IVideo | undefined>
  setVideoRef: Dispatch<React.RefObject<HTMLVideoElement>>
  seekTo: (position: number) => void
  pause: () => void
  play: () => Promise<void>
}

type props = {
  children: React.ReactNode
}

export function VideoPlayerProvider({ children }: props) {
  const [videoPlayerOpened, setVideoPlayerOpened] = useState(false)
  const [videoPlayed, setVideoPlayed] = useState<IVideo | undefined>(undefined)
  const [videoRef, setVideoRefState] = useState<React.RefObject<HTMLVideoElement> | null>(null)

  const setVideoRef = useCallback((ref: React.RefObject<HTMLVideoElement>) => {
    setVideoRefState(ref)
  }, [])

  const seekTo = useCallback(
    (time: number) => {
      if (videoRef?.current) {
        videoRef.current.currentTime = time
      }
    },
    [videoRef]
  )

  const pause = useCallback(() => {
    if (videoRef?.current) {
      videoRef.current.pause()
    }
  }, [videoRef])

  const play = useCallback(() => {
    if (videoRef?.current) {
      return videoRef.current.play()
    }
    return Promise.reject("can't play!")
  }, [videoRef])

  return (
    <VideoPlayerContext.Provider
      value={{ videoPlayerOpened, setVideoPlayerOpened, videoPlayed, setVideoPlayed, setVideoRef, seekTo, pause, play }}
    >
      {children}
    </VideoPlayerContext.Provider>
  )
}

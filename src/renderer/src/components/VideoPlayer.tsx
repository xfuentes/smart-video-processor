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

import { useEffect, useState } from 'react'
import HlsVideoPlayer from '@renderer/components/fields/HlsVideoPlayer'
import { useVideoPlayer } from '@renderer/components/context/VideoPlayerContext'
import { Field, ProgressBar } from '@fluentui/react-components'

export const VideoPlayer = () => {
  const { videoPlayed, videoPlayerCurrentTime } = useVideoPlayer()
  const [previewPath, setPreviewPath] = useState<string | undefined>(videoPlayed?.previewPath)

  useEffect(() => {
    if (videoPlayed && videoPlayed.previewPath === undefined && videoPlayed.previewProgression === undefined) {
      void window.api.video.preparePreview(videoPlayed.uuid)
    }
  }, [videoPlayed])

  useEffect(() => {
    setPreviewPath(videoPlayed?.previewPath?.replaceAll('\\', '/'))
  }, [videoPlayed?.previewPath])

  const progression = videoPlayed?.previewProgression?.progress
  return (
    <>
      <div className="player-loading">
        {previewPath ? (
          <HlsVideoPlayer src={`svp-stream:///${previewPath}`} autoPlay={true} startAt={videoPlayerCurrentTime} />
        ) : (
          <Field
            validationState="none"
            validationMessage={{ children: 'Generating preview...', style: { color: 'white' } }}
            style={{ width: '50%' }}
            color="white"
          >
            <ProgressBar thickness="large" value={progression} />
          </Field>
        )}
      </div>
    </>
  )
}

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
import { Spinner } from '@fluentui/react-components'

export const VideoPlayer = () => {
  const { videoPlayed } = useVideoPlayer()
  const [previewPath, setPreviewPath] = useState<string | undefined>(videoPlayed?.previewPath)

  useEffect(() => {
    if (videoPlayed && videoPlayed.previewPath === undefined && videoPlayed.previewProgression === undefined) {
      console.log('preparing preview')
      void window.api.video.preparePreview(videoPlayed.uuid).then((previewPath) => {
        setPreviewPath(previewPath)
      })
    }
  }, [videoPlayed])

  return (
    <>
      <div className="player-loading">
        {previewPath ? (
          <HlsVideoPlayer src={`svp-stream://${previewPath}`} autoPlay={true} />
        ) : (
          <div className="player-loading">
            <Spinner label="Loading..." size="medium" />
          </div>
        )}
      </div>
    </>
  )
}

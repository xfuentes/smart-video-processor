/*
 * Smart Video Processor
 * Copyright (c) 2025. Xavier Fuentes <xfuentes-dev@serviam.cc>
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

import { useEffect, useMemo } from 'react'
import HlsVideoPlayer from '@renderer/components/fields/HlsVideoPlayer'
import { useVideoPlayer } from '@renderer/components/context/VideoPlayerContext'
import { useI18n } from '../i18n'
import { Field, ProgressBar } from '@fluentui/react-components'

export const VideoPlayer = () => {
  const _ = useI18n()

  const { videoPlayed, videoPlayerCurrentTime } = useVideoPlayer()
  const previewPath = useMemo(() => videoPlayed?.previewPath?.replaceAll('\\', '/'), [videoPlayed?.previewPath])
  const src = useMemo(() => (previewPath ? `svp-stream:///${previewPath}` : ''), [previewPath])

  useEffect(() => {
    if (videoPlayed && videoPlayed.previewPath === undefined && videoPlayed.previewProgression === undefined) {
      void window.api.video.preparePreview(videoPlayed.uuid)
    }
  }, [videoPlayed])

  const progression = videoPlayed?.previewProgression?.progress
  return (
    <>
      <div className="player-loading">
        {previewPath ? (
          <HlsVideoPlayer src={src} autoPlay={true} startAt={videoPlayerCurrentTime} />
        ) : (
          <Field
            validationState="none"
            validationMessage={{
              children: _('video_player.generating_preview', { defaultValue: 'Generating preview...' }),
              style: { color: 'white' }
            }}
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

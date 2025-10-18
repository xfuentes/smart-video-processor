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

import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTrigger
} from '@fluentui/react-components'
import React, { useEffect, useState } from 'react'
import { FilmstripPlayRegular } from '@fluentui/react-icons'
import { ProgressButton } from '@renderer/components/ProgressButton'
import { IVideo } from '../../../common/@types/Video'
import VideoPlayer from '@renderer/components/fields/VideoPlayer'

type Props = {
  video: IVideo
  onPositionSecondsChange?: (positionSeconds: number) => void
}

export const VideoPlayerDialog = ({ video, onPositionSecondsChange }: Props) => {
  const [opened, setOpened] = useState(false)
  const [positionSeconds, setPositionSeconds] = useState(0)
  const [previewPath, setPreviewPath] = useState<string | undefined>(video.previewPath)

  useEffect(() => {
    if (video.previewPath === undefined && video.previewProgression === undefined) {
      console.log('preparing preview')
      void window.api.video.preparePreview(video.uuid).then((previewPath) => {
        setPreviewPath(previewPath)
      })
    }
  }, [])

  const handleOpenChange = (_event, data) => {
    setOpened(data.open)
  }

  const handleSubmit = async () => {
    onPositionSecondsChange && onPositionSecondsChange(positionSeconds)
  }

  const handleCancel = (_ev: React.FormEvent) => {
    setPositionSeconds(0)
    setOpened(false)
  }

  console.log(video.previewProgression)
  console.log(video.previewPath)
  return (
    <Dialog modalType="modal" open={opened} onOpenChange={handleOpenChange}>
      <DialogTrigger>
        <Button size="small" icon={<FilmstripPlayRegular />} />
      </DialogTrigger>
      <DialogSurface
        aria-label="Select a position in the video"
        style={{ padding: '5px', minHeight: '500px', display: 'flex', flexFlow: 'column' }}
      >
        <form
          style={{
            height: '100%',
            flexGrow: 1,
            display: 'flex',
            flexFlow: 'column',
            padding: '5px'
          }}
        >
          <DialogBody style={{ gap: 0, flexGrow: 1 }}>
            <DialogContent className="settings-dialog">
              <div style={{ flexGrow: '1', overflow: 'auto', display: 'flex', flexFlow: 'column' }}>
                {previewPath && <VideoPlayer src={`svp-stream://${previewPath}`} autoPlay={true} />}
              </div>
            </DialogContent>
            <DialogActions style={{ paddingTop: '10px' }}>
              <DialogTrigger disableButtonEnhancement>
                <ProgressButton appearance="primary" execute={handleSubmit}>
                  Use Current Position
                </ProgressButton>
              </DialogTrigger>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
              </DialogTrigger>
            </DialogActions>
          </DialogBody>
        </form>
      </DialogSurface>
    </Dialog>
  )
}

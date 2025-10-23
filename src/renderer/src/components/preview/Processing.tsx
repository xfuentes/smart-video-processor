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
import { Button, Divider } from '@fluentui/react-components'
import { MoviesAndTvRegular } from '@fluentui/react-icons'
import { VideoSectionSelectorField } from '@renderer/components/fields/VideoSectionSelectorField'

type Props = {
  video: IVideo
  disabled: boolean
}

export const Processing = ({ video, disabled = false }: Props) => {
  return (
    <>
      <div className="processing-body">
        <div className="ruler">
          <Divider style={{ flexGrow: '0' }}>Main Video File</Divider>
          <VideoSectionSelectorField video={video} disabled={disabled} />
          {video.videoParts.map((part, i) => (
            <>
              <Divider style={{ flexGrow: '0' }}>Part {i + 1}</Divider>
              <VideoSectionSelectorField key={part.uuid} video={part} disabled={disabled} />
            </>
          ))}
        </div>
      </div>
      <Divider style={{ flexGrow: '0' }} />
      <div className="preview-buttons">
        <div className="button">
          <Button
            size={'medium'}
            appearance="secondary"
            icon={<MoviesAndTvRegular />}
            disabled={disabled}
            onClick={() => void window.api.video.addPart(video.uuid)}
          >
            Add Video Part
          </Button>
        </div>
      </div>
    </>
  )
}

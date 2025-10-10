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
import { Button, Divider, Field } from '@fluentui/react-components'
import { TimePicker } from '@fluentui/react-timepicker-compat'
import { MoviesAndTvRegular, SaveRegular } from '@fluentui/react-icons'
import { useState } from 'react'
import { IProcess } from '../../../../common/Process'
import { TrackType } from '../../../../common/@types/Track'
import { Strings } from '../../../../common/Strings'

type Props = {
  video: IVideo
  disabled?: boolean
}

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

export const Processing = ({ video, disabled }: Props) => {
  const [processes, setProcesses] = useState<IProcess[]>([
    {
      inputID: 0,
      startFrom: '00:00:00',
      endAt: Strings.humanDuration(video.tracks.find((t) => t.type === TrackType.VIDEO)?.duration ?? 0)
    }
  ])
  const endHour = Number.parseInt(processes[0].endAt.split(':')[0] ?? 0) + 1
  console.log('End Hour: ' + endHour)
  return (
    <>
      <div style={{ height: '100%', width: '100%', backgroundColor: '#fff', flexGrow: 1, overflow: 'auto' }}>
        <Divider style={{ flexGrow: '0' }}>Input File 0</Divider>
        <div className="encoding-form">
          <Field label="Start From">
            <TimePicker
              size={'small'}
              disabled={disabled}
              value={processes[0].startFrom}
              showSeconds
              dateAnchor={new Date(1000)}
              endHour={endHour as Hour}
            />
          </Field>
          <Field label="End At">
            <TimePicker
              size={'small'}
              disabled={disabled}
              value={processes[0].endAt}
              showSeconds
              dateAnchor={new Date(1000)}
              endHour={endHour as Hour}
            />
          </Field>
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
            onClick={() => {
              const videoPartProcess: IProcess = window.api.video.addPart(video.uuid)
              setProcesses((prevProcesses) => [...prevProcesses, videoPartProcess])
            }
            }
          >
            Add Video Part
          </Button>
        </div>
        <div className="button">
          <Button
            size={'medium'}
            appearance="primary"
            icon={<SaveRegular />}
            disabled={disabled}
            onClick={() => void window.api.video.process(video.uuid)}
          >
            Apply
          </Button>
        </div>
      </div>
    </>
  )
}

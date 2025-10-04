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
  createTableColumn,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridProps,
  DataGridRow,
  OnSelectionChangeData,
  TableColumnDefinition,
  TableColumnSizingOptions
} from '@fluentui/react-components'
import {
  bitrateRenderer,
  booleanRenderer,
  codecRenderer,
  durationRenderer,
  framesRenderer,
  sizeRenderer,
  trackPropertiesRenderer,
  trackTypeRenderer
} from './renderers'
import React from 'react'
import xor from 'lodash/xor'
import { ITrack } from '../../../../common/@types/Track'
import { IVideo } from '../../../../common/@types/Video'

const columns: TableColumnDefinition<ITrack>[] = [
  createTableColumn<ITrack>({
    columnId: 'id',
    compare: (a, b) => a.id - b.id,
    renderHeaderCell: () => 'ID',
    renderCell: (item) => item.id
  }),
  createTableColumn<ITrack>({
    columnId: 'type',
    compare: (a, b) => a.type.localeCompare(b.type),
    renderHeaderCell: () => 'Type',
    renderCell: (item) => trackTypeRenderer(item.type)
  }),
  createTableColumn<ITrack>({
    columnId: 'language',
    compare: (a, b) => (a.language ?? 'und').localeCompare(b.language ?? 'und'),
    renderHeaderCell: () => 'Language',
    renderCell: (item) => item.language
  }),
  createTableColumn<ITrack>({
    columnId: 'name',
    compare: (a, b) => a.name.localeCompare(b.name),
    renderHeaderCell: () => 'Name',
    renderCell: (item) => <div className="overflow-safe">{item.name}</div>
  }),
  createTableColumn<ITrack>({
    columnId: 'codec',
    compare: (a, b) => a.codec.localeCompare(b.codec),
    renderHeaderCell: () => 'Codec',
    renderCell: (item) => <div className="overflow-safe">{codecRenderer(item.codec)}</div>
  }),
  createTableColumn<ITrack>({
    columnId: 'bitrate',
    compare: (a, b) => (a.properties.bitRate ?? -1) - (b.properties.bitRate ?? -1),
    renderHeaderCell: () => 'Bitrate',
    renderCell: (item) => bitrateRenderer(item.properties.bitRate)
  }),
  createTableColumn<ITrack>({
    columnId: 'properties',
    renderHeaderCell: () => 'Properties',
    renderCell: (item) => <div className="overflow-safe">{trackPropertiesRenderer(item.properties)}</div>
  }),
  createTableColumn<ITrack>({
    columnId: 'default',
    compare: (a, b) => (a.default ? 1 : 0) - (b.default ? 1 : 0),
    renderHeaderCell: () => 'Default',
    renderCell: (item) => booleanRenderer(item.default)
  }),
  createTableColumn<ITrack>({
    columnId: 'forced',
    compare: (a, b) => (a.forced ? 1 : 0) - (b.forced ? 1 : 0),
    renderHeaderCell: () => 'Forced',
    renderCell: (item) => booleanRenderer(item.forced)
  }),
  createTableColumn<ITrack>({
    columnId: 'duration',
    compare: (a, b) => (a.duration ? a.duration : -1) - (b.duration ? b.duration : -1),
    renderHeaderCell: () => 'Duration',
    renderCell: (item) => durationRenderer(item.duration)
  }),
  createTableColumn<ITrack>({
    columnId: 'frames',
    compare: (a, b) => (a.properties.frames ?? -1) - (b.properties.frames ?? -1),
    renderHeaderCell: () => 'Frames',
    renderCell: (item) => framesRenderer(item.properties.frames)
  }),
  createTableColumn<ITrack>({
    columnId: 'size',
    compare: (a, b) => (a.size ?? -1) - (b.size ?? -1),
    renderHeaderCell: () => 'Size',
    renderCell: (item) => sizeRenderer(item.size)
  })
]

type Props = {
  video: IVideo,
  disabled?: boolean
}

const columnSizingOptions: TableColumnSizingOptions = {
  id: { defaultWidth: 18, minWidth: 18, idealWidth: 18 },
  type: { defaultWidth: 22, minWidth: 22, idealWidth: 22 },
  language: { defaultWidth: 50, minWidth: 50, idealWidth: 50 },
  name: { defaultWidth: 100, minWidth: 30, idealWidth: 800 },
  codec: { defaultWidth: 450, minWidth: 120, idealWidth: 250 },
  bitrate: { defaultWidth: 100, minWidth: 70, idealWidth: 100 },
  properties: { defaultWidth: 250, minWidth: 110, idealWidth: 250 },
  default: { defaultWidth: 40, minWidth: 40, idealWidth: 40 },
  forced: { defaultWidth: 40, minWidth: 40, idealWidth: 40 },
  duration: { defaultWidth: 80, minWidth: 50, idealWidth: 80 },
  frames: { defaultWidth: 80, minWidth: 40, idealWidth: 80 },
  size: { defaultWidth: 100, minWidth: 70, idealWidth: 100 }
}

export const TrackList = ({ video, disabled }: Props) => {
  const handleSelectionChange: DataGridProps['onSelectionChange'] = async (
    _e: React.KeyboardEvent | React.MouseEvent<Element, MouseEvent>,
    data: OnSelectionChangeData
  ) => {
    const changedItems = xor(Array.from(selectedItems), Array.from(data.selectedItems as Set<number>))
    await window.api.video.switchTrackSelection(video.uuid, changedItems)
  }

  const selectedItems = new Set<number>(video.tracks.filter((t) => t.copy).map((t) => t.id))

  return (
    <div className="mask-parent">
      <div>
        <DataGrid
          items={video.tracks}
          columns={columns}
          getRowId={(item: ITrack) => item.id}
          focusMode="composite"
          resizableColumns
          columnSizingOptions={columnSizingOptions}
          size="extra-small"
          selectionMode="multiselect"
          selectedItems={selectedItems}
          onSelectionChange={handleSelectionChange}
        >
          <DataGridHeader>
            <DataGridRow>
              {({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody<IVideo>>
            {({ item, rowId }) => (
              <DataGridRow<IVideo> key={rowId}>
                {({ renderCell }) => (
                  <DataGridCell as={'div'} className={'cell'}>
                    {renderCell(item)}
                  </DataGridCell>
                )}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      </div>
      {disabled === true && <div className="mask" />}
    </div>
  )
}

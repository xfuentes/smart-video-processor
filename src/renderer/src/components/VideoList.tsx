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
  SelectionItemId,
  TableColumnDefinition,
  TableColumnSizingOptions
} from '@fluentui/react-components'
import { progressRenderer, qualityRenderer, sizeRenderer, statusRenderer } from './preview/renderers'
import React, { useEffect, useState } from 'react'
import xor from 'lodash/xor'
import { Strings } from '../../../common/Strings'
import { IVideo } from '../../../common/@types/Video'

const columns: TableColumnDefinition<IVideo>[] = [
  createTableColumn<IVideo>({
    columnId: 'filename',
    compare: (a, b) => a.filename.localeCompare(b.filename),
    renderHeaderCell: () => 'File',
    renderCell: (item) => (
      <div style={{ width: '100%' }}>
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.filename}</div>
        {progressRenderer(item)}
      </div>
    )
  }),
  createTableColumn<IVideo>({
    columnId: 'size',
    compare: (a, b) => a.size - b.size,
    renderHeaderCell: () => 'Size',
    renderCell: (item) => sizeRenderer(item.size)
  }),
  createTableColumn<IVideo>({
    columnId: 'quality',
    compare: (a, b) => {
      const aPixels = a.pixels
      const bPixels = b.pixels
      const aIndex = aPixels != undefined ? Strings.pixelsToQuality(aPixels).index : 0
      const bIndex = bPixels != undefined ? Strings.pixelsToQuality(bPixels).index : 0
      return aIndex - bIndex
    },
    renderHeaderCell: () => 'Quality',
    renderCell: (item) => qualityRenderer(item.pixels)
  }),
  createTableColumn<IVideo>({
    columnId: 'status',
    compare: (a, b) => a.status.localeCompare(b.status),
    renderHeaderCell: () => 'Status',
    renderCell: (item) => <div>{statusRenderer(item.status, item.message)}</div>
  })
]

type Props = {
  videos: IVideo[]
  onSelectionChange?: (selection: IVideo[] | undefined) => void
  onImportVideos: (files: File[]) => void
}

const columnSizingOptions: TableColumnSizingOptions = {
  filename: { defaultWidth: 800, minWidth: 40, idealWidth: 4000 },
  size: { defaultWidth: 80, minWidth: 70, idealWidth: 80 },
  quality: { defaultWidth: 70, minWidth: 70, idealWidth: 70 },
  status: { minWidth: 100, idealWidth: 100, defaultWidth: 100 }
}

export const VideoList = ({ videos, onSelectionChange = undefined, onImportVideos }: Props) => {
  const [selectedItems, setSelectedItems] = useState(new Set<SelectionItemId>([]))

  const handleSelectionChange: DataGridProps['onSelectionChange'] = (
    e: React.KeyboardEvent | React.MouseEvent<Element, MouseEvent>,
    data: OnSelectionChangeData
  ) => {
    const changedItems = xor(Array.from(selectedItems), Array.from(data.selectedItems))
    let selItems: Set<SelectionItemId>
    if ((e.target as Element).localName === 'input') {
      selItems = data.selectedItems
    } else {
      selItems = new Set<SelectionItemId>(changedItems)
    }
    setSelectedItems(selItems)
    const selectedVideos = videos.filter((video) => selItems.has(video.uuid))
    if (onSelectionChange !== undefined) {
      console.log('selection changed!')
      onSelectionChange(selectedVideos)
    }
  }
  const handleDrop = (e: React.DragEvent) => {
    const files = Array.from(e.dataTransfer.files)
    onImportVideos(files)
  }
  const handleShortcuts = (event: React.KeyboardEvent) => {
    console.log(event)
  }

  useEffect(() => {
    const newSelectedItems: Set<SelectionItemId> = new Set()
    for (const item of selectedItems) {
      const video = videos.find((v) => v.uuid === item)
      if (video != undefined) {
        newSelectedItems.add(video.uuid)
      }
    }
    if (newSelectedItems.size !== selectedItems.size) {
      setSelectedItems(newSelectedItems)
      const selectedVideos = videos.filter((video) => newSelectedItems.has(video.uuid))
      if (onSelectionChange !== undefined) {
        onSelectionChange(selectedVideos)
      }
    }
  }, [selectedItems, videos, onSelectionChange])

  return (
    <div onDrop={handleDrop} style={{ height: '100%' }} onKeyUp={handleShortcuts} role={'none'}>
      <DataGrid
        items={videos}
        columns={columns}
        sortable
        selectedItems={selectedItems}
        onSelectionChange={handleSelectionChange}
        selectionMode="multiselect"
        getRowId={(item: IVideo) => item.uuid}
        focusMode="composite"
        resizableColumns
        columnSizingOptions={columnSizingOptions}
        size="extra-small"
      >
        <DataGridHeader>
          <DataGridRow
            selectionCell={{
              checkboxIndicator: { 'aria-label': 'Select all rows' }
            }}
          >
            {({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<IVideo>>
          {({ item, rowId }) => (
            <DataGridRow<IVideo>
              key={rowId}
              selectionCell={{
                checkboxIndicator: { 'aria-label': 'Select row' }
              }}
            >
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
  )
}

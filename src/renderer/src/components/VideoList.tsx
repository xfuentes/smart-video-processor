/*
 * Smart Video Processor
 * Copyright (c) 2025-2026. Xavier Fuentes <xfuentes-dev@serviam.cc>
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
import React, { useMemo, useRef, useState } from 'react'
import { Strings } from '../../../common/Strings'
import { DropZone } from '@renderer/components/DropZone'
import _ from 'lodash'
import { _ as t } from '../i18n'
import { IVideo, IVideoListItem, videoListItemKeys } from '../../../common/@types/Video'

const columns: TableColumnDefinition<IVideoListItem>[] = [
  createTableColumn<IVideoListItem>({
    columnId: 'filename',
    compare: (a, b) => a.filename.localeCompare(b.filename),
    renderHeaderCell: () => t('video_list.column.filename', { defaultValue: 'File' }),
    renderCell: (item) => (
      <div style={{ width: '100%' }}>
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{item.filename}</div>
        {progressRenderer(item.status, item.progression)}
      </div>
    )
  }),
  createTableColumn<IVideoListItem>({
    columnId: 'size',
    compare: (a, b) => a.size - b.size,
    renderHeaderCell: () => t('video_list.column.size', { defaultValue: 'Size' }),
    renderCell: (item) => sizeRenderer(item.size)
  }),
  createTableColumn<IVideoListItem>({
    columnId: 'quality',
    compare: (a, b) => {
      const aPixels = a.pixels
      const bPixels = b.pixels
      const aIndex = aPixels != undefined ? Strings.pixelsToQuality(aPixels).index : 0
      const bIndex = bPixels != undefined ? Strings.pixelsToQuality(bPixels).index : 0
      return aIndex - bIndex
    },
    renderHeaderCell: () => t('video_list.column.quality', { defaultValue: 'Quality' }),
    renderCell: (item) => qualityRenderer(item.pixels)
  }),
  createTableColumn<IVideoListItem>({
    columnId: 'status',
    compare: (a, b) => a.status.localeCompare(b.status),
    renderHeaderCell: () => t('video_list.column.status', { defaultValue: 'Status' }),
    renderCell: (item) => <div>{statusRenderer(item.status, item.message)}</div>
  })
]

type Props = {
  videos: IVideo[]
  onSelectionChange?: (selection: IVideo[]) => void
  onImportVideos: (files: File[]) => void
}

const columnSizingOptions: TableColumnSizingOptions = {
  filename: { defaultWidth: 800, minWidth: 40, idealWidth: 4000 },
  size: { defaultWidth: 80, minWidth: 70, idealWidth: 80 },
  quality: { defaultWidth: 70, minWidth: 70, idealWidth: 70 },
  status: { minWidth: 100, idealWidth: 100, defaultWidth: 100 }
}

export const VideoList = ({ videos, onSelectionChange = undefined, onImportVideos }: Props) => {
  const [requestedItems, setSelectedItems] = useState(new Set<SelectionItemId>([]))
  const [videoListItems, setVideoListItems] = useState<IVideoListItem[]>([])
  const [previousVideos, setPreviousVideos] = useState<IVideo[]>()
  const [sortState, setSortState] = useState<DataGridProps['sortState']>()
  const anchorId = useRef<SelectionItemId>()

  // The list items are derived while rendering, keeping the same array when nothing displayed has changed.
  if (videos !== previousVideos) {
    setPreviousVideos(videos)
    const newVideoListItems = videos.map((video) => _.pick(video, videoListItemKeys) as IVideoListItem)
    setVideoListItems((prevVideoListItems) =>
      _.isEqual(newVideoListItems, prevVideoListItems) ? prevVideoListItems : newVideoListItems
    )
  }

  // Videos removed from the list drop out of the selection, the parent prunes its own copy on list changes.
  const selectedItems = useMemo(() => {
    const videoIds = new Set(videos.map((video) => video.uuid))
    const remaining = new Set([...requestedItems].filter((id) => videoIds.has(id as string)))
    return remaining.size === requestedItems.size ? requestedItems : remaining
  }, [requestedItems, videos])

  const applySelection = (selItems: Set<SelectionItemId>) => {
    setSelectedItems(selItems)
    if (onSelectionChange !== undefined) {
      onSelectionChange(videos.filter((video) => selItems.has(video.uuid)))
    }
  }

  const getDisplayedIds = (): SelectionItemId[] => {
    const sorted = [...videoListItems]
    if (sortState) {
      const column = columns.find((c) => c.columnId === sortState.sortColumn)
      if (column) {
        const direction = sortState.sortDirection === 'descending' ? -1 : 1
        sorted.sort((a, b) => direction * column.compare(a, b))
      }
    }
    return sorted.map((item) => item.uuid)
  }

  // Checkbox and select-all clicks are handled by the grid, row clicks by handleRowClick.
  const handleSelectionChange: DataGridProps['onSelectionChange'] = (
    e: React.KeyboardEvent | React.MouseEvent<Element, MouseEvent>,
    data: OnSelectionChangeData
  ) => {
    const isRowClick = e.type === 'click' && (e.target as Element).localName !== 'input'
    if (!isRowClick) {
      anchorId.current = undefined
      applySelection(data.selectedItems)
    }
  }

  const handleRowClick = (e: React.MouseEvent, rowId: SelectionItemId) => {
    if ((e.target as Element).localName === 'input') {
      return
    }
    const toggle = e.ctrlKey || e.metaKey
    if (e.shiftKey && anchorId.current !== undefined) {
      const ids = getDisplayedIds()
      const from = ids.indexOf(anchorId.current)
      const to = ids.indexOf(rowId)
      if (from !== -1 && to !== -1) {
        const range = ids.slice(Math.min(from, to), Math.max(from, to) + 1)
        applySelection(new Set<SelectionItemId>(toggle ? [...selectedItems, ...range] : range))
        return
      }
    }
    anchorId.current = rowId
    if (toggle) {
      const newSelection = new Set<SelectionItemId>(selectedItems)
      if (!newSelection.delete(rowId)) {
        newSelection.add(rowId)
      }
      applySelection(newSelection)
    } else {
      applySelection(new Set<SelectionItemId>([rowId]))
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
      event.preventDefault()
      applySelection(new Set<SelectionItemId>(videoListItems.map((item) => item.uuid)))
    } else if (event.key === 'Escape') {
      applySelection(new Set<SelectionItemId>())
    }
  }

  return (
    <DropZone onDropFiles={onImportVideos} style={{ minHeight: '100%' }} onKeyDown={handleKeyDown}>
      <DataGrid
        items={videoListItems}
        columns={columns}
        sortable
        onSortChange={(_e, state) => setSortState(state)}
        selectedItems={selectedItems}
        onSelectionChange={handleSelectionChange}
        selectionMode="multiselect"
        getRowId={(item: IVideoListItem) => item.uuid}
        focusMode="composite"
        resizableColumns
        columnSizingOptions={columnSizingOptions}
        size="extra-small"
        style={{ userSelect: 'none' }}
      >
        <DataGridHeader>
          <DataGridRow
            selectionCell={{
              checkboxIndicator: {
                'aria-label': t('video_list.aria_label.select_all_rows', { defaultValue: 'Select all rows' })
              }
            }}
          >
            {({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
          </DataGridRow>
        </DataGridHeader>
        <DataGridBody<IVideoListItem>>
          {({ item, rowId }) => (
            <DataGridRow<IVideoListItem>
              key={rowId}
              onClick={(e: React.MouseEvent) => handleRowClick(e, rowId)}
              selectionCell={{
                checkboxIndicator: {
                  'aria-label': t('video_list.aria_label.select_row', { defaultValue: 'Select row' })
                }
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
    </DropZone>
  )
}

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

import {
  Button,
  createTableColumn,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridProps,
  DataGridRow,
  Divider,
  Input,
  OnSelectionChangeData,
  Spinner,
  TableColumnDefinition,
  TableColumnSizingOptions,
  Text,
  Tooltip
} from '@fluentui/react-components'
import { DismissRegular, DocumentAddRegular } from '@fluentui/react-icons'
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
import { EllipsisCell } from '../EllipsisCell'
import xor from 'lodash/xor'
import { ITrack } from '../../../../common/@types/Track'
import { IExternalSource, IVideo } from '../../../../common/@types/Video'
import { _, useI18n } from '../../i18n'
import { DropZone } from '@renderer/components/DropZone'

const columns: TableColumnDefinition<ITrack>[] = [
  createTableColumn<ITrack>({
    columnId: 'id',
    compare: (a, b) => a.id - b.id,
    renderHeaderCell: () => _('track_list.column.id.label', { defaultValue: 'ID' }),
    renderCell: (item) => item.id
  }),
  createTableColumn<ITrack>({
    columnId: 'type',
    compare: (a, b) => a.type.localeCompare(b.type),
    renderHeaderCell: () => _('track_list.column.type.label', { defaultValue: 'Type' }),
    renderCell: (item) => trackTypeRenderer(item.type)
  }),
  createTableColumn<ITrack>({
    columnId: 'language',
    compare: (a, b) => (a.language ?? 'und').localeCompare(b.language ?? 'und'),
    renderHeaderCell: () => _('track_list.column.language.label', { defaultValue: 'Language' }),
    renderCell: (item) => item.language
  }),
  createTableColumn<ITrack>({
    columnId: 'name',
    compare: (a, b) => a.name.localeCompare(b.name),
    renderHeaderCell: () => _('track_list.column.name.label', { defaultValue: 'Name' }),
    renderCell: (item) => <EllipsisCell>{item.name}</EllipsisCell>
  }),
  createTableColumn<ITrack>({
    columnId: 'codec',
    compare: (a, b) => a.codec.localeCompare(b.codec),
    renderHeaderCell: () => _('track_list.column.codec.label', { defaultValue: 'Codec' }),
    renderCell: (item) => <EllipsisCell>{codecRenderer(item.codec)}</EllipsisCell>
  }),
  createTableColumn<ITrack>({
    columnId: 'bitrate',
    compare: (a, b) => (a.properties.bitRate ?? -1) - (b.properties.bitRate ?? -1),
    renderHeaderCell: () => _('track_list.column.bitrate.label', { defaultValue: 'Bitrate' }),
    renderCell: (item) => bitrateRenderer(item.properties.bitRate)
  }),
  createTableColumn<ITrack>({
    columnId: 'properties',
    renderHeaderCell: () => _('track_list.column.properties.label', { defaultValue: 'Properties' }),
    renderCell: (item) => <EllipsisCell>{trackPropertiesRenderer(item.properties)}</EllipsisCell>
  }),
  createTableColumn<ITrack>({
    columnId: 'default',
    compare: (a, b) => (a.default ? 1 : 0) - (b.default ? 1 : 0),
    renderHeaderCell: () => _('track_list.column.default.label', { defaultValue: 'Default' }),
    renderCell: (item) => booleanRenderer(item.default)
  }),
  createTableColumn<ITrack>({
    columnId: 'forced',
    compare: (a, b) => (a.forced ? 1 : 0) - (b.forced ? 1 : 0),
    renderHeaderCell: () => _('track_list.column.forced.label', { defaultValue: 'Forced' }),
    renderCell: (item) => booleanRenderer(item.forced)
  }),
  createTableColumn<ITrack>({
    columnId: 'duration',
    compare: (a, b) => (a.duration ? a.duration : -1) - (b.duration ? b.duration : -1),
    renderHeaderCell: () => _('track_list.column.duration.label', { defaultValue: 'Duration' }),
    renderCell: (item) => durationRenderer(item.duration)
  }),
  createTableColumn<ITrack>({
    columnId: 'frames',
    compare: (a, b) => (a.properties.frames ?? -1) - (b.properties.frames ?? -1),
    renderHeaderCell: () => _('track_list.column.frames.label', { defaultValue: 'Frames' }),
    renderCell: (item) => framesRenderer(item.properties.frames)
  }),
  createTableColumn<ITrack>({
    columnId: 'size',
    compare: (a, b) => (a.size ?? -1) - (b.size ?? -1),
    renderHeaderCell: () => _('track_list.column.size.label', { defaultValue: 'Size' }),
    renderCell: (item) => sizeRenderer(item.size)
  })
]

type Props = {
  video: IVideo
  disabled?: boolean
}

const sourceColumn = (video: IVideo) =>
  createTableColumn<ITrack>({
    columnId: 'source',
    renderHeaderCell: () => _('track_list.column.source.label', { defaultValue: 'Source' }),
    renderCell: (item) => (
      <EllipsisCell>
        {video.externalSources.find((source) => source.uuid === item.externalSourceUuid)?.filename ?? ''}
      </EllipsisCell>
    )
  })

const externalSourceStatus = (video: IVideo, source: IExternalSource) => {
  if (source.analysing) {
    return (
      <Spinner
        size="extra-tiny"
        label={_('track_list.external.measuring', { defaultValue: 'Measuring the audio offset...' })}
      />
    )
  }
  if (!video.tracks.some((t) => t.externalSourceUuid === source.uuid)) {
    return _('track_list.external.no_tracks', {
      defaultValue: 'No audio or subtitle track could be imported from this file.'
    })
  }
  if (source.syncStatus === 'synced') {
    return _('track_list.external.synced', { defaultValue: 'The offset was measured automatically.' })
  }
  if (source.syncStatus === 'drift') {
    return _('track_list.external.drift', {
      defaultValue:
        'This file plays at a different speed ({percent}%): its tracks will drift out of sync, this is not corrected yet.',
      percent: (((source.speedRatio ?? 1) - 1) * 100).toFixed(2)
    })
  }
  return _('track_list.external.unknown', { defaultValue: 'The offset could not be measured, set it manually.' })
}

type ExternalSourceRowProps = {
  video: IVideo
  source: IExternalSource
  disabled?: boolean
}

const ExternalSourceRow = ({ video, source, disabled }: ExternalSourceRowProps) => {
  const commitDelay = (value: string) => {
    const delayMs = Number(value)
    if (value.trim() !== '' && Number.isFinite(delayMs) && delayMs !== source.delayMs) {
      void window.api.video.setExternalSourceDelay(video.uuid, source.uuid, delayMs)
    }
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', columnGap: '8px', padding: '2px 5px' }}>
      <div style={{ minWidth: '60px', flex: '1 1 0' }}>
        <EllipsisCell>{source.filename}</EllipsisCell>
      </div>
      <Text size={200} style={{ flex: '2 1 0' }}>
        {externalSourceStatus(video, source)}
      </Text>
      <Text size={200}>{_('track_list.external.delay.label', { defaultValue: 'Delay (ms)' })}</Text>
      <Input
        key={source.delayMs}
        size="small"
        type="number"
        style={{ width: '100px' }}
        disabled={disabled || source.analysing}
        defaultValue={'' + source.delayMs}
        onBlur={(e) => commitDelay(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commitDelay((e.target as HTMLInputElement).value)
          }
        }}
      />
      <Button
        size="small"
        appearance="subtle"
        icon={<DismissRegular />}
        disabled={disabled}
        aria-label={_('track_list.external.remove', { defaultValue: 'Remove this file and its tracks' })}
        title={_('track_list.external.remove', { defaultValue: 'Remove this file and its tracks' })}
        onClick={() => void window.api.video.removeExternalSource(video.uuid, source.uuid)}
      />
    </div>
  )
}

const columnSizingOptions: TableColumnSizingOptions = {
  id: { defaultWidth: 18, minWidth: 18, idealWidth: 18 },
  type: { defaultWidth: 22, minWidth: 22, idealWidth: 22 },
  language: { defaultWidth: 50, minWidth: 50, idealWidth: 50 },
  name: { defaultWidth: 100, minWidth: 30, idealWidth: 800 },
  codec: { defaultWidth: 450, minWidth: 120, idealWidth: 250 },
  bitrate: { defaultWidth: 100, minWidth: 70, idealWidth: 100 },
  properties: { defaultWidth: 250, minWidth: 110, idealWidth: 250 },
  default: { defaultWidth: 80, minWidth: 80, idealWidth: 80 },
  forced: { defaultWidth: 60, minWidth: 60, idealWidth: 60 },
  duration: { defaultWidth: 80, minWidth: 50, idealWidth: 80 },
  frames: { defaultWidth: 80, minWidth: 40, idealWidth: 80 },
  size: { defaultWidth: 100, minWidth: 70, idealWidth: 100 },
  source: { defaultWidth: 150, minWidth: 60, idealWidth: 150 }
}

export const TrackList = ({ video, disabled }: Props) => {
  useI18n()
  const handleSelectionChange: DataGridProps['onSelectionChange'] = async (
    _e: React.KeyboardEvent | React.MouseEvent<Element, MouseEvent>,
    data: OnSelectionChangeData
  ) => {
    if (disabled) return
    const changedItems = xor(Array.from(selectedItems), Array.from(data.selectedItems as Set<number>))
    await window.api.video.switchTrackSelection(video.uuid, changedItems)
  }

  const selectedItems = new Set<number>(video.tracks.filter((t) => t.copy).map((t) => t.id))
  const displayedColumns = video.externalSources.length > 0 ? [...columns, sourceColumn(video)] : columns

  // Tracks imported from another file cannot be combined with video parts.
  const hasVideoParts = video.videoParts.length > 0
  // Files dropped on the tab provide additional tracks.
  const handleDropFiles = (files: File[]) => {
    if (!disabled && !hasVideoParts && files.length > 0) {
      void window.api.video.addExternalSources(video.uuid, files)
    }
  }

  return (
    <DropZone
      onDropFiles={handleDropFiles}
      style={{
        flexGrow: 1,
        minHeight: 0,
        display: 'flex',
        flexFlow: 'column nowrap',
        padding: '5px',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ flexGrow: 1, minHeight: 0, overflow: 'auto' }}>
        <div className="mask-parent">
          <div>
            <DataGrid
              key={displayedColumns.length}
              items={video.tracks}
              columns={displayedColumns}
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
                  {({ renderHeaderCell }) => (
                    <DataGridHeaderCell>
                      <span style={{ whiteSpace: 'nowrap' }}>{renderHeaderCell()}</span>
                    </DataGridHeaderCell>
                  )}
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
      </div>
      <Divider style={{ flexGrow: '0' }} />
      {video.externalSources.map((source) => (
        <ExternalSourceRow key={source.uuid} video={video} source={source} disabled={disabled} />
      ))}
      <div className="preview-buttons">
        <div className="button">
          <Tooltip
            content={
              hasVideoParts
                ? _('track_list.external.video_parts_tooltip', {
                    defaultValue: 'Not available when the video has additional parts.'
                  })
                : _('track_list.external.add_tooltip', { defaultValue: 'Add tracks from another file' })
            }
            relationship="description"
            withArrow
          >
            <span>
              <Button
                size="small"
                appearance="secondary"
                icon={<DocumentAddRegular />}
                disabled={disabled || hasVideoParts}
                onClick={() => void window.api.video.addExternalSource(video.uuid)}
              >
                {_('track_list.external.add_button', { defaultValue: 'Add Tracks' })}
              </Button>
            </span>
          </Tooltip>
        </div>
      </div>
    </DropZone>
  )
}

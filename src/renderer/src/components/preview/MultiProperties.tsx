/*
 * Smart Video Processor
 * Copyright (c) 2026. Xavier Fuentes <xfuentes-dev@serviam.cc>
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
  DataGridRow,
  TableColumnDefinition,
  TableColumnSizingOptions
} from '@fluentui/react-components'
import { useI18n } from '../../i18n'
import { IVideo } from '../../../../common/@types/Video'
import { Attachment, ChangePropertyValue, propertyTypes } from '../../../../common/Change'
import { EllipsisCell } from '../EllipsisCell'
import { MultipleValuesCell } from '../MultipleValuesCell'
import { attachmentRenderer, booleanRenderer } from './renderers'
import { ChangeGroup, groupChanges } from './changeGroups'

type Props = {
  videos: IVideo[]
}

const columnSizingOptions: TableColumnSizingOptions = {
  source: { minWidth: 100, idealWidth: 100 },
  type: { minWidth: 120, idealWidth: 120 },
  property: { minWidth: 140, idealWidth: 140 },
  currentValue: { minWidth: 150, idealWidth: 400 },
  newValue: { minWidth: 150, idealWidth: 400 },
  videos: { minWidth: 60, idealWidth: 60 }
}

const formatValue = (value: ChangePropertyValue | undefined) => {
  if (value === undefined) {
    return ''
  }
  if (typeof value === 'object') {
    return `${(value as Attachment).filename} (${(value as Attachment).mimeType})`
  }
  return String(value)
}

const groupSource = (group: ChangeGroup) => group.sourceType + (group.trackId !== undefined ? ' ' + group.trackId : '')

export const MultiProperties = ({ videos }: Props) => {
  const _ = useI18n()
  const groups = groupChanges(videos)

  const valueCell = (
    group: ChangeGroup,
    value: ChangePropertyValue | undefined,
    values: (ChangePropertyValue | undefined)[],
    differs: boolean
  ) => {
    if (differs) {
      return <MultipleValuesCell values={values.map(formatValue)} />
    }
    switch (group.property !== undefined ? propertyTypes[group.property] : undefined) {
      case 'boolean':
        return booleanRenderer(value as boolean)
      case 'attachment':
        return attachmentRenderer(value as Attachment)
      default:
        return <EllipsisCell>{(value as string) ?? ''}</EllipsisCell>
    }
  }

  const columns: TableColumnDefinition<ChangeGroup>[] = [
    createTableColumn<ChangeGroup>({
      columnId: 'source',
      compare: (a, b) => groupSource(a).localeCompare(groupSource(b)),
      renderHeaderCell: () => <b>{_('properties.column.source.label', { defaultValue: 'Source' })}</b>,
      renderCell: (item) => {
        const num = item.trackId !== undefined ? String(item.trackId) : undefined
        return (
          <EllipsisCell>
            {_(`change_source.${item.sourceType.toLowerCase()}.label_id`, {
              defaultValue: `${item.sourceType} ${num ? ' {num}' : ''}`,
              num
            })}
          </EllipsisCell>
        )
      }
    }),
    createTableColumn<ChangeGroup>({
      columnId: 'type',
      compare: (a, b) => a.changeType.localeCompare(b.changeType),
      renderHeaderCell: () => <b>{_('properties.column.type.label', { defaultValue: 'Type' })}</b>,
      renderCell: (item) => (
        <EllipsisCell>
          {_(`change_type.${item.changeType.toLowerCase()}.label`, { defaultValue: item.changeType })}
        </EllipsisCell>
      )
    }),
    createTableColumn<ChangeGroup>({
      columnId: 'property',
      compare: (a, b) => (a.property ?? '').localeCompare(b.property ?? ''),
      renderHeaderCell: () => <b>{_('properties.column.property.label', { defaultValue: 'Property' })}</b>,
      renderCell: (item) => (
        <EllipsisCell>
          {item.property
            ? _(`change_property.${item.property.toLowerCase().replace(/ /g, '_')}.label`, {
                defaultValue: item.property
              })
            : ''}
        </EllipsisCell>
      )
    }),
    createTableColumn<ChangeGroup>({
      columnId: 'currentValue',
      renderHeaderCell: () => <b>{_('properties.column.current_value.label', { defaultValue: 'Current Value' })}</b>,
      renderCell: (item) => valueCell(item, item.currentValue, item.currentValues, item.currentValueDiffers)
    }),
    createTableColumn<ChangeGroup>({
      columnId: 'newValue',
      renderHeaderCell: () => <b>{_('properties.column.new_value.label', { defaultValue: 'New Value' })}</b>,
      renderCell: (item) => valueCell(item, item.newValue, item.newValues, item.newValueDiffers)
    }),
    createTableColumn<ChangeGroup>({
      columnId: 'videos',
      compare: (a, b) => a.count - b.count,
      renderHeaderCell: () => <b>{_('multi_tracks.column.videos', { defaultValue: 'Videos' })}</b>,
      renderCell: (item) => `${item.count}/${videos.length}`
    })
  ]

  return (
    <div className="processing-changes">
      <div>
        <DataGrid
          items={groups}
          columns={columns}
          sortable
          getRowId={(item: ChangeGroup) => item.key}
          focusMode="composite"
          resizableColumns
          columnSizingOptions={columnSizingOptions}
          size="extra-small"
        >
          <DataGridHeader>
            <DataGridRow>
              {({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody<ChangeGroup>>
            {({ item, rowId }) => (
              <DataGridRow<ChangeGroup> key={rowId}>
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
    </div>
  )
}

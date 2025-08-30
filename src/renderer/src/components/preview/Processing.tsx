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
  createTableColumn,
  DataGrid,
  DataGridBody,
  DataGridCell,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridProps,
  DataGridRow,
  Field,
  Input,
  Select,
  TableColumnDefinition,
  TableColumnSizingOptions,
  TableRowId
} from '@fluentui/react-components'
import { SaveRegular, SubtractCircleRegular, TaskListAddRegular } from '@fluentui/react-icons'
import { useState } from 'react'
import { Checkbox } from '@fluentui/react'
import { attachmentRenderer, booleanRenderer } from './renderers'
import {
  Attachment,
  Change,
  ChangeProperty,
  ChangePropertyValue,
  ChangeType,
  getChangeSource,
  IChange,
  propertyTypes
} from '../../../../common/Change'
import {
  changeExists,
  IVideo,
  retrieveChangePropertyValue,
  retrievePossibleSources
} from '../../../../common/@types/Video'
import { LanguageSelector } from '@renderer/components/LanguageSelector'

const valueRenderer = (item: IChange, value: ChangePropertyValue | undefined) => {
  let res = <div className="overflow-safe">{(value as string) ?? ''}</div>
  if (item.property !== undefined) {
    switch (propertyTypes[item.property]) {
      case 'boolean':
        res = booleanRenderer(value as boolean)
        break
      case 'attachment':
        res = attachmentRenderer(value as Attachment)
        break
    }
  }
  return res
}

const columns: TableColumnDefinition<IChange>[] = [
  createTableColumn<IChange>({
    columnId: 'source',
    compare: (a, b) => getChangeSource(a).localeCompare(getChangeSource(b)),
    renderHeaderCell: () => <b>Source</b>,
    renderCell: (item) => <div style={{ whiteSpace: 'nowrap' }}>{getChangeSource(item)}</div>
  }),
  createTableColumn<IChange>({
    columnId: 'type',
    compare: (a, b) => a.changeType.localeCompare(b.changeType),
    renderHeaderCell: () => <b>Type</b>,
    renderCell: (item) => item.changeType
  }),
  createTableColumn<IChange>({
    columnId: 'property',
    compare: (a, b) => (a.property ?? '').localeCompare(b.property ?? ''),
    renderHeaderCell: () => <b>Property</b>,
    renderCell: (item) => item.property ?? ''
  }),
  createTableColumn<IChange>({
    columnId: 'currentValue',
    renderHeaderCell: () => <b>Current Value</b>,
    renderCell: (item) => valueRenderer(item, item.currentValue)
  }),
  createTableColumn<IChange>({
    columnId: 'newValue',
    renderHeaderCell: () => <b>New Value</b>,
    renderCell: (item) => valueRenderer(item, item.newValue)
  })
]

type Props = {
  video: IVideo
}

const columnSizingOptions: TableColumnSizingOptions = {
  source: { defaultWidth: 60, minWidth: 60, idealWidth: 60 },
  type: { defaultWidth: 50, minWidth: 50, idealWidth: 50 },
  property: { defaultWidth: 70, minWidth: 70, idealWidth: 70 },
  currentValue: { defaultWidth: 200, minWidth: 50, idealWidth: 300 },
  newValue: { defaultWidth: 200, minWidth: 50, idealWidth: 300 }
}

export const ChangeList = ({ video }: Props) => {
  const [source, setSource] = useState<string>('Container')
  const [type, setType] = useState<ChangeType>(ChangeType.UPDATE)
  const availableProperties = Change.getAvailablePropertiesBySource(source, type)
  const [property, setProperty] = useState<ChangeProperty>(availableProperties[0])
  const [newValue, setNewValue] = useState<ChangePropertyValue>('')
  // const [language, setLanguage] = useState<string>("und");
  // const [region, setRegion] = useState<string>("");
  const [selectedChangeUuid, setSelectedChangeUuid] = useState<string>()
  const [selectedRows, setSelectedRows] = useState(new Set<TableRowId>([]))
  const onSelectionChange: DataGridProps['onSelectionChange'] = (_e, data) => {
    const value = data.selectedItems.values().next().value
    const changeUUID = typeof value === 'string' ? value : undefined
    if (changeUUID !== undefined) {
      const change = video.changes.find((c) => c.uuid === changeUUID)
      if (change) {
        setSelectedRows(new Set<TableRowId>([changeUUID]))
        setSelectedChangeUuid(changeUUID)
        setSource(Change.sourceTypeTrackIDToSource(change.sourceType, change.trackId))
        setType(change.changeType)
        if (change.property !== undefined) {
          setProperty(change.property)
        }
        setNewValue(change.newValue !== undefined ? change.newValue : '')
        return
      }
    }
    setSelectedRows(new Set<TableRowId>([]))
    setSelectedChangeUuid(undefined)
  }
  return (
    <>
      <div className="processing-form">
        <Field size="small" label="Source">
          <Select
            value={source}
            onChange={(_ev, data) => {
              const nextSource = data.value
              const nextTypes = Change.getAvailableChangeTypesBySource(nextSource)
              setSource(nextSource)
              let nextType = type
              if (type !== undefined && !nextTypes.includes(nextType)) {
                nextType = nextTypes[0]
                setType(nextType)
              }
              const nextProperties = Change.getAvailablePropertiesBySource(nextSource, nextType)
              let nextProperty = property
              if (property !== undefined && !nextProperties.includes(property)) {
                nextProperty = nextProperties[0]
                setProperty(nextProperty)
              }
              setNewValue(retrieveChangePropertyValue(video, nextSource, nextProperty) ?? '')
            }}
          >
            {retrievePossibleSources(video).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </Select>
        </Field>
        <Field size="small" label="Type">
          <Select
            value={type}
            onChange={(_ev, data) => {
              setType(data.value as ChangeType)
            }}
          >
            {Object.values(ChangeType)
              .filter((t) => source === 'Container' || t === ChangeType.UPDATE)
              .map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
          </Select>
        </Field>
        <Field size="small" label="Property">
          <Select
            value={property}
            onChange={(_ev, data) => {
              const nextProperty = data.value as ChangeProperty
              setProperty(nextProperty)
              setNewValue(retrieveChangePropertyValue(video, source, nextProperty) ?? '')
            }}
          >
            {availableProperties.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </Select>
        </Field>
        {type === ChangeType.UPDATE && property !== undefined && (
          <div className="growing-form-field">
            <Field size="small" label="New Value" required>
              {propertyTypes[property] === 'string' && (
                <Input
                  value={newValue as string}
                  onChange={(_ev, data) => {
                    setNewValue(data.value)
                  }}
                />
              )}
              {propertyTypes[property] === 'boolean' && (
                <Checkbox
                  onChange={(_ev, data) => {
                    setNewValue(data ?? '')
                  }}
                  checked={newValue as boolean}
                />
              )}
              {propertyTypes[property] === 'language' && (
                <LanguageSelector
                  id="language-input"
                  size={'small'}
                  multiselect={false}
                  value={newValue as string}
                  onChange={(value) => setNewValue(value)}
                  required
                />
              )}
            </Field>
          </div>
        )}
        <div className="buttons">
          <Button
            size={'small'}
            icon={<TaskListAddRegular />}
            onClick={async () => {
              const newUuid = await window.api.video.addChange(video.uuid, source, type, property, newValue)
              setSelectedRows(new Set<TableRowId>([newUuid]))
              setSelectedChangeUuid(newUuid)
            }}
            disabled={changeExists(video, undefined, source, type, property)}
          >
            Insert
          </Button>
          <Button
            size={'small'}
            icon={<SaveRegular />}
            onClick={async () =>
              selectedChangeUuid &&
              (await window.api.video.saveChange(video.uuid, selectedChangeUuid, source, type, property, newValue))
            }
            disabled={
              selectedChangeUuid === undefined || changeExists(video, selectedChangeUuid, source, type, property)
            }
          >
            Update
          </Button>
          <Button
            size={'small'}
            icon={<SubtractCircleRegular />}
            onClick={async () => {
              if (selectedChangeUuid !== undefined) {
                await window.api.video.deleteChange(video.uuid, selectedChangeUuid)
                setSelectedRows(new Set<TableRowId>([]))
                setSelectedChangeUuid(undefined)
              }
            }}
            disabled={selectedChangeUuid === undefined}
          >
            Remove
          </Button>
        </div>
      </div>
      <div className="processing-changes">
        <div>
          <DataGrid
            items={video.changes}
            columns={columns}
            sortable
            getRowId={(item: Change) => item.uuid}
            focusMode="composite"
            resizableColumns
            columnSizingOptions={columnSizingOptions}
            size="extra-small"
            selectionMode="single"
            selectedItems={selectedRows}
            onSelectionChange={onSelectionChange}
            style={{ maxHeight: '196px', minHeight: '196px' }}
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
      </div>
    </>
  )
}

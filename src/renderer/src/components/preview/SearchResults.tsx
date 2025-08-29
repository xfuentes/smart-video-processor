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
  TableColumnDefinition,
  TableColumnSizingOptions
} from '@fluentui/react-components'
import { SearchResult } from '../../../../main/domain/SearchResult'
import { IVideo } from '../../../../common/@types/Video'
import { ITrack } from '../../../../common/@types/Track'
import { ISearchResult } from '../../../../common/@types/SearchResult'

const columns: TableColumnDefinition<SearchResult>[] = [
  createTableColumn<SearchResult>({
    columnId: 'id',
    compare: (a, b) => a.id - b.id,
    renderHeaderCell: () => 'ID',
    renderCell: (item) => item.id
  }),
  createTableColumn<SearchResult>({
    columnId: 'title',
    compare: (a, b) => a.title.localeCompare(b.title),
    renderHeaderCell: () => 'Title',
    renderCell: (item) => <div className="overflow-safe">{item.title}</div>
  }),
  createTableColumn<SearchResult>({
    columnId: 'year',
    compare: (a, b) => (a.year ?? -1) - (b.year ?? -1),
    renderHeaderCell: () => 'Year',
    renderCell: (item) => item.year
  })
]

type Props = {
  results: ISearchResult[]
  selectedID: number | undefined
  onSelectionChange?: (selection: ISearchResult | undefined) => void
}

const columnSizingOptions: TableColumnSizingOptions = {
  id: { defaultWidth: 35, minWidth: 35, idealWidth: 35 },
  title: { defaultWidth: 80, minWidth: 80, idealWidth: 600 },
  year: { defaultWidth: 50, minWidth: 50, idealWidth: 50 }
}

export const SearchResultList = ({ results, selectedID, onSelectionChange }: Props) => {
  const handleSelectionChange: DataGridProps['onSelectionChange'] = (_e, data) => {
    const selectedResult = results.find((result) => data.selectedItems.has(result.id))
    if (onSelectionChange !== undefined) {
      onSelectionChange(selectedResult)
    }
  }

  return (
    <div className="search-results">
      <div>
        <DataGrid
          aria-label="search results"
          items={results}
          columns={columns}
          sortable
          selectionMode={'single'}
          onSelectionChange={handleSelectionChange}
          selectedItems={selectedID === undefined ? [] : [selectedID]}
          getRowId={(item: ITrack) => item.id}
          focusMode="composite"
          resizableColumns
          columnSizingOptions={columnSizingOptions}
          size="extra-small"
          style={{ maxHeight: '150px', minHeight: '150px' }}
        >
          <DataGridHeader unselectable={'on'}>
            <DataGridRow
              selectionCell={{
                invisible: true
              }}
            >
              {({ renderHeaderCell }) => <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>}
            </DataGridRow>
          </DataGridHeader>
          <DataGridBody<IVideo>>
            {({ item, rowId }) => (
              <DataGridRow<IVideo> key={rowId}>
                {({ renderCell }) => <DataGridCell as={'div'}>{renderCell(item)}</DataGridCell>}
              </DataGridRow>
            )}
          </DataGridBody>
        </DataGrid>
      </div>
    </div>
  )
}

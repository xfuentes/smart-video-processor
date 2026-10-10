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
  Badge,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  Tooltip
} from '@fluentui/react-components'
import {
  CheckboxChecked16Regular,
  CheckboxIndeterminate16Regular,
  CheckboxUnchecked16Regular
} from '@fluentui/react-icons'
import { EllipsisCell } from '../EllipsisCell'
import { MultipleValuesCell } from '../MultipleValuesCell'
import { useI18n } from '../../i18n'
import { IVideo } from '../../../../common/@types/Video'
import { ITrack } from '../../../../common/@types/Track'
import { codecRenderer, framesRenderer, trackPropertiesRenderer, trackTypeRenderer } from './renderers'
import { groupTracks, TrackGroup } from './trackGroups'

type Props = {
  videos: IVideo[]
  disabled: boolean
}

export const MultiTracks = ({ videos, disabled }: Props) => {
  const _ = useI18n()
  const groups = groupTracks(videos)
  const commonValue = (
    group: TrackGroup,
    difference: TrackGroup['differences'][number],
    value: (t: ITrack) => string
  ) =>
    group.differences.includes(difference) ? (
      <MultipleValuesCell values={group.tracks.map(value)} />
    ) : (
      <EllipsisCell>{value(group.tracks[0])}</EllipsisCell>
    )
  const framesCell = (group: TrackGroup) => {
    const frames = group.tracks.map((t) => t.properties.frames).filter((f): f is number => f !== undefined)
    if (frames.length === 0) {
      return null
    }
    const min = Math.min(...frames)
    const max = Math.max(...frames)
    if (min === max) {
      return framesRenderer(min)
    }
    return <MultipleValuesCell values={frames.map(String)} label={`${min}–${max}`} />
  }
  const differenceLabel = (difference: TrackGroup['differences'][number]) => {
    switch (difference) {
      case 'presence':
        return _('multi_tracks.field.presence', { defaultValue: 'Presence' })
      case 'language':
        return _('track_list.column.language.label', { defaultValue: 'Language' })
      case 'name':
        return _('track_list.column.name.label', { defaultValue: 'Name' })
      case 'forced':
        return _('track_list.column.forced.label', { defaultValue: 'Forced' })
      case 'codec':
        return _('track_list.column.codec.label', { defaultValue: 'Codec' })
      case 'properties':
        return _('track_list.column.properties.label', { defaultValue: 'Properties' })
    }
  }

  return (
    <Table size="extra-small" aria-label="tracks">
      <TableHeader>
        <TableRow>
          <TableHeaderCell style={{ width: '32px' }} />
          <TableHeaderCell style={{ width: '40px' }}>
            {_('track_list.column.id.label', { defaultValue: 'ID' })}
          </TableHeaderCell>
          <TableHeaderCell style={{ width: '90px' }}>
            {_('track_list.column.type.label', { defaultValue: 'Type' })}
          </TableHeaderCell>
          <TableHeaderCell>{_('track_list.column.language.label', { defaultValue: 'Language' })}</TableHeaderCell>
          <TableHeaderCell>{_('track_list.column.name.label', { defaultValue: 'Name' })}</TableHeaderCell>
          <TableHeaderCell>{_('track_list.column.codec.label', { defaultValue: 'Codec' })}</TableHeaderCell>
          <TableHeaderCell>{_('track_list.column.properties.label', { defaultValue: 'Properties' })}</TableHeaderCell>
          <TableHeaderCell style={{ width: '60px' }}>
            {_('track_list.column.forced.label', { defaultValue: 'Forced' })}
          </TableHeaderCell>
          <TableHeaderCell style={{ width: '90px' }}>
            {_('track_list.column.frames.label', { defaultValue: 'Frames' })}
          </TableHeaderCell>
          <TableHeaderCell style={{ width: '70px' }}>
            {_('multi_tracks.column.videos', { defaultValue: 'Videos' })}
          </TableHeaderCell>
          <TableHeaderCell style={{ width: '110px' }}>
            {_('multi_tracks.column.similarity', { defaultValue: 'Similarity' })}
          </TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groups.map((group) => {
          const copiedCount = group.tracks.filter((t) => t.copy).length
          const checked = copiedCount === group.tracks.length ? true : copiedCount === 0 ? false : 'mixed'
          const forcedCount = group.tracks.filter((t) => t.forced).length
          const similar = group.differences.length === 0
          const owners = videos.filter((v) => v.tracks.some((t) => t.type === group.type && t.id === group.id))
          return (
            <TableRow key={`${group.type} ${group.id}`}>
              <TableCell>
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onChange={(_ev, data) => {
                    if (data.checked !== 'mixed') {
                      void window.api.video.setMultiTrackSelection(
                        owners.map((v) => v.uuid),
                        group.type,
                        group.id,
                        data.checked
                      )
                    }
                  }}
                />
              </TableCell>
              <TableCell>{group.id}</TableCell>
              <TableCell>{trackTypeRenderer(group.type)}</TableCell>
              <TableCell>{commonValue(group, 'language', (t) => t.language ?? 'und')}</TableCell>
              <TableCell>{commonValue(group, 'name', (t) => t.name)}</TableCell>
              <TableCell>{commonValue(group, 'codec', (t) => codecRenderer(t.codec))}</TableCell>
              <TableCell>{commonValue(group, 'properties', (t) => trackPropertiesRenderer(t.properties))}</TableCell>
              <TableCell>
                <Tooltip
                  content={_('multi_tracks.forced_tooltip', {
                    defaultValue: 'Forced in {count} of {total} videos.',
                    count: forcedCount,
                    total: group.tracks.length
                  })}
                  relationship="description"
                >
                  <span>
                    {forcedCount === group.tracks.length ? (
                      <CheckboxChecked16Regular />
                    ) : forcedCount === 0 ? (
                      <CheckboxUnchecked16Regular />
                    ) : (
                      <CheckboxIndeterminate16Regular />
                    )}
                  </span>
                </Tooltip>
              </TableCell>
              <TableCell>{framesCell(group)}</TableCell>
              <TableCell>{`${group.tracks.length}/${videos.length}`}</TableCell>
              <TableCell>
                <Tooltip
                  content={
                    similar
                      ? _('multi_tracks.similar_tooltip', { defaultValue: 'This track is the same in every video.' })
                      : _('multi_tracks.different_tooltip', {
                          defaultValue: 'Differs between videos: {fields}',
                          fields: group.differences.map(differenceLabel).join(', ')
                        })
                  }
                  relationship="description"
                >
                  <Badge appearance="tint" color={similar ? 'success' : 'warning'} size="small">
                    {similar
                      ? _('multi_tracks.similar', { defaultValue: 'Similar' })
                      : _('multi_tracks.different', { defaultValue: 'Different' })}
                  </Badge>
                </Tooltip>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

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

import { useState } from 'react'
import { Checkbox, Divider, Field, Select, Tooltip } from '@fluentui/react-components'
import { IVideo } from '../../../../common/@types/Video'
import { HintType } from '../../../../common/@types/Hint'
import { LanguageSelector } from '@renderer/components/fields/LanguageSelector'
import { useI18n } from '../../i18n'
import { SubtitlesType } from '../../../../common/SubtitlesType'
import { AddHintDialog } from './AddHintDialog'
import { getHintCheckState, getNextHintTarget, MultiHintGroup } from './multiHintGroups'

type Props = {
  videos: IVideo[]
  groups: MultiHintGroup[]
  disabled?: boolean
}

export const MultiHints = ({ videos, groups, disabled }: Props) => {
  const _ = useI18n()
  // Rows the user touched stay visible even when their hint was removed from every video.
  const [pinned, setPinned] = useState<Set<string>>(new Set())
  const pin = (key: string) => setPinned((previous) => new Set(previous).add(key))
  const isShown = (g: MultiHintGroup) => g.present.length > 0 || pinned.has(g.key)
  const shownGroups = groups.filter(isShown)
  const uuidsOf = (list: IVideo[]) => list.map((v) => v.uuid)

  const applyTo = (group: MultiHintGroup) => {
    pin(group.key)
    void window.api.video.addMultiHint(uuidsOf(group.eligible), group.trackId, group.hintType)
  }

  // The selection the row had when the user first clicked it, to be able to come back to it.
  const [snapshots, setSnapshots] = useState<
    Map<string, { uuids: string[]; values: Record<string, string | undefined> }>
  >(new Map())

  const valuesOf = (group: MultiHintGroup) => {
    const values: Record<string, string | undefined> = {}
    for (const video of group.present) {
      values[video.uuid] = video.hints.find((h) => h.type === group.hintType && h.trackId === group.trackId)?.value
    }
    return values
  }

  const toggle = (group: MultiHintGroup) => {
    const snapshot = snapshots.get(group.key)
    const { base, target } = getNextHintTarget(group, snapshot?.uuids)
    let values = snapshot?.values
    if (snapshot === undefined || base !== snapshot.uuids) {
      values = valuesOf(group)
      const newSnapshot = { uuids: base, values }
      setSnapshots((previous) => new Map(previous).set(group.key, newSnapshot))
    }
    const current = group.present.map((v) => v.uuid)
    const toAdd = target.filter((uuid) => !current.includes(uuid))
    const toRemove = current.filter((uuid) => !target.includes(uuid))
    pin(group.key)
    if (toAdd.length > 0) {
      void window.api.video.addMultiHint(toAdd, group.trackId, group.hintType, values)
    }
    if (toRemove.length > 0) {
      void window.api.video.removeMultiHint(toRemove, group.trackId, group.hintType)
    }
  }

  const canChange = (group: MultiHintGroup) =>
    getNextHintTarget(group, snapshots.get(group.key)?.uuids).cycle.length > 1

  const checkboxTooltip = (group: MultiHintGroup) => {
    const lines = [
      _('hints.checkbox.applied', {
        defaultValue: 'Applied to {present}/{total} videos.',
        present: group.present.length,
        total: videos.length
      })
    ]
    if (group.eligible.length < videos.length) {
      lines.push(
        _('hints.checkbox.without_track', {
          defaultValue: 'Videos without this track: {count}.',
          count: videos.length - group.eligible.length
        })
      )
    }
    if (group.requiredCount > 0) {
      lines.push(
        _('hints.checkbox.required', {
          defaultValue: 'Required for {count} videos, it cannot be removed.',
          count: group.requiredCount
        })
      )
    }
    if (canChange(group)) {
      lines.push(
        _('hints.checkbox.click', {
          defaultValue: 'Click to switch between the original selection, every video having this track and none.'
        })
      )
    }
    return (
      <>
        {lines.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </>
    )
  }

  const trackLabel = (group: MultiHintGroup) =>
    group.hintType === HintType.LANGUAGE
      ? _('track_type.' + group.trackType.toLowerCase() + '.label_id', {
          defaultValue: `${group.trackType} {id}`,
          id: group.trackId
        })
      : `${_('track_type.' + group.trackType.toLowerCase() + '.label', { defaultValue: group.trackType })} ${group.trackId}`

  const renderRow = (group: MultiHintGroup) => {
    const { checked } = getHintCheckState(group, videos.length)
    const hint = { type: group.hintType, trackId: group.trackId }
    const applied = group.present.length > 0
    const rowDisabled = disabled || !applied
    return (
      <div key={group.key} style={{ display: 'flex', alignItems: 'flex-end', gap: '2px' }}>
        {/* The wrapper has the height of a small control so the checkbox ignores the field label. */}
        <div style={{ height: '24px', display: 'flex', alignItems: 'center' }}>
          <Tooltip content={checkboxTooltip(group)} relationship="description">
            <Checkbox
              checked={checked}
              disabled={disabled || !canChange(group)}
              onChange={() => toggle(group)}
              aria-label={trackLabel(group)}
            />
          </Tooltip>
        </div>
        <Field
          size="small"
          label={trackLabel(group)}
          required={group.requiredCount > 0}
          className={rowDisabled ? 'disabled' : ''}
        >
          {group.hintType === HintType.LANGUAGE ? (
            <LanguageSelector
              id={group.key}
              disabled={rowDisabled}
              size="small"
              multiselect={false}
              value={group.value || ''}
              onChange={async (value) => {
                if (value) {
                  await window.api.video.setMultiHint(uuidsOf(group.present), hint, value)
                }
              }}
              required={group.requiredCount > 0}
            />
          ) : (
            <Select
              size="small"
              disabled={rowDisabled}
              value={group.value || ''}
              onChange={async (_ev, data) =>
                await window.api.video.setMultiHint(uuidsOf(group.present), hint, data.value)
              }
            >
              {Object.values(SubtitlesType).map((key) => (
                <option key={key} value={key}>
                  {_(`subtitles_type.${key.toLowerCase().replace(/ /g, '_')}.label`, { defaultValue: key })}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </div>
    )
  }

  const languageGroups = shownGroups.filter((g) => g.hintType === HintType.LANGUAGE)
  const subtitlesTypeGroups = shownGroups.filter((g) => g.hintType === HintType.SUBTITLES_TYPE)
  const addOptions = groups
    .filter((g) => !isShown(g))
    .map((g) => ({ trackId: g.trackId, trackType: g.trackType, hintType: g.hintType }))

  return (
    <div style={{ flexGrow: 1, display: 'flex', flexFlow: 'column nowrap' }}>
      <div className="hints-main" style={{ flexGrow: 1, alignContent: 'flex-start' }}>
        {languageGroups.length > 0 && (
          <>
            <Divider appearance="default">{_('hints.language', { defaultValue: 'Language' })}</Divider>
            <div className="hints-form">{languageGroups.map(renderRow)}</div>
          </>
        )}
        {subtitlesTypeGroups.length > 0 && (
          <>
            <Divider appearance="default">{_('hints.subtitles_type', { defaultValue: 'Subtitles Type' })}</Divider>
            <div className="hints-form">{subtitlesTypeGroups.map(renderRow)}</div>
          </>
        )}
      </div>
      <Divider style={{ flexGrow: '0' }} />
      <div className="preview-buttons">
        <div className="button">
          <AddHintDialog
            options={addOptions}
            disabled={disabled}
            onAdd={(o) => {
              const group = groups.find(
                (g) => g.hintType === o.hintType && g.trackType === o.trackType && g.trackId === o.trackId
              )
              if (group !== undefined) {
                applyTo(group)
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}

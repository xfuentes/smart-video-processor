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

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Tooltip, tokens } from '@fluentui/react-components'
import { Clock16Regular, FolderArrowRight16Regular } from '@fluentui/react-icons'
import { IVideo } from '../../../common/@types/Video'
import { JobQueueInfo, JobQueues, JobStatus } from '../../../common/@types/Job'
import { Strings } from '../../../common/Strings'
import { _ as t } from '../i18n'
import { ProgressRing } from './ProgressRing'

type Props = {
  videos: IVideo[]
  selectedVideos: IVideo[]
}

type DiskSpace = { tmp?: number; output?: number }

const DISK_REFRESH_MS = 30000
const QUEUES_REFRESH_MS = 1500
const noQueues: JobQueues = {
  loading: { running: false, queued: 0, paused: false },
  encoding: { running: false, queued: 0, paused: false },
  merging: { running: false, queued: 0, paused: false }
}

// The hidden sizer text reserves the widest expected width, whatever the language.
const SizedText = ({ text, sizer }: { text: string; sizer: string }) => (
  <span style={{ display: 'inline-grid', gridTemplateColumns: 'minmax(0, auto)', minWidth: 0 }}>
    <span style={{ gridArea: '1 / 1', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</span>
    <span aria-hidden style={{ gridArea: '1 / 1', visibility: 'hidden', height: 0, overflow: 'hidden' }}>
      {sizer}
    </span>
  </span>
)

type StatusCellProps = {
  dim?: boolean
  hidden?: boolean
  always?: boolean
  noShrink?: boolean
  color?: string
  tooltip?: string
  sizer?: string
  children: React.ReactNode
}

// The tooltip opens when the cell content is cut off, or always when requested.
const StatusCell = ({ dim, hidden, always, noShrink, color, tooltip, sizer, children }: StatusCellProps) => {
  const ref = useRef<HTMLSpanElement>(null)
  const [visible, setVisible] = useState(false)
  // The text may be clipped by the cell itself or by a nested ellipsis element.
  const isTruncated = () => {
    const root = ref.current
    if (root === null) {
      return false
    }
    return [root, ...Array.from(root.querySelectorAll<HTMLElement>('*:not([aria-hidden])'))].some(
      (el) => el.scrollWidth > el.clientWidth
    )
  }
  return (
    <Tooltip
      content={tooltip ?? ''}
      relationship="description"
      withArrow
      visible={visible && tooltip !== undefined}
      onVisibleChange={(_event, data) => setVisible(data.visible && (always === true || isTruncated()))}
    >
      <span
        ref={ref}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxSizing: 'border-box',
          flexShrink: noShrink ? 0 : 1,
          // The widest expected text is only a preferred width, the real text is the minimum.
          flexBasis: sizer !== undefined ? `calc(${sizer.length * 1.2}ch + 24px)` : 'auto',
          minWidth: sizer !== undefined ? 'min-content' : 0,
          padding: '0 12px',
          height: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          borderLeft: `1px solid ${tokens.colorNeutralStroke2}`,
          fontVariantNumeric: 'tabular-nums',
          opacity: dim ? 0.5 : 1,
          visibility: hidden ? 'hidden' : 'visible',
          color
        }}
      >
        {children}
      </span>
    </Tooltip>
  )
}

export const StatusBar = ({ videos, selectedVideos }: Props) => {
  const [diskSpace, setDiskSpace] = useState<DiskSpace>({})
  const [queues, setQueues] = useState<JobQueues>(noQueues)

  const stats = useMemo(() => {
    const queued = videos.filter((video) => video.queued && !video.processing)
    const pending = videos.filter((video) => video.processing || video.queued)
    return {
      queued: queued.length,
      errors: videos.filter((video) => video.status === JobStatus.ERROR).length,
      succeeded: videos.filter((video) => video.status === JobStatus.SUCCESS).length,
      totalSize: videos.reduce((sum, video) => sum + video.size, 0),
      pendingCount: pending.length,
      pendingSize: pending.reduce((sum, video) => sum + video.size, 0)
    }
  }, [videos])

  const refreshDiskSpace = () => {
    void window.api.main.getDiskSpace().then(setDiskSpace)
  }

  useEffect(() => {
    refreshDiskSpace()
    const timer = setInterval(refreshDiskSpace, DISK_REFRESH_MS)
    return () => clearInterval(timer)
  }, [])

  useEffect(refreshDiskSpace, [stats.pendingCount, stats.queued])

  const refreshQueues = () => {
    void window.api.main.getJobQueues().then(setQueues)
  }

  useEffect(() => {
    refreshQueues()
    const timer = setInterval(refreshQueues, QUEUES_REFRESH_MS)
    return () => clearInterval(timer)
  }, [])

  const totalText = (count: number, size: number) =>
    `${t('status_bar.total', { defaultValue: '{total, plural, one {# video} other {# videos}}', total: count })} (${Strings.humanFileSize(size)})`
  const selectedText = (count: number) =>
    t('status_bar.selected', {
      defaultValue: '{selected, plural, one {# video selected} other {# videos selected}}',
      selected: count
    })
  const queuedText = (count: number) => t('status_bar.queued', { defaultValue: '{queued} queued', queued: count })
  const succeededText = (count: number) =>
    t('status_bar.succeeded', {
      defaultValue: '{succeeded, plural, one {# succeeded} other {# succeeded}}',
      succeeded: count
    })
  const errorsText = (count: number) =>
    t('status_bar.errors', { defaultValue: '{errors, plural, one {# error} other {# errors}}', errors: count })

  const cell = (
    key: string,
    content: React.ReactNode,
    options?: {
      dim?: boolean
      hidden?: boolean
      color?: string
      tooltip?: string
      always?: boolean
      noShrink?: boolean
      sizer?: string
    }
  ) => (
    <StatusCell
      key={key}
      dim={options?.dim}
      hidden={options?.hidden}
      always={options?.always}
      noShrink={options?.noShrink}
      color={options?.color}
      tooltip={options?.tooltip ?? (typeof content === 'string' ? content : undefined)}
      sizer={options?.sizer}
    >
      {content}
    </StatusCell>
  )

  const stageCell = (status: JobStatus.LOADING | JobStatus.ENCODING | JobStatus.MERGING, info: JobQueueInfo) => {
    const active = info.running || info.queued > 0
    const running = videos.find((video) => video.status === status)
    const progress = running?.progression?.progress
    const known = progress !== undefined && progress >= 0
    const label =
      status === JobStatus.LOADING
        ? t('status_bar.loading', { defaultValue: 'Loading' })
        : status === JobStatus.ENCODING
          ? t('status_bar.encoding', { defaultValue: 'Encoding' })
          : t('status_bar.merging', { defaultValue: 'Merging' })
    return cell(
      status,
      <>
        <SizedText
          text={`${label}${info.queued > 0 ? ` (+${info.queued})` : ''}${info.paused ? ' ⏸' : ''}`}
          sizer={`${label} (+99) ⏸`}
        />
        <span style={{ display: 'flex', visibility: info.running && !(info.paused && !known) ? 'visible' : 'hidden' }}>
          <ProgressRing value={known ? progress : undefined} />
        </span>
      </>,
      { hidden: !active, tooltip: running?.message, always: true, noShrink: true }
    )
  }

  const diskCell = (key: 'tmp' | 'output', free?: number) => {
    if (free === undefined) {
      return null
    }
    const low = stats.pendingSize > 0 && free < stats.pendingSize
    const diskText = (size: number) =>
      t(`status_bar.${key}`, {
        defaultValue: key === 'tmp' ? 'Temporary folder: {size} available' : 'Output folder: {size} available',
        size: Strings.humanFileSize(size)
      })
    const Icon = key === 'tmp' ? Clock16Regular : FolderArrowRight16Regular
    return cell(
      key,
      <>
        <Icon style={{ flexShrink: 0 }} />
        {Strings.humanFileSize(free)}
      </>,
      {
        color: low ? tokens.colorPaletteRedForeground1 : undefined,
        tooltip: diskText(free),
        always: true,
        sizer: Strings.humanFileSize(999.9e9)
      }
    )
  }

  return (
    <div
      role="status"
      style={{
        flexShrink: 0,
        height: '24px',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground2,
        backgroundColor: tokens.colorNeutralBackground2,
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
        whiteSpace: 'nowrap',
        userSelect: 'none',
        cursor: 'default',
        overflow: 'hidden'
      }}
    >
      {cell('total', totalText(videos.length, stats.totalSize), { sizer: totalText(999, 999.9e9) })}
      {cell('selected', selectedText(selectedVideos.length), {
        dim: selectedVideos.length === 0,
        sizer: selectedText(999)
      })}
      {cell('queued', queuedText(stats.queued), { dim: stats.queued === 0, sizer: queuedText(999) })}
      {cell('errors', errorsText(stats.errors), {
        dim: stats.errors === 0,
        color: stats.errors > 0 ? tokens.colorPaletteRedForeground1 : undefined,
        sizer: errorsText(999)
      })}
      {stats.succeeded > 0 &&
        cell('succeeded', succeededText(stats.succeeded), {
          color: tokens.colorPaletteGreenForeground1,
          sizer: succeededText(999)
        })}
      <span style={{ flex: 1 }} />
      {stageCell(JobStatus.LOADING, queues.loading)}
      {stageCell(JobStatus.ENCODING, queues.encoding)}
      {stageCell(JobStatus.MERGING, queues.merging)}
      {diskCell('tmp', diskSpace.tmp)}
      {diskCell('output', diskSpace.output)}
    </div>
  )
}

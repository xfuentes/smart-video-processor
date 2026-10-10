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

import { useState } from 'react'
import {
  CounterBadge,
  SelectTabData,
  SelectTabEvent,
  SelectTabEventHandler,
  Tab,
  TabList
} from '@fluentui/react-components'
import {
  ResizeVideo20Regular,
  Search20Regular,
  SquareHintArrowBack20Regular,
  TaskListLtr20Regular,
  TextBulletList20Regular
} from '@fluentui/react-icons'
import { useI18n } from '../../i18n'
import { IVideo } from '../../../../common/@types/Video'
import { useVideoPlayer } from '@renderer/components/context/VideoPlayerContext'
import { EncoderSettings, MultiEncoderSettings } from '../../../../common/@types/Encoding'
import { MultiMatching } from '@renderer/components/preview/MultiMatching'
import { MultiHints } from '@renderer/components/preview/MultiHints'
import { MultiEncoding } from '@renderer/components/preview/MultiEncoding'
import { MultiProperties } from '@renderer/components/preview/MultiProperties'
import { groupChanges } from '@renderer/components/preview/changeGroups'
import { MultiTracks } from '@renderer/components/preview/MultiTracks'
import { buildMultiHintGroups } from '@renderer/components/preview/multiHintGroups'
import { groupTracks } from '@renderer/components/preview/trackGroups'

type Props = {
  videos: IVideo[]
}

export const MultiPreviewTabs = ({ videos }: Props) => {
  const _ = useI18n()
  const { videoPlayerOpened, setVideoPlayerOpened } = useVideoPlayer()
  const [selectedTab, setSelectedTab] = useState('matching')

  const handleTabSelect: SelectTabEventHandler = (_event: SelectTabEvent, data: SelectTabData) => {
    const tabToSelect = data.value as string
    if (tabToSelect !== 'processing' && videoPlayerOpened) {
      setVideoPlayerOpened(false)
    }
    setSelectedTab(tabToSelect)
  }

  const allEnabled = videos.find((video) => video.searching || video.queued || video.processing) === undefined
  const allMatched = videos.find((video) => !video.matched) === undefined
  const hintGroups = buildMultiHintGroups(videos)
  const hintCount = hintGroups.filter((g) => g.present.length > 0).length
  const canAddHint = hintGroups.some((g) => g.present.length === 0)
  const hintMissing = hintGroups.some((g) => g.anyMissing)

  if ((selectedTab === 'encoding' || selectedTab === 'properties') && (!allMatched || hintMissing)) {
    setSelectedTab(allMatched ? 'hints' : 'matching')
  }

  let firstSet = true
  let commonEncoderSettings: EncoderSettings[] = []
  videos.forEach((v) => {
    if (firstSet) {
      commonEncoderSettings = v.encoderSettings.map((es) => {
        return {
          trackId: es.trackId,
          trackType: es.trackType,
          targetSize: es.targetSize,
          codec: es.codec,
          originalSize: es.originalSize,
          compressionPercent: es.compressionPercent,
          encodingEnabled: v.trackEncodingEnabled[es.trackType + ' ' + es.trackId] ?? es.encodingEnabled,
          enforcingCodec: es.enforcingCodec
        }
      })
      firstSet = false
    } else {
      const newCommonEncoderSettings: EncoderSettings[] = []
      for (const commonEncoderSetting of commonEncoderSettings) {
        const encoderSetting = v.encoderSettings.find(
          (s: EncoderSettings) =>
            s.trackId === commonEncoderSetting.trackId && s.trackType === commonEncoderSetting?.trackType
        )
        if (encoderSetting !== undefined) {
          const currentEncodingEnabled =
            v.trackEncodingEnabled[encoderSetting.trackType + ' ' + encoderSetting.trackId] ??
            encoderSetting.encodingEnabled
          if (commonEncoderSetting.encodingEnabled !== currentEncodingEnabled) {
            commonEncoderSetting.encodingEnabled = undefined
          }
          if (commonEncoderSetting.codec !== encoderSetting.codec) {
            commonEncoderSetting.codec = undefined
          }
          if (commonEncoderSetting.enforcingCodec !== encoderSetting.enforcingCodec) {
            commonEncoderSetting.enforcingCodec = undefined
          }
          if (commonEncoderSetting.originalSize !== undefined && encoderSetting.originalSize !== undefined) {
            commonEncoderSetting.originalSize += encoderSetting.originalSize
          }
          if (commonEncoderSetting.targetSize !== undefined && encoderSetting.targetSize !== undefined) {
            commonEncoderSetting.targetSize += encoderSetting.targetSize
          }
          newCommonEncoderSettings.push(commonEncoderSetting)
        }
      }
      commonEncoderSettings = newCommonEncoderSettings
    }
  })
  for (const commonEncoderSetting of commonEncoderSettings) {
    if (commonEncoderSetting.originalSize !== undefined && commonEncoderSetting.targetSize !== undefined) {
      commonEncoderSetting.compressionPercent = Math.round(
        (1 - commonEncoderSetting.targetSize / commonEncoderSetting.originalSize) * 100
      )
    } else {
      commonEncoderSetting.compressionPercent = undefined
    }
  }

  const multiEncoderSettings: MultiEncoderSettings[] = commonEncoderSettings.map((ces) => {
    let enabledCount = 0
    let enabledOriginalSize = 0
    let enabledTargetSize = 0
    for (const v of videos) {
      const es = v.encoderSettings.find(
        (s: EncoderSettings) => s.trackId === ces.trackId && s.trackType === ces.trackType
      )
      if (es && (v.trackEncodingEnabled[es.trackType + ' ' + es.trackId] ?? es.encodingEnabled)) {
        enabledCount++
        enabledOriginalSize += es.originalSize ?? 0
        enabledTargetSize += es.targetSize ?? 0
      }
    }
    return {
      ...ces,
      enabledCount,
      totalCount: videos.length,
      enabledOriginalSize,
      enabledTargetSize,
      enabledCompressionPercent:
        enabledOriginalSize > 0 ? Math.round((1 - enabledTargetSize / enabledOriginalSize) * 100) : undefined
    }
  })

  const encodingCount = multiEncoderSettings.reduce((total, es) => total + es.enabledCount, 0)
  const matchingCount = videos[0].searchResults?.length ?? 0
  const changeGroups = groupChanges(videos)
  const trackGroups = groupTracks(videos)
  const tracksDiffer = trackGroups.some((g) => g.differences.length > 0)

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        padding: '2px',
        display: 'flex',
        flexFlow: 'column nowrap'
      }}
    >
      <TabList selectedValue={selectedTab} onTabSelect={handleTabSelect} size="small">
        <Tab value="matching" icon={<Search20Regular />}>
          {_('preview.tab.matching', { defaultValue: 'Matching' })}{' '}
          <CounterBadge color={allMatched ? 'informative' : 'danger'} size="small" showZero count={matchingCount} />
        </Tab>
        <Tab value="tracks" icon={<TextBulletList20Regular />}>
          {_('preview.tab.tracks', { defaultValue: 'Tracks' })}{' '}
          <CounterBadge
            color={tracksDiffer ? 'important' : 'informative'}
            size="small"
            showZero
            count={trackGroups.length}
          />
        </Tab>
        {(hintCount > 0 || canAddHint) && (
          <Tab value="hints" icon={<SquareHintArrowBack20Regular />}>
            {_('preview.tab.hints', { defaultValue: 'Hints' })}{' '}
            <CounterBadge color={hintMissing ? 'danger' : 'informative'} size="small" showZero count={hintCount} />
          </Tab>
        )}
        <Tab value="properties" icon={<TaskListLtr20Regular />} disabled={!allMatched || hintMissing}>
          {_('preview.tab.properties', { defaultValue: 'Properties' })}{' '}
          <CounterBadge color="informative" size="small" showZero count={changeGroups.length} />
        </Tab>
        <Tab value="encoding" icon={<ResizeVideo20Regular />} disabled={!allMatched || hintMissing}>
          {_('preview.tab.encoding', { defaultValue: 'Encoding' })}{' '}
          <CounterBadge color="informative" size="small" showZero count={encodingCount} />
        </Tab>
      </TabList>
      <div style={{ flexGrow: '1', overflow: 'auto', display: 'flex', flexFlow: 'column', padding: '2px' }}>
        {selectedTab === 'matching' && <MultiMatching disabled={!allEnabled} videos={videos} />}
        {selectedTab === 'tracks' && <MultiTracks disabled={!allEnabled} videos={videos} />}
        {selectedTab === 'hints' && <MultiHints disabled={!allEnabled} videos={videos} groups={hintGroups} />}
        {selectedTab === 'properties' && <MultiProperties videos={videos} />}
        {selectedTab === 'encoding' && (
          <MultiEncoding disabled={!allEnabled} videos={videos} commonEncoderSettings={multiEncoderSettings} />
        )}
      </div>
    </div>
  )
}

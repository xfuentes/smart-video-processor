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

import { useState } from 'react'
import {
  CounterBadge,
  SelectTabData,
  SelectTabEvent,
  SelectTabEventHandler,
  Tab,
  TabList
} from '@fluentui/react-components'
import { ResizeVideo20Regular, Search20Regular, SquareHintArrowBack20Regular } from '@fluentui/react-icons'
import { IVideo } from '../../../../common/@types/Video'
import { useVideoPlayer } from '@renderer/components/context/VideoPlayerContext'
import { IHint } from '../../../../common/@types/Hint'
import { EncoderSettings } from '../../../../common/@types/Encoding'
import { MultiMatching } from '@renderer/components/preview/MultiMatching'
import { MultiHints } from '@renderer/components/preview/MultiHints'
import { MultiEncoding } from '@renderer/components/preview/MultiEncoding'

type Props = {
  videos: IVideo[]
}

export const MultiPreviewTabs = ({ videos }: Props) => {
  const { videoPlayerOpened, setVideoPlayerOpened } = useVideoPlayer()
  const [selectedTab, setSelectedTab] = useState('matching')

  const handleTabSelect: SelectTabEventHandler = (_event: SelectTabEvent, data: SelectTabData) => {
    const tabToSelect = data.value as string
    if (tabToSelect !== 'processing' && videoPlayerOpened) {
      setVideoPlayerOpened(false)
    }
    setSelectedTab(tabToSelect)
  }

  const allEnabled = videos.find((video) => video.queued || video.processing) === undefined
  const allMatched = videos.find((video) => !video.matched) === undefined
  let firstSet = true
  let commonHints: IHint[] = []
  videos.forEach((v) => {
    if (firstSet) {
      commonHints = v.hints
      firstSet = false
    } else {
      const newCommonHints: IHint[] = []
      for (const commonHint of commonHints) {
        const hint = v.hints.find((h: IHint) => h.trackId === commonHint.trackId && h.type === commonHint.type)
        if (hint !== undefined && commonHint.value === hint.value) {
          newCommonHints.push(commonHint)
        }
      }
      commonHints = newCommonHints
    }
  })

  const hintCount = commonHints.length
  const hintMissing = commonHints.find((h) => !h.value) !== undefined

  firstSet = true
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
          encodingEnabled: v.trackEncodingEnabled[es.trackType + ' ' + es.trackId],
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
          if (commonEncoderSetting.encodingEnabled !== encoderSetting.encodingEnabled) {
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

  const encodingCount = Object.values(commonEncoderSettings).filter((v) => v.encodingEnabled).length
  const matchingCount = videos[0].searchResults?.length ?? 0

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
          Matching{' '}
          <CounterBadge color={allMatched ? 'informative' : 'danger'} size={'small'} showZero count={matchingCount} />
        </Tab>
        {hintCount > 0 && (
          <Tab value="hints" icon={<SquareHintArrowBack20Regular />}>
            Hints{' '}
            <CounterBadge color={hintMissing ? 'danger' : 'informative'} size="small" showZero count={hintCount} />
          </Tab>
        )}
        <Tab value="encoding" icon={<ResizeVideo20Regular />} disabled={!allMatched || hintMissing}>
          Encoding <CounterBadge color="informative" size={'small'} showZero count={encodingCount} />
        </Tab>
      </TabList>
      <div style={{ flexGrow: '1', overflow: 'auto', display: 'flex', flexFlow: 'column', padding: '2px' }}>
        {selectedTab === 'matching' && <MultiMatching disabled={!allEnabled} videos={videos} />}
        {selectedTab === 'hints' && <MultiHints disabled={!allEnabled} videos={videos} commonHints={commonHints} />}
        {selectedTab === 'encoding' && (
          <MultiEncoding disabled={!allEnabled} videos={videos} commonEncoderSettings={commonEncoderSettings} />
        )}
      </div>
    </div>
  )
}

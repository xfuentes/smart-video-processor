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
import { Search20Regular } from '@fluentui/react-icons'
import { IVideo } from '../../../../common/@types/Video'
import { useVideoPlayer } from '@renderer/components/context/VideoPlayerContext'
import { IHint } from '../../../../common/@types/Hint'
import { EncoderSettings } from '../../../../common/@types/Encoding'
import { MultiMatching } from '@renderer/components/preview/MultiMatching'

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
  /*
  const tracksCount = videos.tracks.length
  const changesCount = videos.changes.length
  const partsCount: number = videos.videoParts.length
  const encodingCount = Object.values(videos.trackEncodingEnabled).filter((v) => v).length


 */
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
  // const hintCount = commonHints !== undefined ? commonHints.length : 0
  // const hintMissing = commonHints.find((h) => !h.value) !== undefined

  firstSet = true
  let commonEncoderSettings: EncoderSettings[] = []
  videos.forEach((v) => {
    if (firstSet) {
      commonEncoderSettings = v.encoderSettings
      commonEncoderSettings.forEach((s) => {
        s.encodingEnabled = v.trackEncodingEnabled[s.trackType + ' ' + s.trackId]
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
          newCommonEncoderSettings.push(commonEncoderSetting)
        }
      }
      commonEncoderSettings = newCommonEncoderSettings
    }
  })
  // const encodingCount = Object.values(commonEncoderSettings).filter((v) => v.encodingEnabled).length
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
      </TabList>
      <div style={{ flexGrow: '1', overflow: 'auto', display: 'flex', flexFlow: 'column', padding: '2px' }}>
        {selectedTab === 'matching' && <MultiMatching disabled={!allEnabled} videos={videos} />}
      </div>
    </div>
  )

  /**
   *         {hintCount > 0 && (
   *           <Tab value="hints" icon={<SquareHintArrowBack20Regular />}>
   *             Hints{' '}
   *             <CounterBadge color={hintMissing ? 'danger' : 'informative'} size="small" showZero count={hintCount} />
   *           </Tab>
   *         )}
   *         <Tab value="encoding" icon={<ResizeVideo20Regular />} disabled={!allMatched || hintMissing}>
   *           Encoding <CounterBadge color="informative" size={'small'} showZero count={encodingCount} />
   *         </Tab>
   *
   *         {selectedTab === 'hints' && <MultiHints disabled={!allEnabled} videos={videos} />}
   *         {selectedTab === 'encoding' && <MultiEncoding disabled={!allEnabled} video={videos} />}
   */
}

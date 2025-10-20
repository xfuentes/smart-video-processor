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
import { TrackList } from './TrackList'
import {
  CounterBadge,
  SelectTabData,
  SelectTabEvent,
  SelectTabEventHandler,
  Tab,
  TabList
} from '@fluentui/react-components'
import {
  DataUsageSettings20Regular,
  ResizeVideo20Regular,
  Search20Regular,
  SquareHintArrowBack20Regular,
  TaskListLtr20Regular,
  TextBulletList20Regular
} from '@fluentui/react-icons'
import { Matching } from './Matching'
import { IVideo } from '../../../../common/@types/Video'
import { Hints } from '@renderer/components/preview/Hints'
import { Processing } from '@renderer/components/preview/Processing'
import { Encoding } from '@renderer/components/preview/Encoding'
import { Properties } from '@renderer/components/preview/Properties'

type Props = {
  video: IVideo
}

export const PreviewTabs = ({ video }: Props) => {
  const [selectedTab, setSelectedTab] = useState('matching')

  const handleTabSelect: SelectTabEventHandler = (_event: SelectTabEvent, data: SelectTabData) => {
    setSelectedTab(data.value as string)
  }

  const tracksCount = video.tracks.length
  const matchingCount = video.searchResults?.length ?? 0
  const changesCount = video.changes.length
  const partsCount: number = video.videoParts.length
  const encodingCount = Object.values(video.trackEncodingEnabled).filter((v) => v).length
  const hintCount = video.hints.length
  const hintMissing = video.hints.find((h) => !h.value) !== undefined
  const disabled = video.queued || video.processing

  return (
    <div
      style={{
        minHeight: '295px',
        maxHeight: '295px',
        overflow: 'hidden',
        padding: '2px',
        display: 'flex',
        flexFlow: 'column nowrap'
      }}
    >
      <TabList selectedValue={selectedTab} onTabSelect={handleTabSelect} size="small">
        <Tab value="matching" icon={<Search20Regular />}>
          Matching{' '}
          <CounterBadge
            color={video.matched ? 'informative' : 'danger'}
            size={'small'}
            showZero
            count={matchingCount}
          />
        </Tab>
        <Tab value="tracks" disabled={video.loading} icon={<TextBulletList20Regular />}>
          Tracks{' '}
          <CounterBadge color={tracksCount === 0 ? 'important' : 'informative'} size={'small'} count={tracksCount} />
        </Tab>
        {hintCount > 0 && (
          <Tab value="hints" icon={<SquareHintArrowBack20Regular />}>
            Hints{' '}
            <CounterBadge color={hintMissing ? 'danger' : 'informative'} size="small" showZero count={hintCount} />
          </Tab>
        )}
        <Tab value="properties" icon={<TaskListLtr20Regular />} disabled={!video.matched || hintMissing}>
          Properties <CounterBadge color="informative" size={'small'} showZero count={changesCount} />
        </Tab>
        <Tab value="processing" icon={<DataUsageSettings20Regular />} disabled={!video.matched || hintMissing}>
          Processing <CounterBadge color="informative" size={'small'} showZero count={partsCount} />
        </Tab>
        <Tab value="encoding" icon={<ResizeVideo20Regular />} disabled={!video.matched || hintMissing}>
          Encoding <CounterBadge color="informative" size={'small'} showZero count={encodingCount} />
        </Tab>
      </TabList>
      <div style={{ flexGrow: '1', overflow: 'auto', display: 'flex', flexFlow: 'column', padding: '2px' }}>
        {selectedTab === 'matching' && <Matching disabled={disabled} video={video} />}
        {selectedTab === 'tracks' && <TrackList disabled={disabled} video={video} />}
        {selectedTab === 'hints' && <Hints disabled={disabled} video={video} />}
        {selectedTab === 'properties' && <Properties disabled={disabled} video={video} />}
        {selectedTab === 'processing' && <Processing disabled={disabled} video={video} />}
        {selectedTab === 'encoding' && <Encoding disabled={disabled} video={video} />}
      </div>
    </div>
  )
}

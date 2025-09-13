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

import React, { useCallback, useEffect } from 'react'
import { Toolbar, ToolbarButton, ToolbarGroup, Tooltip } from '@fluentui/react-components'
import {
  BinRecycle24Regular,
  BinRecycleFull24Regular,
  FolderOpen24Regular,
  Pause24Regular,
  Play24Regular,
  Stop24Regular,
  SubtractSquare24Regular,
  WrenchSettings20Regular
} from '@fluentui/react-icons'
import { SettingsDialog } from '@renderer/components/SettingsDialog'
import {
  checkVideoIsProcessing,
  checkVideoProcessingEnabled,
  checkVideoProcessingSuccessful,
  IVideo
} from '../../../common/@types/Video'
import { AboutDialog } from '@renderer/components/AboutDialog'

type Props = {
  onOpen: () => void
  videos: IVideo[]
  selectedVideos: IVideo[] | undefined
}

export const MainToolbar = ({ onOpen, videos, selectedVideos }: Props): React.JSX.Element => {
  const [isPaused, setPaused] = React.useState(false)
  const checkIsRecyclable = useCallback(() => {
    return videos !== undefined && videos.find((v) => checkVideoProcessingSuccessful(v)) !== undefined
  }, [videos])
  const [isRecyclable, setRecyclable] = React.useState(checkIsRecyclable())

  useEffect(() => {
    setRecyclable(checkIsRecyclable())
  }, [checkIsRecyclable])

  const processingEnabled =
    selectedVideos !== undefined && selectedVideos.find((v) => checkVideoProcessingEnabled(v)) !== undefined
  const selectionEmpty = selectedVideos === undefined || selectedVideos.length === 0

  const handleProcess = () => {
    if (selectedVideos) {
      for (const video of selectedVideos) {
        if (checkVideoProcessingEnabled(video)) {
          void window.api.video.process(video.uuid)
        }
      }
    }
  }

  const handlePause = async () => {
    setPaused(await window.api.main.switchPaused())
  }

  const handleCancel = async () => {
    if (selectedVideos) {
      for (const video of selectedVideos) {
        if (checkVideoIsProcessing(video)) {
          await window.api.video.abortJob(video.uuid)
        }
      }
    }
  }

  const handleRemove = async () => {
    if (selectedVideos) {
      await window.api.video.remove(selectedVideos.map((video) => video.uuid))
    }
  }

  const handleClear = async () => {
    await window.api.video.clearCompleted()
  }

  return (
    <Toolbar aria-label="Main Buttons" style={{ justifyContent: 'space-between' }} size={'small'}>
      <ToolbarGroup>
        <ToolbarButton vertical icon={<FolderOpen24Regular />} onClick={onOpen}>
          Open
        </ToolbarButton>
        <ToolbarButton
          vertical
          icon={<WrenchSettings20Regular />}
          onClick={handleProcess}
          disabled={!processingEnabled}
        >
          Process
        </ToolbarButton>
        {isPaused ? (
          <ToolbarButton vertical icon={<Play24Regular />} onClick={handlePause}>
            Resume
          </ToolbarButton>
        ) : (
          <ToolbarButton vertical icon={<Pause24Regular />} onClick={handlePause}>
            Pause
          </ToolbarButton>
        )}
        <ToolbarButton
          vertical
          icon={<Stop24Regular />}
          onClick={handleCancel}
          disabled={
            selectedVideos === undefined || selectedVideos.find((video) => checkVideoIsProcessing(video)) === undefined
          }
        >
          Cancel
        </ToolbarButton>
        <ToolbarButton vertical icon={<SubtractSquare24Regular />} onClick={handleRemove} disabled={selectionEmpty}>
          Remove
        </ToolbarButton>
        <Tooltip content="Clear processed videos" relationship="description">
          <ToolbarButton
            vertical
            icon={isRecyclable ? <BinRecycleFull24Regular /> : <BinRecycle24Regular />}
            onClick={handleClear}
            disabled={!isRecyclable}
          >
            Clear
          </ToolbarButton>
        </Tooltip>
      </ToolbarGroup>
      <ToolbarGroup>
        <SettingsDialog />
        <AboutDialog />
      </ToolbarGroup>
    </Toolbar>
  )
}

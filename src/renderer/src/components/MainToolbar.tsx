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

import React from 'react'
import {
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  Tooltip
} from '@fluentui/react-components'
import {
  BinRecycle24Regular,
  BinRecycleFull24Regular,
  ChevronDown12Regular,
  Document20Regular,
  Folder20Regular,
  FolderOpen24Regular,
  Pause24Regular,
  Play24Regular,
  Power20Regular,
  Stop24Regular,
  SubtractSquare24Regular,
  WrenchSettings20Regular
} from '@fluentui/react-icons'
import { SettingsDialog } from '@renderer/components/SettingsDialog'
import { checkVideoProcessingEnabled, checkVideoProcessingSuccessful, IVideo } from '../../../common/@types/Video'
import { AboutDialog } from '@renderer/components/about/AboutDialog'
import { ShutdownDialog } from '@renderer/components/ShutdownDialog'
import { useI18n } from '../i18n'
import { useRemoveVideos } from './useRemoveVideos'

type Props = {
  onOpen: (directories?: boolean) => void
  videos: IVideo[]
  selectedVideos: IVideo[] | undefined
}

export const MainToolbar = ({ onOpen, videos, selectedVideos }: Props): React.JSX.Element => {
  const _ = useI18n()
  const { requestRemove, removeDialog } = useRemoveVideos()
  const [isPaused, setPaused] = React.useState(false)
  const [shutdownRequested, setShutdownRequested] = React.useState(false)
  const [shutdownDialogOpen, setShutdownDialogOpen] = React.useState(false)
  const isAnyProcessing = videos.some((video) => video.processing)
  const isRecyclable = videos.some((v) => checkVideoProcessingSuccessful(v))

  if (shutdownRequested && !isAnyProcessing && !shutdownDialogOpen) {
    setShutdownDialogOpen(true)
    setShutdownRequested(false)
  }

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
        await window.api.video.abortJob(video.uuid)
      }
    }
  }

  const handleRemove = () => {
    requestRemove(selectedVideos ?? [])
  }

  const handleClear = async () => {
    await window.api.video.clearCompleted()
  }

  const handleShutdownChange = () => {
    if (isAnyProcessing) {
      setShutdownRequested((previous) => !previous)
    }
  }

  const handleShutdownDialogChange = (open: boolean) => {
    setShutdownDialogOpen(open)
    if (!open) {
      setShutdownRequested(false)
    }
  }

  return (
    <>
      <Toolbar
        aria-label={_('main.toolbar.aria_label', { defaultValue: 'Main Buttons' })}
        style={{ justifyContent: 'space-between' }}
        size="small"
      >
        <ToolbarGroup>
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <ToolbarButton vertical icon={<FolderOpen24Regular />}>
                <span style={{ position: 'relative' }}>
                  {_('main.toolbar.open', { defaultValue: 'Open' })}
                  <ChevronDown12Regular
                    style={{
                      position: 'absolute',
                      left: '100%',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      marginLeft: '4px'
                    }}
                  />
                </span>
              </ToolbarButton>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<Document20Regular />} onClick={() => onOpen(false)}>
                  {_('main.toolbar.open_files', { defaultValue: 'Files…' })}
                </MenuItem>
                <MenuItem icon={<Folder20Regular />} onClick={() => onOpen(true)}>
                  {_('main.toolbar.open_folder', { defaultValue: 'Folders…' })}
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
          <ToolbarButton
            vertical
            icon={<WrenchSettings20Regular />}
            onClick={handleProcess}
            disabled={!processingEnabled}
          >
            {_('main.toolbar.process', { defaultValue: 'Process' })}
          </ToolbarButton>
          {isPaused ? (
            <ToolbarButton vertical icon={<Play24Regular />} onClick={handlePause}>
              {_('main.toolbar.resume', { defaultValue: 'Resume' })}
            </ToolbarButton>
          ) : (
            <ToolbarButton vertical icon={<Pause24Regular />} onClick={handlePause}>
              {_('main.toolbar.pause', { defaultValue: 'Pause' })}
            </ToolbarButton>
          )}
          <ToolbarButton
            vertical
            icon={<Stop24Regular />}
            onClick={handleCancel}
            disabled={
              selectedVideos === undefined ||
              selectedVideos.find((video) => video.processing || video.queued) === undefined
            }
          >
            {_('main.toolbar.cancel', { defaultValue: 'Cancel' })}
          </ToolbarButton>
          <ToolbarButton vertical icon={<SubtractSquare24Regular />} onClick={handleRemove} disabled={selectionEmpty}>
            {_('main.toolbar.remove', { defaultValue: 'Remove' })}
          </ToolbarButton>
          <Tooltip
            content={_('main.toolbar.clear_tooltip', { defaultValue: 'Clear processed videos' })}
            relationship="description"
          >
            <ToolbarButton
              vertical
              icon={isRecyclable ? <BinRecycleFull24Regular /> : <BinRecycle24Regular />}
              onClick={handleClear}
              disabled={!isRecyclable}
            >
              {_('main.toolbar.clear', { defaultValue: 'Clear' })}
            </ToolbarButton>
          </Tooltip>
          <Tooltip
            content={_('main.toolbar.shutdown_tooltip', {
              defaultValue: 'Turn off the computer when all processing is complete'
            })}
            relationship="description"
          >
            <ToolbarButton
              vertical
              icon={<Power20Regular />}
              onClick={handleShutdownChange}
              disabled={!isAnyProcessing}
              appearance={shutdownRequested ? 'primary' : 'subtle'}
            >
              {_('main.toolbar.shutdown', { defaultValue: 'Turn Off' })}
            </ToolbarButton>
          </Tooltip>
        </ToolbarGroup>
        <ToolbarGroup>
          <SettingsDialog />
          <AboutDialog />
        </ToolbarGroup>
      </Toolbar>
      {removeDialog}
      <ShutdownDialog open={shutdownDialogOpen} onOpenChange={handleShutdownDialogChange} />
    </>
  )
}

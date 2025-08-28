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

import React from 'react'
import { Toolbar, ToolbarButton, ToolbarGroup } from '@fluentui/react-components'
import { FolderOpen24Regular } from '@fluentui/react-icons'
import { SettingsDialog } from '@renderer/components/SettingsDialog'
import { IVideo } from '../../../common/@types/Video'

type Props = {
  onOpen: () => void
  selectedVideos: IVideo[] | undefined
}

export const MainToolbar = ({ onOpen }: Props): React.JSX.Element => {
  return (
    <Toolbar aria-label="Main Buttons" style={{ justifyContent: 'space-between' }} size={'small'}>
      <ToolbarGroup>
        <ToolbarButton vertical icon={<FolderOpen24Regular />} onClick={onOpen}>
          Open
        </ToolbarButton>
      </ToolbarGroup>
      <ToolbarGroup>
        <SettingsDialog />
      </ToolbarGroup>
    </Toolbar>
  )
}

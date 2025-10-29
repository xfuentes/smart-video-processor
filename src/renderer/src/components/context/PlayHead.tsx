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

import { Tooltip } from '@fluentui/react-components'
import React, { useEffect } from 'react'
import { Strings } from '../../../../common/Strings'

type props = {
  selection?: boolean
  currentTime?: number
  posX?: number
  scrollableRef?: React.MutableRefObject<HTMLDivElement | null>
}

export const PlayHead = ({ currentTime, posX, scrollableRef, selection = false }: props) => {
  useEffect(() => {
    if (posX !== undefined && scrollableRef && scrollableRef.current !== null) {
      scrollableRef.current.scrollTo(posX - Math.round(scrollableRef.current.clientWidth / 2), 0)
    }
  }, [posX, scrollableRef])

  if (posX === undefined) {
    return null
  }

  return currentTime ? (
    <Tooltip content={`Play Head at ${Strings.humanDuration(currentTime)}`} relationship={'label'}>
      <div className={`play-head${selection ? ' selection' : ''}`} style={{ left: posX }}>
        <div className="inside" />
      </div>
    </Tooltip>
  ) : (
    <div className={`play-head${selection ? ' selection' : ''}`} style={{ left: posX }}>
      <div className="inside" />
    </div>
  )
}

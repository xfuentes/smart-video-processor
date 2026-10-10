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

import React, { useRef, useState } from 'react'
import { Tooltip } from '@fluentui/react-components'

type Props = {
  children: React.ReactNode
  /** Tooltip text, defaults to the text content of the cell. */
  tooltip?: string
  /** Show the tooltip even when the text is not cut off. */
  always?: boolean
}

// The text is cut with an ellipsis and the tooltip only opens when it is actually cut off.
export const EllipsisCell = ({ children, tooltip, always }: Props) => {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [content, setContent] = useState('')
  return (
    <Tooltip
      content={content}
      relationship="description"
      withArrow
      visible={visible && content !== ''}
      onVisibleChange={(_event, data) => {
        const el = ref.current
        setContent(tooltip ?? el?.textContent ?? '')
        setVisible(data.visible && (always === true || (el !== null && el.scrollWidth > el.clientWidth)))
      }}
    >
      <div ref={ref} style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
        {children}
      </div>
    </Tooltip>
  )
}

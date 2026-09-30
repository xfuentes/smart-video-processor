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

import React, { useState } from 'react'
import { PREVIEW_PANE_HEIGHT } from '../../../common/@types/Settings'
import { useI18n } from '../i18n'

type Props = {
  /** Height of the bottom pane in percent of the container. */
  value: number
  /** Called while dragging or using the keyboard, with the new height in percent. */
  onResize: (percent: number) => void
  /** Called once the new height is final, with the height in percent. */
  onCommit: (percent: number) => void
}

const KEYBOARD_STEP = 2

const clamp = (percent: number) => Math.min(PREVIEW_PANE_HEIGHT.max, Math.max(PREVIEW_PANE_HEIGHT.min, percent))

export const PaneSplitter = ({ value, onResize, onCommit }: Props) => {
  const _ = useI18n()
  const [active, setActive] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [keyboardFocused, setKeyboardFocused] = useState(false)
  const currentPercent = React.useRef(value)

  const percentFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const container = event.currentTarget.parentElement
    if (!container) {
      return currentPercent.current
    }
    const rect = container.getBoundingClientRect()
    return clamp(((rect.bottom - event.clientY) / rect.height) * 100)
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    currentPercent.current = value
    setActive(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (active) {
      currentPercent.current = percentFromPointer(event)
      onResize(currentPercent.current)
    }
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (active) {
      event.currentTarget.releasePointerCapture(event.pointerId)
      setActive(false)
      onCommit(currentPercent.current)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    let percent: number | undefined
    if (event.key === 'ArrowUp') {
      percent = clamp(value + KEYBOARD_STEP)
    } else if (event.key === 'ArrowDown') {
      percent = clamp(value - KEYBOARD_STEP)
    }
    if (percent !== undefined) {
      event.preventDefault()
      currentPercent.current = percent
      onResize(percent)
      onCommit(percent)
    }
  }

  const handleDoubleClick = () => {
    currentPercent.current = PREVIEW_PANE_HEIGHT.default
    onResize(PREVIEW_PANE_HEIGHT.default)
    onCommit(PREVIEW_PANE_HEIGHT.default)
  }

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label={_('preview_splitter.aria_label', { defaultValue: 'Resize the preview pane' })}
      aria-valuemin={PREVIEW_PANE_HEIGHT.min}
      aria-valuemax={PREVIEW_PANE_HEIGHT.max}
      aria-valuenow={Math.round(value)}
      tabIndex={0}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onKeyDown={handleKeyDown}
      onFocus={(event) => setKeyboardFocused(event.currentTarget.matches(':focus-visible'))}
      onBlur={() => setKeyboardFocused(false)}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: '0 0 7px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '3px',
        cursor: 'row-resize',
        touchAction: 'none',
        outline: keyboardFocused ? '1px solid var(--colorNeutralStroke1)' : 'none',
        outlineOffset: '-1px',
        userSelect: 'none',
        backgroundColor: active || hovered ? 'var(--colorBrandStroke1)' : 'var(--colorNeutralBackground1)',
        transition: active ? undefined : 'background-color 0.15s ease-in 0.2s'
      }}
    >
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          style={{
            width: '3px',
            height: '3px',
            borderRadius: '50%',
            pointerEvents: 'none',
            backgroundColor: active || hovered ? 'var(--colorNeutralForegroundOnBrand)' : 'var(--colorNeutralStroke2)'
          }}
        />
      ))}
    </div>
  )
}

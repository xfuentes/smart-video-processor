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

import type { WindowState } from '../common/@types/Settings'

export interface Rectangle {
  x: number
  y: number
  width: number
  height: number
}

export interface Size {
  width: number
  height: number
}

const isValidSize = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0

const isInsideADisplay = (x: number, y: number, displays: Rectangle[]) =>
  displays.some((d) => x >= d.x && x < d.x + d.width && y >= d.y && y < d.y + d.height)

export function restoreWindowBounds(
  saved: WindowState | undefined,
  displays: Rectangle[],
  defaults: Size,
  minimum: Size
): Partial<Rectangle> & Size {
  if (!saved || !isValidSize(saved.width) || !isValidSize(saved.height)) {
    return { width: defaults.width, height: defaults.height }
  }
  const size = { width: Math.max(saved.width, minimum.width), height: Math.max(saved.height, minimum.height) }
  if (
    typeof saved.x === 'number' &&
    typeof saved.y === 'number' &&
    Number.isFinite(saved.x) &&
    Number.isFinite(saved.y) &&
    isInsideADisplay(saved.x, saved.y, displays)
  ) {
    return { x: saved.x, y: saved.y, ...size }
  }
  return size
}

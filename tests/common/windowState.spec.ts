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

import { expect, test } from 'vitest'
import { restoreWindowBounds } from '../../src/main/windowState'

const displays = [{ x: 0, y: 0, width: 1920, height: 1080 }]
const defaults = { width: 900, height: 670 }
const minimum = { width: 925, height: 568 }

test('Without a saved state the default size is used', () => {
  expect(restoreWindowBounds(undefined, displays, defaults, minimum)).toStrictEqual({ width: 900, height: 670 })
})

test('A saved size and position inside a display are restored', () => {
  const saved = { x: 100, y: 50, width: 1400, height: 900, maximized: false }
  expect(restoreWindowBounds(saved, displays, defaults, minimum)).toStrictEqual({
    x: 100,
    y: 50,
    width: 1400,
    height: 900
  })
})

test('The saved size is never smaller than the minimum size', () => {
  const saved = { x: 0, y: 0, width: 300, height: 200, maximized: false }
  const bounds = restoreWindowBounds(saved, displays, defaults, minimum)
  expect(bounds.width).toBe(925)
  expect(bounds.height).toBe(568)
})

test('A saved position outside every display is dropped but the size is kept', () => {
  const saved = { x: 5000, y: 3000, width: 1200, height: 800, maximized: false }
  expect(restoreWindowBounds(saved, displays, defaults, minimum)).toStrictEqual({ width: 1200, height: 800 })
})

test('Invalid saved values fall back to the default size', () => {
  const saved = { width: Number.NaN, height: -5, maximized: false }
  expect(restoreWindowBounds(saved, displays, defaults, minimum)).toStrictEqual({ width: 900, height: 670 })
})

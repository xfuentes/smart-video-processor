/*
 * Smart Video Processor
 * Copyright (c) 2025. Xavier Fuentes <xfuentes-dev@serviam.cc>
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

import { describe, expect, test } from 'vitest'
import { countValues } from '../../src/renderer/src/components/preview/valueCounts'

describe('countValues', () => {
  test('distinct values are counted and sorted by frequency', () => {
    expect(countValues(['fr', 'en', 'fr', 'de', 'fr', 'en'])).toEqual([
      { value: 'fr', count: 3 },
      { value: 'en', count: 2 },
      { value: 'de', count: 1 }
    ])
  })

  test('values with the same count are sorted alphabetically', () => {
    expect(countValues(['b', 'a']).map((v) => v.value)).toEqual(['a', 'b'])
  })
})

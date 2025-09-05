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

import { expect, test } from 'vitest'
import { Numbers } from '../../src/main/util/numbers'

test('Convert duration to seconds', async () => {
  const seconds = Numbers.durationToSeconds('01:59:57.250000000')
  expect(seconds).toBe(7197.25)
})

test('Convert duration to seconds 2', async () => {
  const seconds = Numbers.durationToSeconds('01:59:18.792000000')
  expect(seconds).toBe(7158.792)
})

test('Unknown duration', async () => {
  const seconds = Numbers.durationToSeconds(undefined)
  expect(seconds).toBe(undefined)
})

test('Integer to number', async () => {
  const integer = Numbers.toNumber(' 498556 ')
  expect(integer).toBe(498556)
})

test('Integer to number', async () => {
  const integer = Numbers.toNumber(' xxBad ')
  expect(integer).toBe(undefined)
})

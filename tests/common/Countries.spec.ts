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
import Countries from '../../src/common/Countries'
import Files from '../../src/main/util/files'
import { pathSep } from '../../src/main/util/path'

test('Search country by alpha3 ignore case', () => {
  const country = Countries.getCountryByCode('usa')
  expect(country).toBeDefined()
  expect(country.id).toBe('840')
  expect(country.label).toBe('United States of America')
  expect(country.alpha2).toBe('US')
  expect(country.alpha3).toBe('USA')
})

test('Verify all countries have a flag', () => {
  const missingFlags: string[] = []
  for (const country of Countries.getList()) {
    const flagPath =
      __dirname +
      `/../../src/renderer/src/assets/flags/${country.alpha3}.png`.replace(/\//g, pathSep)
    const hasFlag = Files.fileExistsAndIsReadable(flagPath)
    if (!hasFlag) {
      missingFlags.push(`${country.alpha3}.png`)
    }
  }
  expect(missingFlags.length, 'Missing Flags: ' + missingFlags.join(', ')).toBe(0)
})

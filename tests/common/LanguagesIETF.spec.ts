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
import { Languages } from '../../src/common/LanguageIETF'
import { Countries } from '../../src/common/Countries'

test('Unique language IETF code', async () => {
  const codes = []
  for (const lang of Languages.getList()) {
    expect(!codes.includes(lang.code), 'Duplicate Language Code [' + lang.code + ']').toBeTruthy()
    if (!codes.includes(lang.code)) {
      codes.push(lang.code)
    }
  }
})

test('Unique language IETF code and aliases', async () => {
  const codes = []
  for (const lang of Languages.getList()) {
    const toAdd = []
    toAdd.push(lang.code)
    if (lang.altCodes) {
      toAdd.push(...lang.altCodes)
    }
    for (const code of toAdd) {
      expect(!codes.includes(code), 'Duplicate Language Code [' + code + ']').toBeTruthy()
      if (!codes.includes(code)) {
        codes.push(code)
      }
    }
  }
})

test('Search Language By Code', async () => {
  const language = Languages.getLanguageByCode('fra')
  expect(language.code).toBe('fr')
})

test('Find Language From Description Failed Bug 1', async () => {
  expect(Languages.findLanguageFromDescription('Stéréo')?.code).toBeUndefined()
  expect(Languages.findLanguageFromDescription('FR truc')?.code).toBe('fr')
  expect(Languages.findLanguageFromDescription('truc EN')?.code).toBe('en')
})

test('Find Language From Description Failed Bug 2', async () => {
  expect(Languages.findLanguageFromDescription('[Francais (Complet)]')?.code).toBe('fr')
})

test('Find Language From Description Failed Bug 3', async () => {
  expect(Languages.findLanguageFromDescription('French complet pour sourds et malentendants')?.code).toBe('fr')
})

test('Test Guess Original language', async () => {
  expect(
    Languages.guessLanguageIETFFromCountries('en', [Countries.getCountryByCode('BE'), Countries.getCountryByCode('FR')])
      .code
  ).toBe('en')
})

test('Test Guess Original language 2', async () => {
  expect(
    Languages.guessLanguageIETFFromCountries('en', [Countries.getCountryByCode('GB'), Countries.getCountryByCode('US')])
      .code
  ).toBe('en')
})

test('Test Guess Original language 3', async () => {
  expect(
    Languages.guessLanguageIETFFromCountries('cn', [Countries.getCountryByCode('CN'), Countries.getCountryByCode('HK')])
      .code
  ).toBe('yue')
})

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
import { getCmdHint } from '../../src/cli/hints'
import { Hint, HintType } from '../../src/common/Hint'

test('CMD Hints replace all bug', () => {
  const hint1 = new Hint(1, HintType.LANGUAGE, 'en')
  const hint2 = new Hint(2, HintType.LANGUAGE, 'fr-BE')
  const result = getCmdHint(hint1, ['fr-FR', 'en-US'])
  const result2 = getCmdHint(hint2, ['fr-FR', 'en-US'])
  expect(result).toBe('en-US')
  expect(result2).toBe('fr-FR')
})

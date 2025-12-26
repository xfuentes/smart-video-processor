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

import { isEqual } from 'lodash'

export const searchAncestorsMatching = (
  element: Element | null,
  matches: (e: Element) => boolean
): Element | undefined => {
  if (!element) {
    return undefined
  }
  if (matches(element)) {
    return element
  }
  return searchAncestorsMatching(element.parentElement, matches)
}

export function keepIfSameReducer<T>(prev: T, curr: T): T | undefined {
  return isEqual(prev, curr) ? curr : undefined
}

export function keepIfSameFilenameReducer(prev: string | undefined, curr: string | undefined): string | undefined {
  if (prev === undefined || curr === undefined) {
    return isEqual(prev, curr) ? curr : undefined
  }
  return isEqual(prev.split('/').pop(), curr.split('/').pop()) ? curr : undefined
}

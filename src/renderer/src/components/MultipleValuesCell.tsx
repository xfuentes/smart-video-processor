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

import { Tooltip } from '@fluentui/react-components'
import { useI18n } from '../i18n'
import { countValues } from './preview/valueCounts'

const MAX_LISTED_VALUES = 20

type Props = {
  /** One value per video, listed with their counts in the tooltip. */
  values: string[]
  /** Text shown in the cell, defaults to the multiple values label. */
  label?: string
}

export const MultipleValuesCell = ({ values, label }: Props) => {
  const _ = useI18n()
  const counts = countValues(values)
  const content = (
    <div>
      {counts.slice(0, MAX_LISTED_VALUES).map(({ value, count }) => (
        <div key={value}>{`${value === '' ? '-' : value} (${count})`}</div>
      ))}
      {counts.length > MAX_LISTED_VALUES && <div>...</div>}
    </div>
  )
  return (
    <Tooltip content={content} relationship="description" withArrow>
      <span>{label ?? _('matching.multiple_values', { defaultValue: 'Multiple values' })}</span>
    </Tooltip>
  )
}

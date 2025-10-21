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

import { Tooltip } from '@fluentui/react-components'
import { Strings } from '../../../../common/Strings'

type props = {
  time: number
  posX?: number
  end?: boolean
}

export const Delimitation = ({ time, posX, end = false }: props) => {
  if (posX === undefined || time === undefined) {
    return null
  }

  return (
    <Tooltip content={`${end ? 'End' : 'Start'} Time Set At ${Strings.humanDuration(time)}`} relationship={'label'}>
      <div className={`delimitation${end ? ' end' : ''}`} style={{ left: posX +  (end ? -6 : 0) }}>
        <div className="inside" />
      </div>
    </Tooltip>
  )
}

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

import React, { Dispatch, useState } from 'react'
import { FormValidation } from '../../../../common/FormValidation'
import { Settings } from '../../../../common/@types/Settings'
import { SettingsContext } from '@renderer/components/context/SettingsContext'

export type SettingsContextType = {
  settingsValidation: FormValidation<Settings>
  setSettingsValidation: Dispatch<FormValidation<Settings>>
}

type props = {
  children: React.ReactNode
}

const validation = await window.api.main.getCurrentSettings()

export function SettingsProvider({ children }: props) {
  const [settingsValidation, setSettingsValidation] = useState(validation)

  return (
    <SettingsContext.Provider value={{ settingsValidation, setSettingsValidation }}>
      {children}
    </SettingsContext.Provider>
  )
}

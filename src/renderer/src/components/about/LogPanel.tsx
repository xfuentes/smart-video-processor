/*
 * Smart Video Processor
 * Copyright (c) 2026. Xavier Fuentes <xfuentes-dev@hotmail.com>
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

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useI18n } from '../../i18n'
import { useSettings } from '../context/SettingsContext'

import { LogEntry, LogLevel } from '../../../../common/@types/Log'

const levelColor: Record<LogLevel, string> = {
  debug: 'inherit',
  info: '#1fa31f',
  warning: '#ff8c00',
  error: '#d32f2f'
}

export const LogPanel = (): React.JSX.Element => {
  const _ = useI18n()
  const { settingsValidation } = useSettings()
  const isDebugEnabled = settingsValidation.result?.isDebugEnabled ?? false
  const [logs, setLogs] = useState<LogEntry[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const filteredLogs = useMemo(() => {
    if (isDebugEnabled) return logs
    return logs.filter((entry) => entry.level !== 'debug')
  }, [logs, isDebugEnabled])

  useEffect(() => {
    const handleLogAdded = (entry: LogEntry) => {
      setLogs((prev) => [...prev, entry])
    }
    const dispose = window.api.main.addLogAddedListener(handleLogAdded)
    void window.api.main.getLogs().then(setLogs)
    return dispose
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [filteredLogs])

  return (
    <div
      ref={scrollRef}
      style={{
        backgroundColor: 'var(--colorNeutralBackground1)',
        height: '360px',
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '5px',
        border: '1px solid var(--colorNeutralStroke1)',
        boxSizing: 'border-box',
        fontFamily: 'monospace',
        fontSize: 'small',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all'
      }}
    >
      {filteredLogs.map((entry, index) => (
        <div key={index} style={{ marginBottom: '2px', color: levelColor[entry.level] }}>
          [{entry.timestamp}] {_(entry.key, entry.options ?? {})}
        </div>
      ))}
    </div>
  )
}

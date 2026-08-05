/*
 * Smart Video Processor
 * Copyright (c) 2025-2026. Xavier Fuentes <xfuentes-dev@hotmail.com>
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

import { Button, Dialog, DialogActions, DialogBody, DialogContent, DialogSurface } from '@fluentui/react-components'
import { Warning24Filled } from '@fluentui/react-icons'
import React, { useEffect, useState } from 'react'
import { useI18n } from '../i18n'

const SHUTDOWN_COUNTDOWN_SECONDS = 180

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ShutdownDialog = ({ open, onOpenChange }: Props): React.JSX.Element => {
  const _ = useI18n()
  const [remainingSeconds, setRemainingSeconds] = useState(SHUTDOWN_COUNTDOWN_SECONDS)

  useEffect(() => {
    if (!open) {
      setRemainingSeconds(SHUTDOWN_COUNTDOWN_SECONDS)
      return
    }
    setRemainingSeconds(SHUTDOWN_COUNTDOWN_SECONDS)
    const interval = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(interval)
          return 0
        }
        return previous - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [open])

  useEffect(() => {
    if (open && remainingSeconds === 0) {
      void window.api.main.shutdown()
    }
  }, [open, remainingSeconds])

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog modalType="modal" open={open} onOpenChange={(_event, data) => onOpenChange(data.open)}>
      <DialogSurface style={{ padding: '5px', minWidth: '400px' }}>
        <DialogBody>
          <DialogContent>
            <h3
              style={{
                marginBlockStart: 0,
                marginBlockEnd: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Warning24Filled style={{ color: 'red' }} />
              {_('shutdown.dialog.title', { defaultValue: 'Switch off the computer' })}
            </h3>
            <p>
              {_('shutdown.dialog.message', {
                defaultValue: 'The computer will switch off in {time} unless you click Cancel.',
                time: formattedTime
              })}
            </p>
          </DialogContent>
          <DialogActions style={{ paddingTop: '10px' }}>
            <Button size="small" appearance="primary" onClick={handleCancel}>
              {_('shutdown.dialog.cancel', { defaultValue: 'Cancel' })}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

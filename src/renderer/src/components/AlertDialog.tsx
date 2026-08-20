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

import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  JSXElement,
  Tooltip
} from '@fluentui/react-components'
import { DialogModalType } from '@fluentui/react-dialog'
import { Checkmark24Filled, Copy24Regular } from '@fluentui/react-icons'
import React from 'react'
import { useI18n } from '../i18n'
import { useSettings } from '@renderer/components/context/SettingsContext'

type Props = {
  title: string
  children: React.ReactNode
  modalType?: DialogModalType
  dismissKey?: string
  icon?: React.ReactNode
  copyCommand?: string
}

export const AlertDialog = ({
  title,
  children,
  modalType,
  dismissKey,
  icon,
  copyCommand
}: Props): JSXElement | null => {
  const _ = useI18n()
  const { settingsValidation, setSettingsValidation } = useSettings()
  const [open, setOpen] = React.useState(dismissKey ? !settingsValidation.result.dismissedAlerts[dismissKey] : true)
  const [doNotShowAgain, setDoNotShowAgain] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const handleDismiss = () => {
    if (dismissKey && doNotShowAgain) {
      const newSettings = {
        ...settingsValidation.result,
        dismissedAlerts: {
          ...settingsValidation.result.dismissedAlerts,
          [dismissKey]: true
        }
      }
      void window.api.main.saveSettings(newSettings).then(setSettingsValidation)
    }
    setOpen(false)
  }

  if (!open) {
    return null
  }

  return (
    <Dialog
      modalType={modalType}
      open={open}
      onOpenChange={(_, data) => {
        setOpen(data.open)
        if (data.open) {
          setCopied(false)
        }
      }}
    >
      <DialogSurface style={{ maxWidth: 'min(90vw, 600px)', width: '100%', boxSizing: 'border-box' }}>
        <DialogBody>
          <DialogTitle>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, width: '100%' }}>
              {icon}
              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere'
                }}
              >
                {title}
              </span>
            </span>
          </DialogTitle>
          <DialogContent>
            {children}
            {copyCommand && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <pre
                  style={{
                    flex: 1,
                    minWidth: 0,
                    width: '100%',
                    boxSizing: 'border-box',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    padding: '8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {copyCommand}
                </pre>
                <Tooltip
                  content={
                    copied ? _('alert.copied', { defaultValue: 'Copied!' }) : _('alert.copy', { defaultValue: 'Copy' })
                  }
                  relationship="label"
                >
                  <Button
                    icon={copied ? <Checkmark24Filled /> : <Copy24Regular />}
                    onClick={() => {
                      void navigator.clipboard.writeText(copyCommand).then(() => setCopied(true))
                    }}
                    size="small"
                  />
                </Tooltip>
              </div>
            )}
          </DialogContent>
          <DialogActions
            position="end"
            fluid
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '8px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            {dismissKey && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: 'auto' }}>
                <Checkbox
                  label={_('alert.do_not_show_again', { defaultValue: 'Do not show again' })}
                  checked={doNotShowAgain}
                  onChange={(_, data) => setDoNotShowAgain(Boolean(data.checked))}
                />
              </div>
            )}
            <Button
              size="small"
              appearance="secondary"
              style={{ alignSelf: 'center', height: 'fit-content' }}
              onClick={handleDismiss}
            >
              {_('alert.dismiss', { defaultValue: 'Dismiss' })}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

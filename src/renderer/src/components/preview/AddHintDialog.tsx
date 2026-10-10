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

import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Radio,
  RadioGroup,
  Tooltip
} from '@fluentui/react-components'
import { Add20Regular } from '@fluentui/react-icons'
import { useI18n } from '../../i18n'
import { HintType } from '../../../../common/@types/Hint'
import { AddableHint } from './addableHints'

type Props = {
  options: AddableHint[]
  disabled?: boolean
  onAdd: (option: AddableHint) => void
}

const optionKey = (o: AddableHint) => `${o.hintType}|${o.trackType}|${o.trackId}`

export const AddHintDialog = ({ options, disabled, onAdd }: Props) => {
  const _ = useI18n()
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<string>('')

  const hintLabel = (type: HintType) =>
    type === HintType.LANGUAGE
      ? _('hints.language', { defaultValue: 'Language' })
      : _('hints.subtitles_type', { defaultValue: 'Subtitles Type' })
  const optionLabel = (o: AddableHint) =>
    `${_('track_type.' + o.trackType.toLowerCase() + '.label_id', { defaultValue: `${o.trackType} {id}`, id: o.trackId })} - ${hintLabel(o.hintType)}`

  const confirm = () => {
    const option = options.find((o) => optionKey(o) === selected)
    if (option !== undefined) {
      onAdd(option)
    }
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(_ev, data) => {
        setOpen(data.open)
        if (data.open) {
          setSelected('')
        }
      }}
    >
      <Tooltip
        content={
          options.length > 0
            ? _('hints.add.tooltip', { defaultValue: 'Add a hint' })
            : _('hints.add.none', { defaultValue: 'All available hints are already shown.' })
        }
        relationship="label"
      >
        <DialogTrigger disableButtonEnhancement>
          <Button appearance="primary" size="small" icon={<Add20Regular />} disabled={disabled || options.length === 0}>
            {_('hints.add.button', { defaultValue: 'New hint' })}
          </Button>
        </DialogTrigger>
      </Tooltip>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>{_('hints.add.title', { defaultValue: 'Add a hint' })}</DialogTitle>
          <DialogContent>
            <p style={{ marginTop: 0 }}>
              {_('hints.add.description', { defaultValue: 'Choose what you want to be able to edit.' })}
            </p>
            <RadioGroup value={selected} onChange={(_ev, data) => setSelected(data.value)}>
              {options.map((o) => (
                <Radio key={optionKey(o)} value={optionKey(o)} label={optionLabel(o)} />
              ))}
            </RadioGroup>
          </DialogContent>
          <DialogActions>
            <DialogTrigger disableButtonEnhancement>
              <Button appearance="secondary">{_('hints.add.cancel', { defaultValue: 'Cancel' })}</Button>
            </DialogTrigger>
            <Button appearance="primary" disabled={selected === ''} onClick={confirm}>
              {_('hints.add.confirm', { defaultValue: 'Add' })}
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  )
}

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

import { Button, Combobox, ComboboxProps, Option, Tooltip } from '@fluentui/react-components'
import React, { useEffect } from 'react'
import { Dismiss12Regular } from '@fluentui/react-icons'
import { searchAncestorsMatching } from '../../utils'
import { Languages } from '../../../../common/LanguageIETF'

type MultipleProps = {
  multiselect: true
  value: string[]
  onChanges: (values: string[]) => void
}

type SingleProps = {
  multiselect: false
  value: string
  onChange: (value: string) => void
}

type Props = {
  id: string
  size?: 'small' | 'medium' | 'large'
  required?: boolean
  disabled?: boolean
} & (MultipleProps | SingleProps)

export const LanguageSelector = (props: Props) => {
  const comboboxInputRef = React.useRef<HTMLInputElement>(null)
  const [value, setValue] = React.useState(
    !props.multiselect ? (Languages.getLanguageByCode(props.value)?.label ?? '') : ''
  )

  useEffect(() => {
    setValue(!props.multiselect ? (Languages.getLanguageByCode(props.value)?.label ?? '') : '')
  }, [props.multiselect, props.value])

  const handleSelect: ComboboxProps['onOptionSelect'] = (_event, data) => {
    // update selectedOptions
    if (props.multiselect) {
      props.onChanges(data.selectedOptions)
    } else {
      setValue(data.optionText ?? '')
      props.onChange(data.optionValue ?? '')
    }
  }

  // Only for single selection
  const handleInput = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setValue(ev.target.value)
  }

  const onTagClick = (option: string, _index: number, _event: React.MouseEvent<HTMLButtonElement>) => {
    if (props.multiselect && _event.target instanceof Element) {
      const button = searchAncestorsMatching(_event.target, (e) => e instanceof HTMLButtonElement)
      if (button?.nextElementSibling instanceof HTMLButtonElement) {
        button?.nextElementSibling.focus()
      } else if (button?.previousElementSibling instanceof HTMLButtonElement) {
        button?.previousElementSibling.focus()
      } else {
        comboboxInputRef.current?.focus()
      }
      props.onChanges(props.value.filter((o) => o !== option))
    }
  }

  return (
    <>
      {props.multiselect ? (
        <>
          {props.value.length ? (
            <ul
              id={props.id + 'Selection'}
              className={'tags-list'}
              style={{ textOverflow: 'ellipsis', overflow: 'auto' }}
            >
              {/* The "Remove" span is used for naming the buttons without affecting the Combobox name */}
              <span id={`${props.id}-remove`} hidden>
                Remove
              </span>
              {props.value.map((code, i) => {
                const desc = Languages.getLanguageByCode(code)?.label
                return (
                  <Button
                    disabled={!!props.disabled}
                    key={code}
                    size="small"
                    shape="circular"
                    appearance="primary"
                    icon={<Dismiss12Regular />}
                    iconPosition="after"
                    onClick={onTagClick.bind(null, code, i)}
                    id={`${props.id}-remove-${code}`}
                    aria-labelledby={`${props.id}-remove ${props.id}-remove-${i}`}
                    style={{ textWrap: 'nowrap' }}
                  >
                    {desc === undefined ? (
                      { code }
                    ) : (
                      <Tooltip content={desc} relationship="description">
                        <span>{code}</span>
                      </Tooltip>
                    )}
                  </Button>
                )
              })}
            </ul>
          ) : null}
          <Combobox
            multiselect={props.multiselect}
            placeholder="Select one or more languages"
            selectedOptions={props.value}
            onOptionSelect={handleSelect}
            size={props.size}
            ref={comboboxInputRef}
            disabled={!!props.disabled}
          >
            {Languages.getList().map((lang) => (
              <Option key={lang.code} value={lang.code}>
                {lang.label}
              </Option>
            ))}
          </Combobox>
        </>
      ) : (
        <>
          <Combobox
            placeholder="Select a language"
            value={value}
            selectedOptions={[props.value]}
            onInput={handleInput}
            onOptionSelect={handleSelect}
            style={{ minWidth: '200px' }}
            size={props.size}
            ref={comboboxInputRef}
            disabled={!!props.disabled}
          >
            {Languages.getList().map((lang) => (
              <Option key={lang.code} value={lang.code} text={lang.label}>
                {lang.label}
              </Option>
            ))}
          </Combobox>
        </>
      )}
    </>
  )
}

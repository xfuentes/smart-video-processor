/*
 * Smart Video Processor
 * Copyright (c) 2025-2026. Xavier Fuentes <xfuentes-dev@serviam.cc>
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
import React from 'react'
import { Dismiss12Regular } from '@fluentui/react-icons'
import { searchAncestorsMatching } from '../../utils'
import { LanguageIETF, Languages } from '../../../../common/LanguageIETF'
import { useI18n } from '../../i18n'
import { Strings } from '../../../../common/Strings'

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
  includeEnglishInLabel?: boolean
  disabled?: boolean
  allowedCodes?: string[]
} & (MultipleProps | SingleProps)

export const LanguageSelector = (props: Props) => {
  const _ = useI18n()

  const comboboxInputRef = React.useRef<HTMLInputElement>(null)
  const getLanguageDisplay = (language: LanguageIETF): string => {
    const englishText = language.label
    const i18nText = _(language.i18nKey, { defaultValue: language.label })
    return props.includeEnglishInLabel && englishText != i18nText ? `${i18nText} (${englishText})` : i18nText
  }
  const languageOptions = (
    props.allowedCodes ? Languages.getList().filter((l) => props.allowedCodes!.includes(l.code)) : Languages.getList()
  ).sort((a, b) => getLanguageDisplay(a).localeCompare(getLanguageDisplay(b)))
  const selectedLanguage = !props.multiselect ? Languages.getLanguageByCode(props.value) : undefined
  // The typed or just chosen text, shown until the selected value changes.
  const [draft, setDraft] = React.useState<string>()
  const currentValue = props.multiselect ? undefined : props.value
  const [previousValue, setPreviousValue] = React.useState(currentValue)
  if (currentValue !== previousValue) {
    setPreviousValue(currentValue)
    setDraft(undefined)
  }
  const value = draft ?? (selectedLanguage ? getLanguageDisplay(selectedLanguage) : '')

  // Text typed in the multiple selection input.
  const [query, setQuery] = React.useState('')

  // The text typed by the user, ignored while it only shows the selected language.
  const searchText = props.multiselect
    ? query
    : draft !== undefined && draft !== (selectedLanguage ? getLanguageDisplay(selectedLanguage) : '')
      ? draft
      : ''
  const searchTokens = Strings.normalizeForComparison(searchText).split(' ').filter(Boolean)
  const matchingOptions = languageOptions.filter((lang) => {
    // Matches the displayed name, the English name or the code, ignoring case and accents.
    const haystack = Strings.normalizeForComparison(`${getLanguageDisplay(lang)} ${lang.label} ${lang.code}`)
    return searchTokens.every((token) => haystack.includes(token))
  })

  const handleSelect: ComboboxProps['onOptionSelect'] = (_event, data) => {
    // update selectedOptions
    if (props.multiselect) {
      setQuery('')
      props.onChanges(data.selectedOptions)
    } else if (data.optionValue !== undefined) {
      // Typing clears the selection in the combobox, which must not reset the typed text.
      setDraft(data.optionText ?? '')
      props.onChange(data.optionValue)
    }
  }

  // Only for single selection
  const handleInput = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setDraft(ev.target.value)
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
                {_('language_selector.remove', { defaultValue: 'Remove' })}
              </span>
              {props.value.map((code, i) => {
                const lang = Languages.getLanguageByCode(code)
                const desc = lang ? getLanguageDisplay(lang) : undefined
                return (
                  <Button
                    disabled={!!props.disabled}
                    key={code}
                    size="small"
                    shape="circular"
                    appearance="primary"
                    icon={<Dismiss12Regular />}
                    iconPosition="after"
                    onClick={(event) => onTagClick(code, i, event)}
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
            placeholder={_('language_selector.placeholder.multiple', { defaultValue: 'Select one or more languages' })}
            selectedOptions={props.value}
            value={query}
            onInput={(ev: React.ChangeEvent<HTMLInputElement>) => setQuery(ev.target.value)}
            input={{ onBlur: () => setQuery('') }}
            onOptionSelect={handleSelect}
            size={props.size}
            ref={comboboxInputRef}
            disabled={!!props.disabled}
          >
            {matchingOptions.map((lang) => (
              <Option key={lang.code} value={lang.code}>
                {getLanguageDisplay(lang)}
              </Option>
            ))}
          </Combobox>
        </>
      ) : (
        <>
          <Combobox
            placeholder={_('language_selector.placeholder.single', { defaultValue: 'Select a language' })}
            value={value}
            selectedOptions={[props.value]}
            onInput={handleInput}
            input={{ onBlur: () => setDraft(undefined) }}
            onOptionSelect={handleSelect}
            style={{ minWidth: '200px' }}
            size={props.size}
            ref={comboboxInputRef}
            disabled={!!props.disabled}
          >
            {matchingOptions.map((lang) => (
              <Option key={lang.code} value={lang.code} text={getLanguageDisplay(lang)}>
                {getLanguageDisplay(lang)}
              </Option>
            ))}
          </Combobox>
        </>
      )}
    </>
  )
}

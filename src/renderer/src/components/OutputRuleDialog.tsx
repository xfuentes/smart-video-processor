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

import {
  Button,
  Combobox,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  Input,
  InputOnChangeData,
  Label,
  Option,
  Select,
  SelectTabData
} from '@fluentui/react-components'
import { Dispatch, SetStateAction } from 'react'
import {
  OutputRule,
  OutputRuleOperator,
  OutputRuleProperty
} from '../../../common/@types/Settings'
import { tmdbSupportedLanguageCodes, tvdbSupportedLanguageCodes } from '../../../common/TranslationSupportedLanguages'
import { Countries } from '../../../common/Countries'
import { Languages } from '../../../common/LanguageIETF'
import { useI18n } from '../i18n'

const GENRE_KEYS = [
  'action',
  'adventure',
  'animation',
  'anime',
  'awards_show',
  'children',
  'comedy',
  'crime',
  'documentary',
  'drama',
  'family',
  'fantasy',
  'food',
  'game_show',
  'history',
  'home_and_garden',
  'horror',
  'indie',
  'martial_arts',
  'mini_series',
  'musical',
  'mystery',
  'news',
  'podcast',
  'reality',
  'romance',
  'science_fiction',
  'soap',
  'sport',
  'suspense',
  'talk_show',
  'thriller',
  'travel',
  'war',
  'western'
]

const QUALITY_KEYS = ['SD', 'HD', 'FHD', 'QHD', '4K', '8K']

const QUALITY_LABELS: Record<string, string> = {
  SD: 'SD 480p',
  HD: 'HD 720p',
  FHD: 'FHD 1080p',
  QHD: 'QHD 1440p',
  '4K': '4K 2160p',
  '8K': '8K 4320p'
}

const ALLOWED_LANGUAGE_CODES = Array.from(new Set([...tmdbSupportedLanguageCodes, ...tvdbSupportedLanguageCodes]))

const ALLOWED_LANGUAGES = Languages.getList()
  .filter((l) => ALLOWED_LANGUAGE_CODES.includes(l.code))
  .sort((a, b) => a.label.localeCompare(b.label))

const COUNTRIES = Countries.getList().sort((a, b) => a.label.localeCompare(b.label))

const VALID_OPERATORS: Record<OutputRuleProperty, OutputRuleOperator[]> = {
  type: ['eq', 'neq', 'in'],
  language: ['eq', 'neq', 'in'],
  year: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in'],
  genres: ['containsAny', 'containsAll'],
  country: ['containsAny', 'containsAll'],
  quality: ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in']
}

export type OutputRuleDialogProps = {
  open: boolean
  ruleDraft: OutputRule | undefined
  setRuleDraft: Dispatch<SetStateAction<OutputRule | undefined>>
  onSave: () => void
  onCancel: () => void
  getOperatorLabel: (operator: OutputRuleOperator) => string
  language: string
}

export const OutputRuleDialog = ({
  open,
  ruleDraft,
  setRuleDraft,
  onSave,
  onCancel,
  getOperatorLabel,
  language
}: OutputRuleDialogProps) => {
  const _ = useI18n()

  const updateRuleMatch = (match: 'all' | 'any') => {
    setRuleDraft((draft) => (draft === undefined ? undefined : { ...draft, match }))
  }

  const updateConditionProperty = (index: number, property: OutputRuleProperty) => {
    const validOperators = VALID_OPERATORS[property]
    if (validOperators === undefined) return
    setRuleDraft((draft) => {
      if (draft === undefined) return undefined
      const conditions = [...draft.conditions]
      const operator = validOperators[0]
      let value: string | string[] = ''
      if (property === 'type') {
        value = 'movie'
      } else if (property === 'language') {
        value = language
      } else if (property === 'genres') {
        value = [_('genre.' + GENRE_KEYS[0], { defaultValue: GENRE_KEYS[0] })]
      } else if (property === 'country') {
        value = []
      } else if (property === 'quality') {
        value = QUALITY_KEYS[0]
      }
      conditions[index] = { ...conditions[index], property, operator, value }
      return { ...draft, conditions }
    })
  }

  const updateConditionOperator = (index: number, operator: OutputRuleOperator) => {
    setRuleDraft((draft) => {
      if (draft === undefined) return undefined
      const conditions = [...draft.conditions]
      const condition = conditions[index]
      let value: string | string[] = condition.value
      if (operator === 'in' && !Array.isArray(value)) {
        value = value ? [value] : []
      } else if (condition.operator === 'in' && Array.isArray(value)) {
        value = value[0] ?? ''
      }
      conditions[index] = { ...condition, operator, value }
      return { ...draft, conditions }
    })
  }

  const updateConditionValue = (index: number, value: string | string[]) => {
    setRuleDraft((draft) => {
      if (draft === undefined) return undefined
      const conditions = [...draft.conditions]
      conditions[index] = { ...conditions[index], value }
      return { ...draft, conditions }
    })
  }

  const addConditionToRuleDraft = () => {
    setRuleDraft((draft) => {
      if (draft === undefined) return undefined
      return {
        ...draft,
        conditions: [
          ...draft.conditions,
          {
            property: 'type' as OutputRuleProperty,
            operator: 'eq' as OutputRuleOperator,
            value: 'movie'
          }
        ]
      }
    })
  }

  const removeConditionFromRuleDraft = (index: number) => {
    setRuleDraft((draft) => {
      if (draft === undefined) return undefined
      return { ...draft, conditions: draft.conditions.filter((_, i) => i !== index) }
    })
  }

  const updateRuleOutputPath = (outputPath: string) => {
    setRuleDraft((draft) => (draft === undefined ? undefined : { ...draft, outputPath }))
  }

  const pickRuleOutputPath = async () => {
    if (ruleDraft === undefined) return
    const selected = await window.api.main.openDirectoryExplorer(
      _('settings.output_rules.browse.title', { defaultValue: 'Select Output Directory' }),
      ruleDraft.outputPath
    )
    if (selected) {
      updateRuleOutputPath(selected)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(_event, data) => { if (!data.open) onCancel() }} modalType="modal">
      <DialogSurface style={{ minWidth: '600px', padding: '10px' }}>
        <DialogBody>
          <DialogContent>
            <div className="settings-form">
              <div className="field">
                <Label size="small">{_('settings.output_rules.match.label', { defaultValue: 'Match' })}</Label>
                <Select
                  size="small"
                  value={ruleDraft?.match ?? 'all'}
                  onChange={(_ev, data: SelectTabData) => updateRuleMatch(data.value as 'all' | 'any')}
                >
                  <option value="all">
                    {_('settings.output_rules.match.all', { defaultValue: 'All conditions (&&)' })}
                  </option>
                  <option value="any">
                    {_('settings.output_rules.match.any', { defaultValue: 'Any condition (||)' })}
                  </option>
                </Select>
              </div>
              {ruleDraft?.conditions.map((condition, index) => (
                <div
                  key={index}
                  className="field"
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 2fr auto', gap: '5px' }}
                >
                  <Select
                    size="small"
                    value={condition.property}
                    onChange={(_ev, data: SelectTabData) =>
                      updateConditionProperty(index, data.value as OutputRuleProperty)
                    }
                  >
                    <option value="type">type</option>
                    <option value="language">language</option>
                    <option value="year">year</option>
                    <option value="genres">genres</option>
                    <option value="country">country</option>
                    <option value="quality">quality</option>
                  </Select>
                  <Select
                    size="small"
                    value={condition.operator}
                    onChange={(_ev, data: SelectTabData) =>
                      updateConditionOperator(index, data.value as OutputRuleOperator)
                    }
                  >
                    {(VALID_OPERATORS[condition.property] ?? []).map((op) => (
                      <option key={op} value={op}>
                        {getOperatorLabel(op)}
                      </option>
                    ))}
                  </Select>
                  {condition.operator === 'in' ? (
                    condition.property === 'type' ? (
                      <Combobox
                        multiselect
                        size="small"
                        value={Array.isArray(condition.value) ? condition.value.join(', ') : ''}
                        selectedOptions={Array.isArray(condition.value) ? condition.value : []}
                        onOptionSelect={(_ev, data) => updateConditionValue(index, data.selectedOptions)}
                        onInput={() => {}}
                      >
                        <Option value="movie">{_('video_type.movie.label', { defaultValue: 'Movie' })}</Option>
                        <Option value="tv-show">{_('video_type.tv_show.label', { defaultValue: 'TV-Show' })}</Option>
                        <Option value="other">{_('video_type.other.label', { defaultValue: 'Other' })}</Option>
                      </Combobox>
                    ) : condition.property === 'quality' ? (
                      <Combobox
                        multiselect
                        size="small"
                        value={Array.isArray(condition.value) ? condition.value.join(', ') : ''}
                        selectedOptions={Array.isArray(condition.value) ? condition.value : []}
                        onOptionSelect={(_ev, data) => updateConditionValue(index, data.selectedOptions)}
                        onInput={() => {}}
                      >
                        {QUALITY_KEYS.map((quality) => (
                          <Option key={quality} value={quality}>
                            {QUALITY_LABELS[quality]}
                          </Option>
                        ))}
                      </Combobox>
                    ) : condition.property === 'language' ? (
                      <Combobox
                        multiselect
                        size="small"
                        value={Array.isArray(condition.value) ? condition.value.join(', ') : ''}
                        selectedOptions={Array.isArray(condition.value) ? condition.value : []}
                        onOptionSelect={(_ev, data) => updateConditionValue(index, data.selectedOptions)}
                        onInput={() => {}}
                      >
                        {ALLOWED_LANGUAGES.map((lang) => (
                          <Option key={lang.code} value={lang.code}>
                            {_(lang.i18nKey, { defaultValue: lang.label })}
                          </Option>
                        ))}
                      </Combobox>
                    ) : (
                      <Input
                        size="small"
                        type="text"
                        value={
                          Array.isArray(condition.value) ? condition.value.join(', ') : (condition.value as string)
                        }
                        onChange={(_ev, data: InputOnChangeData) =>
                          updateConditionValue(
                            index,
                            data.value
                              .split(',')
                              .map((v) => v.trim())
                              .filter(Boolean)
                          )
                        }
                      />
                    )
                  ) : condition.property === 'type' ? (
                    <Select
                      size="small"
                      value={condition.value as string}
                      onChange={(_ev, data: SelectTabData) => updateConditionValue(index, data.value as string)}
                    >
                      <option value="movie">{_('video_type.movie.label', { defaultValue: 'Movie' })}</option>
                      <option value="tv-show">{_('video_type.tv_show.label', { defaultValue: 'TV-Show' })}</option>
                      <option value="other">{_('video_type.other.label', { defaultValue: 'Other' })}</option>
                    </Select>
                  ) : condition.property === 'quality' ? (
                    <Select
                      size="small"
                      value={condition.value as string}
                      onChange={(_ev, data: SelectTabData) => updateConditionValue(index, data.value as string)}
                    >
                      {QUALITY_KEYS.map((quality) => (
                        <option key={quality} value={quality}>
                          {QUALITY_LABELS[quality]}
                        </option>
                      ))}
                    </Select>
                  ) : condition.property === 'country' ? (
                    <Combobox
                      multiselect
                      size="small"
                      value={Array.isArray(condition.value) ? condition.value.join(', ') : ''}
                      selectedOptions={Array.isArray(condition.value) ? condition.value : []}
                      onOptionSelect={(_ev, data) => updateConditionValue(index, data.selectedOptions)}
                      onInput={() => {}}
                    >
                      {COUNTRIES.map((country) => (
                        <Option key={country.alpha2} value={country.alpha2}>
                          {country.label}
                        </Option>
                      ))}
                    </Combobox>
                  ) : condition.property === 'genres' ? (
                    <Combobox
                      multiselect
                      size="small"
                      value={Array.isArray(condition.value) ? condition.value.join(', ') : ''}
                      selectedOptions={Array.isArray(condition.value) ? condition.value : []}
                      onOptionSelect={(_ev, data) => updateConditionValue(index, data.selectedOptions)}
                      onInput={() => {}}
                    >
                      {GENRE_KEYS.map((key) => {
                        const label = _('genre.' + key, { defaultValue: key })
                        return (
                          <Option key={key} value={label}>
                            {label}
                          </Option>
                        )
                      })}
                    </Combobox>
                  ) : condition.property === 'language' ? (
                    <Select
                      size="small"
                      value={condition.value as string}
                      onChange={(_ev, data: SelectTabData) => updateConditionValue(index, data.value as string)}
                    >
                      {ALLOWED_LANGUAGES.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {_(lang.i18nKey, { defaultValue: lang.label })}
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <Input
                      size="small"
                      type="text"
                      value={condition.value as string}
                      onChange={(_ev, data: InputOnChangeData) => updateConditionValue(index, data.value as string)}
                    />
                  )}
                  <div />
                  <Button size="small" onClick={() => removeConditionFromRuleDraft(index)}>
                    {_('settings.output_rules.remove_condition', { defaultValue: 'Remove' })}
                  </Button>
                </div>
              ))}
              <div className="field">
                <Button size="small" onClick={addConditionToRuleDraft}>
                  {_('settings.output_rules.add_condition', { defaultValue: 'Add Condition' })}
                </Button>
              </div>
              <div className="field">
                <Label size="small" required htmlFor="ruleOutputPathInput">
                  {_('settings.output_rules.output_path.label', { defaultValue: 'Output Path' })}
                </Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '5px' }}>
                  <Input
                    required
                    size="small"
                    type="text"
                    id="ruleOutputPathInput"
                    value={ruleDraft?.outputPath ?? ''}
                    onChange={(_ev, data: InputOnChangeData) => updateRuleOutputPath(data.value)}
                  />
                  <Button size="small" onClick={pickRuleOutputPath}>
                    {_('settings.output_rules.browse', { defaultValue: 'Browse' })}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </DialogBody>
        <DialogActions style={{ paddingTop: '10px' }}>
          <Button
            appearance="primary"
            disabled={
              ruleDraft === undefined ||
              ruleDraft.conditions.some((c) => (Array.isArray(c.value) ? c.value.length === 0 : c.value === '')) ||
              ruleDraft.outputPath.trim() === ''
            }
            onClick={onSave}
          >
            {_('settings.output_rules.apply', { defaultValue: 'Apply' })}
          </Button>
          <Button onClick={onCancel}>{_('settings.output_rules.cancel', { defaultValue: 'Cancel' })}</Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  )
}

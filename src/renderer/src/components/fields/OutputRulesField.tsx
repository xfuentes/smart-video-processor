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

import React, { useMemo, useState } from 'react'
import { Button, Checkbox, CheckboxOnChangeData, Divider, Tooltip } from '@fluentui/react-components'
import { Edit20Regular, ReOrderDotsVertical20Regular } from '@fluentui/react-icons'
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  OutputRule,
  OutputRuleCondition,
  OutputRuleOperator,
  OutputRuleProperty
} from '../../../../common/@types/Settings'
import { useI18n } from '../../i18n'
import { OutputRuleDialog } from './OutputRuleDialog'

type SortableRuleProps = {
  rule: OutputRule
  ruleId: string
  ruleText: string
  updateRuleEnabled: (enabled: boolean) => void
  onEdit: () => void
}

const SortableRule = ({ rule, ruleId, ruleText, updateRuleEnabled, onEdit }: SortableRuleProps) => {
  const _ = useI18n()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ruleId })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr auto',
    gap: '5px',
    alignItems: 'center'
  }
  return (
    <div ref={setNodeRef} style={style} className="field">
      <div style={{ cursor: 'grab', display: 'flex', alignItems: 'center' }} {...attributes} {...listeners}>
        <ReOrderDotsVertical20Regular />
      </div>
      <Checkbox
        checked={rule.enabled}
        label={ruleText}
        onChange={(_ev, data: CheckboxOnChangeData) => updateRuleEnabled(data.checked as boolean)}
      />
      <Tooltip content={_('settings.output_rules.edit', { defaultValue: 'Edit' })} relationship="label">
        <Button size="small" icon={<Edit20Regular />} onClick={onEdit} />
      </Tooltip>
    </div>
  )
}

type OutputRulesFieldProps = {
  rules: OutputRule[]
  onChange: (rules: OutputRule[]) => void
  language: string
}

export const OutputRulesField = ({ rules, onChange, language }: OutputRulesFieldProps) => {
  const _ = useI18n()
  const ruleIds = useMemo(() => {
    const baseIds = rules.map((rule) =>
      JSON.stringify(rule, ['match', 'conditions', 'outputPath', 'property', 'operator', 'value'])
    )
    const counts: Record<string, number> = {}
    baseIds.forEach((id) => {
      counts[id] = (counts[id] ?? 0) + 1
    })
    const seen: Record<string, number> = {}
    return baseIds.map((id) => {
      if (counts[id] === 1) return id
      seen[id] = (seen[id] ?? 0) + 1
      return `${id}#${seen[id] - 1}`
    })
  }, [rules])

  const [editingRuleIndex, setEditingRuleIndex] = useState<number>(-1)
  const [ruleDraft, setRuleDraft] = useState<OutputRule | undefined>()
  const [ruleModalOpen, setRuleModalOpen] = useState(false)

  const getOperatorLabel = (operator: OutputRuleOperator): string => {
    switch (operator) {
      case 'eq':
        return '='
      case 'neq':
        return '!='
      case 'lt':
        return '<'
      case 'lte':
        return '<='
      case 'gt':
        return '>'
      case 'gte':
        return '>='
      case 'in':
        return _('settings.output_rules.operator.in', { defaultValue: 'in' })
      case 'containsAny':
        return _('settings.output_rules.operator.contains_any', { defaultValue: 'contains any of' })
      case 'containsAll':
        return _('settings.output_rules.operator.contains_all', { defaultValue: 'contains all of' })
      default:
        return operator
    }
  }

  const formatCondition = (condition: OutputRuleCondition): string => {
    const valueText = Array.isArray(condition.value) ? condition.value.join(', ') : condition.value
    return `${condition.property} ${getOperatorLabel(condition.operator)} ${valueText}`
  }

  const formatRuleAsText = (rule: OutputRule): string => {
    if (rule.conditions.length === 0) return rule.outputPath
    const conditionsText = rule.conditions.map(formatCondition).join(rule.match === 'all' ? ' && ' : ' || ')
    if (rule.outputPath) return `${conditionsText} -> ${rule.outputPath}`
    return conditionsText
  }

  const createDefaultRule = (): OutputRule => ({
    enabled: true,
    match: 'all',
    conditions: [
      {
        property: 'type' as OutputRuleProperty,
        operator: 'eq' as OutputRuleOperator,
        value: 'movie'
      }
    ],
    outputPath: ''
  })

  const openAddRuleModal = () => {
    setEditingRuleIndex(-1)
    setRuleDraft(createDefaultRule())
    setRuleModalOpen(true)
  }

  const openEditRuleModal = (index: number) => {
    setEditingRuleIndex(index)
    setRuleDraft(JSON.parse(JSON.stringify(rules[index])) as OutputRule)
    setRuleModalOpen(true)
  }

  const closeRuleModal = () => {
    setRuleModalOpen(false)
    setRuleDraft(undefined)
  }

  const saveRuleModal = () => {
    if (ruleDraft === undefined) return
    if (editingRuleIndex === -1) {
      onChange([...rules, ruleDraft])
    } else {
      onChange(rules.map((r, i) => (i === editingRuleIndex ? ruleDraft : r)))
    }
    closeRuleModal()
  }

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index))
  }

  const updateRuleEnabled = (index: number, enabled: boolean) => {
    onChange(rules.map((r, i) => (i === index ? { ...r, enabled } : r)))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over === null || active.id === over.id) return
    const currentRuleIds = ruleIds
    const oldIndex = currentRuleIds.indexOf(active.id as string)
    const newIndex = currentRuleIds.indexOf(over.id as string)
    if (oldIndex === -1 || newIndex === -1) return
    onChange(arrayMove(rules, oldIndex, newIndex))
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  return (
    <>
      <Divider style={{ flexGrow: '0' }}>
        {_('settings.output_rules.divider', { defaultValue: 'Output Rules' })}
      </Divider>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={ruleIds} strategy={verticalListSortingStrategy}>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {rules.map((rule, index) => (
              <SortableRule
                key={ruleIds[index]}
                ruleId={ruleIds[index]}
                rule={rule}
                ruleText={formatRuleAsText(rule)}
                updateRuleEnabled={(enabled) => updateRuleEnabled(index, enabled)}
                onEdit={() => openEditRuleModal(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="field">
        <Button size="small" onClick={openAddRuleModal}>
          {_('settings.output_rules.add', { defaultValue: 'Add Rule' })}
        </Button>
      </div>
      <OutputRuleDialog
        open={ruleModalOpen}
        ruleDraft={ruleDraft}
        setRuleDraft={setRuleDraft}
        onSave={saveRuleModal}
        onCancel={closeRuleModal}
        onDelete={
          editingRuleIndex >= 0
            ? () => {
                removeRule(editingRuleIndex)
                closeRuleModal()
              }
            : undefined
        }
        getOperatorLabel={getOperatorLabel}
        language={language}
      />
    </>
  )
}

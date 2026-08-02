import { Button, Field, Input } from '@fluentui/react-components'
import type { Slot } from '@fluentui/react-utilities'
import { _ } from '../../i18n'
import { Label } from '@fluentui/react-label'
import { BinRecycle24Regular, BinRecycleFull24Regular, FolderOpenRegular } from '@fluentui/react-icons'

type Props = {
  id?: string | undefined
  label?: Slot<typeof Label>
  size?: 'small' | 'medium' | 'large'
  required?: boolean
  disabled?: boolean
  value: string
  onChange?: (newFile: string) => void
  validationState?: 'error' | 'warning' | 'success' | 'none'
  validationMessage?: Slot<'div'>
  clearable?: boolean
}

export const FileSelectorField = (props: Props) => {
  const { clearable = false } = props
  const title =
    typeof props.label === 'string' || props.label instanceof String
      ? '' + props.label
      : _('file_selector.select_a_file', { defaultValue: 'Select a file' })
  const isClearable = !!props.value
  return (
    <Field
      label={props.label}
      size={props.size}
      required={props.required}
      validationState={props.validationState}
      validationMessage={props.validationMessage}
      style={{ width: '100%' }}
    >
      <div className={'component-horizontal-fill'}>
        <Input style={{ flexGrow: 1 }} size={props.size} type="text" readOnly value={props.value} />
        <Button
          icon={<FolderOpenRegular />}
          disabled={props.disabled}
          size={props.size}
          id={props.id}
          onClick={async () => {
            const selectedFile = await window.api.main.openSingleFileExplorer(title, props.value)
            if (selectedFile && props.onChange) {
              props.onChange(selectedFile)
            }
          }}
        >
          {_('file_selector.browse', { defaultValue: 'Browse' })}
        </Button>
        {clearable && (
          <Button
            icon={isClearable ? <BinRecycleFull24Regular /> : <BinRecycle24Regular />}
            disabled={!isClearable}
            size={props.size}
            onClick={async () => props.onChange && props.onChange('')}
          >
            {_('file_selector.clear', { defaultValue: 'Clear' })}
          </Button>
        )}
      </div>
    </Field>
  )
}

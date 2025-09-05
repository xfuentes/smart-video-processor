import { Button, Field, Input } from '@fluentui/react-components'
import type { Slot } from '@fluentui/react-utilities'
import { Label } from '@fluentui/react-label'
import { FolderOpenRegular } from '@fluentui/react-icons'

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
}

export const FileSelectorField = (props: Props) => {
  const title = typeof props.label === 'string' || props.label instanceof String ? '' + props.label : 'Select a file'
  return (
    <Field
      label={props.label}
      size={props.size}
      required={props.required}
      validationState={props.validationState}
      validationMessage={props.validationMessage}
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
          Browse
        </Button>
      </div>
    </Field>
  )
}

import React, { MouseEventHandler } from 'react'
import { Button, Spinner } from '@fluentui/react-components'
import type { Slot } from '@fluentui/react-utilities'

declare type ButtonSize = 'small' | 'medium' | 'large'

type Props = {
  onStarted?: () => void
  onSuccess?: () => void
  onError?: () => void
  appearance?: 'secondary' | 'primary' | 'outline' | 'subtle' | 'transparent'
  type?: string | undefined
  children?: React.ReactNode
  execute: () => Promise<unknown>
  onClick?: MouseEventHandler<HTMLButtonElement>
  size?: ButtonSize
  disabled?: boolean
}

export const ProgressButton = (props: Props) => {
  const [icon, setIcon] = React.useState<Slot<'span'> | undefined>()

  const handleClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    props.onStarted && props.onStarted()
    setIcon(<Spinner size="extra-tiny" />)
    props
      .execute()
      .then(() => {
        props.onSuccess && props.onSuccess()
        setIcon(undefined)
        // The following will propagate the onClick event only if the task was successful
        props.onClick && props.onClick(event)
      })
      .catch((e) => {
        console.error(e)
        props.onError && props.onError()
        setIcon(undefined)
      })
  }

  return (
    <Button
      size={props.size}
      icon={icon}
      disabled={icon !== undefined || props.disabled}
      onClick={handleClick}
      appearance={props.appearance}
    >
      {props.children}
    </Button>
  )
}

import './assets/styles/main.css'

import React, { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components'
import { App } from './App'
import { initializeIcons } from '@fluentui/react'
import i18n from './i18n'

const version = window.api.main.version
const development = window.api.main.development

initializeIcons()
document.title = `Smart Video Processor  v${version}${development ? ' - ' + i18n.t('title.development', { defaultValue: 'Development' }) : ''}`
console.log(document.title)

function getSystemDark(): boolean {
  const dark = window.matchMedia('(prefers-color-scheme: dark)')
  const light = window.matchMedia('(prefers-color-scheme: light)')
  return dark.matches || !light.matches
}

function useSystemTheme(): boolean {
  const [isDark, setIsDark] = useState(getSystemDark)
  useEffect(() => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)')
    const light = window.matchMedia('(prefers-color-scheme: light)')
    const handler = () => setIsDark(dark.matches || !light.matches)
    dark.addEventListener('change', handler)
    light.addEventListener('change', handler)
    return () => {
      dark.removeEventListener('change', handler)
      light.removeEventListener('change', handler)
    }
  }, [])
  return isDark
}

export const Root = (): React.JSX.Element => {
  const isDark = useSystemTheme()
  return (
    <FluentProvider
      theme={isDark ? webDarkTheme : webLightTheme}
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: 'var(--colorNeutralBackground1)',
        color: 'var(--colorNeutralForeground1)'
      }}
    >
      <App />
    </FluentProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
)

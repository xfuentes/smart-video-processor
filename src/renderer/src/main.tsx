import './assets/styles/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import { App } from './App'
import { initializeIcons } from '@fluentui/react'
import i18n from './i18n'

const version = window.api.main.version
const development = window.api.main.development

initializeIcons()
document.title = `Smart Video Processor  v${version}${development ? ' - ' + i18n.t('title.development', { defaultValue: 'Development' }) : ''}`
console.log(document.title)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FluentProvider theme={webLightTheme} style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <App />
    </FluentProvider>
  </StrictMode>
)

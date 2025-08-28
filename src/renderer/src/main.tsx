import './assets/styles/main.css'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import { App } from './App'

const version = window.api.main.version

document.title = `Smart Video Processor  v${version}`
console.log(document.title)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FluentProvider theme={webLightTheme} style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <App />
    </FluentProvider>
  </StrictMode>
)

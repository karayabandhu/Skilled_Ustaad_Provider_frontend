import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n.js'
import App from './App.jsx'
import './utils/debugNotifications.js' 
import { registerSW } from 'virtual:pwa-register'
import { reportWebVitals, logVitals } from './utils/performance.js'

registerSW({immediate:true})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Initialize performance monitoring
reportWebVitals(logVitals);


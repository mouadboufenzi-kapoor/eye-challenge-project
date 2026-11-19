import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './ui/theme/theme.css'
import './ui/components/components.css'
import './ui/poster.css'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Design system token imports (order matters)
import './styles/tokens.css'
import './styles/base.css'
import './styles/utilities.css'

// Ensure clean light mode environment
localStorage.removeItem('eduguard-theme')
document.documentElement.removeAttribute('data-theme')

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

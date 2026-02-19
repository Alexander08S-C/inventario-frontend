import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import useAuthStore from './store/authStore'

export function Root() {
  const darkMode = useAuthStore((state) => state.darkMode)

  return (
    <div className={darkMode ? 'dark' : ''}>
      <App />
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import TvMontagem from './services/api.tsx'
// import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <TvMontagem />
  </StrictMode>,
)

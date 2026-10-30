import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import PremiumApp from './PremiumApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PremiumApp />
  </StrictMode>,
)

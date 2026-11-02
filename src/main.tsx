import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import PremiumApp from './PremiumApp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PremiumApp />
    <Analytics />
  </StrictMode>,
)

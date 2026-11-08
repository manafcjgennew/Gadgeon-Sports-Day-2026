import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import PremiumApp from './PremiumApp.tsx'
import AdminApp from './admin/AdminAppMenu.tsx'

const pathname = window.location.pathname
const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
const App = isAdminRoute ? AdminApp : PremiumApp
export { App }

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Analytics />
  </StrictMode>,
)

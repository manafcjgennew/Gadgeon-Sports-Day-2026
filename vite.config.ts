import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const supabaseUrl = (
    env.VITE_SUPABASE_URL
    || env.NEXT_PUBLIC_SUPABASE_URL
    || env.SUPABASE_URL
    || ''
  ).trim()
  const supabaseAnonKey = (
    env.VITE_SUPABASE_ANON_KEY
    || env.VITE_SUPABASE_PUBLISHABLE_KEY
    || env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || env.SUPABASE_ANON_KEY
    || env.SUPABASE_PUBLISHABLE_KEY
    || ''
  ).trim()

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
  }
})

import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
}

export const supabase = createClient(url, anonKey)

// Único usuário do app — o login pede só a senha, este e-mail fixo é usado por baixo dos panos.
export const APP_EMAIL = import.meta.env.VITE_APP_EMAIL ?? 'joshuafguirado@gmail.com'

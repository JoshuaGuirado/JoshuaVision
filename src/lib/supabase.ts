import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Quando as variáveis não existem (ex.: deploy sem env vars configuradas), o app
 * não pode falhar em tela preta — `App` checa esta flag e mostra uma tela
 * explicando o que configurar.
 */
export const isSupabaseConfigured = Boolean(url && anonKey)

export const supabase = createClient(url ?? 'http://localhost', anonKey ?? 'missing-key')

// Único usuário do app — o login pede só a senha, este e-mail fixo é usado por baixo dos panos.
export const APP_EMAIL = import.meta.env.VITE_APP_EMAIL ?? 'joshuafguirado@gmail.com'

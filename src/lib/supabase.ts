import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// On utilise des valeurs par défaut valides au format URL pour éviter le crash au démarrage
// L'application pourra ainsi charger ses composants et afficher une notification d'erreur propre
const safeUrl = supabaseUrl && supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder.supabase.co'
const safeKey = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(safeUrl, safeKey)

// Export d'une constante pour vérifier si la config est valide
export const isSupabaseConfigured = !!supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const safeUrl = supabaseUrl && supabaseUrl.startsWith('http') ? supabaseUrl : 'https://placeholder.supabase.co'
const safeKey = supabaseAnonKey || 'placeholder-key'

const getDeviceId = () => {
  let id = localStorage.getItem('teutchap_device_uuid_v4')
  if (!id) {
    try {
      id = crypto.randomUUID()
    } catch (e) {
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
      })
    }
    localStorage.setItem('teutchap_device_uuid_v4', id)
  }
  return id
}

export const supabase = createClient(safeUrl, safeKey, {
  global: {
    headers: {
      'x-device-id': getDeviceId()
    }
  }
})

export const isSupabaseConfigured = !!supabaseUrl && supabaseUrl !== 'https://placeholder.supabase.co'

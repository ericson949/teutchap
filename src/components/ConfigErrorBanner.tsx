import { AlertTriangle, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { isSupabaseConfigured } from '../lib/supabase'

export default function ConfigErrorBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setShow(true)
    }
  }, [])

  if (!show) return null

  return (
    <div className="fixed bottom-6 left-4 right-4 z-[9999] animate-in slide-in-from-bottom-10 duration-500">
      <div className="glass-dark border border-red-500/30 p-4 rounded-2xl shadow-2xl flex items-start space-x-4 backdrop-blur-2xl">
        <div className="bg-red-500/20 p-2 rounded-xl text-red-500 shrink-0">
          <AlertTriangle size={20} />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-red-400">Configuration Manquante</p>
          <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
            L'URL Supabase n'est pas configurée. Veuillez vérifier votre fichier <code className="text-white">.env</code>.
          </p>
        </div>
        <button onClick={() => setShow(false)} className="text-gray-500 hover:text-white p-1">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

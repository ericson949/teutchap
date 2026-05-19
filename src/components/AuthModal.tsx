import { useState } from 'react'
import { X, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { signInWithGoogle, signInWithApple } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        alert("Verifiez votre email pour confirmer l'inscription.")
      }
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden p-4 md:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="surface-elevated relative w-full max-w-md overflow-hidden rounded-[var(--radius-lg)] animate-in fade-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-10">
          <div className="mb-8 space-y-2 text-center">
            <h2 className="font-serif text-3xl font-semibold text-white">
              {isLogin ? 'Bon retour' : 'Rejoindre Teutchap'}
            </h2>
            <p className="t-caption mx-auto max-w-xs">
              {isLogin ? 'Connectez-vous pour gerer vos evenements.' : 'Creez un compte pour sauvegarder vos albums.'}
            </p>
          </div>

          <div className="mb-7 space-y-3">
            <button
              onClick={signInWithGoogle}
              className="btn-primary w-full"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="Google" />
              <span>Continuer avec Google</span>
            </button>
            <button
              onClick={signInWithApple}
              className="btn-secondary w-full"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" className="h-5 w-5 invert" alt="Apple" />
              <span>Continuer avec Apple</span>
            </button>
          </div>

          <div className="relative mb-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--border-subtle)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--bg-elevated)] px-4 t-caption">Ou avec email</span>
            </div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--text-tertiary)] transition-colors group-focus-within:text-[var(--color-accent)]" size={18} />
              <input
                type="email"
                placeholder="Email"
                className="ui-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[var(--text-tertiary)] transition-colors group-focus-within:text-[var(--color-accent)]" size={18} />
              <input
                type="password"
                placeholder="Mot de passe"
                className="ui-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            {error && <p className="rounded-[var(--radius-sm)] border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs text-red-200">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>
                  <span>{isLogin ? 'Se connecter' : "S'inscrire"}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="mt-7 text-center text-xs text-[var(--text-secondary)]">
            {isLogin ? 'Pas encore de compte ?' : 'Deja un compte ?'}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-semibold text-[var(--text-primary)] hover:underline"
            >
              {isLogin ? 'Creer un compte' : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

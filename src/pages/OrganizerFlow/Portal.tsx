import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Hash, ImageIcon, Calendar, ChevronRight, LogOut, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import AuthModal from '../../components/AuthModal'
import { PageShell, AppHeader, Card, Button, Badge, LoadingScreen, EmptyScreen } from '../../components/ui/primitives'

export default function Portal() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (user) {
      fetchEvents()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchEvents = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select('*, photos(count)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
    
    if (data) setEvents(data)
    setLoading(false)
  }

  if (loading) return <LoadingScreen message="Synchronisation..." />

  if (!user) {
    return (
      <PageShell className="items-center justify-center">
        <Card variant="elevated" padding="p-8 sm:p-10" className="max-w-md w-full space-y-6 rounded-[var(--radius-lg)]">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20 flex items-center justify-center text-[var(--color-accent)]">
              <Lock size={28} />
            </div>
            <div className="space-y-2">
              <h1 className="t-title">Accès Réservé</h1>
              <p className="t-body max-w-xs">
                Connectez-vous pour accéder à votre portail multi-événements et gérer vos albums.
              </p>
            </div>
          </div>
          <Button variant="primary" onClick={() => setShowAuthModal(true)} className="w-full">
            Se connecter / S'inscrire
          </Button>
        </Card>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </PageShell>
    )
  }

  return (
    <PageShell maxWidth="max-w-6xl">
      <AppHeader
        title="Vos Événements"
        eyebrow={user.email || ''}
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={signOut}
              className="glass border border-[var(--border-default)] p-3 rounded-[var(--radius-sm)] text-[var(--text-secondary)] hover:text-white transition-colors"
              aria-label="Déconnexion"
            >
              <LogOut size={18} />
            </button>
            <Button variant="primary" onClick={() => navigate('/')}>
              <Plus size={16} />
              <span>Nouveau Teutchap</span>
            </Button>
          </div>
        }
      />

      <div className="mt-8">
        {events.length === 0 ? (
          <EmptyScreen
            icon={<Hash size={36} className="text-[var(--text-tertiary)]" />}
            title="Aucun événement sauvegardé"
            description="Créez votre premier événement pour le voir ici."
            action={
              <Button variant="secondary" onClick={() => navigate('/')}>
                <Plus size={16} />
                <span>Créer un événement</span>
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map(event => (
              <Card
                key={event.id}
                variant="glass"
                padding="p-6"
                className="rounded-[var(--radius-lg)] group hover:border-[var(--color-accent)]/30 transition-all duration-500 hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-[260px]"
              >
                <div onClick={() => navigate(`/overview/${event.id}`)} className="flex-1 flex flex-col">
                  <div className="space-y-4 flex-1">
                    <div className="flex justify-between items-start">
                      <div className={`p-3 rounded-[var(--radius-sm)] ${event.plan === 'premium' ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]' : 'bg-white/5 text-[var(--text-secondary)]'}`}>
                        <Hash size={22} />
                      </div>
                      <Badge variant={event.plan === 'premium' ? 'accent' : 'muted'}>
                        {event.plan === 'premium' ? 'Premium' : 'Gratuit'}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="t-title leading-tight line-clamp-2">{event.name}</h3>
                      <div className="flex items-center gap-2 text-[var(--text-secondary)] mt-2">
                        <Calendar size={14} />
                        <span className="t-eyebrow">
                          {new Date(event.event_date).toLocaleDateString()}
                          {event.end_date && ` — ${new Date(event.end_date).toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-2 text-[var(--text-primary)]">
                      <ImageIcon size={16} className="opacity-50" />
                      <span className="text-sm font-semibold tabular-nums">{event.photos?.[0]?.count || 0}</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[var(--color-accent)] group-hover:text-white transition-colors">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ExternalLink, Sparkles } from 'lucide-react'
import { useEventOverviewLogic } from '../../hooks/useEventOverviewLogic'
import { OverviewQRSection } from './components/OverviewQRSection'
import { OverviewSecuritySection } from './components/OverviewSecuritySection'
import { OverviewTimerSection } from './components/OverviewTimerSection'
import { OverviewCapacitySection } from './components/OverviewCapacitySection'
import UpgradeEvent from './UpgradeEvent'
import { PageShell, AppHeader, Card, Button, Badge, LoadingScreen as SharedLoading, ErrorScreen } from '../../components/ui/primitives'
import { generateQRFlyer } from '../../utils/generateQRFlyer'

export default function EventOverview() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  const {
    eventData, eventLoading, isOwner, photos, currentConfig, guests,
    copied, newPassword, setNewPassword, pwdLoading,
    stagedAdmins, setStagedAdmins, adminLoading,
    enablePasswordToggle, setEnablePasswordToggle, enableAdminsToggle, setEnableAdminsToggle,
    timeRemaining, handleSetPassword, handleRevokePassword, copyLink, handleSaveAdmins
  } = useEventOverviewLogic(eventId)

  if (eventLoading) return <SharedLoading message="Synchronisation..." />
  if (!eventData) return <ErrorScreen title="Événement introuvable" description="Ce lien semble être expiré ou incorrect." action={<Button variant="secondary" onClick={() => navigate('/')}>Retour à l'accueil</Button>} />
  if (!isOwner) return <ErrorScreen title="Accès refusé" description="Ce lien semble être expiré ou invalide. Veuillez vérifier l'adresse." action={<Button variant="secondary" onClick={() => navigate('/')}>Retour à l'accueil</Button>} />

  const eventUrl = `${window.location.origin}/e/${eventData.token}`

  const downloadQRCode = () => generateQRFlyer({ eventName: eventData.name })

  const shareWhatsApp = () => {
    const text = `Rejoins l'album photo de l'événement "${eventData.name}" sur Teutchap ! 📸\n\nScanne le QR Code ou clique ici : ${eventUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col selection:bg-accent/30 relative overflow-x-hidden">
      
      <header className="glass-dark border-b border-[var(--border-subtle)] px-6 py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/portal')} className="p-3 glass border border-[var(--border-default)] text-[var(--text-secondary)] rounded-[var(--radius-sm)] hover:text-white transition-colors"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-base font-semibold text-gradient truncate max-w-[200px]">{eventData.name}</h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="t-eyebrow">Album Live</span>
              <Badge variant={eventData.plan === 'premium' ? 'accent' : 'muted'}>{eventData.plan}</Badge>
            </div>
          </div>
        </div>
        <Button variant="primary" onClick={() => navigate(`/dashboard/${eventId}`)}>
          <span>Console Admin</span>
          <ExternalLink size={14} />
        </Button>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 pt-32 space-y-8 relative z-10 w-full flex-1 flex flex-col justify-center">
        {eventData.plan === 'free' && (
          <Card variant="glass" padding="p-6 md:p-8" className="rounded-[var(--radius-lg)] overflow-hidden relative animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-r from-accent/8 via-transparent to-accent/4 pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
                <div className="w-12 h-12 bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20 rounded-[var(--radius-sm)] flex items-center justify-center text-[var(--color-accent)]">
                  <Sparkles size={24} className="animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="t-title text-lg">Libérez votre créativité.</h4>
                  <p className="t-caption max-w-sm">
                    Vous êtes limité à 100 photos. <span className="text-[var(--color-accent)]">Passez au Premium</span> pour l'illimité, le mode Live et l'IA.
                  </p>
                </div>
              </div>
              <Button variant="primary" onClick={() => setShowUpgradeModal(true)} className="whitespace-nowrap">
                Passer au Premium
              </Button>
            </div>
          </Card>
        )}

        <div className="text-center space-y-2 hidden sm:block">
          <Badge variant="muted" icon={<Sparkles size={12} className="text-[var(--color-accent)]" />}>
            Diffusion de l'album
          </Badge>
          <h2 className="t-display text-3xl">Partagez <span className="text-gradient">l'Expérience</span></h2>
        </div>

        <Card variant="glass" padding="p-6 md:p-10" className="rounded-[var(--radius-lg)] relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
            <OverviewQRSection 
              eventUrl={eventUrl} eventName={eventData.name} 
              copied={copied} copyLink={() => copyLink(eventUrl)} 
              downloadQRCode={downloadQRCode} shareWhatsApp={shareWhatsApp} 
            />
            
            <div className="space-y-6 md:border-l md:border-white/5 md:pl-8">
              <OverviewTimerSection timeRemaining={timeRemaining} />
              <OverviewSecuritySection 
                enablePasswordToggle={enablePasswordToggle} 
                handleTogglePasswordFeature={() => setEnablePasswordToggle(!enablePasswordToggle)}
                eventData={eventData} pwdLoading={pwdLoading}
                handleRevokePassword={handleRevokePassword}
                newPassword={newPassword} setNewPassword={setNewPassword}
                handleSetPassword={handleSetPassword}
                enableAdminsToggle={enableAdminsToggle}
                handleToggleAdminsFeature={() => setEnableAdminsToggle(!enableAdminsToggle)}
                allDisplayGuests={guests} stagedAdmins={stagedAdmins}
                handleToggleStagedAdmin={(p:string) => setStagedAdmins(prev => prev.includes(p) ? prev.filter(x=>x!==p) : [...prev, p])}
                adminLoading={adminLoading} handleSaveAdmins={handleSaveAdmins}
              />
              <OverviewCapacitySection 
                currentPhotos={photos.length} 
                maxPhotos={currentConfig.max_photos} 
                currentGuests={guests?.length || 0}
                maxGuests={currentConfig.max_guests}
                onUpgrade={() => setShowUpgradeModal(true)} 
              />
            </div>
          </div>
        </Card>
      </main>

      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradeEvent isModal={true} onClose={() => setShowUpgradeModal(false)} eventId={eventId} />
        )}
      </AnimatePresence>
    </div>
  )
}

import { ArrowLeft } from 'lucide-react'

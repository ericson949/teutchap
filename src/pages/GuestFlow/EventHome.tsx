import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, X, Bell, Lock, Sparkles } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { useEventHomeLogic } from '../../hooks/useEventHomeLogic'
import { GuestHero } from './components/GuestHero'
import { GuestSwipeView } from './components/GuestSwipeView'
import { GuestGalleryView } from './components/GuestGalleryView'
import { GuestChallengesView } from './components/GuestChallengesView'
import { GuestBottomNav } from './components/GuestBottomNav'
import UploadPhoto from './UploadPhoto'
import GamificationPanel from '../../components/GamificationPanel'
import EventAwards from '../../components/EventAwards'

export default function EventHome() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isPhotoDetailOpen, setIsPhotoDetailOpen] = useState(false)
  
  const {
    eventData, eventLoading, challenges, activeTab, setActiveTab,
    guestPseudo, setGuestPseudo, inputPseudo, setInputPseudo, hasSession,
    showNotificationPrompt, setShowNotificationPrompt, offlineQueueCount,
    isOnline, photos, userReactions, reactions, addReaction,
    showChallengeForm, setShowChallengeForm, newChalTitle, setNewChalTitle,
    pwdInput, setPwdInput, pwdError, isPasswordVerified,
    handleSyncOffline, addChallenge, handleVerifyPassword
  } = useEventHomeLogic(token)

  const isRevealed = !eventData?.reveal_time || new Date() >= new Date(eventData.reveal_time)

  const isGamificationOff = eventData?.gamification_mode === 'off'
  const guestTabs = [
    { id: 'gallery', label: 'Album', icon: '🖼️' },
    { id: 'challenges', label: 'Défis', icon: '🏆' },
    { id: 'swipe', label: 'Swipe', icon: '🔥' }
  ].filter(tab => !isGamificationOff || tab.id === 'gallery')

  if (eventLoading) return <LoadingScreen />
  if (!eventData) return <NotFoundScreen onBack={() => navigate('/')} />
  if (eventData.access_password && !isPasswordVerified) {
    return <PasswordScreen pwdInput={pwdInput} setPwdInput={setPwdInput} pwdError={pwdError} onVerify={() => handleVerifyPassword(pwdInput)} />
  }
  if (!hasSession && !guestPseudo) {
    return <OnboardingScreen inputPseudo={inputPseudo} setInputPseudo={setInputPseudo} onJoin={(p: string) => { setGuestPseudo(p); localStorage.setItem(`teutchap_pseudo_${token}`, p); }} />
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col relative overflow-x-hidden font-sans">
      {/* Decorative Premium Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="glow-accent top-[10%] left-[5%] animate-pulse-slow" />
        <div className="glow-accent top-[40%] right-[5%] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {!isPhotoDetailOpen && (
        <GuestHeader guestPseudo={guestPseudo} onEditPseudo={(p: string) => setGuestPseudo(p)} token={token} />
      )}

      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative z-10 pb-32">
        {showNotificationPrompt && <NotificationPrompt onDisable={() => setShowNotificationPrompt(false)} />}
        <GuestHero eventData={eventData} photoCount={photos.length} />
        
        <div className="p-4 md:p-8">
          {offlineQueueCount > 0 && <OfflineBanner count={offlineQueueCount} isOnline={isOnline} onSync={handleSyncOffline} />}
          <div className="mb-6">
            <GamificationPanel
              photos={photos}
              reactions={reactions}
              guestPseudo={guestPseudo}
              eventType={eventData?.event_type}
              gamificationMode={eventData?.gamification_mode}
            />
          </div>
          <div className="mb-6">
            <EventAwards
              photos={photos}
              reactions={reactions}
              challenges={challenges}
              eventType={eventData?.event_type}
              gamificationMode={eventData?.gamification_mode}
              showLeaderboard={eventData?.enable_leaderboard !== false}
              showAwards={eventData?.enable_awards !== false}
            />
          </div>
          {!isGamificationOff && activeTab === 'swipe' && (
            isRevealed ? (
              <GuestSwipeView photos={photos} onSwipeRight={(p) => addReaction(p.id, '❤️')} />
            ) : (
              <SwipeLockedScreen revealTime={eventData.reveal_time} />
            )
          )}
          {activeTab === 'gallery' && (
            <GuestGalleryView 
              photos={photos} 
              userReactions={userReactions} 
              reactions={reactions} 
              addReaction={addReaction} 
              challenges={challenges} 
              onPhotoSelectChange={setIsPhotoDetailOpen}
            />
          )}

          {!isGamificationOff && activeTab === 'challenges' && (
            <GuestChallengesView 
              challenges={challenges} 
              photoCountPerChallenge={photos.reduce((acc: any, p) => { if(p.challenge_id) acc[p.challenge_id] = (acc[p.challenge_id] || 0) + 1; return acc; }, {})}
              showChallengeForm={showChallengeForm} setShowChallengeForm={setShowChallengeForm}
              handleCreateChallengeSubmit={(e) => { e.preventDefault(); addChallenge(newChalTitle, ''); setNewChalTitle(''); setShowChallengeForm(false); }}
              newChalTitle={newChalTitle} setNewChalTitle={setNewChalTitle}
              allowGuestChallenges={eventData?.allow_guest_challenges}
              eventType={eventData?.event_type}
            />
          )}
        </div>
      </div>

      {!isPhotoDetailOpen && (
        <GuestBottomNav tabs={guestTabs} activeTab={activeTab} setActiveTab={setActiveTab} onCaptureClick={() => setShowUploadModal(true)} />
      )}

      <AnimatePresence>
        {showUploadModal && (
          <UploadPhoto isModal={true} onClose={() => setShowUploadModal(false)} token={token} />
        )}
      </AnimatePresence>
    </div>
  )
}

// Sub-components to keep EventHome under 300 lines
const LoadingScreen = () => (
  <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center relative overflow-hidden">
    <div className="glow-accent top-[30%] left-[20%] animate-pulse-slow" />
    <div className="relative z-10 flex flex-col items-center">
      <Loader2 size={28} className="text-[var(--color-accent)] animate-spin" />
      <p className="mt-6 t-eyebrow">Développement des souvenirs...</p>
    </div>
  </div>
)

const NotFoundScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-8 text-center space-y-8 relative overflow-hidden">
    <div className="glow-accent top-[30%] left-[20%] animate-pulse-slow" />
    <div className="space-y-4 relative z-10">
      <h2 className="t-display">Événement introuvable</h2>
      <p className="t-body max-w-xs mx-auto">Le lien suivi semble être expiré ou incorrect.</p>
    </div>
    <button onClick={onBack} className="btn-accent relative z-10">Retour à l'accueil</button>
  </div>
)

const PasswordScreen = ({ pwdInput, setPwdInput, pwdError, onVerify }: any) => (
  <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-8 relative overflow-hidden">
    <div className="glow-accent top-[20%] right-[-10%] animate-pulse-slow" />
    <div className="glow-accent bottom-[20%] left-[-10%] animate-pulse-slow" style={{ animationDelay: '2s' }} />
    <form onSubmit={(e) => { e.preventDefault(); onVerify(); }} className="cinematic-surface p-8 sm:p-10 w-full max-w-md space-y-8 relative z-10">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center mx-auto">
          <Lock size={18} />
        </div>
        <h2 className="t-display text-3xl">Accès Protégé</h2>
        <p className="t-eyebrow">Veuillez entrer le code de l'événement</p>
      </div>
      <input type="password" value={pwdInput} onChange={(e) => setPwdInput(e.target.value)} className="w-full bg-[var(--bg-glass)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-6 text-center text-4xl font-serif tracking-[0.5em] outline-none focus:border-[var(--border-active)] focus:bg-white/[0.05] transition-all text-[var(--text-primary)] placeholder-white/10" placeholder="••••" autoFocus />
      {pwdError && <div className="bg-red-500/5 border border-red-500/10 rounded-[var(--radius-sm)] py-2 px-4 text-center"><p className="text-red-400 t-eyebrow">Code incorrect</p></div>}
      <button type="submit" className="btn-accent w-full">Déverrouiller</button>
    </form>
  </div>
)

const OnboardingScreen = ({ inputPseudo, setInputPseudo, onJoin }: any) => (
  <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-8 relative overflow-hidden">
    <div className="glow-accent top-[20%] right-[-10%] animate-pulse-slow" />
    <div className="glow-accent bottom-[20%] left-[-10%] animate-pulse-slow" style={{ animationDelay: '2s' }} />
    <div className="cinematic-surface p-8 sm:p-10 w-full max-w-md space-y-8 relative z-10">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center mx-auto">
          <Sparkles size={18} className="animate-pulse" />
        </div>
        <h2 className="t-display text-3xl">Bienvenue</h2>
        <p className="t-eyebrow">Comment souhaitez-vous apparaître ?</p>
      </div>
      <input type="text" value={inputPseudo} onChange={(e) => setInputPseudo(e.target.value)} className="w-full bg-[var(--bg-glass)] border border-[var(--border-default)] rounded-[var(--radius-md)] p-4 text-center text-xl font-serif outline-none focus:border-[var(--border-active)] focus:bg-white/[0.05] transition-all text-[var(--text-primary)] placeholder-white/20" placeholder="Votre pseudo" autoFocus />
      <button disabled={!inputPseudo.trim()} onClick={() => onJoin(inputPseudo.trim())} className="btn-accent w-full disabled:opacity-30 disabled:pointer-events-none">Rejoindre l'aventure</button>
    </div>
  </div>
)

// Removed local BackgroundGlows, using index.css global body gradients

const GuestHeader = ({ guestPseudo, onEditPseudo, token }: any) => (
  <header className="bg-[var(--bg-app)]/80 border-b border-[var(--border-subtle)] px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-pulse shadow-[var(--shadow-glow-accent)]" />
      <span className="t-eyebrow text-[var(--color-accent)] truncate max-w-[150px]">Teutchap</span>
    </div>
    <div className="flex items-center gap-4">
      <div className="t-caption text-[var(--text-secondary)]">{guestPseudo}</div>
      <button 
        onClick={() => { const n = prompt("Modifier mon pseudo :", guestPseudo); if(n?.trim()) { onEditPseudo(n.trim()); localStorage.setItem(`teutchap_pseudo_${token}`, n.trim()); }}} 
        className="t-eyebrow text-[var(--color-accent)] hover:text-white transition-colors cursor-pointer"
      >
        Éditer
      </button>
    </div>
  </header>
)

const NotificationPrompt = ({ onDisable }: { onDisable: () => void }) => (
  <div className="mx-4 mt-4 animate-in slide-in-from-top-4 duration-500 relative z-[60]">
    <div className="glass rounded-[var(--radius-md)] p-5 border-[var(--border-default)] relative">
      <button onClick={onDisable} className="absolute top-3 right-3 text-[var(--text-secondary)]"><X size={14} /></button>
      <div className="flex items-center gap-4">
        <div className="bg-[var(--color-accent-soft)] p-3 rounded-[var(--radius-sm)] text-[var(--color-accent)] animate-bounce"><Bell size={20} /></div>
        <div>
          <h4 className="t-eyebrow text-gradient">Notifications</h4>
          <p className="t-caption">Voir les moments en direct.</p>
        </div>
      </div>
    </div>
  </div>
)

const OfflineBanner = ({ count, isOnline, onSync }: any) => (
  <div className="glass p-4 rounded-[var(--radius-md)] mb-8 flex items-center justify-between border-[var(--color-accent)]/20">
    <span className="t-eyebrow">Hors-ligne ({count})</span>
    {isOnline && <button onClick={onSync} className="btn-accent px-4 py-2 min-h-0 text-[9px]">Synchroniser</button>}
  </div>
)

const SwipeLockedScreen = ({ revealTime }: { revealTime: string }) => {
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (!revealTime) return
    const updateTimer = () => {
      const now = new Date()
      const diff = new Date(revealTime).getTime() - now.getTime()
      if (diff <= 0) { setTimeLeft(''); window.location.reload(); return }
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft((hours > 0 ? `${hours}h ` : '') + `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`)
    }
    updateTimer()
    const id = setInterval(updateTimer, 1000)
    return () => clearInterval(id)
  }, [revealTime])

  return (
    <div className="cinematic-surface p-8 sm:p-10 w-full max-w-lg mx-auto text-center space-y-8 relative overflow-hidden mt-6">
      <div className="glow-accent top-0 right-0 w-32 h-32" />
      <div className="space-y-4 relative z-10">
        <div className="w-16 h-16 rounded-full bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20 text-[var(--color-accent)] flex items-center justify-center mx-auto animate-pulse">
          <Lock size={24} />
        </div>
        <h3 className="t-display text-2xl">Swipe Verrouillé</h3>
        <p className="t-body max-w-xs mx-auto">Le Swipe commencera uniquement après le reveal de toutes les photos.</p>
      </div>
      {timeLeft && (
        <div className="relative group py-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent)]/20 to-cyan-500/20 rounded-[var(--radius-md)] blur-lg opacity-75" />
          <div className="relative bg-white/[0.02] border border-[var(--border-subtle)] rounded-[var(--radius-md)] py-4 px-6 flex flex-col items-center">
            <span className="t-eyebrow text-[var(--color-accent)] mb-1">Révélation dans</span>
            <span className="text-3xl font-serif tracking-widest font-bold tabular-nums">{timeLeft}</span>
          </div>
        </div>
      )}
      <div className="t-eyebrow text-[var(--color-accent)]/60 max-w-xs mx-auto">⚡ Profitez-en pour capturer et ajouter vos plus beaux souvenirs dès maintenant !</div>
    </div>
  )
}

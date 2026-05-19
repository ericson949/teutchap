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

  const guestTabs = [
    { id: 'gallery', label: 'Album', icon: '🖼️' },
    { id: 'challenges', label: 'Défis', icon: '🏆' },
    { id: 'swipe', label: 'Swipe', icon: '🔥' }
  ]

  if (eventLoading) return <LoadingScreen />
  if (!eventData) return <NotFoundScreen onBack={() => navigate('/')} />
  if (eventData.access_password && !isPasswordVerified) {
    return <PasswordScreen pwdInput={pwdInput} setPwdInput={setPwdInput} pwdError={pwdError} onVerify={() => handleVerifyPassword(pwdInput)} />
  }
  if (!hasSession && !guestPseudo) {
    return <OnboardingScreen inputPseudo={inputPseudo} setInputPseudo={setInputPseudo} onJoin={(p: string) => { setGuestPseudo(p); localStorage.setItem(`teutchap_pseudo_${token}`, p); }} />
  }

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col relative overflow-x-hidden font-sans">
      {/* Decorative Premium Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-blue-600/10 rounded-full blur-[100px] -z-20 pointer-events-none animate-pulse-slow" />
        <div className="absolute top-[40%] right-[5%] w-80 h-80 bg-blue-600/10 rounded-full blur-[120px] -z-20 pointer-events-none animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {!isPhotoDetailOpen && (
        <GuestHeader guestPseudo={guestPseudo} onEditPseudo={(p: string) => setGuestPseudo(p)} token={token} />
      )}

      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative z-10 pb-32">
        {showNotificationPrompt && <NotificationPrompt onDisable={() => setShowNotificationPrompt(false)} />}
        <GuestHero eventData={eventData} photoCount={photos.length} />
        
        <div className="p-4 md:p-8">
          {offlineQueueCount > 0 && <OfflineBanner count={offlineQueueCount} isOnline={isOnline} onSync={handleSyncOffline} />}
          {activeTab === 'swipe' && (
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

          {activeTab === 'challenges' && (
            <GuestChallengesView 
              challenges={challenges} 
              photoCountPerChallenge={photos.reduce((acc: any, p) => { if(p.challenge_id) acc[p.challenge_id] = (acc[p.challenge_id] || 0) + 1; return acc; }, {})}
              showChallengeForm={showChallengeForm} setShowChallengeForm={setShowChallengeForm}
              handleCreateChallengeSubmit={(e) => { e.preventDefault(); addChallenge(newChalTitle, ''); setNewChalTitle(''); setShowChallengeForm(false); }}
              newChalTitle={newChalTitle} setNewChalTitle={setNewChalTitle}
              allowGuestChallenges={eventData?.allow_guest_challenges}
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
  <div className="min-h-screen bg-[#08060d] flex flex-col items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[30%] left-[20%] w-[350px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full animate-pulse-slow" />
    </div>
    <div className="relative z-10 flex flex-col items-center">
      <Loader2 size={32} className="text-blue-400 animate-spin" />
      <p className="mt-6 text-[10px] font-black uppercase tracking-[0.25em] text-white/50">Développement des souvenirs...</p>
    </div>
  </div>
)

const NotFoundScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-[#08060d] flex flex-col items-center justify-center p-8 text-center space-y-8 relative overflow-hidden">
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[30%] left-[20%] w-[350px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full animate-pulse-slow" />
    </div>
    <div className="space-y-4 relative z-10">
      <h2 className="text-4xl md:text-5xl font-serif text-white tracking-tight">Événement introuvable</h2>
      <p className="text-white/40 text-xs font-semibold uppercase tracking-widest max-w-xs mx-auto">Le lien suivi semble être expiré ou incorrect.</p>
    </div>
    <button 
      onClick={onBack} 
      className="relative z-10 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-bold px-8 py-4 rounded-2xl shadow-[0_10px_25px_rgba(59,130,246,0.3)] transition-all text-[10px] uppercase tracking-[0.2em] active:scale-95 cursor-pointer"
    >
      Retour à l'accueil
    </button>
  </div>
)

const PasswordScreen = ({ pwdInput, setPwdInput, pwdError, onVerify }: any) => (
  <div className="min-h-screen bg-[#08060d] flex flex-col items-center justify-center p-8 relative overflow-hidden">
    {/* Decorative Premium Glows */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-blue-600/5 blur-[130px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
    </div>

    <form 
      onSubmit={(e) => { e.preventDefault(); onVerify(); }} 
      className="cinematic-surface p-8 sm:p-10 w-full max-w-md space-y-8 relative z-10 border border-white/[0.08] shadow-[0_24px_50px_rgba(0,0,0,0.6)]"
    >
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(59,130,246,0.1)]">
          <Lock size={18} className="text-blue-400" />
        </div>
        <h2 className="text-3xl font-serif text-white tracking-tight leading-none">Accès Protégé</h2>
        <p className="text-white/40 text-[10px] font-semibold uppercase tracking-[0.15em]">Veuillez entrer le code de l'événement</p>
      </div>

      <input 
        type="password" 
        value={pwdInput} 
        onChange={(e) => setPwdInput(e.target.value)} 
        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 text-center text-4xl font-serif tracking-[0.5em] outline-none focus:border-blue-500/40 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all text-white placeholder-white/10" 
        placeholder="••••" 
        autoFocus 
      />

      {pwdError && (
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl py-2 px-4 text-center">
          <p className="text-red-400 text-[9px] font-bold uppercase tracking-wider">Code incorrect</p>
        </div>
      )}

      <button 
        type="submit" 
        className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-bold py-4 rounded-2xl shadow-[0_10px_25px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center space-x-2 text-[10px] uppercase tracking-[0.2em] active:scale-95 cursor-pointer"
      >
        <span>Déverrouiller</span>
      </button>
    </form>
  </div>
)

const OnboardingScreen = ({ inputPseudo, setInputPseudo, onJoin }: any) => (
  <div className="min-h-screen bg-[#08060d] flex flex-col items-center justify-center p-8 relative overflow-hidden">
    {/* Decorative Premium Glows */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-blue-600/10 blur-[130px] rounded-full animate-pulse-slow" />
      <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-blue-600/5 blur-[130px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }} />
    </div>

    <div className="cinematic-surface p-8 sm:p-10 w-full max-w-md space-y-8 relative z-10 border border-white/[0.08] shadow-[0_24px_50px_rgba(0,0,0,0.6)]">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(59,130,246,0.1)]">
          <Sparkles size={18} className="text-blue-400 animate-pulse" />
        </div>
        <h2 className="text-3xl font-serif text-white tracking-tight leading-none">Bienvenue</h2>
        <p className="text-white/40 text-[10px] font-semibold uppercase tracking-[0.15em]">Comment souhaitez-vous apparaître ?</p>
      </div>

      <input 
        type="text" 
        value={inputPseudo} 
        onChange={(e) => setInputPseudo(e.target.value)} 
        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-center text-xl font-serif outline-none focus:border-blue-500/40 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all text-white placeholder-white/20" 
        placeholder="Votre pseudo" 
        autoFocus
      />

      <button 
        disabled={!inputPseudo.trim()} 
        onClick={() => onJoin(inputPseudo.trim())} 
        className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white font-bold py-4 rounded-2xl shadow-[0_10px_25px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center space-x-2 text-[10px] uppercase tracking-[0.2em] active:scale-95 cursor-pointer disabled:opacity-30 disabled:pointer-events-none disabled:shadow-none"
      >
        <span>Rejoindre l'aventure</span>
      </button>
    </div>
  </div>
)

// Removed local BackgroundGlows, using index.css global body gradients

const GuestHeader = ({ guestPseudo, onEditPseudo, token }: any) => (
  <header className="bg-[#08060d]/80 border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-2xl">
    <div className="flex items-center space-x-3">
      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
      <span className="text-[11px] font-black uppercase tracking-[0.25em] text-blue-400 truncate max-w-[150px]">Teutchap</span>
    </div>
    <div className="flex items-center space-x-4">
      <div className="text-[10px] font-bold text-white/60">{guestPseudo}</div>
      <button 
        onClick={() => { const n = prompt("Modifier mon pseudo :", guestPseudo); if(n?.trim()) { onEditPseudo(n.trim()); localStorage.setItem(`teutchap_pseudo_${token}`, n.trim()); }}} 
        className="text-[10px] text-blue-400 hover:text-blue-300 font-bold transition-colors uppercase tracking-widest cursor-pointer"
      >
        Éditer
      </button>
    </div>
  </header>
)

const NotificationPrompt = ({ onDisable }: { onDisable: () => void }) => (
  <div className="mx-4 mt-4 animate-in slide-in-from-top-4 duration-500 relative z-[60]">
    <div className="glass rounded-3xl p-5 border-white/10 shadow-2xl relative">
      <button onClick={onDisable} className="absolute top-3 right-3 text-gray-500"><X size={14} /></button>
      <div className="flex items-center space-x-4">
        <div className="bg-primary/20 p-3 rounded-2xl text-primary animate-bounce"><Bell size={20} /></div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-widest text-gradient">Notifications</h4>
          <p className="text-[9px] text-gray-400 font-bold leading-tight">Voir les moments en direct.</p>
        </div>
      </div>
    </div>
  </div>
)

const OfflineBanner = ({ count, isOnline, onSync }: any) => (
  <div className="glass p-4 rounded-2xl mb-8 flex items-center justify-between border-primary/20">
    <span className="text-[10px] font-black uppercase tracking-widest">Hors-ligne ({count})</span>
    {isOnline && <button onClick={onSync} className="bg-primary px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest">Synchroniser</button>}
  </div>
)

const SwipeLockedScreen = ({ revealTime }: { revealTime: string }) => {
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (!revealTime) return

    const updateTimer = () => {
      const now = new Date()
      const revealDate = new Date(revealTime)
      const diff = revealDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft('')
        window.location.reload()
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      const hStr = hours > 0 ? `${hours}h ` : ''
      const mStr = `${minutes.toString().padStart(2, '0')}m `
      const sStr = `${seconds.toString().padStart(2, '0')}s`
      setTimeLeft(hStr + mStr + sStr)
    }

    updateTimer()
    const timerId = setInterval(updateTimer, 1000)
    return () => clearInterval(timerId)
  }, [revealTime])

  return (
    <div className="cinematic-surface p-8 sm:p-10 w-full max-w-lg mx-auto text-center space-y-8 border border-white/[0.08] shadow-[0_24px_50px_rgba(0,0,0,0.5)] relative overflow-hidden rounded-[32px] mt-6">
      {/* Glow mesh blob inside the card */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[50px] rounded-full pointer-events-none" />
      
      <div className="space-y-4 relative z-10">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(59,130,246,0.15)] animate-pulse">
          <Lock size={24} className="text-blue-400" />
        </div>
        <h3 className="text-2xl font-serif text-white tracking-tight">Swipe Verrouillé</h3>
        <p className="text-white/40 text-xs font-semibold uppercase tracking-[0.15em] max-w-xs mx-auto leading-relaxed">
          Le Swipe commencera uniquement après le reveal de toutes les photos.
        </p>
      </div>

      {timeLeft && (
        <div className="relative group py-2">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur-lg opacity-75" />
          <div className="relative bg-white/[0.02] border border-white/[0.06] rounded-2xl py-4 px-6 flex flex-col items-center">
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.25em] mb-1">Révélation dans</span>
            <span className="text-3xl font-serif text-white tracking-widest font-bold tabular-nums">
              {timeLeft}
            </span>
          </div>
        </div>
      )}

      <div className="pt-2 text-[10px] font-bold text-blue-400/60 uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
        ⚡ Profitez-en pour capturer et ajouter vos plus beaux souvenirs dès maintenant !
      </div>
    </div>
  )
}

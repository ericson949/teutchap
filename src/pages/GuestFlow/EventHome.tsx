import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, AlertTriangle, Lock, User, X, Bell } from 'lucide-react'
import { useEventHomeLogic } from '../../hooks/useEventHomeLogic'
import { GuestHero } from './components/GuestHero'
import { GuestSwipeView } from './components/GuestSwipeView'
import { GuestGalleryView } from './components/GuestGalleryView'
import { GuestChallengesView } from './components/GuestChallengesView'
import { GuestBottomNav } from './components/GuestBottomNav'

export default function EventHome() {
  const { token } = useParams()
  const navigate = useNavigate()
  
  const {
    eventData, eventLoading, challenges, activeTab, setActiveTab,
    guestPseudo, setGuestPseudo, inputPseudo, setInputPseudo, hasSession,
    showNotificationPrompt, setShowNotificationPrompt, offlineQueueCount,
    isOnline, photos, userReactions, reactions, addReaction,
    showChallengeForm, setShowChallengeForm, newChalTitle, setNewChalTitle,
    pwdInput, setPwdInput, pwdError, isPasswordVerified,
    handleSyncOffline, addChallenge, handleVerifyPassword
  } = useEventHomeLogic(token)

  const guestTabs = [
    { id: 'swipe', label: 'Swipe', icon: '🔥' },
    { id: 'gallery', label: 'Album', icon: '🖼️' },
    { id: 'challenges', label: 'Défis', icon: '🏆' }
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
    <div className="min-h-screen bg-black text-white flex flex-col relative overflow-x-hidden font-sans">

      <GuestHeader eventName={eventData.name} guestPseudo={guestPseudo} onEditPseudo={(p: string) => setGuestPseudo(p)} token={token} />

      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative z-10 pb-32">
        {showNotificationPrompt && <NotificationPrompt onDisable={() => setShowNotificationPrompt(false)} />}
        <GuestHero eventData={eventData} photoCount={photos.length} />
        
        <div className="p-4 md:p-8">
          {offlineQueueCount > 0 && <OfflineBanner count={offlineQueueCount} isOnline={isOnline} onSync={handleSyncOffline} />}
          {activeTab === 'swipe' && <GuestSwipeView photos={photos} onSwipeRight={(p) => addReaction(p.id, '❤️')} />}
          {activeTab === 'gallery' && <GuestGalleryView photos={photos} userReactions={userReactions} reactions={reactions} addReaction={addReaction} challenges={challenges} />}

          {activeTab === 'challenges' && (
            <GuestChallengesView 
              challenges={challenges} 
              photoCountPerChallenge={photos.reduce((acc: any, p) => { if(p.challenge_id) acc[p.challenge_id] = (acc[p.challenge_id] || 0) + 1; return acc; }, {})}
              showChallengeForm={showChallengeForm} setShowChallengeForm={setShowChallengeForm}
              handleCreateChallengeSubmit={(e) => { e.preventDefault(); addChallenge(newChalTitle, ''); setNewChalTitle(''); setShowChallengeForm(false); }}
              newChalTitle={newChalTitle} setNewChalTitle={setNewChalTitle}
            />
          )}
        </div>
      </div>

      <GuestBottomNav tabs={guestTabs} activeTab={activeTab} setActiveTab={setActiveTab} onCaptureClick={() => navigate(`/e/${token}/upload`)} />
    </div>
  )
}

// Sub-components to keep EventHome under 300 lines
const LoadingScreen = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center">
    <Loader2 size={32} className="text-white/20 animate-spin" />
    <p className="mt-6 text-xs font-medium uppercase tracking-[0.3em] text-white/40">Développement des souvenirs...</p>
  </div>
)

const NotFoundScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center space-y-8">
    <div className="space-y-2">
      <h2 className="text-4xl md:text-5xl font-serif">Événement introuvable</h2>
      <p className="text-white/40 text-sm max-w-xs mx-auto">Le lien que vous avez suivi semble être expiré ou incorrect.</p>
    </div>
    <button onClick={onBack} className="btn-pill btn-secondary text-xs uppercase tracking-widest">Retour à l'accueil</button>
  </div>
)

const PasswordScreen = ({ pwdInput, setPwdInput, pwdError, onVerify }: any) => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
    <form onSubmit={(e) => { e.preventDefault(); onVerify(); }} className="cinematic-surface p-10 w-full max-w-md space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-serif">Accès Protégé</h2>
        <p className="text-white/40 text-sm">Veuillez entrer le code d'accès de l'événement.</p>
      </div>
      <input type="password" value={pwdInput} onChange={(e) => setPwdInput(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-center text-4xl font-serif tracking-[0.5em] outline-none focus:border-white/30 transition-colors" placeholder="••••" autoFocus />
      {pwdError && <p className="text-red-400 text-xs text-center font-medium">Code incorrect</p>}
      <button type="submit" className="w-full btn-pill btn-primary text-xs uppercase tracking-widest">Déverrouiller</button>
    </form>
  </div>
)

const OnboardingScreen = ({ inputPseudo, setInputPseudo, onJoin }: any) => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8">
    <div className="cinematic-surface p-10 w-full max-w-md space-y-8">
      <div className="text-center space-y-3">
        <h2 className="text-3xl font-serif">Bienvenue</h2>
        <p className="text-white/40 text-sm">Comment souhaitez-vous apparaître ?</p>
      </div>
      <input type="text" value={inputPseudo} onChange={(e) => setInputPseudo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-xl font-serif outline-none focus:border-white/30 transition-colors" placeholder="Votre pseudo" />
      <button disabled={!inputPseudo.trim()} onClick={() => onJoin(inputPseudo.trim())} className="w-full btn-pill btn-primary text-xs uppercase tracking-widest disabled:opacity-30">Rejoindre l'aventure</button>
    </div>
  </div>
)

// Removed local BackgroundGlows, using index.css global body gradients

const GuestHeader = ({ eventName, guestPseudo, onEditPseudo, token }: any) => (
  <header className="bg-black/80 border-b border-white/5 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-2xl">
    <div className="flex items-center space-x-3">
      <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
      <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/80 truncate max-w-[150px]">{eventName}</span>
    </div>
    <div className="flex items-center space-x-4">
      <div className="text-[10px] font-medium text-white/50">{guestPseudo}</div>
      <button onClick={() => { const n = prompt("Modifier mon pseudo :", guestPseudo); if(n?.trim()) { onEditPseudo(n.trim()); localStorage.setItem(`teutchap_pseudo_${token}`, n.trim()); }}} className="text-[10px] text-white/20 hover:text-white/40 transition-colors uppercase tracking-widest">Éditer</button>
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

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
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col relative overflow-x-hidden">
      <BackgroundGlows />
      <GuestHeader eventName={eventData.name} guestPseudo={guestPseudo} onEditPseudo={(p: string) => setGuestPseudo(p)} token={token} />

      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative z-10 pb-32">
        {showNotificationPrompt && <NotificationPrompt onDisable={() => setShowNotificationPrompt(false)} />}
        <GuestHero eventData={eventData} photoCount={photos.length} />
        
        <div className="p-4 md:p-8">
          {offlineQueueCount > 0 && <OfflineBanner count={offlineQueueCount} isOnline={isOnline} onSync={handleSyncOffline} />}
          {activeTab === 'swipe' && <GuestSwipeView photos={photos} onSwipeRight={(p) => addReaction(p.id, '❤️')} />}
          {activeTab === 'gallery' && <GuestGalleryView photos={photos} userReactions={userReactions} reactions={reactions} addReaction={addReaction} />}
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
  <div className="min-h-screen bg-[#08060d] flex flex-col items-center justify-center">
    <Loader2 size={28} className="text-primary animate-spin" />
    <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Chargement des souvenirs...</p>
  </div>
)

const NotFoundScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-[#08060d] flex flex-col items-center justify-center p-8 text-center">
    <AlertTriangle size={48} className="text-red-500 mb-4" />
    <h2 className="text-xl font-black uppercase">Événement introuvable</h2>
    <button onClick={onBack} className="mt-6 px-8 py-3 bg-primary rounded-xl text-xs font-black uppercase">Retour</button>
  </div>
)

const PasswordScreen = ({ pwdInput, setPwdInput, pwdError, onVerify }: any) => (
  <div className="min-h-screen bg-[#08060d] flex flex-col items-center justify-center p-8">
    <form onSubmit={(e) => { e.preventDefault(); onVerify(); }} className="glass p-8 rounded-[2rem] w-full max-w-md space-y-6 border border-white/10 shadow-2xl">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto text-primary"><Lock size={24} /></div>
        <h2 className="text-xl font-black uppercase tracking-tight">Accès Protégé</h2>
      </div>
      <input type="password" value={pwdInput} onChange={(e) => setPwdInput(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-primary/50" placeholder="••••" autoFocus />
      {pwdError && <p className="text-red-500 text-[10px] text-center font-bold uppercase">Code incorrect</p>}
      <button type="submit" className="w-full bg-primary py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20">Déverrouiller</button>
    </form>
  </div>
)

const OnboardingScreen = ({ inputPseudo, setInputPseudo, onJoin }: any) => (
  <div className="min-h-screen bg-[#08060d] flex flex-col items-center justify-center p-8">
    <div className="glass p-8 rounded-[2rem] w-full max-w-md space-y-6 border border-white/10 shadow-2xl">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mx-auto text-accent"><User size={24} /></div>
        <h2 className="text-xl font-black uppercase tracking-tight">Bienvenue</h2>
      </div>
      <input type="text" value={inputPseudo} onChange={(e) => setInputPseudo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-center text-lg font-black outline-none focus:border-accent/50" placeholder="Votre pseudo" />
      <button disabled={!inputPseudo.trim()} onClick={() => onJoin(inputPseudo.trim())} className="w-full bg-accent disabled:opacity-50 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-accent/20">Rejoindre</button>
    </div>
  </div>
)

const BackgroundGlows = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
  </div>
)

const GuestHeader = ({ eventName, guestPseudo, onEditPseudo, token }: any) => (
  <header className="glass-dark border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-[10px] font-black uppercase tracking-widest text-white truncate max-w-[150px]">{eventName}</span>
    </div>
    <div className="flex items-center space-x-2">
      <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[9px] font-bold text-primary-light">👤 {guestPseudo}</div>
      <button onClick={() => { const n = prompt("Modifier mon pseudo :", guestPseudo); if(n?.trim()) { onEditPseudo(n.trim()); localStorage.setItem(`teutchap_pseudo_${token}`, n.trim()); }}} className="text-[9px] text-gray-500 underline">Éditer</button>
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

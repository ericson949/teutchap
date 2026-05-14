import { useParams, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Image as ImageIcon, Hash, Settings as SettingsIcon, Save } from 'lucide-react'
import { useDashboardLogic } from '../../hooks/useDashboardLogic'
import PremiumTabs from '../../components/PremiumTabs'
import { OverviewTab } from './components/OverviewTab'
import { GalleryTab } from './components/GalleryTab'
import { ChallengesTab } from './components/ChallengesTab'
import { SettingsTab } from './components/SettingsTab'

export default function Dashboard() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  
  const {
    user, eventData, eventLoading, challenges, photos,
    activeTab, setActiveTab, showChallengeForm, setShowChallengeForm,
    isAdminUploading, adminFileInputRef, timeRemaining, totalReactions,
    updateEvent, deleteChallenge, handleAdminUploadChange,
    handleDeletePhoto
  } = useDashboardLogic(eventId)

  const organizerTabs = [
    { id: 'overview', label: 'Aperçu', icon: <LayoutDashboard size={18} /> },
    { id: 'gallery', label: 'Galerie', icon: <ImageIcon size={18} /> },
    { id: 'challenges', label: 'Défis', icon: <Hash size={18} /> },
    { id: 'settings', label: 'Paramètres', icon: <SettingsIcon size={18} /> }
  ]

  if (eventLoading) return <LoadingScreen />
  if (!eventData) return <NotFoundScreen onBack={() => navigate('/')} />

  const eventUrl = `${window.location.origin}/e/${eventData.token}`

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col selection:bg-primary/30 overflow-x-hidden">
      <BackgroundGlows />
      <OrganizerHeader user={user} eventData={eventData} />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 pt-44 md:pt-48 pb-12 relative z-10">
        {activeTab === 'overview' && <OverviewTab timeRemaining={timeRemaining} photos={photos} challenges={challenges} totalReactions={totalReactions} navigate={navigate} eventId={eventId} />}
        {activeTab === 'gallery' && <GalleryTab photos={photos} isAdminUploading={isAdminUploading} adminFileInputRef={adminFileInputRef} handleAdminUploadChange={handleAdminUploadChange} handleDeletePhoto={handleDeletePhoto} />}
        {activeTab === 'challenges' && <ChallengesTab challenges={challenges} showChallengeForm={showChallengeForm} setShowChallengeForm={setShowChallengeForm} newChallenge={{title: '', description: ''}} setNewChallenge={() => {}} handleSaveChallenge={() => {}} deleteChallenge={deleteChallenge} />}
        {activeTab === 'settings' && <SettingsTab eventData={eventData} eventUrl={eventUrl} copyLink={() => {}} shareWhatsApp={() => {}} updateEvent={updateEvent} />}
      </main>

      <div className="fixed top-24 left-0 right-0 z-40 bg-[#08060d]/80 backdrop-blur-md border-b border-white/5 py-4 px-4">
        <PremiumTabs tabs={organizerTabs} activeTab={activeTab} onChange={setActiveTab} className="max-w-6xl mx-auto" />
      </div>
    </div>
  )
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#08060d] flex items-center justify-center font-black uppercase tracking-widest text-gray-500">Chargement...</div>
)

const NotFoundScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-[#08060d] flex flex-col items-center justify-center space-y-4">
    <div className="text-red-500 font-black uppercase tracking-widest text-lg animate-pulse">Album Introuvable</div>
    <button onClick={onBack} className="px-4 py-2 bg-primary/20 text-primary font-bold rounded-xl text-xs uppercase border border-primary/30">Retour</button>
  </div>
)

const BackgroundGlows = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[0%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full" />
    <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/5 blur-[150px] rounded-full" />
  </div>
)

const OrganizerHeader = ({ user, eventData }: any) => (
  <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
    {!user && !eventData.user_id && (
      <div className="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-b border-white/10 p-3 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4">
          <p className="text-[10px] font-black uppercase tracking-widest flex items-center space-x-2"><Save size={12} className="text-primary"/><span>Sauvegardez cet événement</span></p>
          <button className="bg-white text-black px-4 py-1.5 rounded-lg text-[9px] font-black uppercase">Connexion</button>
        </div>
      </div>
    )}
    <header className="glass-dark border-b border-white/5 px-4 md:px-8 py-4 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center text-primary border border-primary/20"><LayoutDashboard size={20} /></div>
          <div><h1 className="text-lg font-black tracking-tight uppercase leading-none">{eventData.name}</h1><p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Espace Organisateur</p></div>
        </div>
      </div>
    </header>
  </div>
)

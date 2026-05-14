import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Sparkles } from 'lucide-react'
import { useEventOverviewLogic } from '../../hooks/useEventOverviewLogic'
import { OverviewQRSection } from './components/OverviewQRSection'
import { OverviewSecuritySection } from './components/OverviewSecuritySection'
import { OverviewTimerSection } from './components/OverviewTimerSection'
import { OverviewCapacitySection } from './components/OverviewCapacitySection'

export default function EventOverview() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  
  const {
    eventData, eventLoading, photos, currentConfig, guests,
    copied, newPassword, setNewPassword, pwdLoading,
    stagedAdmins, setStagedAdmins, adminLoading,
    enablePasswordToggle, setEnablePasswordToggle, enableAdminsToggle, setEnableAdminsToggle,
    timeRemaining, handleSetPassword, handleRevokePassword, copyLink
  } = useEventOverviewLogic(eventId)

  if (eventLoading) return <LoadingScreen />
  if (!eventData) return <NotFoundScreen onBack={() => navigate('/')} />

  const eventUrl = `${window.location.origin}/e/${eventData.token}`

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col selection:bg-primary/30 relative overflow-x-hidden">
      <BackgroundGlows />
      
      <header className="glass-dark border-b border-white/5 px-4 py-3 flex justify-between items-center sticky top-0 z-40 backdrop-blur-2xl">
        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/portal')} className="p-2 glass border border-white/10 text-gray-400 rounded-xl"><ArrowLeft size={16} /></button>
          <div>
            <h1 className="text-sm font-black text-gradient truncate max-w-[150px]">{eventData.name}</h1>
            <span className="text-[8px] font-black uppercase tracking-widest text-green-400">● Actif</span>
          </div>
        </div>
        <button onClick={() => navigate(`/dashboard/${eventId}`)} className="flex items-center space-x-1.5 glass border border-white/10 px-3 py-2 rounded-xl text-[10px] font-black uppercase">
          <span>Console</span>
          <ExternalLink size={12} className="text-primary" />
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 relative z-10 w-full flex-1 flex flex-col justify-center">
        <div className="text-center space-y-2 hidden sm:block">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
            <Sparkles size={12} className="text-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Diffusion de l'album</span>
          </div>
          <h2 className="text-3xl font-black tracking-tighter">Partagez <span className="text-gradient">l'Expérience</span></h2>
        </div>

        <div className="glass rounded-[2.5rem] p-6 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center relative z-10">
            <OverviewQRSection 
              eventUrl={eventUrl} eventName={eventData.name} 
              copied={copied} copyLink={() => copyLink(eventUrl)} 
              downloadQRCode={() => {}} shareWhatsApp={() => {}} 
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
                adminLoading={adminLoading} handleSaveAdmins={() => {}}
              />
              <OverviewCapacitySection currentPhotos={photos.length} maxPhotos={currentConfig.max_photos} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const LoadingScreen = () => (
  <div className="min-h-screen bg-[#08060d] flex flex-col items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin rounded-full" />
    <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Synchronisation...</p>
  </div>
)

const NotFoundScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="min-h-screen bg-[#08060d] flex flex-col items-center justify-center p-8 text-center">
    <h2 className="text-lg font-black uppercase">Événement introuvable</h2>
    <button onClick={onBack} className="mt-6 px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase">Retour</button>
  </div>
)

const BackgroundGlows = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-primary/15 blur-[140px] rounded-full animate-pulse" />
    <div className="absolute bottom-[-5%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[140px] rounded-full" />
  </div>
)

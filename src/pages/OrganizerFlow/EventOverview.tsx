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
    eventData, eventLoading, isOwner, photos, currentConfig, guests,
    copied, newPassword, setNewPassword, pwdLoading,
    stagedAdmins, setStagedAdmins, adminLoading,
    enablePasswordToggle, setEnablePasswordToggle, enableAdminsToggle, setEnableAdminsToggle,
    timeRemaining, handleSetPassword, handleRevokePassword, copyLink, handleSaveAdmins
  } = useEventOverviewLogic(eventId)

  if (eventLoading) return <LoadingScreen />
  if (!eventData) return <NotFoundScreen onBack={() => navigate('/')} />
  if (!isOwner) return <AccessDeniedScreen />

  const eventUrl = `${window.location.origin}/e/${eventData.token}`

  const downloadQRCode = () => {
    const qrCanvas = document.querySelector('#overview-qr canvas') as HTMLCanvasElement
    if (!qrCanvas) return
    
    // Create a new canvas for the final image with branding
    const finalCanvas = document.createElement('canvas')
    const ctx = finalCanvas.getContext('2d')
    if (!ctx) return

    const padding = 80
    const textSectionHeight = 160
    finalCanvas.width = qrCanvas.width + padding * 2
    finalCanvas.height = qrCanvas.height + padding * 2 + textSectionHeight

    // Draw background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)

    // Draw Header Text (Large)
    ctx.fillStyle = '#08060d'
    ctx.textAlign = 'center'
    
    // Line 1: Partagez vos photos de [Name]
    ctx.font = '900 32px Inter, sans-serif'
    const title = `Partagez vos photos de ${eventData.name}`
    ctx.fillText(title, finalCanvas.width / 2, padding + 40)
    
    // Line 2: ici
    ctx.font = 'bold 48px Inter, sans-serif'
    ctx.fillText('ICI', finalCanvas.width / 2, padding + 110)

    // Draw QR Code (Centered below text)
    ctx.drawImage(qrCanvas, padding, padding + textSectionHeight)

    const pngFile = finalCanvas.toDataURL('image/png')
    const downloadLink = document.createElement('a')
    downloadLink.download = `Teutchap_${eventData.name.replace(/\s+/g, '_')}.png`
    downloadLink.href = pngFile
    downloadLink.click()
  }

  const shareWhatsApp = () => {
    const text = `Rejoins l'album photo de l'événement "${eventData.name}" sur Teutchap ! 📸\n\nScanne le QR Code ou clique ici : ${eventUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col selection:bg-primary/30 relative overflow-x-hidden">
      
      <header className="glass-dark border-b border-white/5 px-6 py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-50 backdrop-blur-3xl">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/portal')} className="p-3 glass border border-white/10 text-gray-400 rounded-2xl hover:text-white transition-colors"><ArrowLeft size={18} /></button>
          <div>
            <h1 className="text-base font-black text-gradient truncate max-w-[200px]">{eventData.name}</h1>
            <div className="flex items-center space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500">Album Live</span>
              <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-primary-light">{eventData.plan}</span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate(`/dashboard/${eventId}`)} className="flex items-center space-x-2 bg-white text-black px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95 shadow-xl shadow-white/5">
          <span>Console Admin</span>
          <ExternalLink size={14} />
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8 pt-32 space-y-8 relative z-10 w-full flex-1 flex flex-col justify-center">
        {eventData.plan === 'free' && (
          <div className="animate-in fade-in slide-in-from-top-6 duration-700 glass-dark border border-white/10 rounded-[2.5rem] overflow-hidden group relative">
            {/* Background Gradient Layer */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/5 pointer-events-none" />
            
            <div className="p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 text-center md:text-left relative z-10">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-primary shadow-2xl">
                  <Sparkles size={28} className="animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black tracking-tight text-white">Libérez votre créativité.</h4>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed max-w-sm">
                    Vous êtes limité à 100 photos. <span className="text-primary-light">Passez au Premium</span> pour l'illimité, le mode Live et l'IA.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/upgrade/${eventId}`)}
                className="w-full md:w-auto bg-white text-black hover:bg-gray-200 active:scale-95 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] relative z-10 whitespace-nowrap"
              >
                Passer au Premium
              </button>
            </div>
          </div>
        )}

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
const AccessDeniedScreen = () => (
  <div className="min-h-screen bg-[#08060d] flex flex-col items-center justify-center p-8 text-center space-y-6">
    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-gray-500 border border-white/10">
      <AlertTriangle size={32} />
    </div>
    <div className="space-y-2">
      <h2 className="text-xl font-black uppercase tracking-widest text-white">Lien Introuvable</h2>
      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest max-w-xs leading-relaxed">
        Ce lien semble être expiré ou invalide. Veuillez vérifier l'adresse ou retourner à l'accueil.
      </p>
    </div>
    <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">Retour à l'accueil</button>
  </div>
)

import { AlertTriangle } from 'lucide-react'

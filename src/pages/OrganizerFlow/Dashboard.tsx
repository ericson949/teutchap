import { useParams, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Image as ImageIcon, Hash, Settings as SettingsIcon, Save, RefreshCw, Check } from 'lucide-react'
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
    user, eventData, eventLoading, isOwner, challenges, photos,
    activeTab, setActiveTab, showChallengeForm, setShowChallengeForm,
    isAdminUploading, adminFileInputRef, timeRemaining, totalReactions,
    updateEvent, deleteEvent, deleteChallenge, handleAdminUploadChange,
    handleDeletePhoto,
    selectedFilesForUpload, showUploadModal, setShowUploadModal,
    organizerCompress, setOrganizerCompress, confirmAdminUpload, cancelAdminUpload,
    // New integration variables
    copied, newPassword, setNewPassword, pwdLoading,
    stagedAdmins, setStagedAdmins, adminLoading,
    enablePasswordToggle, setEnablePasswordToggle, enableAdminsToggle, setEnableAdminsToggle,
    currentConfig, copyLink, handleSetPassword, handleRevokePassword, handleSaveAdmins, guests
  } = useDashboardLogic(eventId)

  const downloadQRCode = () => {
    const qrCanvas = document.querySelector('#overview-qr canvas') as HTMLCanvasElement
    if (!qrCanvas) return
    
    const finalCanvas = document.createElement('canvas')
    const ctx = finalCanvas.getContext('2d')
    if (!ctx) return

    const padding = 80
    const textSectionHeight = 160
    finalCanvas.width = qrCanvas.width + padding * 2
    finalCanvas.height = qrCanvas.height + padding * 2 + textSectionHeight

    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)

    ctx.fillStyle = '#08060d'
    ctx.textAlign = 'center'
    
    ctx.font = '900 32px Inter, sans-serif'
    const title = `Partagez vos photos de ${eventData.name}`
    ctx.fillText(title, finalCanvas.width / 2, padding + 40)
    
    ctx.font = 'bold 48px Inter, sans-serif'
    ctx.fillText('ICI', finalCanvas.width / 2, padding + 110)

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

  const organizerTabs = [
    { id: 'overview', label: 'Aperçu', icon: <LayoutDashboard size={20} /> },
    { id: 'gallery', label: 'Galerie', icon: <ImageIcon size={20} /> },
    { id: 'challenges', label: 'Défis', icon: <Hash size={20} /> },
    { id: 'settings', label: 'Params', icon: <SettingsIcon size={20} /> }
  ]

  if (eventLoading) return <LoadingScreen />
  if (!eventData) return <NotFoundScreen onBack={() => navigate('/')} />
  if (!isOwner) return <AccessDeniedScreen />

  const eventUrl = `${window.location.origin}/e/${eventData.token}`

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col selection:bg-primary/30 overflow-x-hidden pb-24">
      
      {/* Minimalist Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-8 flex items-center justify-between pointer-events-none">
        <button 
          onClick={() => navigate(`/overview/${eventId}`)}
          className="glass border border-white/10 p-4 rounded-2xl pointer-events-auto active:scale-90 transition-all hover:bg-white/5 shadow-xl group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Sync Indicator (Centered) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-10 flex flex-col items-center pointer-events-auto">
          {eventLoading ? (
            <div className="p-2 bg-primary/10 border border-primary/20 rounded-full animate-pulse shadow-lg shadow-primary/20" title="Synchronisation en cours...">
              <RefreshCw size={12} className="animate-spin text-primary" />
            </div>
          ) : (
            <div className="p-2 bg-white/5 border border-white/10 rounded-full opacity-40 hover:opacity-100 transition-opacity" title="Données à jour">
              <Check size={12} className="text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="text-right">
          <h1 className="text-xs font-black uppercase tracking-[0.3em] text-white/40 mb-1">Console</h1>
          <p className="text-sm font-black text-white truncate max-w-[150px]">{eventData.name}</p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-32 pb-12 relative z-10">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {activeTab === 'overview' && (
            <OverviewTab 
              timeRemaining={timeRemaining} 
              photos={photos} 
              challenges={challenges} 
              totalReactions={totalReactions} 
              navigate={navigate} 
              eventId={eventId} 
              eventUrl={eventUrl}
              eventData={eventData}
              copied={copied}
              copyLink={() => copyLink(eventUrl)}
              downloadQRCode={downloadQRCode}
              shareWhatsApp={shareWhatsApp}
              enablePasswordToggle={enablePasswordToggle}
              handleTogglePasswordFeature={() => setEnablePasswordToggle(!enablePasswordToggle)}
              pwdLoading={pwdLoading}
              handleRevokePassword={handleRevokePassword}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              handleSetPassword={handleSetPassword}
              enableAdminsToggle={enableAdminsToggle}
              handleToggleAdminsFeature={() => setEnableAdminsToggle(!enableAdminsToggle)}
              guests={guests}
              stagedAdmins={stagedAdmins}
              handleToggleStagedAdmin={(p: string) => setStagedAdmins(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
              adminLoading={adminLoading}
              handleSaveAdmins={handleSaveAdmins}
              currentConfig={currentConfig}
            />
          )}
          {activeTab === 'gallery' && (
            <GalleryTab 
              photos={photos} 
              challenges={challenges}
              isAdminUploading={isAdminUploading} 
              adminFileInputRef={adminFileInputRef} 
              handleAdminUploadChange={handleAdminUploadChange} 
              handleDeletePhoto={handleDeletePhoto}

              selectedFilesForUpload={selectedFilesForUpload}
              showUploadModal={showUploadModal}
              setShowUploadModal={setShowUploadModal}
              organizerCompress={organizerCompress}
              setOrganizerCompress={setOrganizerCompress}
              confirmAdminUpload={confirmAdminUpload}
              cancelAdminUpload={cancelAdminUpload}
            />
          )}

          {activeTab === 'challenges' && <ChallengesTab challenges={challenges} showChallengeForm={showChallengeForm} setShowChallengeForm={setShowChallengeForm} newChallenge={{title: '', description: ''}} setNewChallenge={() => {}} handleSaveChallenge={() => {}} deleteChallenge={deleteChallenge} />}
          {activeTab === 'settings' && <SettingsTab eventData={eventData} eventUrl={eventUrl} copyLink={() => copyLink(eventUrl)} shareWhatsApp={shareWhatsApp} updateEvent={updateEvent} deleteEvent={deleteEvent} />}

        </div>
      </main>

      {/* Bottom Floating Navigation (Premium Tabs) */}
      <PremiumTabs 
        tabs={organizerTabs} 
        activeTab={activeTab} 
        onChange={setActiveTab} 
        variant="bottom"
        className="px-6 pb-8"
      />
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

// Ensure icons used in the header are imported
import { ArrowLeft, AlertTriangle } from 'lucide-react'

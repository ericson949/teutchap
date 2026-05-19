import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Image as ImageIcon, Hash, Settings as SettingsIcon, RefreshCw, Check } from 'lucide-react'
import { useDashboardLogic } from '../../hooks/useDashboardLogic'
import PremiumTabs from '../../components/PremiumTabs'
import UpgradeEvent from './UpgradeEvent'
import { OverviewTab } from './components/OverviewTab'
import { GalleryTab } from './components/GalleryTab'
import { ChallengesTab } from './components/ChallengesTab'
import { SettingsTab } from './components/SettingsTab'
import { LoadingScreen as SharedLoading, ErrorScreen, Button } from '../../components/ui/primitives'
import { generateQRFlyer } from '../../utils/generateQRFlyer'

export default function Dashboard() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isPhotoDetailOpen, setIsPhotoDetailOpen] = useState(false)
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '' })
  
  const {
    eventData, eventLoading, isOwner, challenges, photos,
    activeTab, setActiveTab, showChallengeForm, setShowChallengeForm,
    isAdminUploading, adminFileInputRef, timeRemaining, totalReactions,
    updateEvent, deleteEvent, addChallenge, deleteChallenge, handleAdminUploadChange,
    handleDeletePhoto,
    selectedFilesForUpload, showUploadModal, setShowUploadModal,
    organizerCompress, setOrganizerCompress, confirmAdminUpload, cancelAdminUpload,
    // New integration variables
    copied, newPassword, setNewPassword, pwdLoading,
    stagedAdmins, setStagedAdmins, adminLoading,
    enablePasswordToggle, setEnablePasswordToggle, enableAdminsToggle, setEnableAdminsToggle,
    currentConfig, copyLink, handleSetPassword, handleRevokePassword, handleSaveAdmins, guests
  } = useDashboardLogic(eventId)

  const downloadQRCode = () => generateQRFlyer({ eventName: eventData.name })

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

  if (eventLoading) return <SharedLoading message="Chargement..." />
  if (!eventData) return <ErrorScreen title="Album Introuvable" description="Ce lien semble être expiré ou incorrect." action={<Button variant="secondary" onClick={() => navigate('/')}>Retour</Button>} />
  if (!isOwner) return <ErrorScreen title="Accès refusé" description="Ce lien semble être expiré ou invalide." action={<Button variant="secondary" onClick={() => navigate('/')}>Retour à l'accueil</Button>} />

  const eventUrl = `${window.location.origin}/e/${eventData.token}`
  const photoCountPerChallenge = photos.reduce((acc: any, photo) => {
    if (photo.challenge_id) acc[photo.challenge_id] = (acc[photo.challenge_id] || 0) + 1
    return acc
  }, {})
  const handleSaveChallenge = async () => {
    if (!newChallenge.title.trim()) return
    await addChallenge(newChallenge.title.trim(), newChallenge.description.trim())
    setNewChallenge({ title: '', description: '' })
    setShowChallengeForm(false)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col selection:bg-accent/30 overflow-x-hidden pb-24">
      
      {/* Minimalist Top Header */}
      {!isPhotoDetailOpen && (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 h-24 flex items-center justify-between bg-gradient-to-b from-[var(--bg-app)]/80 to-transparent backdrop-blur-[2px] pointer-events-none border-b border-[var(--border-subtle)]">
          <div className="flex items-center space-x-4 pointer-events-auto">
            <button 
              onClick={() => navigate(`/overview/${eventId}`)}
              className="glass border border-white/10 w-11 h-11 flex items-center justify-center rounded-2xl active:scale-95 transition-all hover:bg-white/5 shadow-xl group"
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold leading-none mb-1">
                Console Organisateur
              </span>
              <span className="text-base font-serif text-white font-semibold truncate max-w-[140px] leading-none">
                {eventData?.name}
              </span>
            </div>
          </div>

          {/* Sync Indicator (Aligned on the right, vertically centered) */}
          <div className="pointer-events-auto">
            {eventLoading ? (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full animate-pulse text-[9px] font-black uppercase tracking-wider text-white/60">
                <RefreshCw size={8} className="animate-spin text-white" />
                <span>Sync...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-wider text-white/40">
                <Check size={8} className="text-emerald-400" />
                <span>À jour</span>
              </div>
            )}
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 pt-24 pb-12 relative z-10">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          {activeTab === 'overview' && (
            <OverviewTab 
              timeRemaining={timeRemaining} 
              photos={photos} 
              challenges={challenges} 
              totalReactions={totalReactions} 
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
              onUpgrade={() => setShowUpgradeModal(true)}
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
              onPhotoSelectChange={setIsPhotoDetailOpen}
            />
          )}

          {activeTab === 'challenges' && (
            <ChallengesTab
              challenges={challenges}
              showChallengeForm={showChallengeForm}
              setShowChallengeForm={setShowChallengeForm}
              newChallenge={newChallenge}
              setNewChallenge={setNewChallenge}
              handleSaveChallenge={handleSaveChallenge}
              deleteChallenge={deleteChallenge}
              eventType={eventData.event_type}
              photoCountPerChallenge={photoCountPerChallenge}
            />
          )}
          {activeTab === 'settings' && <SettingsTab eventData={eventData} eventUrl={eventUrl} copyLink={() => copyLink(eventUrl)} shareWhatsApp={shareWhatsApp} updateEvent={updateEvent} deleteEvent={deleteEvent} />}

        </div>
      </main>

      {/* Bottom Floating Navigation (Premium Tabs) */}
      {!isPhotoDetailOpen && (
        <PremiumTabs 
          tabs={organizerTabs} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
          variant="bottom"
          className="px-6 pb-8"
        />
      )}

      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradeEvent isModal={true} onClose={() => setShowUpgradeModal(false)} eventId={eventId} />
        )}
      </AnimatePresence>
    </div>
  )
}

// Ensure icons used in the header are imported
import { ArrowLeft } from 'lucide-react'

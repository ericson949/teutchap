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

export default function Dashboard() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [isPhotoDetailOpen, setIsPhotoDetailOpen] = useState(false)
  
  const {
    eventData, eventLoading, isOwner, challenges, photos,
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
    
    // Create a new canvas for the final image with branding
    const finalCanvas = document.createElement('canvas')
    const ctx = finalCanvas.getContext('2d')
    if (!ctx) return

    // Set high-res portrait dimensions (suitable for poster/chevalet)
    finalCanvas.width = 800
    finalCanvas.height = 1200

    // Draw background with sleek dark gradient
    const grad = ctx.createLinearGradient(0, 0, 0, finalCanvas.height)
    grad.addColorStop(0, '#0c0a17')
    grad.addColorStop(0.5, '#0e0b1f')
    grad.addColorStop(1, '#050409')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)

    // Glow blob top-left (Violet)
    const blob1 = ctx.createRadialGradient(100, 200, 50, 100, 200, 300)
    blob1.addColorStop(0, 'rgba(139, 92, 246, 0.15)')
    blob1.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = blob1
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)

    // Glow blob bottom-right (Cyan)
    const blob2 = ctx.createRadialGradient(700, 900, 50, 700, 900, 350)
    blob2.addColorStop(0, 'rgba(6, 182, 212, 0.12)')
    blob2.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = blob2
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)

    // Poster borders
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)'
    ctx.lineWidth = 2
    ctx.strokeRect(30, 30, finalCanvas.width - 60, finalCanvas.height - 60)

    ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)'
    ctx.lineWidth = 1
    ctx.strokeRect(42, 42, finalCanvas.width - 84, finalCanvas.height - 84)

    // 1. Header chip
    ctx.fillStyle = 'rgba(99, 102, 241, 0.08)'
    ctx.beginPath()
    ctx.roundRect(finalCanvas.width / 2 - 140, 80, 280, 36, 18)
    ctx.fill()
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = '#a5b4fc'
    ctx.font = 'bold 10px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.letterSpacing = '2px'
    ctx.fillText('✨ PARTAGE EN DIRECT', finalCanvas.width / 2, 98)
    ctx.letterSpacing = 'normal' // Reset

    // 2. Event Name
    ctx.fillStyle = '#ffffff'
    ctx.font = '800 24px Playfair Display, Georgia, serif'
    ctx.fillText(eventData.name, finalCanvas.width / 2, 170)

    // Accent line under event name
    const lineGrad = ctx.createLinearGradient(finalCanvas.width / 2 - 100, 0, finalCanvas.width / 2 + 100, 0)
    lineGrad.addColorStop(0, 'rgba(99, 102, 241, 0)')
    lineGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.6)')
    lineGrad.addColorStop(1, 'rgba(99, 102, 241, 0)')
    ctx.fillStyle = lineGrad
    ctx.fillRect(finalCanvas.width / 2 - 100, 192, 200, 2)

    // 3. Catchy copywriting title
    ctx.fillStyle = '#ffffff'
    ctx.font = '900 40px Inter, sans-serif'
    ctx.fillText("PARTICIPEZ À L'ALBUM !", finalCanvas.width / 2, 250)

    // 4. Subtitle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)'
    ctx.font = '500 16px Inter, sans-serif'
    ctx.fillText("Scannez pour ajouter vos photos à l'album Teutchap en direct.", finalCanvas.width / 2, 290)

    // 5. QR Code Card background
    const qrSize = 320
    const qrX = finalCanvas.width / 2 - qrSize / 2
    const qrY = 360

    // Radial shadow behind card
    const qrShadow = ctx.createRadialGradient(finalCanvas.width / 2, qrY + qrSize / 2, 30, finalCanvas.width / 2, qrY + qrSize / 2, 240)
    qrShadow.addColorStop(0, 'rgba(99, 102, 241, 0.12)')
    qrShadow.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = qrShadow
    ctx.fillRect(qrX - 80, qrY - 80, qrSize + 160, qrSize + 160)

    // Rounded glass frame
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)'
    ctx.beginPath()
    ctx.roundRect(qrX - 25, qrY - 25, qrSize + 50, qrSize + 50, 32)
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 6. Draw glowing white QR Code
    const qrOffscreen = document.createElement('canvas')
    qrOffscreen.width = qrCanvas.width
    qrOffscreen.height = qrCanvas.height
    const oCtx = qrOffscreen.getContext('2d')
    if (oCtx) {
      oCtx.drawImage(qrCanvas, 0, 0)
      const imgData = oCtx.getImageData(0, 0, qrOffscreen.width, qrOffscreen.height)
      const data = imgData.data
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i+1]
        const b = data[i+2]
        const brightness = (r + g + b) / 3
        if (brightness < 120) {
          // Keep QR code block as bright white
          data[i] = 255
          data[i+1] = 255
          data[i+2] = 255
          data[i+3] = 255
        } else {
          // Background transparent
          data[i+3] = 0
        }
      }
      oCtx.putImageData(imgData, 0, 0)
      ctx.drawImage(qrOffscreen, qrX, qrY, qrSize, qrSize)
    }

    // 7. Center Logo badge inside QR (Pill shape to fit 'teutchap')
    const logoWidth = 90
    const logoHeight = 36
    const logoX = finalCanvas.width / 2 - logoWidth / 2
    const logoY = qrY + qrSize / 2 - logoHeight / 2
    
    // Smooth background badge
    ctx.fillStyle = '#0c0a17'
    ctx.beginPath()
    ctx.roundRect(logoX, logoY, logoWidth, logoHeight, 10)
    ctx.fill()
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)'
    ctx.lineWidth = 2
    ctx.stroke()

    // Text logo "teutchap" inside
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 12px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('teutchap', finalCanvas.width / 2, logoY + logoHeight / 2)
    ctx.textBaseline = 'alphabetic' // Reset

    // 8. Draw step-by-step instructions
    const stepsY = 780
    const colWidth = 220
    const spacing = 20
    const startX = finalCanvas.width / 2 - (colWidth * 3 + spacing * 2) / 2

    const steps = [
      { icon: '📱', title: '1. SCANNEZ', desc: 'Ouvrez votre appareil photo et flashez le QR code.' },
      { icon: '📤', title: '2. PARTAGEZ', desc: 'Sélectionnez vos photos (aucune application à installer).' },
      { icon: '✨', title: '3. ADMIREZ', desc: "Regardez l'album se remplir en temps réel !" }
    ]

    const wrapText = (context: any, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ')
      let line = ''
      let currentY = y
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' '
        const metrics = context.measureText(testLine)
        const testWidth = metrics.width
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, x + maxWidth / 2, currentY)
          line = words[n] + ' '
          currentY += lineHeight
        } else {
          line = testLine
        }
      }
      context.fillText(line, x + maxWidth / 2, currentY)
    }

    steps.forEach((step, idx) => {
      const x = startX + idx * (colWidth + spacing)
      
      // Step card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)'
      ctx.beginPath()
      ctx.roundRect(x, stepsY, colWidth, 240, 20)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Emoji Icon
      ctx.font = '32px Inter, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(step.icon, x + colWidth / 2, stepsY + 50)

      // Title
      ctx.fillStyle = '#ffffff'
      ctx.font = '900 13px Inter, sans-serif'
      ctx.fillText(step.title, x + colWidth / 2, stepsY + 105)

      // Description
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)'
      ctx.font = '500 11px Inter, sans-serif'
      wrapText(ctx, step.desc, x + 15, stepsY + 135, colWidth - 30, 16)
    })

    // 9. Footer
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
    ctx.font = '600 10px Inter, sans-serif'
    ctx.fillText('Créé avec amour par Teutchap • teutchap.fr', finalCanvas.width / 2, finalCanvas.height - 70)

    // Trigger download
    const pngFile = finalCanvas.toDataURL('image/png')
    const downloadLink = document.createElement('a')
    downloadLink.download = `Teutchap_${eventData.name.replace(/\s+/g, '_')}_Flyer.png`
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
      {!isPhotoDetailOpen && (
        <header className="fixed top-0 left-0 right-0 z-50 px-6 h-24 flex items-center justify-between bg-gradient-to-b from-[#08060d]/80 to-transparent backdrop-blur-[2px] pointer-events-none border-b border-white/[0.02]">
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

          {activeTab === 'challenges' && <ChallengesTab challenges={challenges} showChallengeForm={showChallengeForm} setShowChallengeForm={setShowChallengeForm} newChallenge={{title: '', description: ''}} setNewChallenge={() => {}} handleSaveChallenge={() => {}} deleteChallenge={deleteChallenge} />}
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

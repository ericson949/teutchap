import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ArrowLeft, ExternalLink, Sparkles } from 'lucide-react'
import { useEventOverviewLogic } from '../../hooks/useEventOverviewLogic'
import { OverviewQRSection } from './components/OverviewQRSection'
import { OverviewSecuritySection } from './components/OverviewSecuritySection'
import { OverviewTimerSection } from './components/OverviewTimerSection'
import { OverviewCapacitySection } from './components/OverviewCapacitySection'
import UpgradeEvent from './UpgradeEvent'

export default function EventOverview() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
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
                onClick={() => setShowUpgradeModal(true)}
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
              <OverviewCapacitySection 
                currentPhotos={photos.length} 
                maxPhotos={currentConfig.max_photos} 
                currentGuests={guests?.length || 0}
                maxGuests={currentConfig.max_guests}
                onUpgrade={() => setShowUpgradeModal(true)} 
              />
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showUpgradeModal && (
          <UpgradeEvent isModal={true} onClose={() => setShowUpgradeModal(false)} eventId={eventId} />
        )}
      </AnimatePresence>
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

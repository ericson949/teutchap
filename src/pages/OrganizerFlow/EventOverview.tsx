import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Share2, Copy, Zap, ArrowLeft, Star, ImageIcon, Lock, ExternalLink, Sparkles, Check, Download } from 'lucide-react'
import { useEvent } from '../../hooks/useEvent'
import { usePhotos } from '../../hooks/usePhotos'

export default function EventOverview() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  // Fetch event details and photo count
  const { eventData, loading: eventLoading } = useEvent(eventId)
  const { photos } = usePhotos(eventData?.id)

  if (eventLoading || !eventData) {
    return (
      <div className="min-h-screen bg-[#08060d] text-white flex items-center justify-center font-black uppercase tracking-[0.3em] text-xs">
        Chargement de l'événement...
      </div>
    )
  }

  const eventUrl = `${window.location.origin}/e/${eventData.token}`

  const copyLink = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(eventUrl)
    } else {
      const textArea = document.createElement("textarea")
      textArea.value = eventUrl
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
      } catch (err) {}
      document.body.removeChild(textArea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 3500)
  }

  const shareWhatsApp = () => {
    const text = `Rejoignez l'album photo partagé de "${eventData.name}" !\n\nScannez le QR code ou cliquez sur le lien ci-dessous pour contribuer sans application :\n${eventUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const downloadQRCode = () => {
    const svg = document.querySelector('#overview-qr svg') as SVGGraphicsElement
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width + 120
      canvas.height = img.height + 180
      if (ctx) {
        ctx.fillStyle = '#08060d'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(40, 40, img.width + 40, img.height + 40)
        ctx.drawImage(img, 60, 60)
        
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 22px Outfit, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(eventData.name, canvas.width / 2, canvas.height - 50)
        
        ctx.fillStyle = '#aa3bff'
        ctx.font = 'bold 12px Outfit, sans-serif'
        ctx.fillText('SCANNEZ POUR CONTRIBUER', canvas.width / 2, canvas.height - 25)

        const link = document.createElement('a')
        link.download = `QR_Teutchap_${eventData.name.replace(/\s+/g, '_')}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  // Determine limits
  const isFree = eventData.plan === 'free' || !eventData.plan
  const maxPhotos = eventData.plan === 'vip' ? 3000 : eventData.plan === 'premium' ? 1000 : 100
  const currentPhotos = photos.length
  const percentage = Math.min(100, Math.round((currentPhotos / maxPhotos) * 100))

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col selection:bg-primary/30 relative overflow-x-hidden">
      {/* Immersive Ambient Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-10%] w-[50%] h-[50%] bg-primary/15 blur-[140px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[140px] rounded-full" />
      </div>

      {/* Toast Global Notification for Clipboard Copy */}
      {copied && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-black text-xs px-6 py-3 rounded-full shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-top duration-300">
          <Check size={16} className="stroke-[3]" />
          <span>Lien copié dans le presse-papiers avec succès !</span>
        </div>
      )}

      {/* Top Header - Compact height on mobile */}
      <header className="glass-dark border-b border-white/5 px-4 py-3 md:px-6 md:py-4 flex justify-between items-center sticky top-0 z-40 backdrop-blur-2xl">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate('/portal')} 
            className="p-2 glass border border-white/10 text-gray-400 hover:text-white rounded-xl transition-all active:scale-95"
            title="Retour au portail"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                isFree ? 'border-white/10 text-gray-500 bg-white/5' : 'border-primary/40 bg-primary/10 text-primary'
              }`}>
                Plan {eventData.plan === 'premium' ? 'Premium' : eventData.plan === 'vip' ? 'VIP' : 'Essentiel'}
              </span>
              <span className="text-[9px] text-green-400 font-black uppercase tracking-widest flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block mr-0.5" />
                Actif
              </span>
            </div>
            <h1 className="text-sm md:text-base font-black tracking-tight text-gradient line-clamp-1">{eventData.name}</h1>
          </div>
        </div>

        {/* Link to Full Admin Console */}
        <button 
          onClick={() => navigate(`/dashboard/${eventId}`)}
          className="flex items-center space-x-1.5 glass border border-white/10 hover:border-primary/30 hover:bg-white/5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-white transition-all active:scale-95"
        >
          <span className="hidden sm:inline">Console Avancée</span>
          <ExternalLink size={12} className="text-primary" />
        </button>
      </header>

      {/* Main Content Dashboard - Minimized paddings and hidden intro text on mobile to ensure zero vertical scroll */}
      <main className="max-w-5xl mx-auto p-3 md:p-8 space-y-3 md:space-y-8 relative z-10 w-full flex-1 flex flex-col justify-center">
        
        {/* Welcome Intro Banner - Hidden on mobile viewports so core card takes top view directly */}
        <div className="text-center space-y-2 hidden sm:block animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
            <Sparkles size={12} className="text-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">Votre événement est en ligne</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter">
            Diffusez <span className="text-gradient">l'Expérience</span>
          </h2>
          <p className="text-gray-400 text-xs font-medium max-w-md mx-auto leading-relaxed">
            Vos invités scannent ce QR code ou ouvrent le lien pour partager leurs photos instantanément. Zéro téléchargement.
          </p>
        </div>

        {/* Unified Viewport Control Card - Highly compact on mobile */}
        <div className="glass rounded-[2rem] md:rounded-[3rem] p-4 md:p-8 border border-white/5 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="absolute top-0 right-0 w-60 h-60 bg-primary/10 blur-[80px] -mr-30 -mt-30 rounded-full opacity-60 pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 items-center relative z-10">
            
            {/* Left/Top Part: QR Code & Fast Access Link */}
            <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
              <div className="w-full flex justify-between items-center">
                <div className="space-y-0.5 text-left">
                  <h3 className="text-sm md:text-base font-black tracking-tight text-white">
                    Code d'Accès Album
                  </h3>
                  <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Scan universel invité</p>
                </div>
                <button 
                  onClick={downloadQRCode}
                  className="flex items-center space-x-1 bg-white/5 hover:bg-white/10 border border-white/10 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-gray-300 transition-all active:scale-95"
                  title="Télécharger l'image pour impression"
                >
                  <Download size={10} />
                  <span>PNG HD</span>
                </button>
              </div>

              {/* Centered Compact QR Code */}
              <div id="overview-qr" className="bg-white p-3.5 md:p-5 rounded-[1.5rem] shadow-xl hover:scale-[1.02] transition-transform duration-500 inline-block">
                <QRCodeSVG value={eventUrl} size={130} level="H" includeMargin={false} className="w-32 h-32 md:w-44 md:h-44" />
              </div>

              {/* Direct Link Input */}
              <div className="w-full space-y-1 text-left">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 pl-1">Lien direct</label>
                <div className="flex items-center space-x-1.5">
                  <div className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-[11px] font-mono text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap select-all shadow-inner">
                    {eventUrl}
                  </div>
                  <button 
                    onClick={copyLink} 
                    className={`px-3 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md active:scale-95 shrink-0 flex items-center space-x-1 ${
                      copied ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="stroke-[3]" />
                        <span>Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button 
                onClick={shareWhatsApp}
                className="w-full flex items-center justify-center space-x-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm"
              >
                <Share2 size={14} className="fill-current" />
                <span>Partager sur WhatsApp</span>
              </button>
            </div>

            {/* Right/Bottom Part: Plan Details & Upgrade Prompt */}
            <div className="space-y-4 md:border-l md:border-white/5 md:pl-6 flex flex-col justify-between h-full pt-4 md:pt-0 border-t border-white/5 md:border-t-0">
              
              {/* Capacity Status */}
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Capacité du Plan</h3>
                    <p className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Stockage des souvenirs</p>
                  </div>
                  <div className="p-1.5 bg-white/5 rounded-lg text-gray-400">
                    <ImageIcon size={14} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-black tracking-tighter tabular-nums text-white">
                      {currentPhotos} <span className="text-[10px] font-bold text-gray-500 tracking-normal">/ {maxPhotos}</span>
                    </span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${percentage > 85 ? 'text-accent' : 'text-gray-400'}`}>
                      {percentage}%
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        percentage > 85 ? 'bg-accent' : percentage > 60 ? 'bg-gradient-to-r from-primary to-accent' : 'bg-primary'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  {isFree && percentage > 80 && (
                    <p className="text-[8px] font-black text-accent uppercase tracking-widest animate-pulse pt-0.5">
                      ⚠️ Quota bientôt atteint !
                    </p>
                  )}
                </div>

                {/* Features Inclusion */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center text-[10px] text-gray-300">
                    <Check size={12} className="text-green-400 mr-1.5 shrink-0" />
                    <span className="font-medium">PWA & Compression HD</span>
                  </div>
                  
                  {isFree ? (
                    <>
                      <div className="flex items-center text-[10px] text-gray-600 line-through">
                        <Lock size={10} className="mr-1.5 shrink-0 text-gray-700" />
                        <span>Reveal Mode & Floutage</span>
                      </div>
                      <div className="flex items-center text-[10px] text-gray-600 line-through">
                        <Lock size={10} className="mr-1.5 shrink-0 text-gray-700" />
                        <span>Indexation IA (Gemini 1.5)</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center text-[10px] text-primary font-bold">
                      <Sparkles size={10} className="mr-1.5 shrink-0 fill-current animate-pulse" />
                      <span>Fonctions Premium Débloquées</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upgrade Trigger */}
              {eventData.plan !== 'vip' && (
                <div className="pt-2 border-t border-white/5">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2 relative overflow-hidden">
                    <div className="flex items-center space-x-1 text-[7px] font-black uppercase tracking-widest text-primary">
                      <Star size={8} className="fill-current" />
                      <span>Recommandé</span>
                    </div>
                    <p className="text-[10px] text-gray-300 font-medium leading-tight">
                      Débloquez le floutage avant le reveal et le stockage étendu.
                    </p>
                    <button 
                      onClick={() => navigate(`/dashboard/${eventId}/upgrade`)}
                      className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-dark text-white font-black py-2.5 rounded-lg shadow-sm shadow-primary/20 transition-all active:scale-95 text-[9px] uppercase tracking-widest flex items-center justify-center space-x-1"
                    >
                      <Zap size={10} className="fill-current animate-bounce" />
                      <span>Améliorer mon plan</span>
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>

      </main>

      {/* Subtle Footer branding */}
      <footer className="py-4 text-center text-gray-600 text-[8px] font-black uppercase tracking-[0.3em]">
        Interface Organisateur Épurée • Teutchap
      </footer>
    </div>
  )
}

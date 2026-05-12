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
    navigator.clipboard.writeText(eventUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
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
        
        // Add subtle border/background for the inner QR area
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(40, 40, img.width + 40, img.height + 40)
        ctx.drawImage(img, 60, 60)
        
        // Custom text rendering at the bottom
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

      {/* Top Header */}
      <header className="glass-dark border-b border-white/5 px-6 py-5 flex justify-between items-center sticky top-0 z-40 backdrop-blur-2xl">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/portal')} 
            className="p-2.5 glass border border-white/10 text-gray-400 hover:text-white rounded-xl transition-all active:scale-95"
            title="Retour au portail"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                isFree ? 'border-white/10 text-gray-500 bg-white/5' : 'border-primary/40 bg-primary/10 text-primary'
              }`}>
                Plan {eventData.plan === 'premium' ? 'Premium' : eventData.plan === 'vip' ? 'VIP' : 'Essentiel'}
              </span>
              <span className="text-[10px] text-green-400 font-black uppercase tracking-widest flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block mr-1" />
                Actif
              </span>
            </div>
            <h1 className="text-lg font-black tracking-tight text-gradient line-clamp-1">{eventData.name}</h1>
          </div>
        </div>

        {/* Link to Full Admin Console */}
        <button 
          onClick={() => navigate(`/dashboard/${eventId}`)}
          className="flex items-center space-x-2 glass border border-white/10 hover:border-primary/30 hover:bg-white/5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-300 hover:text-white transition-all active:scale-95"
        >
          <span className="hidden xs:inline">Console Avancée</span>
          <ExternalLink size={14} className="text-primary" />
        </button>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-5xl mx-auto p-4 md:p-10 space-y-8 md:space-y-12 relative z-10 w-full flex-1 flex flex-col justify-center">
        
        {/* Welcome Intro Banner */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
            <Sparkles size={12} className="text-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400">Votre événement est en ligne</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tighter">
            Diffusez <span className="text-gradient">l'Expérience</span>
          </h2>
          <p className="text-gray-400 text-xs md:text-sm font-medium max-w-md mx-auto leading-relaxed">
            Vos invités scannent ce QR code ou ouvrent le lien pour partager leurs photos instantanément. Zéro téléchargement requis.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Distribution Block (QR Code + Sharing) */}
          <section className="lg:col-span-7 glass rounded-[2.5rem] p-6 md:p-10 border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden group animate-in fade-in zoom-in-95 duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -mr-32 -mt-32 rounded-full opacity-60 group-hover:opacity-100 transition-opacity" />

            <div className="space-y-8 relative z-10 flex-1 flex flex-col justify-between">
              
              {/* Top info badge */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="text-lg font-black tracking-tight text-white flex items-center space-x-2">
                    <span>Code d'Accès Universel</span>
                  </h3>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">À imprimer ou projeter</p>
                </div>
                <button 
                  onClick={downloadQRCode}
                  className="flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-300 transition-all active:scale-95 shadow-inner"
                  title="Télécharger l'image pour impression"
                >
                  <Download size={12} />
                  <span className="hidden xs:inline">PNG HD</span>
                </button>
              </div>

              {/* QR Render Center */}
              <div className="flex justify-center py-4">
                <div id="overview-qr" className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] group-hover:scale-[1.02] transition-transform duration-500">
                  <QRCodeSVG value={eventUrl} size={180} level="H" includeMargin={false} className="w-44 h-44 md:w-52 md:h-52" />
                </div>
              </div>

              {/* Link copy and social buttons */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 pl-1">Lien direct de l'album</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-xs font-mono text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap select-all shadow-inner">
                      {eventUrl}
                    </div>
                    <button 
                      onClick={copyLink} 
                      className={`px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 shrink-0 flex items-center space-x-1.5 ${
                        copied ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check size={14} className="stroke-[3]" />
                          <span>Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span>Copier</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <button 
                  onClick={shareWhatsApp}
                  className="w-full flex items-center justify-center space-x-2.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg"
                >
                  <Share2 size={16} className="fill-current" />
                  <span>Partager le carton sur WhatsApp</span>
                </button>
              </div>
            </div>
          </section>

          {/* Side Monetization & Plan Status Block */}
          <section className="lg:col-span-5 flex flex-col justify-between space-y-6 animate-in fade-in zoom-in-95 duration-500 delay-150">
            
            {/* Quota & Capacity tracking Card */}
            <div className="glass rounded-[2.5rem] p-6 md:p-8 border border-white/5 shadow-2xl space-y-6 relative overflow-hidden bg-white/[0.01]">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Capacité de Stockage</h3>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Photos partagées en direct</p>
                </div>
                <div className="p-2 bg-white/5 rounded-xl text-gray-400">
                  <ImageIcon size={16} />
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-3xl font-black tracking-tighter tabular-nums text-white">
                    {currentPhotos} <span className="text-xs font-bold text-gray-500 tracking-normal">/ {maxPhotos}</span>
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${percentage > 85 ? 'text-accent' : 'text-gray-400'}`}>
                    {percentage}%
                  </span>
                </div>

                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      percentage > 85 ? 'bg-accent' : percentage > 60 ? 'bg-gradient-to-r from-primary to-accent' : 'bg-primary'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                {isFree && percentage > 80 && (
                  <p className="text-[9px] font-black text-accent uppercase tracking-widest animate-pulse pt-1">
                    ⚠️ Attention : Quota bientôt atteint !
                  </p>
                )}
              </div>

              {/* Tier feature highlights/limitations */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Inclus dans votre plan :</p>
                
                <div className="space-y-2.5">
                  <div className="flex items-center text-xs text-gray-300">
                    <Check size={14} className="text-green-400 mr-2 shrink-0" />
                    <span className="font-medium">Galerie PWA instantanée</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-300">
                    <Check size={14} className="text-green-400 mr-2 shrink-0" />
                    <span className="font-medium">Compression intelligente client</span>
                  </div>
                  
                  {isFree ? (
                    <>
                      <div className="flex items-center text-xs text-gray-600 line-through">
                        <Lock size={12} className="mr-2 shrink-0 text-gray-700" />
                        <span>Floutage planifié (Reveal Mode)</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600 line-through">
                        <Lock size={12} className="mr-2 shrink-0 text-gray-700" />
                        <span>Indexation & tags IA par Gemini</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600 line-through">
                        <Lock size={12} className="mr-2 shrink-0 text-gray-700" />
                        <span>Défis illimités & Multi-Jours</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center text-xs text-primary font-bold">
                        <Sparkles size={12} className="mr-2 shrink-0 fill-current animate-pulse" />
                        <span>Reveal Mode & Tags IA débloqués</span>
                      </div>
                      <div className="flex items-center text-xs text-primary font-bold">
                        <Sparkles size={12} className="mr-2 shrink-0 fill-current" />
                        <span>Capacité étendue ({maxPhotos} photos)</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Upgrade CTA Promo Banner */}
            {eventData.plan !== 'vip' && (
              <div className="glass rounded-[2.5rem] p-6 border border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 shadow-[0_0_30px_rgba(170,59,255,0.15)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[40px] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                
                <div className="space-y-4 relative z-10">
                  <div>
                    <div className="flex items-center space-x-1.5 text-[9px] font-black uppercase tracking-widest text-primary mb-1">
                      <Star size={12} className="fill-current" />
                      <span>Recommandé pour les réceptions</span>
                    </div>
                    <h4 className="text-lg font-black tracking-tight text-white">Débloquez l'Élite.</h4>
                    <p className="text-gray-400 text-xs font-medium mt-1 leading-relaxed">
                      Passez au plan Premium/VIP pour flouter la galerie jusqu'au grand reveal, indexer par IA et capturer en illimité.
                    </p>
                  </div>

                  <button 
                    onClick={() => navigate(`/dashboard/${eventId}/upgrade`)}
                    className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary-dark hover:to-accent text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/30 transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center justify-center space-x-2 group/btn"
                  >
                    <Zap size={14} className="fill-current animate-bounce" />
                    <span>Améliorer mon plan</span>
                  </button>
                </div>
              </div>
            )}

          </section>

        </div>

      </main>

      {/* Subtle Footer branding */}
      <footer className="py-6 text-center text-gray-600 text-[9px] font-black uppercase tracking-[0.3em]">
        Interface Organisateur Épurée • Teutchap
      </footer>
    </div>
  )
}

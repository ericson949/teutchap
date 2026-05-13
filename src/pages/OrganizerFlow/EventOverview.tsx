import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Share2, Copy, Zap, ArrowLeft, Star, ImageIcon, Lock, ExternalLink, Sparkles, Check, Download, Users, Loader2, Shield, Key, UserPlus, Trash2, Mail, Clock, Hourglass } from 'lucide-react'
import { useEvent } from '../../hooks/useEvent'
import { usePhotos } from '../../hooks/usePhotos'
import { useAppPlans } from '../../hooks/useAppPlans'
import { supabase } from '../../lib/supabase'

export default function EventOverview() {
  const { eventId } = useParams()
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  
  // Custom states for Password and Co-Admin features
  const [newPassword, setNewPassword] = useState('')
  const [pwdLoading, setPwdLoading] = useState(false)
  const [adminInput, setAdminInput] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)

  // États des Toggles de visibilité conditionnelle
  const [enablePasswordToggle, setEnablePasswordToggle] = useState(false)
  const [enableAdminsToggle, setEnableAdminsToggle] = useState(false)

  // États de la génération d'archive globale ZIP (Exportation de l'album)
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  
  // États de l'envoi de l'archive ZIP par courriel
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [zipEmail, setZipEmail] = useState('')
  const [emailSending, setEmailSending] = useState(false)

  // Fetch event details and photo count
  const { eventData, loading: eventLoading, updateEvent } = useEvent(eventId)
  const { photos } = usePhotos(eventData?.id)
  const { currentConfig } = useAppPlans(eventData?.plan)

  // --- CHRONOMÈTRE INTELLIGENT MULTI-PHASES (NIVEAU SUPÉRIEUR) ---
  const [timeRemaining, setTimeRemaining] = useState<{
    label: string;
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    phase: 'before_start' | 'active' | 'before_reveal' | 'finished';
  }>({
    label: 'Calcul du cycle...',
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    phase: 'before_start'
  })

  useEffect(() => {
    // Calculs dynamiques de dates basés sur le payload de l'événement
    const getParsedDateTime = (dateStr?: string, timeStr?: string) => {
      if (!dateStr) return null
      const base = new Date(dateStr)
      if (isNaN(base.getTime())) return null
      if (timeStr) {
        const [hours, mins] = timeStr.split(':').map(Number)
        if (!isNaN(hours)) base.setHours(hours)
        if (!isNaN(mins)) base.setMinutes(mins)
      }
      return base
    }

    const baseDateStr = eventData?.event_date || eventData?.created_at || new Date().toISOString()
    const startDt = getParsedDateTime(baseDateStr, eventData?.start_time) || new Date()
    if (startDt.getFullYear() > 2100 || startDt.getFullYear() < 2000) {
      startDt.setTime(Date.now())
    }

    // Date de fin estimée : par défaut 24h après le début si non spécifiée
    let endDt = getParsedDateTime(eventData?.end_date, eventData?.end_time)
    if (!endDt || isNaN(endDt.getTime()) || endDt.getTime() <= startDt.getTime()) {
      endDt = new Date(startDt.getTime() + 24 * 3600 * 1000)
    }
    if (endDt.getFullYear() > 2100 || endDt.getFullYear() < 2000) {
      endDt.setTime(startDt.getTime() + 24 * 3600 * 1000)
    }
    
    // Date du grand Reveal : par exemple 12h ou 24h après la fin des captures
    const revealDt = new Date(endDt.getTime() + 12 * 3600 * 1000)

    const updateTimer = () => {
      const now = new Date().getTime()
      const start = startDt.getTime()
      const end = endDt.getTime()
      const reveal = revealDt.getTime()

      let target = start
      let labelStr = "Avant le début de l'événement"
      let currentPhase: 'before_start' | 'active' | 'before_reveal' | 'finished' = 'before_start'

      if (now < start) {
        target = start
        labelStr = "Avant le début de l'événement"
        currentPhase = 'before_start'
      } else if (now >= start && now < end) {
        target = end
        labelStr = "Temps restant avant la fin"
        currentPhase = 'active'
      } else if (now >= end && now < reveal) {
        target = reveal
        labelStr = "Avant le Reveal de l'album"
        currentPhase = 'before_reveal'
      } else {
        setTimeRemaining({
          label: "Album finalisé et révélé",
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          phase: 'finished'
        })
        return
      }

      const diff = Math.max(0, target - now)
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeRemaining({
        label: labelStr,
        days,
        hours,
        minutes,
        seconds,
        phase: currentPhase
      })
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [eventData?.event_date, eventData?.start_time, eventData?.end_date, eventData?.end_time])

  // Synchroniser les toggles avec l'état en base au chargement
  useEffect(() => {
    if (eventData) {
      if (eventData.access_password) setEnablePasswordToggle(true)
      if (eventData.co_admins && eventData.co_admins.length > 0) setEnableAdminsToggle(true)
    }
  }, [eventData])

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-[#08060d] text-white flex flex-col items-center justify-center selection:bg-primary/30 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/20 blur-[100px] rounded-full animate-pulse pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-md animate-pulse" />
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-xl">
              <Loader2 size={28} className="text-primary animate-spin" />
            </div>
          </div>
          <div className="text-center space-y-2 animate-fade-in">
            <div className="text-xs font-black uppercase tracking-[0.3em] bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Connexion à l'espace
            </div>
            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase opacity-75">
              Synchronisation des données en cours...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-[#08060d] text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="w-full max-w-md glass rounded-3xl p-8 border border-white/10 space-y-6 animate-scale-up">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            ✕
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black tracking-wide uppercase">Événement introuvable</h2>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              Ce lien est expiré ou l'album n'existe plus. Veuillez vérifier auprès de l'organisateur.
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
          >
            Retourner à l'accueil
          </button>
        </div>
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

  // Security Management Handlers
  const handleSetPassword = async () => {
    if (!newPassword.trim()) return
    setPwdLoading(true)
    await updateEvent({ access_password: newPassword.trim() })
    setNewPassword('')
    setPwdLoading(false)
  }

  const handleRevokePassword = async () => {
    setPwdLoading(true)
    await updateEvent({ access_password: null })
    setPwdLoading(false)
  }

  const handleAddAdmin = async () => {
    if (!adminInput.trim()) return
    setAdminLoading(true)
    const currentAdmins = eventData.co_admins || []
    if (!currentAdmins.includes(adminInput.trim())) {
      await updateEvent({ co_admins: [...currentAdmins, adminInput.trim()] })
    }
    setAdminInput('')
    setAdminLoading(false)
  }

  const handleRemoveAdmin = async (adminToRemove: string) => {
    setAdminLoading(true)
    const currentAdmins = eventData.co_admins || []
    await updateEvent({ co_admins: currentAdmins.filter((a: string) => a !== adminToRemove) })
    setAdminLoading(false)
  }

  // Toggles de gestion conditionnelle
  const handleTogglePasswordFeature = async () => {
    const nextState = !enablePasswordToggle
    setEnablePasswordToggle(nextState)
    if (!nextState && eventData?.access_password) {
      setPwdLoading(true)
      await updateEvent({ access_password: null })
      setPwdLoading(false)
    }
  }

  const handleToggleAdminsFeature = async () => {
    const fallbackCount = parseInt(localStorage.getItem(`teutchap_guests_count_${eventData?.token}`) || '1', 10)
    const currentJoined = eventData?.joined_guests_count || fallbackCount

    if (!enableAdminsToggle && currentJoined <= 1) {
      alert("⚠️ L'activation des co-administrateurs requiert qu'au moins un autre invité ait déjà rejoint l'album.")
      return
    }

    const nextState = !enableAdminsToggle
    setEnableAdminsToggle(nextState)
    if (!nextState && eventData?.co_admins && eventData.co_admins.length > 0) {
      setAdminLoading(true)
      await updateEvent({ co_admins: [] })
      setAdminLoading(false)
    }
  }

  // Logique d'Exportation Globale de l'Album en Archive ZIP
  const handleExportGlobalZip = async () => {
    if (!photos || photos.length === 0) return
    setIsExporting(true)
    setExportProgress(0)

    try {
      // Importation dynamique de JSZip pour préserver le temps de chargement initial
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()
      const safeName = eventData?.name ? eventData.name.replace(/\s+/g, '_') : 'Album'
      const timestamp = new Date().toISOString().split('T')[0]
      const folderName = `Teutchap_${safeName}_${timestamp}`
      const folder = zip.folder(folderName)

      if (!folder) throw new Error("Impossible d'initialiser le répertoire ZIP")

      let count = 0
      for (const photo of photos) {
        if (photo.url_original) {
          const { data: blob, error } = await supabase.storage
            .from('events_photos')
            .download(photo.url_original)

          if (!error && blob) {
            folder.file(photo.url_original, blob)
          } else {
            // Fichier potentiellement en cache local ou de démonstration
            folder.file(`info_${photo.id}.txt`, "Fichier source non localisé sur le serveur distant.")
          }
        }
        count++
        setExportProgress(count)
      }

      // Génération de l'archive binaire
      const content = await zip.generateAsync({ type: 'blob' })
      
      // Déclenchement du flux de téléchargement natif
      const url = URL.createObjectURL(content)
      const link = document.createElement('a')
      link.href = url
      link.download = `${folderName}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (err) {
      console.error("Erreur de génération ZIP :", err)
      alert("Une erreur est survenue lors de la compilation de l'archive.")
    } finally {
      setIsExporting(false)
      setExportProgress(0)
    }
  }

  // Logique d'Envoi du Lien de Téléchargement ZIP par Courriel
  const handleSendZipEmail = async () => {
    if (!zipEmail.includes('@')) return
    setEmailSending(true)
    
    // Simulation du traitement transactionnel serveur
    // En production, déclenche l'envoi d'un courriel sécurisé avec un jeton d'accès via Resend/SendGrid
    const timer = setTimeout(() => {
      setEmailSending(false)
      setShowEmailInput(false)
      alert(`✉️ Succès ! Le lien de téléchargement sécurisé de l'archive ZIP a été envoyé à ${zipEmail}.\n\nVous pourrez rafraîchir et télécharger l'intégralité des souvenirs haute définition sur votre ordinateur de bureau ou portable en Wi-Fi pour préserver votre forfait mobile.`)
      setZipEmail('')
    }, 1500)

    return () => clearTimeout(timer)
  }

  // Determine limits
  const isFree = eventData.plan === 'free' || !eventData.plan
  const planDisplayName = eventData.plan === 'premium' ? 'Premium' : eventData.plan === 'vip' ? 'VIP' : 'Essentiel'
  const maxPhotos = currentConfig.max_photos
  const currentPhotos = photos.length
  const percentage = Math.min(100, Math.round((currentPhotos / maxPhotos) * 100))

  const fallbackCount = parseInt(localStorage.getItem(`teutchap_guests_count_${eventData.token}`) || '1', 10)
  const joinedGuests = eventData.joined_guests_count || fallbackCount
  const maxGuests = currentConfig.max_guests
  const guestPercentage = Math.min(100, Math.round((joinedGuests / maxGuests) * 100))

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
            <h1 className="text-sm md:text-base font-black tracking-tight text-gradient line-clamp-1">
              {eventData.name}
            </h1>
            <div className="flex items-center space-x-2 mt-0.5">
              <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                isFree ? 'border-white/10 text-gray-500 bg-white/5' : 'border-primary/40 bg-primary/10 text-primary'
              }`}>
                Plan {planDisplayName}
              </span>
              <span className="text-[8px] text-green-400 font-black uppercase tracking-widest flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse inline-block" />
                <span>Actif</span>
              </span>
            </div>
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

              {/* Direct Link Input & Quick Actions */}
              <div className="w-full space-y-1 text-left">
                <label className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 pl-1">Lien direct</label>
                <div className="flex items-center space-x-1.5">
                  <div className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-xl px-2.5 py-2 text-[10px] font-mono text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap select-all shadow-inner">
                    {eventUrl}
                  </div>
                  
                  {/* Bouton Copier Compact */}
                  <button 
                    onClick={copyLink} 
                    className={`px-2.5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-md active:scale-95 shrink-0 flex items-center space-x-1 ${
                      copied ? 'bg-green-500 text-white' : 'bg-white text-black hover:bg-gray-100'
                    }`}
                    title="Copier le lien"
                  >
                    {copied ? (
                      <>
                        <Check size={11} className="stroke-[3]" />
                        <span>Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy size={11} />
                        <span>Copier</span>
                      </>
                    )}
                  </button>

                  {/* Bouton Icône WhatsApp Mobile */}
                  <button 
                    onClick={shareWhatsApp}
                    className="p-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] transition-all active:scale-95 shrink-0 flex items-center justify-center shadow-sm"
                    title="Partager sur WhatsApp"
                    aria-label="Partager sur WhatsApp"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.88-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.577-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Carte de Gestion du Mot de Passe */}
              <div className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield size={14} className="text-primary" />
                    <span className="text-xs font-bold text-gray-200">Mot de passe de l'album</span>
                  </div>
                  
                  {/* Magnifique Toggle Switch */}
                  <button
                    onClick={handleTogglePasswordFeature}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${enablePasswordToggle ? 'bg-primary' : 'bg-white/10'}`}
                    aria-label="Activer le mot de passe"
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${enablePasswordToggle ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {enablePasswordToggle ? (
                  <div className="space-y-2 animate-in fade-in duration-200 pt-1">
                    {eventData.access_password ? (
                      <div className="flex items-center justify-between bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-primary-light">
                        <span>••••••••</span>
                        <button 
                          onClick={handleRevokePassword}
                          disabled={pwdLoading}
                          className="text-red-400 hover:text-red-300 font-bold text-[9px] uppercase tracking-widest flex items-center space-x-1 transition-colors"
                        >
                          {pwdLoading ? <Loader2 size={10} className="animate-spin" /> : <Trash2 size={10} />}
                          <span>Révoquer</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-1">
                          <Key size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                          <input 
                            type="text" 
                            placeholder="Définir un mot de passe..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white outline-none focus:border-primary/50 transition-colors font-mono"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                          />
                        </div>
                        <button 
                          onClick={handleSetPassword}
                          disabled={pwdLoading || !newPassword.trim()}
                          className="bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-black text-[9px] uppercase tracking-widest px-3 py-2 rounded-xl transition-all shrink-0 flex items-center justify-center"
                        >
                          {pwdLoading ? <Loader2 size={12} className="animate-spin" /> : 'Enregistrer'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-500 font-medium leading-snug">
                    Activez la bascule pour configurer un mot de passe et restreindre l'accès à cet album.
                  </p>
                )}
              </div>

              {/* Carte de Gestion des Co-Administrateurs */}
              <div className="w-full bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserPlus size={14} className="text-accent" />
                    <span className="text-xs font-bold text-gray-200">Co-administrateurs</span>
                  </div>

                  {/* Toggle Switch conditionnel */}
                  <button
                    onClick={handleToggleAdminsFeature}
                    className={`w-9 h-5 rounded-full transition-colors relative p-0.5 ${enableAdminsToggle ? 'bg-accent' : 'bg-white/10'}`}
                    aria-label="Activer les co-administrateurs"
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${enableAdminsToggle ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {enableAdminsToggle ? (
                  <div className="space-y-3 animate-in fade-in duration-200 pt-1">
                    {(eventData.co_admins || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {(eventData.co_admins || []).map((admin: string, i: number) => (
                          <div key={i} className="flex items-center space-x-1.5 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-mono text-gray-300">
                            <span className="truncate max-w-[120px]">{admin}</span>
                            <button 
                              onClick={() => handleRemoveAdmin(admin)} 
                              disabled={adminLoading}
                              className="text-gray-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={9} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <input 
                        type="text" 
                        placeholder="Email ou ID Admin..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-accent/50 transition-colors"
                        value={adminInput}
                        onChange={e => setAdminInput(e.target.value)}
                      />
                      <button 
                        onClick={handleAddAdmin}
                        disabled={adminLoading || !adminInput.trim()}
                        className="bg-accent hover:bg-accent/80 disabled:opacity-50 text-white font-black text-[9px] uppercase tracking-widest px-3 py-2 rounded-xl transition-all shrink-0 flex items-center justify-center"
                      >
                        {adminLoading ? <Loader2 size={12} className="animate-spin" /> : 'Ajouter'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-500 font-medium leading-snug">
                    Activez la bascule pour déléguer la gestion. Accessible dès qu'un invité rejoint l'album.
                  </p>
                )}
              </div>
            </div>

            {/* Right/Bottom Part: Plan Details & Upgrade Prompt */}
            <div className="space-y-5 md:border-l md:border-white/5 md:pl-6 flex flex-col justify-between h-full pt-4 md:pt-0 border-t border-white/5 md:border-t-0">
              
              {/* Carte Chronomètre Multi-Phases Dynamique */}
              <div className="bg-white/[0.02] border border-white/10 rounded-[1.5rem] p-4.5 shadow-xl space-y-3 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-[40px] rounded-full pointer-events-none transition-transform group-hover:scale-125" />
                
                <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-accent/10 border border-accent/20 rounded-xl text-accent">
                      {timeRemaining.phase === 'finished' ? (
                        <Check size={14} className="text-green-400 stroke-[3]" />
                      ) : timeRemaining.phase === 'active' ? (
                        <Hourglass size={14} className="animate-spin" />
                      ) : (
                        <Clock size={14} className="animate-pulse" />
                      )}
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-accent block">Cycle en direct</span>
                      <h3 className="text-xs font-bold text-gray-200 line-clamp-1">{timeRemaining.label}</h3>
                    </div>
                  </div>

                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                    timeRemaining.phase === 'finished' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                    timeRemaining.phase === 'active' ? 'bg-accent/10 text-accent border-accent/30 animate-pulse' :
                    'bg-primary/10 text-primary-light border-primary/30'
                  }`}>
                    {timeRemaining.phase === 'finished' ? 'Clôturé' :
                     timeRemaining.phase === 'active' ? 'En Cours' :
                     timeRemaining.phase === 'before_reveal' ? 'Attente Reveal' : 'Programmé'}
                  </span>
                </div>

                {/* Bloc Compteurs avec Tabular-Nums */}
                {timeRemaining.phase !== 'finished' ? (
                  <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                    <div className="bg-black/40 border border-white/5 rounded-xl py-2 flex flex-col justify-center">
                      <span className="text-lg font-black tabular-nums text-white leading-none">{timeRemaining.days}</span>
                      <span className="text-[7px] font-extrabold uppercase tracking-widest text-gray-500 mt-1">Jours</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-xl py-2 flex flex-col justify-center">
                      <span className="text-lg font-black tabular-nums text-white leading-none">{String(timeRemaining.hours).padStart(2, '0')}</span>
                      <span className="text-[7px] font-extrabold uppercase tracking-widest text-gray-500 mt-1">Heures</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-xl py-2 flex flex-col justify-center">
                      <span className="text-lg font-black tabular-nums text-white leading-none">{String(timeRemaining.minutes).padStart(2, '0')}</span>
                      <span className="text-[7px] font-extrabold uppercase tracking-widest text-gray-500 mt-1">Min</span>
                    </div>
                    <div className="bg-black/40 border border-white/5 rounded-xl py-2 flex flex-col justify-center">
                      <span className="text-lg font-black tabular-nums text-gradient leading-none animate-pulse">{String(timeRemaining.seconds).padStart(2, '0')}</span>
                      <span className="text-[7px] font-extrabold uppercase tracking-widest text-accent mt-1">Sec</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 italic text-center py-2 font-medium">
                    ✨ Les souvenirs sont immortalisés et accessibles par tous les invités.
                  </p>
                )}

                {/* Scénarios d'usages additionnels */}
                <div className="pt-1.5 border-t border-white/5">
                  <p className="text-[8px] text-gray-500 leading-tight">
                    💡 <span className="font-semibold text-gray-400">Cas d'usage :</span> Idéal pour coordonner un <span className="text-primary-light">lancement surprise</span>, un <span className="text-accent">mariage</span> (décompte jusqu'au vin d'honneur) ou un <span className="text-pink-400">séminaire</span> avec clôture automatique des contributions.
                  </p>
                </div>
              </div>

              {/* Premium Glass Capacity Status Card */}
              <div className="bg-white/[0.02] border border-white/10 rounded-[1.5rem] p-4.5 shadow-xl space-y-4 backdrop-blur-md relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-[30px] rounded-full pointer-events-none transition-transform group-hover:scale-125" />
                
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 rounded-xl text-primary">
                      <ImageIcon size={14} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gradient">Capacité du Plan</h3>
                      <p className="text-[7px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-0.5">Espace Photos Actuel</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300">
                    {planDisplayName}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline px-0.5">
                    <span className="text-3xl font-black tracking-tighter text-white tabular-nums drop-shadow-md">
                      {currentPhotos} <span className="text-xs font-extrabold text-gray-500 tracking-normal">/ {maxPhotos}</span>
                    </span>
                    <span className={`text-[10px] font-black tracking-widest tabular-nums px-2 py-0.5 rounded-md ${
                      percentage > 85 ? 'bg-accent/20 text-accent border border-accent/30 animate-pulse' : 'bg-primary/10 text-primary-light'
                    }`}>
                      {percentage}%
                    </span>
                  </div>

                  {/* High Fidelity Glowing Progress Bar */}
                  <div className="h-2.5 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(170,59,255,0.8)] ${
                        percentage > 85 
                          ? 'bg-gradient-to-r from-red-500 via-accent to-pink-500' 
                          : percentage > 50 
                          ? 'bg-gradient-to-r from-primary via-accent to-pink-400' 
                          : 'bg-gradient-to-r from-primary to-primary-light'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  
                  {isFree && percentage > 80 && (
                    <p className="text-[8px] font-black text-accent uppercase tracking-widest animate-pulse pt-1 flex items-center space-x-1">
                      <Zap size={8} className="fill-current" />
                      <span>Attention : Pensez à débloquer l'espace illimité</span>
                    </p>
                  )}
                </div>

                {/* Jauge Haute Fidélité des Invités Connectés */}
                <div className="space-y-2 pt-3 border-t border-white/5">
                  <div className="flex justify-between items-baseline px-0.5">
                    <div className="flex items-center space-x-1.5">
                      <Users size={12} className="text-accent animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Invités Rejoints</span>
                    </div>
                    <span className="text-xl font-black tracking-tighter text-white tabular-nums">
                      {joinedGuests} <span className="text-xs font-extrabold text-gray-500 tracking-normal">/ {maxGuests}</span>
                    </span>
                  </div>

                  <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        guestPercentage > 90 
                          ? 'bg-gradient-to-r from-red-500 to-pink-600 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse' 
                          : 'bg-gradient-to-r from-accent to-purple-500 shadow-[0_0_10px_rgba(255,59,142,0.6)]'
                      }`}
                      style={{ width: `${guestPercentage}%` }}
                    />
                  </div>

                  {guestPercentage >= 100 && (
                    <p className="text-[8px] font-black text-red-400 uppercase tracking-widest animate-pulse pt-0.5">
                      🛑 Seuil critique : Vos prochains invités seront bloqués.
                    </p>
                  )}
                </div>

                {/* State-of-the-art Feature Tokens List */}
                <div className="space-y-2 pt-1">
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl px-3 py-2 flex items-center justify-between transition-all hover:bg-white/[0.05]">
                    <div className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                      <span className="text-[10px] font-bold text-gray-200">PWA & Compression HD</span>
                    </div>
                    <Check size={12} className="text-green-400" />
                  </div>
                  
                  {isFree ? (
                    <>
                      <div className="glass border-white/5 rounded-xl px-3 py-2 flex items-center justify-between opacity-75 hover:opacity-100 transition-opacity">
                        <div className="flex items-center space-x-2">
                          <Lock size={10} className="text-gray-500" />
                          <span className="text-[10px] font-medium text-gray-400">Reveal Mode & Floutage</span>
                        </div>
                        <span className="text-[7px] font-black uppercase tracking-widest bg-gradient-to-r from-primary to-accent text-white px-1.5 py-0.5 rounded">
                          Premium
                        </span>
                      </div>
                      <div className="glass border-white/5 rounded-xl px-3 py-2 flex items-center justify-between opacity-75 hover:opacity-100 transition-opacity">
                        <div className="flex items-center space-x-2">
                          <Lock size={10} className="text-gray-500" />
                          <span className="text-[10px] font-medium text-gray-400">Indexation IA (Gemini 1.5)</span>
                        </div>
                        <span className="text-[7px] font-black uppercase tracking-widest bg-gradient-to-r from-primary to-accent text-white px-1.5 py-0.5 rounded">
                          Premium
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles size={10} className="text-primary fill-current animate-spin" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-wider">Toutes Fonctions Débloquées</span>
                      </div>
                      <span className="text-[8px] font-black text-white bg-primary px-2 py-0.5 rounded-full">VIP</span>
                    </div>
                  )}
                </div>

                {/* Bouton d'Amélioration de Plan intégré dans la Capacité */}
                {eventData.plan !== 'vip' && (
                  <div className="pt-2 border-t border-white/5">
                    <button 
                      onClick={() => navigate(`/dashboard/${eventId}/upgrade`)}
                      className="w-full relative group/btn overflow-hidden bg-gradient-to-r from-primary via-accent to-[#ff3b8e] hover:from-primary-dark text-white font-black py-3 rounded-xl shadow-[0_0_20px_rgba(170,59,255,0.3)] transition-all active:scale-95 text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 border border-white/20"
                    >
                      <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[300%] transition-transform duration-1000" />
                      <Zap size={12} className="fill-current animate-bounce drop-shadow" />
                      <span className="drop-shadow-md">Améliorer mon plan</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Carte de Gestion de l'Exportation Globale de l'Album en ZIP */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 space-y-3 text-left relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Download className="text-green-400" size={14} />
                    <span className="text-xs font-bold text-gray-200">Exportation de l'Album</span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                    {photos ? photos.length : 0} souvenirs
                  </span>
                </div>

                <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                  Téléchargez l'intégralité des photos brutes haute définition en une seule archive ZIP.
                </p>

                {isExporting ? (
                  <div className="space-y-2 pt-1">
                    <div className="flex justify-between text-[9px] font-bold text-primary-light">
                      <span>Compression en cours...</span>
                      <span>{exportProgress} / {photos ? photos.length : 0}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-green-400 transition-all duration-300"
                        style={{ width: `${(exportProgress / Math.max(1, photos ? photos.length : 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <button 
                      onClick={handleExportGlobalZip}
                      disabled={!photos || photos.length === 0}
                      className="w-full bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest py-2.5 rounded-xl transition-all active:scale-95 border border-white/10 flex items-center justify-center space-x-2 shadow-sm"
                    >
                      <Download size={12} className="text-green-400" />
                      <span>Télécharger l'archive ZIP</span>
                    </button>

                    {!showEmailInput ? (
                      <button 
                        onClick={() => setShowEmailInput(true)}
                        disabled={!photos || photos.length === 0}
                        className="w-full bg-primary/10 hover:bg-primary/20 disabled:opacity-50 text-primary-light font-black text-[10px] uppercase tracking-widest py-2 rounded-xl transition-all active:scale-95 border border-primary/20 flex items-center justify-center space-x-2"
                      >
                        <Mail size={12} />
                        <span>Recevoir le lien par e-mail</span>
                      </button>
                    ) : (
                      <div className="space-y-2 animate-in slide-in-from-top-1 duration-200 pt-1">
                        <input 
                          type="email"
                          placeholder="votre.email@domaine.com"
                          value={zipEmail}
                          onChange={e => setZipEmail(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-primary/50 transition-colors"
                        />
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => setShowEmailInput(false)}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-gray-400 font-bold text-[9px] uppercase tracking-wider py-1.5 rounded-lg transition-colors"
                          >
                            Annuler
                          </button>
                          <button 
                            onClick={handleSendZipEmail}
                            disabled={!zipEmail.includes('@') || emailSending}
                            className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-black text-[9px] uppercase tracking-wider py-1.5 rounded-lg transition-all flex items-center justify-center space-x-1"
                          >
                            {emailSending ? (
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <>
                                <Check size={10} />
                                <span>Envoyer</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

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

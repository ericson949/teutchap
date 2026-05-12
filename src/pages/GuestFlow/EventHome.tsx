import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, Image as ImageIcon, Hash, Clock, Bell, X, RefreshCw, CloudLightning, AlertTriangle, Users, Check, Lock, PlusCircle, Calendar, User, Loader2 } from 'lucide-react'
import localforage from 'localforage'
import { useEvent } from '../../hooks/useEvent'
import { usePhotos } from '../../hooks/usePhotos'
import { useChallenges } from '../../hooks/useChallenges'
import { useReactions } from '../../hooks/useReactions'
import { useAppPlans } from '../../hooks/useAppPlans'
import { requestNotificationPermission, sendNotification } from '../../lib/notifications'
import { supabase } from '../../lib/supabase'

export default function EventHome() {
  const { token } = useParams()
  const navigate = useNavigate()
  
  // Custom Hooks
  const { eventData, loading: eventLoading, incrementGuestCount } = useEvent(token, true)
  const { challenges, addChallenge } = useChallenges(eventData?.id)
  const { currentConfig } = useAppPlans(eventData?.plan)
  
  // Local interface state
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)
  const [offlineQueueCount, setOfflineQueueCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  // Onboarding session management via local persistence
  const [guestPseudo, setGuestPseudo] = useState('')
  const [inputPseudo, setInputPseudo] = useState('')
  const [hasSession, setHasSession] = useState(false)
  const [isJoinedCountIncremented, setIsJoinedCountIncremented] = useState(false)
  
  // Challenge creation modal/drawer state
  const [showChallengeForm, setShowChallengeForm] = useState(false)
  const [newChalTitle, setNewChalTitle] = useState('')
  const [newChalDesc, setNewChalDesc] = useState('')
  const [isAddingChal, setIsAddingChal] = useState(false)

  // Sas de Sécurité Premium (Mot de passe de l'album partagé)
  const [pwdInput, setPwdInput] = useState('')
  const [pwdError, setPwdError] = useState(false)
  const [isPasswordVerified, setIsPasswordVerified] = useState(false)

  // Initialize password verification status
  useEffect(() => {
    if (!token) return
    const verified = localStorage.getItem(`teutchap_pwd_verified_${token}`)
    if (verified === 'true') {
      setIsPasswordVerified(true)
    }
  }, [token])

  const handleVerifyPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (pwdInput.trim() === eventData?.access_password) {
      setIsPasswordVerified(true)
      localStorage.setItem(`teutchap_pwd_verified_${token}`, 'true')
      setPwdError(false)
    } else {
      setPwdError(true)
    }
  }

  // Load existing session pseudo if available
  useEffect(() => {
    if (!token) return
    const saved = localStorage.getItem(`teutchap_pseudo_${token}`)
    if (saved) {
      setGuestPseudo(saved)
      setHasSession(true)
    }
  }, [token])

  const { photos, loading: photosLoading } = usePhotos(eventData?.id, { 
    challengeId: selectedChallenge, 
    autoModeration: eventData?.auto_moderation 
  })
  const { reactions, addReaction } = useReactions()

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => setShowNotificationPrompt(true), 3500)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!eventData?.id) return

    const channel = supabase
      .channel(`new_photos_${eventData.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'photos',
        filter: `event_id=eq.${eventData.id}`
      }, (_payload) => {
        if (Notification.permission === 'granted') {
          sendNotification('Nouvelle photo ! 📸', {
            body: 'Un invité vient de partager un nouveau souvenir.',
            vibrate: [200, 100, 200]
          } as any)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventData?.id])

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      sendNotification('Activé ! 🔔', { body: 'Vous serez alerté des nouveaux moments partagés.' })
    }
    setShowNotificationPrompt(false)
  }

  // PWA Offline Queue management
  useEffect(() => {
    const checkOfflineQueue = async () => {
      try {
        const queue: any[] = await localforage.getItem('teutchap_offline_queue') || []
        const tokenQueue = queue.filter(item => item.token === token)
        setOfflineQueueCount(tokenQueue.length)
      } catch (err) {
        console.error('Error reading offline queue:', err)
      }
    }

    checkOfflineQueue()
    const interval = setInterval(checkOfflineQueue, 4000)

    const handleOnline = () => {
      setIsOnline(true)
      checkOfflineQueue()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [token])

  const handleSyncOffline = async () => {
    if (!eventData?.id) return
    setIsSyncing(true)
    try {
      const queue: any[] = await localforage.getItem('teutchap_offline_queue') || []
      const tokenQueue = queue.filter(item => item.token === token)
      const remainingQueue = queue.filter(item => item.token !== token)

      if (tokenQueue.length === 0) return

      let successfulCount = 0

      for (const item of tokenQueue) {
        const fileName = `${token}_${Date.now()}_${Math.random().toString(36).substring(2,7)}.jpg`
        const { error: uploadError } = await supabase.storage
          .from('events_photos')
          .upload(fileName, item.blob)

        if (!uploadError) {
          const { error: dbError } = await supabase.from('photos').insert([
            {
              event_id: eventData.id,
              url_original: fileName,
              url_thumb: fileName,
              file_size_bytes: item.compressedSize || item.blob.size,
              challenge_id: item.challengeId || null,
              is_moderated: false,
              contributor_name: guestPseudo || 'Invité Anonyme'
            }
          ])
          if (!dbError) successfulCount++
        }
      }

      await localforage.setItem('teutchap_offline_queue', remainingQueue)
      setOfflineQueueCount(0)
      
      if (successfulCount > 0) {
        sendNotification('Synchronisation réussie ! 🚀', {
          body: `${successfulCount} souvenir(s) en attente publiés avec succès.`
        } as any)
      }
    } catch (err) {
      console.error('Sync error:', err)
      alert("Une erreur est survenue lors de la synchronisation.")
    } finally {
      setIsSyncing(false)
    }
  }

  useEffect(() => {
    if (!eventData?.reveal_time) {
      setTimeRemaining(null)
      return
    }

    const updateTimer = () => {
      const now = new Date()
      const revealDate = new Date(eventData.reveal_time)
      const diff = revealDate.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeRemaining(null)
        return
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }

    updateTimer()
    const timerId = setInterval(updateTimer, 1000)
    return () => clearInterval(timerId)
  }, [eventData?.reveal_time])

  // Machine d'États : 1. En cours de chargement
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
              Ouverture de l'album partagé
            </div>
            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase opacity-75">
              Chargement des souvenirs en cours...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Machine d'États : 2. Écran 404 / Token Invalide
  if (!eventData) {
    return (
      <div className="min-h-screen bg-[#08060d] text-white p-6 flex flex-col items-center justify-center selection:bg-primary/30 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="glass rounded-[3rem] p-8 md:p-12 max-w-md w-full border-white/5 shadow-2xl space-y-6 relative z-10 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500 shadow-inner animate-pulse">
            <AlertTriangle size={32} />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Lien Introuvable</h1>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Cet album photo n'existe pas ou son accès a été révoqué par l'organisateur.
            </p>
          </div>

          <div className="pt-2">
            <button 
              onClick={() => alert("Veuillez demander à l'organisateur de vous renvoyer le lien officiel ou de scanner le QR Code imprimé sur les tables.")}
              className="w-full bg-white/10 hover:bg-white/15 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 border border-white/10"
            >
              Demander le bon lien
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Machine d'États : 2.5. Écran Événement Passé / Clôturé
  const eventDateMs = eventData.event_date ? new Date(eventData.event_date).getTime() : 0
  // On considère l'événement clôturé s'il s'est écoulé plus de 48h après sa date officielle
  const isEventPassed = eventDateMs > 0 && Date.now() - eventDateMs > 48 * 60 * 60 * 1000

  if (isEventPassed) {
    return (
      <div className="min-h-screen bg-[#08060d] text-white p-6 flex flex-col items-center justify-center selection:bg-primary/30 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gray-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="glass rounded-[3rem] p-8 md:p-12 max-w-md w-full border-white/5 shadow-2xl space-y-6 relative z-10 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-gray-400 shadow-inner">
            <Clock size={32} />
          </div>
          
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1 bg-white/5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400">
              Événement Clôturé
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">{eventData.name}</h1>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              Cet événement s'est achevé le {new Date(eventData.event_date).toLocaleDateString('fr-FR')}. L'album photo n'accepte plus de nouvelles contributions.
            </p>
          </div>

          <div className="pt-2">
            {hasSession ? (
              <button 
                onClick={() => alert("La galerie en lecture seule est en cours d'archivage.")}
                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg"
              >
                Consulter les archives
              </button>
            ) : (
              <button 
                onClick={() => alert("Merci de votre participation ! Les photos souvenirs ont été remises à l'organisateur.")}
                className="w-full bg-white/10 hover:bg-white/15 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all border border-white/10"
              >
                Retourner à l'accueil
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Calcul des seuils du plan de l'événement
  const currentPlan = eventData.plan || 'free'
  const maxGuests = currentConfig.max_guests
  const fallbackCount = parseInt(localStorage.getItem(`teutchap_guests_count_${eventData.token}`) || '1', 10)
  const currentJoinedGuests = eventData.joined_guests_count || fallbackCount

  // Machine d'États : 3. Écran de Blocage Capacité Pleine (Si le nouveau venu tente de rejoindre un plan saturé)
  const isCapacityFull = currentJoinedGuests >= maxGuests && !hasSession

  if (isCapacityFull) {
    return (
      <div className="min-h-screen bg-[#08060d] text-white p-6 flex flex-col items-center justify-center selection:bg-primary/30 relative overflow-hidden text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/10 blur-[120px] rounded-full pointer-events-none animate-pulse" />
        
        <div className="glass rounded-[3rem] p-8 md:p-12 max-w-md w-full border-accent/20 shadow-2xl space-y-6 relative z-10 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto text-accent shadow-inner animate-bounce">
            <Users size={32} />
          </div>
          
          <div className="space-y-3">
            <div className="inline-block bg-accent/20 text-accent font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-accent/30">
              Capacité du plan atteinte
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Album Saturé</h1>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              L'événement <span className="text-white font-bold">"{eventData.name}"</span> a atteint sa limite maximale de <span className="text-accent font-bold">{maxGuests} invités</span> connectés.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <button 
              onClick={() => alert("Informez l'organisateur de l'événement qu'il peut débloquer des invités illimités instantanément depuis son tableau de bord Teutchap.")}
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg"
            >
              Prévenir l'organisateur
            </button>
            <button 
              onClick={() => {
                // Bailout secret pour tests admin/locaux
                setHasSession(true)
                setGuestPseudo("Invité Privilégié")
                localStorage.setItem(`teutchap_pseudo_${token}`, "Invité Privilégié")
              }}
              className="text-[9px] text-gray-600 underline uppercase tracking-widest hover:text-gray-400 block mx-auto pt-2"
            >
              Code d'accès d'urgence
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Gestion de la soumission de l'onboarding invité
  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputPseudo.trim()) return

    const pseudo = inputPseudo.trim()
    localStorage.setItem(`teutchap_pseudo_${token}`, pseudo)
    setGuestPseudo(pseudo)
    setHasSession(true)

    // Incrémentation locale / RPC en backend de joined_guests_count
    if (!isJoinedCountIncremented) {
      const nextCount = currentJoinedGuests + 1
      localStorage.setItem(`teutchap_guests_count_${eventData.token}`, nextCount.toString())
      incrementGuestCount()
      setIsJoinedCountIncremented(true)
    }
  }

  // Machine d'États : 3.5. Sas de Verrouillage par Mot de passe
  const isProtected = !!eventData.access_password
  if (isProtected && !isPasswordVerified) {
    return (
      <div className="min-h-screen bg-[#08060d] text-white flex flex-col items-center justify-center p-4 selection:bg-primary/30 relative overflow-hidden">
        {/* Ambient Meshes */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[130px] rounded-full pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 my-auto py-8 text-center">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto text-primary shadow-inner">
            <Lock size={28} />
          </div>

          <div className="space-y-2 px-2">
            <div className="inline-block bg-primary/10 text-primary font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">
              Accès Privé
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gradient leading-tight">
              {eventData.name}
            </h1>
            <p className="text-xs text-gray-400 font-medium">
              Cet album photo est protégé par un mot de passe défini par l'organisateur.
            </p>
          </div>

          <div className="glass rounded-[2.5rem] p-6 md:p-8 shadow-2xl border-white/5 relative overflow-hidden text-left">
            <form onSubmit={handleVerifyPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400 block ml-1">
                  Mot de passe de l'album
                </label>
                <div className="relative">
                  <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input 
                    type="password"
                    required
                    autoFocus
                    placeholder="Saisissez le mot de passe..."
                    className={`w-full bg-black/40 border rounded-xl pl-10 pr-4 py-3.5 text-xs text-white outline-none transition-colors font-mono ${
                      pwdError ? 'border-red-500 focus:border-red-500' : 'border-white/10 focus:border-primary/50'
                    }`}
                    value={pwdInput}
                    onChange={e => {
                      setPwdInput(e.target.value)
                      setPwdError(false)
                    }}
                  />
                </div>
                {pwdError && (
                  <p className="text-[10px] font-bold text-red-400 animate-in fade-in pl-1">
                    Mot de passe incorrect. Veuillez réessayer.
                  </p>
                )}
              </div>

              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg"
              >
                Déverrouiller l'album
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Machine d'États : 4. Sas d'Onboarding / Demande d'Accès Invité
  if (!hasSession) {
    const guestPercent = Math.min(100, Math.round((currentJoinedGuests / maxGuests) * 100))
    const planName = currentPlan === 'vip' ? 'VIP' : currentPlan === 'premium' ? 'Premium' : 'Essentiel'

    return (
      <div className="min-h-screen bg-[#08060d] text-white flex flex-col items-center justify-center p-4 selection:bg-primary/30 relative overflow-hidden">
        {/* Ambient Meshes */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/20 blur-[130px] rounded-full pointer-events-none animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 my-auto py-8">
          
          {/* Header Info avec le Plan */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3.5 py-1 rounded-full backdrop-blur-md">
              <span className={`w-1.5 h-1.5 rounded-full ${currentPlan === 'free' ? 'bg-gray-400' : 'bg-primary animate-pulse'}`} />
              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-gray-300">
                Plan {planName}
              </span>
            </div>

            {/* Nom de l'événement et Date */}
            <div className="space-y-1 px-2">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gradient leading-tight line-clamp-2">
                {eventData.name}
              </h1>
              {eventData.event_date && (
                <p className="text-[10px] text-gray-400 font-bold flex items-center justify-center space-x-1 pt-0.5">
                  <Calendar size={10} className="text-primary/70" />
                  <span className="uppercase tracking-widest">
                    {new Date(eventData.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Message de bienvenue si existant */}
          {eventData.welcome_message && (
            <div className="glass rounded-2xl p-3.5 border-white/5 text-center bg-primary/[0.02]">
              <p className="text-gray-300 leading-relaxed text-[11px] font-medium italic">
                "{eventData.welcome_message}"
              </p>
            </div>
          )}

          {/* Formulaire de saisie du pseudo (Priorité UX/UI) */}
          <div className="glass rounded-[2.5rem] p-6 md:p-8 shadow-2xl border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] -mr-16 -mt-16 rounded-full pointer-events-none" />
            
            <form onSubmit={handleJoinSubmit} className="space-y-5 relative z-10">
              <div className="space-y-1.5 text-center">
                <h3 className="text-xs font-black uppercase tracking-widest text-white">Rejoindre l'Album</h3>
                <p className="text-[10px] text-gray-400 font-medium">Saisissez votre nom pour signer vos photos.</p>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="relative group/input">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within/input:text-primary transition-colors" size={14} />
                  <input 
                    required
                    autoFocus
                    maxLength={25}
                    placeholder="Ex: Alex, Famille Martin..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-3.5 text-xs font-bold outline-none focus:border-primary/50 transition-all placeholder:text-gray-700 text-white shadow-inner"
                    value={inputPseudo}
                    onChange={e => setInputPseudo(e.target.value)}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 active:scale-[0.98] transition-all text-white font-black py-3.5 rounded-xl shadow-[0_10px_30px_rgba(170,59,255,0.3)] text-xs uppercase tracking-widest flex items-center justify-center space-x-1.5"
              >
                <span>Accéder à la galerie</span>
                <Check size={14} className="stroke-[3]" />
              </button>
            </form>
          </div>

          {/* Jauge des invités rejoints en direct (Réassurance & Dynamique) */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 backdrop-blur-sm space-y-2">
            <div className="flex justify-between items-baseline px-1">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider flex items-center space-x-1">
                <Users size={10} className="text-accent" />
                <span>Invités connectés</span>
              </span>
              <span className="text-xs font-black text-white tabular-nums">
                {currentJoinedGuests} <span className="text-[9px] font-bold text-gray-500">/ {maxGuests}</span>
              </span>
            </div>

            <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  guestPercent > 85 ? 'bg-gradient-to-r from-accent to-red-500' : 'bg-gradient-to-r from-primary via-accent to-pink-500'
                }`}
                style={{ width: `${guestPercent}%` }}
              />
            </div>
            
            <p className="text-[8px] text-gray-500 text-center font-bold uppercase tracking-widest pt-0.5">
              {maxGuests - currentJoinedGuests > 0 
                ? `🔥 Plus que ${maxGuests - currentJoinedGuests} place(s) disponible(s)`
                : "⚠️ Capacité maximale atteinte"}
            </p>
          </div>

          <div className="text-center">
            <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em]">
              🔒 Connexion sécurisée sans application • Données privées
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Machine d'États : 5. Hub Actif & Révélation en Cours
  const isRevealModeActive = !!timeRemaining
  const isChallengesAllowed = eventData.allow_guest_challenges !== false

  const handleCreateChallengeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChalTitle.trim()) return
    setIsAddingChal(true)
    await addChallenge(newChalTitle.trim(), newChalDesc.trim())
    setNewChalTitle('')
    setNewChalDesc('')
    setIsAddingChal(false)
    setShowChallengeForm(false)
    sendNotification('Défi lancé ! 🎯', { body: 'Votre défi est désormais visible par tous les invités.' } as any)
  }

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col selection:bg-primary/30 relative overflow-x-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
      </div>

      {/* Identité en en-tête */}
      <header className="glass-dark border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-white truncate max-w-[150px]">
            {eventData.name}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[9px] font-bold text-primary-light flex items-center space-x-1">
            <span>👤</span>
            <span className="truncate max-w-[100px]">{guestPseudo}</span>
          </div>
          <button 
            onClick={() => {
              const next = prompt("Modifier mon pseudo :", guestPseudo)
              if (next?.trim()) {
                setGuestPseudo(next.trim())
                localStorage.setItem(`teutchap_pseudo_${token}`, next.trim())
              }
            }}
            className="text-[9px] text-gray-500 hover:text-white transition-colors underline"
          >
            Éditer
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-32 relative z-10 no-scrollbar">
        {/* Notification Prompt */}
        {showNotificationPrompt && (
          <div className="mx-4 mt-4 animate-in slide-in-from-top-4 duration-500 relative z-[60]">
            <div className="glass rounded-3xl p-5 border-white/10 shadow-2xl relative overflow-hidden group">
               <button 
                onClick={() => setShowNotificationPrompt(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
               >
                 <X size={14} />
               </button>
               <div className="flex items-center space-x-4">
                  <div className="bg-primary/20 p-3 rounded-2xl text-primary animate-bounce">
                     <Bell size={20} />
                  </div>
                  <div className="flex-1 space-y-0.5 pr-4">
                     <h4 className="text-xs font-black uppercase tracking-widest text-gradient">Vivre l'instant</h4>
                     <p className="text-[9px] text-gray-400 font-bold leading-tight">Activer les notifications pour voir les ajouts en direct.</p>
                  </div>
               </div>
               <div className="flex space-x-2 mt-4">
                  <button 
                    onClick={handleEnableNotifications}
                    className="flex-1 bg-white text-black py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-md"
                  >
                    Activer
                  </button>
                  <button 
                    onClick={() => setShowNotificationPrompt(false)}
                    className="flex-1 glass border-white/10 text-gray-500 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Plus tard
                  </button>
               </div>
            </div>
          </div>
        )}

        {/* Cover / Hero */}
        <div className="relative h-48 md:h-64 overflow-hidden">
          {eventData.cover_url ? (
            <img src={eventData.cover_url} className="w-full h-full object-cover opacity-60 scale-105" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-secondary to-black flex items-center justify-center">
              <Hash className="text-white/5 animate-float" size={140} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08060d] via-transparent to-transparent" />
          
          <div className="absolute inset-x-0 bottom-0 p-4 md:p-6 flex flex-col justify-end space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gradient leading-none">{eventData.name}</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest opacity-80">
              {new Date(eventData.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-8">
          {/* PWA Offline Sync Banner */}
          {offlineQueueCount > 0 && (
            <div className="glass border-primary/40 bg-primary/5 rounded-3xl p-5 shadow-xl animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center space-x-3 w-full md:w-auto">
                  <div className="bg-primary/20 p-2.5 rounded-xl text-primary animate-pulse">
                    <CloudLightning size={20} />
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-black uppercase tracking-widest text-gradient">Mode Hors-Ligne</span>
                      <span className="bg-white/10 px-2 py-0.5 rounded-full text-[8px] font-black">{offlineQueueCount} en attente</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium leading-tight">
                      {isOnline ? "Réseau rétabli ! Publiez vos photos sauvegardées." : "Capture sécurisée en zone blanche."}
                    </p>
                  </div>
                </div>
                
                {isOnline && (
                  <button 
                    onClick={handleSyncOffline}
                    disabled={isSyncing}
                    className="w-full md:w-auto px-5 py-2.5 bg-primary hover:bg-primary-dark active:scale-95 transition-all rounded-xl text-[9px] font-black uppercase tracking-widest text-white shadow flex items-center justify-center space-x-1.5"
                  >
                    <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
                    <span>{isSyncing ? "Envoi..." : "Synchroniser"}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Welcome Message */}
          {eventData.welcome_message && (
            <div className="glass rounded-3xl p-5 shadow-lg border-white/5 text-center">
              <p className="text-gray-300 leading-relaxed text-xs font-medium italic">
                "{eventData.welcome_message}"
              </p>
            </div>
          )}

          {/* Reveal Mode Active Banner */}
          {isRevealModeActive && (
            <div className="bg-primary/10 border border-primary/30 rounded-3xl p-6 text-center shadow-xl animate-in fade-in duration-500">
               <Clock className="mx-auto text-primary mb-2 animate-bounce" size={36} />
               <h3 className="text-xl font-black tracking-tight text-white">Reveal Mode Activé</h3>
               <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1 mb-4">Les photos restent cachées jusqu'au décompte.</p>
               <div className="text-5xl font-black tracking-tighter text-gradient tabular-nums">
                 {timeRemaining}
               </div>
            </div>
          )}

          {/* Section Défis & Taggage */}
          {!isRevealModeActive && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Défis Photos</h3>
                {isChallengesAllowed ? (
                  <button
                    onClick={() => setShowChallengeForm(!showChallengeForm)}
                    className="text-[9px] font-bold text-primary hover:text-primary-light flex items-center space-x-1 transition-colors"
                  >
                    <PlusCircle size={10} />
                    <span>{showChallengeForm ? "Fermer" : "Proposer un défi"}</span>
                  </button>
                ) : (
                  <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest flex items-center space-x-0.5" title="Fonctionnalité désactivée pour cet événement">
                    <Lock size={8} className="inline" />
                    <span>Désactivé</span>
                  </span>
                )}
              </div>

              {/* Formulaire de création de défi invité */}
              {showChallengeForm && isChallengesAllowed && (
                <form onSubmit={handleCreateChallengeSubmit} className="glass rounded-2xl p-4 border-primary/20 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    required
                    placeholder="Titre du défi (ex: Plus beau sourire)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white outline-none focus:border-primary/50"
                    value={newChalTitle}
                    onChange={e => setNewChalTitle(e.target.value)}
                  />
                  <input
                    placeholder="Description courte (optionnelle)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] text-gray-300 outline-none focus:border-primary/50"
                    value={newChalDesc}
                    onChange={e => setNewChalDesc(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={isAddingChal}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-black py-2 rounded-xl text-[9px] uppercase tracking-widest transition-all active:scale-95"
                  >
                    {isAddingChal ? "Ajout..." : "Lancer ce défi"}
                  </button>
                </form>
              )}

              {/* Barre de filtres des défis */}
              {challenges.length > 0 && (
                <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4">
                  <button 
                    onClick={() => setSelectedChallenge(null)}
                    className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                      !selectedChallenge 
                        ? 'bg-primary text-white shadow-md' 
                        : 'glass border-white/5 text-gray-500 hover:text-white'
                    }`}
                  >
                    Tous
                  </button>
                  {challenges.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => setSelectedChallenge(c.id)}
                      className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-all flex items-center space-x-1 ${
                        selectedChallenge === c.id 
                          ? 'bg-primary text-white shadow-md' 
                          : 'glass border-white/5 text-gray-500 hover:text-white'
                      }`}
                    >
                      <span>{c.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Galerie Publique */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black tracking-tight">Souvenirs Partagés</h2>
              <div className="glass px-3 py-1 rounded-full flex items-center space-x-1.5 border-white/5 text-[10px] font-bold">
                <ImageIcon size={12} className="text-primary" />
                <span>{photos.length}</span>
              </div>
            </div>

            {photosLoading ? (
              <div className="grid grid-cols-2 gap-3 animate-pulse">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-[3/4] bg-white/5 rounded-2xl" />
                 ))}
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-16 px-4 glass rounded-3xl border-dashed border-white/10 bg-white/[0.01]">
                <Camera className="text-primary opacity-30 mx-auto mb-3" size={32} />
                <p className="text-gray-400 font-bold text-sm">Aucune photo pour l'instant</p>
                <p className="text-gray-600 text-[9px] mt-1 uppercase tracking-wider font-black">Soyez le premier contributeur !</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {photos.map((photo) => (
                  <div 
                    key={photo.id} 
                    className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/5 shadow-lg"
                  >
                    <img 
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${photo.url_thumb}`} 
                      className={`w-full aspect-[3/4] object-cover transition-all ${isRevealModeActive ? 'blur-xl scale-110 opacity-30' : ''}`}
                      loading="lazy"
                    />
                    
                    {isRevealModeActive ? (
                       <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Clock className="text-white/30" size={24} />
                       </div>
                    ) : (
                      <>
                        {/* Contributor Signature */}
                        {photo.contributor_name && (
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[7px] font-bold text-white/90 max-w-[100px] truncate">
                            ✍️ {photo.contributor_name}
                          </div>
                        )}

                        {/* AI Tags overlay */}
                        {eventData.ai_tagging_enabled && photo.ai_tags?.length > 0 && (
                          <div className="absolute top-2 right-2 flex flex-col items-end gap-1 z-10">
                            {photo.ai_tags.slice(0, 1).map((tag: string) => (
                              <div key={tag} className="bg-primary/80 backdrop-blur px-1.5 py-0.5 rounded text-[6px] font-black uppercase tracking-wider text-white">
                                #{tag}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Reactions overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/90 via-black/30 to-transparent pt-8">
                          <div className="flex gap-1 justify-center">
                            {['❤️', '🔥', '👏'].map(emoji => (
                              <button 
                                key={emoji}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addReaction(photo.id, emoji);
                                }}
                                className={`glass-dark hover:bg-white/20 px-2 py-0.5 rounded-full text-[10px] flex items-center space-x-0.5 transition-all active:scale-75 ${reactions[photo.id]?.[emoji] ? 'border-primary/40 bg-primary/10' : ''}`}
                              >
                                <span>{emoji}</span>
                                {reactions[photo.id]?.[emoji] && (
                                  <span className="font-black text-white text-[8px]">{reactions[photo.id][emoji]}</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#08060d] via-[#08060d]/95 to-transparent z-30">
        <button 
          onClick={() => navigate(`/e/${token}/upload`)}
          className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center space-x-3 border-t border-white/20"
        >
          <Camera size={22} />
          <span className="text-sm uppercase tracking-widest">Capturer l'instant</span>
        </button>
      </div>
    </div>
  )
}

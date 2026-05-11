import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, Image as ImageIcon, Hash, Clock, Bell, X } from 'lucide-react'
import { useEvent } from '../../hooks/useEvent'
import { usePhotos } from '../../hooks/usePhotos'
import { useChallenges } from '../../hooks/useChallenges'
import { useReactions } from '../../hooks/useReactions'
import { requestNotificationPermission, sendNotification } from '../../lib/notifications'
import { supabase } from '../../lib/supabase'

export default function EventHome() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)

  // Custom Hooks
  const { eventData, loading: eventLoading } = useEvent(token, true)
  const { challenges } = useChallenges(eventData?.id)
  const { photos, loading: photosLoading } = usePhotos(eventData?.id, { 
    challengeId: selectedChallenge, 
    autoModeration: eventData?.auto_moderation 
  })
  const { reactions, addReaction } = useReactions()

  useEffect(() => {
    // Show notification prompt after 3s if not already granted/denied
    if ('Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => setShowNotificationPrompt(true), 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (!eventData?.id) return

    // Listen for NEW photos to send notifications
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

  if (eventLoading || !eventData) return <div className="min-h-screen bg-[#08060d] text-white p-8 flex items-center justify-center font-black uppercase tracking-[0.3em]">Chargement...</div>

  const isRevealModeActive = !!timeRemaining

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col selection:bg-primary/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
      </div>

      <div className="flex-1 overflow-y-auto pb-32 relative z-10 no-scrollbar">
        {/* Notification Prompt */}
        {showNotificationPrompt && (
          <div className="mx-4 mt-6 animate-in slide-in-from-top-4 duration-500 relative z-[60]">
            <div className="glass rounded-3xl p-6 border-white/10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[40px] -mr-16 -mt-16 rounded-full" />
               <button 
                onClick={() => setShowNotificationPrompt(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
               >
                 <X size={16} />
               </button>
               <div className="flex items-center space-x-5">
                  <div className="bg-primary/20 p-4 rounded-2xl text-primary animate-bounce">
                     <Bell size={24} />
                  </div>
                  <div className="flex-1 space-y-1">
                     <h4 className="text-sm font-black uppercase tracking-widest text-gradient">Vivre l'instant</h4>
                     <p className="text-[10px] text-gray-400 font-bold leading-tight">Activer les notifications pour voir les photos en direct.</p>
                  </div>
               </div>
               <div className="flex space-x-3 mt-6">
                  <button 
                    onClick={handleEnableNotifications}
                    className="flex-1 bg-white text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl"
                  >
                    Activer
                  </button>
                  <button 
                    onClick={() => setShowNotificationPrompt(false)}
                    className="flex-1 glass border-white/10 text-gray-500 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
                  >
                    Plus tard
                  </button>
               </div>
            </div>
          </div>
        )}
        {/* Header / Cover */}
        <div className="relative h-[45vh] md:h-80 overflow-hidden">
          {eventData.cover_url ? (
            <img src={eventData.cover_url} className="w-full h-full object-cover opacity-60 scale-105" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-secondary to-black flex items-center justify-center">
              <Hash className="text-white/5 animate-float" size={180} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08060d] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 flex flex-col justify-end space-y-4">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xl px-4 py-1.5 rounded-full w-fit border border-white/10 shadow-2xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Direct Live</span>
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-gradient leading-none">{eventData.name}</h1>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center opacity-80">
                {new Date(eventData.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-10 space-y-10 md:space-y-16">
          {/* Welcome Message */}
          {eventData.welcome_message && (
            <div className="glass rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group border-white/5">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Hash size={64} />
              </div>
              <p className="text-gray-300 leading-relaxed text-sm md:text-base font-medium italic relative z-10 text-center">
                "{eventData.welcome_message}"
              </p>
            </div>
          )}

          {/* Reveal Mode Active Banner */}
          {isRevealModeActive && (
            <div className="bg-primary/10 border border-primary/30 rounded-[2rem] p-8 text-center shadow-[0_0_50px_rgba(170,59,255,0.2)] animate-in fade-in zoom-in-95 duration-500">
               <Clock className="mx-auto text-primary mb-4 animate-bounce" size={48} />
               <h3 className="text-2xl font-black tracking-tighter text-white">Reveal Mode Activé</h3>
               <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mt-2 mb-6">Les photos sont cachées. Préparez-vous.</p>
               <div className="text-6xl md:text-8xl font-black tracking-tighter text-gradient tabular-nums">
                 {timeRemaining}
               </div>
            </div>
          )}

          {/* Public Gallery */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-2">
              <div className="space-y-1">
                <h2 className="text-3xl font-black tracking-tighter">Galerie</h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest opacity-60">Les plus beaux moments</p>
              </div>
              <div className="glass px-4 py-2 rounded-2xl flex items-center space-x-3 border-white/5 shadow-xl">
                <ImageIcon size={16} className="text-primary" />
                <span className="text-xs font-black text-white">
                  {photos.length}
                </span>
              </div>
            </div>

            {/* Challenges Filter */}
            {challenges.length > 0 && !isRevealModeActive && (
              <div className="flex space-x-3 overflow-x-auto pb-6 no-scrollbar -mx-4 px-4">
                <button 
                  onClick={() => setSelectedChallenge(null)}
                  className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 ${
                    !selectedChallenge 
                      ? 'bg-primary text-white shadow-[0_10px_25px_rgba(170,59,255,0.4)] scale-105' 
                      : 'glass border-white/5 text-gray-500 hover:text-white hover:border-white/20'
                  }`}
                >
                  Tous les souvenirs
                </button>
                {challenges.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => setSelectedChallenge(c.id)}
                    className={`px-8 py-3.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 flex items-center space-x-2 ${
                      selectedChallenge === c.id 
                        ? 'bg-primary text-white shadow-[0_10px_25px_rgba(170,59,255,0.4)] scale-105' 
                        : 'glass border-white/5 text-gray-500 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span>{c.title}</span>
                  </button>
                ))}
              </div>
            )}

            {photosLoading ? (
              <div className="grid grid-cols-2 gap-4 animate-pulse">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="aspect-[3/4] bg-white/5 rounded-[2rem]" />
                 ))}
              </div>
            ) : photos.length === 0 ? (
              <div className="text-center py-24 px-6 glass rounded-[3rem] border-dashed border-white/10 bg-white/[0.01]">
                <div className="bg-primary/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-primary/10 shadow-inner">
                  <Camera className="text-primary opacity-40" size={40} />
                </div>
                <p className="text-gray-400 font-black text-xl tracking-tight">L'album est vide</p>
                <p className="text-gray-600 text-[10px] mt-3 uppercase tracking-[0.2em] font-black">Soyez le premier à capturer l'instant !</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {photos.map((photo, idx) => (
                  <div 
                    key={photo.id} 
                    className="group relative bg-white/5 rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl transition-all duration-700 hover:-translate-y-2"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <img 
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${photo.url_thumb}`} 
                      className={`w-full aspect-[3/4] object-cover transition-all duration-[1.5s] ${isRevealModeActive ? 'blur-2xl scale-125 opacity-40' : 'group-hover:scale-110'}`}
                      loading="lazy"
                    />
                    
                    {isRevealModeActive ? (
                       <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Clock className="text-white/30 animate-pulse" size={32} />
                       </div>
                    ) : (
                      <>
                        {/* Challenge Badge */}
                        {photo.challenge_id && (
                          <div className="absolute top-4 left-4 bg-primary/90 backdrop-blur-xl px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest text-white shadow-2xl z-10 border border-white/10">
                            🏆 Défi
                          </div>
                        )}

                        {/* AI Tags */}
                        {eventData.ai_tagging_enabled && photo.ai_tags?.length > 0 && (
                          <div className="absolute top-4 right-4 flex flex-col items-end gap-1.5 z-10">
                            {photo.ai_tags.slice(0, 2).map((tag: string) => (
                              <div key={tag} className="glass-dark px-2.5 py-1 rounded-lg text-[7px] font-black uppercase tracking-[0.15em] text-white/90 border-white/10">
                                # {tag}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Reactions Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/95 via-black/40 to-transparent pt-16 translate-y-2 group-hover:translate-y-0 transition-transform">
                          <div className="flex flex-wrap gap-2 justify-center">
                            {['❤️', '😂', '🔥', '👏'].map(emoji => (
                              <button 
                                key={emoji}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addReaction(photo.id, emoji);
                                }}
                                className={`glass-dark hover:bg-white/20 px-3 py-1.5 rounded-full text-[12px] flex items-center space-x-2 transition-all active:scale-75 ${reactions[photo.id]?.[emoji] ? 'border-primary/40 bg-primary/10' : ''}`}
                              >
                                <span>{emoji}</span>
                                {reactions[photo.id]?.[emoji] && (
                                  <span className="font-black text-white text-[10px] tabular-nums">{reactions[photo.id][emoji]}</span>
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
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#08060d] via-[#08060d]/90 to-transparent pb-safe z-30">
        <button 
          onClick={() => navigate(`/e/${token}/upload`)}
          className="w-full bg-primary hover:bg-primary-dark active:scale-[0.97] transition-all text-white font-black py-5 rounded-[2rem] shadow-[0_20px_50px_rgba(170,59,255,0.4)] flex items-center justify-center space-x-4 border-t border-white/20"
        >
          <Camera size={28} className="drop-shadow-lg" />
          <span className="text-lg tracking-tight">Capturer l'instant</span>
        </button>
      </div>
    </div>
  )
}

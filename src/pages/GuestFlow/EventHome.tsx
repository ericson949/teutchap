import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, Image as ImageIcon, Heart, Hash } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function EventHome() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [eventData, setEventData] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [challenges, setChallenges] = useState<any[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({})

  useEffect(() => {
    fetchEventPhotosAndChallenges()
    
    // Realtime subscription for new photos and reactions
    const photosChannel = supabase
      .channel('public:photos')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, (payload) => {
        setPhotos(prev => [payload.new, ...prev])
      })
      .subscribe()

    const reactionsChannel = supabase
      .channel('public:reactions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reactions' }, () => {
        fetchReactions() // Refresh reactions on any change
      })
      .subscribe()

    return () => {
      supabase.removeChannel(photosChannel)
      supabase.removeChannel(reactionsChannel)
    }
  }, [token])

  const fetchEventPhotosAndChallenges = async () => {
    // 1. Fetch event by token
    const { data: event } = await supabase
      .from('events')
      .select('*')
      .eq('token', token)
      .single()

    if (event) {
      setEventData(event)
      
      // 2. Fetch challenges
      const { data: chalData } = await supabase
        .from('challenges')
        .select('*')
        .eq('event_id', event.id)
      if (chalData) setChallenges(chalData)

      // 3. Fetch photos
      let query = supabase
        .from('photos')
        .select('*')
        .eq('event_id', event.id)
        .order('created_at', { ascending: false })
      
      if (selectedChallenge) {
        query = query.eq('challenge_id', selectedChallenge)
      }

      const { data: photosData } = await query
      if (photosData) setPhotos(photosData)
      
      fetchReactions()
    }
  }

  useEffect(() => {
    if (eventData) {
      fetchEventPhotosAndChallenges()
    }
  }, [selectedChallenge])

  const fetchReactions = async () => {
    const { data } = await supabase.from('reactions').select('*')
    if (data) {
      const reactionMap: Record<string, Record<string, number>> = {}
      data.forEach(r => {
        if (!reactionMap[r.photo_id]) reactionMap[r.photo_id] = {}
        reactionMap[r.photo_id][r.emoji] = (reactionMap[r.photo_id][r.emoji] || 0) + 1
      })
      setReactions(reactionMap)
    }
  }

  const addReaction = async (photoId: string, emoji: string) => {
    const fingerprint = localStorage.getItem('teutchap_fp') || Math.random().toString(36).substring(7)
    localStorage.setItem('teutchap_fp', fingerprint)

    await supabase.from('reactions').upsert([
      { photo_id: photoId, emoji, device_fingerprint: fingerprint }
    ])
  }

  if (!eventData) return <div className="min-h-screen bg-[#08060d] text-white p-8 flex items-center justify-center">Chargement...</div>

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col selection:bg-primary/30">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full" />
      </div>

      <div className="flex-1 overflow-y-auto pb-32 relative z-10 no-scrollbar">
        {/* Header / Cover */}
        <div className="relative h-80 overflow-hidden">
          {eventData.cover_url ? (
            <img src={eventData.cover_url} className="w-full h-full object-cover opacity-60 scale-105" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary to-black flex items-center justify-center">
              <Hash className="text-white/5 animate-float" size={180} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08060d] via-[#08060d]/40 to-transparent" />
          
          <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end space-y-2">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full w-fit border border-white/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-200">Événement Live</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gradient leading-tight">{eventData.name}</h1>
            <p className="text-gray-400 text-sm font-medium tracking-wide flex items-center">
              {new Date(eventData.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-10">
          {/* Welcome Message */}
          {eventData.welcome_message && (
            <div className="glass rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Hash size={40} />
              </div>
              <p className="text-gray-200 leading-relaxed text-sm font-light italic relative z-10">
                "{eventData.welcome_message}"
              </p>
            </div>
          )}

          {/* Public Gallery */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight">Galerie</h2>
              <div className="glass px-4 py-1.5 rounded-full flex items-center space-x-2">
                <ImageIcon size={14} className="text-primary" />
                <span className="text-[11px] font-bold text-gray-300">
                  {photos.length} Souvenirs
                </span>
              </div>
            </div>

            {/* Challenges Filter */}
            {challenges.length > 0 && (
              <div className="flex space-x-3 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                <button 
                  onClick={() => setSelectedChallenge(null)}
                  className={`px-6 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    !selectedChallenge 
                      ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  Tous les moments
                </button>
                {challenges.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => setSelectedChallenge(c.id)}
                    className={`px-6 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-300 flex items-center space-x-2 ${
                      selectedChallenge === c.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105' 
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <span>{c.title}</span>
                  </button>
                ))}
              </div>
            )}

            {photos.length === 0 ? (
              <div className="text-center py-20 px-4 glass rounded-[2rem] border-dashed">
                <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/20">
                  <Camera className="text-primary animate-pulse" size={32} />
                </div>
                <p className="text-gray-300 font-medium">L'album est encore vide</p>
                <p className="text-gray-500 text-xs mt-2">Capturez le premier souvenir !</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {photos.map((photo, idx) => (
                  <div 
                    key={photo.id} 
                    className="group relative bg-white/5 rounded-[1.5rem] overflow-hidden border border-white/5 shadow-xl transition-all duration-500 hover:scale-[1.02] active:scale-95"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <img 
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${photo.url_thumb}`} 
                      className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    
                    {/* Challenge Badge */}
                    {photo.challenge_id && (
                      <div className="absolute top-3 left-3 bg-primary/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[7px] font-black uppercase tracking-widest text-white shadow-2xl z-10">
                        🏆 Défi
                      </div>
                    )}
                    
                    {/* Reactions Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent pt-12">
                      <div className="flex flex-wrap gap-2">
                        {['❤️', '😂', '🔥', '👏'].map(emoji => (
                          <button 
                            key={emoji}
                            onClick={(e) => {
                              e.stopPropagation();
                              addReaction(photo.id, emoji);
                            }}
                            className="glass-dark hover:bg-white/20 backdrop-blur-xl px-2.5 py-1 rounded-full text-[11px] flex items-center space-x-1.5 transition-all active:scale-90"
                          >
                            <span>{emoji}</span>
                            {reactions[photo.id]?.[emoji] && (
                              <span className="font-extrabold text-white">{reactions[photo.id][emoji]}</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
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

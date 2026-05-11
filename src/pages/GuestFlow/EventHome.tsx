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
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col">
      <div className="flex-1 overflow-y-auto pb-32">
        {/* Header / Cover */}
        <div className="relative h-64 bg-gradient-to-br from-primary-dark to-black overflow-hidden">
          {eventData.cover_url ? (
            <img src={eventData.cover_url} className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <Hash className="text-white/10" size={120} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08060d] via-transparent" />
          <div className="absolute inset-0 p-6 flex flex-col justify-end">
            <h1 className="text-3xl font-bold tracking-tight mb-1">{eventData.name}</h1>
            <p className="text-gray-300 text-sm">{new Date(eventData.event_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {/* Welcome Message */}
        <div className="p-6">
          {eventData.welcome_message && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm mb-8">
              <p className="text-gray-200 leading-relaxed text-sm italic">
                "{eventData.welcome_message}"
              </p>
            </div>
          )}

          {/* Public Gallery */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Galerie</h2>
              <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] text-gray-400">
                {photos.length} photos
              </span>
            </div>

            {/* Challenges Filter */}
            {challenges.length > 0 && (
              <div className="flex space-x-2 overflow-x-auto pb-6 no-scrollbar -mx-1 px-1">
                <button 
                  onClick={() => setSelectedChallenge(null)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    !selectedChallenge 
                      ? 'bg-primary text-white' 
                      : 'bg-white/5 border border-white/10 text-gray-400'
                  }`}
                >
                  Tout
                </button>
                {challenges.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => setSelectedChallenge(c.id)}
                    className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                      selectedChallenge === c.id 
                        ? 'bg-primary text-white' 
                        : 'bg-white/5 border border-white/10 text-gray-400'
                    }`}
                  >
                    <span>{c.title}</span>
                  </button>
                ))}
              </div>
            )}

            {photos.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <ImageIcon className="text-gray-600" size={24} />
                </div>
                <p className="text-gray-400 text-sm">Aucune photo pour ce défi pour l'instant.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                    <img 
                      src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${photo.url_thumb}`} 
                      className="w-full aspect-[3/4] object-cover"
                      loading="lazy"
                    />
                    
                    {/* Challenge Badge */}
                    {photo.challenge_id && (
                      <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-md px-2 py-0.5 rounded-lg text-[8px] font-bold uppercase tracking-wider text-white shadow-lg">
                        Défi Relevé
                      </div>
                    )}
                    
                    {/* Reactions Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex flex-wrap gap-1.5">
                        {['❤️', '😂', '🔥', '👏'].map(emoji => (
                          <button 
                            key={emoji}
                            onClick={() => addReaction(photo.id, emoji)}
                            className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] flex items-center space-x-1 transition-all active:scale-90"
                          >
                            <span>{emoji}</span>
                            {reactions[photo.id]?.[emoji] && (
                              <span className="font-bold">{reactions[photo.id][emoji]}</span>
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
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#08060d] via-[#08060d]/95 to-transparent pb-safe z-20">
        <button 
          onClick={() => navigate(`/e/${token}/upload`)}
          className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 flex items-center justify-center space-x-3"
        >
          <Camera size={24} />
          <span>Partager mes photos</span>
        </button>
      </div>
    </div>
  )
}

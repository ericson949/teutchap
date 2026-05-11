import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Hash } from 'lucide-react'

export default function LiveWall() {
  const { token } = useParams()
  const [photos, setPhotos] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [eventData, setEventData] = useState<any>(null)

  useEffect(() => {
    fetchEventAndPhotos()

    const channel = supabase
      .channel('live-wall')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos' }, (payload) => {
        setPhotos(prev => [payload.new, ...prev])
        setCurrentIndex(0) // Show newest photo immediately
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [token])

  useEffect(() => {
    if (photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % photos.length)
      }, 8000) // Rotate every 8 seconds
      return () => clearInterval(interval)
    }
  }, [photos])

  const fetchEventAndPhotos = async () => {
    const { data: event } = await supabase.from('events').select('*').eq('token', token).single()
    if (event) {
      setEventData(event)
      const { data: photosData } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', event.id)
        .order('created_at', { ascending: false })
      if (photosData) setPhotos(photosData)
    }
  }

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-12 text-center">
        <Hash size={120} className="text-white/5 mb-8 animate-pulse" />
        <h1 className="text-5xl font-bold mb-4">{eventData?.name || 'Teutchap'}</h1>
        <p className="text-2xl text-gray-400">En attente des premières photos...</p>
        <div className="mt-12 bg-white p-4 rounded-2xl">
          {/* Placeholder for QR Code or Link */}
          <p className="text-black font-bold text-xl">Scannez pour partager !</p>
        </div>
      </div>
    )
  }

  const currentPhoto = photos[currentIndex]

  return (
    <div className="min-h-screen bg-black overflow-hidden relative flex items-center justify-center">
      {/* Background Blur */}
      <div className="absolute inset-0 z-0">
        <img 
          key={`bg-${currentPhoto.id}`}
          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${currentPhoto.url_original}`} 
          className="w-full h-full object-cover blur-[100px] opacity-40 scale-110 transition-all duration-1000"
        />
      </div>

      {/* Main Image Container */}
      <div className="relative z-10 w-full h-full flex flex-col p-8">
        <div className="flex-1 relative flex items-center justify-center">
          <img 
            key={currentPhoto.id}
            src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${currentPhoto.url_original}`} 
            className="max-h-full max-w-full object-contain shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-lg animate-in fade-in zoom-in duration-700"
          />
        </div>

        {/* Footer Info */}
        <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
          <div className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
            <h2 className="text-4xl font-bold text-white mb-2">{eventData?.name}</h2>
            <p className="text-xl text-gray-300">Souvenirs en direct • {photos.length} photos</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-2xl animate-in slide-in-from-right-8 duration-500">
             <p className="text-black font-bold text-2xl">TEUTCHAP.ME/{token?.toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

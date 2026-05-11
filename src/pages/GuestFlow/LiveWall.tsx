import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Sparkles } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { usePhotos } from '../../hooks/usePhotos'

export default function LiveWall() {
  const { token } = useParams()
  const [eventData, setEventData] = useState<any>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  
  const { photos } = usePhotos(eventData?.id, { autoModeration: true })

  useEffect(() => {
    fetchEvent()
  }, [token])

  useEffect(() => {
    if (photos.length > 0) {
      // Show newest photo immediately when added
      setCurrentIndex(0)
    }
  }, [photos.length]) // Only trigger when photo count changes (new photo added)

  useEffect(() => {
    if (photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % photos.length)
      }, 6000) // Rotate every 6 seconds
      return () => clearInterval(interval)
    }
  }, [photos, currentIndex]) // Reset interval when index changes manually/via new photo

  const fetchEvent = async () => {
    const { data: event } = await supabase.from('events').select('*').eq('token', token).single()
    if (event) setEventData(event)
  }

  if (!eventData) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-black uppercase tracking-[0.3em]">Chargement...</div>

  const eventUrl = `${window.location.origin}/e/${token}`

  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-[#08060d] flex flex-col items-center justify-center text-white p-12 text-center relative overflow-hidden">
        {/* Background Mesh */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-primary/20 blur-[200px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-accent/10 blur-[200px] rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col items-center space-y-12">
           <div className="inline-flex items-center space-x-3 bg-white/5 border border-white/10 px-6 py-3 rounded-full backdrop-blur-xl animate-float shadow-2xl">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]" />
              <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Mur Live Actif</span>
           </div>
           
           <h1 className="text-7xl font-black tracking-tighter text-gradient leading-none drop-shadow-2xl">{eventData.name}</h1>
           
           <div className="glass rounded-[3rem] p-12 border border-white/10 flex flex-col items-center shadow-2xl space-y-8 max-w-xl">
             <div className="bg-white p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
               <QRCodeSVG value={eventUrl} size={280} level="H" includeMargin={false} />
             </div>
             <div className="space-y-2">
                <p className="text-2xl font-black tracking-tight text-white">Scannez pour rejoindre</p>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Et partagez vos premières photos !</p>
             </div>
           </div>
        </div>
      </div>
    )
  }

  const currentPhoto = photos[currentIndex]

  return (
    <div className="min-h-screen bg-black overflow-hidden relative flex items-center justify-center">
      {/* Background Blur (Ambient Light) */}
      <div className="absolute inset-0 z-0 transition-opacity duration-1000">
        <img 
          key={`bg-${currentPhoto.id}`}
          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${currentPhoto.url_original}`} 
          className="w-full h-full object-cover blur-[120px] opacity-40 scale-125"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Main Image Container with Ken Burns effect */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <img 
          key={currentPhoto.id}
          src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${currentPhoto.url_original}`} 
          className="w-full h-full object-contain animate-ken-burns shadow-[0_0_150px_rgba(0,0,0,0.9)]"
        />
      </div>

      {/* Persistent Overlay Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-12">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start">
           <div className="glass-dark px-6 py-3 rounded-full flex items-center space-x-4 border-white/10 shadow-2xl">
              <div className="flex space-x-2">
                 <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.2em] text-white">Live</span>
           </div>

           {/* Event Branding */}
           <div className="glass-dark px-8 py-4 rounded-[2rem] border-white/10 shadow-2xl text-right flex flex-col items-end">
              <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">{eventData.name}</h2>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mt-1 drop-shadow-md">
                {photos.length} Souvenirs
              </p>
           </div>
        </div>

        {/* Bottom Bar: QR & Current Photo Meta */}
        <div className="flex justify-between items-end">
          
          {/* Photo Meta (Tags/Author if any) */}
          <div className="glass-dark p-6 rounded-[2rem] max-w-md border-white/10 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
             {currentPhoto.ai_tags && currentPhoto.ai_tags.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {currentPhoto.ai_tags.slice(0, 3).map((tag: string) => (
                   <span key={tag} className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-xl text-white shadow-lg">
                     #{tag}
                   </span>
                 ))}
               </div>
             ) : (
                <div className="flex items-center space-x-2 text-white/50">
                   <Sparkles size={16} />
                   <span className="text-xs font-bold uppercase tracking-widest">Souvenir instantané</span>
                </div>
             )}
          </div>

          {/* Persistent QR Code Call to Action */}
          <div className="glass-dark p-4 rounded-[2rem] border-white/10 shadow-2xl flex items-center space-x-6 backdrop-blur-3xl">
             <div className="text-right pl-4">
                <p className="text-sm font-black text-white uppercase tracking-widest leading-tight">Participez à<br/>l'album</p>
                <p className="text-[9px] font-bold text-primary uppercase tracking-[0.3em] mt-2">Scannez-moi</p>
             </div>
             <div className="bg-white p-3 rounded-2xl shadow-inner">
               <QRCodeSVG value={eventUrl} size={80} level="H" includeMargin={false} />
             </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes ken-burns {
          0% { transform: scale(1) translate(0, 0); opacity: 0; }
          5% { opacity: 1; }
          95% { opacity: 1; }
          100% { transform: scale(1.05) translate(-1%, -1%); opacity: 0; }
        }
        .animate-ken-burns {
          animation: ken-burns 6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { Sparkles, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { usePhotos } from '../../hooks/usePhotos'

export default function LiveWall() {
  const { token } = useParams()
  const [eventData, setEventData] = useState<any>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  
  const { photos } = usePhotos(eventData?.id, { autoModeration: true })

  useEffect(() => {
    fetchEvent()
  }, [token])

  useEffect(() => {
    if (photos.length > 0) {
      setCurrentIndex(0)
    }
  }, [photos.length])

  useEffect(() => {
    if (photos.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % photos.length)
      }, 6000)
      return () => clearInterval(interval)
    }
  }, [photos, currentIndex])

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

  const fetchEvent = async () => {
    const { data: event } = await supabase.from('events').select('*').eq('token', token).single()
    if (event) setEventData(event)
  }

  if (!eventData) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-black uppercase tracking-[0.3em]">Chargement...</div>

  const eventUrl = `${window.location.origin}/e/${token}`

  if (timeRemaining) {
    return (
      <div className="min-h-screen bg-[#08060d] flex flex-col items-center justify-center text-white p-12 text-center relative overflow-hidden select-none">
        {/* Intense Pulsating Ambiance Glows */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[10%] left-[10%] w-[60%] h-[60%] bg-primary/20 blur-[250px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[10%] w-[60%] h-[60%] bg-accent/15 blur-[250px] rounded-full" />
        </div>

        <div className="relative z-10 flex flex-col items-center max-w-5xl mx-auto space-y-12">
          <div className="inline-flex items-center space-x-3 bg-primary/10 border border-primary/30 px-8 py-3.5 rounded-full backdrop-blur-2xl shadow-[0_0_50px_rgba(170,59,255,0.3)] animate-bounce">
            <Clock className="text-primary animate-spin" size={20} />
            <span className="text-sm font-black uppercase tracking-[0.4em] text-white">Mode Reveal Activé</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-8xl lg:text-9xl font-black tracking-tighter text-gradient leading-none drop-shadow-2xl">
              {eventData.name}
            </h1>
            <p className="text-xl lg:text-2xl font-bold text-gray-400 uppercase tracking-[0.3em]">
              Collecte secrète en cours • Préparez-vous
            </p>
          </div>

          {/* Majestic Glow Digits Container */}
          <div className="my-12 relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary via-accent to-primary rounded-[4rem] blur-2xl opacity-40 group-hover:opacity-75 transition duration-1000 animate-tilt" />
            <div className="relative glass border-white/10 rounded-[3rem] px-24 py-16 shadow-2xl flex items-center justify-center">
              <span className="text-9xl lg:text-[14rem] font-black tracking-tighter text-white drop-shadow-[0_0_80px_rgba(255,255,255,0.4)] tabular-nums leading-none">
                {timeRemaining}
              </span>
            </div>
          </div>

          <p className="text-sm font-bold text-gray-500 uppercase tracking-[0.4em] max-w-md mx-auto">
            Toutes les captures des invités seront révélées simultanément sur cet écran géant à la fin du décompte.
          </p>
        </div>

        {/* Persistent Non-Intrusive Bottom Overlay for active room contributors */}
        <div className="absolute bottom-12 right-12 glass-dark p-6 rounded-[2.5rem] border-white/10 shadow-2xl flex items-center space-x-6 backdrop-blur-3xl z-20">
          <div className="text-right">
            <p className="text-xs font-black text-white uppercase tracking-widest leading-tight">Rejoindre<br/>l'album</p>
            <p className="text-[9px] text-primary font-bold uppercase tracking-widest mt-1">Scan express</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-xl">
            <QRCodeSVG value={eventUrl} size={80} level="H" includeMargin={false} />
          </div>
        </div>

        {/* Fullscreen Button */}
        <button 
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
          className="absolute top-12 right-12 glass-dark p-4 rounded-2xl border-white/10 text-white/50 hover:text-white transition-all z-20"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
             <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
      </div>
    )
  }

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
          src={currentPhoto.url_original?.startsWith('blob:') ? currentPhoto.url_original : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${currentPhoto.url_original}`} 
          className="w-full h-full object-cover blur-[120px] opacity-40 scale-125"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Main Image Container with Ken Burns effect */}
      <div className="absolute inset-0 z-10 flex items-center justify-center">
        <img 
          key={currentPhoto.id}
          src={currentPhoto.url_original?.startsWith('blob:') ? currentPhoto.url_original : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/events_photos/${currentPhoto.url_original}`} 
          className="w-full h-full object-contain animate-ken-burns shadow-[0_0_150px_rgba(0,0,0,0.9)]"
        />
      </div>

      {/* Persistent Overlay Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-12">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start">
           <div className="flex flex-col space-y-4">
             <div className="glass-dark px-6 py-3 rounded-full flex items-center space-x-4 border-white/10 shadow-2xl w-fit">
                <div className="flex space-x-2">
                   <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.2em] text-white">Live Wall</span>
             </div>
             
             {/* New Photo Badge */}
             {new Date().getTime() - new Date(currentPhoto.created_at).getTime() < 60000 && (
               <div className="bg-primary text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] animate-bounce shadow-lg shadow-primary/40 border border-white/20 w-fit">
                 Nouveau !
               </div>
             )}
           </div>

           <div className="flex items-start space-x-6">
              {/* Fullscreen Button */}
              <button 
                onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                  } else {
                    document.exitFullscreen();
                  }
                }}
                className="glass-dark p-4 rounded-2xl border-white/10 text-white/50 hover:text-white transition-all pointer-events-auto"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                   <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                </svg>
              </button>

              <div className="glass-dark px-8 py-4 rounded-[2rem] border-white/10 shadow-2xl text-right flex flex-col items-end">
                <h2 className="text-3xl font-black text-white tracking-tighter drop-shadow-lg">{eventData.name}</h2>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-primary mt-1 drop-shadow-md">
                  {photos.length} Souvenirs
                </p>
              </div>
           </div>
        </div>

        {/* Bottom Bar: QR & Current Photo Meta */}
        <div className="flex justify-between items-end">
          
          {/* Photo Meta (Tags/Author if any) */}
          <div className="glass-dark p-6 rounded-[2.5rem] max-w-md border-white/10 shadow-2xl animate-in slide-in-from-bottom-8 duration-700">
             {currentPhoto.uploader_name && (
               <div className="mb-3 text-xs font-black uppercase tracking-widest text-primary">
                 Par {currentPhoto.uploader_name}
               </div>
             )}
             {currentPhoto.ai_tags && currentPhoto.ai_tags.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {currentPhoto.ai_tags.slice(0, 3).map((tag: string) => (
                   <span key={tag} className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-4 py-2 rounded-xl text-white shadow-lg border border-white/10">
                     #{tag}
                   </span>
                 ))}
               </div>
             ) : (
                <div className="flex items-center space-x-2 text-white/50 px-2">
                   <Sparkles size={16} />
                   <span className="text-[10px] font-black uppercase tracking-widest">Moment capturé à {new Date(currentPhoto.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
             )}
          </div>

          {/* Persistent QR Code Call to Action */}
          <div className="glass-dark p-5 rounded-[2.5rem] border-white/10 shadow-2xl flex items-center space-x-8 backdrop-blur-3xl border-t border-l pointer-events-auto">
             <div className="text-right">
                <p className="text-sm font-black text-white uppercase tracking-widest leading-tight">Ajoutez votre<br/>photo</p>
                <div className="flex items-center justify-end space-x-2 mt-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" />
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">LIVE</p>
                </div>
             </div>
             <div className="bg-white p-4 rounded-[1.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
               <QRCodeSVG value={eventUrl} size={100} level="H" includeMargin={false} />
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

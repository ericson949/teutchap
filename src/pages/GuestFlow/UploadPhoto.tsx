import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, Image as ImageIcon, X, Check, Loader2, ArrowLeft, Zap, Upload } from 'lucide-react'
import localforage from 'localforage'
import { supabase } from '../../lib/supabase'

export default function UploadPhoto() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [compressedSize, setCompressedSize] = useState(0)
  const [eventData, setEventData] = useState<any>(null)
  const [challenges, setChallenges] = useState<any[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchEventInfo = async () => {
      const { data: event } = await supabase.from('events').select('*').eq('token', token).single()
      if (event) {
        setEventData(event)
        const { data: chalData } = await supabase.from('challenges').select('*').eq('event_id', event.id)
        if (chalData) setChallenges(chalData)
      }
    }
    fetchEventInfo()
  }, [token])

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        const MAX_WIDTH = 1920
        const MAX_HEIGHT = 1080

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width
            width = MAX_WIDTH
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height
            height = MAX_HEIGHT
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas context null'))
        
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Blob null'))
          },
          'image/jpeg',
          0.75
        )
      }
      img.onerror = reject
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      
      try {
        const compressedBlob = await compressImage(file)
        setCompressedSize(compressedBlob.size)
        setPhotoBlob(compressedBlob)
        setPhotoUrl(URL.createObjectURL(compressedBlob))
      } catch (err) {
        console.error('Compression error:', err)
        alert("Erreur lors de la préparation de l'image.")
      }
    }
  }

  const handleUpload = async () => {
    if (!photoBlob) return
    setIsUploading(true)

    try {
      const isOnline = navigator.onLine
      
      if (!isOnline) {
        const offlineQueue: any[] = await localforage.getItem('teutchap_offline_queue') || []
        offlineQueue.push({
          token,
          blob: photoBlob,
          timestamp: new Date().toISOString()
        })
        await localforage.setItem('teutchap_offline_queue', offlineQueue)
        
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const swRegistration = await navigator.serviceWorker.ready
          // @ts-ignore
          await swRegistration.sync.register('sync-photos')
        }

        alert('Réseau indisponible. Photo sauvegardée, elle sera envoyée dès que vous aurez du réseau.')
        navigate(`/e/${token}`)
        return
      }

      const fileName = `${token}_${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from('events_photos')
        .upload(fileName, photoBlob)

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase.from('photos').insert([
        {
          event_id: eventData.id,
          url_original: fileName,
          url_thumb: fileName,
          file_size_bytes: compressedSize,
          challenge_id: selectedChallenge,
          is_moderated: false // Will be updated by Edge Function
        }
      ])
      
      if (dbError) throw dbError

      // AI Analysis will be handled by Supabase Edge Function Webhook
      navigate(`/e/${token}`)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de l'envoi.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col selection:bg-primary/30">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <header className="glass-dark border-b border-white/5 px-6 py-5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-2xl">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-sm font-black uppercase tracking-[0.2em] text-gradient">Nouveau Souvenir</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 p-6 space-y-8 relative z-10 max-w-xl mx-auto w-full">
        {!photoUrl ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-10">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-black tracking-tighter">Partagez l'instant</h2>
              <p className="text-gray-500 text-sm font-medium tracking-wide">
                Votre photo sera ajoutée à l'album de <br/>
                <span className="text-primary font-bold">{eventData?.name}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="glass rounded-[2.5rem] p-16 flex flex-col items-center justify-center space-y-5 border-dashed border-white/10 hover:border-primary/40 transition-all group active:scale-95 shadow-2xl"
              >
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                  <Camera size={44} className="text-primary drop-shadow-lg" />
                </div>
                <div className="text-center">
                  <p className="font-black text-xl tracking-tight">Ouvrir la Caméra</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 font-bold">Zéro installation, pur web</p>
                </div>
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="glass border border-white/10 rounded-3xl py-6 flex items-center justify-center space-x-4 group hover:bg-white/5 transition-all"
              >
                <ImageIcon size={20} className="text-gray-500 group-hover:text-primary transition-colors" />
                <span className="font-black text-xs uppercase tracking-widest text-gray-400 group-hover:text-white">Choisir dans la galerie</span>
              </button>
            </div>

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="space-y-8 animate-in zoom-in-95 duration-300 pb-20">
            <div className="relative glass rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
              <img src={photoUrl} className="w-full aspect-[3/4] object-cover" />
              <button 
                onClick={() => { setPhotoBlob(null); setPhotoUrl(null); }}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-xl p-4 rounded-full text-white border border-white/10 hover:bg-black/80 transition-all"
              >
                <X size={24} />
              </button>
              <div className="absolute bottom-4 left-4 glass-dark px-3 py-1 rounded-lg text-[9px] font-black text-gray-400">
                {(compressedSize / 1024).toFixed(0)} KB • OPTIMISÉ
              </div>
            </div>

            {/* Challenges Section */}
            {challenges.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Zap size={14} className="text-primary fill-current" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Relever un défi ?</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {challenges.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => setSelectedChallenge(selectedChallenge === c.id ? null : c.id)}
                      className={`p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center transition-all border ${
                        selectedChallenge === c.id 
                          ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105' 
                          : 'glass border-white/5 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full bg-primary hover:bg-primary-dark active:scale-[0.97] transition-all text-white font-black py-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(170,59,255,0.4)] flex items-center justify-center space-x-4 border-t border-white/20 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  <span className="text-lg tracking-tight uppercase">Envoi...</span>
                </>
              ) : (
                <>
                  <Upload size={24} className="drop-shadow-lg" />
                  <span className="text-lg tracking-tight uppercase">Publier</span>
                </>
              )}
            </button>
          </div>
        )}
      </main>

      <div className="p-8 text-center opacity-20 pointer-events-none">
        <p className="text-[9px] font-black uppercase tracking-[0.4em]">Propulsé par Teutchap</p>
      </div>
    </div>
  )
}


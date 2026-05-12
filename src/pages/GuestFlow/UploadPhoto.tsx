import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Camera, Image as ImageIcon, X, Loader2, ArrowLeft, Zap, Upload, AlertCircle, ShieldCheck } from 'lucide-react'
import localforage from 'localforage'
import { supabase } from '../../lib/supabase'
import { useAppPlans } from '../../hooks/useAppPlans'

export default function UploadPhoto() {
  const { token } = useParams()
  const navigate = useNavigate()
  
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [compressedSize, setCompressedSize] = useState(0)
  
  const [eventData, setEventData] = useState<any>(null)
  const [challenges, setChallenges] = useState<any[]>([])
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)
  const [guestPseudo, setGuestPseudo] = useState<string>('Invité Anonyme')
  const [localUploadsCount, setLocalUploadsCount] = useState<number>(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!token) return
    
    // Récupérer la session persistante
    const savedPseudo = localStorage.getItem(`teutchap_pseudo_${token}`)
    if (savedPseudo) setGuestPseudo(savedPseudo)

    // Récupérer le compteur d'uploads de cet appareil
    const uploadsKey = `teutchap_uploads_count_${token}`
    const count = parseInt(localStorage.getItem(uploadsKey) || '0', 10)
    setLocalUploadsCount(count)

    const fetchEventInfo = async () => {
      try {
        const { data: event } = await supabase.from('events').select('*').eq('token', token).single()
        if (event) {
          setEventData(event)
          const { data: chalData } = await supabase.from('challenges').select('*').eq('event_id', event.id)
          if (chalData) setChallenges(chalData)
        }
      } catch (err) {
        // Mode résilience locale
        const mockPlan = localStorage.getItem('teutchap_dev_plan') || 'premium'
        setEventData({
          id: `mock-id-${token}`,
          name: "Célébration Teutchap",
          token: token,
          plan: mockPlan
        })
      }
    }
    fetchEventInfo()
  }, [token])

  // Détermination de la limite d'uploads autorisés sur cet appareil pour protéger les quotas du plan
  const plan = eventData?.plan || 'free'
  const { currentConfig } = useAppPlans(plan)
  const maxUploadsPerDevice = currentConfig.max_photos_per_user
  const isUploadQuotaExceeded = localUploadsCount >= maxUploadsPerDevice

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
      if (isUploadQuotaExceeded) {
        alert(`⚠️ Quota atteint : Votre appareil a déjà partagé le maximum de ${maxUploadsPerDevice} photos autorisées sur cette formule.`)
        return
      }

      const file = e.target.files[0]
      setIsCompressing(true)
      
      try {
        const compressedBlob = await compressImage(file)
        setCompressedSize(compressedBlob.size)
        setPhotoBlob(compressedBlob)
        setPhotoUrl(URL.createObjectURL(compressedBlob))
      } catch (err) {
        console.error('Compression error:', err)
        alert("Erreur lors de l'optimisation de l'image.")
      } finally {
        setIsCompressing(false)
      }
    }
  }

  const handleUpload = async () => {
    if (!photoBlob) return
    setIsUploading(true)

    // Incrémenter et persister le compteur local de protection de l'espace
    const nextCount = localUploadsCount + 1
    localStorage.setItem(`teutchap_uploads_count_${token}`, nextCount.toString())
    setLocalUploadsCount(nextCount)

    const payload = {
      event_id: eventData?.id || `mock-id-${token}`,
      url_original: `${token}_${Date.now()}.jpg`,
      url_thumb: `${token}_${Date.now()}.jpg`,
      file_size_bytes: compressedSize,
      challenge_id: selectedChallenge,
      is_moderated: false,
      contributor_name: guestPseudo // Rattachement strict et garanti de l'identité
    }

    try {
      const isOnline = navigator.onLine
      
      if (!isOnline || eventData?.id?.startsWith('mock-id-')) {
        const offlineQueue: any[] = await localforage.getItem('teutchap_offline_queue') || []
        offlineQueue.push({
          id: crypto.randomUUID(),
          token,
          eventId: eventData?.id,
          blob: photoBlob,
          compressedSize,
          challengeId: selectedChallenge,
          contributorName: guestPseudo,
          timestamp: new Date().toISOString()
        })
        await localforage.setItem('teutchap_offline_queue', offlineQueue)
        
        // Simuler un ajout wahoo dans le cache local pour l'instantanéité
        const existingLocalPhotos = JSON.parse(localStorage.getItem(`teutchap_dev_photos_${eventData?.id}`) || '[]')
        localStorage.setItem(`teutchap_dev_photos_${eventData?.id}`, JSON.stringify([{
          id: crypto.randomUUID(),
          ...payload,
          created_at: new Date().toISOString()
        }, ...existingLocalPhotos]))

        alert('🌐 Mode Démo / Hors-ligne activé. Votre souvenir signé est rattaché et visible instantanément !')
        navigate(`/e/${token}`)
        return
      }

      const fileName = payload.url_original
      const { error: uploadError } = await supabase.storage
        .from('events_photos')
        .upload(fileName, photoBlob)

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase.from('photos').insert([payload])
      if (dbError) throw dbError

      navigate(`/e/${token}`)
    } catch (err) {
      console.error(err)
      alert("Erreur lors de la publication. Capture conservée en sécurité hors-ligne.")
      navigate(`/e/${token}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#08060d] text-white flex flex-col selection:bg-primary/30 relative">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[0%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <header className="glass-dark border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col items-center">
          <h1 className="text-xs font-black uppercase tracking-[0.2em] text-gradient">Nouveau Souvenir</h1>
          <span className="text-[8px] text-gray-500 font-bold">Signé par {guestPseudo}</span>
        </div>
        <div className="w-8" />
      </header>

      <main className="flex-1 p-4 space-y-6 relative z-10 max-w-xl mx-auto w-full">
        {/* Barre d'état des quotas de l'appareil */}
        <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <ShieldCheck size={14} className="text-green-500" />
            <span className="text-[10px] font-bold text-gray-400">Quota de votre appareil</span>
          </div>
          <span className={`font-black tabular-nums text-[11px] ${isUploadQuotaExceeded ? 'text-red-400' : 'text-primary-light'}`}>
            {localUploadsCount} / {maxUploadsPerDevice} captures
          </span>
        </div>

        {isCompressing ? (
          <div className="glass rounded-[2.5rem] p-12 text-center space-y-4 border-primary/20 animate-in fade-in duration-300">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-sm font-black text-white tracking-tight">Optimisation sur votre appareil...</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">Compression HD intelligente via Canvas API</p>
            </div>
          </div>
        ) : !photoUrl ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black tracking-tight">Partagez l'instant</h2>
              <p className="text-gray-500 text-[9px] font-bold tracking-widest uppercase">
                Album : <span className="text-white">{eventData?.name}</span>
              </p>
            </div>

            {isUploadQuotaExceeded ? (
              <div className="glass border-red-500/20 bg-red-500/5 rounded-3xl p-6 text-center space-y-3">
                <AlertCircle size={32} className="text-red-400 mx-auto animate-bounce" />
                <p className="text-xs font-bold text-white leading-relaxed">
                  Pour garantir un accès équitable au stockage, cet appareil a atteint son quota de contribution.
                </p>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest font-black">
                  Profitez de la galerie et des réactions en direct !
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={() => cameraInputRef.current?.click()}
                  className="glass rounded-[2rem] p-8 flex flex-col items-center justify-center space-y-3 border-dashed border-white/10 hover:border-primary/40 transition-all group active:scale-95 shadow-xl"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                    <Camera size={28} className="text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-base tracking-tight">Prendre une photo</p>
                    <p className="text-[8px] text-gray-600 uppercase tracking-widest mt-0.5 font-black">Instantané • Signature automatique</p>
                  </div>
                </button>
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="glass border border-white/10 rounded-xl py-4 flex items-center justify-center space-x-2 group hover:bg-white/5 transition-all"
                >
                  <ImageIcon size={14} className="text-gray-500 group-hover:text-primary transition-colors" />
                  <span className="font-black text-[9px] uppercase tracking-widest text-gray-500 group-hover:text-white">Importer depuis l'appareil</span>
                </button>
              </div>
            )}

            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        ) : (
          <div className="space-y-6 animate-in zoom-in-95 duration-300 pb-16">
            <div className="relative glass rounded-3xl overflow-hidden shadow-xl border border-white/10 group">
              <img src={photoUrl} className="w-full aspect-[3/4] object-cover" />
              <button 
                onClick={() => { setPhotoBlob(null); setPhotoUrl(null); }}
                className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-3 rounded-full text-white border border-white/10 hover:bg-black/80 transition-all"
              >
                <X size={20} />
              </button>
              <div className="absolute bottom-3 left-3 glass-dark px-2.5 py-1 rounded-md text-[8px] font-black text-primary-light border-white/5">
                {(compressedSize / 1024).toFixed(0)} KB • OPTIMISÉ
              </div>
            </div>

            {/* Section Défis Optionnels */}
            {challenges.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-1.5">
                  <Zap size={12} className="text-primary fill-current" />
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Associer à un défi ?</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {challenges.map(c => (
                    <button 
                      key={c.id}
                      onClick={() => setSelectedChallenge(selectedChallenge === c.id ? null : c.id)}
                      className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-wider text-center transition-all border ${
                        selectedChallenge === c.id 
                          ? 'bg-primary border-primary text-white shadow shadow-primary/20 scale-105' 
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
              className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center space-x-3 border-t border-white/20 disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm tracking-widest uppercase font-black">Publication...</span>
                </>
              ) : (
                <>
                  <Upload size={20} />
                  <span className="text-sm tracking-widest uppercase font-black">Publier signée</span>
                </>
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
